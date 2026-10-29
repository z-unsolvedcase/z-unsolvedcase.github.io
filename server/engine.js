"use strict";
// Authoritative game engine for Unsolved Case.
// Pure logic, no networking or I/O: the server calls Room methods, then drains queued events
// (room.drain()) and sends each player their own view (room.view(pid)). The solution, other
// players' private finds and the gating rules never leave this file.

const crypto = require("crypto");
const { voiceKey } = require("./voice");

const ROLES = ["field", "analyst", "interrogator", "archivist"];
const ROLE_NAMES = { field: "Field Agent", analyst: "Analyst", interrogator: "Interrogator", archivist: "Archivist" };
const COLORS = ["#e0a458", "#6ba6d6", "#8cc084", "#d68aa8"];
const MAX_PLAYERS = 4;
const EMOJI = ["👍", "❓", "💡", "😮", "🔍", "✅", "❌", "🙏"];
const BAD = /\b(fuck\w*|shit\w*|bitch\w*|cunt|asshole|dick(head)?|bastard|nigg\w+|slut|whore)\b/gi;

const PERSIST = [
  "code", "createdAt", "touchedAt", "hostId", "players", "order", "roleShift", "seq", "chatLog", "feedLog", "reports",
  "phase", "chapter", "shared", "testimonies", "conclusions", "cardOrder", "held", "inspected", "boardLinks", "boardPos",
  "notes", "pending", "accusation", "suspectState", "hintLevel", "hintsUsed", "wrongLinks", "wrongAccusations", "stats", "result"
];

const err = (error) => ({ error });
const good = (extra) => Object.assign({ ok: true }, extra || {});
const cap = (n) => Math.max(0, Math.min(100, n));
const pairKey = (a, b) => [a, b].sort().join("|");
const cleanName = (n) => String(n || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 16) || "Detective";

class Room {
  constructor(C, code) {
    this.C = C;
    this.code = code;
    this.createdAt = this.touchedAt = Date.now();
    this.hostId = null;
    this.players = {};
    this.order = [];
    this.roleShift = 0;
    this.seq = 1;
    this.chatLog = [];
    this.feedLog = [];
    this.reports = [];
    this.voice = new Set();
    this.outbox = [];
    this.rates = {};
    this._resetProgress();
  }

  _resetProgress() {
    this.phase = "lobby";
    this.chapter = 0;
    this.shared = {};        // clue id -> { by, at, analysed, attempts, skipped }
    this.testimonies = {};   // testimony id -> { at }
    this.conclusions = {};   // conclusion id -> { at, via }
    this.cardOrder = [];
    this.held = {};          // pid -> { clue id -> { at } }  found but not yet shared
    this.inspected = {};     // hotspot id -> { by, at }
    this.boardLinks = [];
    this.boardPos = {};
    this.notes = [];
    this.pending = {};       // link proposals waiting for a teammate
    this.accusation = null;
    this.suspectState = {};
    for (const s of this.C.suspects) this.suspectState[s.id] = { pressure: 0, trust: 0, asked: [], used: {}, log: [] };
    this.hintLevel = {};
    this.hintsUsed = 0;
    this.wrongLinks = 0;
    this.wrongAccusations = 0;
    this.stats = { found: {}, links: {}, asked: {} };
    this.result = null;
  }

  // ------------------------------------------------------------ plumbing
  touch() { this.touchedAt = Date.now(); }
  emit(to, msg) { this.outbox.push({ to, msg }); }
  drain() { const o = this.outbox; this.outbox = []; return o; }
  nid(p) { return p + (this.seq++).toString(36); }
  playerList() { return this.order.map((id) => this.players[id]); }
  connected() { return this.playerList().filter((p) => p.connected); }
  isFinalChapter() { return this.chapter >= this.C.chapters.length - 1; }
  backlog() { return { chat: this.chatLog.slice(-60) }; }
  feed(kind, text) {
    this.feedLog.push({ id: this.nid("f"), t: Date.now(), kind, text });
    if (this.feedLog.length > 80) this.feedLog.splice(0, this.feedLog.length - 80);
  }
  toast(to, text, kind) { this.emit(to, { t: "toast", text, kind: kind || "info" }); }
  limited(pid, kind, max, ms) {
    const k = pid + ":" + kind, now = Date.now();
    const a = (this.rates[k] = (this.rates[k] || []).filter((t) => now - t < ms));
    if (a.length >= max) return true;
    a.push(now);
    return false;
  }

  serialize() {
    const out = {};
    for (const k of PERSIST) out[k] = this[k];
    return JSON.parse(JSON.stringify(out));
  }

