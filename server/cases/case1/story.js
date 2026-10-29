// Story layer for Case 1: conclusions, board links, chapters, hints, accusation, epilogue.

const meta = {
  id: "case1",
  title: "The Last Ferry",
  tagline: "Ten years ago a woman vanished. The pier says she jumped. The page says otherwise.",
  summary:
    "Elena Marsh, chief accountant of Haverport Ferries, vanished after the last boat. Her coat was found on the pier and the case was closed as a suicide. A ledger page just surfaced in the Kestrel's bilge. Reopen the file."
};

// Voices (Kokoro voice ids) used by the voice generator.
const speakers = {
  morgan: { name: "Captain Morgan", voice: "bm_george", speed: 0.95 },
  narrator: { name: "Narrator", voice: "bf_emma", speed: 0.95 },
  clara: { name: "Clara Dunne", voice: "af_nicole", speed: 1.0 },
  rook: { name: "Martin Rook", voice: "bm_daniel", speed: 0.95 },
  ibarra: { name: "Dr. Ibarra", voice: "am_michael", speed: 0.95 },
  hale: { name: "Captain Hale", voice: "bm_lewis", speed: 0.9 },
  nina: { name: "Nina Kell", voice: "af_sky", speed: 0.95 }
};

const conclusions = {
  c_skimming: {
    title: "Elena discovered a theft",
    text: "Forty-one voided tickets, all authorized with key 07, and the cash never reached the bank."
  },
  c_k07_clara: {
    title: "Key 07 is Clara's",
    text: "The key register and Clara's own words agree: every one of those voids was entered with Clara Dunne's personal key."
  },
  c_motive: {
    title: "Clara had a motive",
    text: "Clara stood to be exposed as the thief if Elena went to the police."
  },
  c_elena_habit: {
    title: "Elena rode the last ferry on Thursdays",
    text: "She rode the 23:00 ferry most Thursdays to think. The night she vanished was a Thursday."
  },
  c_elena_planned_police: {
    title: "Elena planned to go to the police",
    text: "She had decided to go to the police on Friday, but wanted to hear someone out on the boat first."
  },
  c_coat_from_ferry: {
    title: "The coat was on the ferry, not the pier",
    text: "Kestrel green paint on the sleeve, grey paint on the pier rail: the coat touched the ferry deck and was placed on the pier afterwards."
  },
  c_elena_on_ferry: {
    title: "Elena boarded the last ferry",
    text: "She did not jump from the pier. She was aboard the 23:00 sailing."
  },
  c_hidden_boarder: {
    title: "Seven boarded on six tickets",
    text: "The gangway counted seven people, but only six tickets were valid. One boarder had their ticket voided to erase them from the record."
  },
  c_clara_boarded: {
    title: "Clara boarded and hid it",
    text: "Ticket #0457 was sold at 22:52 and voided at 22:58 with key 07. Only Clara could have done that, and it removed her from the manifest."
  },
  c_clara_alibi_false: {
    title: "Clara's bus alibi is impossible",
    text: "She said she took the 22:45 bus. The last bus left at 22:20."
  },
  c_clara_lied_call: {
    title: "Clara lied about the phone call",
    text: "She swore she never phoned Elena that day, but the answering machine tape proves she did."
  },
  c_clara_lied: {
    title: "Clara lied twice",
    text: "False alibi, false denial. Innocent people forget details; they do not invent two."
  },
  c_nina_on_watch: {
    title: "Nina was an eyewitness",
    text: "Nina Kell was the deck watch, not asleep in quarters. She was close enough to hear what happened on deck."
  },
  c_clara_on_deck: {
    title: "Clara was on the aft deck with Elena",
    text: "The voided ticket and Nina's testimony put Clara aboard, on the aft deck, at the time Elena vanished."
  },
  c_elena_at_hatch: {
    title: "Elena was at the engine hatch",
    text: "Fibres from her teal scarf are caught in the hatch latch."
  },
  c_struck_at_hatch: {
    title: "Someone was struck against the hatch",
    text: "The latch was sound on October 10 and bent outward afterwards, with Elena's scarf fibres caught in it. It happened that night."
  },
  c_cover_up: {
    title: "The pier suicide was staged",
    text: "A voided ticket and a coat carried from the ferry to the pier: someone worked hard to make this look like a suicide."
  },
  c_method: {
    title: "How it happened",
    text: "Elena was struck against the engine hatch, went over the side, and the person with her covered it up."
  },
  c_trusted_friend: {
    title: "Elena trusted the thief with her life",
    text: "She told Dr. Ibarra the person behind the theft was someone she trusted with her life. Key 07 belongs to her best friend."
  },
  c_ibarra_cleared: {
    title: "Dr. Ibarra is cleared",
    text: "He was at the clinic all night, and his letter is a goodbye, not a threat."
  },
  c_rook_bribe: {
    title: "Rook's secret: a bribed inspector",
    text: "Rook paid Inspector Pell to pass the lifeboat certificates. It is a crime, but Elena never knew, so it is no reason to kill her."
  },
  c_hale_unreliable: {
    title: "Hale's log cannot be trusted",
    text: "He drank on the bridge and wrote the log the next morning. He cannot vouch for what happened on deck."
  }
};

