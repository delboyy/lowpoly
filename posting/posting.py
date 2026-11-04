#!/usr/bin/env python3
"""GoViral posting tool: creates draft / scheduled posts through Postiz Cloud and logs live URLs.

Dry-run by default. Nothing is sent unless --go is passed. The API key is never printed.
(An Upload-Post version is kept, inactive, in posting_uploadpost.py + config_uploadpost.json.)

  posting.py check                                   key works; which channel each brand/platform resolves to
  posting.py post <dir|mp4> --brand lineitem --mode draft [--go]
  posting.py post <dir|mp4> --brand lineitem --mode schedule --at 2026-10-23T17:00 [--go]
  posting.py kit  clips/whop/kits/<day> --mode schedule --at ... [--gap 90] [--go]   (Cut Desk day kit)
  posting.py carousel <dir> --brand lineitem --at 2026-11-01T08:00 [--go]   (IG carousel: 2-10 slides + caption.txt)
  posting.py approve <post_id|--all>                 move draft(s) to scheduled
  posting.py cancel  <post_id>                       delete a draft / scheduled post
  posting.py poll [--watch]                          fill post_url (releaseURL) in log.csv, print Whop lines
  posting.py status                                  show log.csv
"""
import argparse, csv, json, os, re, subprocess, sys, time
import urllib.request, urllib.error, urllib.parse
from datetime import datetime, timezone, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
CFG = json.loads((HERE / "config.json").read_text())
LOG = HERE / "log.csv"
FIELDS = ["logged_at_utc", "brand", "clip_id", "platform", "mode", "scheduled_for_utc", "request_id",
          "job_id", "status", "published_at_utc", "post_url", "post_id", "whop_submit_url", "error", "integration_id", "whop_submitted_utc", "variant", "caption_style"]
IG_IDS = ("instagram", "instagram-standalone")
TT_IDS = ("tiktok", "tiktok-business")


_MOMENTS = {}   # kit dir name -> moment_id (clipper/src/moment_id.py writes it into every kit's tags.json)
for _tj in (HERE.parent / "clips" / "whop" / "kits").glob("*/*/tags.json"):
    try: _m = json.loads(_tj.read_text()).get("moment_id")
    except Exception: _m = None
    if _m: _MOMENTS[_tj.parent.name] = _m


_KR = {}   # kit dir name -> (source key, start_s, end_s) from the Clipper's manifest (None if unknown)
def kit_range(kit_dir):
    """Source time range of a kit: tags.json `sub` ("clip3/clip_01", "clip4/h3f/clip_02") + `campaign` locate clips/whop/<campaign>/<folders>/manifest.json; the clip entry has start/end, source.slug names the source."""
    kd = Path(kit_dir); name = kd.name
    if name in _KR: return _KR[name]
    out = None
    try:   # preferred: the Clipper's backfilled fields (2026-10-24): source_file, start_s, end_s in every kit's tags.json
        t0 = json.loads((kd / "tags.json").read_text())
        if t0.get("source_file") and t0.get("start_s") is not None and t0.get("end_s") is not None:
            out = ((t0.get("campaign") or "").strip() + "|" + str(t0["source_file"]), float(t0["start_s"]), float(t0["end_s"]))
            _KR[name] = out; return out
    except Exception:
        pass
    try:
        t = json.loads((kd / "tags.json").read_text()); sub = t.get("sub") or ""; camp = (t.get("campaign") or "").strip()
        parts = [x for x in sub.split("/") if x]
        if len(parts) >= 2 and camp:
            cdir = HERE.parent / "clips" / "whop" / camp.replace("_", "-")
            clipfile = parts[-1] + ".mp4"; mf = cdir.joinpath(*parts[:-1]) / "manifest.json"
            m = json.loads(mf.read_text())
            for c in m.get("clips", []):
                if c.get("file") == clipfile and c.get("start") is not None and c.get("end") is not None:
                    src = (m.get("source") or {}).get("slug") or (m.get("source") or {}).get("title") or parts[0]
                    out = (camp + "|" + str(src), float(c["start"]), float(c["end"])); break
    except Exception:
        out = None
    _KR[name] = out
    return out


def range_conflict(kit_dir, brand, platforms, ignore_ids=(), statuses=("published", "published_no_url", "scheduled", "submitted", "deleted_by_nathan"), frac=0.30):
    """Audit 2026-10-24: block a kit whose source range overlaps a post already on the same brand+platform by more than 30% (the moment_id guard missed overlapping cuts of one source)."""
    mine = kit_range(kit_dir)
    if not mine: return None
    kits = {}
    for tj in (HERE.parent / "clips" / "whop" / "kits").glob("*/*/tags.json"): kits.setdefault(tj.parent.name, tj.parent)
    for r in load_log():
        if r["brand"] != brand or r["platform"] not in platforms or r["post_id"] in ignore_ids or r["status"] not in statuses or r["clip_id"] == Path(kit_dir).name: continue
        d = kits.get(r["clip_id"])
        other = kit_range(d) if d else None
        if not other or other[0] != mine[0]: continue
        ov = min(mine[2], other[2]) - max(mine[1], other[1])
        if ov > 2.0 or (ov > 0 and ov / max(0.1, min(mine[2] - mine[1], other[2] - other[1])) > frac):   # >2 s (the Clipper's kit.py rule) or >30% of the shorter range
            return f"{r['clip_id']} ({r['platform']}, {r['status']}) overlaps {ov:.0f}s of this kit's source range"
    return None


def _moment_id(kit_dir):
    try: return json.loads((Path(kit_dir) / "tags.json").read_text()).get("moment_id")
    except Exception: return None


ABS_MAX = {"tiktok": 5}   # hard ceiling, not overridable (audit 2026-10-22 #2)
try: LIMITS = json.loads((HERE.parent / "analytics" / "limits.json").read_text())   # Analyst-owned caps/gaps (PM 2026-10-22), clamped by ABS_MAX below
except Exception: LIMITS = {}


def dt_now_utc():
    return datetime.now(timezone.utc)


def api_key():
    k = os.environ.get(CFG["env_key"])
    envf = ROOT / ".env"
    if not k and envf.exists():
        for line in envf.read_text().splitlines():
            m = re.match(rf"\s*{CFG['env_key']}\s*=\s*(.*)", line)
            if m:
                k = m.group(1).strip().strip("'\"")
    if not k:
        sys.exit(f"{CFG['env_key']} is not set. Add it to {envf} (see TODO.md > Posting Ops).")
    return k


def api(method, path, params=None, body=None):
    url = CFG["api_base"] + path + ("?" + urllib.parse.urlencode(params) if params else "")
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={"Authorization": api_key(), "Content-Type": "application/json"})
    last = None
    for attempt in range(3):   # network errors (URLError, timeouts) are retried x3 with backoff (audit #7); HTTP errors are returned as-is
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                raw = r.read()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as e:
            return {"_error": True, "http_status": e.code, "body": e.read().decode()[:400]}
        except (urllib.error.URLError, TimeoutError, ConnectionError, OSError) as e:
            last = e
            time.sleep(2 * 3 ** attempt)   # 2s, 6s, 18s
    return {"_error": True, "http_status": 0, "body": f"network error after 3 tries: {last}"}


def upload_file(path):
    """multipart upload via curl; key passed through stdin config so it never shows in `ps`."""
    cmd = ["curl", "-sS", "-m", "900", "-K", "-", "-X", "POST", CFG["api_base"] + "/upload", "-F", f"file=@{path}"]
    p = subprocess.run(cmd, input=f'header = "Authorization: {api_key()}"\n', capture_output=True, text=True)
    try:
        return json.loads(p.stdout)
    except Exception:
        return {"_error": True, "body": (p.stdout or p.stderr)[:400]}


