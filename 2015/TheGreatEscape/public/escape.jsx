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
      <div className="cell" style={style}>
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
    this.setState({cells: this.state.cells, cellArray: this.state.cellArray})
  },

  getInitialState: function() {
    // Ugly hack
    GameBoard.board = this

    var cells = {}
    var cellArray = []
    for (var row = 0; row <= 10; row++) {
      for (var col = 0; col <= 10; col++) {
        if (col - row >= 6) {
          continue
        }
        if (row - col >= 6) {
          continue
        }
        if (!cells[row]) {
          cells[row] = {}
        }
        var cell = {}
        if (row == 5 && col == 5) {
          cell.content = "alex"
        } else if (Math.random() < 0.1) {
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
    return (
      <div className="gameboard">
      {this.state.cellArray.map(function(cell) {
        return <Cell
        content={cell.content}
        row={cell.row}
        col={cell.col}
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

function addBarrier(row, col) {
  // TODO: implement
}

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

// Test stuff
function t() {
  GameBoard.board.addBarrier(0, 0)
}