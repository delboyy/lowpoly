import React from "react";
import { AbsoluteFill, Composition, Sequence, registerRoot, useCurrentFrame } from "remotion";
import { PaperBg } from "./devices";
import { BankVault, DeliveryVan, MembershipCard } from "./library/objects";
import { HotDogCombo, FuelPumpLive, PhoneAppLive, StampMark, MoneyFlow } from "./library/objects2";
import { NodeMap, UK_PORTS, UK_AIRPORTS } from "./library/maps5";
import { RegionChoropleth, UK_ITL1, UK_ITL2, UK_BOUNDS } from "./library/maps4";
import { ProjectionChart } from "./library/charts3";
import { DataCentre, RackGlyph } from "./library/datacentre";
import { RegionMap, GREATER_DUBLIN } from "./library/maps3";
import { MapDisclaimer, PlaceMap, SeaRoute, Choropleth, ReceiptPin, PaperMapBg } from "./library/maps2";
import { CardReaderFeeBite } from "./library/feebite";
import { StockShot } from "./library/stock";
import { WarehouseBackdrop, TapePiece, PaperCrumple, TornPaper, PrintingReceipt, GlyphIcon, BigNumberCard } from "./library/set5";
import { RedactWipe, StampCutWipe, TornEdgeDivider, DottedConnector, CoinTagAccents } from "./library/devices2";
import { SafeBox, RouteMap, ShareRing, DollarSplit, RankLadder, TearWipe } from "./library/charts2";
import { LedgerBg, ReceiptRollBg } from "./library/backgrounds";
import { P } from "./theme";
import { FONT } from "../lib/fonts";

/**
 * Asset Builder preview harness (not used by episodes): `npx remotion still src/kit/preview-entry.tsx <Id> out.png`.
 * One composition per asset id, 1080x1920, 90 frames. Objects are shown on paper at size 800 with a pop-in then idle motion.
 */
const pop = (f: number) => Math.min(1, f / 14);
const obj = (C: React.FC<any>, extra: (f: number) => object = () => ({})): React.FC => () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <PaperBg />
      <C size={900} progress={pop(f)} {...extra(f)} />
    </AbsoluteFill>
  );
};
const withBg = (B: React.FC<any>): React.FC => () => (
  <AbsoluteFill>
    <B />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT.anton, fontSize: 150, background: P.highlight, color: P.ink, padding: "0 30px", lineHeight: 1.15 }}>$10.4B</div>
      <div style={{ fontFamily: FONT.inter, fontWeight: 700, fontSize: 52, marginTop: 30, color: P.ink }}>of rent last year</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

