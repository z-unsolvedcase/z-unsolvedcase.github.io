// Shared by the server (to tell clients which audio file to play) and the voice generator tool
// (to know which lines to synthesize). Same key function on both sides = no manifest to keep in sync.
const crypto = require("crypto");

function voiceKey(speaker, text) {
  return crypto.createHash("sha1").update(speaker + "|" + text).digest("hex").slice(0, 16);
}

// Every spoken line in a case: { key, speaker, text }
function allLines(C) {
  const out = new Map();
  const add = (speaker, text) => {
    if (!speaker || !text) return;
    const key = voiceKey(speaker, text);
    if (!out.has(key)) out.set(key, { key, speaker, text });
  };
  for (const ch of C.chapters) add(ch.intro.speaker, ch.intro.text);
  for (const s of C.suspects) {
    add(s.id, s.intro);
    add(s.id, s.defaultPresent);
    for (const t of s.topics) add(s.id, t.answer);
    for (const p of s.present) add(s.id, p.reply);
  }
  for (const c of Object.values(C.clues)) if (c.audio) add(c.audio.speaker, c.audio.text);
  add("narrator", C.epilogue.truth);
  return [...out.values()];
}

module.exports = { voiceKey, allLines };
