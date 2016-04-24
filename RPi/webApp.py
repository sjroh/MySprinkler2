# -*- coding: utf-8 -*-
#!/usr/bin/python

##### library START
from flask import Flask
from flask import abort, redirect, url_for, render_template, jsonify, request
import threading
import subprocess
import uuid
import os
import sys

import pymongo
#import setup
##### library END


app = Flask(__name__)
background_scripts = {}
BACKGROUND = False

def run_script(id):
    subprocess.call(['python', './_setup.py'])
    print ("################# RUNNING START")
    background_scripts[id] = True
    print ("################# RUNNING DONE")

@app.route('/')
def index():
    
    conn = pymongo.MongoClient()
    db = conn.sprinkler
    collection = db.settings

    if collection.count() == 0:
        #se = setup
        #setup.main()
        #return 'STARTING SETUP'
        
        return render_template('./index.html')

        #return app.root_path
    else :
        return redirect('http://sjroh.github.io/MySprinkler2')

@app.route('/generate')
def generate():
    id = str(uuid.uuid4())
    global background_scripts
    background_scripts[id] = False
    print background_scripts
    print background_scripts[id]
    #background_scripts.append(False)
    threading.Thread(target=lambda: run_script(id)).start()
    return render_template('./processing.html', id=id)

@app.route('/is_done')
def is_done():
    id = request.args.get('id', None)
    if id not in background_scripts:
        abort(404)
    return jsonify(done=background_scripts[id])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
