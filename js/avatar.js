// Procedural noir portraits for suspects and detectives (no image files to ship).
// Suspects show visible stress as pressure rises: a sweat drop, then a tremble.
import { svg } from "./dom.js";

const LOOKS = {
  clara: { hair: "bob", hairColor: "#5a3a22", skin: "#e2b894", acc: "cardigan", accColor: "#3f7d4f" },
  rook: { hair: "bald", hairColor: "#555", skin: "#d6a982", acc: "hat", accColor: "#2a2f3a", stache: true },
  ibarra: { hair: "short", hairColor: "#1d1d22", skin: "#c99b78", acc: "glasses", accColor: "#cfd6e0" },
  hale: { hair: "cap", hairColor: "#9a9a9a", skin: "#d2a07a", acc: "cap", accColor: "#1c2a44", stache: true },
  nina: { hair: "long", hairColor: "#2a1a16", skin: "#e5bf9f", acc: "none", accColor: "#7a4b57" },
  det: { hair: "short", hairColor: "#2a2420", skin: "#d8b08c", acc: "none", accColor: "#444" }
};

export function avatar(id, color, size, pressure) {
  const L = LOOKS[id] || LOOKS.det;
  const s = size || 96;
  const e = svg("svg", { viewBox: "0 0 100 100", width: s, height: s, role: "img", "aria-label": "portrait", class: "avatar" + (pressure > 70 ? " tremble" : "") });
  const bg = svg("defs", {}, svg("radialGradient", { id: "g" + id, cx: "50%", cy: "35%", r: "80%" }, svg("stop", { offset: "0", "stop-color": color || "#888", "stop-opacity": "0.55" }), svg("stop", { offset: "1", "stop-color": "#0a0c10" })));
  e.append(bg, svg("rect", { width: 100, height: 100, rx: 14, fill: `url(#g${id})` }));
  // shoulders / jacket
  e.append(svg("path", { d: "M8 100 C10 74 28 66 50 66 C72 66 90 74 92 100 Z", fill: L.acc === "cardigan" ? L.accColor : "#22262e" }));
  e.append(svg("path", { d: "M42 66 L50 82 L58 66 Z", fill: "#e8e2d2" }));
  // neck + head
  e.append(svg("rect", { x: 43, y: 56, width: 14, height: 14, rx: 5, fill: L.skin }));
  if (L.hair === "long") e.append(svg("path", { d: "M26 52 C20 28 34 16 50 16 C66 16 80 28 74 52 C72 62 66 66 64 66 L36 66 C34 66 28 62 26 52 Z", fill: L.hairColor }));
  e.append(svg("ellipse", { cx: 50, cy: 42, rx: 19, ry: 22, fill: L.skin }));
  // hair
  if (L.hair === "bob") e.append(svg("path", { d: "M30 44 C26 20 42 14 50 14 C62 14 76 22 70 44 C68 34 60 28 50 28 C40 28 32 34 30 44 Z", fill: L.hairColor }));
  if (L.hair === "short") e.append(svg("path", { d: "M31 38 C30 20 42 16 50 16 C60 16 71 22 69 38 C64 30 56 27 50 27 C44 27 36 30 31 38 Z", fill: L.hairColor }));
  if (L.hair === "long") e.append(svg("path", { d: "M31 40 C32 22 42 18 50 18 C60 18 69 24 69 40 C64 31 56 28 50 28 C44 28 36 31 31 40 Z", fill: L.hairColor }));
  if (L.hair === "bald") e.append(svg("path", { d: "M31 36 C34 24 42 22 50 22 C58 22 66 24 69 36 C64 30 56 28 50 28 C44 28 36 30 31 36 Z", fill: "#00000022" }));
  if (L.acc === "hat") e.append(svg("path", { d: "M26 34 L74 34 L68 22 C62 14 38 14 32 22 Z", fill: L.accColor }), svg("rect", { x: 22, y: 32, width: 56, height: 5, rx: 2, fill: "#161a22" }));
  if (L.acc === "cap") e.append(svg("path", { d: "M29 34 C30 20 42 16 50 16 C60 16 70 20 71 34 Z", fill: L.accColor }), svg("rect", { x: 28, y: 31, width: 44, height: 4, rx: 2, fill: "#10151f" }));
  // face
  const worried = pressure > 40;
  e.append(svg("ellipse", { cx: 42, cy: 42, rx: 2.4, ry: 2.6, fill: "#14161c" }), svg("ellipse", { cx: 58, cy: 42, rx: 2.4, ry: 2.6, fill: "#14161c" }));
  e.append(svg("path", { d: worried ? "M35 36 L47 38 M65 36 L53 38" : "M36 37 L47 36 M64 37 L53 36", stroke: "#14161c", "stroke-width": 1.8, "stroke-linecap": "round", fill: "none" }));
  if (L.acc === "glasses") e.append(svg("circle", { cx: 42, cy: 42, r: 6, fill: "none", stroke: L.accColor, "stroke-width": 1.4 }), svg("circle", { cx: 58, cy: 42, r: 6, fill: "none", stroke: L.accColor, "stroke-width": 1.4 }), svg("path", { d: "M48 42 L52 42", stroke: L.accColor, "stroke-width": 1.4 }));
  e.append(svg("path", { d: "M50 44 L48 52 L52 52", stroke: "#00000030", "stroke-width": 1.4, fill: "none" }));
  if (L.stache) e.append(svg("path", { d: "M42 55 C46 52 54 52 58 55 C54 57 46 57 42 55 Z", fill: L.hairColor }));
  e.append(svg("path", { d: worried ? "M44 60 C48 57 52 57 56 60" : "M44 58 C48 61 52 61 56 58", stroke: "#3a1f1f", "stroke-width": 2, "stroke-linecap": "round", fill: "none" }));
  if (pressure > 40) e.append(svg("path", { d: "M72 30 C76 36 76 40 72 42 C68 40 68 36 72 30 Z", fill: "#9ed8ff", opacity: 0.85 }));
  return e;
}
