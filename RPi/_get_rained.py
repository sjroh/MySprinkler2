# -*- coding: utf-8 -*-
#!/usr/bin/python

##########     imports BEGIN
import json
import datetime
import time
import urllib2
# import xmltodict
import simplejson

##########     imports END

def get(lat, lon):
    URL = 'http://api.openweathermap.org/data/2.5/weather?'
    APIKEY = 'd457caf53ef7d45c6959a7b1f0c1b175'
    APIKEY = 'APPID=' + APIKEY
    LAT = '&lat=' + str(lat)
    LON = '&lon=' + str(lon)
    URL += APIKEY + LAT + LON
    URL += '&units=imperial' # imperial will return Fahrenheit
    #URL += '&mode=xml' # getting as xml type because we need precipitation
    #print (URL)
    response = urllib2.urlopen(URL)
    data = json.load(response)
    # need to check rain, don't need to check snow
    #data['rain'] = {'3h':100}
    #data['rain']['3h'] = 100
    if 'rain' in data:
        # check existance of key(rain)
        print ("[SSS][GET_RAINED] Rained", str(data['rain']['3h']))
        return float(data['rain']['3h'])
    else :
        print ("[SSS][GET_RAINED] No rain in last 3 hours")
        return 0
