import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import { CaptionedVideo, CaptionedVideoProps } from "./templates/CaptionedVideo";
import { KineticExplainer } from "./templates/Kinetic";
import { FastCutMontage } from "./templates/Montage";
import { Footage, FootageProps } from "./templates/Footage";
import { Morph, MorphProps } from "./templates/Morph";
import { Delta3D, D3Props } from "./templates/Delta3D";
import { Hybrid, HybridProps } from "./templates/Hybrid";
import { MapCompare3D, MapProps } from "./templates/MapCompare3D";
import { Penny3D, PennyProps } from "./templates/Penny3D";
import { Coke3D, CokeProps } from "./templates/Coke3D";
import { Pizza3D, PizzaProps } from "./templates/Pizza3D";
import { Avatar3D } from "./templates/Avatar3D";
import { Carts3D, CartsProps } from "./templates/Carts3D";
import { Reply3D, ReplyProps } from "./templates/Reply3D";
import { Inquiry3D, InquiryProps } from "./templates/Inquiry3D";
import { NoShows3D, NoShowsProps } from "./templates/NoShows3D";
import { PageSpeed3D, SpeedProps } from "./templates/PageSpeed3D";
import { Trades3D, TradesProps } from "./templates/Trades3D";
import { ChatMock, ChatProps } from "./templates/ChatMock";
import { Pov3D, PovProps } from "./templates/Pov3D";
import { MissedCall, MissedCallProps } from "./templates/MissedCall";
import { AgentReply3D, AgentProps } from "./templates/AgentReply3D";
import { StatReveal } from "./templates/Stat";
import { ReceiptWorld } from "./templates/ReceiptWorld";
import { MapDemo } from "./kit/MapDemo";
import { KitSheet, KitSheetDevices } from "./kit/KitSheet";
import type { KineticProps, MontageProps, StatProps, WorldProps } from "./lib/types";

const FPS = 30;
const TAIL_MS = 250;
const meta =
  <P extends { durationMs: number }>(): CalculateMetadataFunction<P> =>
  ({ props }) => ({ durationInFrames: Math.max(1, Math.ceil(((props.durationMs + TAIL_MS) / 1000) * FPS)) });
const metaCaptioned: CalculateMetadataFunction<CaptionedVideoProps> = ({ props }) => ({
  durationInFrames: Math.max(1, Math.ceil((props.durationMs / 1000) * FPS)),
});

const empty = { durationMs: 3000, voSrc: "assets/sfx/tick-synth.mp3", captions: [], captionStyle: "hormozi" as const, scenes: [] };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Avatar3D" component={Avatar3D} width={1080} height={1080} fps={FPS} durationInFrames={1} defaultProps={{ bg: "#FFE8C2", drop: "#2EC4B6" }} />
    <Composition id="KitSheet" component={KitSheet} width={1920} height={1080} fps={FPS} durationInFrames={30} />
    <Composition id="MapDemo" component={MapDemo} width={1920} height={1080} fps={FPS} durationInFrames={30} />
    <Composition id="KitSheetDevices" component={KitSheetDevices} width={1920} height={1080} fps={FPS} durationInFrames={60} />
    <Composition id="Receipt" component={ReceiptWorld} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={{ ...empty, captionStyle: "hormozi" } as WorldProps} calculateMetadata={meta<WorldProps>()} />
    <Composition id="LongForm" component={ReceiptWorld} width={1920} height={1080} fps={FPS} durationInFrames={90} defaultProps={{ ...empty, captionStyle: "karaoke" } as WorldProps} calculateMetadata={meta<WorldProps>()} />
    <Composition id="Kinetic" component={KineticExplainer} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as KineticProps} calculateMetadata={meta<KineticProps>()} />
    <Composition id="Stat" component={StatReveal} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as StatProps} calculateMetadata={meta<StatProps>()} />
    <Composition id="Pizza3D" component={Pizza3D} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as unknown as PizzaProps} calculateMetadata={meta<PizzaProps>()} />
    <Composition id="Carts3D" component={Carts3D} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as unknown as CartsProps} calculateMetadata={meta<CartsProps>()} />
    <Composition id="Reply3D" component={Reply3D} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as unknown as ReplyProps} calculateMetadata={meta<ReplyProps>()} />
    <Composition id="Inquiry3D" component={Inquiry3D} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as unknown as InquiryProps} calculateMetadata={meta<InquiryProps>()} />
    <Composition id="NoShows3D" component={NoShows3D} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as unknown as NoShowsProps} calculateMetadata={meta<NoShowsProps>()} />
    <Composition id="PageSpeed3D" component={PageSpeed3D} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as unknown as SpeedProps} calculateMetadata={meta<SpeedProps>()} />
    <Composition id="Trades3D" component={Trades3D} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as unknown as TradesProps} calculateMetadata={meta<TradesProps>()} />
    <Composition id="AgentReply3D" component={AgentReply3D} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as unknown as AgentProps} calculateMetadata={meta<AgentProps>()} />
    <Composition id="Coke3D" component={Coke3D} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as unknown as CokeProps} calculateMetadata={meta<CokeProps>()} />
    <Composition id="Penny3D" component={Penny3D} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as unknown as PennyProps} calculateMetadata={meta<PennyProps>()} />
    <Composition id="MapCompare3D" component={MapCompare3D} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={{ ...empty, stops: [] } as unknown as MapProps} calculateMetadata={meta<MapProps>()} />
    <Composition id="Hybrid" component={Hybrid} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as unknown as HybridProps} calculateMetadata={meta<HybridProps>()} />
    <Composition id="Delta3D" component={Delta3D} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as unknown as D3Props} calculateMetadata={meta<D3Props>()} />
    <Composition id="Morph" component={Morph} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as unknown as MorphProps} calculateMetadata={meta<MorphProps>()} />
    <Composition id="Footage" component={Footage} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as FootageProps} calculateMetadata={meta<FootageProps>()} />
    <Composition id="Montage" component={FastCutMontage} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as MontageProps} calculateMetadata={meta<MontageProps>()} />
    <Composition
      id="CaptionedVideo"
      component={CaptionedVideo}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={90}
      defaultProps={{ videoSrc: "", captions: [], style: "hormozi", durationMs: 3000 } as CaptionedVideoProps}
      calculateMetadata={metaCaptioned}
    />
    {/* pilot formats (2026-10-31): props carry durationSec, no VO pipeline yet */}
    <Composition id="Pov3D" component={Pov3D} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={empty as unknown as PovProps} calculateMetadata={meta<PovProps>()} />
    <Composition id="ChatMock" component={ChatMock} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={{ ...empty, x: { threads: [], show: [{ at: 0, thread: 0 }] } } as unknown as ChatProps} calculateMetadata={meta<ChatProps>()} />
    <Composition id="MissedCall" component={MissedCall} width={1080} height={1920} fps={FPS} durationInFrames={90} defaultProps={{ ...empty, x: {} } as unknown as MissedCallProps} calculateMetadata={meta<MissedCallProps>()} />
  </>
);
