import sqlite3
import hashlib

DB_FILE = "./app/db.db"

db = sqlite3.connect(DB_FILE, check_same_thread=False)
db.text_factory = str
c = db.cursor()
salt = b"We might copy a lot of things from p0 and p1, but not our salt string! Because we are safe and secure and huadsgp9aysrb86t42wbttas" #kept the same salt string from p3 though
def saltString(string, salt):
    return hashlib.pbkdf2_hmac('sha256', string.encode('utf-8'), salt, 100000)

#================================================================================
# USER RELATED METHODS
#================================================================================

# returns (username, password, scores) for a given username. Returns None
# if argument username is not present in the database
def getUserInfo(username: str):
    command = 'SELECT username, password, scores FROM users WHERE username=?;'
    info = ()
    for row in c.execute(command, [username]):
        info += (row[0], row[1], row[2])

    if info == ():
        return None
    return info

#================================================================================
# AUTHENTICATION RELATED METHODS
#================================================================================

# returns a tuple in the following format: (login_successful, issue, user_id)
# login_successful will be either True (correct info) or False
# issue will be None if login_successful is True. Otherwise will be "user not found" or
# "incorrect username or password"
# user_id will be returned if login_successful. None if not login_successful
def checkLogin(username: str, password: str) -> tuple:
    info = getUserInfo(username)
    if info == None:
        return (False, "User not found", None)
    elif (info[0] == username) and (info[1] == saltString(password, salt)):
        return (True, None, info[2])
    return (False, "Incorrect username or password", None)

# UNTESTED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# registers a new user by adding their info to the db
# returns the unique user_id so that it can be added to the session in app.py
def registerUser(username: str, password: str):
    command = "SELECT username FROM users WHERE username=?;"
    duplicates = ()
    for row in c.execute(command, [username]):
        duplicates += (row[0],)

    if duplicates == ():
        command = "INSERT INTO users VALUES (?, ?, '');"
        c.execute(command, [username, saltString(password, salt)])
        db.commit()
    else:
        print("error")

#================================================================================
# HIGH SCORE RELATED METHODS
#================================================================================

#UNTESTED!!!!!!!!!!
#adds a new score to the db for the relevant user, if the score is high enough
def addScore(username: str, score: int):
    #get the user's scores and parse the string into a list
    scoresAsStr = getUserInfo(username)[2]
    scoresAsList = scoresAsStr.split("~")

    lowestScore = min(scoresAsList)
    #if the user has the max number of scores and the new score beats
    #the lowest existing score, then replace it
    if (len(scoresAsList) >= 10 and score > lowestScore): 
        scoresAsList.remove(lowestScore)
        scoresAsList.append(score)
    #if the user has less than the max #, just add the new score
    elif (len(scoresAsList) < 10):
        scoresAsList.append(score)
    #the new score won't be added if the user has max # of scores and
    #the new score doesn't beat any existing score

    #put the list back together into a string
    updatedScores = "~".join(scoresAsList)

    #update the scores
    command = "UPDATE users SET scores=? WHERE username=?;"
    c.execute(command, [updatedScores, username])
    db.commit()

#method to add high score into highscore table
#method to retrieve high scores


#================================================================================
# TEST METHODS
#================================================================================

#prints the entire table
def showUsers():
    print("users:")
    command = 'SELECT * FROM users;'
    for row in c.execute(command):
        print(row)

#prints the entire table
def showHighScores():
    print("highscores:")
    command = 'SELECT * FROM highscores;'
    for row in c.execute(command):
        print(row)

def close():
    db.close()

#registerUser("joelel", "joe")
print(showUsers())