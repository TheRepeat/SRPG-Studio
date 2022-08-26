/**
 * By Repeat.
 * Objective Window v2.0.
 * 
 * Directions:
 * Call Execute Script -> select Execute Code
        MapParts.Objective.changeObjective(text, type, value1, value2)
         * Arguments type, value1, and value2 are optional. See below.

 * Supports extra UI for certain types of objectives if the second argument, "type", is included.
 * Types (arg 2):
 * 0: NORMAL, just show text. This is the default and doesn't need the "type" argument.
 * 1: ROUT, checks remaining enemies on the field
 * 2: TURNS, requires third argument, value1, to know what number to count down from
 * 3: ESCAPE, checks remaining players on the field
 * 4: KILLS, count increases with each death. Third argument, value1, determines what deaths it counts
 *      0 (default): all deaths count
 *      1: only enemy deaths count
 *      2: only player deaths count (ominous)
 *      3: only ally deaths count
 * 5: CUSTOM: a custom number is displayed based on value1. Fourth argument, value2, decides what the number means.
 *      0 (default): set custom number equal to the third argument.
 *      1: add third argument to the current custom number.
 *      2: subtract third argument from the current custom number.
 * 
 * You can edit the strings such as "Last Turn" in R-objective-enum.js.
 * 
 * Examples:
        MapParts.Objective.changeObjective('Seize throne');
        MapParts.Objective.changeObjective('Rout the enemy', 1);
        MapParts.Objective.changeObjective('Defend for 12 turns', 2, 12);
        MapParts.Objective.changeObjective('Kill lots of enemies', 4, 1);

        MapParts.Objective.changeObjective('Seize multiple thrones', 5, 4); 
            -> shows "Count: 4" below text
        MapParts.Objective.changeObjective('Seize multiple thrones', 5, 1, 2); 
            -> subtracts 1, now shows "Count: 3" below text
*/

