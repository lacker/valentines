// The model for the blocks game.
package blocks {
import flash.events.Event;
import flash.events.EventDispatcher;
import flash.utils.setTimeout;
import mx.controls.Alert;
import mx.core.SoundAsset;

public class BlocksGameState extends EventDispatcher {
  [Embed(source="assets/marimba_arpeggio.mp3")]
  [Bindable]
  public static var MarimbaArpeggio:Class;

  // This event is dispatched when anything changes.
  public static const UPDATE:String = "UPDATE";

  // Measured in cells
  public static const HEIGHT:Number = 8;
  public static const WIDTH:Number = 8;

  // How long between game ticks, in seconds
  public static const INITIAL_TICK_TIME:Number = 0.7;
  public static const TICK_TIME_DECAY:Number = 0.95;
  public var tick_time:Number;
  
  // Whether the game is over.
  public var game_over:Boolean;

  // The score
  public var score:int;

  // The total number of blocks this state has made
  private var total_blocks:int;
  
  // An array of arrays that contains the blocks.
  // blocks[x][y] has the keys:
  //   x, y: the coordinates
  //   letter: an A or an N
  //   id: a unique string id
  //   active: whether it is an active block
  // or it is null if there is no block there.
  public var grid:Array;

  // A list of the active blocks.
  public var active:Array;
  
  public function BlocksGameState() {
    game_over = false;
    score = 0;
    total_blocks = 0;
    tick_time = INITIAL_TICK_TIME;
    active = [];
    
    grid = [];
    for (var x:int = 0; x < WIDTH; ++x) {
      var column:Array = [];
      for (var y:int = 0; y < HEIGHT; ++y) {
        column.push(null);
      }
      grid.push(column);
    }
    
    doPhysics();
  }

  private function playArpeggio():void {
    (new MarimbaArpeggio() as SoundAsset).play();
  }
  
  // Returns null if a block cannot be made at that spot.
  private function makeBlock(x:int, y:int):Object {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) {
      return null;
    }
    if (grid[x][y] != null) {
      return null;
    }
    var block:Object = {
      "id": "b" + total_blocks,
      "active": true,
      "x": x,
      "y": y
    };
    ++total_blocks;
    if (Math.random() < 0.5) {
      block.letter = "A";
    } else {
      block.letter = "N";
    }
    grid[x][y] = block;
    return block;
  }

  // Move a block by a delta.
  // Returns whether it was possible to move the block.
  private function moveBlock(block:Object, delta_x:int, delta_y:int):Boolean {
    if (block == null) {
      return false;
    }
    var x:int = block.x + delta_x;
    var y:int = block.y + delta_y;
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) {
      return false;
    }
    if (grid[x][y] != null) {
      return false;
    }
    grid[block.x][block.y] = null;
    grid[x][y] = block;
    block.x = x;
    block.y = y;
    return true;
  }

  // Deactivates a block.
  private function deactivateBlock(block:Object):void {
    block.active = false;
    var new_active:Array = [];
    for each (var b:Object in active) {
      if (b.id != block.id) {
        new_active.push(b);
      }
    }
    active = new_active;
  }

  // Moves the active blocks.
  public function moveActiveBlocks(delta_x:int):void {
    active.sortOn("x");
    if (delta_x > 0) {
      active.reverse();
    }
    for each (var block:Object in active) {
      moveBlock(block, delta_x, 0);
    }
    dispatchEvent(new Event(UPDATE));
  }
  
  // Makes blocks fall.
  // Deactivates active blocks if they can't fall any more.
  // Return whether anything fell.
  private function doFalling():Boolean {
    var anything_fell:Boolean = false;
    for (var x:int = 0; x < WIDTH; ++x) {
      for (var y:int = HEIGHT - 1; y >= 0; --y) {
        var block:Object = grid[x][y];
        if (block == null) {
          continue;
        }
        if (moveBlock(block, 0, 1)) {
          anything_fell = true;
        } else if (block.active) {
          deactivateBlock(block);
        }
      }
    }
    return anything_fell;
  }

  // Handles the user hitting down-arrow.
  public function handleDownArrow():void {
    doFalling();
    dispatchEvent(new Event(UPDATE));
  }
  
  // Checks if the word "anna" exists at the given position, and if
  // so, fills blocks with the blocks that compose it.
  // Does not accept activated blocks.
  private function findSingleAnna(
    start_x:int, start_y:int, delta_x:int, delta_y:int, output:Array):void {
    var goal:Array = ["A", "N", "N", "A"];
    var possible:Array = [];
    for (var i:int = 0; i < goal.length; ++i) {
      var x:int = start_x + i * delta_x;
      var y:int = start_y + i * delta_y;
      if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) {
        return;
      }
      var block:Object = grid[x][y];
      if (block == null) {
        return;
      }
      if (block.active) {
        return;
      }
      if (block.letter != goal[i]) {
        return;
      }
      possible.push(block);
    }

    // We did find a match
    score += 1;
    playArpeggio();
    tick_time *= TICK_TIME_DECAY;
    for each (var b:Object in possible) {
      output.push(b);
    }
  }
  
  // Removes any blocks that spell "anna".
  // Only works on deactivated blocks.
  // Returns whether anything was removed.
  private function removeAnnas():Boolean {
    var to_destroy:Array = [];
    for (var x:int = 0; x < WIDTH; ++x) {
      for (var y:int = 0; y < HEIGHT; ++y) {
        findSingleAnna(x, y, 0, 1, to_destroy);
        findSingleAnna(x, y, 1, 0, to_destroy);
      }
    }
    if (to_destroy.length == 0) {
      return false;
    }

    // Remove the blocks
    for each (var block:Object in to_destroy) {
      grid[block.x][block.y] = null;
    }
    return true;
  }
  
  // Do everything that happens in one time step.
  private function doOneTimeStep():void {
    if (doFalling()) {
      return;
    }

    if (removeAnnas()) {
      return;
    }
    
    if (active.length == 0) {
      // We need to create new active blocks.
      var sizes:Array = [1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 4];
      var num_new_blocks:int = sizes[int(Math.random() * sizes.length)];
      for (var i:int = 0; i < num_new_blocks; ++i) {
        var new_block:Object = makeBlock(3 + i, 0);
        if (new_block == null) {
          // The game is over.
          Alert.show("Game over. You made " + score + " Annas!");
          game_over = true;
          return;
        }
        active.push(new_block);
      }
      return;
    }

    // Control should never get here, because either falling should
    // happen or there should be no active blocks.
    Alert.show("Oops, there's a bug.");
  }

  // The callback that handles physics.
  private function doPhysics():void {
    doOneTimeStep();
    dispatchEvent(new Event(UPDATE));
    if (!game_over) {
      setTimeout(doPhysics, 1000 * tick_time);
    }
  }
}
}