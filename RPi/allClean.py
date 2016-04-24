# -*- coding: utf-8 -*-
#!/usr/bin/python

import pymongo
import os
from subprocess import call

conn = pymongo.MongoClient()
print ("Mongo DB : ", conn.drop_database('sprinkler'))

#home_dir = os.path.expanduser('~')
#credential_dir = os.panth.join(home_dir, '.credentials')

#os.system("sudo rm /home/pi/.credentials/*.json")
#print ("credentials cleaned")
