import React from "react";
import * as THREE from "three";
import { textTex } from "./LowPoly";

// Business Leaks prop kit (2026-10-30): people, carts, shop fronts, phones, message bubbles, receipts.
// Generic and unbranded so any leak story can reuse them.

/**
 * low-poly person; `walk` 0..1 swings legs and arms (pass a periodic value for loops).
 * v2 (2026-10-30): a face (two eyes, a nose, cheeks), hair, arms and a slight head tilt, so people read as characters
 * rather than pawns. Still flat-shaded and faceted. `mood` -1..1 tilts the head down (sad) or up (happy).
 */
const HAIR = ["#3B2A20", "#6B4226", "#1E1A18", "#C98B4B", "#8E3B2E", "#E6C27A"];
export const Person: React.FC<{ color?: string; skin?: string; walk?: number; hair?: string; mood?: number; /** seated: thighs forward, shins down; hip at y≈0.5 (chair seat height) */ sit?: boolean }> = ({ color = "#4F7CAC", skin = "#E8B98F", walk = 0, hair, mood = 0, sit = false }) => {
  const hairC = hair ?? HAIR[[...color].reduce((a, ch) => a + ch.charCodeAt(0), 0) % HAIR.length];
  const sw = Math.sin(walk * Math.PI * 2) * 0.45;
  const bob = Math.abs(Math.sin(walk * Math.PI * 2)) * 0.04;
  return (
    <group position={[0, sit ? -0.12 : bob, 0]}>
      {sit
        ? [-0.13, 0.13].map((x, i) => (
            <group key={i}>
              <mesh position={[x, 0.62, 0.2]} castShadow>
                <boxGeometry args={[0.18, 0.2, 0.46]} />
                <meshStandardMaterial color="#2F3A4A" flatShading />
              </mesh>
              <mesh position={[x, 0.33, 0.4]} castShadow>
                <boxGeometry args={[0.18, 0.56, 0.2]} />
                <meshStandardMaterial color="#2F3A4A" flatShading />
              </mesh>
            </group>
          ))
        : [-0.13, 0.13].map((x, i) => (
            <group key={i} position={[x, 0.62, 0]} rotation={[i ? -sw : sw, 0, 0]}>
              <mesh position={[0, -0.31, 0]} castShadow>
                <boxGeometry args={[0.18, 0.62, 0.2]} />
                <meshStandardMaterial color="#2F3A4A" flatShading />
              </mesh>
            </group>
          ))}
      <mesh position={[0, 0.98, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.3, 0.75, 6]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      {[-1, 1].map((side, i) => (
        <group key={`a${i}`} position={[side * 0.31, 1.3, 0]} rotation={[(i ? sw : -sw) * 0.8, 0, side * 0.12]}>
          <mesh position={[0, -0.27, 0]} castShadow>
            <boxGeometry args={[0.13, 0.56, 0.15]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
          <mesh position={[0, -0.58, 0]}>
            <icosahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial color={skin} flatShading />
          </mesh>
        </group>
      ))}
      <group position={[0, 1.58, 0]} rotation={[-mood * 0.25, 0, 0.06]}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.27, 1]} />
          <meshStandardMaterial color={skin} flatShading />
        </mesh>
        <mesh position={[0, 0.06, -0.02]} scale={[1.06, 0.8, 1.08]} castShadow>
          <sphereGeometry args={[0.27, 7, 4, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={hairC} flatShading />
        </mesh>
        {[-0.09, 0.09].map((x, i) => (
          <mesh key={`e${i}`} position={[x, 0.01, 0.25]}>
            <boxGeometry args={[0.055, 0.075, 0.03]} />
            <meshStandardMaterial color="#1B1410" />
          </mesh>
        ))}
        <mesh position={[0, -0.06, 0.27]}>
          <boxGeometry args={[0.05, 0.05, 0.04]} />
          <meshStandardMaterial color={skin} flatShading />
        </mesh>
        {[-0.15, 0.15].map((x, i) => (
          <mesh key={`c${i}`} position={[x, -0.07, 0.22]}>
            <boxGeometry args={[0.07, 0.04, 0.02]} />
            <meshStandardMaterial color="#F08A7A" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const Cart: React.FC<{ color?: string; full?: boolean }> = ({ color = "#E05A47", full = true }) => (
  <group>
    <mesh position={[0, 0.55, 0]} castShadow>
      <boxGeometry args={[0.9, 0.5, 0.6]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
    <mesh position={[0, 0.82, 0]}>
      <boxGeometry args={[0.8, 0.04, 0.5]} />
      <meshStandardMaterial color="#9C3B2E" flatShading />
    </mesh>
    {full &&
      [[-0.2, 0, "#F2B33D"], [0.15, 0.08, "#5DB075"], [0.05, -0.1, "#6FA8DC"]].map(([x, z, c], i) => (
        <mesh key={i} position={[x as number, 0.92, z as number]} rotation={[0, i, 0]} castShadow>
          <boxGeometry args={[0.28, 0.28, 0.24]} />
          <meshStandardMaterial color={c as string} flatShading />
        </mesh>
      ))}
    <mesh position={[-0.55, 0.85, 0]} rotation={[0, 0, 0.35]}>
      <boxGeometry args={[0.05, 0.6, 0.55]} />
      <meshStandardMaterial color="#555" flatShading />
    </mesh>
    {[[-0.35, -0.22], [-0.35, 0.22], [0.35, -0.22], [0.35, 0.22]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.12, z]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 6]} />
        <meshStandardMaterial color="#333" flatShading />
      </mesh>
    ))}
  </group>
);

/** simple shop front; `lit` 0..1 turns the window on */
export const ShopFront: React.FC<{ color?: string; sign?: string; lit?: number; w?: number }> = ({ color = "#F4D9B0", sign, lit = 0, w = 2.2 }) => {
  const glow = new THREE.Color("#3A4660").lerp(new THREE.Color("#FFE38A"), lit);
  return (
    <group>
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 2.4, 1.6]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0, 2.55, 0.1]} rotation={[0.25, 0, 0]} castShadow>
        <boxGeometry args={[w + 0.3, 0.12, 1.9]} />
        <meshStandardMaterial color="#C8553D" flatShading />
      </mesh>
      <mesh position={[0, 1.0, 0.81]}>
        <planeGeometry args={[w * 0.7, 1.2]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={lit * 0.7} />
      </mesh>
      {sign ? (
        <mesh position={[0, 2.05, 0.81]}>
          <planeGeometry args={[w * 0.85, 0.5]} />
          <meshStandardMaterial map={textTex(sign, "#2A1A12", 90, 512, 128, undefined, "#FFFFFF")} />
        </mesh>
      ) : null}
    </group>
  );
};

/** chat bubble with short text, faces +z */
export const Bubble: React.FC<{ text: string; bg?: string; ink?: string; w?: number }> = ({ text, bg = "#FFFFFF", ink = "#2A1A12", w = 1.8 }) => {
  // long lines get a smaller font so they never clip the 512 px canvas
  const size = Math.min(90, Math.floor(880 / Math.max(...text.split("\n").map((l) => l.length))));
  return (
  <group>
    <mesh castShadow>
      <boxGeometry args={[w, w * 0.45, 0.12]} />
      <meshStandardMaterial color={bg} emissive={bg} emissiveIntensity={0.18} flatShading />
    </mesh>
    <mesh position={[-w * 0.3, -w * 0.27, 0]} rotation={[0, 0, 0.6]}>
      <boxGeometry args={[0.22, 0.22, 0.1]} />
      <meshStandardMaterial color={bg} emissive={bg} emissiveIntensity={0.18} flatShading />
    </mesh>
    <mesh position={[0, 0, 0.07]}>
      <planeGeometry args={[w * 0.92, w * 0.4]} />
      <meshStandardMaterial map={textTex(text, ink, size, 512, 224, undefined, bg)} emissive="#FFFFFF" emissiveMap={textTex(text, ink, size, 512, 224, undefined, bg)} emissiveIntensity={0.18} />
    </mesh>
  </group>
  );
};

/** chat screen drawn once: header bar + incoming bubbles (no blank screens; v2) */
const chatCache = new Map<string, THREE.CanvasTexture>();
const chatTex = (accent: string, lines: string[]) => {
  const key = accent + lines.join("|");
  const hit = chatCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = 320;
  cv.height = 620;
  const c = cv.getContext("2d")!;
  c.fillStyle = "#F3F6FA";
  c.fillRect(0, 0, 320, 620);
  c.fillStyle = accent;
  c.fillRect(0, 0, 320, 92);
  c.fillStyle = "#FFFFFF";
  c.beginPath();
  c.arc(52, 56, 22, 0, Math.PI * 2);
  c.fill();
  c.fillRect(88, 46, 120, 18);
  lines.forEach((l, i) => {
    const y = 130 + i * 110;
    c.fillStyle = "#FFFFFF";
    c.beginPath();
    c.roundRect(20, y, 250, 80, 22);
    c.fill();
    c.fillStyle = "#1E2A44";
    c.font = "800 34px Helvetica Neue, Arial";
    c.textBaseline = "middle";
    c.fillText(l, 42, y + 40);
  });
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  chatCache.set(key, t);
  return t;
};

/** phone with a bezel, a notch and a lit chat screen; `lines` are the incoming messages */
export const Phone: React.FC<{ screen?: string; glow?: number; lines?: string[]; /** screen switched off (black) */ off?: boolean }> = ({ screen = "#1E2A44", glow = 0.4, lines = ["Hi! Still open?", "Can I book?"], off = false }) => (
  <group>
    <mesh castShadow>
      <boxGeometry args={[0.96, 1.8, 0.12]} />
      <meshStandardMaterial color="#22252B" flatShading roughness={0.5} />
    </mesh>
    <mesh position={[0, 0, 0.065]}>
      <planeGeometry args={[0.82, 1.6]} />
      {off ? <meshStandardMaterial color="#14161B" roughness={0.3} /> : <meshStandardMaterial map={chatTex(screen, lines)} emissive="#FFFFFF" emissiveMap={chatTex(screen, lines)} emissiveIntensity={glow} />}
    </mesh>
    <mesh position={[0, 0.74, 0.07]}>
      <boxGeometry args={[0.26, 0.06, 0.02]} />
      <meshStandardMaterial color="#111317" />
    </mesh>
  </group>
);

/** receipt slip: lines appear as `n` grows (0..lines.length) */
export const Receipt: React.FC<{ lines: string[]; n: number; total?: string }> = ({ lines, n, total }) => {
  const shown = Math.floor(n);
  const h = 0.6 + Math.max(1, shown) * 0.42 + (total ? 0.5 : 0);
  return (
    <group>
      <mesh position={[0, -h / 2, 0]} castShadow>
        <boxGeometry args={[2.2, h, 0.03]} />
        <meshStandardMaterial color="#FFFDF6" emissive="#FFFDF6" emissiveIntensity={0.3} flatShading />
      </mesh>
      {lines.slice(0, shown).map((l, i) => (
        <mesh key={i} position={[0, -0.45 - i * 0.42, 0.02]}>
          <planeGeometry args={[2.0, 0.38]} />
          <meshStandardMaterial map={textTex(l, i === 0 ? "#2A1A12" : "#C8372D", 54, 640, 122, "Courier New, monospace", "#FFFDF6")} emissive="#FFFFFF" emissiveMap={textTex(l, i === 0 ? "#2A1A12" : "#C8372D", 54, 640, 122, "Courier New, monospace", "#FFFDF6")} emissiveIntensity={0.3} />
        </mesh>
      ))}
      {total && shown >= lines.length ? (
        <mesh position={[0, -0.55 - shown * 0.42, 0.02]}>
          <planeGeometry args={[2.0, 0.38]} />
          <meshStandardMaterial map={textTex(total, "#2A1A12", 54, 640, 122, "Courier New, monospace", "#FFE38A")} />
        </mesh>
      ) : null}
    </group>
  );
};

/**
 * chair, optionally with a face on the backrest (the "villain" narrator of a story).
 * Seat faces +z. Face: `lid` 0 open..1 shut, `brow` -1 worried..1 scheming, `smile` -1..1, `look` pupils -1..1 left/right.
 */
export const Chair: React.FC<{ color?: string; face?: boolean; lid?: number; brow?: number; smile?: number; look?: number }> = ({ color = "#E07A5F", face = false, lid = 0, brow = 0, smile = 0, look = 0 }) => {
  const dark = new THREE.Color(color).multiplyScalar(0.72).getStyle();
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.12, 0.85]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      {[[-0.38, -0.36], [0.38, -0.36], [-0.38, 0.36], [0.38, 0.36]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.46, 5]} />
          <meshStandardMaterial color="#3A3F48" flatShading />
        </mesh>
      ))}
      <mesh position={[0, 1.02, -0.38]} castShadow>
        <boxGeometry args={[0.9, 0.95, 0.12]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      {face ? (
        <group position={[0, 1.08, -0.31]}>
          <Face lid={lid} brow={brow} smile={smile} look={look} lidColor={dark} />
        </group>
      ) : null}
    </group>
  );
};

