# Case 2 — "The Darkened Light" — design notes

A fully original case. Nothing is reused from Case 1 or from the rejected first
Case 2 draft except the game's data formats, the 5-chapter structure, the noir
lighting spirit, and the Blender helper functions. New world (Blackrock Head
Lighthouse), new victim, new suspects, new rooms modelled from scratch in
`tools/blender/build_case2_scenes.py`.

## The mystery

- **Victim:** Thomas Wren, 52, principal keeper of Blackrock Head Lighthouse.
  Found dead at the foot of the tower stairs six years ago; the Board's inquiry
  (Inspector Ambrose Vale) ruled it a drunken fall — a half-empty spirits bottle
  was in his hand.
- **Reopened by:** during this spring's decommissioning clearance, Wren's
  personal oilskin log pouch surfaced in the station store. His private logbook
  (the start clue, a lab-analysis clue) records nights when the lamp went dark
  for about half an hour — "not by my hand" — and its last entry, for the night
  he died, stops mid-sentence.
- **Culprit:** Silas Crowe, 47, relief keeper — Wren's relief of nine years and
  his friend. Missing the tip of his left ring finger (a winch injury at sea).
- **Motive:** `m_smuggling` — Crowe darkened the lamp on chosen high-tide
  nights so smuggling boats could land unseen at the cove below, £40 a night,
  tallied in a bait tin in the boathouse. Wren found out and meant to report it
  to the Board inspector on Tuesday.
- **Method:** `x_stairs` — on 9 November Wren waited in the lamp room. They
  grappled at the stair head in the dark half-hour; Wren struck the newel boss
  and fell the full flight. Crowe re-lit the lamp, copied the official log fair
  (inventing a squall the barograph disproves), and set a cove-run bottle in
  the dead man's hand.
- **Key proof:** `c_crowe_in_lamp_room` ("Crowe was in the lamp room that
  night"). Second proof: `c_crowe_paid`.

## Two independent chains to the key proof

Verified by link-closure checks (not just asserted): with **all testimonies
removed**, the proof is still reachable; likewise with the eyewitness removed,
and with the confession removed.

1. **Testimony-free paper/physical chain:**
   wick trim sloping the wrong way (`wick_sample` lab + `wick_tin`) and the
   left-hand lampblack print (`lampblack_print` lab) → `c_left_hand`;
   key board + relief roster key receipts → `c_second_key`;
   `c_left_hand` + `c_second_key` → `c_crowe_in_lamp_room`.
   Also direct: `lampblack_print` + `crowe_oilskin` (the key No. 2 in its
   pocket, its cuff black with lampblack) → key proof. Underneath: the private
   log vs official log and the oil ledger prove the dark nights with no witness
   at all.
2. **Testimonial chain:** Tarn's trust-gated eyewitness testimony
   (`s_tarn_saw`: lamp dark, a shuttered light winking from the gallery, a man
   coming down to the boathouse) links with `c_second_key` or `c_left_hand`;
   Crowe's pressure-75 confession (`s_crowe_confession`) links with
   `c_dark_nights`; and the lamp-room watch slip timed 23:05 in a left-leaning
   hand contradicts his sworn alibi (`s_crowe_alibi`) directly.

Red herrings with real secrets: Inspector Vale whitewashed the inquiry
(`c_vale_whitewash`) but never climbed the tower; fisherman Jacob Tarn was in
the cove on the dark nights for his illegal nets (`c_tarn_secret`); widow
Margaret concealed nothing but her pride — the inquiry ignored her statement
that Wren did not drink (`c_wren_sober`).

## Chapters

1. **The Pouch in the Store** — "Why did the light go out?" — goal:
   `c_dark_nights` — chart_room; Crowe, Ada.
2. **The Keeper's Cottage** — "What did Wren intend to do — and was he really
   drunk?" — goals: `c_wren_planned`, `c_wren_sober` — +cottage; +Margaret.
3. **The Cove Below** — "What came ashore on the dark nights, and who was
   paid?" — goals: `c_smuggling`, `c_crowe_paid` — +boathouse; +Tarn.
4. **The Lamp Room** — "Who was up the tower, and how did Wren fall?" — goals:
   `c_crowe_in_lamp_room`, `c_struggle_stairs` — +lamp_room; +Vale.
5. **Name the Culprit** — accusation only.

Each chapter has exactly 3 hints; chapter 5's third hint names the answer, as
in Case 1.

## The four new rooms (all new geometry, new palettes)

- **lamp_room** — circular tower-top room built from arc wall panels with glass
  upper sections: a stacked-cylinder Fresnel lens with an emissive warm core on
  a brass pedestal, a small logbook desk, oil cans, and a red iron railing ring.
  Cold blue night against warm lamp glow.
- **cottage** — the keeper's living room: a stone fireplace with mantel,
  armchair, kitchen table, wireless set on a wall shelf, coat hooks by the door,
  stove corner with kettle. Warm domestic browns and oranges.
- **boathouse** — weathered green-grey timber shed: an upturned rowboat hull on
  trestles, lobster pots, crates, rope coils, oars on the wall, a tide-gauge
  board, dim lantern light.
- **chart_room** — tower-base chart & signal room in deep green + brass: a big
  chart table with a map, a signal-flag locker of coloured flags, a telegraph
  desk, shelves of tide-table books, a barograph with a brass drum.

Every clue hotspot sits exactly on the object modelled at its position (the
Case 1 wall-calendar lesson). Hotspot debug markers appear in the preview
renders under `tools/blender/preview2/`, as with Case 1.

## Counts

28 clues (1 start + 27 placed; 4 lab-analysis clues: private logbook, the
death-night wick, the lampblack print, the stair-head newel) · 12 conclusions ·
42 board links · 5 suspects · 12 testimonies. Role split identical in shape to
Case 1: field 8, analyst 4, interrogator 5, archivist 7, open 3.

## Gaps

- **No recorded voices for Case 2.** Speakers use the Case 1 Kokoro palette
  (voss bm_george, narrator bf_emma, crowe bm_daniel, margaret af_nicole,
  ada af_sky, tarn am_michael, vale bm_lewis), but no mp3s exist for the new
  briefing/testimony lines — the client shows the text only. No audio files or
  hashes were invented.
- The client's entry-screen case picker label is hard-coded in client code
  (outside this task's file scope) and still shows the old draft's title there;
  the lobby and all in-game text use this case's real meta title.
