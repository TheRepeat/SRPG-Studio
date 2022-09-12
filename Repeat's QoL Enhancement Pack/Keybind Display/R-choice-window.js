/**
 * By Repeat.
 * A generic window for showing choices.
 * The original version of this window made for Seas of Novis only used Yes/No choices, but this requires 3.
 *  1. Confirm choices (closes this & rebind windows)
 *  2. Revert choices (closes this & resets keybinds to previous)
 *  3. Continue editing (just closes this)
 * None of that logic is in this file - it only needs to say which option was chosen.
 */

var ChoiceType = {
    CONFIRM: 0,
    REVERT: 1,
    CLOSE: 2
};

var RebindChoiceWindow = defineObject(BaseWindow, {
    _choiceScrollbar: null,
    _choice: false,
    _data: null,        // obj: contains heading text and description text
    _choices: null,     // arr: contains the strings for all choices
    _stringChunks: 1,   // the number of lines used by the description text (minimum 1)

    setScrollbar: function (dataObject) {
        this._data = dataObject;
        this._choices = dataObject.choices;
        this._choiceScrollbar = createScrollbarObject(ChoiceScrollbar, this);

        this._choiceScrollbar.setScrollFormation(3, 1);
        this._choiceScrollbar.setScrollData(this._choices);
        this._choiceScrollbar.setActive(false);
    },

    openWindow: function () {
        this._choiceScrollbar.setActive(true);
        this._choiceScrollbar.setIndex(2); // initialize the cursor on "keep editing" to help prevent misclicks
    },

    closeWindow: function () {
        this._choiceScrollbar.setActive(false);
    },

    moveWindowContent: function () {
        this._choiceScrollbar.moveInput();

        if (this._choiceScrollbar.getChoiceMade()) {
            this._choice = this._choiceScrollbar.getChoice();
            return MoveResult.END;
        }

        /**
         * Note for posterity:
         * There used to be a bug where this condition would be reached as soon as the window opened, closing it instantly
         * and making this whole window worthless (and the rebind window inescapable). I fixed it when I moved the choice window 
         * logic to its own move function, _moveChoiceWindow, which *returns* MoveResult.END instead of breaking and continuing 
         * when cancel is pressed.
         * Not the first time I've run into this bug nor will it be the last, so I'm writing it down here so I can remember how I beat this.
         */
        if (InputControl.isCancelAction()) {
            this._choice = ChoiceType.CLOSE;
            return MoveResult.END;
        }

        return MoveResult.CONTINUE;
    },

    // getter so the rebind window can see the choice
    getChoice: function () {
        return this._choice;
    },

    drawWindowContent: function (x, y) {
        var textui = root.queryTextUI('infowindow_title');
        var color = textui.getColor();
        var font = textui.getFont();
        var data = this._data;

        x += 4;

        TextRenderer.drawText(x, y, data.heading, -1, color, font);

        if (data.description) {
            var desc = this.splitDescString(data.description);
            y += 32;
            textui = root.queryTextUI('default_window');
            color = textui.getColor();
            font = textui.getFont();
            TextRenderer.drawText(x, y, desc, -1, color, font);
        }

        y += (this._stringChunks - 1) * 16 + 32;

        this._drawScrollbar(x, y);
    },

    _drawScrollbar: function (x, y) {
        this._choiceScrollbar.drawScrollbar(x, y);
    },

    getWindowWidth: function () {
        return 400;
    },

    getWindowHeight: function () {
        var buffer = 0;
        if (this._data.description) {
            buffer = (this._stringChunks - 1) * 16 + 32;
        }
        return 80 + buffer;
    },

    // I feel like nobody's actually gonna use a description but w/e
    splitDescString: function (str) {
        var chunkedStringArr = str.match(/.{1,52}(\s|$)/g);
        this._stringChunks = chunkedStringArr.length;

        return chunkedStringArr.join('\n');
    },

    _playCancelSound: function () {
        var soundHandle = root.querySoundHandle('commandcancel');
        MediaControl.soundPlay(soundHandle);
    },

    _playMenuTargetChangeSound: function () {
        MediaControl.soundDirect('menutargetchange');
    },

    getWindowTextUI: function () {
        return root.queryTextUI('face_window');
    }
});

var ChoiceScrollbar = defineObject(BaseScrollbar, {
    _choiceMade: false,
    _choice: null,

    setScrollData: function (choices) {
        for (var i = 0; i < choices.length; i++) {
            this.objectSet({ text: choices[i] });
        }

        this.objectSetEnd();
    },

    drawScrollContent: function (x, y, object, isSelect, index) {
        var textui = root.queryTextUI('default_window');
        var length = -1;
        var font = textui.getFont();

        TextRenderer.drawText(x, y, object.text, length, ColorValue.INFO, font);
    },

    moveInput: function () {
        var result = BaseScrollbar.moveInput.call(this);

        if (this._isActive && (InputControl.isSelectAction() || this._isScrollbarObjectPressed())) {
            this._choiceMade = true;
            this.selectOption(this.getIndex());
        }

        return result;
    },

    selectOption: function (index) {
        this._choice = index; // 0, 1, 2 - see the enum at the top
    },

    getChoiceMade: function () {
        return this._choiceMade;
    },

    getChoice: function () {
        return this._choice;
    },

    drawDescriptionLine: function (x, y) { },

    getObjectWidth: function () {
        return 128;
    },

    getObjectHeight: function () {
        return 16;
    }
});
