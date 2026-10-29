// Shared UI: toasts, bottom sheets, the card viewer (with the lab mini-game), settings, party, case log.
import { h, clear, throttle, haptic } from "./dom.js";
import { ctx } from "./ctx.js";

// ------------------------------------------------------------------ toasts
export function toast(text, kind, ms) {
  let box = document.getElementById("toasts");
  if (!box) { box = h("div", { id: "toasts", role: "status" }); document.body.append(box); }
  const t = h("div", { class: "toast " + (kind || "") }, text);
  box.append(t);
  while (box.children.length > 4) box.firstChild.remove();
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, ms || 3800);
}

// ------------------------------------------------------------------ sheets
const stack = [];
export function sheet(opts) {
  const back = h("div", { class: "backdrop" });
  const body = h("div", { class: "sheet-body" });
  const closeBtn = h("button", { class: "icon-btn", "aria-label": "Close", onclick: () => api.close() }, "✕");
  const panel = h("section", { class: "sheet" + (opts.wide ? " wide" : ""), role: "dialog", "aria-modal": "true", "aria-label": opts.title || "Dialog" },
    h("header", { class: "sheet-head" }, h("h2", {}, opts.title || ""), closeBtn), body);
  back.append(panel);
  document.body.append(back);
  const api = {
    el: panel, body, closed: false,
    set(title) { panel.querySelector("h2").textContent = title; },
    render(fn) { clear(body); fn(body); },
    close() {
      if (api.closed) return;
      api.closed = true;
      const i = stack.indexOf(api); if (i >= 0) stack.splice(i, 1);
      back.classList.add("out");
      setTimeout(() => back.remove(), 180);
      if (opts.onClose) opts.onClose();
    }
  };
  back.addEventListener("pointerdown", (e) => { if (e.target === back && !opts.modal) api.close(); });
  stack.push(api);
  if (opts.render) api.render(opts.render);
  closeBtn.focus({ preventScroll: true });
  return api;
}
export function closeAllSheets() { for (const s of [...stack]) s.close(); }
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && stack.length) stack[stack.length - 1].close(); });

// refresh helper: a sheet whose body is a pure function of the game state
export function liveSheet(opts, build) {
  const s = sheet(Object.assign({}, opts, { onClose: () => { off(); if (opts.onClose) opts.onClose(); } }));
  const draw = () => { if (!s.closed) { const st = s.body.scrollTop; s.render((b) => build(b, s)); s.body.scrollTop = st; } };
  const off = ctx.on("state", draw);
  draw();
  return s;
}

export function confirmSheet(title, text, yes, onYes) {
  const s = sheet({ title, render: (b) => b.append(h("p", {}, text), h("div", { class: "row end" },
    h("button", { class: "btn ghost", onclick: () => s.close() }, "Cancel"),
    h("button", { class: "btn danger", onclick: () => { s.close(); onYes(); } }, yes))) });
  return s;
}

// ------------------------------------------------------------------ small widgets
export function lineBtn(key, text, speaker, label) {
  const b = h("button", { class: "btn small ghost play", "aria-label": "Play voice line", onclick: async () => {
    ctx.audio.unlock();
    b.classList.add("on");
    const played = await ctx.audio.playLine(key, text, speaker);
    b.classList.remove("on");
    if (!played) toast("No recording for this line yet. The subtitle is the line.", "", 2200);
  } }, "▶ ", label || "Play");
  return b;
}

export function inviteLink() { return `${location.origin}/?join=${ctx.state.code}`; }
export async function shareInvite() {
  const url = inviteLink();
  const text = `Join my detective party for Unsolved Case. Code: ${ctx.state.code}`;
  try { if (navigator.share) { await navigator.share({ title: "Unsolved Case", text, url }); return; } } catch { return; }
  try { await navigator.clipboard.writeText(url); toast("Invite link copied.", "good"); } catch { prompt("Copy this invite link:", url); }
}

const KIND_ICON = { document: "🗎", photo: "🖼", object: "🔎", audio: "📼" };
export function cardIcon(c) {
  if (c.type === "testimony") return "🗣";
  if (c.type === "conclusion") return "💡";
  return KIND_ICON[c.kind] || "🗎";
}
export const TYPE_LABEL = { clue: "Clue", testimony: "Testimony", conclusion: "Conclusion" };

