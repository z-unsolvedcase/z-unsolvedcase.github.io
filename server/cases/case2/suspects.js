// Suspects, interview topics, contradictions and testimony cards for Case 2.
// Topics can be gated by shared clue/card ids, pressure (0-100) and trust (0-100).
// pressure rises when you catch lies; trust rises when you are gentle.

const testimonies = {
  s_crowe_alibi: {
    title: "Crowe: 'I never went up after nine'",
    speaker: "crowe",
    text: "Silas Crowe says he handed over at nine, heard a squall strike the cottage roof at five past eleven, and never climbed the tower that night. Thomas must have slipped seeing to the lamp in the squall."
  },
  s_crowe_key_denial: {
    title: "Crowe: 'Key two never left its board'",
    speaker: "crowe",
    text: "Crowe says lamp-room key No. 2 stayed on its board all night on 9 November, and that nobody used it. He would swear it in any court."
  },
  s_crowe_confession: {
    title: "Crowe's confession",
    speaker: "crowe",
    text: "Crowe breaks: forty pounds a night to darken the lamp while the boats ran the cove. On 9 November Wren was waiting in the lamp room. They grappled at the stair head in the dark, Wren went down the flight, and Crowe re-lit the lamp, copied the log fair, and set a cove bottle in the dead man's hand."
  },
  s_ada_last_message: {
    title: "Ada: Wren's last message",
    speaker: "ada",
    text: "At 22:47 on 9 November Thomas Wren telephoned the wireless room: 'Keep your set on tonight, Ada. Whatever you hear, write it in the rough book. Not the fair one. The rough one.'"
  },
  s_ada_omission: {
    title: "Ada admits the struck entry",
    speaker: "ada",
    text: "Ada admits the 'ALL DARK' entry was struck from the fair transcript on Inspector Vale's written instruction, 'for the Board's good name'. She kept her rough book. She has kept it, and her silence, for six years."
  },
  s_ada_signal: {
    title: "Ada: 'All dark, coming in'",
    speaker: "ada",
    text: "Ada heard the unknown station plain, three times: 28 October, 2 November, and at 23:24 on 9 November — 'ALL DARK COMING IN', bearing the cove, sent slow, as if the sender's other hand was busy."
  },
  s_margaret_bottle: {
    title: "Margaret: 'He hadn't touched it in two years'",
    speaker: "margaret",
    text: "Margaret says Thomas had not touched spirits for two years before his death, on the doctor's order, and that the bottle in his hand was no bottle of theirs. She said so at the time. Nobody wrote it down."
  },
  s_margaret_warning: {
    title: "Margaret: 'A hand, not the weather'",
    speaker: "margaret",
    text: "The week he died, Thomas told her: 'If the light fails, Margaret, it is a hand, not the weather. Remember that I said that.' She has remembered it every night since."
  },
  s_tarn_denial: {
    title: "Tarn: 'Abed by ten'",
    speaker: "tarn",
    text: "Jacob Tarn says he was abed by ten on 9 November, same as always, and saw nothing of the cove, the boats, or the light."
  },
  s_tarn_fishing: {
    title: "Tarn admits the dark fishing",
    speaker: "tarn",
    text: "Tarn admits it: his small-mesh nets fish best unlit, so he worked the cove on the dark nights — he chose them because the lamp was out, and the lamp being out was 'convenient'. He never asked why it was out."
  },
  s_tarn_saw: {
    title: "Tarn saw the light die — and a man come down",
    speaker: "tarn",
    text: "From his boat on 9 November Tarn watched the lamp go dark, saw a shuttered light wink twice from the tower gallery, and near midnight saw the lamp re-lit — and a man come down the tower path to the boathouse afterwards, walking like a man carrying something heavy in one hand."
  },
  s_vale_admits: {
    title: "Vale admits the whitewash",
    speaker: "vale",
    text: "Ambrose Vale admits it all: he never climbed the tower, he took the relief keeper's statement exactly as written, he ordered the wireless entry struck, and he signed the accident verdict in two days — the Board was facing amalgamation, and a scandal at Blackrock would have ended it."
  }
};

