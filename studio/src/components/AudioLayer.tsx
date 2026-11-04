import React from "react";
import { Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import type { SfxCue } from "../lib/types";

type Props = { voSrc: string; bgm?: string | null; bgmVolume?: number; sfx: SfxCue[]; roomTone?: boolean };

/** Voiceover + looping BGM bed (low, constant) + one-shot SFX cues. */
export const AudioLayer: React.FC<Props> = ({ voSrc, bgm, bgmVolume = 0.1, sfx, roomTone }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Audio src={staticFile(voSrc)} />
      {roomTone ? <Audio src={staticFile("assets/sfx/room-tone.mp3")} loop volume={bgm ? 0.02 : 0.05} /> : null}
      {bgm ? <Audio src={staticFile(`assets/bgm/${bgm}.mp3`)} loop volume={bgmVolume} /> : null}
      {sfx.map((c, i) => (
        <Sequence key={i} from={Math.round((c.atMs / 1000) * fps)} durationInFrames={fps * 3} layout="none">
          <Audio src={staticFile(`assets/sfx/${c.src}.mp3`)} volume={c.volume ?? 0.35} />
        </Sequence>
      ))}
    </>
  );
};
