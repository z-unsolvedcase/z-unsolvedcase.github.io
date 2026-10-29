// App bootstrap, routing and the in-game shell.
import { h, clear } from "./dom.js";
import { ctx, applySettings } from "./ctx.js";
import { Net } from "./net.js";
import { audio } from "./audio.js";
import { voice } from "./voice.js";
import { toast, sheet, confirmSheet, cardSheet, partySheet, settingsSheet, logSheet, howToSheet, closeAllSheets } from "./sheets.js";
import { entryScreen, lobbyScreen, briefingOverlay, reportOverlay, resultScreen } from "./screens.js";
import { createScenePanel } from "./panels/scene.js";
import { createEvidencePanel } from "./panels/evidence.js";
import { createSuspectsPanel } from "./panels/suspects.js";
import { createBoardPanel } from "./panels/board.js";
import { createChatPanel } from "./panels/chat.js";

const root = document.getElementById("app");
ctx.net = new Net();
ctx.audio = audio;
ctx.voice = voice;
applySettings();

let view = null;          // "entry" | "lobby" | "game" | "result"
let lobby = null, game = null, result = null, banner = null;
let pendingOpen = null;   // card id to open when the next state arrives

const saveSession = () => { try { localStorage.setItem("uc.session", JSON.stringify(ctx.session)); } catch {} };
const loadSession = () => { try { return JSON.parse(localStorage.getItem("uc.session") || "null"); } catch { return null; } };
const clearSession = () => { ctx.session = null; try { localStorage.removeItem("uc.session"); } catch {} };

// ------------------------------------------------------------------ entry
function showEntry(code) {
  view = "entry";
  game = lobby = result = null;
  closeAllSheets();
  clear(root).append(entryScreen({
    code,
    onCreate: (name, caseId) => connect({ t: "hello", create: true, name, caseId: caseId || "case1" }, name),
    onJoin: (c, name) => connect({ t: "hello", code: c, name }, name)
  }));
}

function connect(hello, name) {
  audio.unlock();
  ctx.session = { name };
  ctx.net.close();
  ctx.net = new Net();
  ctx.net.connect(hello);
}

// ------------------------------------------------------------------ game shell
const TABS = [["scene", "🔍", "Scene"], ["evidence", "🗂", "Evidence"], ["suspects", "👤", "Suspects"], ["board", "📌", "Board"], ["chat", "💬", "Chat"]];

function buildGame() {
  const panels = {
    scene: createScenePanel(), evidence: createEvidencePanel(), suspects: createSuspectsPanel(),
    board: createBoardPanel(), chat: createChatPanel()
  };
  const title = h("div", { class: "grow" });
  const goals = h("div", { class: "goal-bar" }, h("i"));
  const head = h("header", { class: "topbar" },
    title,
    h("button", { class: "icon-btn", "aria-label": "Hint", onclick: hintSheet }, "💡"),
    h("button", { class: "icon-btn", "aria-label": "Case log", onclick: logSheet }, "📜"),
    h("button", { class: "icon-btn", "aria-label": "Party", onclick: partySheet }, "👥"),
    h("button", { class: "icon-btn", "aria-label": "Settings", onclick: settingsSheet }, "⚙"));
  const stage = h("div", { class: "stage" });
  const badges = {};
  const nav = h("nav", { class: "tabbar", role: "tablist" });
  let cur = null;
  const tabEls = {};
  for (const [id, ico, label] of TABS) {
    const b = h("span", { class: "badge-dot hidden" });
    badges[id] = b;
    tabEls[id] = h("button", { class: "tab", role: "tab", "aria-label": label, onclick: () => select(id) }, h("span", { class: "ti" }, ico, b), h("small", {}, label));
    nav.append(tabEls[id]);
    panels[id].el.classList.add("hidden");
    stage.append(panels[id].el);
  }
  const reportO = reportOverlay();
  const el = h("main", { class: "game" }, head, goals, stage, nav);

  function select(id) {
    if (cur === id) return;
    if (cur) { panels[cur].hide(); panels[cur].el.classList.add("hidden"); tabEls[cur].classList.remove("on"); tabEls[cur].setAttribute("aria-selected", "false"); }
    cur = id;
    panels[id].el.classList.remove("hidden");
    tabEls[id].classList.add("on"); tabEls[id].setAttribute("aria-selected", "true");
    panels[id].show();
    badges[id].classList.add("hidden");
    if (ctx.state) refreshBadges(ctx.state);
  }

  let prevCards = null;
  function refreshBadges(s) {
    const set = (id, on) => badges[id].classList.toggle("hidden", !on || cur === id);
    set("suspects", panels.suspects.hasUnread(s));
    set("chat", ctx.unreadChat > 0);
    const n = s.cards.length + s.mine.length;
    if (prevCards !== null && n > prevCards) set("evidence", true);
    if (cur === "evidence") prevCards = n;
    if (prevCards === null) prevCards = n;
    set("board", s.proposals.links.some((p) => p.by !== s.you) || (s.proposals.accuse && !(s.you in s.proposals.accuse.votes)));
  }

  function update(s) {
    title.replaceChildren(h("strong", {}, s.chapter.title), h("small", {}, s.chapter.question));
    goals.firstChild.style.width = (s.chapter.goalsTotal ? (s.chapter.goalsDone / s.chapter.goalsTotal) * 100 : 0) + "%";
    for (const id in panels) panels[id].update(s);
    refreshBadges(s);
    if (s.phase === "report") { if (!reportO.el.isConnected) document.body.append(reportO.el); reportO.update(s); }
    else if (reportO.el.isConnected) reportO.el.remove();
    if (!cur) select("scene");
  }
  ctx.on("unread", () => ctx.state && refreshBadges(ctx.state));
  return { el, update, select, cleanup() { reportO.el.remove(); }, accuse: () => panels.board.openAccuse() };
}

