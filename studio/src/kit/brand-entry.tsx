import React from "react";
import { Composition, registerRoot } from "remotion";
import { BannerCutDesk, BannerLineItem, CardCutDesk, CardLineItem, CutDeskPfpA, CutDeskPfpB, CutDeskPfpC, LineItemPfpA, LineItemPfpB, LineItemPfpC } from "./library/brand";

/** Brand export harness: `npx remotion still src/kit/brand-entry.tsx <Id> out.png`. Square 1080 marks, 2560x1440 banners. */
const sq: Record<string, React.FC> = { LineItemPfpA, LineItemPfpB, LineItemPfpC, CutDeskPfpA, CutDeskPfpB, CutDeskPfpC, CardLineItem, CardCutDesk };
const bn: Record<string, React.FC> = { BannerLineItem, BannerCutDesk };
registerRoot(() => (
  <>
    {Object.entries(sq).map(([id, C]) => <Composition key={id} id={id} component={C} width={1080} height={1080} fps={30} durationInFrames={1} />)}
    {Object.entries(bn).map(([id, C]) => <Composition key={id} id={id} component={C} width={2560} height={1440} fps={30} durationInFrames={1} />)}
  </>
));
