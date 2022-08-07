/**
 * By Repeat.
 * Special control character logic.
 * Adds the ability to shake a line of dialogue and the ability to rainbowify a line of dialogue.
 * 
 * To use text shake: put \sh[n] anywhere on a line, where n is an integer representing the violence of the shake. 1 is the lowest.
 *  * Example: \sh[3]Oh man I'm very sad or angry or scared!
 * 
 * To use rainbowify: put \rb anywhere on a line of dialogue.
 *  * Example: \rbYou just won a free iPad!! Click here to claim!!
 * 
 * Functions overridden without an alias:
 *  * CoreAnalyzer.drawCoreAnalyzer
 */

(function () {
    var alias1 = TextParser._configureVariableObject;
    TextParser._configureVariableObject = function (groupArray) {
        alias1.call(this, groupArray);

        // Original control characters
        groupArray.appendObject(ControlVariable.Shake);
        groupArray.appendObject(ControlVariable.Rainbow);
    }
})();

function getRandomNum(min, max) {
    return Math.random() * (max - min) + min
}

CoreAnalyzer._textColorIndex = 0;
CoreAnalyzer._deltaTime = 0; // oh yeah this some bullet hell shit

CoreAnalyzer.drawCoreAnalyzer = function (xStart, yStart) {
    var i, j;
    var drawInfo, textLine, count2;
    var count = this._textLineArray.length;

    for (i = 0; i < count; i++) {
        textLine = this._textLineArray[i];

        // formattedText is not initialized, it means that drawing effect (change colors etc.)
        // doesn't occur for the one line which will be drawn from now, so simply call the draw method.

        if (textLine.formattedText === null) {
            root.getGraphicsManager().drawCharText(xStart, yStart, textLine.text, textLine.currentIndex,
                this._parserInfo.defaultColor, 255, this._parserInfo.defaultFont);

            yStart += this.getCharSpaceHeight();
            continue;
        }

        // If drawFormattedText is called, the text is all drawn.
        // So define the range to draw in advance.
        textLine.formattedText.setValidArea(0, textLine.currentIndex);

        // Decide the default text color in the range to draw.
        textLine.formattedText.setColorAlpha(0, textLine.currentIndex, this._parserInfo.defaultColor, 255);

        // setColor etc. is called in checkDrawInfo, so set the necessary information.
        drawInfo = {};
        drawInfo.formattedText = textLine.formattedText;
        drawInfo.baseIndex = textLine.baseIndex;
        drawInfo.defaultColor = this._parserInfo.defaultColor;
        drawInfo.defaultFont = this._parserInfo.defaultFont;

        // new parameters for drawInfo
        drawInfo.shakeStrength = 0;
        drawInfo.isRainbow = false;

        // It includes the control character which may be positioned at the end of the text, so add +1.
        count2 = textLine.text.length + 1;
        for (j = 0; j < count2; j++) {
            this._textParser.checkDrawInfo(j + textLine.baseIndex, drawInfo);
        }

        // text shaking shakes the whole line since I don't have control of the text on a per-char basis
        var xFinal = xStart
        var yFinal = yStart;
        if (drawInfo.shakeStrength) {
            xFinal = xStart + getRandomNum(0, drawInfo.shakeStrength);
            yFinal = yStart + getRandomNum(0, drawInfo.shakeStrength);
        }

        // ditto for the rainbow stuff
        if (drawInfo.isRainbow) {
            drawInfo.formattedText.setColorAlpha(0, textLine.currentIndex, this._getColor(this._textColorIndex), 255);

            if (this._deltaTime % 10 === 0) {
                this._textColorIndex++;
                if (this._textColorIndex >= 7) {
                    this._textColorIndex = 0;
                }
            }

            this._deltaTime++;
        }

        textLine.formattedText.drawFormattedText(xFinal, yFinal, 0x0, 0);

        yStart += this.getCharSpaceHeight();
    }
}

CoreAnalyzer._getColor = function (colorIndex) {
    // ROYGBIV
    var colors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];

    return colors[colorIndex];
}

// Text shakes nervously. Affects the whole line.
ControlVariable.Shake = defineObject(BaseControlVariable, {
    checkDrawInfo: function (index, objectArray, drawInfo) {
        var obj = this.getObjectFromIndex(index, objectArray, this);

        if (obj === null) {
            return;
        }

        drawInfo.shakeStrength = obj.sig;
    },

    getKey: function () {
        var key = /\\sh\[(\d+)\]/;

        return key;
    },

    isDrawingObject: function () {
        return true;
    }
});

// Line shifts between colors in the order of ROYGBIV.
ControlVariable.Rainbow = defineObject(BaseControlVariable, {
    checkDrawInfo: function (index, objectArray, drawInfo) {
        var obj = this.getObjectFromIndex(index, objectArray, this);

        if (obj === null) {
            return;
        }

        drawInfo.isRainbow = true;
    },

    getKey: function () {
        var key = /\\rb/;

        return key;
    },

    isDrawingObject: function () {
        return true;
    }
});