// Board links. Each pair is order-independent. A pair not listed here is simply unproven.
function L(a, b, gives) { return { pair: [a, b], gives }; }
const links = [
  L("bilge_page", "void_log", "c_skimming"),
  L("void_log", "cash_drawer", "c_skimming"),
  L("bilge_page", "cash_drawer", "c_skimming"),
  L("void_log", "key_register", "c_k07_clara"),
  L("bilge_page", "key_register", "c_k07_clara"),
  L("void_log", "s_clara_key", "c_k07_clara"),
  L("bilge_page", "s_clara_key", "c_k07_clara"),
  L("c_skimming", "c_k07_clara", "c_motive"),
  L("stub_shoebox", "ferry_timetable", "c_elena_habit"),
  L("stub_shoebox", "desk_calendar", "c_elena_habit"),
  L("desk_calendar", "notepad_impression", "c_elena_planned_police"),
  L("desk_calendar", "bilge_page", "c_elena_planned_police"),
  L("coat_box", "aft_bench", "c_coat_from_ferry"),
  L("coat_box", "pier_photo", "c_coat_from_ferry"),
  L("pier_photo", "aft_bench", "c_coat_from_ferry"),
  L("coat_box", "maintenance_log", "c_coat_from_ferry"),
  L("c_coat_from_ferry", "c_elena_habit", "c_elena_on_ferry"),
  L("ticket_ledger", "gangway_counter", "c_hidden_boarder"),
  L("c_hidden_boarder", "c_k07_clara", "c_clara_boarded"),
  L("ticket_ledger", "c_k07_clara", "c_clara_boarded"),
  L("bus_timetable", "s_clara_alibi", "c_clara_alibi_false"),
  L("bus_timetable", "case_file", "c_clara_alibi_false"),
  L("answering_machine", "s_clara_no_call", "c_clara_lied_call"),
  L("c_clara_alibi_false", "c_clara_lied_call", "c_clara_lied"),
  L("crew_roster", "s_nina_asleep", "c_nina_on_watch"),
  L("crew_roster", "s_nina_admitted", "c_nina_on_watch"),
  L("s_nina_saw", "c_clara_boarded", "c_clara_on_deck"),
  L("s_nina_saw", "c_k07_clara", "c_clara_on_deck"),
  L("s_nina_saw", "c_clara_alibi_false", "c_clara_on_deck"),
  L("s_clara_confession", "c_clara_boarded", "c_clara_on_deck"),
  L("hatch_latch", "scarf_hook", "c_elena_at_hatch"),
  L("hatch_latch", "staff_photo", "c_elena_at_hatch"),
  L("c_elena_at_hatch", "maintenance_log", "c_struck_at_hatch"),
  L("hatch_latch", "maintenance_log", "c_struck_at_hatch"),
  L("c_clara_boarded", "c_coat_from_ferry", "c_cover_up"),
  L("c_struck_at_hatch", "c_cover_up", "c_method"),
  L("s_ibarra_trusted", "c_k07_clara", "c_trusted_friend"),
  L("s_ibarra_trusted", "c_motive", "c_trusted_friend"),
  L("ibarra_letter", "clinic_log", "c_ibarra_cleared"),
  L("s_ibarra_alibi", "clinic_log", "c_ibarra_cleared"),
  L("rook_note", "inspector_record", "c_rook_bribe"),
  L("bridge_logbook", "bottle_locker", "c_hale_unreliable"),
  L("s_hale_drunk", "bridge_logbook", "c_hale_unreliable")
];

