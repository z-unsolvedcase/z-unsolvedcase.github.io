// Suspects, interview topics, contradictions and testimony cards for Case 1.
// Topics can be gated by shared clue/card ids, pressure (0-100) and trust (0-100).
// pressure rises when you catch lies; trust rises when you are gentle.

const testimonies = {
  s_clara_alibi: {
    title: "Clara: 'I took the 22:45 bus'",
    speaker: "clara",
    text: "Clara says she locked up, caught the number 14 bus at quarter to eleven, and was home by quarter past."
  },
  s_clara_no_call: {
    title: "Clara: 'I never spoke to her that day'",
    speaker: "clara",
    text: "Clara says she did not phone or speak to Elena on the day she vanished, apart from saying goodnight at closing."
  },
  s_clara_key: {
    title: "Clara: 'My key is seven'",
    speaker: "clara",
    text: "Clara says her personal authorization key is number 07."
  },
  s_clara_call_admitted: {
    title: "Clara admits she phoned Elena",
    speaker: "clara",
    text: "Pressed with the tape, Clara admits she called Elena that evening. She says it was only about 'the office books'."
  },
  s_clara_confession: {
    title: "Clara's confession",
    speaker: "clara",
    text: "Clara breaks down: she followed Elena aboard, they argued on the aft deck, Elena hit the hatch and went over the side. She panicked and covered it up."
  },
  s_rook_alibi: {
    title: "Rook: 'home alone with the ledgers'",
    speaker: "rook",
    text: "Rook says he was at home alone that night. Nobody can confirm it."
  },
  s_ibarra_alibi: {
    title: "Ibarra: 'at the clinic until after midnight'",
    speaker: "ibarra",
    text: "Dr. Ibarra says he was stitching a dockworker's hand at the harbor clinic until nearly one."
  },
  s_ibarra_trusted: {
    title: "Ibarra: 'someone she trusted with her life'",
    speaker: "ibarra",
    text: "Dr. Ibarra says Elena told him she had found something wrong at work, and that it involved someone she trusted with her life."
  },
  s_hale_drunk: {
    title: "Hale admits he had been drinking",
    speaker: "hale",
    text: "Captain Hale admits he had been drinking on the bridge and wrote his log up the next morning. He did not see the decks that night."
  },
  s_nina_asleep: {
    title: "Nina: 'I was asleep all shift'",
    speaker: "nina",
    text: "Nina Kell says she was asleep in the crew quarters the whole night."
  },
  s_nina_admitted: {
    title: "Nina admits she was on deck watch",
    speaker: "nina",
    text: "Shown the roster, Nina admits she was the deck watch that night and dozed in the crew locker. She had lied to avoid being fired."
  },
  s_nina_saw: {
    title: "Nina saw Clara leave the aft deck",
    speaker: "nina",
    text: "Nina woke to women's voices on the aft deck around 23:20: Elena crying, and another woman. At twenty to midnight Clara Dunne, in her green cardigan, walked past the locker and told her: 'Not a word, you were never on watch.'"
  }
};

