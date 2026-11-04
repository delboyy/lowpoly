// Fish Audio "drama-3" direction syntax lives inside the VO text. Captions and Kokoro must never see it.
// [any direction]            -> removed   e.g. [barely holding it together] [sigh] [pause]
// <whisper>..</whisper> etc  -> tags removed, words kept (whisper emphasis soft stress fast slow forceful)
// <french>..</french> etc    -> tags removed, words kept
// <|speaker:0|> <|phoneme_start|>..<|phoneme_end|> -> speaker tag removed; phoneme block removed (spell it normally in captions via `captionText`)
export const stripTags = (t) =>
  t
    .replace(/<\|phoneme_start\|>.*?<\|phoneme_end\|>/g, "")
    .replace(/<\|[^|>]*\|>/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/<\/?[a-z]+>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
export const utf8Bytes = (t) => Buffer.byteLength(t, "utf8");
