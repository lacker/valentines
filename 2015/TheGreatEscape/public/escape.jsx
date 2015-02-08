var Cell = React.createClass({
  render: function() {
    var top = 50 + 50 * this.props.row 
    var left = 50 * this.props.col
    var style = {
      top: "" + top + "px",
      left: "" + left + "px"
    }
    return (
      <div className="cell" style={style}>
      {this.props.content}
      </div>
    );
  }
})

var GameBoard = React.createClass({
  render: function() {
    return (
      <div className="gameboard">
      Hello, world! I am the GameBoard.
      <Cell content="cell 0,0" row={0} col={0}/>
      <Cell content="cell 0,1" row={0} col={1}/>
      <Cell content="cell 1,1" row={1} col={1}/>
      <Cell content="cell 1,0" row={1} col={0}/>
      {this.props.cells}
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

