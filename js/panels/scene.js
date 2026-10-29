// The 3D investigation view.
import { h, clear } from "../dom.js";
import { ctx } from "../ctx.js";
import { SceneView } from "../scene3d.js";
import { sheet, toast } from "../sheets.js";

export function createScenePanel() {
  const canvas = h("canvas", { class: "scene-canvas", "aria-label": "3D location. Tap glowing markers to investigate." });
  const loading = h("div", { class: "loading hidden" }, "Loading location…");
  const chips = h("div", { class: "scene-chips" });
  const roleBadge = h("div", { class: "role-badge" });
  const pingBtn = h("button", { class: "btn small ghost ping-btn", "aria-pressed": "false", onclick: () => setPing(!pingMode) }, "📍 Ping");
  const tip = h("div", { class: "scene-tip" }, "Drag to look · pinch to zoom · tap a marker");
  const el = h("div", { class: "panel scene-panel" }, canvas, chips, roleBadge, pingBtn, tip, loading);

  let view = null, cur = null, shown = false, pingMode = false, lastKey = "";

  const sceneInfo = (id) => ctx.info.scenes.find((s) => s.id === id);

  function setPing(on) {
    pingMode = on;
    pingBtn.classList.toggle("on", on);
    pingBtn.setAttribute("aria-pressed", on ? "true" : "false");
    tip.textContent = on ? "Tap a marker to point it out to your party" : "Drag to look · pinch to zoom · tap a marker";
  }

  function ensureView() {
    if (view) return view;
    view = new SceneView(canvas, {
      quality: ctx.settings.quality, fps: ctx.settings.fps,
      onLoading: (on, name) => { loading.classList.toggle("hidden", !on); if (on) loading.textContent = "Loading " + name + "…"; },
      onTap: (hs) => {
        if (pingMode) { ctx.send({ t: "ping", scene: cur, pos: hs.pos }); setPing(false); return; }
        if (hs.state === "taken") { toast(`${hs.by || "A teammate"} already examined this. Ask them to share it.`); return; }
        ctx.send({ t: "inspect", id: hs.id });
      }
    });
    ctx.scene = view;
    ctx.on("settings", () => view && view.setQuality(ctx.settings.quality, ctx.settings.fps));
    return view;
  }

  async function select(id) {
    cur = id;
    const s = ctx.state;
    const sc = s.scenes.find((x) => x.id === id);
    if (!sc) return;
    if (ctx.me() && ctx.me().scene !== id) ctx.send({ t: "scene", id });
    const v = ensureView();
    await v.show(sceneInfo(id));
    v.setHotspots(sc.hotspots);
    lastKey = "";
    drawChips();
  }

  function drawChips() {
    clear(chips);
    const s = ctx.state;
    for (const sc of s.scenes) {
      const here = s.players.filter((p) => p.scene === sc.id && p.id !== s.you && p.connected);
      chips.append(h("button", { class: "chip" + (sc.id === cur ? " on" : ""), onclick: () => select(sc.id) },
        sc.name, here.map((p) => h("span", { class: "dot", title: p.name, style: { background: p.color } }))));
    }
  }

  function update(s) {
    if (!s.scenes.length) return;
    const me = ctx.me();
    roleBadge.textContent = "You: " + (me ? me.roleNames.join(" + ") : "");
    if (!cur || !s.scenes.some((x) => x.id === cur)) {
      const want = me && s.scenes.some((x) => x.id === me.scene) ? me.scene : s.scenes[0].id;
      if (shown) select(want); else cur = want;
      return;
    }
    if (!shown || !view) return;
    const sc = s.scenes.find((x) => x.id === cur);
    const key = JSON.stringify(sc.hotspots.map((x) => [x.id, x.state])) + s.scenes.length + "|" + s.players.map((p) => p.scene).join();
    if (key !== lastKey) {
      lastKey = key;
      view.setHotspots(sc.hotspots);
      drawChips();
    }
  }

  ctx.on("msg:ping", (m) => {
    const p = ctx.player(m.pid);
    if (!p || ctx.muted.has(m.pid)) return;
    ctx.audio.sfx("ping");
    if (m.scene === cur && shown && view) view.ping(m.pos, p.color);
    else toast(`${p.name} pointed something out in ${(sceneInfo(m.scene) || {}).name || "another location"}.`);
  });

  ctx.on("msg:flavor", (m) => {
    sheet({ title: "Look closer", render: (b) => b.append(h("div", { class: "typewriter" }, m.text)) });
  });

  return {
    el, update,
    show() {
      shown = true;
      ensureView();
      view.resize();
      view.start();
      if (ctx.state) select(cur || ctx.state.scenes[0].id);
      ctx.audio.setMood("explore");
    },
    hide() { shown = false; if (view) view.stop(); setPing(false); }
  };
}
