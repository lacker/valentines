// TODO:
// Upload everything.

// Sadly, correct_x and correct_y assume these are single digits.
var NUM_X_TILES = 8;
var NUM_Y_TILES = 6;

var TILE_SIZE = 50;
var PIECES_DIR = "pieces/";
var ORIGINAL_SCRATCH_SRC = PIECES_DIR + "scratch.jpg";
var ANNABOT_SRC = PIECES_DIR + "annabot.jpg";

// The PIC_NAME uses everything in the url after the ?
var qindex = document.location.href.indexOf("?");
var PIC_NAME;
if (qindex < 0) {
  PIC_NAME = PIECES_DIR + "pic1";
 } else {
  PIC_NAME = PIECES_DIR + document.location.href.substring(qindex + 1);
 }

// Coordinates of the scratch tile, if it's not in the scratch spot.
// Otherwise, the last non-scratch-spot place the scratch tile was.
var scratch_x = -1;
var scratch_y = -1;

// Whether the user has seen annabot help and annabot rampage.
var seen_annabot_help = false;
var seen_annabot_rampage = false;

// A hash table tracking the non-expanded version of imagesrc's so they can
// be used to checking identity.
// At any time, document.images[x].src should be a (possibly expanded)
// version of imagesrc[x].
var imagesrc = new Array();
imagesrc["scratch"] = ORIGINAL_SCRATCH_SRC;

// When click_lock is true, all user clicks are ignored.
var click_lock = false;

///////////////
// Code providing an interface to annabot.
///////////////

// Overrides the tile with annabot at x, y.
function show_annabot(x, y) {
  var name = imagename(x, y);
  document.images[name].src = ANNABOT_SRC;
}

// Sets x, y to show the tile instead of annabot.
function hide_annabot(x, y) {
  var name = imagename(x, y);
  document.images[name].src = imagesrc[name];
}

// Make annabot do something involving a wandering across squares.
// func will be called with x, y from each annabot location.
// func is the string name of the function.
// This should not be called reentrantly with other annabot functions.
function annabot_action(func) {
  // Ignore any clicks that happen during the action.
  click_lock = true;

  // Pick a y at random, while x will increase.
  var y = Math.floor(Math.random() * NUM_Y_TILES);
  annabot_continuation(func, 0, y);
}

// Annabot continues her quest, moving to current_x, current_y.
function annabot_continuation(func, current_x, current_y) {
  // If annabot is present at the old location, hide her.
  if (current_x > 0) {
    hide_annabot(current_x - 1, current_y);
  }

  // If the new location is off the board, annabot is done.
  if (current_x >= NUM_X_TILES) {
    click_lock = false;
    return;
  }

  // Annabot operates on her current location.
  cmd1 = func + "(" + current_x + "," + current_y + ")";
  // alert("cmd1: " + cmd1);
  eval(cmd1);
  show_annabot(current_x, current_y);

  // Annabot will continue at her next location.
  var cmd2 =
    "annabot_continuation('" + func + "'," + (current_x + 1) + "," + current_y + ")";
  // alert("cmd2: " + cmd2);
  setTimeout(cmd2, 500);
}

// Make annabot go on a rampage, causing problems.
// This should not be called reentrantly with other annabot functions.
function annabot_rampage() {
  if (!seen_annabot_rampage) {
    alert("Oh no!\n\nAnnabot is on a mad rampage, randomly reordering tiles!\n\n" +
	  "She will ban you so hard.");
    seen_annabot_rampage = true;
  }
  annabot_action("annabot_rampage_helper");
}
function annabot_rampage_helper(x, y) {
  var other_x = Math.floor(Math.random() * NUM_X_TILES);
  var other_y = Math.floor(Math.random() * NUM_Y_TILES);
  swap_tiles(x, y, other_x, other_y);
}

// Make annabot helpfully put some pieces in better places.
// This should not be called reentrantly with other annabot functions.
function annabot_help() {
  if (!seen_annabot_help) {
    alert("Your cry for help has been answered.\n\n" +
	  "Annabot will fix things up a bit!");
    seen_annabot_help = true;
  }
  annabot_action("annabot_help_helper");
}
function annabot_help_helper(x, y) {
  var other_x = correct_x(x, y);
  var other_y = correct_y(x, y);
  swap_tiles(x, y, other_x, other_y);
}

///////////////
// Code providing an interface to the grid.
// The grid is a NUM_X_TILES by NUM_Y_TILES square, plus a scratch spot
// probably displayed over on the side somewhere, if at all.
///////////////

// Returns the filename for the image that should go at position x, y.
// Warning! - changing this requires changing correct_x and correct_y.
function correct_image_src(x, y) {
  return PIC_NAME + "_" + x + "_" + y + ".jpg";
}

// Returns the correct x coordinate for the tile currently at x, y.
function correct_x(x, y) {
  var src = get_image_src(x, y);
  return src[PIC_NAME.length + 1];
}

// Returns the correct y coordinate for the tile currently at x, y.
function correct_y(x, y) {
  var src = get_image_src(x, y);
  return src[PIC_NAME.length + 3];
}

