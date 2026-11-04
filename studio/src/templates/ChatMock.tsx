import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AudioLayer } from "../components/AudioLayer";
import { Captions } from "../components/Captions";
import { FONT } from "../lib/fonts";
import { BaseResolved, SfxCue } from "../lib/types";
import { When, anchor, resolveTimes } from "../lib/anchors";
import { Brand, LeakStamp, NumPlate, clamp, ease, leakSfx, popK } from "../kit3d/LowPoly";

// Chat mock-up format (pilot A1, 2026-10-31). A generic messenger in brand colours (no WhatsApp marks, green or
// wallpaper): ink header, cream thread, pale-yellow outgoing bubbles, a grey "Seen" label and no read ticks (Red Team
// 2026-10-31: double ticks read as WhatsApp trade dress). The narrator VO drives the
// timeline: every time in `x` is an anchor on the voice (see lib/anchors.ts). The hook and an "Illustrative chat" label
// sit in the UI from frame 1; the input bar's draft is the CTA; the last 0.45 s slides back to the first thread (loop).

export type ChatMsg = { from: "me" | "them" | "sys"; text: string; at: When; time?: string; seenAt?: When; seen?: string };
export type ChatThread = { name: string; initials: string; color: string; status: string; msgs: ChatMsg[]; typing?: [When, When][]; badge?: { at: When; text: string } };
export type ChatX = {
  threads: ChatThread[];
  show: { at: When; thread: number; reset?: boolean }[];
  cards?: { at: When; until: When; text: string; sub?: string }[];
  notifs?: { at: When; until: When; title: string; body: string }[];
};
/** `count`: the plate rolls 0 → to while it is read out; `num` holds "{n}" where the rolling figure goes */
type ChatScene = { state?: string; num?: string; label?: string; at?: string; count?: { to: number; dur?: number }; startMs: number; durationMs: number };
export type ChatProps = BaseResolved<ChatScene> & { topHook?: string; label?: string; x: ChatX };

// resolved form: anchors become seconds
type Msg = Omit<ChatMsg, "at" | "seenAt"> & { at: number; seenAt?: number };
type Thread = Omit<ChatThread, "msgs" | "typing" | "badge"> & { msgs: Msg[]; typing?: [number, number][]; badge?: { at: number; text: string } };
type XR = { threads: Thread[]; show: { at: number; thread: number; reset?: boolean }[]; cards?: { at: number; until: number; text: string; sub?: string }[]; notifs?: { at: number; until: number; title: string; body: string }[] };

const INK = "#2A1A12";
const CREAM = "#F2E7D5";
const ME = "#FFE6A6";
const TEAL = "#1FA89C";
const GREY = "#8F8474";
const SLIDE = 12;
const AREA_BOTTOM = 770; // px from the bottom: the thread ends above the caption band and the input bar

/** grows from 0 height so older messages scroll up smoothly instead of jumping */
const Enter: React.FC<{ k: number; align: "flex-end" | "flex-start" | "center"; children: React.ReactNode }> = ({ k, align, children }) => (
  <div style={{ maxHeight: interpolate(k, [0, 1], [0, 420], clamp), display: "flex", justifyContent: align, marginTop: 14 * Math.min(1, k * 2) }}>
    <div style={{ transform: `scale(${0.6 + 0.4 * k})`, transformOrigin: align === "flex-end" ? "100% 100%" : align === "center" ? "50% 100%" : "0% 100%", opacity: Math.min(1, k * 3) }}>{children}</div>
  </div>
);

const Bubble: React.FC<{ m: Msg }> = ({ m }) => {
  if (m.from === "sys") return <div style={{ background: "rgba(42,26,18,.10)", borderRadius: 14, padding: "8px 22px", fontFamily: FONT.inter, fontWeight: 700, fontSize: 30, color: "#6E6355" }}>{m.text}</div>;
  const me = m.from === "me";
  return (
    <div style={{ maxWidth: 760, background: me ? ME : "#FFFFFF", borderRadius: 30, [me ? "borderBottomRightRadius" : "borderBottomLeftRadius"]: 8, padding: "18px 26px 12px", boxShadow: "0 3px 0 rgba(42,26,18,.12)" }}>
      <div style={{ fontFamily: FONT.inter, fontWeight: 500, fontSize: 42, lineHeight: 1.28, color: INK }}>{m.text}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 4, fontFamily: FONT.inter, fontSize: 26, color: GREY }}>
        {m.time}
      </div>
    </div>
  );
};

