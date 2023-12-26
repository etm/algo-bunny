from flask import Flask
from flask_cors import CORS

import os
import glob
import json
import datetime

app = Flask(__name__)
CORS(app) # So bunny can access data

path_root = '/var/www/bunny/'
now = datetime.datetime.now()
today = now.strftime("%y-%m-%d")
today = '23-12-26'

levels = [
    "Carrots!",
    "Carrots_around_the_corner!",
    "Carrots_on_a_stick!"
    ]


@app.route('/')
def hello_world():
    return '<p>Hello, World!</p>'

def get_student_ids():
    folder = path_root + 'scores'
    sub_folders = [name for name in os.listdir(folder) if os.path.isdir(os.path.join(folder, name))]
    return sub_folders

def get_name_by_id(id):
    username_path = path_root + 'data/' + id + '/username.txt'
    f = open(username_path, 'r')
    return f.read()

def extract_time_from_filename(filename):
    ext = '.json'
    time_len = 8
    end = - len(ext)
    start = end - time_len
    time_str = filename[start:end].replace('-', ':')
    return time_str

def get_student_level_data(student, level = 0):
    global today
    
    if (level == 0):
        pass # get all levels for the specified student
    
    prefix = path_root + 'scores/'
    score_path = student + '/' + today + "/" + levels[level-1]
    file_path = prefix + score_path + "*"
    files = glob.glob(file_path)

    if files == []:
        return {}
    # Open last file in list for now
    latest_sol_file = open(files[-1])
    latest_sol = json.load(latest_sol_file)
    latest_sol["sol_source"] = files[-1][len(prefix):]
    latest_sol["timestamp"] = today+' '+extract_time_from_filename(files[-1])

    return latest_sol


@app.route('/init', methods=['GET'])
def students():
    table_data = {}
    table_data['users'] = [{'id': id, 'username': get_name_by_id(id)} for id in get_student_ids()]
    return json.dumps(table_data)

@app.route('/get/level/<level>', methods=['GET'])
def get_level_data(level):
    global today, levels

    if (int(level) > len(levels)):
        return json.dumps({"err": "I don't know that level!"})

    level_data = {"students":{}, "err":"No errors!"}
    students = get_student_ids()
    for student in students:
        level_data["students"][student] = get_student_level_data(student, int(level))

    return json.dumps(level_data)

@app.route('/get/student/<student>', methods=['GET'])
def get_student_data(student):
    return 'student: '+student

if __name__ == '__main__':
    app.run(host='localhost', port=3000)