def read_text(p):
    return p.read_text().strip() if p and p.exists() else ""


def find_assets(path, args):
    p = Path(path)
    if p.is_file():
        video, folder = p, p.parent
    else:
        folder = p
        vids = sorted(folder.glob("*.mp4"))
        if not vids:
            sys.exit(f"no .mp4 in {folder}")
        video = vids[0]
    stem = p.with_suffix("") if p.is_file() else None
    cands_cap = ([Path(str(stem) + ".caption.txt")] if stem else []) + [folder / "caption.txt"]
    cap = Path(args.caption) if args.caption else next((c for c in cands_cap if c.exists()), cands_cap[-1])
    cands_src = ([Path(str(stem) + ".sources.txt")] if stem else []) + [folder / "sources.md", folder / "sources.txt", folder / "sources.json"]
    src = Path(args.sources) if args.sources else next((c for c in cands_src if c.exists()), None)
    whop_url = None
    steps = folder / "steps.txt"
    if steps.exists():
        m = re.search(r"Submit link here[^:]*:\s*(\S+)", steps.read_text())
        whop_url = m.group(1) if m else None
    # per-platform caption variants (CLASH / BILF kits): caption_tiktok.txt, caption_instagram.txt, caption_youtube.txt
    captions = {}
    for plat in ("tiktok", "instagram", "youtube"):
        cf = folder / f"caption_{plat}.txt"
        if cf.exists():
            t = "\n".join(l for l in read_text(cf).splitlines() if not l.strip().lower().startswith("(alt hook")).strip()
            if t:
                captions[plat] = t
    if not cap.exists():
        if captions:
            cap = folder / f"caption_{next(iter(captions))}.txt"
        else:
            sys.exit(f"caption file missing: {cap}")
    campaign, post_to = "", []
    if steps.exists():
        st = steps.read_text()
        m = re.match(r"Campaign:\s*(.+)", st)
        campaign = m.group(1).strip() if m else ""
        m = re.search(r"Post to:\s*(.+)", st)
        if m:
            low = m.group(1).lower()
            post_to = [x for x, k in (("tiktok", "tiktok"), ("instagram", "instagram"), ("youtube", "youtube")) if k in low]
    # drop internal notes such as "(alt hook: ...)" lines before anything is posted
    caption = "\n".join(l for l in read_text(cap).splitlines() if not l.strip().lower().startswith("(alt hook"))
    style = ""
    for cand in [folder / "caption_style.txt", folder / "tags.json", folder / "steps.txt", folder / "manifest.json", folder / "meta.json"]:
        if cand.exists():
            m = re.search(r'caption[_ ]style"?\s*[:=]\s*"?(C[0-9A-Za-z_-]*|[A-Za-z0-9_-]+)', cand.read_text(), re.I)
            if m:
                style = m.group(1)
                break
    if getattr(args, "caption_style", ""):
        style = args.caption_style
    return dict(video=video, caption_style=style, captions=captions, campaign=campaign, post_to=post_to, caption=caption.strip(), sources=read_text(src) if src else "",
                clip_id=video.stem if p.is_file() else folder.name, whop_url=whop_url)


def resolve_channels(brand, platforms, integrations):
    b = CFG["brands"][brand]
    out = {}
    for pl in platforms:
        want = IG_IDS if pl == "instagram" else TT_IDS if pl == "tiktok" else (pl,)
        if b["channel_ids"].get(pl):
            out[pl] = next((i for i in integrations if i["id"] == b["channel_ids"][pl]), None)
            if out[pl] is None:
                sys.exit(f"config channel id for {brand}/{pl} not found in Postiz")
            continue
        cands = [i for i in integrations if i.get("identifier") in want and not i.get("disabled")
                 and any(m in (i.get("name") or "").lower() for m in b["match"])]
        if len(cands) != 1:
            names = [f"{i.get('name')} ({i.get('identifier')}, {i['id']})" for i in integrations if i.get("identifier") in want]
            sys.exit(f"cannot resolve {brand}/{pl}: {len(cands)} matches. Channels of that type: {names}. "
                     f"Set brands.{brand}.channel_ids.{pl} in posting/config.json.")
        out[pl] = cands[0]
    return out


def parse_at(s, tzname):
    d = datetime.fromisoformat(s)
    return d if d.tzinfo else d.replace(tzinfo=ZoneInfo(tzname))


def load_log():
    if not LOG.exists():
        return []
    with LOG.open() as fh:
        return list(csv.DictReader(fh))


def backup_log():
    """copy log.csv to posting/backups/log-YYYYMMDD-HHMM.csv (keep the last 50)"""
    import shutil
    if not LOG.exists() or LOG.stat().st_size < 300:
        return
    d = HERE / "backups"
    d.mkdir(exist_ok=True)
    shutil.copy2(LOG, d / f"log-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M')}.csv")
    for old in sorted(d.glob("log-*.csv"))[:-50]:
        old.unlink()


