import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SfxCue } from "../lib/types";
import { D3Props, D3Scene, Delta3D } from "./Delta3D";
import { FootageShot, Shot } from "./Footage";

// Line Item "Hybrid" (pilot 2026-10-23): Nathan asked for the best of every pilot in one video.
// Real footage (modern + 1950s Prelinger) for the hook and human beats; the Three.js camera journey for the numbers;
// spring number punches; 2D "?" morph; slim hook bar. Footage sits over the 3D layer for the first `footageFrac`
// of a scene, then cuts into 3D with a 3-frame flash and a whoosh.
export type HybridScene = D3Scene & { footage?: FootageShot[]; footageFrac?: number };
export type HybridProps = Omit<D3Props, "scenes" | "between"> & { scenes: HybridScene[] };

const Flash: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundColor: "#fff", opacity: interpolate(f, [0, 1, 4], [0.85, 0.6, 0], { extrapolateRight: "clamp" }) }} />;
};

const FootageLayer: React.FC<{ scenes: HybridScene[] }> = ({ scenes }) => {
  const { fps } = useVideoConfig();
  const fr = (ms: number) => Math.round((ms / 1000) * fps);
  return (
    <>
      {scenes.flatMap((s, si) => {
        if (!s.footage?.length) return [];
        const span = s.durationMs * (s.footageFrac ?? 1);
        const per = span / s.footage.length;
        const shots = s.footage.map((shot, i) => (
          <Sequence key={`${si}-${i}`} from={fr(s.startMs + i * per)} durationInFrames={Math.max(1, fr(per))}>
            <Shot shot={shot} />
          </Sequence>
        ));
        const flash = (s.footageFrac ?? 1) < 1 ? [<Sequence key={`${si}-flash`} from={fr(s.startMs + span)} durationInFrames={5}><Flash /></Sequence>] : [];
        return [...shots, ...flash];
      })}
    </>
  );
};

export const Hybrid: React.FC<HybridProps> = (p) => {
  const extra: SfxCue[] = p.scenes.flatMap((s) => (s.footage?.length && (s.footageFrac ?? 1) < 1 ? [{ atMs: s.startMs + s.durationMs * (s.footageFrac ?? 1), src: "pixabay-whoosh-short", volume: 0.25 }] : []));
  return <Delta3D {...(p as unknown as D3Props)} sfx={[...(p.sfx ?? []), ...extra]} between={<FootageLayer scenes={p.scenes} />} />;
};
