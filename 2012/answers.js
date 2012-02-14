// Don't read this, you cheater!
var ANSWERS = [
  "Anna, you are the best part of my life.",
  "I love you more with every passing day.",
  "I hope you enjoy this puzzle-poem!",
  "Meeting you was the luckiest I have ever been.",
  "When i was young, I knew nothing.",
  "I did not know such an awesome lady existed.",
  "Now that I am with you, I am always happy.",
  "I relax extra even when I am sleeping.",
  "Even in my dreams, I know you are next to me.",
  "Anything that happens, I know you will help me.",
  "Whenever I am sad, I know you will cheer me up.",
  "You do so many great things, it is easy to forget.",

  "It is easy to lose track of the simple things.",
  "Like how fantastically beautiful you are.",
  "Your shape is like a curve with a formula.",
  "Like long ago someone proved you were perfect",
  "And only recently have you been achieved in practice.",
  "When you smile it is like my eyes are broken",
  "And they are unable to focus on other things",
  "As if the not-anna part of my head has some problem.",
  "Even when you are not right next to me",
  "I can tell when a small sound is an anna sound",
  "When you are away for just a little while",
  "I forget why i care about anything else.",

  "This puzzle is really just a trick",
  "To make you think extra about how great you are.",
  "It is a shame that you cannot see inside my head",
  "To see how happy you really make me",
  "Expressed in thought-stuff instead of awkward words.",
  "Remember, whenever I squeeze your hand",
  "I am thinking all of these love thoughts",
  "And trying to express it all with a touch.",
  "To me you will always represent the best that can be.",
  "Also i know you are quite smart",
  "Because you have gotten all this way.",
  "Congratulations and happy Valentine's day! THE END",
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