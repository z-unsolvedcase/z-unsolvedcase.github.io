// Full-screen views: entry, lobby, chapter briefing / report overlays, and the result screen.
import { h, clear } from "./dom.js";
import { ctx } from "./ctx.js";
import { sheet, shareInvite, partySheet, settingsSheet, howToSheet, lineBtn, voiceControls } from "./sheets.js";

export function entryScreen({ code, onCreate, onJoin }) {
  const saved = (() => { try { return localStorage.getItem("uc.name") || ""; } catch { return ""; } })();
  const name = h("input", { type: "text", maxlength: 16, placeholder: "Your name", value: saved, "aria-label": "Your name", autocomplete: "nickname" });
  const codeIn = h("input", { type: "text", maxlength: 6, placeholder: "CODE", value: code || "", "aria-label": "Party code", class: "code-in", autocapitalize: "characters", autocomplete: "off" });
  const err = h("p", { class: "form-err", role: "alert" });
  const go = (fn) => () => {
    const n = name.value.trim();
    if (!n) { err.textContent = "Pick a name first."; name.focus(); return; }
    try { localStorage.setItem("uc.name", n); } catch {}
    fn(n);
  };
  // Case picker (new in the v2 duplicate): creating a party chooses the case;
  // joining by code needs no picker — the party already knows its case.
  const CASES = [["case1", "Case 1: The Last Ferry"], ["case2", "Case 2: The Darkened Light"]];
  let pickedCase = "case1";
  const tagEl = h("p", { class: "tag" }, CASES[0][1]);
  const caseBtns = CASES.map(([id, label]) => {
    const b = h("button", { class: "btn small" + (id === pickedCase ? "" : " ghost"), onclick: () => {
      pickedCase = id; tagEl.textContent = label;
      caseBtns.forEach((x, i) => x.classList.toggle("ghost", CASES[i][0] !== id));
    } }, label);
    return b;
  });
  return h("main", { class: "screen entry" },
    h("div", { class: "title-block" }, h("p", { class: "eyebrow" }, "A co-op mystery for 1–4 detectives"), h("h1", {}, "Unsolved Case"), tagEl),
    h("div", { class: "card-box" }, name,
      code
        ? h("div", {}, h("p", { class: "muted" }, "You've been invited to party ", h("strong", {}, code), "."), h("button", { class: "btn big", onclick: go((n) => onJoin(code, n)) }, "Join the investigation"))
        : h("div", { class: "stack" },
            h("div", { class: "row center" }, ...caseBtns),
            h("button", { class: "btn big", onclick: go((n) => onCreate(n, pickedCase)) }, "Start a new party"),
            h("div", { class: "or" }, "or join friends"),
            h("div", { class: "row" }, codeIn, h("button", { class: "btn", onclick: go((n) => { const c = codeIn.value.trim().toUpperCase(); if (c.length < 4) { err.textContent = "Enter the party code."; return; } onJoin(c, n); }) }, "Join"))),
      err),
    h("div", { class: "row center" }, h("button", { class: "btn ghost small", onclick: howToSheet }, "How to play"), h("button", { class: "btn ghost small", onclick: settingsSheet }, "Settings")));
}

export function lobbyScreen() {
  const el = h("main", { class: "screen lobby" });
  function update(s) {
    clear(el);
    const host = ctx.isHost();
    el.append(
      h("p", { class: "eyebrow" }, ctx.info && ctx.info.meta ? ((ctx.info.id === "case2" ? "Case 2: " : ctx.info.id === "case1" ? "Case 1: " : "") + ctx.info.meta.title) : "Unsolved Case"), h("h1", {}, "Gather your team"),
      h("div", { class: "code-big", "aria-label": "Party code " + s.code.split("").join(" ") }, s.code),
      h("div", { class: "row center" }, h("button", { class: "btn", onclick: shareInvite }, "Invite friends")),
      h("div", { class: "card-box" }, ...s.players.map((p) => h("div", { class: "player-row" },
        h("span", { class: "dot", style: { background: p.color } }),
        h("div", { class: "grow" }, h("strong", {}, p.name, p.id === s.you ? " (you)" : "", p.id === s.host ? " ★" : ""), h("small", {}, p.connected ? p.roleNames.join(" + ") : "offline")),
        host && p.id !== s.you ? h("button", { class: "btn ghost small", onclick: () => ctx.send({ t: "kick", target: p.id }) }, "Remove") : null))),
      h("p", { class: "muted center" }, s.players.length === 1 ? "Playing solo? You'll hold every role. Friends can join any time with the code." : "Roles are shared out by party size. Everyone sees different things in the scenes."),
      h("div", { class: "card-box" }, h("h3", {}, "Voice chat"), voiceControls()),
      h("div", { class: "row center" },
        host ? h("button", { class: "btn big", onclick: () => ctx.send({ t: "start" }) }, "Begin the case") : h("p", { class: "muted" }, "Waiting for the host to begin…"),
        host && s.players.length > 1 ? h("button", { class: "btn ghost", onclick: () => ctx.send({ t: "rotate" }) }, "Shuffle roles") : null),
      h("div", { class: "row center" }, h("button", { class: "btn ghost small", onclick: howToSheet }, "How to play"), h("button", { class: "btn ghost small", onclick: settingsSheet }, "Settings")));
  }
  return { el, update };
}

