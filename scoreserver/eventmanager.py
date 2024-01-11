import queue

# Implementation based on https://maxhalford.github.io/blog/flask-sse-no-deps/
class EventManager:

    def __init__(self):
        self.listeners = []

    def listen(self):
        q = queue.Queue(maxsize=5)
        q.put_nowait(self.format_sse(data="You have successfully connected."))
        self.listeners.append(q)
        return q

    def announce(self, event: str, data: str):
        msg = self.format_sse(data, event)
        # Iterating through the list in reverse so addding and removing listeners doesn't cause index errors
        for i in reversed(range(len(self.listeners))):
            try:
                self.listeners[i].put_nowait(msg)
            except queue.Full:
                del self.listeners[i]

    def format_sse(self, data: str, event: str = None) -> str:
        msg = f'data: {data}\n\n'
        if event:
            msg = f'event: {event}\n{msg}'
        return msg

