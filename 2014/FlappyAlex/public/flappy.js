// Designed for an iPad running at 2048 x 1536 resolution held vertically.
var GLOBALS = {};
var ALEX_WIDTH = 235;
var ALEX_HEIGHT = 277;
var TABLE_WIDTH = 500;
var TABLE_HEIGHT = 500;
var IPAD_WIDTH = 1536;
var IPAD_HEIGHT = 2048;
var container = null;

// Scales things so we can test in a browser
function scale(scalar) {
  return Math.round(scalar * 0.2);
}

function show_intro() {
  var div = $("<div>");
  div.html("<center><br><br><br>how many steps can Alex take before bonking into something?<br><br>tap to begin!</center>");
  $("#container").empty().append(div);

  GLOBALS.tap = function() {
    start_game();
  }
}

// jquery helper stolen from stack overflow
function collision($div1, $div2) {
  var x1 = $div1.offset().left;
  var y1 = $div1.offset().top;
  var h1 = $div1.outerHeight(true);
  var w1 = $div1.outerWidth(true);
  var b1 = y1 + h1;
  var r1 = x1 + w1;
  var x2 = $div2.offset().left;
  var y2 = $div2.offset().top;
  var h2 = $div2.outerHeight(true);
  var w2 = $div2.outerWidth(true);
  var b2 = y2 + h2;
  var r2 = x2 + w2;

  if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
  return true;
}

function position_alex() {
  GLOBALS.alex.css("top", "" + scale(IPAD_HEIGHT * (1 - GLOBALS.alex_y)) + "px");
}

function position_table() {
  var left = scale(IPAD_WIDTH * GLOBALS.table_x);
  var top = scale(IPAD_HEIGHT * (1 - GLOBALS.table_y));
                  
  GLOBALS.table.css("left", "" + left + "px");
  GLOBALS.table.css("top", "" + top + "px");
}

function move_table() {
  GLOBALS.table_x = 1.0;
  GLOBALS.table_y = 1 - Math.random() * ((IPAD_HEIGHT - TABLE_HEIGHT) / IPAD_HEIGHT);
  console.log("putting table at y = " + GLOBALS.table_y);
}

function start_game() {
  GLOBALS.steps = 0;

  // These are fractions in 0-1
  GLOBALS.alex_x = 0.2;
  GLOBALS.alex_y = 0.5;
  move_table();

  // These define physics
  GLOBALS.step_dy = 0.06;
  GLOBALS.gravity = 0.01;

  // Current velocity
  GLOBALS.alex_dy = 0;
  GLOBALS.table_dx = -0.03;

  var alex = GLOBALS.alex = $("<div>");
  alex.width(scale(ALEX_WIDTH));
  alex.height(scale(ALEX_HEIGHT));
  alex.css("position", "absolute");
  alex.css("left", "" + scale(IPAD_WIDTH * GLOBALS.alex_x) + "px");
  var alex_pic = $('<img id="dynamic">');
  alex_pic.width(scale(ALEX_WIDTH));
  alex_pic.height(scale(ALEX_HEIGHT));
  alex_pic.attr('src', "./alex.png");
  alex.append(alex_pic);
  position_alex();

  var table = GLOBALS.table = $("<div>");
  table.width(scale(TABLE_WIDTH));
  table.height(scale(TABLE_HEIGHT));
  table.css("position", "absolute");
  var table_pic = $('<img id="tableimg">');
  table_pic.width(scale(TABLE_WIDTH));
  table_pic.height(scale(TABLE_HEIGHT));
  table_pic.attr('src', "./table.jpg");
  table.append(table_pic);
  position_table();

  $("#container").empty().append(alex).append(table);
  GLOBALS.tap = function() {
    console.log("tap");

    if (GLOBALS.alex_dy < 0) {
      // Take a step
      GLOBALS.steps += 1;
    }
    GLOBALS.alex_dy = GLOBALS.step_dy;
  }
  GLOBALS.tick = function() {
    console.log("tick");

    // Gravity
    GLOBALS.alex_dy -= GLOBALS.gravity;

    // Momentum
    GLOBALS.alex_y += GLOBALS.alex_dy;
    GLOBALS.table_x += GLOBALS.table_dx;

    if (GLOBALS.table_x + (TABLE_WIDTH / IPAD_WIDTH) < 0) {
      move_table();
    }

    position_alex();
    position_table();

    // Check for collision
    if (GLOBALS.alex_y < (ALEX_HEIGHT / IPAD_HEIGHT)) {
      stop_game("the wall");
    } else if (GLOBALS.alex_y > 1) {
      stop_game("the wall");
    } else if (collision(GLOBALS.alex, GLOBALS.table)) {
      stop_game("a table");
    }
  }
}

function stop_game(bonkee) {
  var div = $("<div class=texty>");
  var step_word = "step";
  if (GLOBALS.steps != 1) {
    step_word += "s";
  }
  div.html("<center><br><br><br>Alex took " + GLOBALS.steps + " " + step_word + " before bonking into " + bonkee + "!<br><br>tap to play again</center>");
  $("#container").empty().append(div);

  var ticks = 0;
  GLOBALS.tap = function() {
    if (ticks > 10) {
      start_game();
    }
  }
  GLOBALS.tick = function() {
    ticks += 1;
  };
}

$(function() {
  var container = $("#container");
  container.height(scale(IPAD_HEIGHT));
  container.width(scale(IPAD_WIDTH));
  container.css("position", "relative");
  container.css("background-color", "#fff");
  container.on("click tap", function() { GLOBALS.tap(); });
  window.setInterval(function() {
    if (GLOBALS.tick) {
      GLOBALS.tick();
    }
  }, 50);
  show_intro();
});
