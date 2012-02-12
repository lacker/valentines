// Don't read this, you cheater!
var ANSWERS = [
  "Annamay, you rule.",
  "You are totally great in every way.",
];

// An Answer provides at a given time:
//
// nextWord: what the next word to find is. all caps.
// fragment: the fragment to display.
//
// The nextWord is always at the start of remaining.
var Answer = function(level) {
  this.level = level;
  var index = (level - 1) % ANSWERS.length;
  this.remaining = ANSWERS[index];
  this.fragment = "" + level + ". ";
  this.chompLittleBits();
};

Answer.prototype = {
  toString: function() {
    return "fragment: " + this.fragment + " :: nextWord: " + this.nextWord;
  },

  done: function() {
    return this.remaining.length == 0;
  },

  // Move things too small to find and punctuation off remaining.
  // Also sets nextWord as a side effect, unless we are done.
  chompLittleBits: function() {
    while (!this.done()) {
      var match = this.remaining.match(/^[a-zA-Z]{3,}/);
      if (match == null) {
        // Move a letter from remaining to fragment
        this.fragment += this.remaining[0];
        this.remaining = this.remaining.substring(1);
      } else {
        this.nextWord = match[0].toUpperCase();
        break;
      }
    }
  },

  // Moves nextWord off remaining.
  // Sets nextWord to null as a side effect.
  chompWord: function() {
    this.fragment += this.remaining.substring(0, this.nextWord.length);
    this.remaining = this.remaining.substring(this.nextWord.length);
    this.nextWord = null;
  },

  // Call this when someone finds a word.
  // Chainable FWIW.
  next: function() {
    this.chompWord();
    this.chompLittleBits();
    return this;
  },
};