from re import S
from flask import Flask, flash, jsonify, redirect, render_template, request, session, url_for, session
import json, random
import os, sys, json, configparser, pyodbc, base64, cx_Oracle
from flask_login import UserMixin, login_user, current_user, logout_user, login_required, LoginManager, user_unauthorized
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired

class PrefixMiddleware(object):
    def __init__(self, app, prefix=''):
        self.app = app
        self.prefix = prefix
    def __call__(self, environ, start_response):
        if environ['PATH_INFO'].startswith(self.prefix):
            environ['PATH_INFO'] = environ['PATH_INFO'][len(self.prefix):]
            environ['SCRIPT_NAME'] = self.prefix
            return self.app(environ, start_response)
        else:
            start_response('404', [('Content-Type', 'text/plain')])
            return ["This url does not belong to the app. Check your URL address.".encode()]

#taken from ITOS
#See OneNote Documention (IT Developers -> Python -> PassKey Storage) for help
def xml_parse(key):
    #7.9.2021 - Want to add functionality for this, but need to reset connection string & correctly parse the correct config statement
    configParser = configparser.RawConfigParser()
    configFilePath = r'\\jab-softlib1\Softlib\Python\setting.config'
    configParser.read(configFilePath)
    return configParser.get('appSettings',key)


app = Flask(__name__,
            static_url_path='',
            static_folder='web/source',
            template_folder='web/templates',
            )
app.secret_key = "supersecretkey"
login_manager = LoginManager()
login_manager.init_app(app)

app.wsgi_app = PrefixMiddleware(app.wsgi_app, prefix='/LunchApp')

#taken from ITOS
cx_Oracle.init_oracle_client(lib_dir=r"C:\Oracle\instantclient_19_11")
global pyodbc_connectionString
pyodbc_connectionString = 'DRIVER=SQL Server;SERVER=jab-testsql1;UID=' + xml_parse('Title_Maint_User') + ';PWD=' + xml_parse('Title_Maint_Pass') + ';Trusted_Connection=no'

login_manager.login_view = "login"
class User(UserMixin):
    def __init__(self, username, name, id, active=True):
        self.username = username
        self.name = name
        self.id = id
        self.active = active

    def is_active(self):
        # Here you should write whatever the code is
        # that checks the database if your user is active
        return self.active

    def is_authenticated(self):
        return True
    
    def get_username(self):
        return self.username
    
    def get_id(self):
        return self.id

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password')
    remember_me = BooleanField('Remember Me')

def grab_user(username):
    sql = """
        SELECT TOP 1 [USER_USERNAME],[USER_NAME], [USER_ID] FROM [WATC_Custom].[dbo].[LunchApp_Users] WHERE [USER_USERNAME] = ?
        """
    #Execute statement
    conn = pyodbc.connect(pyodbc_connectionString)
    cursor = conn.cursor()
    cursor.execute(sql, username)

    #Parse information for JS
    rows = cursor.fetchall()
    data = []
    for row in rows:
        data.append([row[0], row[1], row[2]])
    if len(rows) == 0:
        return None #user not found page
    person = data[0]
    print(person, id)
    user = User(person[0], person[1], person[2], True)
    #Close Connection to SQL
    cursor.close()
    conn.close()
    return user

@login_manager.user_loader
def load_user(id):
    sql = """
        SELECT TOP 1 [USER_USERNAME],[USER_NAME], [USER_ID] FROM [WATC_Custom].[dbo].[LunchApp_Users] WHERE [USER_ID] = ?
        """
    #Execute statement
    conn = pyodbc.connect(pyodbc_connectionString)
    cursor = conn.cursor()
    cursor.execute(sql, id)

    #Parse information for JS
    rows = cursor.fetchall()
    data = []
    for row in rows:
        data.append([row[0], row[1], row[2]])
    if len(rows) == 0:
        return None
    person = data[0]
    print(person, id)
    user = User(person[0], person[1], person[2], True)
    #Close Connection to SQL
    cursor.close()
    conn.close()
    if user.get_id() == id:
        return user
    else:
        return None


    

