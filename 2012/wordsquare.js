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
// target - a map from x,y to what letter we are targeting there
var GAME = {};

function rand(n) {
  return Math.floor(Math.random() * n);
}

function randomCell() {
  return [rand(LEN), rand(LEN)];
}

function choice(array) {
  return array[rand(array.length)];
}

function shuffle(array) {
  return _.sortBy(array, Math.random);
}

function neighbors(cell) {
  var possible = [
    [cell[0], cell[1] + 1],
    [cell[0], cell[1] - 1],
    [cell[0] + 1, cell[1]],
    [cell[0] - 1, cell[1]],
    [cell[0] + 1, cell[1] - 1],
    [cell[0] + 1, cell[1] + 1],
    [cell[0] - 1, cell[1] - 1],
    [cell[0] - 1, cell[1] + 1],
  ];
  console.log("possible: " + possible);
  return _.filter(possible, function(cell) {
    return (cell[0] >= 0 && cell[0] < LEN &&
            cell[1] >= 0 && cell[1] < LEN);
  });
}

// Picks a random path through the grid of a given length.
// Returns a list of cells specified as "x,y" strings, or
// returns null if it can't find it greedily.
function greedyPath(length) {
  var head = randomCell();
  var output = [head];
  var used = {};
  var headKey = head[0] + "," + head[1];
  console.log("starting at: " + headKey);
  used[headKey] = 1;
  
  while (output.length < length) {
    var possible = shuffle(neighbors(head));
    var foundNewHead = false;
    for (var i = 0; i < possible.length; ++i) {
      var newHead = possible[i];
      var newHeadKey = newHead[0] + "," + newHead[1];
      if (used[newHeadKey]) {
        console.log("already used: " + newHeadKey);
        continue;
      }

      // This is the new head
      console.log("using: " + newHeadKey);
      output.push(newHead);
      used[newHeadKey] = 1;
      head = newHead;
      foundNewHead = true;
      break;
    }
    if (!foundNewHead) {
      return null;
    }
  }
  
  return output;
}

// Retries greedyPath til it works
function randomPath(length) {
  while (true) {
    var answer = greedyPath(length);
    if (answer) {
      return answer;
    }
  }
}

// This is kind of a weird function.
// It picks a location for the target word to appear on
// the board, so that we can ensure that eventually it will appear.
function populateTarget() {
  var letters = GAME.answer.nextWord.split("");
  // XXX
}

function error(message) {
  alert(message);
  throw new Error(message);
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

  populateTarget();
  
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
