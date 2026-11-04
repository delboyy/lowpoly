"""Local Kokoro TTS (same model files hyperframes downloads). stdin-free:  tts.py request.json
request: {voice, speed, lines:[str], out:"vo.wav", gapMs:180}  ->  writes out + out.timings.json [{startMs,durationMs}]"""
import json, sys, os
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
req = json.load(open(sys.argv[1]))
base = os.path.expanduser("~/.cache/hyperframes/tts")
k = Kokoro(f"{base}/models/kokoro-v1.0.onnx", f"{base}/voices/voices-v1.0.bin")
gap = int(req.get("gapMs", 180)); chunks = []; timings = []; t = 0; sr_out = 24000
for line in req["lines"]:
    a, sr = k.create(line, voice=req.get("voice", "am_michael"), speed=float(req.get("speed", 1.0)), lang="en-us")
    sr_out = sr
    a = np.concatenate([a, np.zeros(int(sr * gap / 1000), dtype=a.dtype)])
    dur = int(len(a) / sr * 1000)
    timings.append({"startMs": t, "durationMs": dur}); t += dur; chunks.append(a)
sf.write(req["out"], np.concatenate(chunks), sr_out)
json.dump(timings, open(req["out"] + ".timings.json", "w"))
print(f"tts ok {t/1000:.1f}s")
