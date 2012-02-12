console.log("loading wordsquare");

var CANVAS_SIZE = 720;

// Extra padding on each side of the canvas
var PADDING = 3;
var PAD_COLOR = "black";

// Cell colors
var SELECTED_COLOR = "blue";
var DEFAULT_COLOR = "white";

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

// Tiles that have been selected
var SELECTED = [];

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

function unselectAll() {
  var word = "";
  _.each(SELECTED, function(tile) {
    word += tile.letter;
  });
  var success = DICT[word];
  _.each(SELECTED, function(tile) {
    if (success) {
      tile.destroy();
    } else {
      tile.unselect();
    }
  });
  SELECTED = [];
  if (success) {
    console.log("made: " + word);
    dropAll();
  }
}

// Logically drops all the existing tiles.
function dropAll() {
  for (var x = 0; x < LEN; ++x) {
    for (var y = LEN - 1; y >= 0; --y) {
      var tile = getTile(x, y);
      if (tile) {
        tile.drop();
      }
    }
  }
}

// Logical location:
// x is 0..5, goes from left to right.
// y is 0..5, goes from top to bottom.
//
// A tile might actually be somewhere other than its logical location.
// lift is how far the tile has to fall to get to its logical location.
// lift is in pixels.
//
// Tiles manage themselves for TILES but not for SELECTED.
var Tile = function(x, y, letter) {
  if (getTile(x, y)) {
    error("there is already a tile at " + x + "," + y);
  }

  this.x = x;
  this.y = y;
  this.lift = 0;
  this.letter = letter;
  this.selected = false;

  TILES[this.key()] = this;
};

Tile.prototype = {
  key: function() {
    return tileKey(this.x, this.y);
  },

  // If it's already selected, this is a no-op.
  // If it's too far from the last selection, this is a no-op.
  // Adds to SELECTED.
  select: function() {
    if (this.selected) {
      return;
    }
    if (SELECTED.length > 0) {
      var lastTile = SELECTED[SELECTED.length - 1];
      var deltaX = this.x - lastTile.x;
      var deltaY = this.y - lastTile.y;
      if (Math.abs(deltaX) > 1 ||
          Math.abs(deltaY) > 1) {
        return;
      }
    }
    SELECTED.push(this);
    this.selected = true;
    this.show();
  },

  // Does not remove from SELECTED.
  unselect: function() {
    this.selected = false;
    this.show();
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
    // Make the whole cell pad-color
    var c = context();
    c.fillStyle = PAD_COLOR;
    c.fillRect.apply(c, this.corners());

    // Color the middle part
    if (this.selected) {
      c.fillStyle = SELECTED_COLOR;
    } else {
      c.fillStyle = DEFAULT_COLOR;
    }
    c.fillRect.apply(c, this.padded());

    // Color the text
    c.font = "80px Helvetica";
    c.fillStyle = "black";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(this.letter, this.middleX(), this.middleY());
  },

  hide: function() {
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
    delete TILES[this.key()];
    this.x = x;
    this.y = y;
    TILES[this.key()] = this;
  },

  // Drops this existing tile as much as possible.
  // This won't change the visible location of the tile,
  // because it uses lift to offset.
  // Returns whether this could drop.
  drop: function() {
    // First, figure out how high of a y we can drop this tile to.
    for (var newY = LEN - 1; newY > this.y; --newY) {
      if (getTile(this.x, newY) == null) {
        break;
      }
    }
    if (newY == this.y) {
      // We can't drop this tile at all.
      return false;
    }

    this.move(this.x, newY);
    this.lift += CELL_SIZE * (newY - this.y);
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

  // The location in grid units instead of pixels
  this.floatX = (this.pixelX - PADDING) / CELL_SIZE;
  this.floatY = (this.pixelY - PADDING) / CELL_SIZE;

  // The actual grid unit this maps to
  this.x = Math.floor(this.floatX);
  this.y = Math.floor(this.floatY);

  // Figure out whether this should trigger something.
  // We only trigger for cell clicks
  if (this.x < 0 || this.x >= LEN ||
      this.y < 0 || this.y >= LEN) {
    return;
  }

  // We don't trigger if you're within the buffer from the edge.
  var buffer = 0.3;
  var xDiff = this.floatX - this.x;
  var yDiff = this.floatY - this.y;
  if (xDiff < buffer || xDiff > 1 - buffer ||
      yDiff < buffer || yDiff > 1 - buffer) {
    return;
  }

  // We only trigger if there's a tile
  if (this.tile() == null) {
    return;
  }
  
  this.trigger = true;
};

Position.prototype = {
  trigger: false,
  
  toString: function() {
    return "" + this.pixelX + " : " + this.pixelY;
  },

  tile: function() {
    return getTile(this.x, this.y);
  },
};

var MOUSE = {
  down: false,
};

function down(e) {
  MOUSE.down = true;
  var pos = new Position(e);
  if (pos.trigger) {
    pos.tile().select();
  }
}

function move(e) {
  if (!MOUSE.down) {
    return;
  }
  var pos = new Position(e);
  if (pos.trigger) {
    pos.tile().select();
  }
}

function up(e) {
  MOUSE.down = false;
  unselectAll();
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
