# -*- coding: utf-8 -*-
#!/usr/bin/python

##########     imports BEGIN
import json
import datetime
import time
import pymongo
import urllib2
import xmltodict
import simplejson


##########     imports END

#URL = 'http://api.openweathermap.org/data/2.5/forecast/daily?'
#url = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat=30.616559&lon=-96.31197429999999&cnt=7&APPID=d457caf53ef7d45c6959a7b1f0c1b175'


try:
    conn = pymongo.MongoClient()
    print ('[MySprinkler2] Connected to MongoDB')
    db = conn.sprinkler
    collection = db.settings.find()
    collection_forecasts = db.forecasts

    if collection.count() != 0:
        # when the setup is done
        settings = collection[0]
        URL = 'http://api.openweathermap.org/data/2.5/forecast/daily?'
        APIKEY = 'd457caf53ef7d45c6959a7b1f0c1b175'
        APIKEY = 'APPID=' + APIKEY
        LAT = '&lat=' + str(settings['location']['lat'])
        LON = '&lon=' + str(settings['location']['long'])
        URL += APIKEY + LAT + LON
        URL += '&units=imperial' # imperial will return Fahrenheit
        URL += '&mode=xml' # getting as xml type because we need precipitation
        #print (URL)
        response = urllib2.urlopen(URL)
        data = xmltodict.parse(response)
        #forecasts = data['weatherdata']['forecast']['time']
        jsondata = simplejson.dumps(data['weatherdata']['forecast']['time'], indent=4, skipkeys=True, sort_keys=True)
        jsondata = jsondata.replace('@', '')
        #print jsondata
        forecasts = json.loads(jsondata)
        #print forecasts

        print len(forecasts)
        for f in forecasts:
            day = f['day'].split('-')
            #f['day_sec'] = datetime.datetime(days[0], days[1], days[2], 0, 0).total_seconds()
            dt = datetime.datetime(int(day[0]), int(day[1]), int(day[2]), 0, 0)
            f['day_sec'] = time.mktime(dt.timetuple())
            jdata = json.dumps(f, default=lambda x:x.__dict__)
            #print simplejson.dumps(jdata, indent=4, skipkeys=True, sort_keys=True)
            value = json.loads(jdata)
            result = collection_forecasts.update({'day':f['day']}, {"$set": value}, upsert=True)
    
except pymongo.errors.ConnectionFailure, e:
    print ('[MySprinkler2] MongoDB Connection Failure')