  static restore(C, d) {
    const r = new Room(C, d.code);
    for (const k of PERSIST) if (d[k] !== undefined) r[k] = d[k];
    for (const p of Object.values(r.players)) p.connected = false;
    // forward-compatible: make sure every suspect has state
    for (const s of C.suspects) if (!r.suspectState[s.id]) r.suspectState[s.id] = { pressure: 0, trust: 0, asked: [], used: {}, log: [] };
    return r;
  }

  // ------------------------------------------------------------ party
  join(name, token) {
    if (token) {
      const p = this.playerList().find((x) => x.token === token);
      if (p) {
        p.connected = true;
        if (!this.players[this.hostId] || !this.players[this.hostId].connected) this.hostId = p.id;
        return { player: p };
      }
    }
    if (this.order.length >= MAX_PLAYERS) return err("This party is full (4 players).");
    const used = new Set(this.playerList().map((p) => p.color));
    const id = "p" + this.seq++;
    const p = {
      id, name: cleanName(name), color: COLORS.find((c) => !used.has(c)) || COLORS[0],
      token: crypto.randomBytes(12).toString("hex"), connected: true, roles: [], scene: this.C.scenes[0].id, joinedAt: Date.now()
    };
    this.players[id] = p;
    this.order.push(id);
    if (!this.players[this.hostId] || !this.players[this.hostId].connected) this.hostId = id;
    this._assignRoles();
    if (this.order.length > 1) this.feed("system", `${p.name} joined the party.`);
    return { player: p };
  }

  _assignRoles() {
    const ids = this.order, n = ids.length;
    if (!n) return;
    const groups = n === 1 ? [[0, 1, 2, 3]] : n === 2 ? [[0, 1], [2, 3]] : n === 3 ? [[0, 1], [2], [3]] : [[0], [1], [2], [3]];
    ids.forEach((id) => (this.players[id].roles = []));
    groups.forEach((g, gi) => { this.players[ids[(gi + this.roleShift) % n]].roles = g.map((i) => ROLES[i]); });
  }

  disconnect(pid) {
    const p = this.players[pid];
    if (!p) return;
    p.connected = false;
    this.voice.delete(pid);
    // never leave a clue stuck in a disconnected player's pocket
    for (const clueId of Object.keys(this.held[pid] || {})) this._share(pid, clueId, true);
    if (this.hostId === pid) {
      const next = this.connected()[0];
      if (next) this.hostId = next.id;
    }
    if (this.order.length > 1) this.feed("system", `${p.name} disconnected. Anything they were holding was shared with the party.`);
    this._resolveAccusation();
  }

  kick(pid, target) {
    if (this.hostId !== pid) return err("Only the host can remove players.");
    if (!this.players[target] || target === pid) return err("Pick a teammate to remove.");
    const t = this.players[target];
    for (const clueId of Object.keys(this.held[target] || {})) this._share(target, clueId, true);
    this.emit(target, { t: "err", msg: "You were removed from the party by the host.", fatal: true });
    delete this.players[target];
    this.order = this.order.filter((id) => id !== target);
    this.voice.delete(target);
    this._assignRoles();
    this.feed("system", `${t.name} was removed from the party.`);
    this._resolveAccusation();
    return good();
  }

  rename(pid, name) { this.players[pid].name = cleanName(name); return good(); }

  setScene(pid, id) {
    if (!this.sceneIds().has(id)) return err("That location is not open yet.");
    this.players[pid].scene = id;
    return good();
  }

  rotateRoles(pid) {
    if (this.hostId !== pid) return err("Only the host can rotate roles.");
    this.roleShift++;
    this._assignRoles();
    this.feed("system", "Roles were rotated.");
    return good();
  }

  // ------------------------------------------------------------ roles & visibility
  holders(role) { return this.order.filter((id) => this.players[id].roles.includes(role)); }

  // You act in a role if you hold it, or if everyone holding it is offline (nobody is ever blocked).
  canUse(pid, role) {
    const p = this.players[pid];
    if (!p) return false;
    return p.roles.includes(role) || this.holders(role).every((h) => !this.players[h].connected);
  }

  visible(pid, hs) { return !hs.roles || !hs.roles.length || hs.roles.some((r) => this.canUse(pid, r)); }

  sceneIds() {
    const s = new Set();
    for (let i = 0; i <= this.chapter && i < this.C.chapters.length; i++) this.C.chapters[i].scenes.forEach((x) => s.add(x));
    return s;
  }

  suspectIds() { return new Set(this.C.chapters[Math.min(this.chapter, this.C.chapters.length - 1)].suspects); }

  hasCard(id) { return !!(this.shared[id] || this.testimonies[id] || this.conclusions[id]); }

  cardTitle(id) {
    const C = this.C;
    return (C.clues[id] || C.testimonies[id] || C.conclusions[id] || { title: id }).title;
  }

