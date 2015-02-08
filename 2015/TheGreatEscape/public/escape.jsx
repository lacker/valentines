var GameBoard = React.createClass({
  render: function() {
    return (
      <div className="gameboard">
      Hello, world! I am the GameBoard.
      </div>
    );
  }
})

$(document).ready(function() {

  React.render(
    <GameBoard />,
    document.getElementById("box")
  );

  console.log("called ready")
})

console.log("escape.jsx loaded")

