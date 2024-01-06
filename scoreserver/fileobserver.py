from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler

def on_modified(send_event):
    return (lambda event : (
        print(f"{event.src_path} has been modified"),
        send_event('publish', {"file_changed": event.src_path}),
    ))

# Configures an observer monitoring username changes
def observer_setup(send_event):
    patterns = ["*/username.txt"]
    ignore_patterns = None
    ignore_directories = False
    case_sensitive = True
    my_event_handler = PatternMatchingEventHandler(patterns, ignore_patterns, ignore_directories, case_sensitive)
    my_event_handler.on_modified = on_modified(send_event)

    path = "/var/www/bunny/data"
    go_recursively = True
    my_observer = Observer()
    my_observer.schedule(my_event_handler, path, recursive=go_recursively)

    my_observer.start()
