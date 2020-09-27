/*  By Repeat.
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

    Update history:
    5/18/2020: fix so that Cancel still cancels switching units during battle prep
    6/9/2020: fix so that Cancel still shows enemy range during battle prep. It was 1 missing line duuuude
    9/26/2020: 
            * mouse control bugfix: rclick's functionality is restored to vanilla.
            * Also fixed the damn spacing here, who tf indents with 2 spaces instead of 4?
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
    var alias1 = MapEdit._cancelAction;
    MapEdit._cancelAction = function (unit) {
        // Mouse controls unchanged from vanilla
        if (root.isMouseAction(MouseType.RIGHT)) {
            return alias1.call(this, unit);
        }
        if (!this._isMarkingDisabled && InputControl.getInputType() === InputType.NONE) {
            MapLayer.getMarkingPanel().startMarkingPanel();
        }
        return MapEditResult.MAPCHIPCANCEL;
    }

    // pressing Cancel still cancels when switching units 
    // TODO: it removes enemy range checking during battle prep, fix that
    var alias2 = SetupEdit._movePosChangeMode;
    SetupEdit._movePosChangeMode = function () {
        if (InputControl.isCancelState()) {
            this._targetObj = null;
            this._playCancelSound();
            this._mapEdit.disableMarking(true);
            this.changeCycleMode(SetupEditMode.TOP);
        }
        return alias2.call(this);
    }

})();