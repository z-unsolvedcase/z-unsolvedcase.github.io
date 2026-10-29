// Suspects and interrogation. The Interrogator leads; teammates suggest questions and evidence.
import { h, clear } from "../dom.js";
import { ctx } from "../ctx.js";
import { avatar } from "../avatar.js";
import { sheet, toast, lineBtn, cardIcon } from "../sheets.js";

export function createSuspectsPanel() {
  const el = h("div", { class: "panel suspects-panel" });
  let sel = null, shown = false, lastLogCount = {};

  const sv = (s, id) => s.suspects.find((x) => x.id === id);

  function meter(label, val, cls) {
    return h("div", { class: "meter2 " + cls }, h("span", {}, label), h("div", { class: "bar" }, h("i", { style: { width: val + "%" } })), h("b", {}, val));
  }

  function drawList(s) {
    clear(el);
    el.append(h("h3", {}, "Suspects"));
    const grid = h("div", { class: "suspect-grid" });
    for (const st of s.suspects) {
      const info = ctx.suspectInfo(st.id);
      const unread = st.log.length && st.log[st.log.length - 1].id !== ctx.seenLog[st.id];
      grid.append(h("button", { class: "suspect-card", onclick: () => { sel = st.id; markSeen(st); update(ctx.state); } },
        avatar(st.id, info.color, 84, st.pressure), h("strong", {}, info.name), h("small", {}, info.role),
        unread ? h("span", { class: "unread" }) : null));
    }
    el.append(grid, h("p", { class: "muted" }, "More people become available as the case develops."));
  }

  function markSeen(st) { if (st.log.length) ctx.seenLog[st.id] = st.log[st.log.length - 1].id; }

  function drawDetail(s) {
    const st = sv(s, sel);
    if (!st) { sel = null; return drawList(s); }
    const info = ctx.suspectInfo(sel);
    const top = el.querySelector(".transcript") ? el.querySelector(".transcript").scrollTop : 0;
    const wasBottom = (() => { const t = el.querySelector(".transcript"); return !t || t.scrollHeight - t.scrollTop - t.clientHeight < 40; })();
    clear(el);
    const can = s.iCanInterrogate;
    el.append(h("button", { class: "btn ghost small back", onclick: () => { sel = null; update(ctx.state); } }, "← All suspects"));
    el.append(h("div", { class: "suspect-head" }, avatar(sel, info.color, 92, st.pressure),
      h("div", { class: "grow" }, h("h2", {}, info.name, h("small", {}, ", ", info.age)), h("p", { class: "muted" }, info.role), h("p", { class: "bio" }, info.bio))));
    el.append(h("div", { class: "meters" }, meter("Pressure", st.pressure, "pressure"), meter("Trust", st.trust, "trust")));

    const log = h("div", { class: "transcript", "aria-live": "polite" });
    log.append(h("div", { class: "bubble them intro" }, h("small", {}, "Introduction"), h("p", {}, "“", st.intro, "”"), lineBtn(st.introAudio, st.intro, sel)));
    for (const e of st.log) {
      const q = e.type === "ask" ? e.label : "Shows: " + e.cardTitle;
      log.append(h("div", { class: "bubble me" }, e.repeat ? h("small", {}, "again") : null, q));
      log.append(h("div", { class: "bubble them" }, h("p", {}, "“", e.text, "”"), lineBtn(e.audio, e.text, sel)));
    }
    el.append(log);
    if (wasBottom) setTimeout(() => (log.scrollTop = log.scrollHeight), 0); else log.scrollTop = top;

    if (!can) el.append(h("p", { class: "note" }, "You're not leading the questioning. Tap a question to suggest it to the Interrogator."));
    const topics = h("div", { class: "topics" });
    for (const t of st.topics) {
      const lockWhy = t.lock.map((x) => ({ evidence: "needs evidence", pressure: "needs more pressure", trust: "needs more trust" }[x])).join(", ");
      topics.append(h("button", { class: "topic " + t.status, disabled: t.status !== "open", title: lockWhy,
        onclick: () => { if (can) ctx.send({ t: "iv_ask", sid: sel, tid: t.id }); else { ctx.send({ t: "iv_suggest", sid: sel, kind: "topic", id: t.id }); toast("Suggestion sent to your party."); } } },
        t.status === "asked" ? "✓ " : t.status === "locked" ? "🔒 " : "", t.label, t.status === "locked" ? h("small", {}, lockWhy) : null));
    }
    el.append(topics);
    el.append(h("div", { class: "row" }, h("button", { class: "btn", onclick: () => presentSheet(st) }, can ? "📎 Show evidence" : "📎 Suggest evidence")));
  }

  function presentSheet(st) {
    const s = ctx.state, can = s.iCanInterrogate;
    const usable = s.cards.filter((c) => !(c.lab && !c.lab.done));
    const sh = sheet({ title: can ? "Show evidence to " + ctx.suspectInfo(st.id).name : "Suggest evidence", render: (b) => {
      if (!usable.length) b.append(h("p", { class: "muted" }, "Nothing to show yet."));
      const list = h("div", { class: "pick-list" });
      for (const c of usable) {
        const done = st.presented.includes(c.id);
        list.append(h("button", { class: "card-row " + c.type, onclick: () => {
          if (can) ctx.send({ t: "iv_present", sid: st.id, cid: c.id }); else { ctx.send({ t: "iv_suggest", sid: st.id, kind: "card", id: c.id }); toast("Suggestion sent to your party."); }
          sh.close();
        } }, h("span", { class: "ico" }, cardIcon(c)), h("span", { class: "grow" }, h("strong", {}, c.title)), done ? h("span", { class: "badge ok" }, "shown") : null));
      }
      b.append(list);
      const waiting = s.cards.filter((c) => c.lab && !c.lab.done).length;
      if (waiting) b.append(h("p", { class: "note" }, `${waiting} item${waiting > 1 ? "s" : ""} still need the lab before you can use them.`));
    } });
  }

  // play the newest line aloud when it arrives, if the player is looking at this suspect
  function autoplay(s) {
    if (!shown || !sel) return;
    const st = sv(s, sel);
    if (!st || !st.log.length) return;
    const last = st.log[st.log.length - 1];
    if (ctx.seenLog[sel] === last.id) return;
    ctx.seenLog[sel] = last.id;
    if (ctx.settings.dataSaver) return;
    ctx.audio.playLine(last.audio, last.text, sel);
    ctx.audio.setMood(st.pressure > 55 ? "tense" : "explore");
  }

  function update(s) {
    if (!s.suspects.length) { clear(el); el.append(h("p", { class: "muted" }, "No suspects yet.")); return; }
    if (sel) { autoplay(s); drawDetail(s); } else drawList(s);
  }

  return {
    el, update,
    hasUnread(s) { return s.suspects.some((st) => st.log.length && st.log[st.log.length - 1].id !== ctx.seenLog[st.id]); },
    show() { shown = true; if (sel && ctx.state) { const st = sv(ctx.state, sel); if (st) markSeen(st); } },
    hide() { shown = false; ctx.audio.stopLine(); }
  };
}
