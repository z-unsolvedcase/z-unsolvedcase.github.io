// Clues for Case 2. `text` is what the finder sees. `analysis` clues need the Analyst's lab
// mini-puzzle (slider focus) before `revealed` is shown.

module.exports = {
  // ---- starting evidence (given to the whole party in the briefing) ----
  private_log: {
    title: "Wren's private logbook",
    kind: "document",
    start: true,
    text: "Thomas Wren's personal logbook, kept in his oilskin pouch and found during the decommissioning clearance. Six years of damp have swollen the pages and bled the pencil into grey clouds. Only the cover can be read: 'T. Wren — my own book, not the station's.'",
    analysis: {
      prompt: "Adjust the contrast filter until the pencil entries come into focus.",
      target: 0.58,
      tolerance: 0.07,
      revealed:
        "'Oct 28: dark 23:12 to 23:41. Not by my hand. Nov 2: dark again, the same half hour, high water at the cove. Nov 6: dark. Three times is a pattern, and a pattern has a keeper. Nov 9: tonight I watch from the gallery myself. If it goes dark, I—' The last entry stops mid-sentence."
    }
  },

  // ---- Chart Room (tower base) ----
  official_log: {
    title: "Official lamp log, fair copy",
    kind: "document",
    text: "The station's official lamp log for Wren's last autumn. Every night is recorded the same: 'Lamp lit at dusk, burning bright, trimmed at midnight.' Against 9 November a marginal note is squeezed in: '23:05 squall, lamp attended, burning bright — S.C.' The whole quarter is written in one uniform hand and one ink, though it covers three months of nights."
  },
  oil_ledger: {
    title: "Paraffin oil ledger",
    kind: "document",
    text: "The lamp-room oil account, kept by measure. In the weeks of 28 October and 2 November the lamp room handed back nearly a gallon of paraffin unburned — though the official log claims full, bright nights throughout. A lamp that burns all night does not save oil."
  },
  barograph_trace: {
    title: "Barograph trace, November",
    kind: "object",
    text: "The chart room barograph drum for the week of Wren's death. The inked pressure line runs flat and steady across the night of 9 November, hour by hour. No dip, no squall, nothing. The weather that night was a flat calm."
  },
  tide_table: {
    title: "Tide tables, Wren's copy",
    kind: "document",
    text: "The printed tide tables for the headland, Wren's own copy. Three autumn dates are ringed in pencil: 28 October, 2 November, 6 November. On each, high water in the cove below falls between 23:10 and 23:45."
  },
  wireless_log: {
    title: "Wireless rough log",
    kind: "document",
    text: "The wireless room's rough log, first hand, kept in the signal room. At 23:24 on 9 November, and twice in the weeks before at the same hour, an unknown station with no call sign sent five words in plain language: 'ALL DARK COMING IN.' In the fair transcript bound beside it, those three entries do not appear."
  },
  relief_roster: {
    title: "Relief roster and key receipts",
    kind: "document",
    text: "The duty roster for Wren's last autumn, with the lamp-room key receipts clipped behind it. Relief keeper on 28 October, 2 November, 6 November and 9 November: S. Crowe. Each time, the receipt for lamp-room key No. 2 is signed in the same cramped, left-leaning hand."
  },
  key_board: {
    title: "Lamp-room key board",
    kind: "object",
    text: "The board by the chart room door holds the only two keys to the lamp room. No. 1, 'Principal', hangs in place. No. 2, 'Relief', hangs there too — but the paint around its hook is chipped bright in a ring, as if the key was once taken down and put back in a hurry, in the dark."
  },
  inquiry_file: {
    title: "Board inquiry file, six years ago",
    kind: "document",
    text: "The official inquiry into Wren's death, signed by Inspector A. Vale two days afterwards. Verdict: accidental fall while intoxicated; a half-empty spirits bottle was in the dead man's hand. The file notes the lamp log was 'received as a fair copy; the working book mislaid'. There is no record of the inspector climbing the tower, and the lamp-room wick and fittings were never examined."
  },

  // ---- Keeper's Cottage ----
  unsent_letter: {
    title: "Unsent letter to the Board",
    kind: "document",
    text: "A draft in Wren's upright hand, folded into his desk drawer and never sent: '...the lamp of this station has been extinguished on three occasions, not by my hand nor by any fault of the machinery. I ask that an inspector attend before the winter, and I ask it in writing so that it cannot be said I did not. I believe a keeper's key is used. I will say more when he comes.' It is dated 7 November."
  },
  diary_entry: {
    title: "Wren's diary, open on the table",
    kind: "document",
    text: "Wren's pocket diary, still open where Margaret left it. 'Nov 8: M. thinks I am imagining it. She may be right to be afraid. Nov 9: the Board man comes Tuesday. I will tell him all of it, and show him the book.'"
  },
  whisky_bottle: {
    title: "The sideboard bottle",
    kind: "object",
    text: "One bottle of whisky stands in the cottage sideboard, where Margaret put it the Christmas before Wren died. The seal is unbroken, the level full, the glass furred with six years of dust. No other spirits are kept in the house."
  },
  doctor_card: {
    title: "Doctor's prescription card",
    kind: "document",
    text: "A card from the station doctor, kept in Wren's desk: 'T. Wren — on account of the heart: no spirits, not a drop, from this day. — Dr. Ellison.' It is dated two years before Wren's death."
  },
  radio_notes: {
    title: "Listening pad by the wireless set",
    kind: "document",
    text: "The pad Wren kept beside his home wireless set in the cottage, in his own hand: 'Oct 28, 23:20 — a carrier, no call sign, bearing the cove. Nov 2, 23:18 — the same. Somebody talks to the boats, or the boats talk to somebody.'"
  },
  wren_coat: {
    title: "Wren's uniform coat on its hook",
    kind: "object",
    text: "Wren's heavy uniform coat still hangs on its hook by the cottage door. The left cuff button is gone — not worn loose, but torn: the threads stand snapped and stiff. Margaret could never bring herself to mend it."
  },

  // ---- Boathouse at the cove ----
  contraband_cache: {
    title: "Crates under the upturned hull",
    kind: "object",
    text: "Beneath a tarpaulin under the upturned boat: tea chests and crates stencilled with a Cadiz mark, packed with spirits and tobacco, not one bottle carrying a duty stamp. The tarpaulin's dust is old — but the arrangement is careful, professional, and meant to be returned to."
  },
  cash_tin: {
    title: "Bait tin on the workbench",
    kind: "object",
    text: "A fisherman's bait tin that holds no bait. Inside: folded banknotes and a tally card in pencil. Against three autumn dates — 28 Oct, 2 Nov, 6 Nov — the same mark, 'L.', and the same sum: forty pounds. A fourth line is ruled and ready, and was never filled in."
  },
  boathouse_net: {
    title: "Net bundle under the bench",
    kind: "object",
    text: "A drift net of illegal small mesh, tarred black, with a shuttered lantern wired to its head-rope float. Gear made for working a cove dark and unseen, and for being seen by nobody."
  },
  crowe_oilskin: {
    title: "A second keeper's oilskin",
    kind: "object",
    text: "An oilskin coat on the boathouse hook, a size smaller than Wren's and never reclaimed. In the pocket: a heavy brass key stamped '2'. The left cuff is black with ground-in lampblack, though the coat was washed and hung up to dry — six years ago, by the dust on its shoulders."
  },
  tide_gauge: {
    title: "Tide-gauge board",
    kind: "object",
    text: "The cove tide-gauge board, its readings chalked by whoever worked the boats. Three autumn nights are circled in chalk — 28 Oct, 2 Nov, 6 Nov — each marked 'HW 23:1x' and a cross. The chalk marks are a working man's calendar, not a keeper's."
  },
  landing_chart: {
    title: "Chart of the cove, marked by hand",
    kind: "document",
    text: "A chart of the cove pinned inside the boathouse, the landing channel inked in by hand over the printed soundings. In the margin, in pencil: 'HW + 30. No light, no landing.' Three autumn dates are ticked, one beneath another."
  },

  // ---- Lamp Room (tower top) ----
  wick_sample: {
    title: "The death-night wick, in its tin",
    kind: "object",
    text: "In the lamp room desk, a tobacco tin labelled in Wren's hand: 'Wick as found, 10 Nov — keep.' Inside is the lamp wick taken out the morning after his death and never examined by the inquiry. Something about it made Wren's replacement keep it. It needs the lab.",
    analysis: {
      prompt: "Raise the magnification along the wick until the burn band resolves.",
      target: 0.45,
      tolerance: 0.07,
      revealed:
        "Two things. A pale band of half-burned carbon runs around the wick — the lamp burned starved and out for roughly half an hour, then was re-lit. And the fresh trim is cut sloping down to the left. Every trim Thomas Wren ever cut slopes down to the right."
    }
  },
  lampblack_print: {
    title: "Mark under the pedestal handle",
    kind: "object",
    text: "On the underside of the lamp pedestal's lifting handle, where no visitor would ever look, there is a dark smudge in the shape of fingers, pressed into lampblack. It needs the lab.",
    analysis: {
      prompt: "Dust and lift the print until the ridge pattern stands clear.",
      target: 0.68,
      tolerance: 0.07,
      revealed:
        "A left hand, broad across the palm, pressed hard as if hauling on the handle in the dark. The ring finger of the print ends at the first joint — whoever left it is missing the tip of his left ring finger."
    }
  },
  watch_slip: {
    title: "Lamp-room watch slip, 9 November",
    kind: "document",
    text: "The duty slip kept in the lamp room desk. First line, in Wren's upright hand: '21:00 — lamp lit, watch begun. T.W.' Below it, in a cramped, left-leaning hand that is not his: '23:05 — attended.' No name, only a scrawl of initials, timed inside the dark half-hour."
  },
  wick_tin: {
    title: "Tin of Wren's spare wicks",
    kind: "object",
    text: "Wren's tin of spare wicks, each one trimmed ready by his own hand over the years. Every single trim slopes down to the right — the habit of a right-handed man who cut thousands. Not one slopes the other way."
  },
  stair_boss: {
    title: "Newel boss at the stair head",
    kind: "object",
    text: "The iron newel boss where the tower stairs turn into the lamp room. On its outer edge, at head height, is a dark stain worked into the metal's pitting, with a few grey hairs still caught in the rust. It needs the lab.",
    analysis: {
      prompt: "Sweep the reagent across the stain until the test colour develops.",
      target: 0.8,
      tolerance: 0.07,
      revealed:
        "The stain is blood, and the hairs are grey, and both sit on the OUTER edge of the newel at head height. A man slipping on the turn falls down the middle of the flight. A man driven backwards against the newel strikes exactly here."
    }
  },
  brass_button: {
    title: "Brass button on the lamp-room floor",
    kind: "object",
    text: "A heavy brass button in the grit beside the lamp pedestal, stamped with the lighthouse Board's crest. Its shank is bent and torn, and threads of dark serge are still knotted in it — the button was ripped off a uniform coat, not unpicked."
  },
  foreign_lantern: {
    title: "Shuttered lantern on the railing",
    kind: "object",
    text: "A shuttered signal lantern hangs on the lamp-room railing, where it has hung unclaimed for six years. It is not station issue: its base is stamped with a Cadiz chandler's mark — the same mark as the crates in the boathouse."
  }
};
