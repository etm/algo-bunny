from flask import Flask, Response
from flask_cors import CORS

import os
import glob
import json
from itertools import groupby

from fileobserver import username_observer_setup, solution_observer_setup
from eventmanager import EventManager

import utils

app = Flask(__name__)
CORS(app) # So bunny can access data

path_root = '/var/www/bunny/'

event_manager = EventManager()

@app.route('/')
def hello_world():
    return '<p>Hello, World!</p>'

def get_student_ids(day):
    folder = path_root + 'scores'
    sub_folders = [name for name in os.listdir(folder) if (os.path.isdir(os.path.join(folder, name))
                                                           and os.path.exists(os.path.join(folder, name, day)))]
    return sub_folders

def filter_stats(file_list, day):
    all_stats = [utils.extract_stats(path_root, filename, day) for filename in file_list]
    return all_stats

def get_stats_by_datetime(uid, day, time=None):
    if time==None:
        prefix = path_root + 'scores/' + uid + '/' + day + '/'
        file_regex = prefix + '*'
        files = glob.glob(file_regex)
        grouped_files = groupby(sorted(files), lambda filename : filename[len(prefix):len(filename)-len(day+'.json')-1])
        grouped_lists = {k: filter_stats(list(g), day) for k, g in grouped_files}
        return grouped_lists
    return []

@app.route('/init/<day>', methods=['GET'])
def day_stats(day):
    table_data = {}
    table_data['users'] = [{'id': id, 'username': utils.get_name_by_id(id, path_root)} for id in get_student_ids(day)]
    stats = {user['id']: get_stats_by_datetime(user['id'], day) for user in table_data['users']}
    table_data['levels'] = {}

    for uid in stats:
        for level in stats[uid]:
            if level not in table_data['levels']:
                table_data['levels'][level] = {}
            table_data['levels'][level][uid] = stats[uid][level]

    return json.dumps(table_data)

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
    username_observer_setup(send_event)
    # Monitor new submissions
    solution_observer_setup(send_event)
    app.run(host='localhost', port=3000, threaded=True)