def save_log(rows):
    """atomic write: log.csv.tmp, then os.replace over log.csv; a failed write can never empty the log"""
    tmp = LOG.with_suffix(".csv.tmp")
    with tmp.open("w", newline="") as fh:
        w = csv.DictWriter(fh, FIELDS, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    os.replace(tmp, LOG)


def now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def trunc(s, n):
    """cut at a ' | ' boundary when possible so titles never end mid-phrase"""
    if len(s) <= n:
        return s
    parts, out = s.split(" | "), ""
    for part in parts:
        cand = part if not out else out + " | " + part
        if len(cand) > n:
            break
        out = cand
    return out or s[: n - 1].rstrip() + "…"


def post_entry(pl, integ, a, image, args):
    cap = a.get("captions", {}).get(pl) or a["caption"]
    first = cap.splitlines()[0].strip()
    if pl == "youtube":
        content = cap + (("\n\nSources:\n" + a["sources"]) if a["sources"] else "")
        settings = {"__type": "youtube", "title": trunc(first, 100), "type": args.youtube_visibility or CFG["youtube"]["visibility"],
                    "selfDeclaredMadeForKids": CFG["youtube"]["selfDeclaredMadeForKids"], "thumbnail": None, "tags": []}
    elif pl == "tiktok":
        t = CFG["tiktok"]
        content = cap
        settings = {"__type": integ["identifier"] if integ["identifier"] in TT_IDS else "tiktok", "title": trunc(first, 90), "privacy_level": t["privacy_level"], "duet": False,
                    "stitch": False, "comment": True, "autoAddMusic": "no", "brand_content_toggle": "bilf" in (a.get("campaign") or "").lower(),  # BILF: paid-partnership toggle on every post
                    "brand_organic_toggle": False, "video_made_with_ai": bool(CFG["brands"][args.brand].get("ai_label", t["video_made_with_ai"])),
                    "content_posting_method": t["content_posting_method"]}
    else:
        content = cap
        settings = {"__type": integ["identifier"], "post_type": "post", "is_trial_reel": False, "collaborators": []}
    return {"integration": {"id": integ["id"]}, "value": [{"content": content, "image": image}], "settings": settings}


def do_post(path, args, a=None):
    brand = args.brand
    b = CFG["brands"][brand]
    a = a or find_assets(path, args)
    if args.platforms == "auto":
        platforms = a.get("post_to") or b["platforms"]
    else:
        platforms = args.platforms.split(",") if args.platforms else b["platforms"]
    if args.mode == "draft":
        at = datetime.now(timezone.utc) + timedelta(days=1)
    elif args.mode == "schedule":
        if not args.at:
            sys.exit("--mode schedule needs --at (e.g. 2026-10-22T18:00, in the brand's timezone unless you add an offset)")
        at = parse_at(args.at, b["timezone"])
        if at <= datetime.now(timezone.utc) + timedelta(minutes=10):
            sys.exit("--at must be at least 10 minutes in the future")
    else:
        at = datetime.now(timezone.utc)
    size = a["video"].stat().st_size / 1e6
    print(f"[{brand}] {a['clip_id']}  {a['video'].name} ({size:.1f} MB)  mode={args.mode}  platforms={','.join(platforms)}"
          + (f"  at={at.isoformat()}" if args.mode == "schedule" else ""))
    # RULES.md enforcement (Cut Desk, anything that will actually be sent): caption quality + posting window, no override
    if brand == "cutdesk" and args.mode != "draft":
        def refuse(why):
            print(f"    REFUSED: {why}")
            with (HERE / "refused.log").open("a") as fh:
                fh.write(f"{now()}\t{a['clip_id']}\t{','.join(platforms)}\t{why}\n")
        key = (a.get("campaign") or "") + " " + a["clip_id"] + " " + str(path)
        key = key.lower()
        allowed = set()
        for k, v in (("love-is-blind", {"#loveisblind"}), ("2-bears", {"#2bearsweekly"}), ("bilf", {"#bilfpodpartner"}), ("demi", {"#ad"}), ("kaepernick", {"#ad"}), ("digger", {"#diggerpartner"})):
            if k in key:
                allowed = v
        if not (a.get("caption_style") or "").strip():
            return refuse("no caption_style in the kit manifest (tags.json) - Moment Scout must set it")
        for pl in platforms:
            tags = {t.lower() for t in re.findall(r"#\w+", a.get("captions", {}).get(pl) or a["caption"])}
            extra = tags - allowed
            try: _ab_ok = json.loads((Path(path) / "tags.json").read_text()).get("hashtags") is True   # 1-week hashtag A/B (RULES 1/34, PM 2026-10-25, until 2 Nov): only kits flagged hashtags:true
            except Exception: _ab_ok = False
            if extra and _ab_ok and len(extra) <= 3 and dt_now_utc() < datetime(2026, 11, 3, tzinfo=timezone.utc):
                a["ab_tags"] = True   # logged as variant suffix '+tags' for the Analyst
            elif extra:
                return refuse(f"caption has hashtags the campaign does not require on {pl}: {sorted(extra)}")
        if args.mode == "schedule":
            loc = at.astimezone(ZoneInfo("America/New_York"))
            if not (6 <= loc.hour < 21 or (loc.hour == 21 and loc.minute == 0)):
                return refuse(f"outside the posting window 06:00-21:00 US Eastern ({loc.strftime('%H:%M')} ET)")
    # platform pause (PM 2026-10-22): no new non-draft posts on a paused platform for the brand
    _pp = (CFG.get("paused_platforms") or {}).get(brand, [])
    if args.mode != "draft" and any(pl in _pp for pl in platforms) and not getattr(args, "allow_paused", False):
        print(f"    BLOCKED: {[pl for pl in platforms if pl in _pp]} is PAUSED for {brand} (config paused_platforms).")
        return
    if args.mode != "draft" and brand == "cutdesk":
        _why = range_conflict(Path(path), brand, platforms, set((getattr(args, "gap_ignore", "") or "").split(",")))
        if _why:
            print(f"    BLOCKED: source-range overlap >30% on the same account: {_why}.")
            with (HERE / "refused.log").open("a") as fh: fh.write(f"{now()}\t{Path(path).name}\t{','.join(platforms)}\trange overlap {_why}\n")
            return
    # moment_id guard (audit #3): the same moment (standard, remix or re-render share a moment_id) never goes on the same brand+platform twice,
    # whatever the log status (incl. deleted_by_nathan). No --allow-duplicate for this check; the old post of a swap is ignored via --gap-ignore.
    if args.mode != "draft" and brand == "cutdesk":
        mid = _moment_id(Path(path))
        if mid:
            _ign2 = set((getattr(args, "gap_ignore", "") or "").split(","))
            hit = [r for r in load_log() if r["brand"] == brand and r["platform"] in platforms and r["post_id"] not in _ign2
                   and r["status"] in ("published", "published_no_url", "scheduled", "submitted", "deleted_by_nathan")
                   and r["clip_id"] != Path(path).name and _MOMENTS.get(r["clip_id"]) == mid]
            hit += [r for r in load_log() if r["brand"] == brand and r["platform"] in platforms and r["post_id"] not in _ign2
                    and r["status"] in ("published", "published_no_url", "scheduled", "submitted", "deleted_by_nathan") and r["clip_id"] == Path(path).name]
            if hit:
                print(f"    BLOCKED: moment_id {mid} already on {hit[0]['platform']} ({hit[0]['clip_id']}, {hit[0]['status']}): same moment never twice on one account.")
                with (HERE / "refused.log").open("a") as fh: fh.write(f"{now()}\t{Path(path).name}\t{','.join(platforms)}\tmoment_id {mid} already on {hit[0]['platform']}\n")
                return
    # posting bar (RULES 8, Auditor 2026-10-25: kit 167 posted at fame+surprise 2 < 4): hard refuse any Cut Desk kit whose tags.json fame+surprise is below analytics/bar.json min_score, or missing
    if args.mode != "draft" and brand == "cutdesk":
        try: _min = float(json.loads((HERE.parent / "analytics" / "bar.json").read_text())["min_score"])
        except Exception: _min = None
        if _min is not None:
            try:
                _t = json.loads((Path(path) / "tags.json").read_text()); _sc = _t.get("scores") or _t
                _tot = float(_sc["fame"]) + float(_sc["surprise"])
            except Exception: _tot = None
            if _tot is None or _tot < _min:
                _why = "fame/surprise missing in tags.json" if _tot is None else f"fame+surprise {_tot:g} < bar {_min:g}"
                print(f"    REFUSED: below the posting bar ({_why}).")
                with (HERE / "refused.log").open("a") as fh: fh.write(f"{now()}\t{Path(path).name}\t{','.join(platforms)}\tbar: {_why}\n")
                return
    # unique-description guard (PM 2026-10-24): each Cut Desk post needs one fresh sentence from the kit caption plus only campaign-required text
    if args.mode != "draft" and brand == "cutdesk":
        _body = re.sub(r"https?://\S+|[#@]\w+", " ", a["caption"].split("|")[0])
        _body = re.sub(r"(?i)2 bears 1 cave ep\. ?\d+|the podcast name is.*", " ", _body)
        if len(_body.split()) < 5:
            print("    REFUSED: caption has no fresh sentence (needs one unique sentence from the kit caption plus only the required text).")
            return
    # duplicate guard: never post the same caption twice on a brand (re-cuts of live clips must not go up again)
    first_line = a["caption"].splitlines()[0].strip()[:80]
    dup = [r for r in load_log() if r["brand"] == brand and r["request_id"] == first_line
           and r["status"] in ("published", "published_no_url", "scheduled", "submitted")
           and r["platform"] in platforms]
    if dup and not getattr(args, "allow_duplicate", False):
        print(f"    BLOCKED: already {dup[0]['status']} for this caption ({dup[0]['clip_id']}, {dup[0]['platform']}). Use --allow-duplicate only if the user said so.")
        return
    # YouTube throttle guard (new channel): daily cap and minimum gap between Shorts
    lim = CFG.get("youtube_limits", {}).get(brand)
    if lim and "youtube" in platforms and args.mode != "draft" and not getattr(args, "override_yt_cap", False):
        when = at.astimezone(timezone.utc)
        yt = []
        _ign = set((getattr(args, "gap_ignore", "") or "").split(","))
        for r in load_log():
            if r["brand"] == brand and r["platform"] == "youtube" and r["status"] in ("published", "scheduled", "submitted", "deleted_by_nathan") and r["post_id"] not in _ign:
                t = r["published_at_utc"] or r["scheduled_for_utc"]
                try:
                    yt.append(datetime.fromisoformat(t.replace("Z", "+00:00")))
                except Exception:
                    pass
        _all = sorted(yt + [when])
        same_day = [t for t in yt if when - timedelta(hours=24) < t <= when]   # rolling 24h (Analyst 2026-10-21), not calendar day
        if max(sum(1 for u in _all if st <= u < st + timedelta(hours=24)) for st in _all if st <= when < st + timedelta(hours=24)) > lim["max_per_day"]:
            same_day = same_day + [None] * lim["max_per_day"]   # two-sided window over the cap (audit #2)
        too_close = [t for t in yt if abs((t - when).total_seconds()) < lim["min_gap_minutes"] * 60]
        if len(same_day) >= lim["max_per_day"] or too_close:
            print(f"    BLOCKED (YouTube limit for {brand}: max {lim['max_per_day']}/day, >= {lim['min_gap_minutes']} min apart; "
                  f"{len(same_day)} already that UTC day, {len(too_close)} within the gap). Use --override-yt-cap only if the PM said so.")
            return
    # Spacing guard (hard rule, no override): >= min_gap between posts on the same brand+platform, daily caps
    sp = CFG.get("spacing")
    if sp and args.mode != "draft":
        when = at.astimezone(timezone.utc)
        ign = set((getattr(args, "gap_ignore", "") or "").split(","))
        for pl in platforms:
            ts = []
            for r in load_log():
                if r["brand"] == brand and r["platform"] == pl and r["status"] in ("published", "scheduled", "submitted", "deleted_by_nathan") and r["post_id"] not in ign:
                    t = r["published_at_utc"] or r["scheduled_for_utc"]
                    try:
                        ts.append(datetime.fromisoformat(t.replace("Z", "+00:00")))
                    except Exception:
                        pass
            gap = (LIMITS.get(pl) or {}).get("gap_min") or sp.get("min_gap_by_platform", {}).get(pl, sp["min_gap_minutes"])
            pu = (sp.get("pause_until") or {}).get(pl)
            if pu and when < datetime.fromisoformat(pu.replace("Z", "+00:00")):
                print(f"    BLOCKED ({brand}/{pl} paused until {pu} per cadence playbook).")
                return
            close = [t for t in ts if abs((t - when).total_seconds()) < gap * 60]
            cap = min((LIMITS.get(pl) or {}).get("max") or sp["max_per_day"].get(pl, 99), ABS_MAX.get(pl, 99))   # ABS_MAX cannot be raised by config
            # two-sided rolling 24h (audit #2): for every window [t, t+24h) that starts at an existing post or at the new one and contains
            # the new post, the count including the new post must not exceed the cap (every dead TikTok was the 7th+ post of a rolling 24h)
            allt = sorted(ts + [when])
            worst = max(sum(1 for u in allt if st <= u < st + timedelta(hours=24)) for st in allt if st <= when < st + timedelta(hours=24))
            if close or worst > cap:
                print(f"    BLOCKED (spacing rule {brand}/{pl}: ≥ {gap} min apart, max {cap}/24h two-sided; {len(close)} within the gap, a 24h window would hold {worst}).")
                return
    if not args.go:
        for pl in platforms:
            e = post_entry(pl, {"id": "<channel id>", "identifier": "instagram" if pl == "instagram" else pl}, a,
                           [{"id": "<upload id>", "path": "<upload path>"}], args)
            print(f"    {pl}: settings={json.dumps(e['settings'])[:230]}")
            print(f"        content={e['value'][0]['content'][:110]!r}")
        print("    DRY RUN: nothing sent (not even a channel lookup). Add --go to send.")
        return
    integrations = api("GET", "/integrations")
    if isinstance(integrations, dict):
        sys.exit(f"integrations lookup failed: {integrations}")
    chans = resolve_channels(brand, platforms, integrations)
    up = upload_file(a["video"])
    if up.get("_error") or "id" not in up:
        sys.exit(f"upload failed: {up}")
    image = [{"id": up["id"], "path": up["path"]}]
    body = {"type": args.mode, "date": at.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "shortLink": False, "tags": [],
            "posts": [post_entry(pl, chans[pl], a, image, args) for pl in platforms]}
    res = api("POST", "/posts", body=body)
    ok = isinstance(res, list)
    by_integ = {r.get("integration"): r.get("postId") for r in res} if ok else {}
    import fcntl
    _lk = open(HERE / ".log.lock", "w")
    fcntl.flock(_lk, fcntl.LOCK_EX)
    rows = load_log()
    status = {"draft": "draft", "schedule": "scheduled", "now": "submitted"}[args.mode]
    for pl in platforms:
        cid = chans[pl]["id"]
        rows.append(dict(logged_at_utc=now(), brand=brand, clip_id=a["clip_id"], platform=pl, mode=args.mode,
                         scheduled_for_utc=at.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ") if args.mode != "draft" else "",
                         request_id=a["caption"].splitlines()[0].strip()[:80], job_id="", status=status if ok else "error", published_at_utc="", post_url="",
                         post_id=by_integ.get(cid, ""), whop_submit_url=a["whop_url"] or "", variant=(getattr(args, "variant", "") or (("remix-" + re.search(r"_remix([A-Z])?", str(a["clip_id"])).group(1) if re.search(r"_remix[A-Z]_", str(a["clip_id"])) else "remix") if "_remix" in str(a["clip_id"]) else "standard"))+("+tags" if a.get("ab_tags") else ""), caption_style=a.get("caption_style", ""),
                         error="" if ok else json.dumps(res)[:300], integration_id=cid))
    save_log(rows)
    _lk.close()
    print("    ->", ("OK " + json.dumps(res)[:200]) if ok else "FAILED " + json.dumps(res)[:300])


def cmd_carousel(args):
    """Instagram carousel (Lowpoly 2026-10-30): <dir> holds 2-10 slides (01.png, 02.png ... sorted by name; png/jpg) + caption.txt.
    Slides are converted to JPEG (Instagram API takes JPEG only). Dry-run unless --go. Same IG spacing rule as videos."""
    d = Path(args.dir)
    slides = sorted([f for f in d.iterdir() if f.suffix.lower() in (".png", ".jpg", ".jpeg") and not f.name.startswith(".")])
    if not 2 <= len(slides) <= 10:
        sys.exit(f"carousel needs 2-10 slides, found {len(slides)} in {d}")
    cap = Path(args.caption) if args.caption else d / "caption.txt"
    if not cap.exists():
        sys.exit(f"caption file missing: {cap}")
    caption = read_text(cap)
    at = parse_at(args.at, CFG["brands"][args.brand]["timezone"])
    when = at.astimezone(timezone.utc)
    print(f"[{args.brand}] carousel {d.name}: {len(slides)} slides  at={when.isoformat()}")
    # spacing: >= instagram gap from any other IG post of this brand (videos included)
    gap = (LIMITS.get("instagram") or {}).get("gap_min") or CFG["spacing"]["min_gap_by_platform"]["instagram"]
    for r in load_log():
        if r["brand"] == args.brand and r["platform"] == "instagram" and r["status"] in ("published", "scheduled", "submitted"):
            t = r["published_at_utc"] or r["scheduled_for_utc"]
            try:
                t = datetime.fromisoformat(t.replace("Z", "+00:00"))
            except Exception:
                continue
            if abs((t - when).total_seconds()) < gap * 60:
                sys.exit(f"    BLOCKED: {r['clip_id']} is within {gap} min ({t.isoformat()})")
            if r["clip_id"] == d.name:
                sys.exit(f"    BLOCKED: {d.name} already {r['status']} ({r['post_id']})")
    print(f"    caption={caption[:110]!r}")
    if not args.go:
        print("    DRY RUN: nothing sent. Add --go to send.")
        return
    import tempfile
    tmp = Path(tempfile.mkdtemp(prefix="carousel-"))
    image = []
    for f in slides:
        j = tmp / (f.stem + ".jpg")
        subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "92", str(f), "--out", str(j)], capture_output=True)
        up = upload_file(j)
        if up.get("_error") or "id" not in up:
            sys.exit(f"upload failed for {f.name}: {up}")
        image.append({"id": up["id"], "path": up["path"]})
    integrations = api("GET", "/integrations")
    chans = resolve_channels(args.brand, ["instagram"], integrations)
    ig = chans["instagram"]
    body = {"type": "schedule", "date": when.strftime("%Y-%m-%dT%H:%M:%S.000Z"), "shortLink": False, "tags": [],
            "posts": [{"integration": {"id": ig["id"]}, "value": [{"content": caption, "image": image}],
                       "settings": {"__type": ig["identifier"], "post_type": "post", "is_trial_reel": False, "collaborators": []}}]}
    res = api("POST", "/posts", body=body)
    ok = isinstance(res, list)
    import fcntl
    _lk = open(HERE / ".log.lock", "w")
    fcntl.flock(_lk, fcntl.LOCK_EX)
    rows = load_log()
    rows.append(dict(logged_at_utc=now(), brand=args.brand, clip_id=d.name, platform="instagram", mode="schedule",
                     scheduled_for_utc=when.strftime("%Y-%m-%dT%H:%M:%SZ"), request_id=caption.splitlines()[0][:80], job_id="",
                     status="scheduled" if ok else "error", published_at_utc="", post_url="", post_id=res[0].get("postId", "") if ok and res else "",
                     whop_submit_url="", variant="carousel" + (":" + args.variant if args.variant else ""), caption_style="", error="" if ok else json.dumps(res)[:300], integration_id=ig["id"]))
    save_log(rows)
    _lk.close()
    print("    ->", ("OK " + json.dumps(res)[:200]) if ok else "FAILED " + json.dumps(res)[:300])