  analysed(id) {
    const c = this.C.clues[id];
    if (!c || !c.analysis) return true;
    return !!(this.shared[id] && this.shared[id].analysed);
  }

  // ------------------------------------------------------------ start & chapters
  _briefing() {
    const ch = this.C.chapters[this.chapter];
    this.emit("all", { t: "briefing", chapter: this.chapter, title: ch.title, speaker: ch.intro.speaker, text: ch.intro.text, audio: voiceKey(ch.intro.speaker, ch.intro.text) });
  }

  start(pid) {
    if (this.phase !== "lobby") return err("The case has already started.");
    if (this.hostId !== pid) return err("Only the host can start the case.");
    this.phase = "play";
    this.chapter = 0;
    for (const [id, c] of Object.entries(this.C.clues)) if (c.start && !this.shared[id]) this._addClue(id, null);
    this.feed("story", `Case opened: ${this.C.meta.title}.`);
    this._briefing();
    return good();
  }

  nextChapter(pid, rotate) {
    if (this.hostId !== pid) return err("Only the host can continue.");
    if (this.phase !== "report") return err("The chapter isn't finished yet.");
    if (this.isFinalChapter()) return err("That was the last chapter.");
    this.chapter++;
    this.phase = "play";
    if (rotate) { this.roleShift++; this._assignRoles(); this.feed("system", "Roles were rotated for the new chapter."); }
    const open = this.sceneIds();
    for (const p of this.playerList()) if (!open.has(p.scene)) p.scene = this.C.scenes[0].id;
    this.feed("story", `Chapter ${this.chapter + 1}: ${this.C.chapters[this.chapter].title}.`);
    this._briefing();
    return good();
  }

  _checkChapter() {
    if (this.phase !== "play" || this.isFinalChapter()) return;
    const ch = this.C.chapters[this.chapter];
    if (ch.goals.length && ch.goals.every((g) => this.conclusions[g])) {
      this.phase = "report";
      this.feed("story", `Chapter complete: ${ch.title}.`);
      this.toast("all", `Chapter complete: ${ch.title}`, "good");
    }
  }

  // ------------------------------------------------------------ cards
  _addClue(id, by) {
    if (this.shared[id]) return false;
    this.shared[id] = { by, at: Date.now(), analysed: false, attempts: 0, skipped: false };
    this.cardOrder.push(id);
    return true;
  }
  _addTestimony(id) {
    if (this.testimonies[id]) return false;
    this.testimonies[id] = { at: Date.now() };
    this.cardOrder.push(id);
    return true;
  }
  _addConclusion(id, via) {
    if (this.conclusions[id]) return false;
    this.conclusions[id] = { at: Date.now(), via: via || [] };
    this.cardOrder.push(id);
    return true;
  }

  _findHotspot(id) {
    const open = this.sceneIds();
    for (const s of this.C.scenes) {
      if (!open.has(s.id)) continue;
      const h = s.hotspots.find((x) => x.id === id);
      if (h) return { scene: s, hs: h };
    }
    return null;
  }

  inspect(pid, hotspotId) {
    if (this.phase !== "play") return err("Nothing to inspect right now.");
    const f = this._findHotspot(hotspotId);
    if (!f) return err("You can't reach that.");
    const { hs } = f;
    if (!this.visible(pid, hs)) return err("You can't see anything there.");
    if (hs.flavor) { this.emit(pid, { t: "flavor", id: hs.id, text: hs.flavor }); return good(); }
    const prior = this.inspected[hs.id];
    if (prior) {
      const mine = prior.by === pid && this.held[pid] && this.held[pid][hs.clue];
      if (mine || this.shared[hs.clue]) { this.emit(pid, { t: "found", id: hs.clue, again: true }); return good(); }
      const w = this.players[prior.by];
      return err(`${w ? w.name : "Someone"} already examined this. Ask them to share it.`);
    }
    this.inspected[hs.id] = { by: pid, at: Date.now() };
    this.stats.found[pid] = (this.stats.found[pid] || 0) + 1;
    const clue = this.C.clues[hs.clue];
    const open = !hs.roles || !hs.roles.length;
    if (open) {
      this._addClue(hs.clue, pid);
      this.feed("clue", `${this.players[pid].name} found: ${clue.title}.`);
    } else {
      (this.held[pid] = this.held[pid] || {})[hs.clue] = { at: Date.now() };
      this.feed("clue", `${this.players[pid].name} found something only they can see. They can describe it and share it.`);
    }
    this.emit(pid, { t: "found", id: hs.clue, shared: open });
    return good();
  }

