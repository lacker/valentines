// Code related to mouse movement

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
  var buffer = 0.2;
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


