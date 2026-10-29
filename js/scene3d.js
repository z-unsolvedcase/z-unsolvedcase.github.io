// 3D location viewer (three.js). Loads the Blender-exported GLBs, lights them in real time, and
// lets the player orbit and tap hotspots. Hotspot positions arrive from the server already filtered
// by role, so a Field Agent literally sees markers that the Archivist does not.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const b2t = (p) => new THREE.Vector3(p[0], p[2], -p[1]); // Blender (x,y,z-up) -> three (x,y-up,-z)
const QUALITY = { low: { pr: 1, aa: false }, medium: { pr: 1.5, aa: true }, high: { pr: 2, aa: true } };

function iconTexture(kind, color) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  g.translate(64, 64);
  g.lineWidth = 7; g.strokeStyle = color; g.fillStyle = color;
  g.shadowColor = color; g.shadowBlur = 14;
  if (kind === "new") {
    g.beginPath(); g.arc(0, 0, 38, 0, 7); g.stroke();
    g.shadowBlur = 0; g.font = "bold 48px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", 0, 4);
  } else if (kind === "held") {
    g.beginPath(); g.moveTo(0, -42); g.lineTo(42, 0); g.lineTo(0, 42); g.lineTo(-42, 0); g.closePath(); g.stroke();
    g.shadowBlur = 0; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill();
  } else if (kind === "shared") {
    g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 30, 0, 7); g.stroke();
    g.shadowBlur = 0; g.lineWidth = 8; g.beginPath(); g.moveTo(-14, 2); g.lineTo(-3, 13); g.lineTo(15, -10); g.stroke();
  } else if (kind === "taken") {
    g.lineWidth = 6; g.strokeRect(-26, -22, 52, 44);
    g.shadowBlur = 0; g.beginPath(); g.arc(0, 0, 8, 0, 7); g.fill();
  } else if (kind === "ping") {
    g.lineWidth = 9; g.beginPath(); g.arc(0, 0, 50, 0, 7); g.stroke();
  } else { // flavor: a small dot with a faint ring
    g.lineWidth = 4; g.globalAlpha = 0.7; g.beginPath(); g.arc(0, 0, 22, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const COLORS = { new: "#ffc05a", held: "#6fe0d2", shared: "#8fd49a", taken: "#9aa3b2", flavor: "#d8dde8" };

export class SceneView {
  constructor(canvas, opts) {
    this.canvas = canvas;
    this.onTap = opts.onTap || (() => {});
    this.onLoading = opts.onLoading || (() => {});
    this.quality = opts.quality || "medium";
    this.fpsCap = opts.fps || 60;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: QUALITY[this.quality].aa, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.loader = new GLTFLoader();
    this.cache = new Map();   // scene id -> { scene, mood, cam, ... }
    this.active = null;
    this.hotspots = [];       // { id, state, pos(Vector3), sprite }
    this.pings = [];
    this.tex = {};
    for (const k of Object.keys(COLORS)) this.tex[k] = iconTexture(k, COLORS[k]);
    this.tex.ping = iconTexture("ping", "#ffffff");
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.05, 60);
    this.orbit = null;
    this.ptr = new Map();
    this.running = false;
    this.last = 0;
    this.lastPinch = 0;
    this.bind();
    this.resize();
    this.setQuality(this.quality, this.fpsCap);
  }

  setQuality(q, fps) {
    this.quality = q; this.fpsCap = fps || this.fpsCap;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, QUALITY[q].pr));
    this.resize();
  }

  async load(info) {
    if (this.cache.has(info.id)) return this.cache.get(info.id);
    this.onLoading(true, info.name);
    const gltf = await this.loader.loadAsync(`assets/scenes/${info.glb}`);
    const scene = new THREE.Scene();
    const mood = info.mood || {};
    const bg = new THREE.Color(mood.fog != null ? mood.fog : 0x05080c);
    scene.background = bg;
    scene.fog = new THREE.FogExp2(bg, 0.035);
    scene.add(gltf.scene);
    scene.add(new THREE.HemisphereLight(0x8fa4d8, 0x1a1410, (mood.ambient != null ? mood.ambient : 0.3) * 1.4));
    for (const L of info.lights || []) {
      const l = new THREE.PointLight(new THREE.Color(L.color), L.intensity, L.distance || 8, 2);
      l.position.copy(b2t(L.pos));
      scene.add(l);
    }
    const hot = new THREE.Group();
    scene.add(hot);
    const c = info.camera;
    const target = b2t(c.target), pos = b2t(c.pos);
    const off = pos.clone().sub(target);
    const radius = off.length();
    const orbit = {
      target, radius, minR: c.minDist || 2, maxR: c.maxDist || 10,
      theta: Math.atan2(off.x, off.z), phi: Math.acos(Math.max(-1, Math.min(1, off.y / radius))),
      theta0: 0, phi0: 0, vt: 0, vp: 0
    };
    orbit.theta0 = orbit.theta; orbit.phi0 = orbit.phi;
    const rec = { id: info.id, scene, hot, orbit, exposure: mood.exposure || 1 };
    this.cache.set(info.id, rec);
    this.onLoading(false);
    return rec;
  }

  async show(info) {
    const rec = await this.load(info);
    this.active = rec;
    this.orbit = rec.orbit;
    this.renderer.toneMappingExposure = rec.exposure;
    this.rebuildHotspots();
    return rec;
  }

  setHotspots(list) {
    this.pending = list;
    this.rebuildHotspots();
  }

  rebuildHotspots() {
    if (!this.active) return;
    const hot = this.active.hot;
    while (hot.children.length) { const s = hot.children.pop(); s.material.dispose(); }
    this.hotspots = [];
    for (const h of this.pending || []) {
      const mat = new THREE.SpriteMaterial({ map: this.tex[h.state] || this.tex.flavor, depthTest: false, depthWrite: false, transparent: true, opacity: h.state === "taken" ? 0.65 : 1 });
      const sp = new THREE.Sprite(mat);
      sp.position.copy(b2t(h.pos));
      sp.renderOrder = 20;
      const base = h.state === "new" ? 0.26 : h.state === "flavor" ? 0.16 : 0.2;
      sp.scale.setScalar(base);
      hot.add(sp);
      this.hotspots.push({ id: h.id, state: h.state, by: h.by, bpos: h.pos, pos: sp.position, sprite: sp, base, ph: Math.random() * 6 });
    }
  }

  ping(bpos, color) {
    if (!this.active) return;
    const mat = new THREE.SpriteMaterial({ map: this.tex.ping, depthTest: false, depthWrite: false, transparent: true, color: new THREE.Color(color) });
    const sp = new THREE.Sprite(mat);
    sp.position.copy(b2t(bpos));
    sp.renderOrder = 30;
    this.active.hot.add(sp);
    this.pings.push({ sp, t0: performance.now(), root: this.active.hot });
  }

  // ---- input
  bind() {
    const el = this.canvas;
    el.style.touchAction = "none";
    el.addEventListener("pointerdown", (e) => {
      el.setPointerCapture(e.pointerId);
      this.ptr.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now() });
      if (this.ptr.size === 2) this.lastPinch = this.pinchDist();
    });
    el.addEventListener("pointermove", (e) => {
      const p = this.ptr.get(e.pointerId);
      if (!p || !this.orbit) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      if (this.ptr.size === 1) {
        const o = this.orbit;
        o.theta -= dx * 0.005; o.phi -= dy * 0.004;
        o.vt = -dx * 0.005; o.vp = -dy * 0.004;
        this.clampOrbit();
      } else if (this.ptr.size === 2) {
        const d = this.pinchDist();
        if (this.lastPinch) this.orbit.radius = Math.max(this.orbit.minR, Math.min(this.orbit.maxR, this.orbit.radius * (this.lastPinch / d)));
        this.lastPinch = d;
      }
    });
    const up = (e) => {
      const p = this.ptr.get(e.pointerId);
      this.ptr.delete(e.pointerId);
      if (!p) return;
      const moved = Math.hypot(e.clientX - p.sx, e.clientY - p.sy);
      if (moved < 10 && performance.now() - p.t < 600 && this.ptr.size === 0) this.tap(e.clientX, e.clientY);
      this.lastPinch = 0;
    };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", (e) => { this.ptr.delete(e.pointerId); });
    el.addEventListener("wheel", (e) => {
      if (!this.orbit) return;
      e.preventDefault();
      this.orbit.radius = Math.max(this.orbit.minR, Math.min(this.orbit.maxR, this.orbit.radius * (1 + Math.sign(e.deltaY) * 0.08)));
    }, { passive: false });
    window.addEventListener("resize", () => this.resize());
    if (window.ResizeObserver) new ResizeObserver(() => this.resize()).observe(el.parentElement || el);
  }

  pinchDist() {
    const [a, b] = [...this.ptr.values()];
    return Math.hypot(a.x - b.x, a.y - b.y) || 1;
  }

  clampOrbit() {
    const o = this.orbit;
    o.theta = Math.max(o.theta0 - 0.95, Math.min(o.theta0 + 0.95, o.theta));
    o.phi = Math.max(Math.max(0.35, o.phi0 - 0.5), Math.min(Math.min(1.75, o.phi0 + 0.45), o.phi));
  }

  tap(cx, cy) {
    const r = this.canvas.getBoundingClientRect();
    let best = null, bd = 44; // px; generous for fingers
    const v = new THREE.Vector3();
    for (const h of this.hotspots) {
      v.copy(h.pos).project(this.camera);
      if (v.z > 1) continue;
      const sx = r.left + (v.x * 0.5 + 0.5) * r.width, sy = r.top + (-v.y * 0.5 + 0.5) * r.height;
      const d = Math.hypot(sx - cx, sy - cy);
      if (d < bd) { bd = d; best = h; }
    }
    if (best) this.onTap({ id: best.id, state: best.state, by: best.by, pos: best.bpos });
  }

  resize() {
    const p = this.canvas.parentElement || this.canvas;
    const w = Math.max(1, p.clientWidth), h = Math.max(1, p.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // keep the same horizontal coverage on tall phone screens
    this.camera.fov = w / h < 0.8 ? 66 : 50;
    this.camera.updateProjectionMatrix();
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = (t) => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      if (t - this.last < 1000 / this.fpsCap - 2) return;
      this.last = t;
      this.frame(t);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() { this.running = false; cancelAnimationFrame(this.raf); }

  frame(t) {
    if (!this.active || !this.orbit) return;
    const o = this.orbit;
    if (this.ptr.size === 0) { // a little inertia
      o.theta += o.vt; o.phi += o.vp; o.vt *= 0.9; o.vp *= 0.9;
      this.clampOrbit();
    }
    const sp = Math.sin(o.phi);
    this.camera.position.set(o.target.x + o.radius * sp * Math.sin(o.theta), o.target.y + o.radius * Math.cos(o.phi), o.target.z + o.radius * sp * Math.cos(o.theta));
    this.camera.lookAt(o.target);
    const s = t / 1000;
    for (const h of this.hotspots) {
      if (h.state === "new") h.sprite.scale.setScalar(h.base * (1 + 0.14 * Math.sin(s * 3 + h.ph)));
    }
    for (let i = this.pings.length - 1; i >= 0; i--) {
      const p = this.pings[i], k = (performance.now() - p.t0) / 2600;
      if (k >= 1) { p.root.remove(p.sp); p.sp.material.dispose(); this.pings.splice(i, 1); continue; }
      p.sp.scale.setScalar(0.2 + k * 0.9);
      p.sp.material.opacity = 1 - k;
    }
    this.renderer.render(this.active.scene, this.camera);
  }

  // for automated tests: where would a hotspot be on screen?
  screenPos(id) {
    const h = this.hotspots.find((x) => x.id === id);
    if (!h) return null;
    const r = this.canvas.getBoundingClientRect();
    const v = h.pos.clone().project(this.camera);
    return { x: r.left + (v.x * 0.5 + 0.5) * r.width, y: r.top + (-v.y * 0.5 + 0.5) * r.height, visible: v.z < 1 };
  }
}
