import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts live in /assets/fonts (SIL OFL). Importing this file registers them; delayRender is handled by loadFont.
export const FONT = {
  anton: "GV Anton",
  montserrat: "GV Montserrat",
  inter: "GV Inter",
} as const;

loadFont({ family: FONT.anton, url: staticFile("assets/fonts/Anton-Regular.ttf"), weight: "400" });
loadFont({ family: FONT.montserrat, url: staticFile("assets/fonts/Montserrat-Variable.ttf"), weight: "100 900" });
loadFont({ family: FONT.inter, url: staticFile("assets/fonts/Inter-Variable.ttf"), weight: "100 900" });

export const MONO = "GV Plex Mono";
loadFont({ family: MONO, url: staticFile("assets/fonts/IBMPlexMono-Medium.ttf"), weight: "500" });
loadFont({ family: MONO, url: staticFile("assets/fonts/IBMPlexMono-Bold.ttf"), weight: "700" });