/** cartoon face for prop "characters" (the chair, the spinner): faces +z, ~0.6 wide. Same controls as Chair. */
export const Face: React.FC<{ lid?: number; brow?: number; smile?: number; look?: number; lidColor?: string }> = ({ lid = 0, brow = 0, smile = 0, look = 0, lidColor = "#B5502C" }) => {
  const dark = lidColor;
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.19, 0.06, 0]}>
          <mesh>
            <boxGeometry args={[0.22, 0.22, 0.02]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[look * 0.05, -0.02, 0.015]}>
            <boxGeometry args={[0.09, 0.11, 0.02]} />
            <meshStandardMaterial color="#1B1410" />
          </mesh>
          <mesh position={[0, 0.11 - lid * 0.11, 0.03]} scale={[1, Math.max(0.001, lid), 1]}>
            <boxGeometry args={[0.24, 0.22, 0.02]} />
            <meshStandardMaterial color={dark} flatShading />
          </mesh>
          <mesh position={[0, 0.17, 0.03]} rotation={[0, 0, side * brow * 0.45]}>
            <boxGeometry args={[0.26, 0.05, 0.02]} />
            <meshStandardMaterial color="#1B1410" />
          </mesh>
        </group>
      ))}
      <group position={[0.02, -0.25, 0.02]}>
        <mesh>
          <boxGeometry args={[0.26, 0.045, 0.02]} />
          <meshStandardMaterial color="#1B1410" />
        </mesh>
        <mesh position={[0.15, 0.02 * Math.sign(smile), 0]} rotation={[0, 0, smile * 0.7]}>
          <boxGeometry args={[0.1, 0.045, 0.02]} />
          <meshStandardMaterial color="#1B1410" />
        </mesh>
      </group>
    </group>
  );
};