def cmd_kit(args):
    kit = Path(args.dir)
    clips = sorted(d for d in kit.iterdir() if d.is_dir() and (d / "clip.mp4").exists())
    if not clips:
        sys.exit(f"no clip folders in {kit}")
    args.brand = "cutdesk"
    base = parse_at(args.at, CFG["brands"]["cutdesk"]["timezone"]) if args.mode == "schedule" and args.at else None
    for i, c in enumerate(clips):
        if base is not None:
            args.at = (base + timedelta(minutes=args.gap * i)).isoformat()
        do_post(c, args, find_assets(c, args))


def tiktok_video_urls(profile_url, n=40):
    """Latest videos on a TikTok profile via yt-dlp (Postiz only returns the profile URL)."""
    p = subprocess.run(["yt-dlp", "--flat-playlist", "--playlist-end", str(n), "-J", profile_url], capture_output=True, text=True)
    try:
        return json.loads(p.stdout[p.stdout.index("{"):]).get("entries", [])
    except Exception:
        return []


def fill_tiktok_urls(rows):
    """Match published_no_url TikTok rows to the profile's latest videos by caption title + time."""
    cache = {}
    for r in rows:
        if r["status"] != "published_no_url" or r["platform"] != "tiktok":
            continue
        prof = CFG["tiktok_profiles"].get(r["brand"])
        if not prof:
            continue
        pub = datetime.fromisoformat(r["published_at_utc"].replace("Z", "+00:00")).timestamp()
        want = r["request_id"][:40].lower()  # request_id column holds the caption first line (used only for matching)
        best = None
        if prof not in cache:
            cache[prof] = tiktok_video_urls(prof) or tiktok_video_urls(prof)  # yt-dlp on TikTok is flaky: retry once
        for e in cache[prof]:
            if want and want not in (e.get("title") or "").lower():
                continue
            ts = e.get("timestamp") or 0
            if abs(ts - pub) < 900 and (best is None or abs(ts - pub) < abs(best[0] - pub)):
                best = (ts, e.get("url"))
        if best:
            r.update(status="published", post_url=best[1], error="")


