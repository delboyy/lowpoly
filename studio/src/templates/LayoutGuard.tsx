import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { WorldScene } from "../lib/types";
import { useLayout } from "../kit/theme";

/**
 * Automated overlap check, runs inside the render (zero cost when `window.__GV_LINT` is unset).
 * At a few settled frames of every scene it measures all text boxes and logs `GV_LINT ...` for:
 *   caption x content, caption x chip, chip x content, tab x caption/content, and content outside the safe lane
 * (portrait lane x60-920, 220 <= y <= 1440). bin/make.mjs collects the lines and prints a report.
 */
const boxesOf = (root: Element) => {
  const out: { x0: number; y0: number; x1: number; y1: number; t: string }[] = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = w.nextNode())) {
    const t = (n.textContent ?? "").trim();
    if (!t || (n.parentElement && n.parentElement.closest("[data-gv-ignore]"))) continue;
    const r = document.createRange();
    r.selectNodeContents(n);
    for (const b of Array.from(r.getClientRects())) if (b.width > 2 && b.height > 2) out.push({ x0: b.left, y0: b.top, x1: b.right, y1: b.bottom, t: t.slice(0, 24) });
  }
  return out;
};
const hit = (a: { x0: number; y0: number; x1: number; y1: number }, b: typeof a, pad = 3) => a.x0 < b.x1 - pad && b.x0 < a.x1 - pad && a.y0 < b.y1 - pad && b.y0 < a.y1 - pad;