/** wall clock; `a` = minute-hand angle in radians (pass a periodic value for loops). Faces +z. */
export const WallClock: React.FC<{ a: number; rim?: string }> = ({ a, rim = "#C8553D" }) => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.8, 0.8, 0.14, 12]} />
      <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.2} flatShading />
    </mesh>
    <mesh position={[0, 0, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.9, 0.9, 0.1, 12]} />
      <meshStandardMaterial color={rim} flatShading />
    </mesh>
    <group rotation={[0, 0, a]} position={[0, 0, 0.09]}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.07, 0.6, 0.03]} />
        <meshStandardMaterial color="#1E2A44" />
      </mesh>
    </group>
    <group rotation={[0, 0, a / 12]} position={[0, 0, 0.09]}>
      <mesh position={[0, 0.19, 0]}>
        <boxGeometry args={[0.08, 0.38, 0.03]} />
        <meshStandardMaterial color="#1E2A44" />
      </mesh>
    </group>
  </group>
);

/** mug with steam; `phase` 0..1 loops the steam puffs */
export const Mug: React.FC<{ color?: string; phase: number }> = ({ color = "#2EC4B6", phase }) => (
  <group>
    <mesh position={[0, 0.16, 0]} castShadow>
      <cylinderGeometry args={[0.14, 0.12, 0.32, 8]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
    <mesh position={[0.17, 0.17, 0]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[0.07, 0.025, 4, 8]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
    {[0, 1, 2].map((i) => {
      const k = (phase * 6 + i / 3) % 1;
      return (
        <mesh key={i} position={[Math.sin((k + i) * 6) * 0.05, 0.38 + k * 0.6, 0]} scale={(1 - k) * 0.09 + 0.02}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#FFFFFF" transparent opacity={0.85 * (1 - k)} emissive="#FFFFFF" emissiveIntensity={0.4} flatShading />
        </mesh>
      );
    })}
  </group>
);
