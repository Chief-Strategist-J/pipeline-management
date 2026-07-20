#!/usr/bin/env python3
import os
import sys
import time
import subprocess

def get_max_mtime(directories):
    max_mtime = 0
    for directory in directories:
        if not os.path.exists(directory):
            continue
        for root, _, files in os.walk(directory):
            for file in files:
                filepath = os.path.join(root, file)
                try:
                    mtime = os.path.getmtime(filepath)
                    if mtime > max_mtime:
                        max_mtime = mtime
                except OSError:
                    pass
    return max_mtime

def main():
    # Directories to watch for abstract configuration changes
    script_dir = os.path.dirname(os.path.abspath(__file__))
    watch_dirs = [
        os.path.join(script_dir, "edge"),
        os.path.join(script_dir, "routing")
    ]
    reload_script = os.path.join(script_dir, "hot-reload.sh")
    
    print(f"[*] Configuration Watcher Agent started.")
    print(f"[*] Watching directories for changes: {', '.join(watch_dirs)}")
    
    last_mtime = get_max_mtime(watch_dirs)
    
    try:
        while True:
            time.sleep(2)
            current_mtime = get_max_mtime(watch_dirs)
            if current_mtime > last_mtime:
                print(f"[!] Configuration change detected! Triggering hot-reload agent...")
                try:
                    result = subprocess.run([reload_script], capture_output=True, text=True, check=True)
                    print(result.stdout)
                    last_mtime = current_mtime
                    print("[✓] Hot-reload successfully executed.")
                except subprocess.CalledProcessError as e:
                    print(f"[ERROR] Hot-reload failed:")
                    print(e.stderr)
                    # Update mtime anyway to avoid infinite error loop
                    last_mtime = current_mtime
    except KeyboardInterrupt:
        print("\n[!] Watcher Agent stopped.")

if __name__ == "__main__":
    main()
