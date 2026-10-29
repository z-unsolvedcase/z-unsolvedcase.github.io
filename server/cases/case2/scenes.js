// Scenes and hotspots for Case 2: "The Darkened Light".
// Four NEW locations, modelled fresh in Blender (tools/blender/build_case2_scenes.py):
// the chart room at the tower base, the keeper's cottage, the cove boathouse, and the
// lamp room at the tower top. No Case 1 geometry, positions or palettes are reused.
// Coordinates are in BLENDER space (x right, y depth, z up). The client converts to
// three.js: three = (x, z, -y). Every hotspot position sits exactly on the physical
// object modelled at that position in the Blender scene.
// roles: which co-op roles can SEE and inspect this hotspot. [] = everyone.
// If the holder of a listed role is disconnected, the hotspot opens to everyone.
// clue: id from clues.js. flavor: text for items that are not clues.
// lights: realtime lights for the client (no baked lighting, keeps downloads small).

module.exports = [
  {
    id: "chart_room",
    name: "Chart Room, Tower Base",
    glb: "chart_room.glb",
    mood: { fog: 0x060a08, ambient: 0.33, exposure: 1.0 },
    lights: [
      { type: "point", pos: [0, 1.7, 2.1], color: "#ffcf90", intensity: 14, distance: 8 },
      { type: "point", pos: [2.7, 2.0, 1.7], color: "#ffb060", intensity: 8, distance: 6 },
      { type: "point", pos: [-2.0, 2.2, 2.3], color: "#6c8cff", intensity: 8, distance: 7 },
      { type: "point", pos: [0, -1.0, 2.8], color: "#8fa4d8", intensity: 4, distance: 9 }
    ],
    camera: { pos: [0.0, -6.6, 2.7], target: [0.0, 1.0, 1.1], minDist: 2.4, maxDist: 9.0 },
    hotspots: [
      { id: "h_official_log", pos: [-0.5, 1.7, 1.02], roles: ["archivist"], clue: "official_log" },
      { id: "h_oil_ledger", pos: [1.15, 1.85, 1.02], roles: ["analyst"], clue: "oil_ledger" },
      { id: "h_tide_table", pos: [-1.45, 1.55, 1.02], roles: [], clue: "tide_table" },
      { id: "h_wireless_log", pos: [2.7, 2.0, 0.98], roles: ["archivist"], clue: "wireless_log" },
      { id: "h_barograph", pos: [-2.7, 1.85, 1.38], roles: ["field"], clue: "barograph_trace" },
      { id: "h_relief_roster", pos: [-2.76, 0.3, 1.18], roles: ["archivist"], clue: "relief_roster" },
      { id: "h_inquiry_file", pos: [-3.2, 0.3, 1.52], roles: ["interrogator"], clue: "inquiry_file" },
      { id: "h_key_board", pos: [3.4, 0.4, 1.6], roles: ["interrogator"], clue: "key_board" },
      { id: "h_flags", pos: [-1.6, 2.6, 1.35], roles: [], flavor: "The signal-flag locker. Red, yellow, blue and white flags in their pigeonholes, each folded the regulation way. Six years nobody has flown a signal from this tower, and the flags are still ready." }
    ]
  },
  {
    id: "cottage",
    name: "Keeper's Cottage",
    glb: "cottage.glb",
    mood: { fog: 0x0d0806, ambient: 0.35, exposure: 1.0 },
    lights: [
      { type: "point", pos: [-2.3, 0.8, 1.3], color: "#ff8a4a", intensity: 16, distance: 7 },
      { type: "point", pos: [0.2, 1.5, 1.9], color: "#ffb066", intensity: 10, distance: 7 },
      { type: "point", pos: [1.5, 2.2, 2.1], color: "#6c8cff", intensity: 6, distance: 6 },
      { type: "point", pos: [0, -1.0, 2.8], color: "#8fa4d8", intensity: 4, distance: 9 }
    ],
    camera: { pos: [0.0, -5.8, 2.4], target: [0.0, 0.9, 1.0], minDist: 2.2, maxDist: 8.0 },
    hotspots: [
      { id: "h_diary", pos: [0.2, 1.5, 0.92], roles: ["interrogator"], clue: "diary_entry" },
      { id: "h_unsent_letter", pos: [-1.9, 2.1, 0.9], roles: ["archivist"], clue: "unsent_letter" },
      { id: "h_doctor_card", pos: [-1.5, 2.0, 0.9], roles: ["field"], clue: "doctor_card" },
      { id: "h_radio_notes", pos: [1.82, 2.3, 1.5], roles: ["archivist"], clue: "radio_notes" },
      { id: "h_whisky_bottle", pos: [2.75, 1.1, 1.3], roles: ["analyst"], clue: "whisky_bottle" },
      { id: "h_wren_coat", pos: [2.8, -0.7, 1.4], roles: ["field"], clue: "wren_coat" },
      { id: "h_mantel_photo", pos: [-2.72, 0.8, 1.52], roles: [], flavor: "A framed photograph on the mantel: two keepers in uniform outside this cottage, squinting into the sun. Thomas Wren has his hand on the other man's shoulder. On the back, in pencil: 'T. and S., summer before.' Margaret dusts it every week." },
      { id: "h_kettle", pos: [2.6, 2.15, 1.14], roles: [], flavor: "The cottage stove, banked low, with a kettle kept warm on it out of twenty years of habit. Margaret still makes tea for the station that is no longer there." }
    ]
  },
  {
    id: "boathouse",
    name: "Boathouse at the Cove",
    glb: "boathouse.glb",
    mood: { fog: 0x070a08, ambient: 0.32, exposure: 1.0 },
    lights: [
      { type: "point", pos: [-1.2, 2.0, 1.7], color: "#ffb060", intensity: 12, distance: 7 },
      { type: "point", pos: [2.5, -1.0, 2.3], color: "#7fb8ff", intensity: 8, distance: 7 },
      { type: "point", pos: [0, 0, 2.7], color: "#8fa4d8", intensity: 4, distance: 10 },
      { type: "point", pos: [0.9, -0.4, 1.6], color: "#ff9a5a", intensity: 5, distance: 5 }
    ],
    camera: { pos: [0.0, -6.4, 2.6], target: [0.0, 0.8, 1.0], minDist: 2.4, maxDist: 9.0 },
    hotspots: [
      { id: "h_contraband", pos: [0.9, -0.58, 0.5], roles: ["field"], clue: "contraband_cache" },
      { id: "h_cash_tin", pos: [-1.7, 2.25, 1.12], roles: ["analyst"], clue: "cash_tin" },
      { id: "h_boathouse_net", pos: [-2.5, 1.8, 0.55], roles: ["field"], clue: "boathouse_net" },
      { id: "h_tide_gauge", pos: [3.35, 1.0, 1.5], roles: [], clue: "tide_gauge" },
      { id: "h_crowe_oilskin", pos: [2.82, -0.9, 1.4], roles: ["interrogator"], clue: "crowe_oilskin" },
      { id: "h_landing_chart", pos: [1.8, 2.6, 1.65], roles: ["archivist"], clue: "landing_chart" },
      { id: "h_lantern_bh", pos: [-1.0, 2.25, 1.18], roles: [], flavor: "A boathouse lantern, trimmed and filled, ready for a night launch. Its glass is smoked from long use, and it smells of paraffin and fish in equal measure." }
    ]
  },
  {
    id: "lamp_room",
    name: "Lamp Room, Tower Top",
    glb: "lamp_room.glb",
    mood: { fog: 0x060a14, ambient: 0.3, exposure: 1.05 },
    lights: [
      { type: "point", pos: [0, 0.4, 1.9], color: "#ffb45c", intensity: 20, distance: 9 },
      { type: "point", pos: [0, -2.2, 3.0], color: "#5f86ff", intensity: 10, distance: 9 },
      { type: "point", pos: [1.9, 1.3, 1.7], color: "#ff9a5a", intensity: 6, distance: 5 },
      { type: "point", pos: [-2.0, -1.4, 2.2], color: "#8fa4d8", intensity: 4, distance: 7 }
    ],
    camera: { pos: [0.0, -6.4, 2.5], target: [0.0, 0.4, 1.3], minDist: 2.2, maxDist: 8.5 },
    hotspots: [
      { id: "h_wick_sample", pos: [1.55, 1.42, 1.09], roles: ["analyst"], clue: "wick_sample" },
      { id: "h_watch_slip", pos: [1.9, 1.22, 1.0], roles: ["archivist"], clue: "watch_slip" },
      { id: "h_wick_tin", pos: [2.25, 1.4, 1.09], roles: ["interrogator"], clue: "wick_tin" },
      { id: "h_lampblack_print", pos: [0.78, -0.5, 0.85], roles: ["field"], clue: "lampblack_print" },
      { id: "h_stair_boss", pos: [-2.0, -1.35, 1.24], roles: ["field"], clue: "stair_boss" },
      { id: "h_brass_button", pos: [0.95, -1.2, 0.1], roles: [], clue: "brass_button" },
      { id: "h_foreign_lantern", pos: [2.35, -1.25, 1.4], roles: ["field"], clue: "foreign_lantern" },
      { id: "h_oil_cans", pos: [-2.25, 0.9, 0.56], roles: [], flavor: "The lamp room's oil cans, ranked by the wall in order of use, each chalked with its measure. Wren's hand is in the chalking: level, upright, exact. The last can in the row was filled six years ago and never carried up." }
    ]
  }
];
