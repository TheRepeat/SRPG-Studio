/**
 * By Repeat.
 * Shows the current difficulty in the save/load screen, including the difficulty's icon if applicable.
 * Also fiddles with the position of the colons in the Play Time lines since they're way off in vanilla.
 * 
 * Optional: give your difficulty the custom parameter {nameColor: <hex value>} to change the color of your difficulty's name on the save/load screen.
 * Example:
    {nameColor: 0xce7aff}
 * This gives a nice purple color.
 * You can google any kind of hex color picker online to find your own hex color values. Sometimes they'll be formatted like #123456 instead of 0x123456 - the custom parameter MUST start with 0x, not #.
 */

(function () {
    var alias1 = SaveFileDetailWindow._configureSentence;
    SaveFileDetailWindow._configureSentence = function (groupArray) {
        alias1.call(this, groupArray);

        groupArray.appendObject(LoadSaveSentence.Difficulty);
    }
})();

DIFFICULTY_STRING = 'Difficulty';

LoadSaveSentence.Difficulty = defineObject(BaseLoadSaveSentence, {
    _difficulty: null,
    _iconHandle: null,

    setSaveFileInfo: function (saveFileInfo) {
        this._difficulty = saveFileInfo.getDifficulty();
        this._iconHandle = this._difficulty.getIconResourceHandle();
    },

    drawLoadSaveSentence: function (x, y) {
        var textui = this._getSentenceTextUI();
        var color = textui.getColor();
        var font = textui.getFont();
        var difficulty = this._difficulty;
        var handle = this._iconHandle;
        var difficultyColor = ColorValue.KEYWORD;

        if (difficulty.custom.nameColor) {
            difficultyColor = difficulty.custom.nameColor;
        }

        this._drawTitle(x, y);

        TextRenderer.drawKeywordText(x + 70, y + 18, DIFFICULTY_STRING, -1, color, font);

        x += 180;

        x += this._detailWindow.isSentenceLong() ? 20 : 0;

        if (!handle.isNullHandle()) {
            GraphicsRenderer.drawImage(x - GraphicsFormat.ICON_WIDTH, y + 18, handle, GraphicsType.ICON);
        }

        TextRenderer.drawKeywordText(x, y + 18, difficulty.getName(), -1, difficultyColor, font);
    }
});

ContentRenderer.drawPlayTime = function (x, y, time) {
    var i;
    var arr = [, ,];
    var count = arr.length;
    var dx = 8;
    var font = TextRenderer.getDefaultFont();

    arr[0] = Math.floor(time / 3600);
    arr[1] = Math.floor((time / 60) % 60);
    arr[2] = time % 60;

    for (i = 0; i < count; i++) {
        NumberRenderer.drawNumber(x, y, arr[i] / 10);
        NumberRenderer.drawNumber(x + dx, y, arr[i] % 10);

        x += 16;

        if (i < count - 1) {
            // fiddled with x and y since the colons were really askew 
            TextRenderer.drawText(x + 2, y + 3, ':', -1, ColorValue.DEFAULT, font);
            x += dx;
        }
    }
}