// The name for the image at position x, y.
function imagename(x, y) {
  return "tile_" + x + "_" + y;
}

// Returns the filename for the image that is currently at position x, y.
function get_image_src(x, y) {
  return imagesrc[imagename(x, y)];
}

// Changes the filename for the image that is currently at position x, y.
function set_image_src(x, y, src) {
  var name = imagename(x, y);
  imagesrc[name] = src;
  document.images[imagename(x, y)].src = src;
}

// Returns whether the scratch tile is in the scratch spot.
function scratch_is_home() {
  return imagesrc["scratch"] == ORIGINAL_SCRATCH_SRC;
}

// Swaps the image at tile x, y with the tile in the scratch spot.
function swap_scratch(x, y) {
  if (scratch_is_home()) {
    // We're moving the scratch tile into the grid, so we need to track its
    // coordinates.
    scratch_x = x;
    scratch_y = y;
  }

  var old_scratch = imagesrc["scratch"];
  imagesrc["scratch"] = get_image_src(x, y);
  set_image_src(x, y, old_scratch);
}

// Return the scratch tile to the scratch spot.
function scratch_go_home() {
  if (scratch_is_home()) {
    return;
  }
  swap_scratch(scratch_x, scratch_y);
}

// Swap two tiles.
function swap_tiles(x1, y1, x2, y2) {
  if ((x1 == x2) && (y1 == y2)) {
    return;
  }
  // Swapping three times into scratch keeps scratch the same while swapping.
  swap_scratch(x1, y1);
  swap_scratch(x2, y2);
  swap_scratch(x1, y1);
}

// Randomize the location of all tiles except the tile at the scratch spot.
function shuffle_tiles() {
  var num_tiles = NUM_X_TILES * NUM_Y_TILES;
  for (var i = 1; i < num_tiles; ++i) {
    // Figure the x and y corresponding to the ith tile
    x_i = i % NUM_X_TILES;
    y_i = Math.round((i - x_i) / NUM_X_TILES);

    // Select a j randomly from [0, i]
    var j = Math.floor(Math.random() * (i + 1));

    // Figure the x and y corresponding to the jth tile
    x_j = j % NUM_X_TILES;
    y_j = Math.round((j - x_j) / NUM_X_TILES);

    // Swap tiles i and j.
    swap_tiles(x_i, y_i, x_j, y_j);
  }
}

// Returns how many tiles still need to be placed in the correct position.
function count_wrong_tiles() {
  var wrong_tiles = 0;
  for (var x = 0; x < NUM_X_TILES; x++) {
    for (var y = 0; y < NUM_Y_TILES; y++) {
      if (correct_image_src(x, y) != get_image_src(x, y)) {
	++wrong_tiles;
      }
    }
  }
  return wrong_tiles;
}

// See if the game has been won.
function check_for_success() {
  if (count_wrong_tiles() == 0) {
    alert("Perfect!\n\nAll is for the best in this, " +
	  "the best of all possible worlds.");
  }
}

function mousedown_on_tile(x, y) {
  if (click_lock) {
    return;
  }

  // Implement the first-click-chooses, second-click-swaps behavior.
  if (scratch_is_home()) {
    swap_scratch(x, y);
  } else {
    swap_scratch(x, y);
    scratch_go_home();
  }

  check_for_success();

  // Check if we should spring annabot's rampage.
  if (scratch_is_home() && !seen_annabot_rampage && count_wrong_tiles() < 5) {
    annabot_rampage();
  }
}

function mouseover_on_tile(x, y) { }

///////////////
// This block was mostly taken from lackerships.
// I hear this is clearly not the way to implement dynamic grids.
// Unfortunately I don't know what is.
// TODO: learn and fix
///////////////
document.write("<table cellpadding='0' cellspacing='0'>");
for (var y = 0; y < NUM_Y_TILES; y++) {
  document.write("\n<tr>\n");
  for (var x = 0; x < NUM_X_TILES; x++) {
    document.write("\n<td>\n");
    var src = correct_image_src(x, y);
    var name = imagename(x, y);
    imagesrc[name] = src;
    document.write("<img src='" + src + "' name='" + name + "'");
    document.write(" height='" + TILE_SIZE + "' width='" + TILE_SIZE + "'");
    document.write("onMouseDown='mousedown_on_tile(" + x + "," + y + ");' ");
    document.write("onMouseOver='mouseover_on_tile(" + x + "," + y + ")'");
    document.write(">\n</td>\n");
  }
  document.write("</tr>\n");
 }
document.write("\n</tr>\n");
document.write("</table><br>");

// A button for shuffling the tiles.
document.write("<INPUT TYPE='button' NAME='shuffleButton' VALUE='Shuffle' ");
document.write("onClick='shuffle_tiles()'>");

// A button for help.
document.write("<INPUT TYPE='button' NAME='helpButton' VALUE='Help' ");
document.write("onClick='if (!click_lock) { annabot_help(); }'>");

// A button for rampage.
// document.write("<INPUT TYPE='button' NAME='rampageButton' VALUE='Rampage' ");
// document.write("onClick='annabot_rampage()'>");

shuffle_tiles();
