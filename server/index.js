// Unsolved Case server: static hosting + WebSocket game server.
//   PORT=3000 DATA_DIR=./data ICE_SERVERS='[{"urls":"stun:stun.l.google.com:19302"}]' node server/index.js
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");
const { WebSocketServer } = require("ws");
const { Room, caseInfo: baseCaseInfo } = require("./engine");
const cases = { case1: require("./cases/case1") };
try { cases.case2 = require("./cases/case2"); } catch (e) { console.warn("case2 not loaded:", e.message); }

const CLIENT_DIR = path.join(__dirname, "..", "client");
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".glb": "model/gltf-binary", ".png": "image/png",
  ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav",
  ".ico": "image/x-icon", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".txt": "text/plain"
};
const COMPRESSIBLE = new Set([".html", ".js", ".mjs", ".css", ".json", ".svg", ".webmanifest", ".txt"]);
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const WEEK = 7 * 24 * 3600 * 1000;

function createServer(opts = {}) {
  const port = opts.port != null ? opts.port : Number(process.env.PORT || 3000);
  const dataDir = opts.dataDir || process.env.DATA_DIR || path.join(__dirname, "..", "data");
  const iceServers = opts.iceServers || (process.env.ICE_SERVERS ? JSON.parse(process.env.ICE_SERVERS) : [{ urls: "stun:stun.l.google.com:19302" }]);
  const log = opts.log || ((...a) => console.log(new Date().toISOString(), ...a));
  fs.mkdirSync(dataDir, { recursive: true });
  const roomsFile = path.join(dataDir, "rooms.json");
  const reportsFile = path.join(dataDir, "reports.log");

  // ------------------------------------------------------------ rooms + persistence
  const rooms = new Map(); // code -> Room
  const conns = new Map(); // pid@code -> ws
  let dirty = false;

  try {
    const saved = JSON.parse(fs.readFileSync(roomsFile, "utf8"));
    for (const d of saved) {
      const C = cases[d.caseId || "case1"];
      if (C && Date.now() - d.touchedAt < WEEK) rooms.set(d.code, Room.restore(C, d));
    }
    log(`restored ${rooms.size} room(s)`);
  } catch (e) { /* first run */ }

  function save(sync) {
    if (!dirty) return;
    dirty = false;
    const out = JSON.stringify([...rooms.values()].map((r) => Object.assign(r.serialize(), { caseId: r.C.id })));
    const tmp = roomsFile + ".tmp";
    if (sync === true) { fs.writeFileSync(tmp, out); fs.renameSync(tmp, roomsFile); return; }
    fs.writeFile(tmp, out, (err) => { if (!err) fs.rename(tmp, roomsFile, () => {}); });
  }
  const saveTimer = setInterval(() => save(), 4000);
  const sweepTimer = setInterval(() => {
    for (const [code, r] of rooms) {
      const idle = Date.now() - r.touchedAt;
      if (idle > WEEK || (idle > 24 * 3600 * 1000 && r.phase === "lobby")) { rooms.delete(code); dirty = true; }
    }
  }, 3600 * 1000);

  function newCode() {
    for (;;) {
      let c = "";
      for (let i = 0; i < 5; i++) c += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
      if (!rooms.has(c)) return c;
    }
  }

  // Bounding box of a scene's hotspot positions: lets the client frame the camera without learning which hotspots exist for whom.
  function boundsOf(scene) {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (const h of scene.hotspots) for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], h.pos[i]); max[i] = Math.max(max[i], h.pos[i]); }
    return { min, max };
  }

  function caseInfo(C) {
    return Object.assign(baseCaseInfo(C), {
      scenes: C.scenes.map((s) => ({ id: s.id, name: s.name, glb: s.glb, mood: s.mood, lights: s.lights, camera: s.camera, bounds: boundsOf(s) }))
    });
  }

  // ------------------------------------------------------------ delivery
  const send = (ws, msg) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg)); };
  function sockFor(room, pid) { return conns.get(pid + "@" + room.code); }
  function flush(room) {
    for (const ev of room.drain()) {
      if (ev.to === "all") for (const p of room.connected()) send(sockFor(room, p.id), ev.msg);
      else send(sockFor(room, ev.to), ev.msg);
    }
  }
  function pushState(room) {
    for (const p of room.connected()) send(sockFor(room, p.id), { t: "state", s: room.view(p.id) });
  }
  // messages that never change the shared state: no full state push for these
  const LIGHT = new Set(["bm", "nm", "ping", "emote", "chat", "rtc", "rtc_join", "rtc_leave", "iv_suggest", "report", "pong", "lab_probe", "ping_alive"]);

  // ------------------------------------------------------------ http
  function serveStatic(req, res) {
    let url;
    try { url = decodeURIComponent(new URL(req.url, "http://x").pathname); } catch { res.writeHead(400); return res.end("bad request"); }
    if (url === "/api/health") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ ok: true, rooms: rooms.size })); }
    if (url === "/api/config") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ iceServers })); }
    if (url === "/") url = "/index.html";
    const file = path.normalize(path.join(CLIENT_DIR, url));
    if (!file.startsWith(CLIENT_DIR + path.sep)) { res.writeHead(403); return res.end("forbidden"); }
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("not found"); }
      const ext = path.extname(file).toLowerCase();
      const type = MIME[ext] || "application/octet-stream";
      const heavy = [".glb", ".mp3", ".png", ".jpg", ".ogg", ".wav", ".woff2"].includes(ext);
      const headers = {
        "content-type": type, "x-content-type-options": "nosniff",
        "cache-control": heavy ? "public, max-age=86400" : "no-cache"
      };
      const ae = String(req.headers["accept-encoding"] || "");
      if (COMPRESSIBLE.has(ext) && /\bgzip\b/.test(ae)) {
        headers["content-encoding"] = "gzip";
        headers.vary = "accept-encoding";
        res.writeHead(200, headers);
        fs.createReadStream(file).pipe(zlib.createGzip()).pipe(res);
      } else {
        headers["content-length"] = st.size;
        res.writeHead(200, headers);
        fs.createReadStream(file).pipe(res);
      }
    });
  }

  const server = http.createServer(serveStatic);
  const wss = new WebSocketServer({ server, path: "/ws", maxPayload: 16 * 1024 });

  // ------------------------------------------------------------ websocket
  wss.on("connection", (ws) => {
    const ctx = { pid: null, room: null, tokens: 60, last: Date.now(), alive: true };
    ws.on("pong", () => { ctx.alive = true; });

    ws.on("message", (raw) => {
      // token bucket: 30 msgs/s sustained, burst 60. Board dragging is throttled client-side.
      const now = Date.now();
      ctx.tokens = Math.min(60, ctx.tokens + ((now - ctx.last) / 1000) * 30);
      ctx.last = now;
      if (ctx.tokens < 1) return;
      ctx.tokens--;

      let m;
      try { m = JSON.parse(raw.toString()); } catch { return; }
      if (!m || typeof m.t !== "string") return;

      if (m.t === "hello") return hello(ws, ctx, m);
      const room = ctx.room;
      if (!room || !room.players[ctx.pid]) return send(ws, { t: "err", msg: "Not in a party.", fatal: true });
      const pid = ctx.pid;
      room.touch();
      let r = { ok: true };
      try { r = handle(room, pid, m) || { ok: true }; }
      catch (e) { log("handler error", m.t, e.stack); r = { error: "Something went wrong." }; }
      if (r.error) send(ws, { t: "err", msg: r.error, ref: m.t });
      flush(room);
      if (!LIGHT.has(m.t)) { pushState(room); dirty = true; }
    });

    ws.on("close", () => {
      const room = ctx.room;
      if (!room || !room.players[ctx.pid]) return;
      if (conns.get(ctx.pid + "@" + room.code) === ws) {
        conns.delete(ctx.pid + "@" + room.code);
        room.disconnect(ctx.pid);
        flush(room);
        pushState(room);
        dirty = true;
      }
    });
    ws.on("error", () => {});
  });

  const hb = setInterval(() => {
    for (const ws of wss.clients) {
      if (ws.__dead) { ws.terminate(); continue; }
      ws.__dead = true;
      ws.once("pong", () => { ws.__dead = false; });
      try { ws.ping(); } catch {}
    }
  }, 25000);

  function hello(ws, ctx, m) {
    if (ctx.room) return;
    const C = cases[m.caseId || "case1"];
    if (!C) return send(ws, { t: "err", msg: "Unknown case.", fatal: true });
    let room;
    if (m.create) {
      if (rooms.size > 500) return send(ws, { t: "err", msg: "The server is busy, try again soon.", fatal: true });
      const code = newCode();
      room = new Room(C, code);
      rooms.set(code, room);
    } else {
      const code = String(m.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
      room = rooms.get(code);
      if (!room) return send(ws, { t: "err", msg: "No party with that code. Check the code and try again.", fatal: true });
    }
    const res = room.join(m.name, m.token);
    if (res.error) return send(ws, { t: "err", msg: res.error, fatal: true });
    const p = res.player;
    // a second tab for the same player replaces the first
    const key = p.id + "@" + room.code;
    const old = conns.get(key);
    if (old && old !== ws) { send(old, { t: "err", msg: "You joined from another device.", fatal: true }); try { old.close(); } catch {} }
    conns.set(key, ws);
    ctx.pid = p.id;
    ctx.room = room;
    send(ws, { t: "welcome", pid: p.id, token: p.token, code: room.code, info: caseInfo(C), ice: iceServers, backlog: room.backlog(p.id) });
    flush(room);
    pushState(room);
    dirty = true;
    log(`${p.name} ${m.create ? "created" : "joined"} ${room.code}`);
  }

  function handle(room, pid, m) {
    switch (m.t) {
      case "start": return room.start(pid);
      case "next": return room.nextChapter(pid, !!m.rotate);
      case "rotate": return room.rotateRoles(pid);
      case "rename": return room.rename(pid, m.name);
      case "scene": return room.setScene(pid, String(m.id));
      case "inspect": return room.inspect(pid, String(m.id));
      case "share": return room.share(pid, String(m.id));
      case "lab_probe": return room.labProbe(pid, String(m.id), m.v);
      case "lab_commit": return room.labCommit(pid, String(m.id), m.v);
      case "lab_skip": return room.labSkip(pid, String(m.id));
      case "iv_ask": return room.ask(pid, String(m.sid), String(m.tid));
      case "iv_present": return room.present(pid, String(m.sid), String(m.cid));
      case "iv_suggest": return room.suggest(pid, String(m.sid), String(m.kind), String(m.id));
      case "link_propose": return room.linkProposal(pid, String(m.a), String(m.b));
      case "link_vote": return room.linkVote(pid, String(m.id), !!m.ok);
      case "link_cancel": return room.linkCancel(pid, String(m.id));
      case "unlink": return room.unlink(pid, String(m.id));
      case "bm": return room.boardMove(String(m.id), m.x, m.y);
      case "note_add": return room.noteAdd(pid, m.text, m.x, m.y);
      case "nm": return room.noteMove(String(m.id), m.x, m.y);
      case "note_del": return room.noteDel(pid, String(m.id));
      case "hint": return room.hint(pid);
      case "accuse": return room.accusePropose(pid, m.sel);
      case "accuse_vote": return room.accuseVote(pid, !!m.ok);
      case "accuse_cancel": return room.accuseCancel(pid);
      case "retry": return room.retry(pid);
      case "restart": return room.restart(pid);
      case "chat": return room.chat(pid, m.text);
      case "emote": return room.emote(pid, m.e);
      case "ping": return room.ping(pid, String(m.scene), m.pos);
      case "kick": {
        const r = room.kick(pid, String(m.target));
        return r;
      }
      case "report": {
        const r = room.report(pid, String(m.target), m.reason);
        if (!r.error) fs.appendFile(reportsFile, JSON.stringify({ room: room.code, ...room.reports[room.reports.length - 1] }) + "\n", () => {});
        return r;
      }
      case "rtc_join": {
        const peers = [...room.voice];
        room.voice.add(pid);
        send(sockFor(room, pid), { t: "voice_peers", peers });
        room.emit("all", { t: "voice_join", pid });
        pushState(room);
        return { ok: true };
      }
      case "rtc_leave": {
        room.voice.delete(pid);
        room.emit("all", { t: "voice_leave", pid });
        pushState(room);
        return { ok: true };
      }
      case "rtc": {
        const to = String(m.to);
        if (!room.players[to] || !room.voice.has(pid)) return { error: "No such peer." };
        const payload = JSON.stringify(m.data || {});
        if (payload.length > 8000) return { error: "Signal too large." };
        send(sockFor(room, to), { t: "rtc", from: pid, data: m.data });
        return { ok: true };
      }
      case "ping_alive": return { ok: true };
      default: return { error: "Unknown action." };
    }
  }


  function listen() {
    return new Promise((resolve) => server.listen(port, () => { log(`Unsolved Case listening on :${server.address().port}`); resolve(server.address().port); }));
  }
  function close() {
    clearInterval(saveTimer); clearInterval(sweepTimer); clearInterval(hb);
    dirty = true; save(true);
    return new Promise((resolve) => { for (const c of wss.clients) c.terminate(); wss.close(); server.close(() => resolve()); });
  }
  return { listen, close, server, rooms, save: () => { dirty = true; save(true); } };
}

module.exports = { createServer };

if (require.main === module) {
  const s = createServer();
  s.listen();
  const stop = () => { s.close().then(() => process.exit(0)); };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}