// ------------------------------------------------------------------ lab mini-game
const labValue = {}, labAttempts = {}, scribble = {};
function labWidget(card) {
  const id = card.id;
  if (labValue[id] == null) labValue[id] = 0.5;
  if (!scribble[id]) scribble[id] = Array.from({ length: 7 }, () => 40 + Math.floor(Math.random() * 55));
  if (labAttempts[id] != null && card.lab.attempts > labAttempts[id]) toast("Not sharp enough. Keep adjusting.", "bad", 2400);
  labAttempts[id] = card.lab.attempts;

  const paper = h("div", { class: "lab-paper" }, h("strong", {}, card.title), scribble[id].map((w) => h("i", { style: { width: w + "%" } })));
  const meter = h("div", { class: "meter" }, h("i"));
  const pct = h("span", { class: "pct" }, "...");
  const slider = h("input", { type: "range", min: 0, max: 1000, value: Math.round(labValue[id] * 1000), "aria-label": card.lab.prompt });
  const apply = (c) => {
    paper.style.filter = `blur(${(Math.pow(1 - c, 1.6) * 9).toFixed(1)}px)`;
    meter.firstChild.style.width = Math.round(c * 100) + "%";
    meter.classList.toggle("sharp", c > 0.78);
    pct.textContent = Math.round(c * 100) + "% sharp";
  };
  const probe = throttle(() => ctx.send({ t: "lab_probe", id, v: labValue[id] }), 110);
  slider.addEventListener("input", () => { labValue[id] = slider.value / 1000; probe(); });
  const off = ctx.on("msg:lab", (m) => { if (m.id === id) apply(m.closeness); });
  const wrap = h("div", { class: "lab", "data-cleanup": "1" },
    h("p", { class: "muted" }, "🔬 ", card.lab.prompt), paper, slider, h("div", { class: "row between" }, meter, pct),
    h("div", { class: "row end" },
      card.lab.canSkip ? h("button", { class: "btn ghost small", onclick: () => ctx.send({ t: "lab_skip", id }) }, "Let the lab handle it") : null,
      h("button", { class: "btn", onclick: () => { haptic(20); ctx.send({ t: "lab_commit", id, v: labValue[id] }); } }, "Lock it in")));
  wrap._off = off;
  apply(0.2);
  setTimeout(probe, 50);
  return wrap;
}

// ------------------------------------------------------------------ card viewer
export function cardSheet(id) {
  const first = ctx.card(id);
  if (!first) return null;
  let lab = null;
  const s = liveSheet({ title: first.title, onClose: () => { if (lab && lab._off) lab._off(); } }, (b, sh) => {
    const c = ctx.card(id);
    if (!c) { sh.close(); return; }
    if (lab && lab._off) lab._off();
    lab = null;
    sh.set(c.title);
    b.append(h("div", { class: "kicker" }, cardIcon(c), " ", TYPE_LABEL[c.type] || "", c.private ? " · only you can see this" : "", c.speaker ? " · " + ctx.speakerName(c.speaker) : ""));
    b.append(h("div", { class: "typewriter" }, c.text));
    if (c.audio) b.append(h("div", { class: "row" }, lineBtn(c.audio.key, c.audio.text, c.audio.speaker, "Play tape"), h("p", { class: "muted" }, "“", c.audio.text, "”")));
    if (c.revealed) b.append(h("div", { class: "lab-result" }, h("div", { class: "kicker" }, "🔬 Lab result"), h("div", { class: "typewriter" }, c.revealed)));
    if (c.lab && !c.lab.done) {
      if (c.private) b.append(h("p", { class: "note" }, "Share this with the party first. Then the Analyst can run it through the lab."));
      else if (ctx.state.iCanLab) { lab = labWidget(c); b.append(lab); }
      else {
        const who = ctx.state.players.filter((p) => p.roles.includes("analyst")).map((p) => p.name).join(", ");
        b.append(h("p", { class: "note" }, `🔬 Needs the lab. Waiting for the Analyst (${who || "nobody"}). Tell them in chat.`));
      }
    }
    if (c.private) b.append(h("div", { class: "row end" }, h("button", { class: "btn", onclick: () => { ctx.send({ t: "share", id }); ctx.audio.sfx("share"); } }, "Share with the party")));
  });
  return s;
}

