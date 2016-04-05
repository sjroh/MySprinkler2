from __future__ import print_function
import httplib2
import os
import io
import simplejson

from apiclient import discovery
from apiclient.errors import HttpError
from apiclient.http import MediaFileUpload
from apiclient.http import MediaIoBaseDownload
from json import dumps as json_dumps
import json
from pprint import pprint

import oauth2client
from oauth2client import client
from oauth2client import tools

import datetime
import time
import pymongo

try:
    import argparse
    flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()
except ImportError:
    flags = None

SCOPES = 'https://www.googleapis.com/auth/drive'
CLIENT_SECRET_FILE = './client_secret.json'
APPLICATION_NAME = 'MySprinkler2'
# empty JSON Object
EVENTS = None
EVENTS_ID = None
# init check
INITIATED = False
# empty credentials
events_name = 'events.txt'
drive_service = None


def get_credentials():
    home_dir = os.path.expanduser('~')
    credential_dir = os.path.join(home_dir, '.credentials')
    if not os.path.exists(credential_dir):
        os.makedirs(credential_dir)
    credential_path = os.path.join(credential_dir,
                                   'drive-python-quickstart.json')

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

def get_events():
    global EVENTS
    global EVENTS_ID
    global drive_service
    # this function will get EVENTS from google drive
    credentials = get_credentials()
    http = credentials.authorize(httplib2.Http())
    drive_service = discovery.build('drive', 'v3', http=http)

    page_token = None
    file_name = "events.txt"
    response = drive_service.files().list(q="name='"+file_name+"'",
                                         spaces='drive',
                                         fields='nextPageToken, files(id, name)',
                                         pageToken=page_token).execute()
    files = response.get('files', [])

    print ('size of ',len(files))

    if (len(files) == 0):
        print("EVENTS file is NOT exist, creating one")
        EVENTS = {
            'prev' : [],
            'current' : []
        }
        print ('length of events.prev is ', len(EVENTS['prev']))

        update_events_drive()
        jsondata = simplejson.dumps(EVENTS, indent=4, skipkeys=True, sort_keys=True)
        fd = open(file_name, 'w')
        fd.write(jsondata)
        fd.close()
        body = {
            'name' : file_name,
            'title' : 'events.txt',
            'description' : 'events file for SSS'
        }
        media_body = MediaFileUpload(file_name, resumable=True)
        file = drive_service.files().create(body=body, media_body=media_body).execute()
        EVENTS_ID = file.get('id')
        print ('File ID: %s' % file.get('id'))
        print ("google drive update complete")
        return EVENTS
    else :
        EVENTS_ID = files[0].get('id')
        print("EVENTS file is exist\nDownloading EVENTS file")
        print("EVENTS_id:",EVENTS_ID)
        request = drive_service.files().get_media(fileId=EVENTS_ID)
        # fh = io.BytesIO()
        fh = io.FileIO(file_name, mode='wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
            print ("Download %d%%." % int(status.progress() * 100))

        with open(file_name) as data_file:
            data = json.load(data_file)
        # data is setting
        return data
    ### end of get_EVENTS():

def init():
    global EVENTS
    EVENTS = get_events()
    global INITIATED
    INITIATED = True

def update_events_mongo():
    # this function will get settings and update to MongoDB
    #if INITIATED == False: #run init
    #    init()
    print ("Updating events on MongoDB")
    conn = pymongo.MongoClient()
    db = conn.sprinkler
    collection = db.events

    jsondata = json.dumps(EVENTS['current'], default=lambda x:x.__dict__)
    current_events = json.loads(jsondata)

    for c in current_events:
        jdata = json.dumps(c, default=lambda x:x.__dict__)
        value = json.loads(jdata)
        result = collection.update({'id':c['id']}, {"$set": value}, upsert=True)

    print ("Updating settings on MongoDB done")

def update_events_drive():
    ### recreate settings file
    jsondata = simplejson.dumps(EVENTS, indent=4, skipkeys=True, sort_keys=True)
    fd = open(events_name, 'w')
    fd.write(jsondata)
    fd.close()

    file_metadata = {
        'fileId' : EVENTS_ID,
        'name' : events_name
    }
    media = MediaFileUpload(events_name,
                    resumable=True)
    file = drive_service.files().update(fileId=EVENTS_ID, body=file_metadata, media_body=media).execute()
    print ('File ID: %s' % file.get('id'))
    print ("google drive update complete")


def update_past_events():
    global EVENTS
    current_sec = int(round(time.time()))
    del_list = []
    for i in range(0, len(EVENTS['current'])):
        if int(EVENTS['current'][i]['eTime']) < current_sec:
            del_list.append(i)
            EVENTS['prev'].append(EVENTS['current'][i])
    del_list.reverse()
    for i in del_list:
        del EVENTS['current'][i]
    update_events_drive()

# need one more function to move events to list of past
# when water level hit max

def add_event(event_id, sTime, eTime, zones, event_type):
    global EVENTS
    # add event
    event = {
        'id' : event_id,
        'sTime' : sTime,
        'eTime' : eTime,
        'zones' : zones,
        'type' : event_type
    }
    EVENTS['current'].append(event)

    update_events_mongo()
    update_events_drive()


def remove_event(event_id):
    global EVENTS
    del_list = []
    for i in range(0, len(EVENTS['current']) ):
        if EVENTS['current'][i]['id'] == event_id:
            del_list.append(i)
    del_list.reverse()
    for i in del_list:
        del EVENTS['current'][i]

    update_events_mongo()
    update_events_drive()
