console.log("loading wordsquare");

var CANVAS_SIZE = 720;

// Extra padding on each side of the canvas
var PADDING = 3;
var PAD_COLOR = "black";

// Number of cells to a row/column
var LEN = 6;

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

function error(message) {
  alert(message);
  throw new Error(message);
}

function choice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomLetter() {
  return choice(choice([ALPHABET, EASY_LETTERS, BEST_LETTERS]));
}

function context() {
  return $("canvas")[0].getContext("2d");
}

function clear() {
  var c = context();
  c.fillStyle = PAD_COLOR;
  c.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);  

  c.fillStyle = BACKGROUND;
  c.fillRect(PADDING, PADDING,
             CANVAS_SIZE - 2 * PADDING,
             CANVAS_SIZE - 2 * PADDING);
}

// Stores all tiles keyed by strings like "3,4" for x,y.
var TILES = {};

function tileKey(x, y) {
  return "" + x + "," + y;
}

function getTile(x, y) {
  return TILES[tileKey(x, y)];
}

// Logical location:
// x is 0..5, goes from left to right.
// y is 0..5, goes from top to bottom.
//
// A tile might actually be somewhere other than its logical location.
// lift is how far the tile has to fall to get to its logical location.
// lift is in pixels.
var Tile = function(x, y, letter, color) {
  if (getTile(x, y)) {
    error("there is already a tile at " + x + "," + y);
  }

  this.x = x;
  this.y = y;
  this.lift = 0;
  this.letter = letter;
  this.color = (color || "white");

  TILES[this.key()] = this;
};

Tile.prototype = {
  key: function() {
    return tileKey(this.x, this.y);
  },
  
  corners: function() {
    return [PADDING + CELL_SIZE * this.x,
            PADDING + CELL_SIZE * this.y - this.lift,
            CELL_SIZE,
            CELL_SIZE];
  },

  padded: function() {
    var corners = this.corners();
    return [corners[0] + PADDING,
            corners[1] + PADDING,
            corners[2] - 2 * PADDING,
            corners[3] - 2 * PADDING];
  },

  middleX: function() {
    var corners = this.corners();
    return corners[0] + corners[2] / 2;
  },

  middleY: function() {
    var corners = this.corners();
    return corners[1] + corners[3] / 2;
  },
  
  show: function() {
    // console.log("showing at " + this.x + "," + this.y);

    // Make the whole cell pad-color
    var c = context();
    c.fillStyle = PAD_COLOR;
    c.fillRect.apply(c, this.corners());

    // Color the middle part
    c.fillStyle = this.color;
    c.fillRect.apply(c, this.padded());

    // Color the text
    c.font = "80px Helvetica";
    c.fillStyle = "black";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(this.letter, this.middleX(), this.middleY());
  },

  hide: function() {
    // console.log("hiding at " + this.x + "," + this.y);

    // Make it all background
    var c = context();
    c.fillStyle = BACKGROUND;
    c.fillRect.apply(c, this.corners());
  },

  // Does not interact with the view.
  move: function(x, y) {
    if (getTile(x, y)) {
      error("cannot move to " + x + "," + y);
    }
    this.x = x;
    this.y = y;
  },

  // Drops this existing tile as much as possible.
  // This won't change the visible location of the tile,
  // because it uses lift to offset.
  // Returns whether this could drop.
  drop: function() {
    // First, figure out how high of a y we can drop this tile to.
    for (var newY = LEN - 1; newY > y; --newY) {
      if (getTile(x, newY) == null) {
        break;
      }
    }
    if (newY == y) {
      // We can't drop this tile at all.
      return false;
    }
    this.move(x, newY);
    this.lift += CELL_SIZE * (newY - y);
    return true;
  },
  
  destroy: function() {
    this.hide();

    delete TILES[this.key()];
  }
};


var Position = function(event) {
  var canvas = $("canvas")[0];
  this.pixelX = event.pageX - canvas.offsetLeft;
  this.pixelY = event.pageY - canvas.offsetTop;
};

Position.prototype = {
  toString: function() {
    return "" + this.pixelX + " : " + this.pixelY;
  }
};

function down(e) {
  var pos = new Position(e);
  console.log("down: " + pos);
}

function move(e) {
  var pos = new Position(e);
  console.log("move: " + pos);
}

function up(e) {
  var pos = new Position(e);
  console.log("up: " + pos);
}



// Do stuff
function main() {
  $("canvas").mousedown(down);
  $("canvas").mousemove(move);
  $("canvas").mouseup(up);
  
  clear();
  for (var x = 0; x < LEN; ++x) {
    for (var y = 0; y < LEN; ++y) {
      var tile = new Tile(x, y, randomLetter());
      tile.show();
    }
  }
}
$(main);