def cmd_poll(args):
    import fcntl
    seen = {r["post_url"] for r in load_log() if r["status"] == "published"}
    while True:
        lockf = open(HERE / ".log.lock", "w")
        fcntl.flock(lockf, fcntl.LOCK_EX)  # one poll at a time (the hourly LaunchAgent and a session never overlap)
        rows = load_log()
        before = [r["status"] for r in rows]
        fill_tiktok_urls(rows)
        if before != [r["status"] for r in rows]:
            save_log(rows)
        open_rows = [r for r in rows if r["status"] in ("submitted", "scheduled") and not r["post_url"]]
        if open_rows:
            starts = [r["logged_at_utc"] for r in open_rows]
            start = (datetime.fromisoformat(min(starts).replace("Z", "+00:00")) - timedelta(days=1)).strftime("%Y-%m-%dT00:00:00.000Z")
            end = (datetime.now(timezone.utc) + timedelta(days=30)).strftime("%Y-%m-%dT23:59:59.000Z")
            res = api("GET", "/posts", {"startDate": start, "endDate": end})  # ONE request per poll: cloud API is rate limited
            posts = res.get("posts", []) if isinstance(res, dict) else []
            if isinstance(res, dict) and res.get("_error"):
                print("poll failed:", res)
            byid = {p["id"]: p for p in posts}
            for r in open_rows:
                p = byid.get(r["post_id"])
                if not p:
                    continue
                if p.get("state") == "PUBLISHED" and r["platform"] == "tiktok" and "/video/" not in (p.get("releaseURL") or ""):
                    # Postiz returns only the profile URL for TikTok (no video id): Whop needs the video link
                    r.update(status="published_no_url",
                             published_at_utc=p.get("publishDate") or now(),
                             error="TikTok gave the profile URL only; copy the video link from the TikTok app and put it in post_url")
                elif p.get("state") == "PUBLISHED" and p.get("releaseURL"):
                    r.update(status="published", post_url=p["releaseURL"], published_at_utc=p.get("publishDate") or now())
                elif p.get("state") == "ERROR":
                    r.update(status="error", error=(p.get("error") or "")[:300])
            save_log(rows)
        lockf.close()  # release the log lock before printing / sleeping
        for r in rows:
            if r["status"] == "published" and r["whop_submit_url"]:
                pub = datetime.fromisoformat(r["published_at_utc"].replace("Z", "+00:00"))
                deadline = pub + timedelta(minutes=CFG["whop_deadline_minutes"])
                left = (deadline - datetime.now(timezone.utc)).total_seconds() / 60
                if left < -120:
                    continue
                print(f"WHOP SUBMIT  {r['clip_id']}  {r['platform']}  {r['post_url']}\n"
                      f"             paste at {r['whop_submit_url']}  (deadline {deadline.strftime('%H:%M')} UTC, {left:.0f} min left)")
        for r in rows:
            if r["status"] == "published_no_url":
                print(f"NEEDS MANUAL URL  {r['clip_id']}  {r['platform']}: open the TikTok app, copy the video link, paste it into Whop")
        pending = [r for r in rows if r["status"] in ("submitted", "scheduled") and not r["post_url"]]
        if args.until_new and any(r["status"] == "published" and r["post_url"] and r["whop_submit_url"]
                                  and r["post_url"] not in seen for r in rows):
            break
        if not args.watch or not pending:
            break
        print(f"... {len(pending)} pending; next check in {CFG['poll_interval_seconds']}s")
        time.sleep(CFG["poll_interval_seconds"])