// Briefing at the start of each chapter: typewriter text + spoken line.
export function briefingOverlay(m) {
  const text = h("p", { class: "brief-text" }, m.text);
  const close = () => { ctx.audio.stopLine(); o.remove(); };
  const o = h("div", { class: "overlay briefing", role: "dialog", "aria-modal": "true", "aria-label": "Briefing" },
    h("div", { class: "brief-card" },
      h("p", { class: "eyebrow" }, `Chapter ${m.chapter + 1}`), h("h2", {}, m.title),
      h("p", { class: "muted" }, ctx.speakerName(m.speaker)), text,
      h("div", { class: "row center" }, lineBtn(m.audio, m.text, m.speaker, "Listen"), h("button", { class: "btn", onclick: close }, "Start investigating"))));
  document.body.append(o);
  ctx.audio.sfx("chapter");
  if (!ctx.settings.dataSaver) ctx.audio.playLine(m.audio, m.text, m.speaker);
  return { close };
}

export function reportOverlay() {
  const el = h("div", { class: "overlay report", role: "dialog", "aria-modal": "true" });
  let rotate = false;
  function update(s) {
    clear(el);
    const host = ctx.isHost();
    el.append(h("div", { class: "brief-card" },
      h("p", { class: "eyebrow" }, "Chapter complete"), h("h2", {}, s.chapter.title),
      h("p", {}, "You've proven what this chapter needed. The next locations and people are waiting."),
      h("div", { class: "stats" }, ...s.players.map((p) => h("div", {}, h("span", { class: "dot", style: { background: p.color } }), h("strong", {}, p.name), h("small", {}, `${p.found} finds · ${p.links} links · ${p.asked} questions`)))),
      host
        ? h("div", { class: "stack" },
            s.players.length > 1 ? h("label", { class: "check" }, h("input", { type: "checkbox", checked: rotate, onchange: (e) => (rotate = e.target.checked) }), " Swap roles for the next chapter") : null,
            h("button", { class: "btn big", onclick: () => ctx.send({ t: "next", rotate }) }, "Continue"))
        : h("p", { class: "muted" }, "Waiting for the host to continue…")));
  }
  return { el, update };
}

export function resultScreen() {
  const el = h("main", { class: "screen result" });
  let played = false;
  function update(s) {
    const r = s.result;
    if (!r) return;
    clear(el);
    const host = ctx.isHost();
    el.append(
      h("p", { class: "eyebrow" }, r.solved ? "Case closed" : "The accusation fell apart"),
      h("div", { class: "stars", "aria-label": r.stars + " stars" }, [1, 2, 3, 4, 5].map((i) => h("span", { class: i <= r.stars ? "on" : "" }, "★"))),
      h("p", { class: "result-text" }, r.text),
      r.truth ? h("div", { class: "card-box truth" }, h("h3", {}, "What really happened"), h("p", {}, r.truth), lineBtn(r.truthAudio, r.truth, "narrator", "Listen")) : null,
      h("ul", { class: "checks" },
        h("li", { class: r.culpritOk ? "ok" : "no" }, "Culprit"), h("li", { class: r.motiveOk ? "ok" : "no" }, "Motive"),
        h("li", { class: r.methodOk ? "ok" : "no" }, "Method"), h("li", { class: r.proofOk ? "ok" : "no" }, "Proof")),
      h("p", { class: "muted center" }, `Hints used: ${r.hintsUsed} · Wrong links: ${r.wrongLinks} · Failed accusations: ${r.wrongAccusations}`),
      host
        ? h("div", { class: "row center" }, !r.solved ? h("button", { class: "btn big", onclick: () => ctx.send({ t: "retry" }) }, "Reopen the case") : null, h("button", { class: "btn" + (r.solved ? " big" : " ghost"), onclick: () => ctx.send({ t: "restart" }) }, "Play again"))
        : h("p", { class: "muted center" }, "The host decides what happens next."));
    if (!played && r.solved) { played = true; ctx.audio.sfx("win"); ctx.audio.setMood("victory"); }
    if (!r.solved) played = false;
  }
  return { el, update };
}