@app.route("/login", methods = ["GET", "POST"])
def login():
    
    if current_user.is_authenticated:
        return(redirect(url_for("home")))
    form = LoginForm()
    if form.validate_on_submit():

        username = form.username.data
        #get data from form
        #check database to see if username exists
        #get the user id of the existance of the username
        #create the user (UserClass)
        #if the username 
        print(username)
        sql = """
        SELECT TOP 1 [USER_USERNAME],[USER_NAME], [USER_ID] FROM [WATC_Custom].[dbo].[LunchApp_Users] WHERE [USER_USERNAME] = ?
        """

        #Execute statement
        conn = pyodbc.connect(pyodbc_connectionString)
        cursor = conn.cursor()
        cursor.execute(sql, username)

        #Parse information for JS
        rows = cursor.fetchall()
        data = []
        for row in rows:
            data.append([row[0], row[1], row[2]])
        if len(rows) == 0:
            print('invalid username, no size from db')
            flash("Invalid login")
            return render_template('login.html', form=form)
        person = data[0]
        user = User(person[0], person[1], person[2], True)
        #Close Connection to SQL
        cursor.close()
        conn.close()

        
        if user.get_username() == username:
            print('username does not match')
            session['username'] = user.username
            login_user(user)
            return redirect(url_for("home"))
        else:
            flash("Invalid username")
    else:
        flash("Invalid login")
    return render_template('login.html', form=form)  


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/')
@app.route('/home')
@login_required
def home():
    print("hello")
    return render_template("home.html")



@app.route('/user')
@login_required
def user():
    username = request.args.get("username")
    user = grab_user(username)
    return render_template('profile.html', user = user)

@app.route('/edit_profile', methods=["GET", "POST"])
@login_required
def edit_profile():
    username = request.args.get("username")
    if session['username'] == username:
        print("AUTHENTICATED")
        user=grab_user(username)
        return render_template('edit_profile.html', user=user)
        
    return render_template('home.html')


@app.route('/get_users')
def getUsers():
    #need to make sql call here to get all the users
    #let javascipt handle current users
    
    sql = """
        SELECT [User_Name] FROM [WATC_Custom].[dbo].[LunchApp_Users]
    """

    #Execute statement
    conn = pyodbc.connect(pyodbc_connectionString)
    cursor = conn.cursor()
    cursor.execute(sql)

    #Parse information for JS
    rows = cursor.fetchall()  
    sendData = []
    for row in rows:
        sendData.append(row[0])
    #Close Connection to SQL
    cursor.close()
    conn.close()

    print('got users')    
    return jsonify(sendData)


@app.route('/load_restaurants', methods=['post'])
def loadRestaurants():
    currentUsers = json.loads(request.data)
    sendData = []
    data = json.loads(request.data)
    print(data)
    conn = pyodbc.connect(pyodbc_connectionString)
    cursor = conn.cursor()
    
    sql = '''
                    SELECT DISTINCT 
            User_Restaurants
            FROM [LunchApp_Restaurants] R
            LEFT JOIN [LunchApp_Users] U
                ON U.[User_Id] = R.[User_Id]
            WHERE'''
        
    index = 0
    for user in data:
        index += 1
        if index == 1:
            sql += " [USER_NAME] = '"+user+"'"
        else:
            sql += " OR [USER_NAME] = '"+user+"'"
    sql += ''' AND [HIDDEN] = 1 
            GROUP BY USER_RESTAURANTS
            HAVING COUNT(User_Restaurants) > '''
    sql += str(len(data)-1)
    sql += " "
        
    cursor.execute(sql)
    rows = cursor.fetchall() 
    #Parse information for JS 
    for row in rows:
        sendData.append(row[0])

    random.shuffle(sendData)

    #Close Connection to SQL
    cursor.close()
    conn.close()
    return jsonify(sendData)


