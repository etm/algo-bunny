from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler
import os
import utils

path_root = '/var/www/bunny/'

def on_username_change_helper(event):
    print(f"{event.src_path} has been modified")
    path = os.path.normpath(event.src_path)
    uid = path.split(os.sep)[-2]
    username = open(event.src_path, 'r').read()
    print(uid, username)
    return {'uid': uid, 'username': username}

def on_username_change(send_event):
    return (lambda event :
        send_event('username_change', on_username_change_helper(event))
    )

def on_new_submission_helper(event):
    print(f"{event.src_path} was created")
    path = os.path.normpath(event.src_path)
    uid = path.split(os.sep)[-3]
    stats = utils.extract_stats(path_root, event.src_path)
    stats['date'] = path.split(os.sep)[-2]
    level = path.split(os.sep)[-1][:-len(stats['timestamp']) - len(".json") - 1]
    print(uid, stats)
    return {'uid': uid, 'level': level, 'stats': stats}

def on_new_submission(send_event):
    return (lambda event :
        send_event('new_solution', on_new_submission_helper(event))
    )

# Configures an observer monitoring username changes
def username_observer_setup(send_event):
    patterns = ["*/username.txt"]
    ignore_patterns = None
    ignore_directories = False
    case_sensitive = True
    my_event_handler = PatternMatchingEventHandler(patterns, ignore_patterns, ignore_directories, case_sensitive)
    my_event_handler.on_modified = on_username_change(send_event)
    my_event_handler.on_created = on_username_change(send_event)

    path = "/var/www/bunny/data"
    go_recursively = True
    my_observer = Observer()
    my_observer.schedule(my_event_handler, path, recursive=go_recursively)

    my_observer.start()

#  Configures an observer monitoring successful solution submission
def solution_observer_setup(send_event):
    patterns = ["*/*/*.json"]
    ignore_patterns = None
    ignore_directories = False
    case_sensitive = True
    my_event_handler = PatternMatchingEventHandler(patterns, ignore_patterns, ignore_directories, case_sensitive)
    my_event_handler.on_created = on_new_submission(send_event)

    path = "/var/www/bunny/scores"
    go_recursively = True
    my_observer = Observer()
    my_observer.schedule(my_event_handler, path, recursive=go_recursively)

    my_observer.start()
