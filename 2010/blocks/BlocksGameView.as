// The view that shows the blocks game.
package blocks {
import flash.events.Event;
import flash.events.MouseEvent;
import mx.containers.Canvas;
import mx.controls.Alert;
import mx.controls.Label;

import blocks.BlocksGameState;

public class BlocksGameView extends Canvas {
  // The width and height of a single cell
  public static const CELL:int = 40;

  // block_views maps block id to the canvas that shows the block
  private var block_views:Object;
  
  private var state:BlocksGameState;

  public function BlocksGameView(game_state:BlocksGameState) {
    state = game_state;
    width = CELL * BlocksGameState.WIDTH;
    height = CELL * BlocksGameState.HEIGHT;
    setStyle("backgroundColor", "0x000000");
    
    block_views = {};

    state.addEventListener(
      BlocksGameState.UPDATE,
      function(e:Event):void {
        redraw();
      });

    redraw();
  }

  public function redraw():void {
    // The keys are the block ids that were updated
    var updated_blocks:Object = {};

    for each (var column:Array in state.grid) {
      for each (var block:Object in column) {
        if (block == null) {
          continue;
        }
        var block_canvas:Canvas = block_views[block.id];
        if (block_canvas == null) {
          // Create a new canvas for this block
          block_canvas = new Canvas;
          block_views[block.id] = block_canvas;
          block_canvas.width = CELL;
          block_canvas.height = CELL;
          block_canvas.setStyle("cornerRadius", 6);
          block_canvas.setStyle("fontSize", 24);
          if (block.letter == "A") {
            block_canvas.setStyle("backgroundColor", "0xFFAEB9");
          } else {
            block_canvas.setStyle("backgroundColor", "0x62B1F6");
          }
          block_canvas.setStyle("borderColor", "0x000000");
          block_canvas.setStyle("borderStyle", "solid");
          block_canvas.verticalScrollPolicy = "off";
          block_canvas.horizontalScrollPolicy = "off";

          var letter:Label = new Label();
          letter.htmlText = "<b>" + block.letter + "</b>";
          letter.setStyle("horizontalCenter", 0);
          letter.setStyle("verticalCenter", 0);

          block_canvas.addChild(letter);
          addChild(block_canvas);
        }

        block_canvas.x = CELL * block.x;
        block_canvas.y = CELL * block.y;

        updated_blocks[block.id] = true;
      }
    }

    // Remove any old blocks that were not updated
    var old_block_ids:Array = [];
    for (var block_id:String in block_views) {
      if (updated_blocks[block_id] == null) {
        old_block_ids.push(block_id);
      }
    }
    for each (var old_block_id:String in old_block_ids) {
      removeChild(block_views[old_block_id]);
      delete block_views[old_block_id];
    }
  }
}
}