const ASSETS: Record<string, React.FC> = {
  BankVault: obj(BankVault, (f) => ({ open: Math.max(0, Math.min(1, (f - 20) / 50)) })),
  DeliveryVan: obj(DeliveryVan, (f) => ({ label: "Route", open: Math.max(0, Math.min(1, (f - 50) / 25)) })),
  MembershipCard: obj(MembershipCard, (f) => ({ label: "Warehouse", flip: Math.max(0, Math.min(1, (f - 30) / 30)), stamp: Math.max(0, Math.min(1, (f - 62) / 7)) })),
  HotDogCombo: obj(HotDogCombo),
  FuelPumpLive: obj(FuelPumpLive),
  PhoneAppLive: obj(PhoneAppLive, () => ({ label: "Rewards" })),
  StampMark: () => {
    const T = ["SOURCED", "OVERCHARGED", "LANDLORD", "VERIFIED"];
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 100 }}>
        <PaperBg />
        {T.map((t, i) => <StampMark key={t} text={t} start={i * 14} tone={i === 3 ? "gain" : i === 2 ? "ink" : "loss"} rotate={i % 2 ? 6 : -8} />)}
      </AbsoluteFill>
    );
  },
  MoneyFlow: () => (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <PaperBg />
      <div style={{ position: "relative" }}><MoneyFlow width={900} height={800} from={[40, 340]} to={[820, 300]} bend={-0.5} label="rent in" back={{ label: "burger out" }} /></div>
    </AbsoluteFill>
  ),
  RouteMap: () => (
    <AbsoluteFill><PaperBg />
      <SafeBox>
      <div style={{ position: "relative", width: 860 }}><RouteMap width={860} height={600} stops={[{ lon: -122.3, lat: 47.6, label: "Seattle" }, { lon: -104.9, lat: 39.7, label: "Denver" }, { lon: -74, lat: 40.7, label: "New York" }]} /></div>
      </SafeBox>
    </AbsoluteFill>),
  ShareRing: () => (
    <AbsoluteFill><PaperBg />
      <SafeBox>
      <div style={{ position: "relative" }}><ShareRing size={860} share={0.616} sub="of operating income" tone="loss" decimals={1} /></div>
      </SafeBox>
    </AbsoluteFill>),
  DollarSplit: () => (
    <AbsoluteFill><PaperBg />
      <SafeBox>
      <DollarSplit width={860} parts={[{ label: "Cost of fuel", cents: 90, tone: "ink" }, { label: "Card fees + labour", cents: 7, tone: "loss" }, { label: "Profit", cents: 3, tone: "gain" }]} hl={2} />
      </SafeBox>
    </AbsoluteFill>),
  DollarSplit2: () => (
    <AbsoluteFill><PaperBg /><SafeBox>
      <DollarSplit width={780} parts={[{ label: "Food", cents: 30, tone: "ink" }, { label: "Labor", cents: 20, tone: "loss" }, { label: "Rent", cents: 10, tone: "muted" }, { label: "Profit", cents: 40, tone: "gain" }]} hl={3} />
    </SafeBox></AbsoluteFill>),
  RankLadder: () => (
    <AbsoluteFill><PaperBg />
      <SafeBox top={300}>
      <RankLadder width={860} items={[{ label: "Credit union loan", value: 9.5, sub: "cheapest" }, { label: "Bank card", value: 21.5 }, { label: "Payday loan", value: 391 }]} unit="% APR" />
      </SafeBox>
    </AbsoluteFill>),
  TearWipe: () => {
    const f = useCurrentFrame();
    return (
      <AbsoluteFill><PaperBg />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT.anton, fontSize: f < 45 ? 200 : 140, color: P.ink }}>{f < 45 ? "BEFORE" : "AFTER"}</AbsoluteFill>
        <Sequence from={30} durationInFrames={30}><TearWipe durationFrames={30} /></Sequence>
      </AbsoluteFill>
    );
  },
  RedactWipe: () => {
    const f = useCurrentFrame();
    return (<AbsoluteFill><PaperBg /><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT.anton, fontSize: f < 39 ? 200 : 140, color: P.ink }}>{f < 39 ? "BEFORE" : "AFTER"}</AbsoluteFill><Sequence from={30} durationInFrames={18}><RedactWipe /></Sequence></AbsoluteFill>);
  },
  StampCutWipe: () => {
    const f = useCurrentFrame();
    return (<AbsoluteFill><PaperBg /><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT.anton, fontSize: f < 39 ? 200 : 140, color: P.ink }}>{f < 39 ? "BEFORE" : "AFTER"}</AbsoluteFill><Sequence from={30} durationInFrames={18}><StampCutWipe /></Sequence></AbsoluteFill>);
  },
  TornEdgeDivider: () => (
    <AbsoluteFill><PaperBg /><SafeBox><TornEdgeDivider width={860} label="Total" /><div style={{ height: 80 }} /><TornEdgeDivider width={860} startFrame={20} /></SafeBox></AbsoluteFill>),
  DottedConnector: () => (
    <AbsoluteFill><PaperBg /><SafeBox><div style={{ position: "relative", width: 860, height: 900 }}><DottedConnector width={860} height={900} points={[[80, 60], [80, 420], [700, 420], [700, 800]]} /></div></SafeBox></AbsoluteFill>),
  CoinTagAccents: withBg(CoinTagAccents),
  WarehouseBackdrop: () => (<AbsoluteFill><WarehouseBackdrop /><AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><HotDogCombo size={760} progress={1} /></AbsoluteFill></AbsoluteFill>),
  PaperPack: () => (
    <AbsoluteFill><PaperBg /><SafeBox>
      <TornPaper width={780} height={520} seed={3} startFrame={10}><div style={{ fontFamily: FONT.anton, fontSize: 120, color: P.ink, textAlign: "center", marginTop: 90 }}>FINE PRINT</div></TornPaper>
      <div style={{ position: "absolute", top: 440 }}><TapePiece rotate={-6} /></div>
      <div style={{ height: 120 }} />
      <div style={{ position: "relative", width: 700, height: 400, background: P.receipt, border: "4px solid #14130F" }}><PaperCrumple width={700} height={400} /><div style={{ padding: 40, fontFamily: FONT.anton, fontSize: 100 }}>CRUMPLED</div></div>
    </SafeBox></AbsoluteFill>),
  PrintingReceipt: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={240}>
      <PrintingReceipt subtitle="DUMMY DATA" lines={[{ label: "Item A", value: "$0.00" }, { label: "Item B", value: "$0.00", loss: true }, { label: "Item C", value: "$0.00" }, { label: "Item D", value: "$0.00", hl: true }, { label: "Item E", value: "$0.00" }, { label: "Item F", value: "0.0%" }, { label: "Item G", value: "0.0%" }, { label: "Item H", value: "0" }]} total={{ label: "TOTAL", value: "$0.00" }} />
    </SafeBox></AbsoluteFill>),
  GlyphIcons: () => {
    const N = ["soda", "cash", "calendar", "percent", "magnifier", "tag", "lock", "pump", "coffee"] as const;
    return (<AbsoluteFill><PaperBg /><SafeBox><div style={{ display: "grid", gridTemplateColumns: "repeat(3, 280px)", gap: 30 }}>{N.map((n) => <GlyphIcon key={n} name={n} size={280} />)}</div></SafeBox></AbsoluteFill>);
  },
  BigNumberCard: () => (<AbsoluteFill><PaperBg /><SafeBox top={520}><BigNumberCard value={5.9} prefix="$" suffix="B" decimals={1} kicker="Membership fees" sub="about half of operating income" /></SafeBox></AbsoluteFill>),
  BigNumberCard250k: () => (<AbsoluteFill><PaperBg /><SafeBox top={520}><BigNumberCard value={250000} prefix="$" kicker="Dummy" sub="label" /></SafeBox></AbsoluteFill>),
  StockFrames: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={290}>
      <StockShot id="mcd-patty-grill-01" frame="receipt" width={700} height={600} caption="Caption" to={4} />
      <div style={{ height: 40 }} />
      <StockShot id="mcd-flame-burger-01" frame="polaroid" width={560} height={470} caption="Caption" tilt={2} startFrame={6} />
    </SafeBox></AbsoluteFill>),
  StockFrames2: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={290}>
      <StockShot id="costco-sausage-pan-01" frame="torn" width={760} height={520} caption="Caption" treatment="thermal" startFrame={4} />
      <div style={{ height: 50 }} />
      <StockShot id="cash-gold-bars-01" frame="stub" width={780} height={420} label="Stored" treatment="ink" startFrame={8} />
    </SafeBox></AbsoluteFill>),
  StockTreatments: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={290}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {(["ink", "red", "halftone", "thermal"] as const).map((t, i) => <StockShot key={t} id="sbux-espresso-pour-01" frame="full" treatment={t} width={410} height={250} startFrame={i * 3} />)}
        {(["ink", "red", "halftone", "thermal"] as const).map((t, i) => <StockShot key={"d" + t} id="costco-sausage-pan-01" frame="full" treatment={t} width={410} height={250} startFrame={i * 3} />)}
      </div>
    </SafeBox></AbsoluteFill>),
  /** 9:16 composite: stock frame above the caption band (y1056-1248), a caption, and a source chip placeholder in the hard box. */
  StockComposite: () => (
    <AbsoluteFill><PaperBg />
      <div style={{ position: "absolute", left: 60, top: 280, width: 860, display: "flex", justifyContent: "center" }}>
        <StockShot id="gas-nozzle-car-hand-02" frame="receipt" width={740} height={740} caption="Caption" treatment="ink" to={4} />
      </div>
      <div style={{ position: "absolute", left: 60, width: 860, top: 1090, textAlign: "center", fontFamily: FONT.anton, fontSize: 92, color: P.receipt, WebkitTextStroke: "10px #14130F", paintOrder: "stroke fill" }}>CAPTION BAND</div>
      <div style={{ position: "absolute", left: 60, top: 1290, fontFamily: FONT.inter, fontWeight: 700, fontSize: 28, color: P.ink, background: P.receipt, border: "3px solid #14130F", padding: "6px 16px", borderRadius: 8 }}>Source chip (placeholder)</div>
    </AbsoluteFill>),
  CardReaderFeeBite: () => (<AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><PaperBg /><div style={{ position: "relative" }}><CardReaderFeeBite width={1500} total="$0.00" /></div></AbsoluteFill>),
  PlaceMap: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={300}><div style={{ position: "relative" }}>
      <PlaceMap width={860} height={900} from={{ pad: 30 }} to={{ places: ["Panama"], pad: 120 }} startFrame={10} highlight={["Panama"]} tint={["Costa Rica", "Colombia"]} pins={[{ lon: -79.55, lat: 8.95, label: "Panama City", kind: "port", side: "br" }, { lon: -79.9, lat: 9.35, label: "Colon", kind: "port", side: "al" }]} frames={45} /><MapDisclaimer />
    </div></SafeBox></AbsoluteFill>),
  SeaRoute: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={300}><div style={{ position: "relative" }}>
      <SeaRoute width={860} height={700} centerLon={150} to={{ bounds: [[90, -5], [250, 55]], pad: 40 }} routes={[{ from: { name: "Shanghai", lon: 121.5, lat: 31.2 }, to: { name: "Los Angeles", lon: -118.2, lat: 33.7 }, markers: 2 }, { from: { name: "Shanghai", lon: 121.5, lat: 31.2 }, via: [{ lon: 103.8, lat: 1.3 }], to: { name: "Singapore", lon: 103.8, lat: 1.3 }, tone: "loss", markers: 2 }]} frames={30} />
    </div></SafeBox></AbsoluteFill>),
  Choropleth: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={300}><div style={{ position: "relative" }}>
      <Choropleth width={860} height={640} src="us" to={{ pad: 100 }} data={[{ name: "California", value: 38 }, { name: "Texas", value: 29 }, { name: "New York", value: 19 }, { name: "Florida", value: 22 }, { name: "Ohio", value: 12 }, { name: "Illinois", value: 14 }, { name: "Washington", value: 9 }, { name: "Georgia", value: 11 }, { name: "Nevada", value: 3 }, { name: "Montana", value: 1 }, { name: "Arizona", value: 6 }, { name: "Colorado", value: 5 }]} fmt={() => "DUMMY"} legend={["LOW", "HIGH"]} />
    </div></SafeBox></AbsoluteFill>),
  ReceiptPin: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={290}><div style={{ position: "relative" }}>
      <ReceiptPin width={860} height={1000} from={{ bounds: [[-170, -55], [170, 78]] }} to={{ bounds: [[-125, 24], [-66, 50]], pad: 60 }} highlight={["United States of America"]} anchor={{ lon: -95, lat: 30 }} lines={[{ label: "Item A", value: "0.0" }, { label: "Item B", value: "0.0" }]} hero="$0.0B" heroLabel="Label" side="left" frames={40} />
    </div></SafeBox></AbsoluteFill>),
  PaperMapBg: () => (<AbsoluteFill><PaperMapBg width={1080} height={1920} /><AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><div style={{ fontFamily: FONT.anton, fontSize: 150, background: P.highlight, color: P.ink, padding: "0 30px" }}>$0.0B</div><div style={{ fontFamily: FONT.inter, fontWeight: 800, fontSize: 52, marginTop: 30, color: P.ink }}>label</div></AbsoluteFill></AbsoluteFill>),
  RegionMap: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={300}><div style={{ position: "relative" }}>
      <RegionMap width={860} height={900} from={{ bounds: [[-10.8, 51.3], [-5.3, 55.5]], pad: 30 }} to={{ bounds: [[-7.0, 52.9], [-5.9, 53.7]], pad: 60 }} startFrame={10} frames={45} highlight={GREATER_DUBLIN} tint={["Kildare", "Meath", "Wicklow"]} labelRegions={["Kildare", "Meath", "Wicklow"]} pins={[{ lon: -6.26, lat: 53.35, label: "Dublin", side: "br" }]} />
      <MapDisclaimer />
    </div></SafeBox></AbsoluteFill>),
  DataCentre: () => (<AbsoluteFill><PaperBg /><SafeBox><DataCentre size={1000} progress={Math.min(1, useCurrentFrame() / 14)} label="Facility 01" /></SafeBox></AbsoluteFill>),
  RackGlyph: () => (<AbsoluteFill><PaperBg /><SafeBox><div style={{ display: "grid", gridTemplateColumns: "repeat(4, 200px)", gap: 24 }}>{Array.from({ length: 12 }, (_, i) => <RackGlyph key={i} hl={i === 5} delay={i * 3} progress={Math.min(1, Math.max(0, (useCurrentFrame() - i * 3) / 10))} />)}</div></SafeBox></AbsoluteFill>),
  ProjectionChart: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={300}><div style={{ position: "relative" }}>
      <ProjectionChart width={860} height={760} title="Dummy series" actual={[{ x: 2015, y: 2 }, { x: 2017, y: 3 }, { x: 2019, y: 5 }, { x: 2021, y: 8 }, { x: 2023, y: 14 }]} projection={[{ x: 2023, y: 14 }, { x: 2027, y: 22 }, { x: 2031, y: 30 }, { x: 2035, y: 38 }]} band={{ x: 2035, lo: 26, hi: 52, label: "RANGE" }} xTicks={[{ x: 2015, label: "2015" }, { x: 2025, label: "2025" }, { x: 2035, label: "2035" }]} yMin={0} yMax={60} ySuffix="%" actualLabel="0.0%" endLabel="0.0%" />
    </div></SafeBox></AbsoluteFill>),
  RegionChoropleth: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={290}><div style={{ position: "relative" }}>
      <RegionChoropleth width={860} height={1000} features={UK_ITL1} to={{ bounds: UK_BOUNDS, pad: 40 }} data={UK_ITL1.features.map((f, i) => ({ name: f.properties.name, value: f.properties.name === "London" ? 99 : (i * 7) % 60 }))} fmt={() => "DUMMY"} pillFor={["Wales"]} />
      <MapDisclaimer />
    </div></SafeBox></AbsoluteFill>),
  RegionChoropleth2: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={290}><div style={{ position: "relative" }}>
      <RegionChoropleth width={860} height={1000} features={UK_ITL2} to={{ bounds: [[-5.9, 49.9], [1.8, 55.9]], pad: 30 }} data={UK_ITL2.features.map((f, i) => ({ name: f.properties.name, value: f.properties.name === "Inner London - West" ? 99 : (i * 13) % 70 }))} fmt={() => "DUMMY"} />
    </div></SafeBox></AbsoluteFill>),
  NodeMap: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={290}><div style={{ position: "relative" }}>
      <NodeMap width={860} height={1000} to={{ bounds: [[-4.2, 50.4], [3.2, 54.2]], pad: 20 }} nodes={[{ ...UK_PORTS[0], hl: true }, { name: "Thames ports", lon: 0.43, lat: 51.48, kind: "port", side: "al" }, ...UK_PORTS.filter((n) => !["Felixstowe", "Tilbury", "London Gateway"].includes(n.name))]} />
      <MapDisclaimer />
    </div></SafeBox></AbsoluteFill>),
  NodeMapAir: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={290}><div style={{ position: "relative" }}>
      <NodeMap width={860} height={1000} to={{ bounds: [[-3.4, 50.8], [0.9, 53.7]], pad: 20 }} nodes={[{ ...UK_AIRPORTS[0], hl: true }, ...UK_AIRPORTS.slice(1)]} />
      <MapDisclaimer />
    </div></SafeBox></AbsoluteFill>),
  NodeMapFlow: () => (
    <AbsoluteFill><PaperBg /><SafeBox top={290}><div style={{ position: "relative" }}>
      <NodeMap width={860} height={900} features={UK_ITL1} to={{ bounds: [[-6, 49.8], [3.5, 56]], pad: 20 }} nodes={[{ name: "Region A", lon: 0.0, lat: 53.0, kind: "city" }, { name: "City B", lon: -1.3, lat: 51.2, kind: "city", hl: true }]} flows={[{ from: { lon: 0.0, lat: 53.0 }, to: { lon: -1.3, lat: 51.2 }, value: "0.0k", bend: 0.3 }]} />
      <MapDisclaimer />
    </div></SafeBox></AbsoluteFill>),
  ProjectionChartWide: () => (<AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><PaperBg /><div style={{ position: "relative" }}><ProjectionChart width={1100} height={450} actual={[0,1,2,3,4,5,6,7,8,9,10].map((i) => ({ x: 2015 + i, y: 1.2 + i * 0.4 + (i > 6 ? (i - 6) : 0) }))} projection={[{ x: 2025, y: 8.6 }, { x: 2030, y: 11.2 }, { x: 2035, y: 14 }]} band={{ x: 2035, lo: 13, hi: 15 }} xTicks={[{ x: 2015, label: "2015" }, { x: 2025, label: "2025" }, { x: 2035, label: "2035" }]} yMin={1.2} yMax={15} ySuffix=" DUMMY" decimals={1} actualLabel="0.0" endLabel="0.0" /></div></AbsoluteFill>),
  ProjectionChartSteep: () => (<AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><PaperBg /><div style={{ position: "relative" }}><ProjectionChart width={1100} height={450} actual={[0.2, 0.3, 0.5, 0.9, 1.6, 2.6, 4, 6, 9, 13, 18].map((y, i) => ({ x: 2015 + i, y }))} projection={[{ x: 2025, y: 18 }, { x: 2030, y: 28 }, { x: 2035, y: 36 }]} band={{ x: 2035, lo: 31, hi: 42 }} xTicks={[{ x: 2015, label: "2015" }, { x: 2025, label: "2025" }, { x: 2035, label: "2035" }]} yMin={0} yMax={45} ySuffix=" DUMMY" actualLabel="0.0" endLabel="0.0" /></div></AbsoluteFill>),
  TextTokens: () => (<AbsoluteFill><PaperBg /><SafeBox top={240}><div style={{ display: "flex", flexDirection: "column", gap: 40, alignItems: "center" }}>
    <PrintingReceipt width={780} subtitle="DUMMY DATA" lines={[{ label: "Item A", value: "-0.0", loss: true }, { label: "Item B", value: "+0.0", gain: true }, { label: "Item C", value: "0.0" }]} />
  </div></SafeBox></AbsoluteFill>),
  ProjectionChartBig: () => (<AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><PaperBg /><div style={{ position: "relative" }}><ProjectionChart compact width={1500} height={640} actual={[0.2, 0.3, 0.5, 0.9, 1.6, 2.6, 4, 6, 9, 13, 18].map((y, i) => ({ x: 2015 + i, y }))} projection={[{ x: 2025, y: 18 }, { x: 2030, y: 28 }, { x: 2035, y: 36 }]} band={{ x: 2035, lo: 31, hi: 42 }} xTicks={[{ x: 2015, label: "2015" }, { x: 2025, label: "2025" }, { x: 2035, label: "2035" }]} yMin={0} yMax={45} ySuffix=" DUMMY" actualLabel="0.0" endLabel="0.0" /></div></AbsoluteFill>),
  ProjectionChartIre: () => (<AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><PaperBg /><div style={{ position: "relative" }}><ProjectionChart width={1100} height={400} title="Dummy series" actual={[1.2, 1.9, 2.4, 3.1, 3.9, 4.6, 5.2, 5.9, 6.5, 7.1, 7.7].map((y, i) => ({ x: 2015 + i, y }))} projection={[{ x: 2025, y: 7.7 }, { x: 2030, y: 11 }, { x: 2035, y: 14 }]} band={{ x: 2035, lo: 13, hi: 15, label: "13-15 TWh" }} xTicks={[{ x: 2015, label: "2015" }, { x: 2025, label: "2025" }, { x: 2035, label: "2035" }]} yMin={1.2} yMax={15} ySuffix=" TWh" decimals={1} actualLabel="7.7" endLabel="14" /></div></AbsoluteFill>),
  ProjectionChartTight: () => (<AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><PaperBg /><div style={{ position: "relative" }}><ProjectionChart width={1100} height={260} title="Dummy series" actual={[1.2, 1.9, 2.4, 3.1, 3.9, 4.6, 5.2, 5.9, 6.5, 7.1, 7.7].map((y, i) => ({ x: 2015 + i, y }))} projection={[{ x: 2025, y: 7.7 }, { x: 2030, y: 11 }, { x: 2035, y: 14 }]} band={{ x: 2035, lo: 13, hi: 15, label: "13-15 TWh" }} xTicks={[{ x: 2015, label: "2015" }, { x: 2035, label: "2035" }]} yMin={1.2} yMax={15} ySuffix=" TWh" decimals={1} actualLabel="7.7" endLabel="14" /></div></AbsoluteFill>),
  LedgerBg: withBg(LedgerBg),
  ReceiptRollBg: withBg(ReceiptRollBg),
};
export const registerAssets = (more: Record<string, React.FC>) => Object.assign(ASSETS, more);

