# -*- coding: utf-8 -*-
#!/usr/bin/python

##########     imports BEGIN
from __future__ import print_function

import sys
sys.path.insert(1, '/Library/Python/2.7/site-packages')

import httplib2
import os

from apiclient import discovery
import oauth2client
from oauth2client import client
from oauth2client import tools

import datetime

import time
# import MySQLdb
import pymongo
import urllib2

import driveSettings
import driveEvents
import calendarEvents

import time
##########     imports END


try:
    import argparse
    flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()
except ImportError:
    flags = None

SCOPES = 'https://www.googleapis.com/auth/calendar'
CLIENT_SECRET_FILE = 'client_secret.json'
#APPLICATION_NAME = 'Adaptable Sprinkler System'
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

def connectMongo():
    print ('[MySprinkler2] Connecting MongoDB')
    try:
        conn = pymongo.MongoClient()
        print ('[MySprinkler2] Connected to MongoDB')
        return True
    except pymongo.errors.ConnectionFailure, e:
        print ('[MySprinkler2] MongoDB Connection Failure')
        return False

def main():
    if connectMongo:
        conn = pymongo.MongoClient()
        db = conn.sprinkler
        # print conn.database_names()

        collection = db.userinfo
        # print db.collection_names()

        print ('[MySprinkler2] Get credentials')
        credentials = get_credentials()
        http = credentials.authorize(httplib2.Http())
        service = discovery.build('calendar', 'v3', http=http)

        calendar_exist = False
        calendar_id = None
        page_token = None
        timezone = None
        calendar_list = service.calendarList().list(pageToken=page_token).execute()
        for calendar_list_entry in calendar_list['items']:
            if calendar_list_entry['summary'] == APPLICATION_NAME:
                calendar_exist = True
                calendar_id = calendar_list_entry['id']
                print ("CALENDAR EXIST")
        if calendar_exist == False:
            print('[MySprinkler2] Make a calendar')
            calendar = {
                'summary': APPLICATION_NAME,
                'description': 'MySprinkler2 Watering Schedule Calendar. Please do NOT delete this calendar.'
            }
            created_calendar = service.calendars().insert(body=calendar).execute()
            calendar_id = created_calendar.get('id');
            timezone = created_calendar.get('timeZone')

        

        # update userinfo 
        doc = {"calendar_id":calendar_id, "timezone":timezone}
        collection.remove()
        collection.insert(doc)

        ds = driveSettings
        ds.init()
        ds.update_calendar_id(calendar_id, timezone)
        #ds.update_settings_mongo()
        #ds.update_rainedAmt(1)
        #ds.update_wateredAmt(2)

        # creating events.txt
        de = driveEvents
        de.init()
        de.add_event('event_id', int(round(time.time()))-100, 456, [1,2], 'type')
        de.update_past_events()

        ce = calendarEvents
        event_id = ce.add_event(1, 1, [1], 1)
        ce.remove_event(event_id)
    else:
        print ('[MySprinkler2] Check MongoDB')



if __name__ == '__main__':
    main()