const suspects = [
  {
    id: "clara",
    name: "Clara Dunne",
    age: 41,
    role: "Ticket clerk. Elena's best friend.",
    color: "#c9a56a",
    unlockedAt: 1,
    bio: "Warm, chatty, helpful. She still works the ticket window and has never changed jobs. She was the first person to tell police that Elena 'seemed low'.",
    intro: "Elena was my best friend. Ten years, and I still set out two cups some mornings. Ask me anything, Detective. I want to help.",
    defaultPresent: "I don't know what that is, Detective. Is it important?",
    topics: [
      {
        id: "t_theory",
        label: "What do you think happened to her?",
        answer: "That poor girl was in a dark place. And Mr. Rook was so hard on her, you know. Or the doctor, they fought that week. I don't want to say anything, but somebody should look at them."
      },
      {
        id: "t_last_seen",
        label: "When did you last see Elena?",
        answer: "At closing. Half past ten, near enough. She said goodnight and she looked exhausted. That's the last I saw of her. I still think about it."
      },
      {
        id: "t_alibi",
        label: "Where were you that night?",
        answer: "Home by quarter past eleven. I caught the number fourteen bus at quarter to. I told the police all this ten years ago, it's all in the file.",
        gives: "s_clara_alibi"
      },
      {
        id: "t_call",
        label: "Did you speak to Elena that day?",
        answer: "Only at the office, in passing. I didn't phone her, no. Why would I? We saw each other every day.",
        gives: "s_clara_no_call"
      },
      {
        id: "t_voids",
        label: "Tell me about voided tickets.",
        requires: { clues: ["void_log"] },
        answer: "Voids happen all the time. Wrong destination, change of mind. Every clerk uses their own key, that's policy. If the numbers look odd, that's a question for the accounts office, which was Elena."
      },
      {
        id: "t_key",
        label: "Which authorization key is yours?",
        requires: { clues: ["void_log"] },
        answer: "Seven. Everyone knows that, it's on the wall in the key register. Why, is there a problem with it?",
        gives: "s_clara_key"
      },
      {
        id: "t_confess",
        label: "Tell me what really happened on the ferry.",
        requires: { minPressure: 75 },
        answer: "She wouldn't listen! She said she was going to the police on Friday, after ten years of me looking after her. We argued on the aft deck. She turned, she hit the hatch, and then she was gone over the side. I panicked. I took her coat and I put it on the pier in the morning. God forgive me, I've kept her cup clean for ten years.",
        gives: "s_clara_confession"
      }
    ],
    present: [
      {
        card: "answering_machine",
        pressure: 20,
        gives: "s_clara_call_admitted",
        reply: "Alright. I rang her. She'd seemed off all week and I wanted to help. We talked about the office books, nothing more. I didn't think it mattered, so I didn't mention it."
      },
      {
        card: "bus_timetable",
        pressure: 20,
        reply: "Ten years, Detective. Maybe it was a later bus. They were always changing the times. I get confused."
      },
      {
        card: "ticket_ledger",
        pressure: 25,
        reply: "A void is a void. I couldn't tell you about one ticket from ten years ago. I really couldn't."
      },
      {
        card: "void_log",
        pressure: 10,
        reply: "That's policy. Everyone uses their own key. If the sums look odd you'd have to ask the accounts office, and that was Elena."
      },
      {
        card: "cash_drawer",
        pressure: 10,
        reply: "Banking was Elena's job, not mine. I just sold tickets."
      },
      {
        card: "staff_photo",
        trust: 15,
        reply: "Oh. That was her birthday. Look at the two of us. She'd just bought that scarf, she wouldn't take it off for a month."
      },
      {
        card: "c_clara_boarded",
        pressure: 25,
        reply: "That proves nothing. Anyone could have used my key. It was hanging up in the office."
      },
      {
        card: "s_nina_saw",
        pressure: 30,
        reply: "Nina? She was a child, half asleep on a boat in the dark. She'd say anything now to feel important."
      }
    ]
  },
  {
    id: "rook",
    name: "Martin Rook",
    age: 56,
    role: "Owner of Haverport Ferries.",
    color: "#7aa0c4",
    unlockedAt: 1,
    bio: "Gruff, proud, always counting costs. He built the company from one boat and hates being questioned.",
    intro: "I built this company from one rusty boat. Elena was good with numbers. Too good, some would say. Ask your questions, I have a business to run.",
    defaultPresent: "Never seen it. Is that all you have?",
    topics: [
      {
        id: "t_alibi",
        label: "Where were you that night?",
        answer: "At home with a whisky and the ledgers. My wife was away. No, nobody saw me. Do you want me to apologize for being alone?",
        gives: "s_rook_alibi"
      },
      {
        id: "t_elena",
        label: "How did you get on with Elena?",
        answer: "We fought about money. She wanted more spent on safety. Lifeboats, certificates, all that. I said the company would sink before the lifeboats did."
      },
      {
        id: "t_clara",
        label: "What is Clara Dunne like?",
        answer: "Reliable. Loyal. The one person here who never complains about anything. I wish I had ten of her."
      },
      {
        id: "t_inspector",
        label: "Tell me about Inspector Pell.",
        requires: { clues: ["inspector_record"] },
        answer: "Pell? A friend of the company. We took him fishing a few times. If you're asking whether I overpaid a friend, say so plainly."
      }
    ],
    present: [
      {
        card: "rook_note",
        pressure: 30,
        reply: "All right. Yes. I paid Pell to pass the lifeboat paperwork early. We were two weeks from losing the contract. Nobody died, and Elena never found out. Never. I swear it on my boat."
      },
      {
        card: "inspector_record",
        pressure: 15,
        reply: "That man retired well. That's all I'll say without a lawyer."
      },
      {
        card: "void_log",
        reply: "Voids? Clara handles those. I don't read void logs, Detective, I read bottom lines. Whatever that means, it's news to me."
      },
      {
        card: "c_rook_bribe",
        reply: "So you know. Then you know I'd have no reason to hurt her. She never found out about the lifeboats."
      }
    ]
  },
  {
    id: "ibarra",
    name: "Dr. Samuel Ibarra",
    age: 38,
    role: "Harbor doctor. Elena's former fiance.",
    color: "#86b59a",
    unlockedAt: 2,
    bio: "Soft-spoken and tired. He left the harbor clinic ten years ago and came back to answer your questions.",
    intro: "We were engaged. Were. I'm not proud of how that last week went, and I'd rather you heard it from me than from the file.",
    defaultPresent: "No. I don't recognize that. I'm sorry.",
    topics: [
      {
        id: "t_argument",
        label: "Tell me about your argument.",
        answer: "It was the Wednesday. I said things I regret. She was hiding something and wouldn't tell me what. She gave me back the ring."
      },
      {
        id: "t_alibi",
        label: "Where were you the night she vanished?",
        answer: "At the clinic. A dockworker's hand, torn open on a winch. It took me until nearly one. Ask the nurse, she signed every page.",
        gives: "s_ibarra_alibi"
      },
      {
        id: "t_fear",
        label: "Was Elena afraid of anyone?",
        requires: { clues: ["notepad_impression"] },
        answer: "She said she'd found something wrong at work. She wouldn't tell me what, not even me. She said it was someone she trusted with her life, and that was the worst part.",
        gives: "s_ibarra_trusted"
      }
    ],
    present: [
      {
        card: "ibarra_letter",
        pressure: 10,
        reply: "I wrote that after we split. It's a goodbye, not a threat. I hoped she'd tell someone who could help her."
      },
      {
        card: "clinic_log",
        reply: "That's the night. The nurse and the dockworker will both tell you the same. I was stitching, not sinking anyone."
      },
      {
        card: "desk_calendar",
        reply: "Police. She never told me she was going to the police. What did she think I would do, argue?"
      }
    ]
  },
  {
    id: "hale",
    name: "Captain Viktor Hale",
    age: 58,
    role: "Master of the MV Kestrel.",
    color: "#b98f7a",
    unlockedAt: 3,
    bio: "Thirty years on the same ferry. Weathered, formal, and a little too careful with his words.",
    intro: "Thirty years on the Kestrel. The water was calm that night. I'd be glad to help, but there is nothing to find on my ship.",
    defaultPresent: "That means nothing to me, Detective.",
    topics: [
      {
        id: "t_alibi",
        label: "Where were you that night?",
        answer: "On the bridge, start to finish. The log will tell you so."
      },
      {
        id: "t_passengers",
        label: "Who was aboard that night?",
        answer: "Seven or eight. The usual last-ferry drifters. Elena rode on Thursdays sometimes, but I never saw her that night. I was in the wheelhouse, and the wheelhouse faces forward."
      },
      {
        id: "t_crew",
        label: "Who else was on duty?",
        answer: "Nina Kell, deck watch. Young and quiet. She'd have been at the gangway or the aft rail. Ask her, if she'll talk."
      }
    ],
    present: [
      {
        card: "bridge_logbook",
        pressure: 25,
        gives: "s_hale_drunk",
        reply: "I wrote that up the next morning. My hands were unsteady. I'd had a drop, all right? Don't put that in a report. I saw nothing but the water ahead."
      },
      {
        card: "bottle_locker",
        pressure: 20,
        reply: "Those are mine. I'm not proud of them. They're not evidence of anything except a lonely man."
      },
      {
        card: "crew_roster",
        reply: "That's right. Kell had the deck watch. She was nineteen and I trusted her to do it."
      }
    ]
  },
  {
    id: "nina",
    name: "Nina Kell",
    age: 29,
    role: "Deckhand on the Kestrel, then 19.",
    color: "#d19aa5",
    unlockedAt: 4,
    bio: "Quiet, wary, and used to being overlooked. She was the youngest crew member on the ferry that night.",
    intro: "I was nineteen. My first real job. I really don't like talking about that night.",
    defaultPresent: "I don't know anything about that.",
    topics: [
      {
        id: "t_alibi",
        label: "Where were you that night?",
        answer: "Asleep in the crew quarters. The whole shift. I told the police that.",
        gives: "s_nina_asleep"
      },
      {
        id: "t_reassure",
        label: "Nobody is going to blame you for anything now.",
        trust: 35,
        answer: "That's... kind. It was ten years ago. I keep waiting for someone to say it's all right."
      },
      {
        id: "t_saw",
        label: "What did you see on the aft deck?",
        requires: { cards: ["s_nina_admitted"], minTrust: 50 },
        answer: "I woke about twenty past eleven to voices on the aft deck. Two women. One was Elena, crying. I didn't look. At twenty to midnight Clara walked past the locker in her green cardigan, fast, and said: not a word, Nina, you were never on watch. I believed her.",
        gives: "s_nina_saw"
      }
    ],
    present: [
      {
        card: "crew_roster",
        pressure: 15,
        trust: 10,
        gives: "s_nina_admitted",
        reply: "...All right. I was the deck watch. I dozed in the locker, and I said I was asleep in quarters because I'd have been fired. That's the truth."
      },
      {
        card: "crew_locker",
        trust: 20,
        reply: "That's mine. I used to nap there on slow watches. I was nineteen and the nights were so long."
      },
      {
        card: "gangway_counter",
        reply: "Seven. That sounds right. There was one more than the tickets, I remember thinking that and then forgetting it."
      }
    ]
  }
];

module.exports = { suspects, testimonies };
