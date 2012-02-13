console.log("loading wordsquare");

var CANVAS_SIZE = 980;

// How frustrated you can get before you get a hint
var HINT_THRESHOLD = 3;

// How frustrated you can get before you get a really good hint
var PERMAHINT_THRESHOLD = 6;

// Extra padding on each side of the canvas
var PADDING = 4;
var PAD_COLOR = "black";

// Cell colors
var SELECTED_COLOR = "#AED1FE";
var DEFAULT_COLOR = "white";
var HINTED_COLOR = "#AEFEC4";

// Number of cells to a row/column
var LEN = 6;

// Animation
var SCALE_PER_FRAME = 0.2;
var FPS = 5;

var CELL_SIZE = (CANVAS_SIZE - 2 * PADDING) / LEN;

var BACKGROUND = "#FEAEAE";

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
// firstTarget - an "x,y" string for the first letter
// frustration - number of turns with no hint or special-word-guessing
// permahint - whether we are in permahint mode
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
  used[headKey] = 1;
  
  while (output.length < length) {
    var possible = shuffle(neighbors(head));
    var foundNewHead = false;
    for (var i = 0; i < possible.length; ++i) {
      var newHead = possible[i];
      var newHeadKey = newHead[0] + "," + newHead[1];
      if (used[newHeadKey]) {
        continue;
      }

      // This is the new head
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

// This picks a location for the target word to appear on
// the board, so that we can ensure that eventually it will appear.
// It is based on GAME.answer.nextWord and fills GAME.target.
function populateTarget() {
  var letters = GAME.answer.nextWord.split("");
  var path = randomPath(letters.length);
  GAME.frustration = 0;
  GAME.permahint = false;
  GAME.target = {};
  for (var i = 0; i < path.length; ++i) {
    var key = path[i][0] + "," + path[i][1];
    GAME.target[key] = letters[i];
    if (i == 0) {
      GAME.firstTarget = key;
    }
  }
}

// Just a hook into the global view.
function setMessage(message) {
  $("#top").text(message);
}

// Turns on a hint somewhere.
// If there's already a hint, this is a no-op.
function hint() {
  var tiles = _.map(shuffle(_.keys(GAME.target)), function(key) {
    return TILES[key];
  });
  console.log("hinting. target tiles = " + tiles);
  if (_.any(tiles, function(tile) {
    return tile.hinted;
  })) {
    // There is already a hint.
    console.log("there is already a hint");
    return;
  }
  var hintable = _.find(tiles, function(tile) {
    return !tile.matchesTarget();
  });
  if (hintable) {
    console.log("hinting " + hintable.x + "," + hintable.y);
    hintable.hinted = true;
    hintable.show();
  } else {
    var extender = _.map(GAME.answer.nextWord.split(""), function() {
      return " _";
    });
    setMessage(GAME.answer.fragment + extender.join(""));
  }
}

// Turns on the permahint.
function permahint() {
  console.log("permahinting");
  GAME.permahint = true;
  var tile = TILES[GAME.firstTarget];
  tile.show();
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

function letterAt(x, y) {
  var key = "" + x + "," + y;
  var letter = GAME.target[key];
  if (letter == null) {
    return randomLetter();
  } else {
    return letter;
  }
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
function resetBoard(level, updateHash) {
  if (updateHash) {
    window.location.hash = "#" + level;
  }
  GAME.level = level;
  GAME.answer = new Answer(level);
  GAME.permahint = null;
  populateTarget();
  
  eachTile(function(tile) {
    tile.destroy();
  });
  clear();

  for (var x = 0; x < LEN; ++x) {
    for (var y = 0; y < LEN; ++y) {
      var tile = new Tile(x, y, letterAt(x, y));
      tile.show();
    }
  }
}

function ontouch(name, f) {
  var canvas = $("canvas")[0];
  canvas.addEventListener("touch" + name, function(event) {
    event.preventDefault();
    
    // If there's exactly one finger inside this element
    if (event.targetTouches.length == 1) {
      var touch = event.targetTouches[0];
      f(touch);
    }
  }, false);
}

// Do stuff
function main() {
  $("canvas").mousedown(down);
  $("canvas").mousemove(move);
  $("canvas").mouseup(up);

  ontouch("start", down);
  ontouch("move", move);
  $("html").bind("touchend", up);
  
  // read level from a hash tag
  var level = 1;
  var tag = window.location.hash.match(/[0-9]+$/);
  if (tag) {
    var num = parseInt(tag[0]);
    if (num > 0) {
      level = num;
      setMessage("Level " + level);
    }
  }
  resetBoard(level, false);
 
  setInterval(tick, 1000 / FPS);
}
$(main);