function hintSheet() {
  const s = ctx.state;
  const sh = sheet({ title: "Need a nudge?", render: (b) => {
    if (s.hints.revealed.length) b.append(h("ol", { class: "hints" }, s.hints.revealed.map((t) => h("li", {}, t))));
    b.append(h("p", { class: "muted" }, s.hints.left ? `${s.hints.left} hint${s.hints.left > 1 ? "s" : ""} left in this chapter. Using many costs a star.` : "No more hints for this chapter."));
    if (s.hints.left) b.append(h("div", { class: "row end" }, h("button", { class: "btn", onclick: () => { ctx.send({ t: "hint" }); sh.close(); } }, "Reveal a hint")));
  } });
}

// ------------------------------------------------------------------ routing
function route(s) {
  const want = s.phase === "lobby" ? "lobby" : s.phase === "result" ? "result" : "game";
  if (want !== view) {
    closeAllSheets();
    if (view === "game" && game) game.cleanup();
    view = want;
    clear(root);
    if (want === "lobby") { lobby = lobbyScreen(); root.append(lobby.el); audio.setMood("lobby"); try { if (!localStorage.getItem("uc.seenHowTo")) { localStorage.setItem("uc.seenHowTo", "1"); setTimeout(howToSheet, 300); } } catch {} }
    else if (want === "game") { game = buildGame(); root.append(game.el); }
    else { result = resultScreen(); root.append(result.el); }
  }
  if (view === "lobby") lobby.update(s);
  else if (view === "game") game.update(s);
  else result.update(s);
}

// ------------------------------------------------------------------ network events
ctx.on("msg:welcome", (m) => {
  ctx.pid = m.pid;
  ctx.info = m.info;
  ctx.chat = (m.backlog && m.backlog.chat) || [];
  ctx.session = { code: m.code, token: m.token, name: (ctx.session && ctx.session.name) || "Detective" };
  saveSession();
  voice.setIce(m.ice);
  if (location.search) history.replaceState(null, "", location.pathname);
});

ctx.on("msg:state", (m) => {
  ctx.state = m.s;
  route(m.s);
  ctx.emit("state", m.s);
  if (pendingOpen && ctx.card(pendingOpen)) { const id = pendingOpen; pendingOpen = null; cardSheet(id); }
});

ctx.on("msg:err", (m) => {
  if (m.fatal) { clearSession(); ctx.net.close(); showEntry(); toast(m.msg || "Disconnected.", "bad", 6000); return; }
  toast(m.msg, "bad"); audio.sfx("bad");
});
ctx.on("msg:toast", (m) => { toast(m.text, m.kind === "good" ? "good" : m.kind === "bad" ? "bad" : ""); if (m.kind === "bad") audio.sfx("bad"); });
ctx.on("msg:found", (m) => {
  audio.sfx(m.again ? "ping" : "found");
  if (!m.again || true) pendingOpen = m.id;
});
ctx.on("msg:lab_done", (m) => { audio.sfx("lab"); });
ctx.on("msg:briefing", (m) => { if (view === "game" || view === "lobby" || true) briefingOverlay(m); });
ctx.on("msg:emote", (m) => {
  const p = ctx.player(m.pid);
  if (!p || ctx.muted.has(m.pid)) return;
  const f = h("div", { class: "float-emoji", style: { left: 10 + Math.random() * 70 + "%" } }, m.e, h("small", {}, p.name));
  document.body.append(f);
  setTimeout(() => f.remove(), 2200);
});

// connection banner
ctx.on("online", (on) => {
  if (on) { if (banner) { banner.remove(); banner = null; } }
  else if (view && view !== "entry" && !banner) { banner = h("div", { class: "conn-banner", role: "status" }, "Connection lost. Reconnecting…"); document.body.append(banner); }
});
ctx.on("reconnecting", (n) => {
  if (n >= 6 && !ctx.net.online) { /* give up gracefully after ~30s of retries, keep trying in background */ }
});

// push-to-talk with the space bar
addEventListener("keydown", (e) => { if (e.code === "Space" && ctx.settings.pushToTalk && voice.joined && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); voice.talk(true); } });
addEventListener("keyup", (e) => { if (e.code === "Space" && ctx.settings.pushToTalk && voice.joined) voice.talk(false); });
document.addEventListener("pointerdown", () => audio.unlock(), { once: true });
document.addEventListener("visibilitychange", () => { if (!document.hidden && ctx.net && !ctx.net.online && ctx.net.hello) ctx.net._open(); });

// ------------------------------------------------------------------ boot
const q = new URLSearchParams(location.search);
const joinCode = (q.get("join") || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
const saved = loadSession();
if (saved && saved.code && saved.token && (!joinCode || joinCode === saved.code)) {
  ctx.session = saved;
  ctx.net.connect({ t: "hello", code: saved.code, token: saved.token, name: saved.name });
  clear(root).append(h("main", { class: "screen" }, h("p", { class: "muted center" }, "Rejoining your party…")));
  setTimeout(() => { if (!ctx.state) { clearSession(); ctx.net.close(); ctx.net = new Net(); showEntry(joinCode); } }, 8000);
} else showEntry(joinCode);

if ("serviceWorker" in navigator && false) navigator.serviceWorker.register("sw.js");
// test hook
window.__uc = ctx;