def cmd_approve(args):
    rows = load_log()
    targets = [r for r in rows if r["status"] == "draft" and r["post_id"] and (args.all or r["post_id"] == args.post_id)]
    for r in targets:
        res = api("PUT", f"/posts/{r['post_id']}/status", body={"status": "schedule"})
        ok = not (isinstance(res, dict) and res.get("_error"))
        print(r["clip_id"], r["platform"], "scheduled" if ok else f"FAILED {res}")
        if ok:
            r["status"] = "scheduled"
            if not r["scheduled_for_utc"]:
                r["scheduled_for_utc"] = "(see Postiz calendar)"
    save_log(rows)
    if not targets:
        print("no matching drafts in log.csv")


def cmd_swap(args, ap):
    """swap <old_post_id> <new_kit> <platform> <time>: dry-run every guard with the OLD post ignored, create the new post,
    confirm it exists in Postiz, and ONLY THEN delete the old one. Never delete a scheduled post by hand."""
    import io, contextlib
    old = next((r for r in load_log() if r["post_id"] == args.old_id), None)
    if not old or old["status"] != "scheduled":
        sys.exit(f"swap: {args.old_id} is not a scheduled post in log.csv; nothing done.")
    kit = args.new_kit.rstrip("/")
    base = ["post", kit, "--brand", old["brand"], "--mode", "schedule", "--at", args.at, "--platforms", args.platform, "--gap-ignore", args.old_id]
    if args.allow_duplicate: base.append("--allow-duplicate")
    def run(extra):
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            try: do_post(kit, ap.parse_args(base + extra))
            except SystemExit as e: buf.write(f"EXIT {e}\n")
        return buf.getvalue()
    out = run([])
    if "DRY RUN" not in out or "BLOCKED" in out or "REFUS" in out or "EXIT" in out:
        print("swap: DRY RUN FAILED, old post untouched:\n" + out[-600:]); sys.exit(2)
    _mark_dryrun_ok(args.old_id)
    if getattr(args, "dry_run", False):
        print(f"swap: dry run passes for {args.platform} {args.at}; marker written (cancel of {args.old_id} allowed for 10 min). Nothing changed."); return
    print(f"swap: dry run passes for {args.platform} {args.at}; creating the new post first")
    before = {r["post_id"] for r in load_log()}
    out = run(["--go"])
    if "-> OK" not in out:
        print("swap: CREATE FAILED, old post untouched:\n" + out[-600:]); sys.exit(3)
    new = [r for r in load_log() if r["post_id"] and r["post_id"] not in before and r["platform"] == args.platform and r["status"] == "scheduled"]
    if not new:
        print("swap: new post not found in log.csv; old post left in place, check by hand."); sys.exit(4)
    nid = new[-1]["post_id"]
    x = api("GET", "/posts", {"startDate": (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%dT00:00:00.000Z"),
                              "endDate": (datetime.now(timezone.utc) + timedelta(days=30)).strftime("%Y-%m-%dT00:00:00.000Z")})
    if not isinstance(x, dict) or not any(q.get("id") == nid and q.get("state") in ("QUEUE", "PUBLISHED") for q in x.get("posts", [])):
        print(f"swap: new post {nid} NOT confirmed in Postiz; old post left in place."); sys.exit(5)
    print(f"swap: new post {nid} confirmed in Postiz; deleting old {args.old_id}")
    cmd_cancel(argparse.Namespace(post_id=args.old_id, _via_swap=True))


DRYRUN_OK = HERE / ".dryrun_ok"   # {post_id: epoch}: written when a swap/topup dry-run for that slot passed (audit #6)


def _mark_dryrun_ok(post_id):
    try: d = json.loads(DRYRUN_OK.read_text())
    except Exception: d = {}
    now_ = time.time(); d = {k: v for k, v in d.items() if now_ - v < 3600}; d[post_id] = now_
    DRYRUN_OK.write_text(json.dumps(d))


def _dryrun_ok(post_id, within=600):
    try: return time.time() - json.loads(DRYRUN_OK.read_text()).get(post_id, 0) <= within
    except Exception: return False


def cmd_cancel(args):
    row = next((r for r in load_log() if r["post_id"] == args.post_id), None)
    if row and row["status"] == "scheduled" and row["brand"] == "cutdesk" and not getattr(args, "_via_swap", False) and not getattr(args, "leave_empty", False) and not _dryrun_ok(args.post_id) and row["platform"] not in (CFG.get("paused_platforms") or {}).get("cutdesk", []):   # Line Item slots do not share Cut Desk caps: dropping them leaves a different account's slot empty
        sys.exit(f"cancel REFUSED: {args.post_id} is a scheduled post and no passing swap/topup dry-run for its slot in the last 10 min. "
                 f"Run `swap {args.post_id} <kit> <platform> <time> --dry-run` or `topup.py --replace={args.post_id}` first.")
    if row and row["status"] in ("published", "published_no_url", "deleted_by_nathan"):
        sys.exit(f"cancel REFUSED: {args.post_id} is {row['status']} (already live); never delete a live post through this tool.")
    res = api("DELETE", f"/posts/{args.post_id}")
    print(res)
    if isinstance(res, dict) and res.get("_error"):
        sys.exit(f"cancel FAILED (Postiz error); log.csv left unchanged: {str(res)[:200]}")
    import fcntl
    _lk = open(HERE / ".log.lock", "w"); fcntl.flock(_lk, fcntl.LOCK_EX)   # hold the log lock across load+save: a concurrent topup/poll write used to overwrite this status (stale 'scheduled' rows)
    rows = load_log()
    for x in rows:
        if x["post_id"] == args.post_id:
            x["status"] = "cancelled"
    save_log(rows)


def cmd_newkits(args):
    """list cleared kit clips whose caption has never been posted/scheduled (STALE / PENDING_QA folders skipped);
    with --wait, poll every 60 s until something new appears (use as a background wake-up)"""
    kits = ROOT / "clips" / "whop" / "kits"
    hf = HERE / "holds.txt"
    while True:
        held = {l.split("#")[0].strip() for l in hf.read_text().splitlines()} if hf.exists() else set()
        seen = {r["request_id"] for r in load_log() if r["status"] in ("published", "published_no_url", "scheduled", "submitted", "draft")}
        new = []
        for d in sorted(kits.glob("*/*")):
            if d.name in held or not (d / "clip.mp4").exists() or any(d.glob("STALE*")) or any(d.glob("PENDING*")) or any(d.parent.glob("STALE*")):
                continue
            cap = d / "caption.txt"
            lines = [l for l in read_text(cap).splitlines() if not l.strip().lower().startswith("(alt hook")]
            if not lines:
                continue
            if lines[0].strip()[:80] not in seen:
                new.append(d)
        if new or not args.wait:
            for d in new:
                print("NEW KIT:", d.relative_to(ROOT))
            if not new:
                print("no new cleared kits")
            return
        time.sleep(60)


def cmd_bilfguard(args):
    """BILF safety net: never let a BILF post with the old big 'BILF Podcast' box publish.
    For every queued BILF post within the next 30 min: if a v2 kit (same source + clip number) exists, recreate the post
    from the v2 file at the same slot and delete the old one; if not, push it back 150 min. Acts only on posts created
    from a non-v2 kit. With --wait it loops every 3 minutes and exits after it has acted (so a session gets woken)."""
    import fcntl
    pat = re.compile(r"bilf-podcast_([A-Za-z0-9_-]{11})_(?:v[0-9]+_)?clip_(\d+)")
    while True:
        acted = []
        v2 = {}
        for d in sorted((ROOT / "clips/whop/kits").glob("*/*bilf-podcast*_v[0-9]*_*")):
            if d.is_dir() and (d / "clip.mp4").exists() and not any(d.glob("STALE*")) and not any(d.glob("PENDING*")):
                m = pat.search(d.name)
                if m:
                    v2[(m.group(1), m.group(2))] = d
        v1 = {}
        for d in (ROOT / "clips/whop/kits").glob("*/*bilf-podcast*"):
            if d.is_dir() and not re.search(r"_v[0-9]+_", d.name) and (d / "clip.mp4").exists():
                m = pat.search(d.name)
                if m:
                    v1[(m.group(1), m.group(2))] = d
        now_ = datetime.now(timezone.utc)
        res = api("GET", "/posts", {"startDate": now_.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                                    "endDate": (now_ + timedelta(minutes=30)).strftime("%Y-%m-%dT%H:%M:%S.000Z")})
        posts = res.get("posts", []) if isinstance(res, dict) else []
        log = load_log()
        by_pid = {r["post_id"]: r for r in log if r["post_id"]}
        groups = {}
        for q in posts:
            if q["state"] != "QUEUE" or not q["integration"]["name"].lower().startswith("cut") or "bilfpod" not in q["content"].lower():
                continue
            lr = by_pid.get(q["id"], {})
            if re.search(r"_v[0-9]+_", lr.get("clip_id", "")):
                continue  # already a v2/v3 render
            m = pat.search(lr.get("clip_id", ""))
            if not m:
                continue
            groups.setdefault((m.group(1), m.group(2), q["publishDate"]), []).append(q)
        for (src, num, when), qs in groups.items():
            plat = sorted({("tiktok" if q["integration"]["providerIdentifier"].startswith("tiktok") else
                            "instagram" if q["integration"]["providerIdentifier"].startswith("instagram") else "youtube") for q in qs})
            kit = v2.get((src, num)) or v1.get((src, num))
            at = datetime.fromisoformat(when.replace("Z", "+00:00"))
            new_at = at if (src, num) in v2 else at + timedelta(minutes=150)
            if kit is None:
                continue
            ns = argparse.Namespace(brand="cutdesk", mode="schedule", at=new_at.isoformat(), platforms=",".join(plat), caption=None, sources=None,
                                    request_id=None, go=True, allow_duplicate=True, override_yt_cap=True, variant=("v3" if v2.get((src, num)) and "_v3_" in v2[(src, num)].name else "v2") if (src, num) in v2 else "", caption_style="")
            lk = open(HERE / ".log.lock", "w")  # do_post takes the same lock itself; release ours first
            lk.close()
            old_ids = [q["id"] for q in qs]
            import io, contextlib
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                do_post(kit, ns)
            if "-> OK" in buf.getvalue():
                for pid in old_ids:
                    api("DELETE", f"/posts/{pid}")
                rows = load_log()
                for r in rows:
                    if r["post_id"] in old_ids:
                        r["status"] = "cancelled"
                        r["error"] = "BILF guard: " + ("swapped to v2" if (src, num) in v2 else "pushed back 150 min (no approved v2)")
                save_log(rows)
                acted.append(f"BILF {src} clip_{num}: {'swapped to v2 at ' if (src, num) in v2 else 'pushed back 150 min to '}{new_at.strftime('%H:%M')} UTC [{','.join(plat)}]")
            else:
                acted.append(f"BILF {src} clip_{num}: guard FAILED: {buf.getvalue()[-160:]}")
        for a in acted:
            print(a, flush=True)
        if acted or not args.wait:
            if not acted:
                print("bilfguard: nothing to do")
            return
        time.sleep(180)


def cmd_schedule(args):
    """write posting/SCHEDULE.md: today + tomorrow (UTC and UK time), one row per clip, from Postiz (source of truth) + log.csv"""
    import glob
    from collections import OrderedDict
    log = load_log()
    by_pid = {r["post_id"]: r for r in log if r["post_id"]}
    # caption first line -> mp4 (kits, QA inbox, posted evidence)
    mp4 = {}
    for f in glob.glob(str(ROOT / "clips/whop/kits/*/*/clip.mp4")) + glob.glob(str(ROOT / "clips/whop/kits/_superseded/*/*/clip.mp4")):
        d = Path(f).parent
        for capf in [d / "caption.txt"] + sorted(d.glob("caption_*.txt")):
            if capf.exists():
                ls = [l for l in capf.read_text().splitlines() if l.strip() and not l.lower().startswith("(alt hook")]
                if ls:
                    mp4.setdefault(ls[0].strip()[:80], Path(f))
    for capf in glob.glob(str(ROOT / "qa/inbox/*/*.caption.txt")):
        ls = [l for l in Path(capf).read_text().splitlines() if l.strip() and not l.lower().startswith("(alt hook")]
        v = Path(capf.replace(".caption.txt", ".mp4"))
        if ls and v.exists():
            mp4.setdefault(ls[0].strip()[:80], v)
    for capf in glob.glob(str(HERE / "captions/*.caption.txt")):  # fixed Line Item captions -> the approved renders
        ls = [l for l in Path(capf).read_text().splitlines() if l.strip()]
        name = Path(capf).name.split(".")[0]
        hit = {"costco": "ve-v20/costco-hot-dog-and-membership-short-sfx", "mcdonalds": "ve-v22/how-mcdonalds-really-makes-money-short-sfx",
               "gas": "ve-v17/gas-stations-barely-profit-from-gas-short-sfx", "borrow": "ve-v17/rank-3-ways-to-borrow-by-cost-short-sfx",
               "dollargeneral": "ve-v21/dollar-general-small-towns-short-sfx", "protection": "ve-v17/rank-where-your-cash-is-protected-short-sfx",
               "netflix": "ve-v19/netflix-recommendation-ai-short-sfx", "starbucks": "ve-v22/starbucks-card-breakage-short-sfx",
               "ponzi": "ve-v17/how-ponzi-schemes-keep-running-short-sfx", "ups": "ve-v18/ups-orion-route-ai-short-sfx"}.get(name)
        if ls and hit and (ROOT / "qa/inbox" / (hit + ".mp4")).exists():
            mp4.setdefault(ls[0].strip()[:80], ROOT / "qa/inbox" / (hit + ".mp4"))
    start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=2)
    res = api("GET", "/posts", {"startDate": start.strftime("%Y-%m-%dT%H:%M:%S.000Z"), "endDate": end.strftime("%Y-%m-%dT%H:%M:%S.000Z")})
    posts = res.get("posts", []) if isinstance(res, dict) else []
    def campaign(brand, c):
        l = c.lower()
        if brand == "lineitem":
            return "Line Item (own brand)"
        for k, v in (("@clash", "CLASH x HOH"), ("bilfpod", "BILF"), ("ep. 344", "2 Bears Ep. 344"), ("ep. 343", "2 Bears (Ep. 343, void)"),
                     ("@callofduty", "COD POD"), ("kaepernick", "Kaepernick"), ("demi lovato", "Demi Lovato")):
            if k in l:
                return v
        return "?"
    groups = OrderedDict()
    for q in sorted(posts, key=lambda q: (q["publishDate"], q["integration"]["name"])):
        nm = q["integration"]["name"].lower()
        brand = "cutdesk" if nm.startswith("cut") else "lineitem" if nm.startswith("lineitem") else None
        if not brand or q["state"] == "DRAFT" and False:
            continue
        ident = q["integration"]["providerIdentifier"]
        pl = "TikTok" if ident.startswith("tiktok") else "Instagram" if ident.startswith("instagram") else "YouTube"
        first = q["content"].strip().splitlines()[0].strip()[:80]
        key = (q["publishDate"], first.split(" | ")[0].strip())
        g = groups.setdefault(key, {"brand": brand, "content": q["content"], "pl": [], "st": [], "sub": [], "when": q["publishDate"]})
        lr = by_pid.get(q["id"], {})
        g["pl"].append(pl)
        st = {"QUEUE": "scheduled", "PUBLISHED": "live", "ERROR": "FAILED", "DRAFT": "draft"}[q["state"]]
        if st == "live" and lr.get("whop_submitted_utc"):
            st = "submitted"
        if brand == "lineitem" and st == "live":
            st = "live (no Whop)"
        g["st"].append(f"{pl}: {st}")
    out = ["# Posting schedule", "", f"Updated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')} UTC (refreshed hourly from Postiz). Times: UTC / UK. Statuses: scheduled, live, submitted (link sent to Whop), FAILED, draft.", ""]
    days = {}
    for key, g in groups.items():
        t = datetime.fromisoformat(g["when"].replace("Z", "+00:00"))
        days.setdefault(t.date(), []).append((t, key, g))
    for day in sorted(days):
        out += [f"## {day.strftime('%a %d %b %Y')} (UTC date)", "", "| UTC | UK | Campaign | Clip | Platforms | Status | MP4 |", "|---|---|---|---|---|---|---|"]
        for t, key, g in days[day]:
            uk = t.astimezone(ZoneInfo("Europe/London"))
            title = key[1].split(" | ")[0][:60].replace("|", "/")
            f = next((mp4[k] for k in mp4 if k.split(" | ")[0].strip() == key[1]), None)
            link = f"[mp4](../{f.relative_to(ROOT)})" if f else "n/a"
            camp = campaign(g["brand"], g["content"])
            out.append(f"| {t.strftime('%H:%M')} | {uk.strftime('%H:%M')} | {camp} | {title} | {'+'.join(g['pl'])} | {'; '.join(g['st'])} | {link} |")
        out.append("")
    (HERE / "SCHEDULE.md").write_text("\n".join(out) + "\n")
    print(f"wrote {HERE / 'SCHEDULE.md'} ({sum(len(v) for v in days.values())} rows)")


