// WebSocket client with automatic reconnect. The session token is kept in localStorage so a dropped
// connection (or a closed tab) rejoins the same player, roles and private finds.
import { ctx } from "./ctx.js";

export class Net {
  constructor() {
    this.ws = null;
    this.queue = [];
    this.retry = 0;
    this.closedByUs = false;
    this.hello = null;
    this.online = false;
    this.timer = null;
  }

  url() {
    // On GitHub Pages (*.github.io) there is no game server on the same host:
    // the server runs on the VPS behind 3danatomie.com's TLS bridge.
    if (location.hostname.endsWith("github.io")) return "wss://3danatomie.com/ws";
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${location.host}/ws`;
  }

  connect(hello) {
    this.hello = hello;
    this.closedByUs = false;
    this._open();
  }

  _open() {
    clearTimeout(this.timer);
    let ws;
    try { ws = new WebSocket(this.url()); } catch { return this._again(); }
    this.ws = ws;
    ws.onopen = () => {
      this.retry = 0;
      ws.send(JSON.stringify(this.hello));
    };
    ws.onmessage = (ev) => {
      let m;
      try { m = JSON.parse(ev.data); } catch { return; }
      if (m.t === "welcome") {
        this.online = true;
        // from now on, reconnects use the code + token we were given
        this.hello = { t: "hello", code: m.code, token: m.token, name: (ctx.session && ctx.session.name) || this.hello.name };
        for (const q of this.queue.splice(0)) ws.send(JSON.stringify(q));
        ctx.emit("online", true);
      }
      ctx.emit("msg:" + m.t, m);
      ctx.emit("msg", m);
    };
    ws.onclose = () => {
      const was = this.online;
      this.online = false;
      if (was) ctx.emit("online", false);
      if (!this.closedByUs) this._again();
    };
    ws.onerror = () => {};
  }

  _again() {
    this.retry++;
    const wait = Math.min(8000, 600 * 2 ** Math.min(this.retry, 4));
    ctx.emit("reconnecting", this.retry);
    this.timer = setTimeout(() => this._open(), wait);
  }

  send(msg) {
    if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(msg));
    else if (msg.t !== "lab_probe" && msg.t !== "bm" && msg.t !== "nm") this.queue.push(msg);
  }

  close() {
    this.closedByUs = true;
    clearTimeout(this.timer);
    try { this.ws && this.ws.close(); } catch {}
    this.ws = null;
    this.online = false;
  }
}