const Cap: React.FC<{ t: string }> = ({ t }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: 1230, textAlign: "center", fontFamily: FONT.anton, fontSize: 96, color: P.receipt, WebkitTextStroke: "10px #14130F", paintOrder: "stroke fill" }}>{t}</div>
);
/** 2-scene composite with a caption lane (y 1000-1380) (source chip is the Video Editor's template, not drawn here), for QA collision checks. */
const Composite: React.FC = () => {
  const f = useCurrentFrame();
  const a = f < 60;
  return (
    <AbsoluteFill>
      {a ? <ReceiptRollBg /> : <LedgerBg />}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 200 }}>
        {a ? <BankVault size={620} progress={pop(f)} open={Math.max(0, Math.min(1, (f - 15) / 40))} /> : <MembershipCard size={620} progress={pop(f - 60)} flip={Math.max(0, Math.min(1, (f - 85) / 25))} />}
        <div style={{ fontFamily: FONT.anton, fontSize: 130, background: P.highlight, color: P.ink, padding: "0 24px", marginTop: 10 }}>{a ? "$90B" : "92.3%"}</div>
      </AbsoluteFill>
      <Cap t={a ? "YOUR MONEY IS INSIDE" : "OF MEMBERS RENEW"} />
    </AbsoluteFill>
  );
};
ASSETS.Composite = Composite;
/** Batch 2 composite: pump then phone scene, stamp, caption lane. */
const Composite2: React.FC = () => {
  const f = useCurrentFrame();
  const a = f < 60;
  return (
    <AbsoluteFill>
      {a ? <LedgerBg /> : <ReceiptRollBg />}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 240 }}>
        {a ? <FuelPumpLive size={720} progress={pop(f)} /> : <PhoneAppLive size={720} progress={pop(f - 60)} label="Rewards" />}
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 800 }}>
        <StampMark text={a ? "Overcharged" : "Sourced"} start={a ? 30 : 95} />
      </AbsoluteFill>
      <Cap t={a ? "THE PUMP BARELY PROFITS" : "THE BALANCE NEVER EXPIRES"} />
    </AbsoluteFill>
  );
};
ASSETS.Composite2 = Composite2;