// ------------------------------------------------------------------ settings
export function settingsSheet() {
  const S = ctx.settings;
  const seg = (key, opts) => h("div", { class: "seg" }, opts.map(([label, val]) => h("button", { class: S[key] === val ? "on" : "", onclick: (e) => { ctx.setting(key, val); e.target.parentElement.querySelectorAll("button").forEach((x) => x.classList.remove("on")); e.target.classList.add("on"); } }, label)));
  const tog = (key, label, hint) => {
    const cb = h("input", { type: "checkbox", checked: !!S[key], onchange: () => ctx.setting(key, cb.checked) });
    return h("label", { class: "toggle" }, cb, h("span", {}, label, hint ? h("small", {}, hint) : null));
  };
  const range = (key, label, min, max, step) => {
    const inp = h("input", { type: "range", min, max, step, value: S[key], "aria-label": label, oninput: () => ctx.setting(key, Number(inp.value)) });
    return h("label", { class: "field" }, h("span", {}, label), inp);
  };
  return sheet({ title: "Settings", render: (b) => b.append(
    h("h3", {}, "Graphics"),
    h("div", { class: "field" }, h("span", {}, "Quality"), seg("quality", [["Low", "low"], ["Medium", "medium"], ["High", "high"]])),
    h("div", { class: "field" }, h("span", {}, "Frame rate"), seg("fps", [["30", 30], ["60", 60]])),
    tog("dataSaver", "Data saver", "Skips downloading voice recordings; subtitles only"),
    h("h3", {}, "Sound"),
    tog("music", "Music and effects"), range("musicVol", "Music volume", 0, 1, 0.05),
    tog("voiceLines", "Play character voices"), range("voiceVol", "Voice volume", 0, 1, 0.05),
    tog("deviceVoiceFallback", "Use my device's voice if there's no recording"),
    h("h3", {}, "Party voice chat"),
    tog("pushToTalk", "Push to talk", "Hold the mic button to speak"),
    h("h3", {}, "Accessibility"),
    h("div", { class: "field" }, h("span", {}, "Text size"), seg("textSize", [["A", 0.9], ["A+", 1], ["A++", 1.15], ["A+++", 1.3]])),
    tog("contrast", "High contrast"), tog("haptics", "Vibration feedback"),
    h("p", { class: "muted" }, "Subtitles are always on. Every sound cue also has a visual cue.")) });
}

// ------------------------------------------------------------------ party
export function partySheet() {
  return liveSheet({ title: "Party " + ctx.state.code, wide: false }, (b) => {
    const s = ctx.state, me = ctx.me(), host = ctx.isHost();
    b.append(h("div", { class: "row" },
      h("button", { class: "btn", onclick: shareInvite }, "Invite friends"),
      h("code", { class: "code" }, s.code)));
    for (const p of s.players) {
      const you = p.id === s.you;
      b.append(h("div", { class: "player-row" },
        h("span", { class: "dot", style: { background: p.color } }),
        h("div", { class: "grow" },
          h("strong", {}, p.name, you ? " (you)" : "", p.id === s.host ? " ★" : ""),
          h("small", {}, p.connected ? p.roleNames.join(" + ") : "offline", p.voice ? " · 🎙" : "")),
        !you ? h("button", { class: "btn ghost small", onclick: () => playerMenu(p.id) }, "…") : h("button", { class: "btn ghost small", onclick: renameSheet }, "Rename")));
    }
    b.append(h("h3", {}, "Roles"),
      h("p", { class: "muted" }, "Each role sees different things in the scenes. With fewer players, roles are shared out. If a teammate drops, their role opens up to everyone."));
    if (host) b.append(h("div", { class: "row" }, h("button", { class: "btn ghost", onclick: () => ctx.send({ t: "rotate" }) }, "Rotate roles")));
    b.append(h("h3", {}, "Voice chat"), voiceControls());
  });
}

export function voiceControls() {
  const v = ctx.voice, box = h("div", { class: "voice-box" });
  const draw = () => {
    clear(box);
    if (!v.supported()) { box.append(h("p", { class: "muted" }, "Voice chat isn't available in this browser. Use any voice app with the party.")); return; }
    if (!v.joined) box.append(h("button", { class: "btn", onclick: async () => { try { await v.join(); } catch (e) { toast("Couldn't start the microphone. Check your browser permission.", "bad"); } } }, "🎙 Join voice chat"));
    else {
      box.append(h("div", { class: "row" },
        ctx.settings.pushToTalk
          ? h("button", { class: "btn ptt", onpointerdown: () => v.talk(true), onpointerup: () => v.talk(false), onpointerleave: () => v.talk(false) }, "Hold to talk")
          : h("button", { class: "btn" + (v.micOn ? "" : " ghost"), onclick: () => v.setMic(!v.micOn) }, v.micOn ? "🎙 Mic on" : "🔇 Mic muted"),
        h("button", { class: "btn ghost", onclick: () => v.leave() }, "Leave voice")));
    }
  };
  draw();
  const off = ctx.on("voice", () => { if (box.isConnected) draw(); else off(); });
  return box;
}

