import { Composition, registerRoot } from "remotion";
import { ThumbC1, ThumbC2, ThumbC3 } from "./library/thumbs";

/** Ep.1 thumbnails: `npx remotion still src/kit/thumb-entry.tsx C1 out.png` (1280x720) and `C1-160` (160x90, same code, mini variant). */
const T = { C1: ThumbC1, C2: ThumbC2, C3: ThumbC3 };
registerRoot(() => (
  <>
    {Object.entries(T).flatMap(([id, C]) => [
      <Composition key={id} id={id} component={() => <C />} width={1280} height={720} fps={30} durationInFrames={1} />,
      <Composition key={id + "-160"} id={id + "-160"} component={() => <C mini width={160} height={90} />} width={160} height={90} fps={30} durationInFrames={1} />,
    ])}
  </>
));
