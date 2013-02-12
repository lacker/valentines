// Functions for playing the anna game.

function sorted_letters(alist) {
  var answer = [];
  for (var i = 0; i < alist.length; ++i) {
    answer.push(alist[i]);
  }
  answer.sort();
  return answer;
};

function anagram_equal(list1, list2) {
  var sorted1 = sorted_letters(list1);
  var sorted2 = sorted_letters(list2);
  if (sorted1.length != sorted2.length) {
    return false;
  }
  for (var i = 0; i < sorted1.length; ++i) {
    if (sorted1[i] != sorted2[i]) {
      return false;
    }
  }
  return true;
}

// Figure out which game we should use, from the url
function get_data_id() {
  var parts = window.location.href.split("?");
  if (parts.length != 2) {
    return 0;
  }
  var data_id = parseInt(parts[1]);
  if (data_id >= 0 && data_id < game_data.length) {
    return data_id;
  }
  return 0;
}

function Game(data_id) {
  game = this;
  this.div = document.getElementById("game");
  while (this.div.childNodes.length > 0) {
    this.div.removeChild(this.div.lastChild);
  }

  // Set up this particular game
  this.data_id = data_id;
  var data = game_data[data_id];
  this.size = data.size;
  this.keyword = data.keyword;
  this.conditions = data.conditions;
  this.labels = [];
  this.group_ids = [];
  for (var i = 0; i < this.size * this.size; ++i) {
    this.labels.push(null);
    this.group_ids.push(null);
  }
  document.getElementById("secretword").innerHTML = this.keyword;
  
  // Figure out where the labels should go, based on the conditions
  for (var i = 0; i < this.conditions.length; ++i) {
    var condition = this.conditions[i];
    if (condition.fundamental) {
      // This is just a row- or column-based condition.
      continue;
    }
    var first_cell_id = Math.min.apply(Math, condition.positions);
    this.labels[first_cell_id] = condition.word;
    for (var j = 0; j < condition.positions.length; ++j) {
      this.group_ids[condition.positions[j]] = i;
    }
  }

  // Set up the stuff for display
  this.cells = [];
  this.cell_contents = [];
  this.guesses = [];
  this.selected = null;
  this.highlighted = "#FFCCCC";
 
  // Create the grid
  for (var y = 0; y < this.size; ++y) {
    for (var x = 0; x < this.size; ++x) {
      var cell = document.createElement("div");
      cell.setAttribute("class", "cell");
      this.div.appendChild(cell);
      var cell_id = this.cells.length;
      cell.onclick = function(id) {
	return function() { game.handle_click_on_cell(id); }
      }(cell_id);
      this.cells.push(cell);
      
      var intra_group_color = "#FFFFFF";
      var group_border_color = "#000000";
      // Set border colors if this cell is part of a group
      if (this.group_ids[cell_id] != null) {
	// Left border color
	if (this.intra_group(cell_id, cell_id - 1)) {
	  cell.style.borderLeftColor = intra_group_color;
	} else {
	  cell.style.borderLeftColor = group_border_color;
	}
	// Right border color
	if (this.intra_group(cell_id, cell_id + 1)) {
	  cell.style.borderRightColor = intra_group_color;
	} else {
	  cell.style.borderRightColor = group_border_color;
	}
	// Top border color
	if (this.intra_group(cell_id, cell_id - this.size)) {
	  cell.style.borderTopColor = intra_group_color;
	} else {
	  cell.style.borderTopColor = group_border_color;
	}
	// Bottom border color
	if (this.intra_group(cell_id, cell_id + this.size)) {
	  cell.style.borderBottomColor = intra_group_color;
	} else {
	  cell.style.borderBottomColor = group_border_color;
	}
      }

      var cell_content = document.createElement("div");
      
      if (this.labels[cell_id] != null) {
	var label_text = this.labels[cell_id];
	var label = document.createElement("div");
	label.setAttribute("class", "label");
	label.innerHTML = label_text;
	if (label_text.length > 6) {
	  label.style.fontSize = "10px";
	}
	cell.appendChild(label);

	cell_content.setAttribute("class", "cell_content_with_label");
      } else {
	cell_content.setAttribute("class", "cell_content");
      }
      cell.appendChild(cell_content);
      this.cell_contents.push(cell_content);
      
      this.guesses.push(null);
      
      var foo = document.createElement("span");
      cell.appendChild(foo);
    }
    var br = document.createElement("div");
    br.setAttribute("class", "clearer");
    this.div.appendChild(br);
  }
};

