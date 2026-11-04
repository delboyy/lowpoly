// Separate entry point for carousel stills and slideshow reels, so the main Root.tsx stays untouched.
// npx remotion still src/carousel/index.ts CarouselSlide out.png --props=slide.json
import { registerRoot } from "remotion";
import { CarouselRoot } from "./Root";

registerRoot(CarouselRoot);