const chapters = [
  {
    id: "c1",
    title: "The Page in the Bilge",
    scenes: ["harbor_office"],
    suspects: ["clara", "rook"],
    question: "What had Elena discovered?",
    goals: ["c_skimming"],
    intro: {
      speaker: "morgan",
      text: "Detective, a ledger page turned up in the Kestrel's bilge during the refit. Ten years ago Elena Marsh, our ferry company's accountant, vanished after the last boat. Her coat was found on the pier and the file was closed as a suicide. That page may say otherwise. Start at the ticket office."
    },
    hints: [
      "The ledger page is unreadable. Whoever holds the Analyst role can run it through the lab.",
      "The page talks about voided tickets. Where would those be recorded in the ticket office?",
      "Link the cleaned bilge page with the void log on the board."
    ]
  },
  {
    id: "c2",
    title: "Thursday Nights",
    scenes: ["harbor_office", "apartment"],
    suspects: ["clara", "rook", "ibarra"],
    question: "Why did Elena go out that night?",
    goals: ["c_elena_habit", "c_elena_planned_police"],
    intro: {
      speaker: "morgan",
      text: "She found a thief, and she was afraid, but not of the sea. Go to her apartment. I want to know why a woman who feared someone would still go out that night."
    },
    hints: [
      "Look for habits. What did Elena do most Thursdays?",
      "The shoebox of tickets and the timetable board belong together. The calendar and the notepad say what she planned next.",
      "Link the shoebox with the timetable, then the calendar with the notepad impression."
    ]
  },
  {
    id: "c3",
    title: "The Coat on the Pier",
    scenes: ["harbor_office", "apartment", "archive"],
    suspects: ["clara", "rook", "ibarra", "hale"],
    question: "Was it really suicide, and whose key was 07?",
    goals: ["c_coat_from_ferry", "c_k07_clara"],
    intro: {
      speaker: "morgan",
      text: "The file says the pier. Your evidence says a boat. Time to open the police archive. Somebody told a story ten years ago, and I want to know who."
    },
    hints: [
      "Two questions: where has the coat really been, and who owns key 07? Both are answered in the archive.",
      "The coat needs the lab. Compare what is on its sleeve with the paint on the pier and the paint on the ferry.",
      "Link the coat with the pier photo, and the void log with the key register."
    ]
  },
  {
    id: "c4",
    title: "The Last Ferry",
    scenes: ["harbor_office", "apartment", "archive", "ferry"],
    suspects: ["clara", "rook", "ibarra", "hale", "nina"],
    question: "Who boarded, and what happened on deck?",
    goals: ["c_clara_boarded", "c_struck_at_hatch"],
    intro: {
      speaker: "morgan",
      text: "You have proved the pier story false and found whose key was used. Now board the Kestrel. The ferry is in dry dock, but the deck remembers. Find out what happened on that last crossing."
    },
    hints: [
      "Count the people who boarded and compare them with the tickets. And look closely at the engine hatch.",
      "The gangway counter and the ticket ledger disagree. The hatch latch needs the lab, and the maintenance log tells you when it was last sound.",
      "Link the ticket ledger with the gangway counter, then that result with the key 07 conclusion. Link the hatch latch with the maintenance log."
    ]
  },
  {
    id: "c5",
    title: "Name the Culprit",
    scenes: ["harbor_office", "apartment", "archive", "ferry"],
    suspects: ["clara", "rook", "ibarra", "hale", "nina"],
    question: "Who killed Elena, why, how, and what proves it?",
    goals: [],
    intro: {
      speaker: "morgan",
      text: "That is everything, Detective. The board is yours. Decide together: culprit, motive, method and proof. If we get this wrong, a killer walks free a second time."
    },
    hints: [
      "Everyone has a secret, but only one secret is connected to Elena's death.",
      "Rook, Ibarra and Hale each lied about something that has nothing to do with the night on the ferry. One person lied about both the call and the bus.",
      "Name Clara Dunne. For proof, use the conclusion that places her on the ferry."
    ]
  }
];

const accusation = {
  culprits: ["clara", "rook", "ibarra", "hale", "nina"],
  motives: [
    { id: "m_theft", text: "To stop Elena exposing the stolen ticket money." },
    { id: "m_jealousy", text: "Jealousy over Dr. Ibarra." },
    { id: "m_lifeboats", text: "To hide the bribed lifeboat certificates." },
    { id: "m_grudge", text: "A grudge over being passed over for a job." }
  ],
  methods: [
    { id: "x_hatch", text: "Struck at the engine hatch on the ferry, went overboard, and was covered up." },
    { id: "x_pier", text: "Jumped from the pier on her own." },
    { id: "x_accident", text: "Fell accidentally while alone on deck." },
    { id: "x_apartment", text: "Taken from her apartment and drowned in the harbor." }
  ],
  answer: {
    culprit: "clara",
    motive: "m_theft",
    method: "x_hatch",
    proofs: ["c_clara_on_deck", "c_clara_boarded"]
  }
};

const epilogue = {
  truth:
    "Elena Marsh found out that her best friend had been voiding ticket sales and pocketing the cash for six months. She meant to hear Clara out on the last ferry, then go to the police on Friday. Clara bought a ticket and voided it so no record would show she was aboard, then followed Elena through the crew gangway. On the aft deck they argued. Elena struck the engine hatch and went over the side. Clara took the coat, left with the crew, and placed it on the pier at dawn. The pier story held for ten years.",
  results: {
    5: "A perfect case. Clara Dunne is arrested, Elena's name is cleared, and the Cold Case Unit has its first closed file.",
    4: "Clara Dunne is arrested. A couple of loose ends cost you a polished conviction, but the right person is behind bars.",
    3: "You named the right culprit, but the case was thin. Clara's lawyer will fight, and the unit is nervous.",
    2: "Part of your case held up, but the accusation fell apart. A killer is still free.",
    1: "The accusation failed. The file closes again, and the pier story stands for another ten years."
  }
};

module.exports = { meta, speakers, conclusions, links, chapters, accusation, epilogue };
