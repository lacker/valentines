var RADIUS = 5

// Stolen from stack overflow
function shuffle(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

// Returns whether this row, col is on the board
function isValidPosition(row, col) {
  if (row < 0) {
    return false
  }
  if (row > 2 * RADIUS) {
    return false
  }
  if (col < 0) {
    return false
  }
  if (col > 2 * RADIUS) {
    return false
  }
  if (col - row > RADIUS) {
    return false
  }
  if (row - col > RADIUS) {
    return false
  }
  return true
}

// Returns a list of {row: r, col: c} neighbors, including some
// invalid spots.
function neighborsIncludingInvalid(row, col) {
  return [
    {row: row, col: col + 1},
    {row: row, col: col - 1},
    {row: row + 1, col: col},
    {row: row - 1, col: col},
    {row: row + 1, col: col + 1},
    {row: row - 1, col: col - 1}]
}

// Returns a list of neighbors but only the valid ones.
function neighbors(row, col) {
  var all = neighborsIncludingInvalid(row, col)
  var answer = []
  all.map(function(cell) {
    if (isValidPosition(cell.row, cell.col)) {
      answer.push(cell)
    }
  })
  shuffle(answer)
  return answer
}

// Returns whether a cell is on the edge
function onEdge(row, col) {
  return (neighbors(row, col).length !=
    neighborsIncludingInvalid(row, col).length)
}

var Cell = React.createClass({
  render: function() {
    var style = {
      top: 51 * this.props.row,
      left: 267 + 51 * this.props.col - 25.5 * this.props.row,
    }
    if (this.pic == null) {
      var pics = ["blocks", "bottle", "bus", "frogs", "garden",
        "humans", "mower", "puppet", "roomba", "shoes"]
      this.pic = pics[Math.floor(Math.random() * pics.length)]
    }
    if (this.props.content == "barrier") {
      style.backgroundImage = "url(./" + this.pic + ".png)"
      style.backgroundSize = "100%"
    }
    if (this.props.content == "alex") {
      style.backgroundImage = "url(./alex100.png)"
      style.backgroundSize = "100%"
    }
    return (
      <div className="cell" style={style} onClick={this.props.onClick}>
      </div>
    );
  }
})

var GameBoard = React.createClass({
  // Returns whether a barrier-add was successful
  addBarrier: function(row, col) {
    var cell = this.state.cells[row][col]
    if (cell.content != "empty") {
      return false
    }
    cell.content = "barrier"
    this.forceUpdate()
    return true
  },

  // Each empty cell has a score indicating the distance to the edge,
  // or null if it's unknown.
  updateCellScores: function() {
    // Clear all the scores to null.
    this.state.cellArray.map(function(cell) {
      cell.score = null
    })

    var round = 1
    var state = this.state
    while (true) {
      var didUpdate = false
      state.cellArray.map(function(cell) {
        if (cell.score != null) {
          return
        }

        if (cell.content != "empty") {
          return
        }

        if (onEdge(cell.row, cell.col)) {
          cell.score = round
          didUpdate = true
          return
        }

        // We can set a cell if one of its neighbors has already been scored
        var ns = neighbors(cell.row, cell.col)
        var hasScoredNeighbor = false
        ns.map(function(neighbor) {
          var neighborCell = state.cells[neighbor.row][neighbor.col]
          if (neighborCell.score == round - 1) {
            cell.score = round
            didUpdate = true
          }
        })
      })

      round++
      if (!didUpdate) {
        break
      }
    }
  },

  findAlex: function() {
    // Find Alex
    var alex = null
    this.state.cellArray.map(function(cell) {
      if (cell.content == "alex") {
        alex = cell
      }
    })
    return alex
  },

  // This sets the state appropriately.
  // This method is where winner gets declared for ongoing games.
  moveAlex: function() {
    this.updateCellScores()
    var alex = this.findAlex()

    if (onEdge(alex.row, alex.col)) {
      alex.content = "empty"
      this.state.winner = "alex"
      this.forceUpdate()
      console.log("alex escaped!")
      return
    }

    var bestSpot = null
    var ns = neighbors(alex.row, alex.col)
    var state = this.state
    ns.map(function(n) {
      var neighbor = state.cells[n.row][n.col]
      if (neighbor.score == null) {
        return
      }
      if (bestSpot == null || bestSpot.score > neighbor.score) {
        bestSpot = neighbor
      }
    })

    if (bestSpot == null) {
      console.log("alex is trapped!")
      this.state.winner = "you"
      this.forceUpdate()
      return
    }

    bestSpot.content = "alex"
    alex.content = "empty"
    this.state.winner = null
    this.forceUpdate()
  },

  // Components of the state:
  // cells maps [row][col] to a cell
  // cellArray is just an array of all cells, for convenience
  // winner is null if the game is ongoing, "alex" if he beat you, and
  // "you" if you won.
  getInitialState: function() {
    console.log("setting up the game")

    // Ugly hack
    GameBoard.board = this

    var cells = {}
    var cellArray = []
    for (var row = 0; row <= 2 * RADIUS; row++) {
      for (var col = 0; col <= 2 * RADIUS; col++) {
        if (!isValidPosition(row, col)) {
          continue
        }
        if (!cells[row]) {
          cells[row] = {}
        }
        var cell = {}
        if (row == RADIUS && col == RADIUS) {
          cell.content = "alex"
        } else if (Math.random() < 0.07) {
          cell.content = "barrier"
        } else {
          cell.content = "empty"
        }
        cell.row = row
        cell.col = col
        cells[row][col] = cell
        cellArray.push(cell)
      } 
    }
    return {cells: cells, cellArray: cellArray, winner: null}
  },

  message: function() {
    if (this.state.winner == "you") {
      return "Good work! You trapped Alex with a fence of toys. Click the board to play again!"
    }
    if (this.state.winner == "alex") {
      return "Oh no! Alex escaped. He is probably rubbing peanut butter on the wall in the other room now. Click the board to play again!"
    }
    return "Alex is trying to escape! Trap him by creating toy barriers."
  },

  handleClick: function(row, col) {
    if (this.state.winner != null) {
      this.setState(this.getInitialState())
    } else {
      if (this.addBarrier(row, col)) {
        this.moveAlex()
      }
    }
  },

  render: function() {
    var gameBoard = this
    return (
      <div>
      <div id="box">
      <div className="gameboard">
      {this.state.cellArray.map(function(cell) {
        return <Cell
        content={cell.content}
        row={cell.row}
        col={cell.col}
        onClick={function() {
          gameBoard.handleClick(cell.row, cell.col)
        }}
        key={"cell" + cell.row + "-" + cell.col}
        />;
      })}
      </div>
      </div>
      <div id="footer">
      <div className="message">
      {this.message()}
      </div>
      </div>
      </div>
    );
  }
})

$(document).ready(function() {

  React.render(
    <GameBoard />,
    document.getElementById("everything")
  );

  console.log("called ready")
})

console.log("escape.jsx loaded")

function t() {
}