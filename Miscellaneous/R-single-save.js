/**
 * By Repeat.
 * Changes the save screen to be a bit more standard/intuitive.
 * After you save the game, there's a brief pause and then the save screen closes itself.
 * (New players always seem to struggle with having to close the save screen themselves.)
 * Feel free to edit postSaveHangtime in SingleSaveConfig if the pause is too long/short.
 * 
 * Optional: imo this works well if you have a custom sound effect specifically for saving, like Fire Emblem always does.
 * SingleSaveConfig has options to let you opt into that.
 * 
 * Function(s) overridden without an alias:
 *  * LoadSaveScreen._prepareScreenMemberData
 *  * LoadSaveScreen._moveSave
 */

var SingleSaveConfig = {
    postSaveHangtime: 40, // number of frames to wait after saving before screen closes (60=1 second)
    useUniqueSfxOnSave: false, // should selecting "Yes" to save use unique sfx?
    saveSfxIsRtp: false, // if yes to useUniqueSfxOnSave, is the sound file Runtime or Original?
    saveSfxId: 0 // if yes to useUniqueSfxOnSave, specify the ID of the sound effect to use
};

LoadSaveMode.SAVECOMPLETE = 2;
LoadSaveScreen._currentHangtime = 0;
LoadSaveScreen._prepareScreenMemberData = function (screenParam) {
    this._screenParam = screenParam;
    this._isLoadMode = screenParam.isLoad;
    this._scrollbar = createScrollbarObject(this._getScrollbarObject(), this);
    this._questionWindow = createWindowObject(SaveQuestionWindow, this);
    this._currentHangtime = 0;
}
LoadSaveScreen._moveSave = function () {
    var input;
    var mode = this.getCycleMode();
    var result = MoveResult.CONTINUE;

    if (mode === LoadSaveMode.TOP) {
        input = this._scrollbar.moveInput();
        if (input === ScrollbarInput.SELECT) {
            this._scrollbar.enableSelectCursor(false);
            this._questionWindow.setQuestionActive(true);
            this.changeCycleMode(LoadSaveMode.SAVECHECK);
        }
        else if (input === ScrollbarInput.CANCEL) {
            result = MoveResult.END;
        }
        else {
            this._checkSaveFile();
        }
    } else if (mode === LoadSaveMode.SAVECHECK) {
        if (this._questionWindow.moveWindow() !== MoveResult.CONTINUE) {
            if (this._questionWindow.getQuestionAnswer() === QuestionAnswer.YES) {
                this._executeSave();
                this.changeCycleMode(LoadSaveMode.SAVECOMPLETE);
            } else {
                this._scrollbar.enableSelectCursor(true);
                this.changeCycleMode(LoadSaveMode.TOP);
            }
        }
    } else if (mode === LoadSaveMode.SAVECOMPLETE) {
        if (this._currentHangtime >= SingleSaveConfig.postSaveHangtime) {
            result = MoveResult.END;
        } else {
            this._currentHangtime++;
        }
    }

    return result;
}

var SaveQuestionWindow = defineObject(QuestionWindow, {
    _createScrollbar: function () {
        var arr = [StringTable.QuestionWindow_DefaultCase1, StringTable.QuestionWindow_DefaultCase2];

        this._scrollbar = createScrollbarObject(SaveQuestionScrollbar, this);
        this._scrollbar.setScrollFormation(2, 1);
        this._scrollbar.setObjectArray(arr);
    }
});

var SaveQuestionScrollbar = defineObject(QuestionScrollbar, {
    playSelectSound: function () {
        if (SingleSaveConfig.useUniqueSfxOnSave) {
            if (this.getIndex() === QuestionAnswer.YES) {
                var soundHandle = root.createResourceHandle(
                    SingleSaveConfig.saveSfxIsRtp,
                    SingleSaveConfig.saveSfxId,
                    0, 0, 0
                );

                MediaControl.soundPlay(soundHandle);
            } else {
                MediaControl.soundDirect('commandselect');
            }
        } else {
            MediaControl.soundDirect('commandselect');
        }
    }
});