  _share(pid, clueId, silent) {
    const h = this.held[pid];
    if (!h || !h[clueId]) return false;
    delete h[clueId];
    this._addClue(clueId, pid);
    if (!silent) this.feed("clue", `${this.players[pid].name} shared: ${this.C.clues[clueId].title}.`);
    return true;
  }

  share(pid, clueId) {
    if (!this._share(pid, clueId)) return err("You are not holding that clue.");
    return good();
  }

  cardView(id) {
    const C = this.C;
    if (C.clues[id]) {
      const c = C.clues[id], s = this.shared[id] || {};
      const v = { id, type: "clue", kind: c.kind, title: c.title, text: c.text, by: s.by || null };
      if (c.analysis) {
        v.lab = { done: !!s.analysed, prompt: c.analysis.prompt, attempts: s.attempts || 0, canSkip: (s.attempts || 0) >= 2, skipped: !!s.skipped };
        if (s.analysed) v.revealed = c.analysis.revealed;
      }
      if (c.audio) v.audio = { speaker: c.audio.speaker, text: c.audio.text, key: voiceKey(c.audio.speaker, c.audio.text) };
      return v;
    }
    if (C.testimonies[id]) {
      const t = C.testimonies[id];
      return { id, type: "testimony", title: t.title, text: t.text, speaker: t.speaker };
    }
    const k = C.conclusions[id];
    return { id, type: "conclusion", title: k.title, text: k.text };
  }

  sharedCards() { return this.cardOrder.map((id) => this.cardView(id)); }

  _heldView(id) {
    const c = this.C.clues[id];
    const v = { id, type: "clue", kind: c.kind, title: c.title, text: c.text, private: true };
    if (c.analysis) v.lab = { done: false, prompt: c.analysis.prompt, attempts: 0, canSkip: false, needsShare: true };
    if (c.audio) v.audio = { speaker: c.audio.speaker, text: c.audio.text, key: voiceKey(c.audio.speaker, c.audio.text) };
    return v;
  }

  // ------------------------------------------------------------ lab (Analyst)
  _lab(pid, id) {
    const c = this.C.clues[id];
    if (!c || !c.analysis) return { error: "That can't be analysed." };
    const s = this.shared[id];
    if (!s) return { error: "Share the item with the party first." };
    if (s.analysed) return { error: "Already analysed." };
    if (!this.canUse(pid, "analyst")) return { error: "Only the Analyst can run the lab." };
    return { c, s };
  }

  labProbe(pid, id, v) {
    const t = this._lab(pid, id);
    if (t.error) return err(t.error);
    v = Number(v);
    if (!(v >= 0 && v <= 1)) return err("Bad value.");
    const d = Math.abs(v - t.c.analysis.target);
    this.emit(pid, { t: "lab", id, closeness: Math.max(0, Math.min(1, 1 - d / 0.35)) });
    return good();
  }

  labCommit(pid, id, v) {
    const t = this._lab(pid, id);
    if (t.error) return err(t.error);
    v = Number(v);
    if (!(v >= 0 && v <= 1)) return err("Bad value.");
    if (Math.abs(v - t.c.analysis.target) <= t.c.analysis.tolerance) {
      t.s.analysed = true;
      this.feed("lab", `Lab result on "${t.c.title}" is in.`);
      this.emit("all", { t: "lab_done", id });
      return good({ success: true });
    }
    t.s.attempts++;
    return good({ success: false, attempts: t.s.attempts, canSkip: t.s.attempts >= 2 });
  }

  labSkip(pid, id) {
    const t = this._lab(pid, id);
    if (t.error) return err(t.error);
    if (t.s.attempts < 2) return err("Try the lab at least twice before skipping.");
    t.s.analysed = true;
    t.s.skipped = true;
    this.feed("lab", `The lab processed "${t.c.title}" automatically.`);
    this.emit("all", { t: "lab_done", id });
    return good({ success: true });
  }

  // ------------------------------------------------------------ interrogation (Interrogator)
  _suspect(sid) {
    if (!this.suspectIds().has(sid)) return null;
    return this.C.suspects.find((s) => s.id === sid) || null;
  }

  _lock(sid, topic) {
    const st = this.suspectState[sid], rq = topic.requires || {}, unmet = [];
    if ((rq.clues || []).some((c) => !this.shared[c])) unmet.push("evidence");
    if ((rq.cards || []).some((c) => !this.hasCard(c))) unmet.push("evidence");
    if ((rq.minPressure || 0) > st.pressure) unmet.push("pressure");
    if ((rq.minTrust || 0) > st.trust) unmet.push("trust");
    return unmet;
  }

  _log(sid, entry) {
    const st = this.suspectState[sid];
    st.log.push(Object.assign({ id: this.nid("l"), t: Date.now() }, entry));
    if (st.log.length > 60) st.log.shift();
  }

