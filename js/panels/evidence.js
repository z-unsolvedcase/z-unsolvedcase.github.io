// The evidence tray: everything the party holds, plus what only you hold.
import { h, clear } from "../dom.js";
import { ctx } from "../ctx.js";
import { cardSheet, cardIcon, TYPE_LABEL } from "../sheets.js";

export function createEvidencePanel() {
  const el = h("div", { class: "panel list-panel" });

  function row(c) {
    const needsLab = c.lab && !c.lab.done;
    return h("button", { class: "card-row " + c.type + (c.private ? " private" : ""), onclick: () => cardSheet(c.id) },
      h("span", { class: "ico" }, cardIcon(c)),
      h("span", { class: "grow" }, h("strong", {}, c.title), h("small", {}, c.type === "clue" ? (c.by && ctx.player(c.by) ? "found by " + ctx.player(c.by).name : "case file") : TYPE_LABEL[c.type])),
      needsLab ? h("span", { class: "badge" }, c.private ? "share" : "🔬 lab") : null);
  }

  function section(title, cards, empty) {
    const sec = h("section", {}, h("h3", {}, title, h("span", { class: "count" }, cards.length)));
    if (!cards.length) sec.append(h("p", { class: "muted" }, empty));
    else cards.forEach((c) => sec.append(row(c)));
    return sec;
  }

  function update(s) {
    const top = el.scrollTop;
    clear(el);
    if (s.mine.length) {
      const sec = section("Only you can see these", s.mine, "");
      sec.classList.add("pocket");
      sec.append(h("p", { class: "note" }, "Describe them to your party, then share. A teammate can't see them until you do."));
      el.append(sec);
    }
    el.append(
      section("Clues", s.cards.filter((c) => c.type === "clue"), "Nothing yet. Search the locations."),
      section("Testimonies", s.cards.filter((c) => c.type === "testimony"), "Interrogate suspects to collect statements."),
      section("Conclusions", s.cards.filter((c) => c.type === "conclusion"), "Link items on the board to prove something."));
    el.scrollTop = top;
  }

  return { el, update, show() { ctx.audio.setMood("board"); }, hide() {} };
}