const Root: React.FC = () => (
  <>
    {Object.entries(ASSETS).map(([id, C]) => <Composition key={id} id={id} component={C} width={id === "CardReaderFeeBite" || id === "ProjectionChartWide" || id === "ProjectionChartSteep" || id === "ProjectionChartBig" || id === "ProjectionChartIre" || id === "ProjectionChartTight" ? 1920 : 1080} height={id === "CardReaderFeeBite" || id === "ProjectionChartWide" || id === "ProjectionChartSteep" || id === "ProjectionChartBig" || id === "ProjectionChartIre" || id === "ProjectionChartTight" ? 1080 : 1920} fps={30} durationInFrames={id === "CardReaderFeeBite" || id === "ProjectionChartWide" || id === "ProjectionChartSteep" || id === "TextTokens" || id === "ProjectionChartBig" || id === "ProjectionChartIre" || id === "ProjectionChartTight" ? 240 : ["PlaceMap", "SeaRoute", "Choropleth", "ReceiptPin", "RegionMap", "ProjectionChart", "RegionChoropleth", "RegionChoropleth2", "NodeMap", "NodeMapFlow", "NodeMapAir"].includes(id) ? 180 : id === "Composite" || id === "Composite2" ? 120 : id === "MoneyFlow" || id === "PrintingReceipt" ? 150 : 90} />)}
  </>
);
registerRoot(Root);
