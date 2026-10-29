// Story layer for Case 2: conclusions, board links, chapters, hints, accusation, epilogue.
// "The Darkened Light" — Blackrock Head Lighthouse, six years ago.
// A completely separate world from Case 1: no ferries, no Haverport, no shared people or places.

const meta = {
  id: "case2",
  title: "The Darkened Light",
  tagline: "Six years ago a keeper fell down his own tower stairs. His logbook says the light went out — and not by his hand.",
  summary:
    "Thomas Wren, principal keeper of Blackrock Head Lighthouse, was found dead at the foot of the tower stairs six years ago and the inquiry called it a drunken fall. During this spring's decommissioning clearance, his personal oilskin log pouch surfaced in the station store. Reopen the file."
};

// Voices (Kokoro voice ids) used by the voice generator. Same voice palette as Case 1,
// but every speaker is a new person. NOTE: no recorded mp3 lines exist for Case 2 yet —
// the client shows the text.
const speakers = {
  voss: { name: "Detective Inspector Voss", voice: "bm_george", speed: 0.95 },
  narrator: { name: "Narrator", voice: "bf_emma", speed: 0.95 },
  crowe: { name: "Silas Crowe", voice: "bm_daniel", speed: 0.95 },
  margaret: { name: "Margaret Wren", voice: "af_nicole", speed: 1.0 },
  ada: { name: "Ada Rennick", voice: "af_sky", speed: 0.95 },
  tarn: { name: "Jacob Tarn", voice: "am_michael", speed: 0.95 },
  vale: { name: "Ambrose Vale", voice: "bm_lewis", speed: 0.9 }
};

const conclusions = {
  c_dark_nights: {
    title: "The lamp went dark on chosen nights",
    text: "On at least three nights — and on the night Wren died — the Blackrock lamp was out for about half an hour, though the official log claims it burned bright throughout."
  },
  c_log_amended: {
    title: "The official lamp log was rewritten",
    text: "The station log for those nights is a fair copy made after the fact, complete with a squall that never happened. Someone rewrote the record to hide the dark half-hours."
  },
  c_wren_planned: {
    title: "Wren knew, and meant to report it",
    text: "Wren had worked out that a hand, not the machinery, was darkening his lamp. He kept a private log, drafted a letter to the Board, and meant to tell the inspector everything at the Tuesday visit."
  },
  c_wren_sober: {
    title: "Wren was sober — the whisky was planted",
    text: "Wren had not touched spirits for two years, on doctor's orders. The half-empty bottle found in his hand was a cove-run bottle that was never his."
  },
  c_smuggling: {
    title: "Boats landed at the cove on the dark nights",
    text: "On every dark night the tide served the cove landing in the same half-hour, an unlit vessel signalled 'all dark, coming in', and contraband came ashore unseen."
  },
  c_crowe_paid: {
    title: "Crowe was paid for the dark nights",
    text: "A bait tin in the boathouse holds cash and a tally: a payment marked 'L.' for every dark night in Wren's private log. The relief keeper was selling the darkness."
  },
  c_left_hand: {
    title: "A left-handed keeper worked the lamp",
    text: "The wick from the death night is trimmed sloping the wrong way — against Wren's lifelong habit — and the lampblack print under the pedestal handle is a left hand."
  },
  c_second_key: {
    title: "The second lamp-room key was Crowe's",
    text: "Only two keys open the lamp room. Wren's never left him. Key No. 2 was signed out to the relief keeper, Silas Crowe, on every dark night."
  },
  c_crowe_in_lamp_room: {
    title: "Crowe was in the lamp room that night",
    text: "The left-handed work at the lamp, the second key signed out to Crowe, his own oilskin with the key in its pocket, and an eyewitness at the cove all put Silas Crowe up the tower on the night Wren died — though he swore he never went up."
  },
  c_struggle_stairs: {
    title: "Wren died in a struggle at the stair head",
    text: "Blood and grey hair on the stair-head newel, a Board button torn from Wren's coat, and the missing cuff button say Wren was struck or grappled at the top of the stairs — he did not simply slip."
  },
  c_vale_whitewash: {
    title: "Vale whitewashed the inquiry",
    text: "The Board's inspector never climbed the tower, took the relief keeper's statement as fact, struck the wireless entry from the record, and signed the accident verdict in two days to spare the Board a scandal."
  },
  c_tarn_secret: {
    title: "Tarn's secret was his nets, not murder",
    text: "Jacob Tarn was in the cove on the dark nights because his illegal small-mesh nets fish best unlit. He hid from the inquiry to protect his boat, not a killing."
  }
};

