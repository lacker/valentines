var GameBoard = React.createClass({
  render: function() {
    return (
      <div className="gameboard">
      Hello, world! I am the GameBoard.
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

