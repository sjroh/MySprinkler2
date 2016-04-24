# -*- coding: utf-8 -*-
#!/usr/bin/python

##########     imports START
import _get_weathers
import _get_rained
import _drive

import pymongo
##########     imports FINISH

conn = pymongo.MongoClient()
db = conn.sprinkler
collection = db.settings.find()

if collection.count() != 0:
    print ("[SSS][CRON_3HR] Settings exists")
    d = _drive
    d.main()

    gw = _get_weathers
    gw.update()

    gr = _get_rained
    rained = gr.get(d.get_lat(), d.get_long())
    d.add_rained(rained)
    d.upload_settings_drive()
    d.update_settings_mongo()

else :
    print ("[SSS][CRON_3HR] Settings NOT exists")