// Board links. Each pair is order-independent. A pair not listed here is simply unproven.
function L(a, b, gives) { return { pair: [a, b], gives }; }
const links = [
  // the lamp went dark
  L("private_log", "official_log", "c_dark_nights"),
  L("private_log", "oil_ledger", "c_dark_nights"),
  L("oil_ledger", "official_log", "c_dark_nights"),
  // the record was rewritten
  L("official_log", "barograph_trace", "c_log_amended"),
  L("official_log", "inquiry_file", "c_log_amended"),
  L("official_log", "s_vale_admits", "c_log_amended"),
  L("barograph_trace", "s_crowe_alibi", "c_log_amended"),
  // Wren knew and meant to report
  L("private_log", "unsent_letter", "c_wren_planned"),
  L("unsent_letter", "diary_entry", "c_wren_planned"),
  L("unsent_letter", "s_margaret_warning", "c_wren_planned"),
  // Wren was sober
  L("inquiry_file", "whisky_bottle", "c_wren_sober"),
  L("whisky_bottle", "doctor_card", "c_wren_sober"),
  L("s_margaret_bottle", "inquiry_file", "c_wren_sober"),
  L("doctor_card", "s_margaret_bottle", "c_wren_sober"),
  // the cove landings
  L("radio_notes", "contraband_cache", "c_smuggling"),
  L("wireless_log", "contraband_cache", "c_smuggling"),
  L("tide_gauge", "contraband_cache", "c_smuggling"),
  L("s_ada_signal", "contraband_cache", "c_smuggling"),
  L("foreign_lantern", "tide_gauge", "c_smuggling"),
  // who was paid
  L("cash_tin", "private_log", "c_crowe_paid"),
  L("cash_tin", "contraband_cache", "c_crowe_paid"),
  L("cash_tin", "landing_chart", "c_crowe_paid"),
  // a left-handed keeper at the lamp
  L("wick_sample", "lampblack_print", "c_left_hand"),
  L("wick_sample", "wick_tin", "c_left_hand"),
  L("lampblack_print", "watch_slip", "c_left_hand"),
  // the second key
  L("key_board", "relief_roster", "c_second_key"),
  L("key_board", "crowe_oilskin", "c_second_key"),
  L("relief_roster", "crowe_oilskin", "c_second_key"),
  // Crowe in the lamp room (the key proof — two independent chains, see DESIGN.md)
  L("c_left_hand", "c_second_key", "c_crowe_in_lamp_room"),
  L("lampblack_print", "crowe_oilskin", "c_crowe_in_lamp_room"),
  L("s_tarn_saw", "c_second_key", "c_crowe_in_lamp_room"),
  L("s_tarn_saw", "c_left_hand", "c_crowe_in_lamp_room"),
  L("s_crowe_confession", "c_dark_nights", "c_crowe_in_lamp_room"),
  L("watch_slip", "s_crowe_alibi", "c_crowe_in_lamp_room"),
  L("foreign_lantern", "s_tarn_saw", "c_crowe_in_lamp_room"),
  // the struggle at the stair head
  L("stair_boss", "brass_button", "c_struggle_stairs"),
  L("brass_button", "wren_coat", "c_struggle_stairs"),
  L("stair_boss", "c_wren_sober", "c_struggle_stairs"),
  // the whitewash
  L("inquiry_file", "s_vale_admits", "c_vale_whitewash"),
  L("s_ada_omission", "inquiry_file", "c_vale_whitewash"),
  // the fisherman's real secret
  L("boathouse_net", "s_tarn_fishing", "c_tarn_secret"),
  L("s_tarn_fishing", "tide_gauge", "c_tarn_secret")
];