const suspects = [
  {
    id: "crowe",
    name: "Silas Crowe",
    age: 47,
    role: "Relief keeper at Blackrock Head.",
    color: "#b08a5a",
    unlockedAt: 1,
    bio: "Thomas Wren's relief for nine years, and his friend. A navy man once; he lost the tip of his left ring finger to a winch at sea, and does fine, careful work with that hand anyway. He still keeps the light.",
    intro: "Nine years I relieved Thomas, and I'd have relieved him nine more. Best keeper on this coast. Ask what you like, Detective — I've nothing to be ashamed of at this station.",
    defaultPresent: "That's station business. I couldn't say what it means.",
    topics: [
      {
        id: "t_duties",
        label: "How did you and Wren divide the watches?",
        answer: "Thomas took first watch to midnight, I took the dark hours after, most nights. We spelled each other fair. He was particular about the lamp — a man could set his life by Thomas and that light."
      },
      {
        id: "t_alibi",
        label: "Where were you the night Wren died?",
        answer: "I handed over at nine and went down to my bed in the cottage annex. There was a squall at five past eleven — I heard it hit the roof — and I thought no more of it till morning. I never went up the tower that night. Never.",
        gives: "s_crowe_alibi"
      },
      {
        id: "t_key",
        label: "Who used lamp-room key No. 2 that night?",
        requires: { clues: ["key_board"] },
        answer: "Nobody. Key two hung on its board all night, same as every night Thomas had the watch. I'd swear it in any court you name.",
        gives: "s_crowe_key_denial"
      },
      {
        id: "t_money",
        label: "Were you ever paid by the cove boats?",
        requires: { clues: ["cash_tin"] },
        answer: "Paid? I'm a keeper, Detective, not a ferryman. Whatever's in the boathouse is the fishermen's business. You'll not hang the cove on me."
      },
      {
        id: "t_confess",
        label: "Tell me what really happened in the lamp room.",
        requires: { minPressure: 75 },
        answer: "Forty pounds a night. That's all it was — darken her for half an hour, let the boats run, light her again. Nobody was ever to be hurt. But that night Thomas was WAITING in the lamp room, in the dark he'd made me ashamed of. We grappled at the stair head. He went down the flight and he didn't get up. I re-lit the lamp. I copied the log fair. I put the bottle in his hand. God forgive me — I put the bottle in my friend's dead hand.",
        gives: "s_crowe_confession"
      }
    ],
    present: [
      {
        card: "official_log",
        pressure: 10,
        reply: "That's my marginal note, yes. A keeper notes the weather. There's nothing in that but duty."
      },
      {
        card: "barograph_trace",
        pressure: 20,
        reply: "Barographs stick. Ink dries. I heard that squall with my own ears, whatever your drum says."
      },
      {
        card: "key_board",
        pressure: 10,
        reply: "Chipped paint. Six years of keepers taking keys down will chip any paint on this rock."
      },
      {
        card: "cash_tin",
        pressure: 20,
        reply: "That's Tarn's tin, in Tarn's boathouse. Ask the fisherman about his own money."
      },
      {
        card: "watch_slip",
        pressure: 15,
        reply: "Any keeper might have written that slip. We all write alike in the dark, half asleep."
      },
      {
        card: "wick_sample",
        pressure: 20,
        reply: "A wick's a wick. Thomas trimmed half the wicks on this station himself, whatever your glass says."
      },
      {
        card: "lampblack_print",
        pressure: 20,
        reply: "Half the keepers on this coast have a finger short somewhere. The sea takes its tithe. It proves nothing."
      },
      {
        card: "crowe_oilskin",
        pressure: 25,
        reply: "That coat's been passed around every relief since before the war. The key... the key could have been in that pocket a year."
      },
      {
        card: "foreign_lantern",
        pressure: 15,
        reply: "Fishermen's lanterns wash up all over this station. You'll find their gear in every shed on the headland."
      },
      {
        card: "c_crowe_in_lamp_room",
        pressure: 25,
        reply: "That's paper. Paper and talk. You weren't up that tower, Detective. Neither — neither was I."
      },
      {
        card: "s_tarn_saw",
        pressure: 30,
        reply: "Tarn? A poacher with a grudge and a boat full of illegal nets, and you'd take his word over a keeper's?"
      }
    ]
  },
  {
    id: "ada",
    name: "Ada Rennick",
    age: 29,
    role: "Wireless operator, Blackrock signal room.",
    color: "#7fb0c9",
    unlockedAt: 1,
    bio: "The station's wireless operator since she was twenty-three. Precise, literal, and frightened of doing the wrong thing — she keeps everything twice: the fair book for the Board, and her rough book for herself.",
    intro: "I keep the wireless log. Kept it. Everything I heard, I wrote down — in the rough book, at least. What is it you want to know?",
    defaultPresent: "That isn't a signal matter. I wouldn't know about that.",
    topics: [
      {
        id: "t_shift",
        label: "What did your work involve?",
        answer: "Weather traffic, shipping forecasts, the Board's bulletins. And listening. A wireless room is mostly listening, Detective. You hear things that were never meant for you."
      },
      {
        id: "t_log",
        label: "Tell me about the night of 9 November.",
        requires: { clues: ["wireless_log"] },
        answer: "At twenty to eleven Thomas telephoned down himself. He said: keep your set on tonight, Ada. Whatever you hear, write it in the rough book. Not the fair one. The rough one. I did as I was told. I've wondered for six years if he knew.",
        gives: "s_ada_last_message"
      },
      {
        id: "t_reassure",
        label: "Nobody is looking to blame the wireless room.",
        trust: 35,
        answer: "That's... more than anyone said at the time. At the time it was all 'the Board's good name'. I was twenty-three and I did as I was instructed."
      },
      {
        id: "t_omission",
        label: "Why is the 'ALL DARK' entry missing from the fair transcript?",
        requires: { clues: ["wireless_log"], minTrust: 30 },
        answer: "Because Inspector Vale instructed it struck, in writing, 'for the Board's good name'. I struck it from the fair book. I did not strike it from my rough one. I couldn't. Thomas told me to write what I heard, and I heard it.",
        gives: "s_ada_omission"
      },
      {
        id: "t_signal",
        label: "What exactly did the unknown station send?",
        requires: { cards: ["s_ada_omission"] },
        answer: "Five words, plain language, no call sign: ALL DARK COMING IN. Three times — 28 October, 2 November, and at twenty-four minutes past eleven on the night Thomas died. Sent slow. As if the sender's other hand was busy with something heavy.",
        gives: "s_ada_signal"
      }
    ],
    present: [
      {
        card: "wireless_log",
        trust: 10,
        reply: "That's my rough book. I'd know my own hand anywhere. You've read what the fair book doesn't say, then."
      },
      {
        card: "private_log",
        trust: 10,
        reply: "His own book. He wrote the dark times too, then. It wasn't only me who noticed, all those years."
      },
      {
        card: "radio_notes",
        reply: "Thomas listened as well. Of course he did. He'd have heard that carrier the same as me."
      },
      {
        card: "s_vale_admits",
        pressure: 15,
        reply: "He admits it now. Six years, and it takes a detective to make the Board say out loud what it wrote to me in pencil."
      }
    ]
  },
  {
    id: "margaret",
    name: "Margaret Wren",
    age: 50,
    role: "Thomas Wren's widow. Keeper's wife of twenty years.",
    color: "#c98a7a",
    unlockedAt: 2,
    bio: "She kept the cottage, the garden, and the station's respectability for twenty years. She told the inquiry her husband did not drink. It is not in the file. She has not forgiven the file for that.",
    intro: "They wrote 'drunken fall' about a man who hadn't touched a drop in two years, and they wrote it in two days. Now you come, six years on. Well. Better late, Detective. Better late.",
    defaultPresent: "That's station property. Thomas would have known. I kept house, not lamps.",
    topics: [
      {
        id: "t_last_day",
        label: "Tell me about Thomas's last day.",
        answer: "Quiet. Too quiet, I know now. He checked his book twice at dinner. He kissed me at the door like it was any night of twenty years. I have gone over it ten thousand times and there is nothing else in it, Detective. Nothing."
      },
      {
        id: "t_drink",
        label: "Did Thomas drink?",
        answer: "Not after the doctor's card. Two years clean, and proud of it, though he'd never say proud. That bottle in his hand — I told them at the inquiry it was no bottle of ours. They smiled, and they wrote 'intoxicated' anyway.",
        gives: "s_margaret_bottle"
      },
      {
        id: "t_warning",
        label: "Did Thomas tell you what he suspected?",
        requires: { clues: ["diary_entry"] },
        answer: "He said it the week he died, standing where you're standing: 'If the light fails, Margaret, it is a hand, not the weather. Remember that I said that.' I thought he was tired and fanciful. I have remembered it every night for six years.",
        gives: "s_margaret_warning"
      }
    ],
    present: [
      {
        card: "unsent_letter",
        trust: 15,
        reply: "His hand. He wrote to them fair and plain and they never even had to refuse him — he died before he could send it. Read it again, Detective. 'A keeper's key.' He knew."
      },
      {
        card: "private_log",
        trust: 20,
        reply: "His book. Oh, Thomas. He wrote it all down and trusted the writing to outlive him. It has. It has."
      },
      {
        card: "whisky_bottle",
        pressure: 10,
        reply: "There's his Christmas bottle, sealed as the day it came. And the inquiry's bottle was half gone. I ask you: whose bottle was in my husband's hand?"
      },
      {
        card: "doctor_card",
        trust: 10,
        reply: "Dr. Ellison's card. I kept it in his desk where he'd see it. He obeyed it to the letter, and they called him a drunkard over his grave."
      }
    ]
  },
  {
    id: "tarn",
    name: "Jacob Tarn",
    age: 38,
    role: "Cove fisherman and station supply man.",
    color: "#86b59a",
    unlockedAt: 3,
    bio: "He rows the station's supplies out and the cove's fish in, in all weathers. Everyone on the headland knows his nets are not the legal mesh. Nobody has ever proved it — because he only fishes them on the darkest nights.",
    intro: "I carry this station's oil and bread, and I fish my own water. If this is about the night the keeper died, I was abed by ten. That's my answer before you've asked the question.",
    defaultPresent: "Never seen it. And I've seen most things that wash up here.",
    topics: [
      {
        id: "t_alibi",
        label: "Where were you on 9 November?",
        answer: "Abed by ten, same as every night there's work at dawn. The cove can say what it likes; I was asleep.",
        gives: "s_tarn_denial"
      },
      {
        id: "t_reassure",
        label: "I'm investigating a death, not fishing licences.",
        trust: 30,
        answer: "That's... the first time anyone's said that to me in uniform. Men have lost boats over a mesh size, Detective. A man chooses his words careful."
      },
      {
        id: "t_saw",
        label: "What did you see from the water that night?",
        requires: { cards: ["s_tarn_fishing"], minTrust: 25 },
        answer: "All right. I was on the water, working my nets, when the light went out over me — and I saw a shuttered light wink twice from the gallery, like a signal answering. Near midnight the lamp lit again, and a man came down the tower path to the boathouse, walking heavy, one-handed, like he carried something. I told no one. A poacher doesn't volunteer for inquiries.",
        gives: "s_tarn_saw"
      }
    ],
    present: [
      {
        card: "boathouse_net",
        pressure: 15,
        trust: 10,
        gives: "s_tarn_fishing",
        reply: "...That's my net. Fine mesh, tarred, and the lantern's mine too. I fish the dark nights because the fish run and the lamp's out — 'convenient', I called it. I never asked why the lamp was out. A man doesn't ask questions that would stop his convenience."
      },
      {
        card: "contraband_cache",
        pressure: 20,
        reply: "Now that — that is NOT mine. Cadiz spirits under my boat? I carry crates ashore for a wage sometimes, no questions. But I never hid them, and I never touched that lamp."
      },
      {
        card: "tide_gauge",
        reply: "My chalk marks. High water and a cross for a working night. Every fisherman on this coast keeps the same calendar, Detective."
      },
      {
        card: "landing_chart",
        reply: "The channel marks are old — pilots drew those before I was born. The dates though... those dates are the dark nights. Somebody worked this cove by them."
      }
    ]
  },
  {
    id: "vale",
    name: "Ambrose Vale",
    age: 61,
    role: "Inspector of the Lighthouse Board. Signed off Wren's death.",
    color: "#9a8ab0",
    unlockedAt: 4,
    bio: "Thirty years a Board man, and the amalgamation vote was to be his monument. He conducted the Wren inquiry in two days, from the chart room, without climbing the tower. He has brought his own copy of the file, annotated in pencil.",
    intro: "The Wren matter was examined and closed by the Board in accordance with procedure. I have brought my file. I trust this will not take long, Detective.",
    defaultPresent: "That was not within the inquiry's remit. We dealt with what was material.",
    topics: [
      {
        id: "t_inquiry",
        label: "How was the inquiry conducted?",
        answer: "Statements were taken, the scene was reviewed, and a verdict returned within the week. The keeper was found with spirits in his hand at the foot of the stairs. The Board does not care to linger over a man's failings, Detective. It is a kindness, of a kind."
      },
      {
        id: "t_report",
        label: "Why is there no record of the tower being inspected?",
        requires: { clues: ["inquiry_file"] },
        answer: "The lamp room was... in order. The relief keeper confirmed the lamp burned all night. There was no cause to climb. There was no cause."
      },
      {
        id: "t_admits",
        label: "Tell me what the inquiry actually did.",
        requires: { clues: ["inquiry_file"], minPressure: 40 },
        answer: "Very well. The truth, since you have clearly dug for it. I never climbed that tower. I took Crowe's statement exactly as he wrote it. I ordered the wireless entry struck — yes, my instruction, my pencil. The amalgamation vote was that winter, and a rotten station at Blackrock would have sunk the Board. I signed 'accident' in two days and I have signed nothing honestly since.",
        gives: "s_vale_admits"
      }
    ],
    present: [
      {
        card: "inquiry_file",
        pressure: 25,
        reply: "My own file. Yes. 'Working book mislaid.' I wrote that phrase myself. It has a sound, hasn't it? Phrases like that are how institutions bury men."
      },
      {
        card: "official_log",
        pressure: 20,
        reply: "A fair copy. Received as a fair copy. I did not ask why a dead man's log needed copying fair, because I did not want the answer in an election winter."
      },
      {
        card: "s_ada_omission",
        pressure: 25,
        reply: "Miss Rennick kept her rough book, then. I find I am almost glad. Strike that from your notes, Detective. Or don't. Perhaps don't."
      },
      {
        card: "barograph_trace",
        pressure: 15,
        reply: "Flat calm. Yes. The squall was Crowe's word, and I repeated it, and repetition became record. That is how these things are done, God help us."
      }
    ]
  }
];

module.exports = { suspects, testimonies };
