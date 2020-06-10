/* By Repeat.
   Normally, button 2 (CANCEL) does 5 things. Five! 
   Show enemy range, fast forward, fast cursor, unit menu, and cancel are all mapped to the same key. Insanity.
   Me no likey, so this plugin separates those commands.
   CANCEL (BTN2): show enemy range and cancel.
   OPTION (BTN3): unit menu, as usual. What's unique is that it is now the only key that does this.
   SYSTEM (BTN7): handles fast forward like default, but now also handles fast cursor.

   InputControl.isAccelState is a new function. 
   SetupEdit._movPosChangeMode uses an alias, so it should be compatible with most other plugins.
   However, the other functions in this plugin override vanilla functions without an alias.
   Be sure this doesn't conflict with other plugins in your project.
   
   WARNING: With this plugin, you will not be able to check units when using mouse controls.
   That means any games using this are basically unplayable with solo-mouse, so if you use this, you'll want to disable your game's mouse controls.
   I do intend to fix this problem.

   Update history:
   5/18/2020: fix so that Cancel still cancels switching units during battle prep
   6/9/2020: fix so that Cancel still shows enemy range during battle prep. It was 1 missing line duuuude
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
    return MapEditResult.MAPCHIPCANCEL;
  }

  // pressing Cancel still cancels when switching units
  var alias1 = SetupEdit._movePosChangeMode;
  SetupEdit._movePosChangeMode = function(){
    if(InputControl.isCancelState()){
      this._targetObj = null;
      this._playCancelSound();
			this._mapEdit.disableMarking(true);
			this.changeCycleMode(SetupEditMode.TOP);
    }
    return alias1.call(this);
  }

})();