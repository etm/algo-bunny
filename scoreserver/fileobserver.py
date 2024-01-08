from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler
import os

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

# Configures an observer monitoring username changes
def observer_setup(send_event):
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
