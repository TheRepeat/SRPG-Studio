/**
 * By Repeat.
 * Part of the rebinding plugin. Miscellaneous top/bottom windows used for heading and helper text respectively.
 */

 var TopRebindWindow = defineObject(BaseWindow, {

    drawWindowContent: function (x, y) {
        var font = root.getBaseData().getFontList().getDataFromId(1); // "Title" font
        var color = ColorValue.KEYWORD;
        var length = -1;
        var heading = KeybindStrings.HEADING;

        TextRenderer.drawText(x + 16, y, heading, length, color, font);
    },

    getWindowWidth: function () {
        return 600;
    },

    getWindowHeight: function () {
        return 56;
    },

    getWindowTextUI: function () {
        return root.queryTextUI('face_window');
    }
});

var BottomRebindWindow = defineObject(BaseWindow, {
    _text: '',

    setHelpText: function (text) {
        this._text = text;
    },

    drawWindowContent: function (x, y) {
        var textui = this.getWindowTextUI();
        var color = textui.getColor();
        var font = textui.getFont();
        var length = -1;

        var text = this.chunkHelpText(this._text);
        TextRenderer.drawText(x, y - 2, text, length, color, font);
    },

    chunkHelpText: function (str) {
        var chunkedStringArr = str.match(/.{1,84}(\s|$)/g);
        this._stringChunks = chunkedStringArr.length;

        return chunkedStringArr.join('\n');
    },

    getWindowWidth: function () {
        return 600;
    },

    getWindowHeight: function () {
        return 64;
    }
});
