// Run heavy jobs through the Mac-wide render limiter (ops/render_slot.py: 3 slots, nice 10). Usage: spawnSync(...slotted("npx", args), opts)
import path from "node:path";
import { fileURLToPath } from "node:url";
const SLOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../ops/render_slot.py");
export const slotted = (cmd, args) => ["python3", [SLOT, cmd, ...args]];
// GV_HWACCEL=1 asks Remotion for the videotoolbox H.264 encoder (faster, but bitrate-controlled instead of CRF: not used for finals by default)
export const remotionFlags = () => ["--concurrency=3", ...(process.env.GV_HWACCEL === "1" ? ["--hardware-acceleration=if-possible"] : [])];
