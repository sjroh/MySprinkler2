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

try:
    import argparse
    flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()
except ImportError:
    flags = None

SCOPES = 'https://www.googleapis.com/auth/drive'
CLIENT_SECRET_FILE = './client_secret.json'
APPLICATION_NAME = 'MySprinkler2'
# empty JSON Object
SETTINGS = None
SETTINGS_ID = None
settings_name = 'settings.txt'
# init check
INITIATED = False
# empty credentials
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

def get_settings():
    # this function will get settings from google drive
    credentials = get_credentials()
    http = credentials.authorize(httplib2.Http())
    global drive_service 
    drive_service = discovery.build('drive', 'v3', http=http)

    page_token = None
    settings_name = "settings.txt"
    response = drive_service.files().list(q="name='"+settings_name+"'",
                                         spaces='drive',
                                         fields='nextPageToken, files(id, name)',
                                         pageToken=page_token).execute()
    files = response.get('files', [])

    print ('size of ',len(files))

    if (len(files) == 0):
        print("settings file is NOT exist")
        return False
    else :
        global SETTINGS_ID
        SETTINGS_ID = files[0].get('id')
        print("settings file is exist\nDownloading settings file")
        print("settings_id:",SETTINGS_ID)
        request = drive_service.files().get_media(fileId=SETTINGS_ID)
        # fh = io.BytesIO()
        fh = io.FileIO(settings_name, mode='wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
            print ("Download %d%%." % int(status.progress() * 100))

        # data = []
        # with open(settings_name,'rU','utf-8') as f:
        #     data.append(json.loads(line))

        # open json file as a json object
        with open(settings_name) as data_file:
            data = json.load(data_file)
        # data is setting
        return data
    ### end of get_settings():

def init():
    global SETTINGS
    SETTINGS = get_settings()
    #update_settings_mongo()
    global INITIATED
    INITIATED = True
    if (INITIATED == True):
        print ("ALL DONE")

def update_settings_mongo():
    # this function will get settings and update to MongoDB
    #if INITIATED == False: #run init
    #    init()
    print ("Updating settings on MongoDB")
    print ("SETTINGS: ", SETTINGS)
    conn = pymongo.MongoClient()
    db = conn.sprinkler
    collection = db.settings

    result = collection.find({'calId':SETTINGS['calId']})
    print(result)

    jsondata = json.dumps(SETTINGS, default=lambda x:x.__dict__)
    value = json.loads(jsondata)

    if result.count() == 0:
        print("NO PREVIOUS SETTINGS")
        result = collection.insert(value)
    else :
        print("PREVIOUS SETTINGS EXISTS")
        result = collection.update({'calId':SETTINGS['calId']}, {"$set": value}, upsert=False)
    print(result)
    #    collection.remove()
    #    print("remove all")
    #print ("inserting")
    #jsondata = json.dumps(SETTINGS, default=json_util.default)
    
    
    #collection.insert(value)
    #result = collection.update({'calId':SETTINGS['calId']}, {"$set": value}, upsert=False)
    #print (result)
    #print (jsondata)
    
    print ("Updating settings on MongoDB done")

def update_rainedAmt(rainedAmt):#QUESTION: we're going to round right? i guess youll insert it rounded?
    if INITIATED == False: #run init
        init()
    global SETTINGS
    SETTINGS['watered']['rainedAmt'] += float(rainedAmt)
    update_settings_drive()
    update_settings_mongo()

def update_wateredAmt(wateredAmt):
    if INITIATED == False: #run init
        init()
    global SETTINGS
    SETTINGS['watered']['wateredAmt'] += float(wateredAmt)
    update_settings_drive()
    update_settings_mongo()

def update_calendar_id(calendar_id, timezone):
    if INITIATED == False: #run init
        init()

    calLink = '<iframe src="https://calendar.google.com/calendar/embed?src='+calendar_id+'&ctz=America/Chicago" style="border: 0" width="800" height="600" frameborder="0" scrolling="no"></iframe>'

    SETTINGS['calLink'] = calLink
    SETTINGS['calId'] = calendar_id
    SETTINGS['timezone'] = timezone

    update_settings_drive()
    update_settings_mongo()


def get_calendar_id():
    if INITIATED == False: #run init
        init()
    return SETTINGS['calId']


def update_settings_drive():
    ### recreate settings file
    jsondata = simplejson.dumps(SETTINGS, indent=4, skipkeys=True, sort_keys=True)
    fd = open(settings_name, 'w')
    fd.write(jsondata)
    fd.close()

    file_metadata = {
        'fileId' : SETTINGS_ID,
        'name' : settings_name
    }
    media = MediaFileUpload(settings_name,
                    resumable=True)
    file = drive_service.files().update(fileId=SETTINGS_ID, body=file_metadata, media_body=media).execute()
    print ('File ID: %s' % file.get('id'))
    print ("google drive update complete")



