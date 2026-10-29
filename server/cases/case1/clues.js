// Clues for Case 1. `text` is what the finder sees. `analysis` clues need the Analyst's lab
// mini-puzzle (slider focus) before `revealed` is shown. `audio` plays a voice line.

module.exports = {
  // ---- starting evidence (given to the whole party in the briefing) ----
  bilge_page: {
    title: "Water-damaged ledger page",
    kind: "document",
    start: true,
    text: "A single ledger page recovered from the Kestrel's bilge during last month's refit. Seawater has bled the ink into grey clouds. Only the date can be read: the 14th.",
    analysis: {
      prompt: "Adjust the contrast filter until the handwriting comes into focus.",
      target: 0.62,
      tolerance: 0.07,
      revealed:
        "Elena's handwriting: 'Voids Apr to Sep: 41. All entered with key 07. Cash never banked: 6,820. It is not the numbers, it is a person. Hear her out on the boat Thursday. Do not tell R.'"
    }
  },

  // ---- Harbor Ticket Office ----
  ticket_ledger: {
    title: "Ticket sales ledger, the 14th",
    kind: "document",
    text: "The last night's entries. Last ferry: 23:00 sailing. Ticket #0457 sold at 22:52, then marked VOID at 22:58, authorized with key 07. Valid tickets for the 23:00 sailing: six."
  },
  void_log: {
    title: "Void log binder",
    kind: "document",
    text: "A binder of voided sales. From April to September: forty-one voids, every one authorized with key 07. None of them were refunded."
  },
  cash_drawer: {
    title: "Cash drawer and bank slips",
    kind: "object",
    text: "Bank deposit slips for April to September. Every month the deposit is lower than the ticket counts say it should be. The gap adds up to roughly 6,800."
  },
  ferry_timetable: {
    title: "Timetable board",
    kind: "object",
    text: "Thursdays: the last ferry leaves the harbor at 23:00 for the Gull Island loop and returns at 23:40."
  },
  staff_photo: {
    title: "Staff photograph",
    kind: "photo",
    text: "A framed staff photo. Elena Marsh stands in the middle wearing a thick teal wool scarf. Clara Dunne is beside her, laughing, one arm around Elena's shoulders. Rook stands at the edge, not smiling."
  },
  rook_note: {
    title: "Torn note by Rook's phone",
    kind: "document",
    text: "Rook's handwriting: 'Pell, Thursday 10 a.m., the usual envelope. Lifeboat paperwork must be signed before the audit.' It is dated the week before Elena vanished."
  },

  // ---- Elena's Apartment ----
  stub_shoebox: {
    title: "Shoebox of used ferry tickets",
    kind: "object",
    text: "Dozens of used tickets for the 23:00 sailing, one for almost every Thursday for years. A scrap of paper inside reads: 'Best place to think.'"
  },
  desk_calendar: {
    title: "Wall calendar",
    kind: "document",
    text: "Thursday the 14th: 'last boat, hear her out.' Friday the 15th is circled hard in red: 'POLICE.'"
  },
  notepad_impression: {
    title: "Notepad with pencil impressions",
    kind: "document",
    text: "A desk notepad. The top sheet is gone, but faint grooves remain from whatever was written on it.",
    analysis: {
      prompt: "Angle the light across the page until the grooves become readable.",
      target: 0.35,
      tolerance: 0.07,
      revealed:
        "The impressions read: 'K07 x 41. Ask her Thursday. Why her? Why would she. Tell nobody, not even S.'"
    }
  },
  answering_machine: {
    title: "Answering machine tape",
    kind: "audio",
    text: "One saved message, timestamped 21:40 on the 14th. The caller never gives a name. A woman's voice, shaky and fast.",
    audio: {
      speaker: "clara",
      text: "Elena, it's me. Please call me back before you do anything. I can explain the books. I'm at the office until half past ten. Please."
    }
  },
  ibarra_letter: {
    title: "Letter under the blotter",
    kind: "document",
    text: "A letter signed 'S.': 'Elena, this is goodbye. I won't call again. I know you've been hiding something from me. I hope you tell someone who can help.'"
  },
  scarf_hook: {
    title: "Empty hook by the door",
    kind: "object",
    text: "A hook with an empty loop. In the staff photograph Elena wears a teal wool scarf; it isn't on this hook, in the wardrobe, or in the evidence list."
  },

  // ---- Police Archive ----
  case_file: {
    title: "Original police report",
    kind: "document",
    text: "Ruled probable suicide. Her coat was found folded on the pier at 06:10. No note, no body. Statements: Clara Dunne left the office at 22:30, took the number 14 bus at 22:45, home by 23:15. Rook: home alone. Hale: on the bridge all night. Dr. Ibarra: at the clinic until 01:00. Nina Kell: asleep in the crew quarters."
  },
  coat_box: {
    title: "Evidence box: Elena's coat",
    kind: "object",
    text: "Her grey wool coat, bagged and tagged. A sleeve looks faintly stained, but nobody examined it closely at the time.",
    analysis: {
      prompt: "Sweep the UV lamp until the stain fluoresces.",
      target: 0.8,
      tolerance: 0.07,
      revealed:
        "Under UV, the left sleeve glows with a smear of glossy dark green marine enamel. A tiny flake sits in the pocket seam."
    }
  },
  pier_photo: {
    title: "Pier photograph, 06:10",
    kind: "photo",
    text: "Where the coat was found. The pier rail is painted battleship grey. There is no green paint anywhere on the pier."
  },
  bus_timetable: {
    title: "City bus timetable, route 14",
    kind: "document",
    text: "Route 14, Thursdays: the last bus from Harbor Road leaves at 22:20. There is nothing after it."
  },
  clinic_log: {
    title: "Harbor clinic duty log",
    kind: "document",
    text: "On the 14th Dr. Ibarra stitched a dockworker's torn hand from 22:30 to 00:50. A nurse signed beside every entry."
  },
  inspector_record: {
    title: "Safety inspection file",
    kind: "document",
    text: "Inspector Pell signed off the Kestrel's lifeboat certificates two weeks early. A year later he retired to a house by the sea he could not have afforded on his salary."
  },
  crew_roster: {
    title: "Crew roster, the 14th",
    kind: "document",
    text: "Bridge: V. Hale. Deck watch 22:30 to 01:00: N. Kell. Engine room: unmanned for the Gull Island loop."
  },
  key_register: {
    title: "Staff key register",
    kind: "document",
    text: "Personal authorization keys: 03 Rook, M. 05 Hale, V. 07 Dunne, C. 09 Marsh, E. Each employee may only use their own key for voids and refunds."
  },

  // ---- MV Kestrel ----
  aft_bench: {
    title: "Aft deck bench",
    kind: "object",
    text: "Fresh-looking dark green marine enamel, tacky in places. The refit foreman says this exact green is used on the Kestrel and nowhere else in the harbor."
  },
  hatch_latch: {
    title: "Engine hatch latch",
    kind: "object",
    text: "A bent steel latch at head height on the engine hatch. Something is caught in the bend.",
    analysis: {
      prompt: "Raise the magnification until the caught material resolves.",
      target: 0.5,
      tolerance: 0.07,
      revealed:
        "Teal wool fibres, the same dye as Elena's scarf, are snagged in the bend. The metal has been bent outward by a hard blow."
    }
  },
  maintenance_log: {
    title: "Maintenance log",
    kind: "document",
    text: "Oct 10: aft deck repainted in Kestrel green, two coats. Engine hatch latch inspected and found sound."
  },
  gangway_counter: {
    title: "Gangway click-counter",
    kind: "object",
    text: "The mechanical click counter at the crew gangway stopped at seven for the 23:00 sailing. The ticket ledger only shows six valid tickets."
  },
  bridge_logbook: {
    title: "Bridge logbook",
    kind: "document",
    text: "The entries for the 14th are written in a different pen and an unsteady hand: 'Dep 23:00. Arr 23:40. All quiet.' A marginal note says they were written up the next morning."
  },
  bottle_locker: {
    title: "Locker behind the wheelhouse",
    kind: "object",
    text: "Three empty bottles of spirits and a hip flask engraved 'V.H.'"
  },
  crew_locker: {
    title: "Crew locker",
    kind: "object",
    text: "A blanket, a thermos, and a name tag reading N. KELL. Somebody slept here on more than one watch."
  }
};
