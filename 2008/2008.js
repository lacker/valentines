function Game() {
  var answers = 
    [
"here is a game for my dear anna may\n" +
"to show how i love you on valentine's day",

"you are the best girl that i ever knew\n" +
"so i figured i'd write a love poem for you",

"i was a bit nervous that it would sound sappy\n" +
"even though i knew that i'd make you happy",

"so when i was done with being a poet\n" +
"i was too shy of my poem to show it",

"afraid of bad rhymes making our love eroded\n" +
"i had an idea - i'll make it encoded!",

"now i can say \"anna, your beauty astounds\"\n" +
"i love like explosions without any bounds",

"when i see you smile i'm filled with desire\n" +
"to sing to you proof of my internal fire",

"with your arms around me i feel a great power\n" +
"so i could just hold you for hour after hour",

"every line of love that i write here is true\n" +
"but still i'd feel silly just giving it to you",

"this is why i had to disguise my words\n" +
"perhaps now you think i'm the biggest of nerds",

"i hope you are happy, i hope you had fun\n" +
"after one more couplet I think we are done",

"i love you anna may!\n" +
"happy valentine's day",
];

  game = this;
  this.div = document.getElementById("game");
  this.encoder = FullShuffle();
  this.guessmap = {};
  this.solved = false;

  // Figure out the next url
  var parts = window.location.href.split("?");
  if (parts.length < 2) {
    this.number = 1;
  } else {
    this.number = parseInt(parts[1]);
  }
  document.getElementById("number").innerHTML = this.number;
  this.next_url = parts[0] + "?" + (this.number + 1);
  document.getElementById("nextpuzzle").setAttribute("href", this.next_url);

  if (1 <= this.number && this.number <= answers.length) {
    this.answer = answers[this.number - 1];
  } else {
    this.answer = "the end";
  }
  this.answer = this.answer.toUpperCase();

  // Which letter, if any, is the crypto-letter with focus
  this.crypto_focus = "";

  // The divs for the decrypted stuff
  this.guesses = [];

  // Add each letter to the game
  for (var i = 0; i < this.answer.length; ++i) {
    var letter = this.answer[i];
    var is_letter = (letter.toUpperCase() != letter.toLowerCase());
    if (is_letter) {
      letter = this.encoder[letter];
    }

    if (" " == letter) {
      letter = "&nbsp;";
    }

    var encloser = document.createElement("div");
    if ("\n" == letter) {
      encloser.setAttribute("id", "linebreak");
    } else {
      encloser.setAttribute("id", "encloser");
    }
    this.div.appendChild(encloser);

    var decrypted = document.createElement("div");
    decrypted.setAttribute("id", "decrypted");
    if (is_letter) {
      decrypted.innerHTML = "_";
      decrypted.crypto_letter = letter;
      decrypted.onclick = function() {
	game.crypto_highlight = this.crypto_letter;
	Render(game);
      }
    } else {
      decrypted.innerHTML = letter; // "&nbsp;";
    }
    encloser.appendChild(decrypted);

    var encrypted = document.createElement("div");
    encrypted.setAttribute("id", "encrypted");
    encrypted.innerHTML = letter;
    encloser.appendChild(encrypted);

    this.guesses.push(decrypted);
  }
}

function AddSpace(div) {
  for (var i = 0; i < 6; ++i) {
    div.appendChild(document.createElement("br"));
  }
}

function CheckHelp(game) {
  if (undefined == game.problem_guess) {
    document.getElementById("nohelp").setAttribute("style",
						   "display:block");
    return;
  }
  game.crypto_highlight = game.problem_guess.crypto_letter;
  Render(game);
}

// Render everything transient about the game state.
function Render(game) {
  // Highlight the things with crypto focus.
  for (var i = 0; i < game.guesses.length; ++i) {
    var decrypted = game.guesses[i];
    if (decrypted.crypto_letter == game.crypto_highlight) {
      decrypted.setAttribute("id", "highlighted");
    } else {
      decrypted.setAttribute("id", "decrypted");
    }
  }

  var message = document.getElementById("message");
  if (game.solved) {
    message.setAttribute("style", "display:block");
  } else {
    message.setAttribute("style", "display:none");
  }

  document.getElementById("nohelp").setAttribute("style", "display:none");
}

// Return "" if it's not a letter.
function LetterFromCode(code) {
  if (code < 65 || code > 90) {
    return "";
  }
  return String.fromCharCode(code);
}

// Call this with letters.
// If decoded is "_" it undoes the guess.
// Return whether the whole thing is correct now.
function MakeGuess(game, coded, decoded) {
  game.problem_guess = undefined;
  var problems = 0;
  for (var i = 0; i < game.guesses.length; ++i) {
    var guess = game.guesses[i];
    if (undefined == guess.crypto_letter) {
      continue;
    }
    if (guess.innerHTML == decoded) {
      game.guessmap[guess.crypto_letter] = "_";
      guess.innerHTML = "_";
    }
    if (guess.crypto_letter == coded) {
      game.guessmap[guess.crypto_letter] = decoded;
      guess.innerHTML = decoded;
    }
    if (game.encoder[guess.innerHTML] != guess.crypto_letter) {
      ++problems;
      if (guess.innerHTML != "_") {
	game.problem_guess = guess;
      }
    }
  }
  game.solved = (0 == problems);
}

function ApplyCode(game, code) {
  if ("" == game.crypto_highlight) {
    return;
  }
  var letter = LetterFromCode(code);
  if (letter == "") {
    letter = "_";
  }
  MakeGuess(game, game.crypto_highlight, letter);
  game.crypto_highlight = "";
  Render(game);
}

function Alphabet() {
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
}

// Returns a random map from A-Z -> A-Z where a letter may map to itself.
function MostlyShuffle() {
  var letters = Alphabet();
  for (var i = letters.length - 1; i >= 1; --i) {
    // Let j be a random number in [0..i]
    var j = Math.floor(Math.random() * (i + 1));
    // Swap spots i and j
    var tmp = letters[i];
    letters[i] = letters[j];
    letters[j] = tmp;
  }
  var ordered = Alphabet();
  var map = {};
  for (var i = 0; i < letters.length; ++i) {
    map[ordered[i]] = letters[i];
  }
  return map;
}

function IsFullShuffle(map) {
  for (key in map) {
    if (key == map[key]) {
      return false;
    }
  }
  return true;
}

// Returns a map from A-Z -> A-Z where no letter maps to itself.
function FullShuffle() {
  while(true) {
    var map = MostlyShuffle();
    if (IsFullShuffle(map)) {
      return map;
    }
  }
}