const Typing: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ background: "#FFFFFF", borderRadius: 30, borderBottomLeftRadius: 8, padding: "26px 30px", display: "flex", gap: 12, boxShadow: "0 3px 0 rgba(42,26,18,.12)" }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: GREY, transform: `translateY(${-8 * Math.max(0, Math.sin((f / 30) * Math.PI * 3 - i * 0.9))}px)` }} />
    ))}
  </div>
);

const ThreadView: React.FC<{ th: Thread; t: number; f: number; fps: number; label?: string }> = ({ th, t, f, fps, label }) => {
  const k = (at: number) => spring({ frame: Math.round((t - at) * fps), fps, config: { damping: 14, stiffness: 170 } });
  const vis = th.msgs.filter((m) => m.at <= t);
  const typing = (th.typing ?? []).some(([a, b]) => t >= a && t < b);
  const typingK = (th.typing ?? []).reduce((acc, [a, b]) => (t >= a && t < b ? Math.min(k(a), interpolate(t, [b - 0.1, b], [1, 0], clamp)) : acc), 0);
  // "Seen" sits under the last outgoing message once it is read and nothing has come back since
  const lastMe = [...vis].reverse().find((m) => m.from === "me");
  const answered = lastMe ? vis.some((m) => m.from === "them" && m.at > lastMe.at) : true;
  const seenLabel = lastMe && !answered && lastMe.seenAt !== undefined && t >= lastMe.seenAt ? lastMe.seen ?? `Seen ${lastMe.time}` : null;
  const bk = th.badge ? k(th.badge.at) : 0;
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      {/* faint low-poly facets instead of a doodle wallpaper */}
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        {Array.from({ length: 60 }, (_, i) => {
          const x = (i % 6) * 200 - 40, y = Math.floor(i / 6) * 200;
          return <polygon key={i} points={`${x},${y} ${x + 200},${y + 40} ${x + 60},${y + 200}`} fill={i % 3 ? "#E9DBC4" : "#EFE2CD"} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 430, background: INK }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 280, height: 130, display: "flex", alignItems: "center", gap: 26 }}>
        <div style={{ fontFamily: FONT.inter, fontSize: 56, color: "#FFF7E8", width: 40 }}>‹</div>
        <div style={{ width: 104, height: 104, borderRadius: 52, background: th.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 40, color: "#FFF7E8", flex: "none" }}>{th.initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT.inter, fontWeight: 700, fontSize: 46, color: "#FFF7E8" }}>{th.name}</div>
          <div style={{ fontFamily: FONT.inter, fontWeight: 500, fontSize: 30, color: typing ? "#FFD21F" : "rgba(255,247,232,.7)" }}>{typing ? "typing…" : th.status}</div>
        </div>
        {label ? <div style={{ border: "3px solid rgba(255,247,232,.55)", borderRadius: 12, padding: "4px 14px", fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 24, color: "rgba(255,247,232,.85)", letterSpacing: 1 }}>{label}</div> : null}
      </div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 450, bottom: AREA_BOTTOM, display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
        <div style={{ alignSelf: "center", background: "rgba(42,26,18,.08)", borderRadius: 14, padding: "6px 20px", fontFamily: FONT.inter, fontWeight: 600, fontSize: 26, color: GREY }}>TODAY</div>
        {vis.map((m, i) => (
          <Enter key={i} k={k(m.at)} align={m.from === "me" ? "flex-end" : m.from === "sys" ? "center" : "flex-start"}>
            <Bubble m={m} />
          </Enter>
        ))}
        {seenLabel ? <div style={{ alignSelf: "flex-end", marginTop: 8, fontFamily: FONT.inter, fontWeight: 600, fontSize: 28, color: GREY, opacity: Math.min(1, (t - lastMe!.seenAt!) * 4) }}>{seenLabel}</div> : null}
        {typingK > 0.01 ? (
          <Enter k={typingK} align="flex-start">
            <Typing f={f} />
          </Enter>
        ) : null}
      </div>
      {bk > 0.01 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", transform: `scale(${bk}) rotate(-4deg)` }}>
          <span style={{ display: "inline-block", border: `10px solid ${TEAL}`, color: TEAL, background: "rgba(255,255,255,.92)", borderRadius: 18, padding: "4px 30px", fontFamily: FONT.anton, fontSize: 104, letterSpacing: 3 }}>{th.badge!.text}</span>
        </div>
      ) : null}
      {/* input bar: the draft is the CTA */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 1330, height: 100, display: "flex", gap: 18, alignItems: "center" }}>
        <div style={{ flex: 1, height: 96, borderRadius: 48, background: "#FFFFFF", display: "flex", alignItems: "center", padding: "0 34px", fontFamily: FONT.inter, fontWeight: 600, fontSize: 36, color: GREY, boxShadow: "0 3px 0 rgba(42,26,18,.12)" }}>
          Comment&nbsp;<span style={{ color: INK, background: "#FFD21F", borderRadius: 8, padding: "0 8px", fontWeight: 900 }}>LEAK</span>&nbsp;for a free check
        </div>
        <div style={{ width: 96, height: 96, borderRadius: 48, background: TEAL, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="44" height="44" viewBox="0 0 24 24"><path d="M3 20 L21 12 L3 4 L5 12 Z" fill="#FFF7E8" /></svg>
        </div>
      </div>
      {/* muted keyboard fills the band under the input bar, like a real open chat */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, bottom: 0, background: "#E3D5BF", padding: "26px 14px 0" }}>
        {["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row) => (
          <div key={row} style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 16 }}>
            {row.split("").map((ch) => (
              <div key={ch} style={{ width: 92, height: 104, borderRadius: 14, background: "#F6EEE1", boxShadow: "0 3px 0 rgba(42,26,18,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.inter, fontWeight: 500, fontSize: 42, color: "rgba(42,26,18,.55)" }}>{ch}</div>
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const ChatMock: React.FC<ChatProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, durationInFrames } = useVideoConfig();
  const t = f / fps;
  const x = useMemo(() => resolveTimes(p.x, p.scenes, p.captions) as unknown as XR, [p.x, p.scenes, p.captions]);
  // loop: the last 0.45 s slides back to the first thread in its frame-0 state
  const show = [...x.show, { at: durationInFrames / fps - 0.45, thread: x.show[0].thread, reset: true }];
  const cur = show.reduce((acc, s, i) => (s.at <= t ? i : acc), 0);
  const s = show[cur];
  const prev = cur > 0 ? show[cur - 1] : null;
  const slide = prev ? ease(interpolate(f - Math.round(s.at * fps), [0, SLIDE], [0, 1], clamp)) : 1;
  const tt = (e: { reset?: boolean }) => (e.reset ? 0 : t);
  const hookEnd = p.scenes[0] ? (p.scenes[0].startMs + p.scenes[0].durationMs) / 1000 : 3;
  const hookOn = !p.topHook ? 0 : cur === 0 ? 1 - ease(interpolate(t, [hookEnd - 0.3, hookEnd], [0, 1], clamp)) : s.reset ? slide : 0;
  const card = (x.cards ?? []).find((c) => t >= c.at && t < c.until);
  const si = p.scenes.reduce((acc, q, i) => (q.startMs / 1000 <= t ? i : acc), 0);
  const sc = p.scenes[si];
  const numAtOf = (i: number) => anchor(p.scenes[i].at ? `W${i + 1}:${p.scenes[i].at!.replace(/^\^/, "")}` : `S${i + 1}+0.2`, p.scenes, p.captions);
  const numK = sc?.num ? popK(f - Math.round(numAtOf(si) * fps), fps) * interpolate(t, [(sc.startMs + sc.durationMs) / 1000 - 0.25, (sc.startMs + sc.durationMs) / 1000], [1, 0], clamp) : 0;
  const ms = (sec: number) => sec * 1000;
  const sfx: SfxCue[] = [
    ...x.threads.flatMap((th, ti) => th.msgs.filter((m) => m.from !== "sys" && show.some((e, i) => e.thread === ti && !e.reset && m.at >= e.at && m.at < (show[i + 1]?.at ?? 1e9))).map((m) => ({ atMs: ms(m.at), src: m.from === "me" ? "pop-pluck" : "ding-synth", volume: m.from === "me" ? 0.24 : 0.2 }))),
    ...x.threads.flatMap((th) => (th.badge ? [{ atMs: ms(th.badge.at), src: "impact-light", volume: 0.26 }] : [])),
    ...(x.cards ?? []).map((c) => ({ atMs: ms(c.at), src: "pixabay-whoosh-short", volume: 0.26 })),
    ...(x.notifs ?? []).map((n) => ({ atMs: ms(n.at), src: "pixabay-ping", volume: 0.16 })),
    ...show.slice(1).map((e) => ({ atMs: ms(e.at), src: "pixabay-whoosh-short", volume: 0.14 })),
    ...p.scenes.flatMap((q, i) => (q.num ? [{ atMs: ms(numAtOf(i)), src: "impact-punch-heavy", volume: 0.22 }] : [])),
    ...leakSfx(p.captions),
  ];
  const nk = (at: number) => spring({ frame: Math.round((t - at) * fps), fps, config: { damping: 14, stiffness: 170 } });
  const liveNotifs = (x.notifs ?? []).filter((n) => t >= n.at && t < n.until);
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      {prev && slide < 1 ? (
        <AbsoluteFill style={{ transform: `translateX(${-slide * width}px)` }}>
          <ThreadView th={x.threads[prev.thread]} t={tt(prev)} f={f} fps={fps} label={p.label} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ transform: `translateX(${(1 - slide) * width}px)` }}>
        <ThreadView th={x.threads[s.thread]} t={tt(s)} f={f} fps={fps} label={p.label} />
      </AbsoluteFill>
      {hookOn > 0 ? (
        <div style={{ position: "absolute", left: 60, right: 60, top: 470, textAlign: "center", opacity: hookOn }}>
          <span style={{ display: "inline-block", background: "#FFD21F", color: INK, borderRadius: 18, padding: "14px 30px", fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 54, lineHeight: 1.15, boxShadow: "0 6px 0 rgba(42,26,18,.25)" }}>{p.topHook}</span>
        </div>
      ) : null}
      {sc?.num && numK > 0.01 ? <NumPlate k={numK} num={sc.count ? sc.num.replace("{n}", Math.round(ease(interpolate(t, [numAtOf(si), numAtOf(si) + (sc.count.dur ?? 2.4)], [0, 1], clamp)) * sc.count.to).toLocaleString("en-US")) : sc.num} size={sc.count ? (sc.num.replace("{n}", sc.count.to.toLocaleString("en-US")).length > 8 ? 150 : 210) : undefined} label={sc.label} top={720} /> : null}
      {liveNotifs.length ? (
        <div style={{ position: "absolute", left: 60, right: 60, top: 460 }}>
          {liveNotifs.map((n, i) => {
            const k = nk(n.at);
            return (
              <div key={i} style={{ transform: `translateY(${(1 - k) * -50}px)`, opacity: Math.min(1, k * 2) * interpolate(t, [n.until - 0.2, n.until], [1, 0], clamp), background: "rgba(255,247,232,.97)", borderRadius: 30, padding: "18px 26px", marginBottom: 14, display: "flex", gap: 20, alignItems: "center", boxShadow: "0 6px 0 rgba(42,26,18,.18)" }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: TEAL, flex: "none" }} />
                <div>
                  <div style={{ fontFamily: FONT.inter, fontWeight: 700, fontSize: 32, color: INK }}>{n.title}</div>
                  <div style={{ fontFamily: FONT.inter, fontWeight: 500, fontSize: 32, color: "#5E5448" }}>{n.body}</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {card ? <TimeCard c={card} t={t} /> : null}
      <LeakStamp captions={p.captions} top={560} />
      {p.captionStyle !== "none" ? <Captions captions={p.captions} style={p.captionStyle} accent="#FFD21F" positionPct={64} /> : null}
      <Brand />
      <AudioLayer voSrc={p.voSrc} bgm={p.bgm} bgmVolume={p.bgmVolume} sfx={[...sfx, ...(p.sfx ?? [])]} />
    </AbsoluteFill>
  );
};

/** time-skip: wipes in as a clip (no cross-fade), the clock hands race, wipes out */
const TimeCard: React.FC<{ c: { at: number; until: number; text: string; sub?: string }; t: number }> = ({ c, t }) => {
  const lt = t - c.at, dur = c.until - c.at;
  const inK = ease(interpolate(lt, [0, 0.3], [0, 1], clamp));
  const outK = ease(interpolate(lt, [dur - 0.25, dur], [0, 1], clamp));
  const a = lt * 14;
  return (
    <AbsoluteFill style={{ background: INK, clipPath: `inset(${outK * 100}% 0 ${(1 - inK) * 100}% 0)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <svg width="260" height="260" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="#FFF7E8" stroke="#FFD21F" strokeWidth="7" />
          <line x1="50" y1="50" x2={50 + 26 * Math.sin(a / 12)} y2={50 - 26 * Math.cos(a / 12)} stroke={INK} strokeWidth="6" strokeLinecap="round" />
          <line x1="50" y1="50" x2={50 + 36 * Math.sin(a)} y2={50 - 36 * Math.cos(a)} stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: FONT.anton, fontSize: 150, lineHeight: 1, color: "#FFD21F", textAlign: "center" }}>{c.text}</div>
        {c.sub ? <div style={{ fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 44, color: "#FFF7E8", textAlign: "center", padding: "0 80px" }}>{c.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
