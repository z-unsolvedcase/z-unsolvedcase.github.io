// Scenes and hotspots for Case 1: "The Last Ferry".
// Coordinates are in BLENDER space (x right, y depth, z up). The client converts to three.js:
//   three = (x, z, -y).
// roles: which co-op roles can SEE and inspect this hotspot. [] = everyone.
// If the holder of a listed role is disconnected, the hotspot opens to everyone.
// clue: id from clues.js. flavor: text for items that are not clues.
// lights: realtime lights for the client (no baked lighting, keeps downloads small).

module.exports = [
  {
    id: "harbor_office",
    name: "Harbor Ticket Office",
    glb: "harbor_office.glb",
    mood: { fog: 0x070b12, ambient: 0.35, exposure: 1.0 },
    lights: [
      { type: "point", pos: [-1.8, 1.4, 1.5], color: "#ffb066", intensity: 14, distance: 7 },
      { type: "point", pos: [1.8, 1.9, 1.9], color: "#5f86ff", intensity: 18, distance: 8 },
      { type: "point", pos: [0, -1.0, 2.8], color: "#8fa4d8", intensity: 5, distance: 9 }
    ],
    camera: { pos: [0.0, -5.6, 2.3], target: [0.0, 0.8, 1.1], minDist: 2.2, maxDist: 7.5 },
    hotspots: [
      { id: "h_ticket_ledger", pos: [-1.0, 1.5, 1.22], roles: ["field"], clue: "ticket_ledger" },
      { id: "h_void_log", pos: [0.2, 1.5, 1.28], roles: ["archivist"], clue: "void_log" },
      { id: "h_cash_drawer", pos: [1.3, 1.5, 1.2], roles: ["analyst"], clue: "cash_drawer" },
      { id: "h_ferry_timetable", pos: [-2.2, 2.4, 2.05], roles: [], clue: "ferry_timetable" },
      { id: "h_staff_photo", pos: [-2.9, 0.5, 1.85], roles: [], clue: "staff_photo" },
      { id: "h_rook_note", pos: [2.2, -0.3, 0.98], roles: ["interrogator"], clue: "rook_note" },
      { id: "h_kettle", pos: [-2.45, 1.5, 1.25], roles: [], flavor: "A dented kettle and two mismatched mugs. One has 'E' painted on it in nail polish. Nobody has washed it in ten years." }
    ]
  },
  {
    id: "apartment",
    name: "Elena's Apartment",
    glb: "apartment.glb",
    mood: { fog: 0x0a0a12, ambient: 0.32, exposure: 1.0 },
    lights: [
      { type: "point", pos: [-1.0, 1.7, 1.5], color: "#ffbe7a", intensity: 14, distance: 7 },
      { type: "point", pos: [-1.0, 2.2, 1.7], color: "#6c8cff", intensity: 12, distance: 7 },
      { type: "point", pos: [1.8, -0.6, 2.4], color: "#ff9a5a", intensity: 8, distance: 7 },
      { type: "point", pos: [0, -1.0, 2.8], color: "#8fa4d8", intensity: 4, distance: 9 }
    ],
    camera: { pos: [0.0, -5.2, 2.2], target: [0.0, 0.8, 1.0], minDist: 2.0, maxDist: 7.0 },
    hotspots: [
      { id: "h_stub_shoebox", pos: [2.2, 0.6, 1.38], roles: ["field"], clue: "stub_shoebox" },
      { id: "h_desk_calendar", pos: [0.4, 2.42, 1.75], roles: [], clue: "desk_calendar" },
      { id: "h_notepad", pos: [-1.4, 1.85, 0.9], roles: ["analyst"], clue: "notepad_impression" },
      { id: "h_ibarra_letter", pos: [-0.75, 1.85, 0.9], roles: ["archivist"], clue: "ibarra_letter" },
      { id: "h_answering_machine", pos: [1.5, 1.9, 0.75], roles: ["interrogator"], clue: "answering_machine" },
      { id: "h_scarf_hook", pos: [-2.4, -0.5, 1.6], roles: ["field"], clue: "scarf_hook" },
      { id: "h_plant", pos: [2.0, -1.5, 0.65], roles: [], flavor: "A fern that has somehow survived. Somebody has been watering it. The landlord, probably. Or someone who still has a key." }
    ]
  },
  {
    id: "archive",
    name: "Police Archive",
    glb: "archive.glb",
    mood: { fog: 0x05080c, ambient: 0.3, exposure: 1.0 },
    lights: [
      { type: "point", pos: [0.8, 2.0, 2.6], color: "#d8e4ff", intensity: 16, distance: 9 },
      { type: "point", pos: [-2.0, 0.5, 2.4], color: "#ffd9a0", intensity: 12, distance: 7 },
      { type: "point", pos: [3.0, -1.0, 2.4], color: "#7fb8ff", intensity: 10, distance: 7 },
      { type: "point", pos: [0, -1.5, 3.0], color: "#8fa4d8", intensity: 5, distance: 10 }
    ],
    camera: { pos: [0.0, -6.8, 2.6], target: [0.0, 0.8, 1.0], minDist: 2.5, maxDist: 9.0 },
    hotspots: [
      { id: "h_case_file", pos: [-0.2, 2.3, 0.95], roles: ["interrogator"], clue: "case_file" },
      { id: "h_bus_timetable", pos: [0.6, 2.3, 0.95], roles: ["archivist"], clue: "bus_timetable" },
      { id: "h_clinic_log", pos: [1.4, 2.3, 0.95], roles: ["archivist"], clue: "clinic_log" },
      { id: "h_inspector_record", pos: [2.2, 2.3, 0.95], roles: ["analyst"], clue: "inspector_record" },
      { id: "h_coat_box", pos: [-2.0, 0.5, 1.0], roles: ["field"], clue: "coat_box" },
      { id: "h_pier_photo", pos: [-3.85, 1.0, 1.75], roles: ["field"], clue: "pier_photo" },
      { id: "h_crew_roster", pos: [3.8, 0.5, 1.45], roles: ["interrogator"], clue: "crew_roster" },
      { id: "h_key_register", pos: [3.8, -0.7, 1.45], roles: ["archivist"], clue: "key_register" },
      { id: "h_mirror", pos: [3.85, -2.2, 1.85], roles: [], flavor: "The interview room's one-way mirror. Your own tired reflection looks back. Behind it, a table and two chairs wait for somebody to start lying." }
    ]
  },
  {
    id: "ferry",
    name: "MV Kestrel, Night Deck",
    glb: "ferry.glb",
    mood: { fog: 0x03060d, ambient: 0.34, exposure: 1.0 },
    lights: [
      { type: "point", pos: [3.2, 0.9, 2.6], color: "#ffb35c", intensity: 16, distance: 8 },
      { type: "point", pos: [-3.5, -1.0, 2.8], color: "#6d90ff", intensity: 14, distance: 9 },
      { type: "point", pos: [0.2, -1.8, 2.4], color: "#ffd9a0", intensity: 8, distance: 7 },
      { type: "point", pos: [0, -2.5, 3.2], color: "#8fa4d8", intensity: 5, distance: 10 }
    ],
    camera: { pos: [0.3, -8.8, 3.3], target: [0.3, 0.4, 0.9], minDist: 3.0, maxDist: 12.0 },
    hotspots: [
      { id: "h_aft_bench", pos: [-3.5, 0.0, 0.7], roles: ["field"], clue: "aft_bench" },
      { id: "h_hatch_latch", pos: [0.6, -1.08, 1.1], roles: ["field"], clue: "hatch_latch" },
      { id: "h_maintenance_log", pos: [-0.4, -1.08, 0.9], roles: ["archivist"], clue: "maintenance_log" },
      { id: "h_gangway_counter", pos: [4.0, -2.2, 1.05], roles: ["analyst"], clue: "gangway_counter" },
      { id: "h_bridge_logbook", pos: [3.0, 1.15, 1.4], roles: ["archivist"], clue: "bridge_logbook" },
      { id: "h_bottle_locker", pos: [1.4, 2.04, 1.0], roles: ["interrogator"], clue: "bottle_locker" },
      { id: "h_crew_locker", pos: [-1.8, 2.04, 1.0], roles: ["field"], clue: "crew_locker" },
      { id: "h_lifebuoy", pos: [-4.85, 1.0, 1.0], roles: [], flavor: "A lifebuoy stenciled KESTREL. The paint is perfect. Somebody repainted everything on this ship except the thing people actually needed: honesty." }
    ]
  }
];