def cmd_status(args):
    for r in load_log():
        print(f"{r['brand']:8} {r['platform']:9} {r['status']:10} {r['scheduled_for_utc'] or r['published_at_utc']:21} {r['clip_id'][:34]:34} {r['post_url']}")


def cmd_check(args):
    integ = api("GET", "/integrations")
    if isinstance(integ, dict):
        sys.exit(f"API error: {integ}")
    print(f"key OK. {len(integ)} channel(s):")
    for i in integ:
        print(f"   {i.get('name')!r:28} {i.get('identifier'):22} id={i['id']}  {'DISABLED' if i.get('disabled') else ''}")
    for brand, b in CFG["brands"].items():
        for pl in b["platforms"]:
            try:
                c = resolve_channels(brand, [pl], integ)[pl]
                print(f"   {brand}/{pl} -> {c.get('name')} ({c.get('identifier')})")
            except SystemExit as e:
                print(f"   {brand}/{pl} -> not resolved: {str(e)[:140]}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)

    def common(p):
        p.add_argument("--mode", choices=["draft", "schedule", "now"], default="draft")
        p.add_argument("--at"); p.add_argument("--platforms"); p.add_argument("--caption"); p.add_argument("--sources")
        p.add_argument("--youtube-visibility", choices=["public", "unlisted", "private"])
        p.add_argument("--go", action="store_true"); p.add_argument("--allow-duplicate", action="store_true"); p.add_argument("--allow-paused", action="store_true", help="one-off past a platform pause (PM-approved test posts only)"); p.add_argument("--override-yt-cap", action="store_true"); p.add_argument("--gap-ignore", default="", help="comma list of post_ids to ignore in the spacing check (used when swapping a slot)"); p.add_argument("--variant", default="", help="A/B label recorded in log.csv, e.g. face or topcap"); p.add_argument("--caption-style", default="", help="C1 tease / C2 hot take / C3 copypasta; read from the kit when present")
    p = sp.add_parser("post"); p.add_argument("path"); p.add_argument("--brand", required=True, choices=list(CFG["brands"])); common(p)
    p = sp.add_parser("carousel"); p.add_argument("dir"); p.add_argument("--brand", required=True, choices=list(CFG["brands"])); p.add_argument("--at", required=True); p.add_argument("--caption"); p.add_argument("--variant", default="", help="style/layout tag, e.g. toy/7slide"); p.add_argument("--go", action="store_true")
    p = sp.add_parser("kit"); p.add_argument("dir"); p.add_argument("--gap", type=int, default=90, help="minutes between clips"); common(p)
    p = sp.add_parser("poll"); p.add_argument("--watch", action="store_true"); p.add_argument("--until-new", action="store_true", help="with --watch: exit as soon as a NEW live URL appears (to hand off to the Whop submit)")
    p = sp.add_parser("approve"); p.add_argument("post_id", nargs="?"); p.add_argument("--all", action="store_true")
    p = sp.add_parser("cancel"); p.add_argument("post_id"); p.add_argument("--leave-empty", action="store_true", help="deliberately leave the slot empty (RULES 26: only v10 remixes / no-meme campaigns post); skips the dry-run marker")
    p = sp.add_parser("swap"); p.add_argument("old_id"); p.add_argument("new_kit"); p.add_argument("platform", choices=["tiktok", "instagram", "youtube"]); p.add_argument("at"); p.add_argument("--allow-duplicate", action="store_true"); p.add_argument("--dry-run", action="store_true", dest="dry_run")
    sp.add_parser("status"); sp.add_parser("schedule"); p = sp.add_parser("bilfguard"); p.add_argument("--wait", action="store_true"); sp.add_parser("check"); p = sp.add_parser("newkits"); p.add_argument("--wait", action="store_true")
    a = ap.parse_args()
    backup_log()  # before every run
    {"post": lambda: do_post(a.path, a), "carousel": lambda: cmd_carousel(a), "kit": lambda: cmd_kit(a), "poll": lambda: cmd_poll(a),
     "approve": lambda: cmd_approve(a), "cancel": lambda: cmd_cancel(a), "swap": lambda: cmd_swap(a, ap), "status": lambda: cmd_status(a), "newkits": lambda: cmd_newkits(a), "schedule": lambda: cmd_schedule(a), "bilfguard": lambda: cmd_bilfguard(a),
     "check": lambda: cmd_check(a)}[a.cmd]()


if __name__ == "__main__":
    main()
