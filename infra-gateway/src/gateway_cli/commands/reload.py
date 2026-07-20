import subprocess
import os

def run_reload(base_dir: str):
    reload_script = os.path.join(base_dir, "hot-reload.sh")
    if not os.path.exists(reload_script):
        print(f"Error: hot-reload.sh script not found at {reload_script}")
        return
        
    print("[*] Triggering graceful gateway hot-reload...")
    try:
        result = subprocess.run([reload_script], capture_output=True, text=True, check=True)
        print(result.stdout)
        print("[✓] Graceful reload finished successfully.")
    except subprocess.CalledProcessError as e:
        print("[ERROR] Graceful reload execution failed:")
        print(e.stderr)
