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
@app.route("/", methods=["GET", "POST"])
def root():
    print(db.showUsers())
    #checks to see if the user is already logged in
    un = "DNE"
    success_msg=""
    error_msg=""
    loggedIn = "false"
    if "username" in session:
        loggedIn = "true"
        un = session["username"]
    if "success_msg" in session:
        success_msg = session.pop("success_msg")
    if "error_msg" in session:
        error_msg = session.pop("error_msg")

    return render_template("home.html", loggedIn = loggedIn, un=un, success_msg=success_msg, error_msg=error_msg)


@app.route("/game", methods=["GET", "POST"])
def game():
    return render_template("game.html")


#login route loads login page
@app.route("/login", methods=["GET", "POST"])
def login():

    #error msgs are for when login attempt fails and returns you to the login page, and this code displays that error
    if "error_msg" in session:
        error_msg = session.pop("error_msg")
        return render_template("home.html", error_msg=error_msg)#originally login.html

    #this may not be necessary since a successful login attempt will just direct you to the home page
    if "success_msg" in session:
        success_msg = session.pop("success_msg")
        return render_template("home.html", success_msg=success_msg)#originally login.html

    return render_template("home.html")#originally login.html


#login submit route handles the form submission from pressing the login button on the login page
@app.route("/login-submit", methods=["POST"])
def authenticate():
    #obtain the inputted user and pass
    userInput = request.form['username']
    passInput = request.form['password']

    #check info against login database
    loginInfo = db.checkLogin(userInput, passInput)

    #if the check passes, adds account to the session and redirects you to home
    if loginInfo[0]:
        session["userid"] = loginInfo[2]
        session["username"] = userInput
        session["password"] = passInput
        session["success_msg"] = "Login successful!"
        return redirect("/")

    #if the check fails, returns the type of error message explaining what failed
    session["error_msg"] = loginInfo[1]
    return redirect("/login")


# #register route returns the register page
# @app.route("/register", methods=["GET", "POST"])
# def register():
#     print(db.showUsers())


#     if "error_msg" in session:
#         error_msg = session.pop("error_msg")
#         return render_template("home.html", error_msg=error_msg) #originally register.html
#     if "success_msg" in session:
#         success_msg = session.pop("success_msg")
#         return render_template("home.html", success_msg=success_msg) #originally register.html
#     return render_template("home.html") #originally register.html


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

    session["success_msg"] = "Success!"
    print("Successful registration!")
    return redirect("/")


#logout route logs the user out
@app.route("/logout", methods=["GET", "POST"])
def logout():

    #handles deleting session info
    if "username" in session:
        username = session.pop("username")
        session.pop("password")
        session.pop("userid")
        session["success_msg"] = "Logged you out! See you again, " + username
        return redirect("/")
    else:
        session["error_msg"] = "You weren't logged in"
        return redirect("/")

    return render_template("home.html", success_msg=success_msg)


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0') #for replit testing 