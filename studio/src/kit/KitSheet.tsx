import React from "react";
import { AbsoluteFill } from "remotion";
import { ILLUSTRATIONS } from "./illustrations";
import { Icon } from "./icons";
import { Redact, PaperBg, Stamp, PriceTag, Receipt } from "./devices";
import { P } from "./theme";
import { FONT } from "../lib/fonts";

/** Visual QA sheet: every illustration + icons + devices. `npx remotion still KitSheet out.png`. */
export const KitSheet: React.FC = () => (
  <AbsoluteFill>
    <PaperBg />
    <div style={{ position: "absolute", inset: 30, display: "flex", flexWrap: "wrap", gap: 10, alignContent: "flex-start" }}>
      {Object.entries(ILLUSTRATIONS).map(([k, C]) => (
        <div key={k} style={{ textAlign: "center", fontFamily: FONT.inter, fontWeight: 700 }}>
          <C size={300} />
          <div>{k}</div>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 40, bottom: 40, display: "flex", gap: 30, alignItems: "center" }}>
      {(["key", "home", "dollar", "trending-up", "users", "map-pin", "receipt", "store", "fuel", "scale", "question", "brain"] as const).map((n) => <Icon key={n} name={n} size={70} />)}
      <Stamp text="Sourced" size={70} color={P.loss} />
      <span style={{ fontFamily: FONT.anton, fontSize: 90 }}><Redact startFrame={0} peelFrames={1}>$10.4B</Redact></span>
    </div>
  </AbsoluteFill>
);
export const KitSheetDevices: React.FC = () => (
  <AbsoluteFill>
    <PaperBg />
    <div style={{ position: "absolute", left: 60, top: 60 }}>
      <Receipt subtitle="EPISODE 01" lines={[{ label: "Hot dog + soda", value: "$1.50" }, { label: "Membership fees", value: "$5.9B", hl: true }, { label: "Share of op. income", value: "50.6%", loss: true }]} total={{ label: "YOU PAID FOR", value: "THE CARD" }} lineFrames={1} startFrame={-30} widthPx={760} />
    </div>
    <div style={{ position: "absolute", right: 120, top: 120 }}><PriceTag from="$1.50" to="$4.50" flipFrame={0} label="IF IT KEPT PACE" /></div>
  </AbsoluteFill>
);
