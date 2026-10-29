const scenes = require("./scenes");
const clues = require("./clues");
const { suspects, testimonies } = require("./suspects");
const story = require("./story");

module.exports = {
  id: story.meta.id,
  meta: story.meta,
  speakers: story.speakers,
  scenes,
  clues,
  suspects,
  testimonies,
  conclusions: story.conclusions,
  links: story.links,
  chapters: story.chapters,
  accusation: story.accusation,
  epilogue: story.epilogue
};