  _testimony(s, id) {
    if (id && this._addTestimony(id)) this.feed("testimony", `${s.name} said something worth noting: ${this.C.testimonies[id].title}.`);
  }

  ask(pid, sid, topicId) {
    if (this.phase !== "play") return err("Not right now.");
    if (!this.canUse(pid, "interrogator")) return err("Only the Interrogator leads the questioning. Suggest a question instead.");
    const s = this._suspect(sid);
    if (!s) return err("You can't question them yet.");
    const topic = s.topics.find((t) => t.id === topicId);
    if (!topic) return err("Unknown question.");
    const st = this.suspectState[sid];
    if (st.asked.includes(topic.id)) return err("You already asked that.");
    if (this._lock(sid, topic).length) return err("You don't have enough to press that yet.");
    st.asked.push(topic.id);
    st.trust = cap(st.trust + (topic.trust || 0));
    this._log(sid, { type: "ask", label: topic.label, speaker: sid, text: topic.answer, audio: voiceKey(sid, topic.answer), by: pid });
    this.stats.asked[pid] = (this.stats.asked[pid] || 0) + 1;
    this._testimony(s, topic.gives);
    return good();
  }

  present(pid, sid, cardId) {
    if (this.phase !== "play") return err("Not right now.");
    if (!this.canUse(pid, "interrogator")) return err("Only the Interrogator can present evidence. Suggest it instead.");
    const s = this._suspect(sid);
    if (!s) return err("You can't question them yet.");
    if (!this.hasCard(cardId)) return err("The party doesn't hold that.");
    if (this.C.clues[cardId] && !this.analysed(cardId)) return err("Run it through the lab first.");
    const st = this.suspectState[sid];
    const rule = s.present.find((p) => p.card === cardId);
    const title = this.cardTitle(cardId);
    if (!rule) {
      this._log(sid, { type: "present", cardTitle: title, speaker: sid, text: s.defaultPresent, audio: voiceKey(sid, s.defaultPresent), by: pid });
      return good();
    }
    const first = !st.used[cardId];
    if (first) {
      st.used[cardId] = true;
      st.pressure = cap(st.pressure + (rule.pressure || 0));
      st.trust = cap(st.trust + (rule.trust || 0));
      this._testimony(s, rule.gives);
    }
    this._log(sid, { type: "present", cardTitle: title, speaker: sid, text: rule.reply, audio: voiceKey(sid, rule.reply), by: pid, repeat: !first });
    return good();
  }

  suggest(pid, sid, kind, id) {
    const s = this._suspect(sid);
    if (!s) return err("Unknown suspect.");
    let text;
    if (kind === "topic") {
      const t = s.topics.find((x) => x.id === id);
      if (!t) return err("Unknown question.");
      text = `suggests asking ${s.name}: "${t.label}"`;
    } else if (kind === "card") {
      if (!this.hasCard(id)) return err("The party doesn't hold that.");
      text = `suggests showing "${this.cardTitle(id)}" to ${s.name}`;
    } else return err("Nothing to suggest.");
    this._pushChat(pid, text, "suggest");
    return good();
  }

  // ------------------------------------------------------------ board
  _linked(a, b) {
    const k = pairKey(a, b);
    return this.boardLinks.some((l) => pairKey(l.a, l.b) === k) || Object.values(this.pending).some((l) => pairKey(l.a, l.b) === k);
  }

  linkProposal(pid, a, b) {
    if (this.phase !== "play") return err("Not right now.");
    if (!a || !b || a === b) return err("Pick two different items.");
    if (!this.hasCard(a) || !this.hasCard(b)) return err("The party doesn't hold both of those.");
    for (const x of [a, b]) if (this.C.clues[x] && !this.analysed(x)) return err(`"${this.cardTitle(x)}" hasn't been through the lab yet.`);
    if (this._linked(a, b)) return err("Those are already linked (or waiting for a teammate).");
    const prop = { id: this.nid("k"), a, b, by: pid, at: Date.now() };
    if (this.connected().length <= 1) return good({ proven: this._resolveLink(prop) });
    this.pending[prop.id] = prop;
    return good({ pending: prop.id });
  }

  linkVote(pid, id, yes) {
    const prop = this.pending[id];
    if (!prop) return err("That link is no longer waiting.");
    if (prop.by === pid) return err("A teammate has to confirm your link.");
    delete this.pending[id];
    if (!yes) { this.feed("board", `${this.players[pid].name} rejected a proposed link.`); return good({ rejected: true }); }
    return good({ proven: this._resolveLink(prop) });
  }

  linkCancel(pid, id) {
    const prop = this.pending[id];
    if (!prop) return err("Nothing to cancel.");
    if (prop.by !== pid && this.hostId !== pid) return err("Only the proposer or the host can cancel.");
    delete this.pending[id];
    return good();
  }

