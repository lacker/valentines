// Designed for an iPad running at 2048 x 1536 resolution held vertically.

var GLOBALS = {};
var container = null;

function show_intro() {
  var div = $("<div>");
  div.text("how many steps can Alex take before bonking into a table? tap to begin!");
  $("#container").empty().append(div);

  GLOBALS.tap = function() {
    start_game();
  }
}

function start_game() {
  var alex = $("<div>");
  alex.width(235);
  alex.height(277);
  alex.css("position", "absolute");
  alex.css("left", "0px");
  alex.css("top", "0px");
  var img = $('<img id="dynamic">');
  img.attr('src', "./alex.png");
  alex.append(img);

  $("#container").empty().append(alex);
  GLOBALS.tap = function() {
    console.log("game tap!");
  }
}

$(function() {
  var container = $("#container");
  container.height(2048);
  container.width(1536);
  container.css("position", "relative");
  container.css("margin-top", "0px");
  container.css("background-color", "#eee");
  container.on("click tap", function() { GLOBALS.tap(); });
  show_intro();
});
