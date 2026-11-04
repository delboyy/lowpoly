import React from "react";
import { AbsoluteFill } from "remotion";
import { GeoMap } from "./maps";
import { PaperBg } from "./devices";
/** QA: world map with dots + US density scatter. */
export const MapDemo: React.FC = () => (
  <AbsoluteFill>
    <PaperBg />
    <div style={{ position: "absolute", left: 40, top: 40 }}><GeoMap region="world" width={1100} height={600} startFrame={-60} dots={[{ lon: -87.6, lat: 41.9, label: "Chicago" }, { lon: 139.7, lat: 35.7, label: "Tokyo" }, { lon: 2.35, lat: 48.85, label: "Paris" }]} /></div>
    <div style={{ position: "absolute", left: 1150, top: 40 }}><GeoMap region="us" width={700} height={450} startFrame={-60} scatter={{ count: 260 }} /></div>
  </AbsoluteFill>
);
