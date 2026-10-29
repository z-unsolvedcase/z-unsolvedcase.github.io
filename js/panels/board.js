// The shared deduction board: a pinboard everyone sees live. Drag cards, tie strings between two items,
// and a teammate must confirm each link. Proven links glow; wrong ones stay quiet. The last chapter adds the accusation.
import { h, svg, clear, throttle, haptic } from "../dom.js";
import { ctx } from "../ctx.js";
import { sheet, toast, cardSheet, cardIcon, confirmSheet } from "../sheets.js";

const W = 1100, H = 1500, CW = 150, CH = 70;
const defaultPos = (i) => ({ x: 24 + (i % 6) * 178, y: 24 + Math.floor(i / 6) * 104 });

export function createBoardPanel() {
  const toolbar = h("div", { class: "board-toolbar" });
  const banners = h("div", { class: "board-banners" });
  const cork = h("div", { class: "cork", style: { width: W + "px", height: H + "px" } });
  const strings = svg("svg", { class: "strings", width: W, height: H, viewBox: `0 0 ${W} ${H}` });
  cork.append(strings);
  const scroller = h("div", { class: "board-scroll" }, cork);
  const el = h("div", { class: "panel board-panel" }, toolbar, banners, scroller);

  const cardEls = new Map(), noteEls = new Map(), pos = {}, notePos = {};
  let linkMode = false, picked = null, dragId = null, seenLinks = null;

  // ------------------------------------------------------------ drag
  function draggable(node, id, kind, onTap) {
    let d = null;
    const sendMove = throttle((x, y) => ctx.send({ t: kind === "card" ? "bm" : "nm", id, x: x / W, y: y / H }), 70);
    node.addEventListener("pointerdown", (e) => {
      if (e.button) return;
      const p = (kind === "card" ? pos : notePos)[id] || { x: 0, y: 0 };
      d = { sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, moved: false };
      node.setPointerCapture(e.pointerId);
    });
    node.addEventListener("pointermove", (e) => {
      if (!d) return;
      const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
      if (!d.moved && Math.hypot(dx, dy) < 7) return;
      d.moved = true; dragId = id;
      const x = Math.max(0, Math.min(W - CW, d.ox + dx)), y = Math.max(0, Math.min(H - CH, d.oy + dy));
      (kind === "card" ? pos : notePos)[id] = { x, y };
      node.style.transform = `translate(${x}px,${y}px)`;
      if (kind === "card") drawStrings();
      sendMove(x, y);
    });
    const end = (e) => {
      if (!d) return;
      const was = d; d = null; dragId = null;
      if (!was.moved) onTap(); else { const p = (kind === "card" ? pos : notePos)[id]; ctx.send({ t: kind === "card" ? "bm" : "nm", id, x: p.x / W, y: p.y / H }); }
    };
    node.addEventListener("pointerup", end);
    node.addEventListener("pointercancel", () => { d = null; dragId = null; });
  }

  function place(node, p) { node.style.transform = `translate(${p.x}px,${p.y}px)`; }

  // ------------------------------------------------------------ cards, notes, strings
  function syncCards(s) {
    const ids = new Set(s.cards.map((c) => c.id));
    for (const [id, n] of cardEls) if (!ids.has(id)) { n.remove(); cardEls.delete(id); }
    s.cards.forEach((c, i) => {
      let n = cardEls.get(c.id);
      if (!n) {
        n = h("div", { class: "bcard", role: "button", tabindex: "0", "aria-label": c.title });
        cork.append(n);
        cardEls.set(c.id, n);
        draggable(n, c.id, "card", () => cardTap(c.id));
        n.addEventListener("keydown", (e) => { if (e.key === "Enter") cardTap(c.id); });
      }
      n.className = "bcard " + c.type + (picked === c.id ? " picked" : "") + (c.lab && !c.lab.done ? " needs-lab" : "");
      clear(n).append(h("span", { class: "ico" }, cardIcon(c)), h("span", { class: "t" }, c.title));
      if (c.lab && !c.lab.done) n.append(h("span", { class: "tag" }, "🔬"));
      if (dragId !== c.id) {
        const sp = s.board.pos[c.id];
        pos[c.id] = sp ? { x: sp.x * W, y: sp.y * H } : defaultPos(i);
        place(n, pos[c.id]);
      }
    });
  }

  function syncNotes(s) {
    const ids = new Set(s.board.notes.map((n) => n.id));
    for (const [id, n] of noteEls) if (!ids.has(id)) { n.remove(); noteEls.delete(id); }
    for (const note of s.board.notes) {
      let n = noteEls.get(note.id);
      if (!n) {
        n = h("div", { class: "snote" });
        cork.append(n);
        noteEls.set(note.id, n);
        draggable(n, note.id, "note", () => {});
      }
      const who = ctx.player(note.by);
      clear(n).append(h("span", {}, note.text), h("small", {}, who ? who.name : ""), h("button", { class: "x", "aria-label": "Delete note", onpointerdown: (e) => e.stopPropagation(), onclick: () => ctx.send({ t: "note_del", id: note.id }) }, "×"));
      n.style.borderColor = who ? who.color : "";
      if (dragId !== note.id) { notePos[note.id] = { x: Math.min(W - CW, note.x * W), y: Math.min(H - CH, note.y * H) }; place(n, notePos[note.id]); }
    }
  }

  function center(id) { const p = pos[id]; return p ? { x: p.x + CW / 2, y: p.y + CH / 2 } : null; }

  function drawStrings() {
    const s = ctx.state;
    if (!s) return;
    while (strings.firstChild) strings.removeChild(strings.firstChild);
    const draw = (a, b, cls, link) => {
      const A = center(a), B = center(b);
      if (!A || !B) return;
      const sag = Math.min(40, Math.hypot(A.x - B.x, A.y - B.y) * 0.12);
      const d = `M${A.x},${A.y} Q${(A.x + B.x) / 2},${(A.y + B.y) / 2 + sag} ${B.x},${B.y}`;
      strings.append(svg("path", { d, class: "string " + cls }));
      if (link) strings.append(svg("path", { d, class: "string-hit" }));
    };
    for (const l of s.board.links) draw(l.a, l.b, l.proven ? "proven" : "quiet", l);
    for (const p of s.proposals.links) draw(p.a, p.b, "pending");
    for (const id of cardEls.keys()) { const A = center(id); if (A) strings.append(svg("circle", { cx: A.x, cy: A.y - CH / 2 + 6, r: 4, class: "pin" })); }
  }
  // svg elements created by svg() don't take on* props via addEventListener; wire clicks after creation
  strings.addEventListener("click", (e) => { const t = e.target; if (t && t._link) unlinkAsk(t._link); });

  function unlinkAsk(l) {
    const a = ctx.card(l.a), b = ctx.card(l.b);
    confirmSheet("Remove this link?", `"${a ? a.title : "?"}" and "${b ? b.title : "?"}". Conclusions you've already earned stay earned.`, "Remove", () => ctx.send({ t: "unlink", id: l.id }));
  }

  function cardTap(id) {
    if (!linkMode) return cardSheet(id);
    if (!picked) { picked = id; haptic(10); return update(ctx.state); }
    if (picked === id) { picked = null; return update(ctx.state); }
    const a = picked; picked = null;
    ctx.send({ t: "link_propose", a, b: id });
    if (ctx.state.players.filter((p) => p.connected).length > 1) toast("Link proposed. A teammate has to confirm it.");
    update(ctx.state);
  }

  // ------------------------------------------------------------ toolbar + banners
  function drawToolbar(s) {
    clear(toolbar);
    toolbar.append(
      h("button", { class: "btn small" + (linkMode ? "" : " ghost"), "aria-pressed": linkMode ? "true" : "false", onclick: () => { linkMode = !linkMode; picked = null; update(ctx.state); } }, linkMode ? "🔗 Linking: tap two items" : "🔗 Link items"),
      h("button", { class: "btn small ghost", onclick: noteSheet }, "📝 Note"));
    if (s.chapter.last && s.phase === "play" && !s.proposals.accuse) toolbar.append(h("button", { class: "btn small accuse", onclick: accuseSheet }, "🎯 Accuse"));
  }

  function drawBanners(s) {
    clear(banners);
    for (const p of s.proposals.links) {
      const a = ctx.card(p.a), b = ctx.card(p.b), by = ctx.player(p.by);
      if (!a || !b) continue;
      const mine = p.by === s.you;
      banners.append(h("div", { class: "banner" },
        h("p", {}, h("strong", {}, mine ? "You" : by ? by.name : "A teammate"), " proposed linking ", h("em", {}, a.title), " and ", h("em", {}, b.title), "."),
        mine ? h("div", { class: "row" }, h("small", {}, "Waiting for a teammate to confirm…"), h("button", { class: "btn ghost small", onclick: () => ctx.send({ t: "link_cancel", id: p.id }) }, "Cancel"))
          : h("div", { class: "row" }, h("button", { class: "btn small", onclick: () => ctx.send({ t: "link_vote", id: p.id, ok: true }) }, "Confirm"), h("button", { class: "btn ghost small", onclick: () => ctx.send({ t: "link_vote", id: p.id, ok: false }) }, "Reject"))));
    }
    const ac = s.proposals.accuse;
    if (ac) {
      const who = ctx.suspectInfo(ac.sel.culprit), by = ctx.player(ac.by);
      const voters = s.players.filter((p) => p.connected);
      const voted = voters.filter((p) => p.id in ac.votes).length;
      const mine = s.you in ac.votes;
      banners.append(h("div", { class: "banner accuse" },
        h("p", {}, h("strong", {}, "Vote: "), by ? by.name : "A teammate", " wants to accuse ", h("strong", {}, who.name), ". ", h("small", {}, `${voted}/${voters.length} voted`)),
        mine ? h("div", { class: "row" }, h("small", {}, ac.votes[s.you] ? "You voted yes." : "You voted no."),
          ac.by === s.you || s.host === s.you ? h("button", { class: "btn ghost small", onclick: () => ctx.send({ t: "accuse_cancel" }) }, "Cancel") : null)
          : h("div", { class: "row" }, h("button", { class: "btn small", onclick: () => ctx.send({ t: "accuse_vote", ok: true }) }, "Yes, accuse"), h("button", { class: "btn ghost small", onclick: () => ctx.send({ t: "accuse_vote", ok: false }) }, "No, not yet"))));
    }
  }

  function noteSheet() {
    const inp = h("input", { type: "text", maxlength: 90, placeholder: "e.g. Who has key 07?", "aria-label": "Note" });
    const s = sheet({ title: "Sticky note", render: (b) => { b.append(inp, h("div", { class: "row end" }, h("button", { class: "btn", onclick: () => { if (inp.value.trim()) { ctx.send({ t: "note_add", text: inp.value, x: 0.1 + Math.random() * 0.5, y: 0.1 + Math.random() * 0.2 }); s.close(); } } }, "Pin it"))); setTimeout(() => inp.focus(), 50); } });
  }

  function accuseSheet() {
    const s0 = ctx.state;
    const concl = s0.cards.filter((c) => c.type === "conclusion");
    const pick = { culprit: null, motive: null, method: null, proof: null };
    const A = ctx.info.accusation;
    const sh = sheet({ title: "Make your accusation", wide: true, render: (b) => {
      if (!concl.length) { b.append(h("p", { class: "muted" }, "You haven't proven anything on the board yet. Link evidence first.")); return; }
      const group = (title, items, key, label) => {
        const box = h("div", { class: "choice-group" }, h("h3", {}, title));
        items.forEach((it) => box.append(h("button", { class: "choice", onclick: (e) => { pick[key] = it.id; box.querySelectorAll(".choice").forEach((x) => x.classList.remove("on")); e.currentTarget.classList.add("on"); check(); } }, label(it))));
        return box;
      };
      const go = h("button", { class: "btn accuse", disabled: true, onclick: () => { ctx.send({ t: "accuse", sel: pick }); sh.close(); } }, "Put it to a vote");
      const check = () => { go.disabled = !(pick.culprit && pick.motive && pick.method && pick.proof); };
      b.append(
        h("p", { class: "muted" }, "Everyone in the party votes. A wrong accusation costs stars, so be sure."),
        group("Who did it?", A.culprits.map((id) => ({ id })), "culprit", (it) => ctx.suspectInfo(it.id).name),
        group("Why?", A.motives, "motive", (it) => it.text),
        group("How?", A.methods, "method", (it) => it.text),
        group("Your key proof (a conclusion you earned)", concl, "proof", (it) => it.title),
        h("div", { class: "row end" }, go));
    } });
  }

  // ------------------------------------------------------------ update + events
  function update(s) {
    const top = scroller.scrollTop, left = scroller.scrollLeft;
    syncCards(s); syncNotes(s); drawStrings(); drawToolbar(s); drawBanners(s);
    // tag hit paths with their link for clicks
    strings.querySelectorAll(".string-hit").forEach((p, i) => { p._link = s.board.links[i]; });
    if (seenLinks === null) seenLinks = new Set(s.board.links.map((l) => l.id));
    for (const l of s.board.links) if (!seenLinks.has(l.id)) { seenLinks.add(l.id); if (l.proven) { ctx.audio.sfx("link"); haptic(30); } }
    scroller.scrollTop = top; scroller.scrollLeft = left;
  }

  ctx.on("msg:bm", (m) => {
    if (!ctx.state) return;
    ctx.state.board.pos[m.id] = { x: m.x, y: m.y };
    if (dragId === m.id || !cardEls.has(m.id)) return;
    pos[m.id] = { x: m.x * W, y: m.y * H };
    place(cardEls.get(m.id), pos[m.id]);
    drawStrings();
    scroller.querySelectorAll(".string-hit").forEach((p, i) => { p._link = ctx.state.board.links[i]; });
  });
  ctx.on("msg:nm", (m) => {
    const n = ctx.state && ctx.state.board.notes.find((q) => q.id === m.id);
    if (n) { n.x = m.x; n.y = m.y; }
    if (dragId === m.id || !noteEls.has(m.id)) return;
    notePos[m.id] = { x: m.x * W, y: m.y * H };
    place(noteEls.get(m.id), notePos[m.id]);
  });

  return { el, update, show() { ctx.audio.setMood("board"); }, hide() { picked = null; }, openAccuse: accuseSheet };
}