@app.route('/get_user_info', methods=['post'])
def getUserInfo():
    print("GET USER INFO")
    data = json.loads(request.data)
    print(data)
    sql = '''
    SELECT LunchApp_Restaurants.User_Restaurants
        FROM [LunchApp_Restaurants]
    LEFT JOIN [LunchApp_Users]
        ON LunchApp_Restaurants.[User_Id] = LunchApp_Users.[User_Id] 
        WHERE LunchApp_Users.[USER_USERNAME] = ? AND [HIDDEN] = 1
    ORDER BY LunchApp_Restaurants.User_Restaurants
    '''
    conn = pyodbc.connect(pyodbc_connectionString)
    cursor = conn.cursor()
    cursor.execute(sql, data.strip())

    #Parse information for JS
    rows = cursor.fetchall()  
    sendData = []
    for row in rows:
        sendData.append(row[0])
    #Close Connection to SQL
    cursor.close()
    conn.close()
    print(sendData)
    return jsonify(sendData)

@app.route('/all_user_restaurants', methods=['post'])
def allUserRests():
    conn = pyodbc.connect(pyodbc_connectionString)
    cursor = conn.cursor()

    sql = '''
    SELECT DISTINCT LunchApp_Users.[User_Name], LunchApp_Restaurants.User_Restaurants 
        FROM [LunchApp_Restaurants]
    LEFT JOIN [LunchApp_Users]
        ON LunchApp_Restaurants.[User_Id] = LunchApp_Users.[User_Id] WHERE [Hidden] = 1
    '''
    cursor.execute(sql)

    #Parse information for JS
    rows = cursor.fetchall()  
    sendData = []
    for row in rows:
        sendData.append({"Name": row[0], "Restaurant":row[1]})
    #Close Connection to SQL
    cursor.close()
    conn.close()
    return jsonify(sendData)

@app.route('/add_resturant', methods=['post'])
def addRest():
    place = json.loads(request.data)

    #check if string has apostrophe
    # if place.__contains__("'"):
    #     place = "''".join(place.rsplit("'", 1))

    conn = pyodbc.connect(pyodbc_connectionString)
    cursor = conn.cursor()

    #need to check database to see if entry is already present
    sql= "SELECT TOP (1) [ID_NUM], [HIDDEN] FROM [LunchApp_Restaurants] WHERE [USER_ID] = ? AND [USER_RESTAURANTS] LIKE ?"
    cursor.execute(sql, current_user.get_id(), place)
   
    updateID = ""
    updateHidden = ""
    rows = cursor.fetchall()
    print(len(rows))
    print(rows)
    for row in rows:
        updateID = row[0]
        updateHidden = row[1]
    
    #if its just hidden, unhide it, if its not hidden, leave it alone, else, 
    if len(rows) == 1:
        print(updateHidden)
        if updateHidden == 0:
            sql="UPDATE [LunchApp_Restaurants] SET [HIDDEN] = 1 WHERE [ID_NUM] = ?"
            cursor.execute(sql, updateID)
            cursor.commit()
            return "is present and hidden"
        else:
            #do nothing, entry is already present and unhidden
            return "is present and not hidden"

    insert_sql = "INSERT INTO [LunchApp_Restaurants] ([User_Id], User_Restaurants, [Hidden]) VALUES (?, ?, 1)"
    cursor.execute(insert_sql, current_user.get_id(), place)
    cursor.commit()
    #make sql call and add row to restaurant table
    cursor.close()
    conn.close()
    return "inserted new restaurant to user"

