import os
import json
import re
from pathlib import Path

# Root runs directory anchored to repository root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
RUNS_DIR = PROJECT_ROOT / "runs"
os.makedirs(RUNS_DIR, exist_ok=True)

def is_valid_uuid(val):
    return bool(re.match(r'^[a-fA-F0-9\-]{36}$', str(val)))

def get_run_folder(run_id):
    if not is_valid_uuid(run_id):
        raise ValueError(f"Invalid run_id format: {run_id}")
    return RUNS_DIR / str(run_id)

def create_run_folder(run_id):
    run_path = get_run_folder(run_id)
    os.makedirs(run_path, exist_ok=True)
    return str(run_path)

def update_status(run_id, status):
    run_path = get_run_folder(run_id)
    os.makedirs(run_path, exist_ok=True)
    status_path = run_path / "status.json"

    data = {"status": status}

    with open(status_path, "w") as f:
        json.dump(data, f, indent=4)

def read_status(run_id):
    run_path = get_run_folder(run_id)
    status_path = run_path / "status.json"

    if not status_path.exists():
        return None

    with open(status_path, "r") as f:
        return json.load(f)
