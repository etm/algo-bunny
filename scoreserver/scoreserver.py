from flask import Flask, Response
from flask_cors import CORS

import os
import glob
import json
import datetime
from itertools import groupby

from fileobserver import observer_setup
from eventmanager import EventManager

app = Flask(__name__)
CORS(app) # So bunny can access data

path_root = '/var/www/bunny/'
now = datetime.datetime.now()
today = now.strftime("%y-%m-%d")
today = '24-01-08'

event_manager = EventManager()

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

def extract_stats(filename, day):
    file = open(filename)
    stats = json.load(file)
    stats["sol_src"] = 'data/' + filename[len(path_root + 'scores/'):]
    stats["date"] = day
    stats["timestamp"] = extract_time_from_filename(filename)
    return stats

def filter_stats(file_list, day):
    all_stats = [extract_stats(filename, day) for filename in file_list]
    return all_stats

def get_stats_by_datetime(uid, day, time=None):
    if time==None:
        prefix = path_root + 'scores/' + uid + '/' + day + '/'
        file_regex = prefix + '*'
        files = glob.glob(file_regex)
        grouped_files = groupby(sorted(files), lambda filename : filename[len(prefix):len(filename)-len(day+'.json')-1])
        # grouped_lists = [(k, [filename[len(path_root):] for filename in list(g)]) for k, g in grouped_files]
        grouped_lists = {k: filter_stats(list(g), day) for k, g in grouped_files}
        return grouped_lists
    return []

@app.route('/init', methods=['GET'])
def students():
    table_data = {}
    table_data['users'] = [{'id': id, 'username': get_name_by_id(id)} for id in get_student_ids()]
    return json.dumps(table_data)

@app.route('/init/today', methods=['GET'])
def stats_today():
    table_data = {}
    table_data['users'] = [{'id': id, 'username': get_name_by_id(id)} for id in get_student_ids()]
    stats = {user['id']: get_stats_by_datetime(user['id'], today) for user in table_data['users']}
    table_data['levels'] = {}

    for uid in stats:
        for level in stats[uid]:
            if level not in table_data['levels']:
                table_data['levels'][level] = {}
            table_data['levels'][level][uid] = stats[uid][level]

    return json.dumps(table_data)

@app.route('/init/last_hour', methods=['GET'])
def stats_hour():
    pass

@app.route('/get/student/<student>', methods=['GET'])
def get_student_data(student):
    return 'student: '+student

# Broadcast an event to everyone viewing the scoreboard
def send_event(event_type, data):
    global event_manager

    with app.app_context():
        print(event_type, data)
        event_manager.announce(event_type, json.dumps(data))

@app.route('/stream', methods=['GET'])
def listen():
    def stream():
        global event_manager

        messages = event_manager.listen()  # returns a queue.Queue
        while True:
            msg = messages.get()  # blocks until a new message arrives
            yield msg

    return Response(stream(), mimetype='text/event-stream')


if __name__ == '__main__':
    app.debug = True
    # Monitor username changes
    observer_setup(send_event)
    # TODO: Monitor new submissions

    app.run(host='localhost', port=3000, threaded=True)

