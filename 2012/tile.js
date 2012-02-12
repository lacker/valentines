// Code related to the Tile object

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
  if (success) {
    GAME.frustration += 1;
  }
  if (word == GAME.answer.nextWord) {
    success = true;
    GAME.answer.next();
    
    setMessage(GAME.answer.fragment);
    console.log(GAME.answer.fragment);

    if (GAME.answer.done()) {
      resetBoard(GAME.level + 1, true);
    } else {
      populateTarget();
    }
  }

  _.each(SELECTED, function(tile) {
    if (success) {
      // If this means progress to the target, reset frustration.
      var targetLetter = GAME.target[tile.key()];
      if (targetLetter != null && targetLetter != tile.letter) {
        GAME.frustration = 0;
      }
      
      tile.destroy();
      var newTile = new Tile(tile.x, tile.y, letterAt(tile.x, tile.y));
      newTile.show();
    } else {
      tile.unselect();
    }
  });
  SELECTED = [];
  if (success) {
    console.log("made: " + word + ". frustration = " + GAME.frustration);
    if (GAME.frustration == HINT_THRESHOLD) {
      hint();
    }
    if (GAME.frustration == PERMAHINT_THRESHOLD) {
      permahint();
    }
  }

}

// Runs f on each tile
function eachTile(f) {
  for (var x = 0; x < LEN; ++x) {
    for (var y = 0; y < LEN; ++y) {
      var tile = getTile(x, y);
      if (tile != null) {
        f(tile);
      }
    }
  }
}

function tick() {
  eachTile(function(tile) {
    if (tile.scale < 1) {
      tile.scale = Math.min(1, tile.scale + SCALE_PER_FRAME);
      tile.show();
    }
  });
}

// x is 0..5, goes from left to right.
// y is 0..5, goes from top to bottom.
// scale is 0..1, used for animation.
//
// Tiles manage themselves for TILES but not for SELECTED.
var Tile = function(x, y, letter) {
  if (getTile(x, y)) {
    error("there is already a tile at " + x + "," + y);
  }

  this.x = x;
  this.y = y;
  this.scale = 0;
  this.letter = letter;
  this.selected = false;
  this.hinted = false;

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

  // Returns whether this tile is already matching a letter in the target.
  matchesTarget: function() {
    return this.letter == GAME.target[this.key()];
  },
  
  corners: function(scale) {
    if (scale == null) {
      scale = 1;
    }
    var shrink = (1 - scale) * 0.5 * CELL_SIZE;
    return [PADDING + CELL_SIZE * this.x + shrink,
            PADDING + CELL_SIZE * this.y + shrink,
            CELL_SIZE - 2 * shrink,
            CELL_SIZE - 2 * shrink];
  },

  pad: function(rect) {
    return [rect[0] + PADDING,
            rect[1] + PADDING,
            rect[2] - 2 * PADDING,
            rect[3] - 2 * PADDING];
  },

  middleX: function() {
    var corners = this.corners();
    return corners[0] + corners[2] / 2;
  },

  middleY: function() {
    var corners = this.corners();
    return corners[1] + corners[3] / 2;
  },

  useHintColor: function() {
    if (this.hinted) {
      return true;
    }
    return (GAME.permahint && this.key() == GAME.firstTarget);
  },
  
  show: function() {
    // Make a square of pad-color
    var square = this.corners(this.scale);
    var c = context();
    c.fillStyle = PAD_COLOR;
    c.fillRect.apply(c, square);

    // Color the middle part
    if (this.selected) {
      c.fillStyle = SELECTED_COLOR;
    } else if (this.useHintColor()) {
      c.fillStyle = HINTED_COLOR;
    } else {
      c.fillStyle = DEFAULT_COLOR;
    }
    c.fillRect.apply(c, this.pad(square));

    // Color the text
    var fontSize = Math.floor(80 * this.scale);
    if (fontSize >= 10) {    
      c.font = "" + fontSize + "px Helvetica";
      c.fillStyle = "black";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(this.letter, this.middleX(), this.middleY());
    }
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

  destroy: function() {
    this.hide();

    delete TILES[this.key()];
  }
};