var RADIUS = 5

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

var Cell = React.createClass({
  render: function() {
    var style = {
      top: 50 * this.props.row,
      left: 125 + 50 * this.props.col - 25 * this.props.row,
    }
    if (this.props.content == "barrier") {
      style.backgroundColor = "black"
    }
    if (this.props.content == "alex") {
      style.backgroundColor = "red"
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
    console.log("addBarrier(" + row + "," + col + ")")
    var cell = this.state.cells[row][col]
    if (cell.content != "empty") {
      return false
    }
    cell.content = "barrier"
    this.setState({cells: this.state.cells, cellArray: this.state.cellArray})
    return true
  },

  moveAlex: function() {
    
  },

  getInitialState: function() {
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
    return {cells: cells, cellArray: cellArray}
  },

  render: function() {
    var gameBoard = this
    return (
      <div className="gameboard">
      {this.state.cellArray.map(function(cell) {
        return <Cell
        content={cell.content}
        row={cell.row}
        col={cell.col}
        onClick={function() { gameBoard.addBarrier(cell.row, cell.col) }}
        key={"cell" + cell.row + "-" + cell.col}
        />;
      })}
      </div>
    );
  }
})

var Message = React.createClass({
  render: function() {
    return (
      <div className="message">
      Alex is trying to escape! Trap him by creating toy barriers.
      </div>
    );
  }
})

$(document).ready(function() {

  React.render(
    <GameBoard />,
    document.getElementById("box")
  );

  React.render(
    <Message />,
    document.getElementById("footer")
  );

  console.log("called ready")
})

console.log("escape.jsx loaded")

function t() {
  GameBoard.board.moveAlex()
}