const chapters = [
  {
    id: "c1",
    title: "The Pouch in the Store",
    scenes: ["chart_room"],
    suspects: ["crowe", "ada"],
    question: "Why did the light go out?",
    goals: ["c_dark_nights"],
    intro: {
      speaker: "voss",
      text: "Detective, I'm Voss. Six years ago Thomas Wren, principal keeper of this lighthouse, was found dead at the foot of his tower stairs, and the Board called it a drunken fall. This spring the station was decommissioned, and his oilskin log pouch turned up in the store. His private book is in your briefing. Start in the chart room at the tower base — the official record lives there."
    },
    hints: [
      "Wren's private logbook is unreadable as found. Whoever holds the Analyst role can run it through the lab.",
      "Compare his book with the station's official lamp log on the chart table. And ask what the lamp actually burned — the oil ledger keeps count.",
      "Link the cleaned private log with the official lamp log on the board."
    ]
  },
  {
    id: "c2",
    title: "The Keeper's Cottage",
    scenes: ["chart_room", "cottage"],
    suspects: ["crowe", "ada", "margaret"],
    question: "What did Wren intend to do — and was he really drunk?",
    goals: ["c_wren_planned", "c_wren_sober"],
    intro: {
      speaker: "voss",
      text: "The light went out on chosen nights, and the record was kind about it. Now go down to the keeper's cottage. Wren lived there with Margaret until the night he died. I want to know what he meant to do about it — and whether that bottle in his hand was ever his."
    },
    hints: [
      "Look where a keeper keeps what matters: his desk drawer, his diary on the kitchen table, the pad by his wireless set.",
      "The unsent letter in the desk and his private log belong together. For the whisky story, the inquiry file and the bottle in the sideboard disagree.",
      "Link the unsent letter with the private log. Link the inquiry file with the whisky bottle, and check the doctor's card in the desk."
    ]
  },
  {
    id: "c3",
    title: "The Cove Below",
    scenes: ["chart_room", "cottage", "boathouse"],
    suspects: ["crowe", "ada", "margaret", "tarn"],
    question: "What came ashore on the dark nights, and who was paid?",
    goals: ["c_smuggling", "c_crowe_paid"],
    intro: {
      speaker: "voss",
      text: "Wren knew, and he meant to blow the whistle on Tuesday. Someone made money out of his dark half-hours. Go down to the boathouse at the cove and find out what the darkness was for — and follow the money."
    },
    hints: [
      "Look under the upturned hull, and in the bait tin on the workbench. The tide-gauge board says when the cove could be used.",
      "The fisherman Tarn chooses his nights for a reason of his own. Be patient with him before you judge him.",
      "Link what is hidden under the hull with Wren's wireless notes. Link the bait tin with the private log's dark dates."
    ]
  },
  {
    id: "c4",
    title: "The Lamp Room",
    scenes: ["chart_room", "cottage", "boathouse", "lamp_room"],
    suspects: ["crowe", "ada", "margaret", "tarn", "vale"],
    question: "Who was up the tower, and how did Wren fall?",
    goals: ["c_crowe_in_lamp_room", "c_struggle_stairs"],
    intro: {
      speaker: "voss",
      text: "Boats, money, and a rewritten log. All of it points up the tower. Climb to the lamp room, Detective. Whoever darkened that lamp left his traces where only a keeper could go. And bring me the truth about those stairs."
    },
    hints: [
      "The lamp itself remembers: its wick, its pedestal, the tin of spare wicks on the desk. Two of them need the lab.",
      "Check the stair head before the lens. A button on the floor and a coat in the cottage belong to the same moment.",
      "Prove whose hand worked the lamp and whose key opened the door, then link those two conclusions together. Link the stair-head rail with the brass button."
    ]
  },
  {
    id: "c5",
    title: "Name the Culprit",
    scenes: ["chart_room", "cottage", "boathouse", "lamp_room"],
    suspects: ["crowe", "ada", "margaret", "tarn", "vale"],
    question: "Who killed Thomas Wren, why, how, and what proves it?",
    goals: [],
    intro: {
      speaker: "voss",
      text: "That is everything, Detective. The board is yours. Decide together: culprit, motive, method and proof. Six years ago this station closed ranks around a lie. Don't let it happen twice."
    },
    hints: [
      "Everyone here kept something back: an inspector's shame, a fisherman's nets, a widow's pride. Only one secret needed a dark lamp.",
      "Ask who held the second key on the dark nights, and whose hand is on the lamp. The money in the boathouse answers why.",
      "Name Silas Crowe. For proof, use the conclusion that places him in the lamp room that night."
    ]
  }
];

const accusation = {
  culprits: ["crowe", "margaret", "vale", "tarn", "ada"],
  motives: [
    { id: "m_smuggling", text: "To keep the smuggling money coming, and silence the one man who had found out." },
    { id: "m_inheritance", text: "To inherit the cottage and the keeper's pension." },
    { id: "m_scandal", text: "To bury a Board scandal before the inspection." },
    { id: "m_debt", text: "To settle a debt owed to the cove boats." }
  ],
  methods: [
    { id: "x_stairs", text: "Grappled with him at the stair head in the lamp room's dark half-hour; Wren fell, and the fall was dressed up as a drunk's accident." },
    { id: "x_fall", text: "Slipped on the tower stairs alone, after drinking." },
    { id: "x_gallery", text: "Lost his footing on the gallery in the squall and fell, alone." },
    { id: "x_cove", text: "Drowned at the cove and was carried up to the tower afterwards." }
  ],
  answer: {
    culprit: "crowe",
    motive: "m_smuggling",
    method: "x_stairs",
    proofs: ["c_crowe_in_lamp_room", "c_crowe_paid"]
  }
};

const epilogue = {
  truth:
    "Thomas Wren discovered that his relief keeper was selling the light itself: on chosen high-tide nights Silas Crowe climbed the tower, darkened the lamp for half an hour, and let the cove boats land unseen — forty pounds a night, tallied in a bait tin. On the night of 9 November Wren waited in the lamp room. They grappled at the stair head in the dark; Wren struck the newel and fell the full flight. Crowe re-lit the lamp, copied the log fair with a squall that never happened, set a cove-run bottle in the dead man's hand, and let the Board's inspector — who never climbed the tower — call it drink. The light kept its secret for six years, until Wren's own book came out of the store.",
  results: {
    5: "A perfect case. Silas Crowe is arrested, Thomas Wren's name is cleared, and Blackrock Head is struck from the list of accidents.",
    4: "Crowe is arrested. A couple of loose ends cost you a polished conviction, but the right man is behind bars.",
    3: "You named the right culprit, but the case was thin. Crowe's lawyer will fight, and the Board is nervous.",
    2: "Part of your case held up, but the accusation fell apart. A killer keeps his pension and his secret.",
    1: "The accusation failed. The file closes again, and the drunken-fall story stands for good."
  }
};

module.exports = { meta, speakers, conclusions, links, chapters, accusation, epilogue };