  _resolveLink(prop) {
    const k = pairKey(prop.a, prop.b);
    const rule = this.C.links.find((l) => pairKey(l.pair[0], l.pair[1]) === k);
    this.boardLinks.push({ id: prop.id, a: prop.a, b: prop.b, proven: !!rule, by: prop.by, at: Date.now() });
    this.stats.links[prop.by] = (this.stats.links[prop.by] || 0) + 1;
    if (!rule) { this.wrongLinks++; return false; }
    if (this._addConclusion(rule.gives, [prop.a, prop.b])) {
      this.feed("board", `Link confirmed: ${this.C.conclusions[rule.gives].title}.`);
      this.emit("all", { t: "toast", text: `New conclusion: ${this.C.conclusions[rule.gives].title}`, kind: "good" });
    }
    this._checkChapter();
    return true;
  }

  unlink(pid, id) {
    const i = this.boardLinks.findIndex((l) => l.id === id);
    if (i < 0) return err("No such link.");
    this.boardLinks.splice(i, 1);
    return good();
  }

  boardMove(id, x, y) {
    x = Number(x); y = Number(y);
    if (!this.hasCard(id) || !isFinite(x) || !isFinite(y)) return err("Bad move.");
    this.boardPos[id] = { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
    this.emit("all", { t: "bm", id, x: this.boardPos[id].x, y: this.boardPos[id].y });
    return good();
  }

  noteAdd(pid, text, x, y) {
    text = String(text || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 90);
    if (!text) return err("Empty note.");
    if (this.notes.length >= 30) return err("The board is full of notes.");
    x = Number(x); y = Number(y);
    const note = { id: this.nid("n"), by: pid, text: text.replace(BAD, (m) => "*".repeat(m.length)), x: isFinite(x) ? Math.max(0, Math.min(1, x)) : 0.5, y: isFinite(y) ? Math.max(0, Math.min(1, y)) : 0.5 };
    this.notes.push(note);
    return good({ id: note.id });
  }

  noteMove(id, x, y) {
    const n = this.notes.find((q) => q.id === id);
    x = Number(x); y = Number(y);
    if (!n || !isFinite(x) || !isFinite(y)) return err("Bad move.");
    n.x = Math.max(0, Math.min(1, x)); n.y = Math.max(0, Math.min(1, y));
    this.emit("all", { t: "nm", id, x: n.x, y: n.y });
    return good();
  }

  noteDel(pid, id) {
    const i = this.notes.findIndex((n) => n.id === id);
    if (i < 0) return err("No such note.");
    this.notes.splice(i, 1);
    return good();
  }

  // ------------------------------------------------------------ hints
  hint(pid) {
    if (this.phase !== "play" && this.phase !== "report") return err("No hint right now.");
    const ch = this.C.chapters[this.chapter];
    const lvl = this.hintLevel[ch.id] || 0;
    if (lvl >= ch.hints.length) return err("No more hints for this chapter.");
    this.hintLevel[ch.id] = lvl + 1;
    this.hintsUsed++;
    this.feed("hint", `Hint ${lvl + 1} of ${ch.hints.length}: ${ch.hints[lvl]}`);
    this.toast("all", `Hint ${lvl + 1}: ${ch.hints[lvl]}`, "hint");
    return good();
  }

  // ------------------------------------------------------------ accusation
  accusePropose(pid, sel) {
    if (this.phase !== "play" || !this.isFinalChapter()) return err("Finish the investigation before accusing anyone.");
    if (this.accusation) return err("An accusation is already being voted on.");
    sel = sel || {};
    const A = this.C.accusation;
    if (!A.culprits.includes(sel.culprit)) return err("Choose a suspect.");
    if (!A.motives.some((m) => m.id === sel.motive)) return err("Choose a motive.");
    if (!A.methods.some((m) => m.id === sel.method)) return err("Choose a method.");
    if (!this.conclusions[sel.proof]) return err("Choose a key proof from your conclusions.");
    this.accusation = { by: pid, sel: { culprit: sel.culprit, motive: sel.motive, method: sel.method, proof: sel.proof }, votes: { [pid]: true }, at: Date.now() };
    const who = this.C.suspects.find((s) => s.id === sel.culprit).name;
    this.feed("board", `${this.players[pid].name} proposes naming ${who}. The party must vote.`);
    this._resolveAccusation();
    return good();
  }

  accuseVote(pid, yes) {
    if (!this.accusation) return err("No accusation to vote on.");
    this.accusation.votes[pid] = !!yes;
    this._resolveAccusation();
    return good();
  }

  accuseCancel(pid) {
    if (!this.accusation) return err("Nothing to cancel.");
    if (this.accusation.by !== pid && this.hostId !== pid) return err("Only the proposer or the host can cancel.");
    this.accusation = null;
    return good();
  }

  _resolveAccusation() {
    const a = this.accusation;
    if (!a) return;
    const voters = this.connected().map((p) => p.id);
    if (!voters.length || !voters.every((id) => id in a.votes)) return;
    const yes = voters.filter((id) => a.votes[id]).length, no = voters.length - yes;
    let pass = yes > no;
    if (yes === no) pass = !!a.votes[this.hostId];
    this.accusation = null;
    if (!pass) { this.feed("board", "The party decided not to make that accusation."); this.toast("all", "The accusation was voted down."); return; }
    this._submit(a.sel);
  }

  _submit(sel) {
    const ans = this.C.accusation.answer;
    const culpritOk = sel.culprit === ans.culprit, motiveOk = sel.motive === ans.motive;
    const methodOk = sel.method === ans.method, proofOk = ans.proofs.includes(sel.proof);
    let stars;
    if (!culpritOk) stars = motiveOk && methodOk ? 2 : 1;
    else {
      const k = [motiveOk, methodOk, proofOk].filter(Boolean).length;
      stars = 3 + (k >= 2 ? 1 : 0) + (k === 3 ? 1 : 0);
      const penalty = (this.hintsUsed >= 8 ? 2 : this.hintsUsed >= 4 ? 1 : 0) + this.wrongAccusations + (this.wrongLinks >= 12 ? 1 : 0);
      stars = Math.max(2, stars - penalty);
    }
    const truth = culpritOk ? this.C.epilogue.truth : null;
    this.result = {
      solved: culpritOk, stars, culprit: sel.culprit, culpritOk, motiveOk, methodOk, proofOk,
      text: this.C.epilogue.results[stars], truth, truthAudio: truth ? voiceKey("narrator", truth) : null,
      hintsUsed: this.hintsUsed, wrongLinks: this.wrongLinks, wrongAccusations: this.wrongAccusations
    };
    this.phase = "result";
    this.feed("story", culpritOk ? `Case closed: ${stars} stars.` : "The accusation fell apart.");
  }

  retry(pid) {
    if (this.hostId !== pid) return err("Only the host can reopen the case.");
    if (this.phase !== "result" || !this.result || this.result.solved) return err("There is nothing to reopen.");
    this.result = null;
    this.wrongAccusations++;
    this.phase = "play";
    this.feed("story", "The case was reopened. Each failed accusation costs a star.");
    return good();
  }

  restart(pid) {
    if (this.hostId !== pid) return err("Only the host can restart.");
    this._resetProgress();
    this.roleShift = 0;
    this.feedLog = [];
    this._assignRoles();
    for (const p of this.playerList()) p.scene = this.C.scenes[0].id;
    return good();
  }

  // ------------------------------------------------------------ social
  _pushChat(pid, text, kind) {
    const p = this.players[pid];
    const m = { id: this.nid("c"), t: Date.now(), by: pid, name: p.name, color: p.color, text, kind: kind || "chat" };
    this.chatLog.push(m);
    if (this.chatLog.length > 80) this.chatLog.splice(0, this.chatLog.length - 80);
    this.emit("all", { t: "chat", msg: m });
  }

  chat(pid, text) {
    text = String(text || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 240);
    if (!text) return err("Empty message.");
    if (this.limited(pid, "chat", 6, 6000)) return err("Slow down a little.");
    this._pushChat(pid, text.replace(BAD, (m) => "*".repeat(m.length)), "chat");
    return good();
  }

  emote(pid, e) {
    if (!EMOJI.includes(e)) return err("Unknown reaction.");
    if (this.limited(pid, "emote", 6, 5000)) return err("Too many reactions.");
    this.emit("all", { t: "emote", pid, e });
    return good();
  }

  ping(pid, scene, pos) {
    if (!this.sceneIds().has(scene)) return err("That location is not open.");
    if (!Array.isArray(pos) || pos.length !== 3 || !pos.every((n) => typeof n === "number" && isFinite(n) && Math.abs(n) < 100)) return err("Bad position.");
    if (this.limited(pid, "ping", 5, 4000)) return err("Too many pings.");
    this.emit("all", { t: "ping", pid, scene, pos });
    return good();
  }

  report(pid, target, reason) {
    const t = this.players[target];
    if (!t || target === pid) return err("Pick a teammate to report.");
    this.reports.push({
      at: new Date().toISOString(), by: pid, byName: this.players[pid].name, target, targetName: t.name,
      reason: String(reason || "").slice(0, 300), chat: this.chatLog.slice(-12).map((m) => ({ name: m.name, text: m.text }))
    });
    this.toast(pid, `Thanks. ${t.name} was reported and the chat was saved for review.`);
    return good();
  }

  // ------------------------------------------------------------ views
  view(pid) {
    const C = this.C, ch = C.chapters[this.chapter];
    const open = this.sceneIds();
    const scenes = [];
    for (const s of C.scenes) {
      if (!open.has(s.id)) continue;
      const hotspots = this.phase === "lobby" ? [] : s.hotspots.filter((h) => this.visible(pid, h)).map((h) => {
        const ins = this.inspected[h.id];
        let state = "new", by = null;
        if (h.flavor) state = "flavor";
        else if (ins) {
          by = this.players[ins.by] ? this.players[ins.by].name : null;
          if (this.shared[h.clue]) state = "shared";
          else if (ins.by === pid && this.held[pid] && this.held[pid][h.clue]) state = "held";
          else state = "taken";
        }
        return { id: h.id, pos: h.pos, state, by };
      });
      scenes.push({ id: s.id, name: s.name, hotspots });
    }

    const suspects = [];
    for (const s of C.suspects) {
      if (!this.suspectIds().has(s.id)) continue;
      const st = this.suspectState[s.id];
      suspects.push({
        id: s.id, intro: s.intro, introAudio: voiceKey(s.id, s.intro), pressure: st.pressure, trust: st.trust,
        topics: s.topics.map((t) => {
          const asked = st.asked.includes(t.id);
          const lock = asked ? [] : this._lock(s.id, t);
          const rq = t.requires || {};
          const hide = lock.length && rq.minPressure && lock.includes("pressure") && st.pressure < rq.minPressure * 0.5;
          return { id: t.id, label: hide ? "..." : t.label, status: asked ? "asked" : lock.length ? "locked" : "open", lock };
        }),
        log: st.log.slice(-40), presented: Object.keys(st.used)
      });
    }

    const lvl = this.hintLevel[ch.id] || 0;
    const goals = ch.goals || [];
    return {
      code: this.code, phase: this.phase, you: pid, host: this.hostId,
      players: this.playerList().map((p) => ({
        id: p.id, name: p.name, color: p.color, roles: p.roles, roleNames: p.roles.map((r) => ROLE_NAMES[r]),
        connected: p.connected, scene: p.scene, voice: this.voice.has(p.id),
        found: this.stats.found[p.id] || 0, links: this.stats.links[p.id] || 0, asked: this.stats.asked[p.id] || 0
      })),
      chapter: {
        index: this.chapter, count: C.chapters.length, id: ch.id, title: ch.title, question: ch.question,
        goalsTotal: goals.length, goalsDone: goals.filter((g) => this.conclusions[g]).length, last: this.isFinalChapter()
      },
      intro: { speaker: ch.intro.speaker, text: ch.intro.text, audio: voiceKey(ch.intro.speaker, ch.intro.text) },
      scenes,
      cards: this.sharedCards(),
      mine: Object.keys(this.held[pid] || {}).map((id) => this._heldView(id)),
      suspects,
      board: { links: this.boardLinks, pos: this.boardPos, notes: this.notes },
      proposals: {
        links: Object.values(this.pending).map((l) => ({ id: l.id, a: l.a, b: l.b, by: l.by })),
        accuse: this.accusation ? { by: this.accusation.by, sel: this.accusation.sel, votes: this.accusation.votes } : null
      },
      hints: { used: this.hintsUsed, left: ch.hints.length - lvl, revealed: ch.hints.slice(0, lvl) },
      feed: this.feedLog.slice(-40),
      result: this.result,
      mustLab: Object.keys(this.shared).filter((id) => this.C.clues[id].analysis && !this.shared[id].analysed),
      iCanLab: this.canUse(pid, "analyst"),
      iCanInterrogate: this.canUse(pid, "interrogator")
    };
  }
}

function caseInfo(C) {
  return {
    id: C.id, meta: C.meta,
    speakers: Object.fromEntries(Object.entries(C.speakers).map(([k, v]) => [k, { name: v.name }])),
    roles: ROLES.map((r) => ({ id: r, name: ROLE_NAMES[r] })),
    chapters: C.chapters.map((c, i) => ({ index: i, id: c.id, title: c.title, question: c.question, scenes: c.scenes })),
    suspects: C.suspects.map((s) => ({ id: s.id, name: s.name, age: s.age, role: s.role, color: s.color, bio: s.bio })),
    accusation: { culprits: C.accusation.culprits, motives: C.accusation.motives, methods: C.accusation.methods },
    emoji: EMOJI
  };
}

module.exports = { Room, caseInfo, ROLES, ROLE_NAMES, EMOJI, MAX_PLAYERS };
