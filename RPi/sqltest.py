# -*- coding: utf-8 -*-
# SQL testing
import MySQLdb

db = MySQLdb.connect(host="localhost", user="root", passwd="password", db="temp")

cur  = db.cursor()

print cur
