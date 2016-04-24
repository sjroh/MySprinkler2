# -*- coding: utf-8 -*-
#!/usr/bin/python

##########     imports START
import makeSchedule
import _get_weathers
import _get_rained
import _drive

import pymongo
import datetime
import time
import urllib2
import json
from json import dumps as json_dumps
##########     imports FINISH

conn = pymongo.MongoClient()
db = conn.sprinkler
collection = db.settings.find()

if collection.count() != 0:
    d = _drive
    d.main()

    print ("[SSS][CRON_DAILY] Settings exists")
    settings = collection[0]
    
    startdate = str(datetime.datetime.now())[0:10]
    weekday = datetime.datetime.now().weekday()
    if (weekday == settings['weekStart']):
        d.reset_rained()
        d.reset_waterd()

    total_watered = d.get_rained() + d.get_watered()

    if total_watered < d.get_max():
        URL = 'https://maps.googleapis.com/maps/api/timezone/json?location='
        URL += str(settings['location']['lat']) + ',' + str(settings['location']['long'])
        URL += '&timestamp=' + str(int(time.time()))
        URL += '&key=AIzaSyBHWMnDG84Vk9BKEc7595qTKj51-b9Egh0'

        #print (URL, '\n\n\n')
        
        response = urllib2.urlopen(URL)
        #print (response)
        jsondata = json.load(response)
        timeDiff = jsondata['rawOffset'] + jsondata['dstOffset']
        
        gw = _get_weathers
        print ("[SSS][CRON_DAILY] Generate schedule")
        # backup old weathers

        daydiff = 7 - weekday
        enddate = str(datetime.datetime.now() + datetime.timedelta(days=daydiff))[0:10]
        yesterday = str(datetime.datetime.now() + datetime.timedelta(days=-1))[0:10]
        tomorrow = str(datetime.datetime.now() + datetime.timedelta(days=1))[0:10]

        print ("[SSS][CRON_DAILY] enddate : " + enddate)

        last_precipitations = gw.getPrecipitations(startdate, enddate)
        #last_precipitations = last_precipitations[1:]
        #last_precipitations = gw.getPrecipitations(yesterday, enddate)
        print ("[SSS][CRON_DAILY] backup last forecasts")
        print ('[SSS][CRON_DAILY] '+str(last_precipitations))

        # then update weathers
        gw.update()
        print ("[SSS][CRON_DAILY] update forecasts")

        # get new weathers
        curr_precipitations = gw.getPrecipitations(startdate, enddate)
        #curr_precipitations = gw.getPrecipitations(tomorrow, enddate)
        print ("[SSS][CRON_DAILY] backup new forecasts")
        print ('[SSS][CRON_DAILY] '+str(curr_precipitations))

        # remove old schedules
        d.remove_events_bydate(enddate)
        print ("[SSS][CRON_DAILY] remove old events")

        # make schedule
        ms = makeSchedule
        week_day = int(datetime.datetime.now().weekday())

        amtRainedPrevDay = d.get_rained() # for test, put 0
        new_week = (week_day == settings['weekStart'])
        print ("[SSS][CRON_DAILY] New_WEEK = "+ str(new_week))
        events_list = ms.make_schedule(settings, last_precipitations, curr_precipitations, amtRainedPrevDay, True)
        print ("[SSS][CRON_DAILY] "+str(events_list))
        print ("[SSS][CRON_DAILY] make new events")

        zones = settings['zones']
        
        # start from today, because this file will run every 00:30
        year = datetime.datetime.now().year
        month = datetime.datetime.now().month
        day = datetime.datetime.now().day
        hour = datetime.datetime.now().hour
        planned = datetime.datetime(year, month, day, settings['wateringHr']) # 4th = watering time from settings
        initial = datetime.datetime(1970,1,1)
        sTime =  (planned-initial).total_seconds()
        add_day = 0
        sTime -= timeDiff
        if (events_list != None):
            print ("[SSS][CRON_DAILY] events_list is not None " + str(len(events_list)))
            for event in events_list:
                sTime += add_day * 86400
                if event > 0:
                    new_sTime = sTime
                    n = int(event / 15) # 15 min = 900 sec
                    for z in range(1, int(zones)+1):
                        d.add_event(new_sTime, new_sTime + 900, [z])
                        new_sTime += 900
                add_day += 1
            print ("[SSS][CRON_DAILY] MAKE SCHEDULE DONE")
        #d.upload_events_drive()
    else:
        print ("[SSS][CRON_DAILY] Do NOT need to generate schedule")

else :
    print ("[SSS][CRON_DAILY] Settings NOT exists")
