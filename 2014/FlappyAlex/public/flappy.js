// Designed for an iPad running at 2048 x 1536 resolution held vertically.

var GLOBALS = {};
var container = null;

function show_intro() {
  var div = $("<div>");
  // TODO: center this or make it look cooler
  div.text("how many steps can Alex take before bonking into a table? tap to begin!");
  $("#container").empty().append(div);
}

$(function() {
  var container = $("#container");
  container.height(2048);
  container.width(1536);
  container.css("position", "relative");
  container.css("margin-top", "0px");
  container.css("background-color", "#eee");
  show_intro();
});
