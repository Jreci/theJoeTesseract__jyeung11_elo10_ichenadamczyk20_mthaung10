import sqlite3
#API STUFF START
import http.client
import json
import urllib
import requests
#API STUFF END

DB_FILE = "./app/db.db"

db = sqlite3.connect(DB_FILE, check_same_thread=False)
c = db.cursor()

def createTables():

    command = "DROP TABLE IF EXISTS users;"
    
    #technically TEXT PRIMARY KEY is bad for performance reasons, but this is
    #a soft dev project so that's not really an issue
    command += "CREATE TABLE users(username TEXT PRIMARY KEY, password TEXT, scores TEXT);"

    command += "DROP TABLE IF EXISTS highscores;"
    
    command += "CREATE TABLE highscores(score INTEGER, username TEXT);"

    c.executescript(command)
    db.commit()

if __name__ == "__main__":
    createTables()
    #manager.addHighScore("DUPLICATE", 1)
    for i in range(10): 
        from dbmanager import manager
        manager.addHighScore("This place has not yet been taken!", i)
    
