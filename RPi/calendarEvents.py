# -*- coding: utf-8 -*-
#!/usr/bin/python

##########     imports BEGIN
from __future__ import print_function
import httplib2
import os
import io
import simplejson

from apiclient import discovery
from apiclient.errors import HttpError
from apiclient.http import MediaFileUpload
from apiclient.http import MediaIoBaseDownload
import json
from json import dumps as json_dumps
#from bson import json_util
from bson import Binary, Code
from bson.json_util import dumps
from pprint import pprint

import oauth2client
from oauth2client import client
from oauth2client import tools

import datetime
import time
import pymongo
import urllib2

##########     imports END

try:
    import argparse
    flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()
except ImportError:
    flags = None

SCOPES = 'https://www.googleapis.com/auth/calendar'
CLIENT_SECRET_FILE = './client_secret.json'
APPLICATION_NAME = 'MySprinkler2'

def get_credentials():
    home_dir = os.path.expanduser('~')
    credential_dir = os.path.join(home_dir, '.credentials')
    if not os.path.exists(credential_dir):
        os.makedirs(credential_dir)
    credential_path = os.path.join(credential_dir,
                                   'calendar-python-quickstart.json')

    store = oauth2client.file.Storage(credential_path)
    credentials = store.get()

    if not credentials or credentials.invalid:
        flow = client.flow_from_clientsecrets(CLIENT_SECRET_FILE, SCOPES)
        flow.user_agent = APPLICATION_NAME
        if flags:
            credentials = tools.run_flow(flow, store, flags)
        else: # Needed only for compatibility with Python 2.6
            credentials = tools.run(flow, store)
        print('Storing credentials to ' + credential_path)
    return credentials

def add_event(sTime, eTime, zones, event_type):
    # test
    #sTime = 1459620000
    #eTime = 1459625000

    conn = pymongo.MongoClient()
    db = conn.sprinkler
    collection = db.settings.find()

    if (collection.count() == 0):
        return False

    settings = collection[0]
       
    credentials = get_credentials()
    http = credentials.authorize(httplib2.Http())
    service = discovery.build('calendar', 'v3', http=http)

    URL = 'https://maps.googleapis.com/maps/api/timezone/json?location='
    URL += str(settings['location']['lat']) + ',' + str(settings['location']['long'])
    URL += '&timestamp=' + str(sTime)
    URL += '&key=AIzaSyBHWMnDG84Vk9BKEc7595qTKj51-b9Egh0'

    print (URL, '\n\n\n')
    
    response = urllib2.urlopen(URL)
    print (response)
    jsondata = json.load(response)
    timeDiff = jsondata['rawOffset']

    if jsondata['rawOffset'] < 0:
        timeDiff = timeDiff * -1

    timeDiff = time.strftime('%H:%M', time.gmtime(timeDiff))

    if jsondata['rawOffset'] < 0:
        timeDiff = '-' + timeDiff
    else:
        timeDiff = '+' + timeDiff

    start = time.strftime('%Y-%m-%dT', time.gmtime(sTime))
    end = time.strftime('%Y-%m-%dT', time.gmtime(eTime))

    start += str(settings['wateringHr']) + ':00:00' + str(timeDiff)
    end += str(settings['wateringHr']+1) + ':00:00' + str(timeDiff)

    print ('\n\n')
    print (start)
    print (end)
    print ('\n\n')
    
    watering = {
        'summary' : 'Watering plan',
        'start' : {
            'dateTime' : start,
            'timeZone' : settings['timezone']
        },
        'end' : {
            'dateTime' : end,
            'timeZone' : settings['timezone']
        }
    }

    result = service.events().insert(calendarId=settings['calId'], body=watering).execute()
    print ("EVENT ID : ", result['id'])
    return result['id']

def remove_event(event_id):
    conn = pymongo.MongoClient()
    db = conn.sprinkler
    collection = db.settings.find()

    if (collection.count() == 0):
        return False

    settings = collection[0]
       
    credentials = get_credentials()
    http = credentials.authorize(httplib2.Http())
    service = discovery.build('calendar', 'v3', http=http)
    result = service.events().delete(calendarId=settings['calId'], eventId=str(event_id)).execute()
    return result
    
