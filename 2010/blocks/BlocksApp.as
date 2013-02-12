// A game with blocks and letters and you have to spell "anna".
package blocks {
import flash.events.Event;
import flash.events.KeyboardEvent;
import flash.events.MouseEvent;
import mx.containers.Canvas;
import mx.controls.Alert;
import mx.controls.Button;
import mx.controls.Label;
import mx.core.Application;
import mx.events.FlexEvent;

public class BlocksApp extends Application {
  // The canvas in which everything is positioned
  private var outer_canvas:Canvas;

  // Model
  private var game_state:BlocksGameState;
  
  // View
  private var game_view:BlocksGameView;
  
  public function BlocksApp() {
    addEventListener(FlexEvent.APPLICATION_COMPLETE, onReady);
  }

  private function onReady(event:FlexEvent):void {
    setupLayout();
  }

  private function setupLayout():void {
    // Lay out views
    outer_canvas = new Canvas;
    outer_canvas.percentWidth = 100;
    outer_canvas.percentHeight = 100;
    outer_canvas.setStyle("backgroundColor", "0xffffff");
    addChild(outer_canvas);

    var instruction_label:Label = new Label;
    instruction_label.x = 10;
    instruction_label.y = 10;
    instruction_label.setStyle("fontSize", 16);
    instruction_label.htmlText = "use the arrow keys to spell Anna";
    outer_canvas.addChild(instruction_label);

    var play_button:Button = new Button;
    play_button.x = 10;
    play_button.y = 45;
    play_button.label = "play";
    play_button.width = 100;
    play_button.height = 30;
    play_button.addEventListener(
      MouseEvent.CLICK,
      function(e:MouseEvent):void {
        newGame();
      });
    addChild(play_button);

    stage.addEventListener(KeyboardEvent.KEY_DOWN, handleKeyDown);
  }

  private function handleKeyDown(e:KeyboardEvent):void {
    if (game_state == null || game_state.game_over) {
      return;
    }
    if (e.keyCode == 37) {
      // Left arrow
      game_state.moveActiveBlocks(-1);
      return;
    }
    if (e.keyCode == 39) {
      // Right arrow
      game_state.moveActiveBlocks(1);
      return;
    }
    if (e.keyCode == 40) {
      // Down arrow
      game_state.handleDownArrow();
    }
  }
  
  private function newGame():void {
    if (game_view != null) {
      game_view.parent.removeChild(game_view);
      game_view = null;
    }

    game_state = new BlocksGameState;
    game_view = new BlocksGameView(game_state);
    game_view.x = 10;
    game_view.y = 85;
    addChild(game_view);
  }
}
}