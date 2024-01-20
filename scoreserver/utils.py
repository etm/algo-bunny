import json

def extract_time_from_filename(filename):
    ext = '.json'
    time_len = 8
    end = - len(ext)
    start = end - time_len
    time_str = filename[start:end].replace('-', ':')
    return time_str

def extract_stats(path_root, filename, day=""):
    file = open(filename)
    stats = json.load(file)
    stats["sol_src"] = 'data/' + filename[len(path_root + 'scores/'):]
    stats["code"] = open(path_root + stats["sol_src"], 'r').read()
    stats["date"] = day
    stats["timestamp"] = extract_time_from_filename(filename)
    return stats

