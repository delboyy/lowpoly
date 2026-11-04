import { useVideoConfig } from "remotion";

/** "Line Item" receipt-world palette (briefs/longform-channel.md §2). Rule: 3 colours max per scene; yellow = the one number. */
export const P = {
  paper: "#F4EFE4",
  receipt: "#FFFDF6",
  ink: "#14130F",
  muted: "#6B665A",
  highlight: "#FFD21F",
  loss: "#E5322D",
  gain: "#1F9D55",
  /** TEXT-ONLY tokens: darker loss/gain for small text on receipt white (#FFFDF6) or paper (#F4EFE4): 5.3-5.4:1 / 4.7-4.8:1 (the bright loss/gain are 4.3:1 and 3.4:1 on receipt white, under 4.5:1). Keep the bright ones for fills, bars, strokes and large display numbers. */
  lossText: "#C92A26",
  gainText: "#177A40",
  night: "#0B0B12",
  night2: "#1B1033",
} as const;

/** Layout helper: u = 1 at 1080px short side. Portrait 1080x1920 and landscape 1920x1080 both give u = 1. */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  return { width, height, portrait, u: Math.min(width, height) / 1080 };
};

/** Outline-weight tokens (viewBox units for the 200x200 illustrations; px at 1080 for CSS-drawn devices). Asset QA checks consistency against these. */
export const STROKE = { illus: 6, icon: 3, detail: 4, hairline: 2 } as const;
