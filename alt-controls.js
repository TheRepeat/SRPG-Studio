/* By Repeat.
   Normally, button 2 (CANCEL) does 5 things. Five! 
   Show enemy range, fast forward, fast cursor, unit menu, and cancel are all mapped to the same key. Insanity.
   Me no likey, so this plugin separates those commands.
   CANCEL (BTN2): show enemy range and cancel.
   OPTION (BTN3): unit menu, as usual. What's unique is that it is now the only key that does this.
   SYSTEM (BTN7): handles fast forward like default, but now also handles fast cursor.

   InputControl.isAccelState is a new function. 
   However, the other functions in this plugin override default functions without an alias.
   Be sure this doesn't conflict with other plugins in your project.
*/

(function () {

  // remap Accelerate (fast cursor/fast forward)
  InputControl.isAccelState = function () {
    return root.isInputState(InputType.BTN7);
  }
  MapCursor._isAccelerate = function () {
    return InputControl.isAccelState();
  }

  // disable unit menu for Cancel
  MapEdit._cancelAction = function (unit) {
    if (!this._isMarkingDisabled && InputControl.getInputType() === InputType.NONE) {
      MapLayer.getMarkingPanel().startMarkingPanel();
    }
  }
})();