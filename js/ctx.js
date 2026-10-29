// Shared app context: one mutable singleton that every module imports.
import { ctxSettings } from "./dom.js";

const DEFAULTS = {
  quality: "medium",      // low | medium | high
  fps: 60,                // 30 | 60
  music: true,
  musicVol: 0.5,
  voiceLines: true,       // play recorded character voices
  voiceVol: 1,
  textSize: 1,            // 0.9 | 1 | 1.15 | 1.3
  contrast: false,
  haptics: true,
  pushToTalk: false,
  dataSaver: false,
  deviceVoiceFallback: false
};

function loadSettings() {
  try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem("uc.settings") || "{}")); } catch { return Object.assign({}, DEFAULTS); }
}

export const ctx = {
  net: null, audio: null, voice: null, scene: null,
  info: null,            // static case info from the welcome message
  state: null,           // latest per-player view from the server
  pid: null,
  session: null,         // { code, token, name }
  settings: loadSettings(),
  muted: new Set(),      // player ids the user muted (chat + voice), client side only
  chat: [],              // chat history (backlog + live)
  unreadChat: 0,
  seenLog: {},           // suspect id -> last log id the user has heard/seen
  listeners: {},

  on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || new Set()).add(fn); return () => this.listeners[ev].delete(fn); },
  emit(ev, data) { (this.listeners[ev] || []).forEach((fn) => { try { fn(data); } catch (e) { console.error(ev, e); } }); },
  send(msg) { this.net.send(msg); },

  setting(k, v) {
    this.settings[k] = v;
    try { localStorage.setItem("uc.settings", JSON.stringify(this.settings)); } catch {}
    ctxSettings.haptics = this.settings.haptics;
    applySettings();
    this.emit("settings", k);
  },

  me() { return this.state ? this.state.players.find((p) => p.id === this.state.you) : null; },
  player(id) { return this.state ? this.state.players.find((p) => p.id === id) : null; },
  isHost() { return this.state && this.state.host === this.state.you; },
  card(id) {
    const s = this.state;
    if (!s) return null;
    return s.cards.find((c) => c.id === id) || s.mine.find((c) => c.id === id) || null;
  },
  suspectInfo(id) { return this.info.suspects.find((s) => s.id === id); },
  speakerName(id) {
    const sp = this.info.speakers[id];
    return sp ? sp.name : id;
  }
};

export function applySettings() {
  const r = document.documentElement;
  r.style.setProperty("--fs", String(ctx.settings.textSize));
  r.classList.toggle("hc", !!ctx.settings.contrast);
  ctxSettings.haptics = ctx.settings.haptics;
}
applySettings();
