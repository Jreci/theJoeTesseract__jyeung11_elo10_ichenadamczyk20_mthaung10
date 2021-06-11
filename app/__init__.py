import os
from flask import Flask, redirect, render_template, request, session, url_for
from werkzeug.exceptions import HTTPException
import dbmanager as db

#API STUFF START
import http.client
import json
import urllib.parse
import requests
import random
#API STUFF END

print("v")
app = Flask(__name__)
app.secret_key = os.urandom(10)

#forward thinking
@app.errorhandler(HTTPException)
def handle_exception(e):
    """Return JSON instead of HTML for HTTP errors."""
    # start with the correct headers and status code from the error
    response = e.get_response()
    # replace the body with JSON
    response.data = json.dumps({
        "code": e.code,
        "name": e.name,
        "description": e.description,
    })
    response.content_type = "application/json"
    return response

#root route loads home page
@app.route("/", methods=["GET", "POST"])#all routes except logout redirect to here
def root():
    #db.addHighScore("DUP", 0)
    un = "!DNE"#does not exist, this string can't be made as a username by user b/c not alphanumeric
    success_msg=""
    error_msg=""
    loggedIn = "false"

    addHighScore = "false"
    userHighScores=""

    #checks to see if the user is already logged in
    if "username" in session:
        loggedIn = "true"
        un = session["username"]
        userHighScores = db.getUserInfo(un)[2].split("~")
    if "success_msg" in session:
        success_msg = session.pop("success_msg")
    if "error_msg" in session:
        error_msg = session.pop("error_msg")

    highScores=list(db.getHighScores())

    if "checkHighScore" in session:#check is high score is great enough to be added to high score table
        session.pop("checkHighScore")
        for x in highScores:
            print("Username: " + str(x[1]) + "| Score: " + str(x[0]))
            print("score", session["score"]);
            if x[0] < int(session["score"]):#if old score in table less than new score
                print("The old score " + str(x[0]) + " is less than the new score " + str(session["score"]))
                if "username" in session:
                    db.addHighScore(str(session["username"]), int(session["score"]))#add new score
                    db.popMinHS()#remove lowest score
                    highScores=list(db.getHighScores()) #get new updated scores
                    break
                else:
                    db.addHighScore("Guest" + str(db.counter), int(session["score"]))
                    db.counter += 1#keep guestids unique
                    db.popMinHS()
                    highScores=list(db.getHighScores()) #get new updated scores
                    break 
            else:
                print("The old score " + str(x[0]) + " is greater than the new score " + str(session["score"]))

        if "username" in session:        
            db.addScore(un, int(session["score"]))
            userHighScores = db.getUserInfo(un)[2].split("~") #get new updated scores
        session.pop("score")

    highScores2 = sorted(highScores, key=lambda x: x[0])[::-1] #sorted database
    userHighScores2 = sorted(userHighScores[1:], key=lambda x: x[0])[::-1]
    
    print("User high scores: " + str(userHighScores))

    return render_template("home.html", loggedIn = loggedIn, un=un, success_msg=success_msg, error_msg=error_msg, highScores=highScores2, userHighScores=userHighScores2)

#login submit route handles the form submission from pressing the login button on the login page
@app.route("/login-submit", methods=["POST"])
def authenticate():
    #obtain the inputted user and pass
    userInput = request.form['username']
    passInput = request.form['password']

    #check info against login database
    loginInfo = db.checkLogin(userInput, passInput) #{boolean if login successful, error msg}

    #if the check passes, adds account to the session and redirects you to home
    if loginInfo[0]:
        session["username"] = userInput
        session["password"] = passInput
        session["success_msg"] = "Login successful!"
        return redirect("/")

    #if the check fails, returns the type of error message explaining what failed
    session["error_msg"] = loginInfo[1]
    return redirect("/")

#handles form submission for register
@app.route("/register-submit", methods=["POST"])
def registrate():
    userInput = request.form['username']
    passInput = request.form['password']
    passConfInput = request.form['passwordConf']

    # pls check if username and password and passwordConf are valid
    if not userInput.isalnum():
        session["error_msg"] = "Username must be alphanumeric"
        print("Username must be alphanumeric")
        return redirect("/")
    if not passInput == passConfInput:
        session["error_msg"] = "Passwords don't match"
        print("Passwords don't match")
        return redirect("/")
    if db.getUserInfo(userInput) != None:
        session["error_msg"] = "Username already exists"
        print("Username already exists")
        return redirect("/")

    # register the user
    db.registerUser(userInput, passInput)

    session["success_msg"] = "Successful registration!"
    print("Successful registration!")
    return redirect("/")

#logout route logs the user out
@app.route("/logout", methods=["GET", "POST"])
def logout():

    #handles deleting session info
    if "username" in session:
        username = session.pop("username")
        session.pop("password")
        session["success_msg"] = "Logged you out! See you again, " + username
        return redirect("/")
    else:
        session["error_msg"] = "You weren't logged in"
        return redirect("/")

    return render_template("home.html", success_msg=success_msg)

#UNTESTED
@app.route("/newScore", methods=["GET", "POST"])
def checkNewScore(): #game ended, check if score should be added to hiscore table
    session["checkHighScore"] = "true"
    session["score"] = request.form["score"]
    print("score", session["score"])
    return redirect("/")

if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0') #for replit testing  