export const LayoutGuard: React.FC<{ scenes: WorldScene[] }> = ({ scenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { portrait, width } = useLayout();
  React.useLayoutEffect(() => {
    const si = scenes.findIndex((s) => frame >= Math.round((s.startMs / 1000) * fps) && frame < Math.round(((s.startMs + s.durationMs) / 1000) * fps));
    if (si < 0) return;
    const local = frame - Math.round((scenes[si].startMs / 1000) * fps);
    if (![20, 50, 80, 100].includes(local)) return;
    const cap = Array.from(document.querySelectorAll('[data-gv="captions"]')).flatMap(boxesOf);
    const chip = Array.from(document.querySelectorAll('[data-gv="chip"]')).flatMap(boxesOf);
    const tab = Array.from(document.querySelectorAll('[data-gv="tab"]')).flatMap(boxesOf);
    const content = Array.from(document.querySelectorAll('[data-gv="content"]')).flatMap(boxesOf);
    const log = (m: string) => console.log(`GV_LINT scene ${si} (${scenes[si].type}) @${(frame / fps).toFixed(1)}s: ${m}`);
    for (const c of cap) for (const k of content) if (hit(c, k)) { log(`caption "${c.t}" overlaps content "${k.t}"`); break; }
    for (const c of chip) for (const k of cap) if (hit(c, k)) { log(`chip "${c.t}" overlaps caption "${k.t}"`); break; }
    for (const c of chip) for (const k of content) if (hit(c, k)) { log(`chip "${c.t}" overlaps content "${k.t}"`); break; }
    for (const c of cap) for (const k of tab) if (hit(c, k)) { log(`caption overlaps running tab`); break; }
    // vertical safe band (9:16): text, chips and captions must sit inside y220-1440
    if (portrait) for (const k of [...content, ...chip, ...cap]) if (k.y0 < 268 || k.y1 > 1438) { log(`"${k.t}" outside vertical safe band y270-1436 (${Math.round(k.y0)}-${Math.round(k.y1)})`); break; }
    // clipped text: any text box cut by an overflow-hidden ancestor (incl. inline <svg>) or by the frame
    for (const el of Array.from(document.querySelectorAll('[data-gv="content"] *'))) {
      const cs = getComputedStyle(el);
      if (cs.overflow === "visible") continue; // inline <svg> is overflow:hidden by default (UA style) unless the component sets overflow:visible
      const rect = el.getBoundingClientRect();
      for (const b of boxesOf(el)) if (b.x0 < rect.left - 2 || b.x1 > rect.right + 2 || b.y0 < rect.top - 2 || b.y1 > rect.bottom + 2) { log(`text "${b.t}" is clipped by <${el.tagName.toLowerCase()}> (text ${Math.round(b.x0)},${Math.round(b.y0)}-${Math.round(b.x1)},${Math.round(b.y1)} vs box ${Math.round(rect.left)},${Math.round(rect.top)}-${Math.round(rect.right)},${Math.round(rect.bottom)})`); break; }
    }
    // landscape: keep the top 54px clear of content
    if (!portrait) for (const k of content) if (k.y0 < 54) { log(`"${k.t}" inside the top 54px overlay band (y ${Math.round(k.y0)})`); break; }
    // text partly covered by a sibling layer (e.g. a redaction bar): sample three points of each text box, the topmost element must belong to the text
    for (const root of Array.from(document.querySelectorAll('[data-gv="content"]'))) {
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = w.nextNode())) {
        const el = n.parentElement;
        if (!el || !(n.textContent ?? "").trim() || el.closest("[data-gv-ignore]") || el instanceof SVGElement) continue;
        const r = document.createRange();
        r.selectNodeContents(n);
        let covered = 0;
        for (const b of Array.from(r.getClientRects())) {
          if (b.width < 8 || b.height < 8 || b.right < 0 || b.left > width) continue;
          const cy = b.top + b.height / 2; // per text line (a multi-line node's overall box centre can fall between lines)
          for (const x of [b.left + 6, b.left + b.width / 2, b.right - 6]) {
            const top = document.elementFromPoint(Math.min(width - 1, Math.max(0, x)), cy);
            if (top && !el.contains(top) && !top.contains(el)) covered++;
          }
        }
        if (covered > 0) { log(`text "${(n.textContent ?? "").trim().slice(0, 24)}" is covered by another layer (${covered}/3 points)`); break; }
      }
    }
    // contrast (approximate): text colour vs the nearest opaque ancestor background, else the scene backdrop (night or paper).
    // Large ink numbers (>= 90 px) are skipped: they sit on a yellow plate the DOM does not expose. Thresholds: 4.5:1, 3:1 for text >= 40 px.
    const rgb = (c: string) => (c.match(/[\d.]+/g) ?? ["0", "0", "0"]).slice(0, 4).map(Number);
    const lum = (c: number[]) => { const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    for (const root of Array.from(document.querySelectorAll('[data-gv="content"]'))) {
      const dark = root.getAttribute("data-gv-dark") === "1";
      const w2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n2: Node | null; let bad = 0;
      while ((n2 = w2.nextNode()) && !bad) {
        const el = n2.parentElement;
        if (!el || !(n2.textContent ?? "").trim() || el.closest("[data-gv-ignore]") || el instanceof SVGElement) continue;
        const cs = getComputedStyle(el);
        if (cs.display === "none" || el.getClientRects().length === 0) continue; // hidden helper nodes (e.g. frame counters) are not on screen
        const fg = rgb(cs.color), fs = parseFloat(cs.fontSize);
        if (fs >= 90 && lum(fg) < 0.05) continue;
        if (dark && lum(fg) > 0.5) continue; // light text on a dark scene (the backdrop is a sibling layer, so the walk cannot see it reliably)
        let bg: number[] | null = null; let a: Element | null = el;
        while (a && !bg) { const b = rgb(getComputedStyle(a).backgroundColor); if (b.length === 3 || (b.length === 4 && b[3] > 0.6)) bg = b; if (a === root) break; a = a.parentElement; } // never look above the scene content (the composition root is paper even on dark scenes)
        const back = bg ?? (dark ? [11, 11, 18] : [244, 239, 228]);
        const l1 = lum(fg), l2 = lum(back); const cr = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        if (cr < (fs >= 40 ? 3 : 4.5)) { bad = 1; log(`low contrast ${cr.toFixed(1)}:1 for "${(n2.textContent ?? "").trim().slice(0, 24)}"`); }
      }
    }
    for (const k of content) if (k.x0 < -2 || k.x1 > width + 2) { log(`"${k.t}" cut by the frame edge`); break; }
    if (portrait) for (const k of content) if (k.x1 > 925 || k.x0 < 55) { log(`content "${k.t}" outside safe x60-920 (${Math.round(k.x0)}-${Math.round(k.x1)})`); break; }
    for (const c of chip) if (c.x1 > width - 20) log(`chip "${c.t}" runs off the frame`);
  });
  // probe styling: only scene content can be hit-tested, so elementFromPoint reveals content layers that cover text
  return <style>{`[data-gv-probe] *{pointer-events:none} [data-gv="content"] *{pointer-events:auto}`}</style>;
};