// Handle a click on a particular cell.
Game.prototype.handle_click_on_cell = function(cell_id) {
  // Clicking on the selected cell un-sets everything.
  if (cell_id == this.selected) {
    this.set_selected(null);
    return;
  }

  // Otherwise, clicking selects a cell
  this.set_selected(cell_id);
  return;
};


// Returns whether this should be an intra-group boundary.
// base_cell is guaranteed to be a cell in a group. other_cell has no guarantees.
Game.prototype.intra_group = function(base_cell, other_cell) {
  // Forbid vertical boundaries of the board
  if (other_cell < 0 || other_cell >= this.size * this.size) {
    return false;
  }
  // Forbid anything where the cells aren't in the same group
  if (this.group_ids[base_cell] != this.group_ids[other_cell]) {
    return false;
  }
  // Forbid the right-hand side of the board
  if (other_cell % this.size == 0 &&
      base_cell + 1 == other_cell) {
    return false;
  }
  // Forbid the left-hand side of the board
  if (base_cell % this.size == 0 &&
      other_cell + 1 == base_cell) {
    return false;
  }
  var diff = Math.abs(other_cell - base_cell);
  var answer = diff == 1 || diff == this.size;
  return answer;
}
  
// Change which cell is selected.
Game.prototype.set_selected = function(selected_id) {
  this.selected = selected_id;
  for (var i = 0; i < this.cells.length; ++i) {
    if (i == this.selected) {
      // This cell is selected.
      this.cells[i].style.backgroundColor = this.highlighted;
    } else {
      // This cell is not selected.
      this.cells[i].style.backgroundColor = "#FFFFFF";
    }
  }
};

// Handle a keypress
Game.prototype.handle_keypress = function(event) {
  if (this.selected == null) {
    return;
  }

  // Magic
  if (window.event) {
    var keynum = event.keyCode;
  } else {
    var keynum = event.which;
  }
  var keychar = String.fromCharCode(keynum).toUpperCase();

  if (keychar < "A" || keychar > "Z") {
    keychar = null;
  }

  // Update the selected cell for this guess.
  this.guesses[this.selected] = keychar;
  if (keychar == null) {
    this.cell_contents[this.selected].innerHTML = "";
  } else {
    this.cell_contents[this.selected].innerHTML = keychar;
  }

  this.set_selected(null);
  return;
};

// Deselect everything but cause a certain set of positions to blink once.
Game.prototype.blink = function(positions) {
  this.set_selected(null);
  for (var i = 0; i < positions.length; ++i) {
    this.cells[positions[i]].style.backgroundColor = this.highlighted;
  }
  var game = this;
  setTimeout(function() { game.set_selected(null) }, 500);
};

// Return whether the solution has been found.
// If it hasn't, blink the erroneous spots.
Game.prototype.check_solution = function() {
  // Is there a guess filled in for everything?
  var missing_guesses = [];
  for (var i = 0; i < this.guesses.length; ++i) {
    if (this.guesses[i] == null) {
      missing_guesses.push(i);
    }
  }
  if (missing_guesses.length > 0) {
    this.blink(missing_guesses);
    return false;
  }

  // Check the conditions.
  for (var i = 0; i < this.conditions.length; ++i) {
    var condition = this.conditions[i];
    var guess_list = [];
    for (var j = 0; j < condition.positions.length; ++j) {
      guess_list.push(this.guesses[condition.positions[j]]);
    }
    if (!anagram_equal(guess_list, condition.word)) {
      this.blink(condition.positions);
      return false;
    }
  }

  // Show the secret word.
  document.getElementById("secretword").style.color = "#000000";
  
  // Update the congratulations message.
  var next_data_id = this.data_id + 1;
  var message = "The end. &lt;3<br>You are awesome. Thanks for playing!";
  if (next_data_id < game_data.length) {
    var url = "annaken.html?" + next_data_id;
    message = "Good work! Why don't you try <a href='" + url + "'>another puzzle</a>?"
  }
  var congrats = document.getElementById("congratulations");
  congrats.innerHTML = message;
  return true;
};