function renameSheet() {
  const inp = h("input", { type: "text", maxlength: 16, value: ctx.me().name, "aria-label": "Your name" });
  const s = sheet({ title: "Your name", render: (b) => b.append(inp, h("div", { class: "row end" }, h("button", { class: "btn", onclick: () => {
    const n = inp.value.trim(); if (!n) return;
    ctx.send({ t: "rename", name: n }); ctx.session.name = n; try { localStorage.setItem("uc.name", n); localStorage.setItem("uc.session", JSON.stringify(ctx.session)); } catch {} s.close();
  } }, "Save"))) });
}

export function playerMenu(pid) {
  const p = ctx.player(pid);
  if (!p) return;
  const muted = ctx.muted.has(pid);
  const s = sheet({ title: p.name, render: (b) => {
    b.append(h("p", { class: "muted" }, p.connected ? p.roleNames.join(" + ") : "offline"));
    b.append(h("div", { class: "stack" },
      h("button", { class: "btn ghost", onclick: () => { if (muted) ctx.muted.delete(pid); else ctx.muted.add(pid); ctx.voice.refreshMutes(); ctx.emit("muted", pid); s.close(); toast(muted ? `${p.name} unmuted.` : `${p.name} muted (chat and voice).`); } }, muted ? "Unmute" : "Mute (chat and voice)"),
      h("button", { class: "btn ghost", onclick: () => { s.close(); reportSheet(pid); } }, "Report"),
      ctx.isHost() ? h("button", { class: "btn danger", onclick: () => { s.close(); confirmSheet("Remove " + p.name + "?", "They'll be removed from this party.", "Remove", () => ctx.send({ t: "kick", target: pid })); } }, "Remove from party") : null));
  } });
}

function reportSheet(pid) {
  const p = ctx.player(pid);
  const ta = h("textarea", { rows: 3, maxlength: 300, placeholder: "What happened? (optional)", "aria-label": "Reason" });
  const s = sheet({ title: "Report " + p.name, render: (b) => b.append(h("p", { class: "muted" }, "The recent chat is saved for review."), ta,
    h("div", { class: "row end" }, h("button", { class: "btn danger", onclick: () => { ctx.send({ t: "report", target: pid, reason: ta.value }); s.close(); } }, "Send report"))) });
}

// ------------------------------------------------------------------ case log & how to play
export function logSheet() {
  return liveSheet({ title: "Case log" }, (b) => {
    const s = ctx.state;
    if (s.hints.revealed.length) b.append(h("h3", {}, "Hints used this chapter"), h("ol", { class: "hints" }, s.hints.revealed.map((t) => h("li", {}, t))));
    b.append(h("h3", {}, "What has happened"));
    const list = h("ul", { class: "feed" });
    for (const f of s.feed.slice().reverse()) list.append(h("li", { class: f.kind }, f.text));
    b.append(list);
  });
}

export function howToSheet() {
  return sheet({ title: "How to play", render: (b) => b.append(
    h("ol", { class: "howto" },
      h("li", {}, h("strong", {}, "Search."), " Tap the glowing markers in each location. Drag to look around, pinch to zoom. Your role shows you things your teammates can't see, so describe what you find."),
      h("li", {}, h("strong", {}, "Share and analyse."), " Share private finds with the party. The Analyst runs hard-to-read items through the lab."),
      h("li", {}, h("strong", {}, "Interrogate."), " The Interrogator questions suspects and presents evidence. Everyone else can suggest what to ask. Catch lies to raise the pressure."),
      h("li", {}, h("strong", {}, "Connect."), " On the board, link two items that prove something together. A teammate must confirm each link. Right links glow; wrong ones stay quiet."),
      h("li", {}, h("strong", {}, "Accuse."), " In the last chapter the whole party votes on who, why, how, and the key proof. Hints are free but cost stars.")),
    h("div", { class: "row end" }, h("button", { class: "btn", onclick: () => { try { localStorage.setItem("uc.howto", "1"); } catch {} document.querySelector(".sheet-head .icon-btn").click(); } }, "Got it"))) });
}
