from flask import Flask
from flask_cors import CORS

import os
import json
import datetime

app = Flask(__name__)
CORS(app) # So bunny can access data

path_root = '/var/www/bunny/'
now = datetime.datetime.now()
today = now.strftime("%y-%m-%d")
today = '23-12-17'

@app.route('/')
def hello_world():
    return '<p>Hello, World!</p>'

def get_students():
    folder = path_root + 'scores'
    sub_folders = [name for name in os.listdir(folder) if os.path.isdir(os.path.join(folder, name))]
    return sub_folders

@app.route('/init', methods=['GET'])
def students():
    table_data = {}
    table_data['names'] = get_students()
    return json.dumps(table_data)

@app.route('/get/level/<level>', methods=['GET'])
def get_level_data(level):
    return 'level: '+level

@app.route('/get/student/<student>', methods=['GET'])
def get_student_data(student):
    return 'student: '+student

if __name__ == '__main__':
    app.run(host='localhost', port=3000)
