// Party text chat, quick reactions, and per-player mute / report.
import { h, clear } from "../dom.js";
import { ctx } from "../ctx.js";
import { playerMenu } from "../sheets.js";

export function createChatPanel() {
  const list = h("div", { class: "chat-list", role: "log", "aria-live": "polite" });
  const input = h("input", { type: "text", maxlength: 240, placeholder: "Message your party…", "aria-label": "Message", autocomplete: "off" });
  const form = h("form", { class: "chat-form", onsubmit: (e) => { e.preventDefault(); const t = input.value.trim(); if (t) { ctx.send({ t: "chat", text: t }); input.value = ""; } } }, input, h("button", { class: "btn", type: "submit" }, "Send"));
  const emoji = h("div", { class: "emoji-bar" });
  const el = h("div", { class: "panel chat-panel" }, list, emoji, form);
  let shown = false, drawnEmoji = false;

  function line(m) {
    if (ctx.muted.has(m.by)) return null;
    const time = new Date(m.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return h("div", { class: "msg " + m.kind + (m.by === ctx.pid ? " mine" : "") },
      h("button", { class: "who", style: { color: m.color }, onclick: () => { if (m.by !== ctx.pid && ctx.player(m.by)) playerMenu(m.by); } }, m.name),
      h("span", { class: "text" }, m.kind === "suggest" ? "" : "", m.text), h("time", {}, time));
  }

  function render() {
    const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 60;
    clear(list);
    if (!ctx.chat.length) list.append(h("p", { class: "muted" }, "Describe what you find. Your role sees things your teammates can't."));
    ctx.chat.forEach((m) => { const n = line(m); if (n) list.append(n); });
    if (nearBottom) list.scrollTop = list.scrollHeight;
  }

  function drawEmoji() {
    if (drawnEmoji || !ctx.info) return;
    drawnEmoji = true;
    ctx.info.emoji.forEach((e) => emoji.append(h("button", { class: "emo", "aria-label": "React " + e, onclick: () => ctx.send({ t: "emote", e }) }, e)));
  }

  ctx.on("msg:chat", (m) => {
    ctx.chat.push(m.msg);
    if (ctx.chat.length > 120) ctx.chat.shift();
    if (m.msg.by !== ctx.pid && !ctx.muted.has(m.msg.by)) ctx.audio.sfx("msg");
    if (shown) { render(); list.scrollTop = list.scrollHeight; }
    else if (m.msg.by !== ctx.pid && !ctx.muted.has(m.msg.by)) { ctx.unreadChat++; ctx.emit("unread", ctx.unreadChat); }
  });
  ctx.on("muted", () => shown && render());

  return {
    el, update() { drawEmoji(); },
    show() { shown = true; ctx.unreadChat = 0; ctx.emit("unread", 0); drawEmoji(); render(); list.scrollTop = list.scrollHeight; },
    hide() { shown = false; }
  };
}
