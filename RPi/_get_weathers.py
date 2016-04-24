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

def update():
    try:
        conn = pymongo.MongoClient()
        print ('[SSS][GET_WEATHERS] START')
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
            jsondata = jsondata.replace('null', '0')
            #print jsondata
            forecasts = json.loads(jsondata)
            #print forecasts

            print ("[SSS][GET_WEATHERS] size of forecasts : " + str(len(forecasts)))
            for f in forecasts:
                day = f['day'].split('-')
                #f['day_sec'] = datetime.datetime(days[0], days[1], days[2], 0, 0).total_seconds()
                dt = datetime.datetime(int(day[0]), int(day[1]), int(day[2]), 0, 0)
                f['day_sec'] = time.mktime(dt.timetuple())
                jdata = json.dumps(f, default=lambda x:x.__dict__)
                #print simplejson.dumps(jdata, indent=4, skipkeys=True, sort_keys=True)
                value = json.loads(jdata)
                #print (f)
                result = collection_forecasts.update({'day':f['day']}, {"$set": value}, upsert=True)
        
    except pymongo.errors.ConnectionFailure, e:
        print ('[SSS][GET_WEATHERS] DB connection error')


def getPrecipitations(date1, date2):
    result = []
    
    try:
        conn = pymongo.MongoClient()
        print ('[SSS][GET_WEATHERS][GET_PRECIP] Connected to MongoDB')
        db = conn.sprinkler
        collection = db.forecasts
        
        query = {'$and': [
                                    {'day':{'$gte':date1}},
                                    {'day':{'$lte':date2}}
                                   ]
        }
        forecasts = collection.find(query)

        for f in forecasts:
            if f['precipitation'] == 0:
                result.append(0)
            else :
                if 'type' in f['precipitation']:
                    if f['precipitation']['type'] == 'rain':
                        result.append(float(f['precipitation']['value']))
                    else:
                        result.append(0)
                else :
                    result.append(0)
    except pymongo.errors.ConnectionFailure, e:
        print ('[SSS][GET_WEATHERS][GET_PRECIP] MongoDB Connection Failure')
        
    return result


def getHumidities(date1, date2):
    result = []
    
    try:
        conn = pymongo.MongoClient()
        print ('[SSS][GET_WEATHERS][GET_HUMIDITY] Connected to MongoDB')
        db = conn.sprinkler
        collection = db.forecasts
        
        query = {'$and': [
                                    {'day':{'$gte':date1}},
                                    {'day':{'$lte':date2}}
                                   ]
        }
        forecasts = collection.find(query)

        for f in forecasts:
            result.append(float(f['humidity']['value']))
    except pymongo.errors.ConnectionFailure, e:
        print ('[SSS][GET_WEATHERS][GET_HUMIDITY] MongoDB Connection Failure')
        
    return result