@app.route('/delete_resturaunt', methods=['post'])
def deleteResturaunt():
    data = json.loads(request.data)
    print(data)
    user = data[0]
    place = data[1]
    print(user, place)
    conn = pyodbc.connect(pyodbc_connectionString)
    cursor = conn.cursor()

    # # if place.__contains__("'"):
    # #     place = "''".join(place.rsplit("'", 1))
    # # print(place)

    # select_sql = "SELECT [User_Id] FROM [LunchApp_Users] WHERE [User_Name] = ?"
    # cursor.execute(select_sql, user)
    # userid = []
    # rows = cursor.fetchall()
    # for row in rows:
    #     userid.append(row[0])
    # print(userid)
    print(current_user.get_id())
    
    #make sql call and add row to restaurant table
    insert_sql = "UPDATE [LunchApp_Restaurants] SET [Hidden] = 0 WHERE [User_Restaurants] = ? AND [USER_ID] = ?"

    cursor.execute(insert_sql, data, current_user.get_id())
    cursor.commit()

    cursor.close()
    conn.close()
    return "ok"


@app.route('/get_top_results', methods=['post'])
def topResults():
    print("TOP RESULTS")
    place = json.loads(request.data)
    if place.__contains__("'"):
        place = "''".join(place.rsplit("'", 1))
    conn = pyodbc.connect(pyodbc_connectionString)
    cursor = conn.cursor()
    newPlace = "%"+place+"%"
    sql = '''
        SELECT DISTINCT TOP (10)  LunchApp_Restaurants.User_Restaurants
        FROM [LunchApp_Restaurants]
		WHERE UPPER(User_Restaurants) LIKE UPPER(?)
    '''
    print(sql, newPlace)

    cursor.execute(sql, newPlace)

    #Parse information for JS
    rows = cursor.fetchall()  
    sendData = []
    for row in rows:
        sendData.append(row[0])
    #Close Connection to SQL
    cursor.close()
    conn.close()
    return jsonify(sendData)

@app.route('/get_top_ten_profile', methods=['post', 'get'])
def get_most_popular():
    conn = pyodbc.connect(pyodbc_connectionString)
    cursor = conn.cursor()

    sql = '''
        SELECT DISTINCT TOP 10 [USER_RESTAURANTS], 
		    COUNT([USER_RESTAURANTS]) 
        FROM [LunchApp_Restaurants]  
        WHERE [User_Restaurants] NOT IN 
            (
                SELECT [USER_RESTAURANTS] 
                FROM [LunchApp_Restaurants] 
                WHERE [USER_ID] = ?
            )
        GROUP BY [User_Restaurants]
        ORDER BY COUNT([User_Restaurants]) DESC
    '''
    cursor.execute(sql, current_user.get_id())
    rows = cursor.fetchall()  
    sendData = []
    for row in rows:
        sendData.append(row[0])
    #Close Connection to SQL
    cursor.close()
    conn.close()
    return jsonify(sendData)

@app.route("/explore")
def explore():
    conn = pyodbc.connect(pyodbc_connectionString)
    cursor = conn.cursor()

    sql = '''
        SELECT TOP (12)	U.[USER_NAME],U.[USER_USERNAME],COUNT(*)
        FROM [LunchApp_Restaurants] AS R
        LEFT JOIN [LunchApp_Users] AS U ON R.[User_Id] = U.[USER_ID]
    '''
    if current_user.is_authenticated:
        sql+= "WHERE U.[USER_ID] <> ?"
    sql += '''
        GROUP BY [USER_NAME], [USER_USERNAME]
        ORDER BY COUNT(*) DESC
    '''
    if current_user.is_authenticated:
        cursor.execute(sql, current_user.get_id())
    else:
        cursor.execute(sql)
    rows = cursor.fetchall()  
    explore_recommended = []
    for row in rows:
        explore_recommended.append({"name":row[0], "username":row[1], "count":row[2]})
    #Close Connection to SQL
    print(explore_recommended)
    cursor.close()
    conn.close()
    return render_template('explore.html', explore_recommended = explore_recommended)



if __name__ == "__main__":
    app.run(debug=True) 