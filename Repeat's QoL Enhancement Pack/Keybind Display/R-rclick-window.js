
// A generic window for showing Yes/No options. Borrowed from SoN.
// It's generalized for any code that needs Y/N choices and really has nothing to do with the rebinding stuff at all, 
// but I'm calling it RclickChoiceWindow in case I use this kind of code for other plugins and don't want to add a potential conflict.
// Just know that its real name is "ChoiceWindow" but it goes by a nickname so as not to confuse everyone else in the room.

var ChoiceShowEventMode = {
    INTERVAL: 0,
    SELECT: 1
};

var RclickChoiceWindow = defineObject(BaseWindow, {
    _choice: false,
    _cycleMode: ChoiceShowEventMode.INTERVAL,
    _data: null,
    _yesNoScrollbar: null,

    setScrollbar: function (dataObject) {
        this._data = dataObject;
        this._yesNoScrollbar = createScrollbarObject(YesNoScrollbar, this);
        this._yesNoScrollbar.setScrollFormation(2, 1);
        this._yesNoScrollbar.setScrollData(dataObject);
        this._yesNoScrollbar.setActive(false);
    },

    moveWindowContent: function () {
        this._yesNoScrollbar.moveInput();
        var mode = this.getCycleMode();

        if (mode === ChoiceShowEventMode.INTERVAL) {
            this._yesNoScrollbar.setActive(true);
            this._yesNoScrollbar.setIndex(1); // default to "No" to help prevent misclicks
            this.changeCycleMode(ChoiceShowEventMode.SELECT);
        }
    
        if (this._yesNoScrollbar.getChoiceMade()) {
            this._choice = this._yesNoScrollbar.getChoice();
            return MoveResult.END;
        }
        return MoveResult.CONTINUE;
    },

    getChoice: function () {
        return this._choice;
    },

    drawWindowContent: function (x, y) {
        var textui = root.queryTextUI('infowindow_title');
        var color = textui.getColor();
        var font = textui.getFont();

        TextRenderer.drawText(x, y, this._data.heading, -1, color, font);

        if (this._data.description) {
            y += 32;
            textui = root.queryTextUI('default_window');
            color = textui.getColor();
            font = textui.getFont();
            TextRenderer.drawText(x, y, this._data.description, -1, color, font);
        }

        this._drawScrollbar(x, y + 32);
    },

    _drawScrollbar: function (x, y) {
        this._yesNoScrollbar.drawScrollbar(x + this.getWindowWidth() / 5, y);
    },

    // Should vary depending on description length
    getWindowWidth: function () {
        var buffer = Math.max((this._data.description.length - 27) * 7, 0);

        return UIFormat.TEXTWINDOW_WIDTH / 3 + buffer;
    },

    getWindowHeight: function () {
        var buffer = 0;
        // assume single-line description for now, might do something neat like with BaseHelpWindow later
        if (this._data.description) {
            buffer = 32;
        }
        return 80 + buffer;
    }
});

var YesNoScrollbar = defineObject(BaseScrollbar, {
    _choiceMade: false,
    _isYesChoice: false,

    setScrollData: function (dataObject) {
        var yesString, noString;
        if (!dataObject.choices) {
            yesString = StringTable.QuestionWindow_DefaultCase1;
            noString = StringTable.QuestionWindow_DefaultCase2;
        } else {
            yesString = dataObject.choices.YES;
            noString = dataObject.choices.NO;
        }
        this.objectSet({ text: yesString });
        this.objectSet({ text: noString });

        this.objectSetEnd();
    },

    drawScrollContent: function (x, y, object, isSelect, index) {
        var textui = root.queryTextUI('select_title');
        var length = -1;
        var color = textui.getColor();
        var font = textui.getFont();

        TextRenderer.drawText(x, y, object.text, length, color, font);
    },

    moveInput: function () {
        var result = BaseScrollbar.moveInput.call(this);

        if (this._isActive && (InputControl.isSelectAction() || this._isScrollbarObjectPressed())) {
            this._choiceMade = true;
            this.selectOption(this.getIndex());
        }

        if (this._isActive && InputControl.isCancelAction()) {
            this._choiceMade = true;
            this.selectOption(this.getIndex());
        }

        return result;
    },

    selectOption: function (index) {
        this._isYesChoice = index === 0;
    },

    getChoiceMade: function () {
        return this._choiceMade;
    },

    getChoice: function () {
        return this._isYesChoice;
    },

    drawDescriptionLine: function (x, y) { },

    getObjectWidth: function () {
        return TitleRenderer.getTitlePartsWidth() * 3;
    },

    getObjectHeight: function () {
        return 16;
    }
});
