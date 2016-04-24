# -*- coding: utf-8 -*-
#!/usr/bin/python

########## imports START
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
from pprint import pprint

import oauth2client
from oauth2client import client
from oauth2client import tools

import datetime
import time
import urllib2
########## imports FINISH

########## global variables START
SCOPES = 'https://www.googleapis.com/auth/calendar'
CLIENT_SECRET_FILE = './client_secret.json'
APPLICATION_NAME = 'SSS'
CALENDAR_SERVICE = None
########## global variables FINISH

############################################################
##### get credentials START
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
##### get credentials FINISH

############################################################
##### get calendar service START
def get_calendar_service():
    global CALENDAR_SERVICE

    credentials = get_credentials()
    http = credentials.authorize(httplib2.Http())
    CALENDAR_SERVICE = discovery.build('calendar', 'v3', http=http)
##### get calendar service FINISH

############################################################
##### create calendar START
def create_calendar():
    page_token = None
    calendar_id = None
    timezone = None
    calendar_exist = False

    calendar_list = CALENDAR_SERVICE.calendarList().list(pageToken=page_token).execute()
    
    for calendar_list_entry in calendar_list['items']:
        if calendar_list_entry['summary'] == APPLICATION_NAME:
            #print(calendar_list_entry)
            calendar_exist = True
            calendar_id = calendar_list_entry['id']
            timezone = calendar_list_entry['timeZone']
            print ("[SSS][CALENDAR][CREATE_CALENDAR] CALENDAR EXIST")

    if calendar_exist == False:
        print('[SSS][CALENDAR][CREATE_CALENDAR] Make a calendar')
        calendar = {
            'summary': APPLICATION_NAME,
            'description': 'SSS Watering Schedule Calendar. Please do NOT delete this calendar.'
        }
        created_calendar = CALENDAR_SERVICE.calendars().insert(body=calendar).execute()
        calendar_id = created_calendar.get('id');
        timezone = created_calendar.get('timeZone')
    print ("[SSS][CALENDAR][CREATE_CALENDAR] Calendar ID: ", calendar_id)
    print ("[SSS][CALENDAR][CREATE_CALENDAR] Calendar timezone: ", timezone)
    if timezone == None:
        timezone = 'UTC'
    return calendar_id, timezone
##### create calendar FINISH

############################################################
##### add event START
def add_event(calId, sTime, eTime, zone, location):
    # webApp is using GMT, so this program follows that rule
    # when this Raspberry Pi check schedules,
    # this need to check time difference.

    start_time = time.gmtime(sTime)
    end_time = time.gmtime(eTime)

    watering = {
        'summary' : 'Watering Event (Auto)',
        'start' : {
            'dateTime' : time.strftime('%Y-%m-%dT%H:%M:%S-00:00:00', start_time)
        },
        'end' : {
            'dateTime' : time.strftime('%Y-%m-%dT%H:%M:%S-00:00:00', end_time)
        },
        'description' : 'Zones: ' + str(zone),
        'location' : str(location)
    }
    result = CALENDAR_SERVICE.events().insert(calendarId=calId, body=watering).execute()
    print ("[SSS][CALENDAR][ADD_EVENT] EVENT ID : ", result['id'])
    return result['id']
##### add event FINISH

############################################################
##### remove event START
def remove_event(calId, event_id):
    result = CALENDAR_SERVICE.events().delete(calendarId=calId, eventId=str(event_id)).execute()
    print ("[SSS][CALENDAR][ADD_EVENT] Deleting EVENT ID : ", event_id)
    return result
##### remove event FINISH

##### main function
def main():
    print ("[SSS][CALENDAR] Starting MAIN function")
    print ("[SSS][CALENDAR] Getting google calendar service")
    get_credentials()
    get_calendar_service()
    print ("[SSS][CALENDAR] Closing MAIN function")

##### always run below.
if __name__ == "__main__":
    main()