MapParts.Objective = defineObject(BaseMapParts, {
    _objectiveStr: '',
    _type: ObjectiveType.NORMAL,
    _count: 1,
    _enemiesLeft: 0,
    _turnsLeft: 0,
    _playersLeft: 0,
    _kills: 0,
    _killType: 0,
    _customValue: 0,

    // updates at the end of every unit action
    updateUnitCount: function () {
        this._enemiesLeft = EnemyList.getAliveList().getCount();
        this._playersLeft = PlayerList.getSortieList().getCount();

        this.updateKillCounter();
    },

    // updates at the start of every player phase
    updateTurnsLeft: function () {
        if (this._turnsLeft > 0) {
            this._turnsLeft--;
        }
    },

    updateKillCounter: function () {
        var playerDeaths = PlayerList.getDeathList().getCount();
        var enemyDeaths = EnemyList.getDeathList().getCount();
        var allyDeaths = AllyList.getDeathList().getCount();
        switch (this._killType) {
            case KillCountType.ALL:
                this._kills = playerDeaths + enemyDeaths + allyDeaths;
                break;
            case KillCountType.ENEMYONLY:
                this._kills = enemyDeaths;
                break;
            case KillCountType.PLAYERONLY:
                this._kills = playerDeaths;
                break;
            case KillCountType.ALLYONLY:
                this._kills = allyDeaths;
                break;
        }
    },

    // user input
    changeObjective: function (text, type, value1, value2) {
        this._objectiveStr = text;

        if (type) {
            this._type = type;
            this._count = 2;
        } else {
            this._count = 1;
            this._type = ObjectiveType.NORMAL;
        }

        if (value1) {
            // it'd be cleaner to reuse the same property for all, something like _value1, but that's less readable so I won't
            switch (type) {
                case ObjectiveType.TURNS:
                    this._turnsLeft = value1;
                    break;
                case ObjectiveType.KILLS:
                    this._killType = value1;
                    break;
                case ObjectiveType.CUSTOM:
                    var type = 0;
                    if (value2) {
                        type = value2;
                    }
                    this.setCustomMapValue(value1, type);
                    break;
            }

        }
    },

    setCustomMapValue: function (newVal, type) {
        var map = root.getCurrentSession().getCurrentMapInfo();

        // treat as 0 if not already valid
        if (!map.custom.customObjectiveValue) {
            map.custom.customObjectiveValue = 0;
        }

        switch (type) {
            case CustomArgType.SET:
                map.custom.customObjectiveValue = newVal;
                break;
            case CustomArgType.ADD:
                map.custom.customObjectiveValue += newVal;
                break;
            case CustomArgType.SUB:
                map.custom.customObjectiveValue -= newVal;
                break;
        }
        this._customValue = map.custom.customObjectiveValue;
    },

    drawMapParts: function () {
        var text = this._getText();
        var x = this._getPositionX(text);
        var y = this._getPositionY();

        if (this._objectiveStr !== '') {
            this._drawMain(x, y);
        }
    },

    _drawMain: function (x, y) {
        var text = this._getText();
        var width = this._getWindowWidth(text);
        var height = this._getWindowHeight();
        var textui = this._getWindowTextUI();
        var pic = textui.getUIImage();

        WindowRenderer.drawStretchWindow(x, y, width, height, pic);

        x += this._getWindowXPadding() + 2;
        y += this._getWindowYPadding();
        this._drawContent(x, y, text);

        y += this._getWindowYPadding() * 1.5;

        switch (this._type) {
            case ObjectiveType.NORMAL:
                break;
            case ObjectiveType.ROUT:
                this._drawBottomSection(x, y, this._enemiesLeft, ObjectiveStrings.LEFT);
                break;
            case ObjectiveType.TURNS:
                this._drawBottomSection(x, y, this._turnsLeft, ObjectiveStrings.LEFT);
                break;
            case ObjectiveType.ESCAPE:
                this._drawBottomSection(x, y, this._playersLeft, ObjectiveStrings.LEFT);
                break;
            case ObjectiveType.KILLS:
                this._drawBottomSection(x, y, this._kills, ObjectiveStrings.KILLS);
                break;
            case ObjectiveType.CUSTOM:
                this._drawBottomSection(x, y, this._customValue, ObjectiveStrings.CUSTOM);
                break;
        };
    },

    _drawContent: function (x, y, text) {
        var textui = this._getWindowTextUI();
        var font = textui.getFont();
        var color = textui.getColor();
        var length = this._getTextLength(text);

        TextRenderer.drawText(x, y, text, length, color, font);
    },

    _drawBottomSection: function (x, y, value, text) {
        var textui = this._getWindowTextUI();
        var font = textui.getFont();
        var color = textui.getColor();
        var length = -1;

        if (this._type !== ObjectiveType.TURNS || this._turnsLeft > 1) {
            TextRenderer.drawText(x, y, text, length, color, font)
            x += this._getWindowXPadding() * 3;
            NumberRenderer.drawRightNumber(x, y - 3, value);
        } else {
            color = 0x4deb77;
            TextRenderer.drawText(x, y, ObjectiveStrings.LASTTURN, length, color, font);
        }
    },

    _getText: function () {
        return this._objectiveStr;
    },

    _getTextLength: function (text) {
        return this._getWindowWidth(text) - DefineControl.getWindowXPadding();
    },

    _getPositionX: function (text) {
        var dx = LayoutControl.getRelativeX(10) - 54;

        return root.getGameAreaWidth() - this._getWindowWidth(text) - dx;
    },

    _getPositionY: function () {
        var x = LayoutControl.getPixelX(this.getMapPartsX());
        var dx = root.getGameAreaWidth() / 2 + 16; // without the +16, it flickers rapidly if MarkyJoe's smooth scroll plugin is active
        var y = LayoutControl.getPixelY(this.getMapPartsY());
        var dy = root.getGameAreaHeight() / 2 + 16; // ditto
        var yBase = LayoutControl.getRelativeY(10) - 28;

        if (y < dy && x > dx) {
            return root.getGameAreaHeight() - this._getWindowHeight() - yBase;
        }
        else {
            return yBase;
        }
    },

    _getWindowXPadding: function () {
        return DefineControl.getWindowXPadding();
    },

    _getWindowYPadding: function () {
        return DefineControl.getWindowYPadding();
    },

    _getWindowWidth: function (text) {
        var textPadding = 50 - text.length;
        if (textPadding < 10) {
            textPadding = 10;
        }
        return text.length * 7.5 + textPadding;
    },

    _getWindowHeight: function () {
        return 30 + (this.getIntervalY() * this._count);
    },

    _getWindowTextUI: function () {
        return root.queryTextUI('default_window');
    }
});
