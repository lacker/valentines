console.log("loading wordsquare");

var CANVAS_SIZE = 720;

// Extra padding on each side of the canvas
var PADDING = 3;
var PAD_COLOR = "black";

// Cell colors
var SELECTED_COLOR = "#BBCCFF";
var DEFAULT_COLOR = "white";

// Number of cells to a row/column
var LEN = 6;

// Animation
var SCALE_PER_FRAME = 0.025;
var FPS = 40;

var CELL_SIZE = (CANVAS_SIZE - 2 * PADDING) / LEN;

var BACKGROUND = "#FFCCCC";

// Our alphabet does not have a Q.
var ALPHABET = ["A", "B", "C", "D", "E",
                "F", "G", "H", "I", "J",
                "K", "L", "M", "N", "O",
                "P", "R", "S", "T",
                "U", "V", "W", "X", "Y",
                "Z"];

var EASY_LETTERS = ["A", "B", "D", "E", "F", "G",
                    "I", "L", "M", "N", "O", "P",
                    "R", "S", "T", "U"];

var BEST_LETTERS = ["A", "E", "I", "N", "O", "S", "T"];

// Tiles that have been selected
var SELECTED = [];

// Game contains:
// answer - the Answer object for the game
// level - which level you're on
var GAME = {};

// A map from x,y to what letter we are targeting.
// Constructs the word in GAME.answer.nextWord
var TARGET = {};

function error(message) {
  alert(message);
  throw new Error(message);
}

function choice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomLetter() {
  if (Math.random() < 0.5) {
    return choice(BEST_LETTERS);
  }
  if (Math.random() < 0.5) {
    return choice(EASY_LETTERS);
  }
  return choice(ALPHABET);
}

function context() {
  return $("canvas")[0].getContext("2d");
}

// Graphically clears the board
function clear() {
  var c = context();
  c.fillStyle = PAD_COLOR;
  c.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);  

  c.fillStyle = BACKGROUND;
  c.fillRect(PADDING, PADDING,
             CANVAS_SIZE - 2 * PADDING,
             CANVAS_SIZE - 2 * PADDING);
}

// Resets the board for the given level.
function resetBoard(level) {
  GAME.level = level;
  GAME.answer = new Answer(level);

  eachTile(function(tile) {
    tile.destroy();
  });
  clear();
  
  for (var x = 0; x < LEN; ++x) {
    for (var y = 0; y < LEN; ++y) {
      var tile = new Tile(x, y, randomLetter());
      tile.show();
    }
  }
}

// Do stuff
function main() {
  $("canvas").mousedown(down);
  $("canvas").mousemove(move);
  $("canvas").mouseup(up);

  // TODO: read level from a hash tag
  resetBoard(1);
 
  setInterval(tick, 1000 / FPS);
}
$(main);
