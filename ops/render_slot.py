#!/usr/bin/env python3
"""Shared render limiter: at most SLOTS heavy jobs (ffmpeg, Remotion, whisper) run at once, Mac-wide.

CLI:     ops/render_slot.py ffmpeg -y -i in.mp4 ... out.mp4    (waits for a free slot, runs at nice 10)
Python:  from render_slot import slot
         with slot(): subprocess.run([...])
Slots are flock'd files in ~/.cache/goviral/slots, so a crashed job frees its slot automatically.
"""
import fcntl, os, subprocess, sys, time
from contextlib import contextmanager
from pathlib import Path

SLOTS = int(os.environ.get("GOVIRAL_RENDER_SLOTS", "3"))
DIR = Path.home() / ".cache/goviral/slots"


@contextmanager
def slot(poll=0.5):
    DIR.mkdir(parents=True, exist_ok=True)
    while True:
        for i in range(SLOTS):
            f = open(DIR / f"slot{i}.lock", "w")
            try:
                fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                f.close()
                continue
            try:
                yield i
            finally:
                fcntl.flock(f, fcntl.LOCK_UN)
                f.close()
            return
        time.sleep(poll)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    with slot():
        sys.exit(subprocess.call(["nice", "-n", "10", *sys.argv[1:]]))
