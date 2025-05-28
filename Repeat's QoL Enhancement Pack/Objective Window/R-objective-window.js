/**
 * By Repeat.
 * Objective Window v3.1.
 * 
 * Directions:
 * Call Execute Script -> select Execute Code
        setObjective(text, type, value1, value2)
         * Arguments type, value1, and value2 are optional. See below.

 * Supports extra UI for certain types of objectives if the second argument, "type", is included.
 * Types (arg 2):
 * 0: NORMAL, just show text. This is the default and doesn't need the "type" argument.
 * 1: ROUT, checks remaining enemies on the field
 * 2: TURNS, requires 3rd argument, value1, to know what number to count down from
 * 3: ESCAPE, checks remaining players on the field
 * 4: KILLS, count increases with each death. Third argument, value1, determines what deaths it counts
 *      Valid values for value1, the 3rd argument:
 *      0 (default): all deaths count
 *      1: only enemy deaths count
 *      2: only player deaths count (ominous)
 *      3: only ally deaths count
 *      (Refer to the values of KillCountType.)
 * 5: CUSTOM: a custom number is displayed based on value1. Fourth argument, value2, decides what the number means.
 *      Valid values for value2, the 4th argument:
 *      0 (default): set custom number equal to the third argument.
 *      1: add third argument to the current custom number.
 *      2: subtract third argument from the current custom number.
 *      (Refer to the values of CustomArgType.)
 * 
 * You can edit the strings such as "Last Turn" in R-objective-enum.js.
 * 
 * Examples:
        setObjective('Seize throne');
        setObjective('Rout the enemy', 1);
        setObjective('Defend for 12 turns', 2, 12);
        setObjective('Kill lots of enemies', 4, 1);

        setObjective('Seize all thrones', 5, 4); 
            -> shows "Count: 4" below text
        setObjective('Seize all thrones', 5, 1, 2); 
            -> subtracts 1: now shows "Count: 3" below text
*/

// shorthand function for user input
function setObjective(text, type, value1, value2) {
    MapParts.Objective.changeObjective(text, type, value1, value2);
}

MapParts.Objective = defineObject(BaseMapParts, {
    // updates at the end of every unit action
    updateUnitCount: function () {
        this.setMapValue('enemiesLeft', EnemyList.getAliveList().getCount());
        this.setMapValue('playerCount', PlayerList.getSortieList().getCount());

        this.updateKillCounter();
    },

    // updates at the start of every player phase
    updateTurnsLeft: function () {
        var turnsLeft = this.getMapValue('turnsLeft');

        if (turnsLeft > 0) {
            turnsLeft--;
        }

        this.setMapValue('turnsLeft', turnsLeft);
    },

    updateKillCounter: function () {
        var playerDeaths = PlayerList.getDeathList().getCount(); // <- does this work right? test if this includes player deaths from previous maps
        var enemyDeaths = EnemyList.getDeathList().getCount();
        var allyDeaths = AllyList.getDeathList().getCount();
        var kills = 0;

        switch (this.getMapValue('killType')) {
            case KillCountType.ALL:
                kills = playerDeaths + enemyDeaths + allyDeaths;
                break;
            case KillCountType.ENEMYONLY:
                kills = enemyDeaths;
                break;
            case KillCountType.PLAYERONLY:
                kills = playerDeaths;
                break;
            case KillCountType.ALLYONLY:
                kills = allyDeaths;
                break;
        }

        this.setMapValue('kills', kills);
    },

    changeObjective: function (text, type, value1, value2) {
        if (type) {
            this.setMapValue('type', type);
        } else {
            this.setMapValue('type', ObjectiveType.NORMAL);
        }

        this.setMapValue('string', text);

        if (value1) {
            // it'd be cleaner to reuse the same property for all, something like _value1, but that's less readable so I won't
            switch (type) {
                case ObjectiveType.TURNS:
                    this.setMapValue('turnsLeft', value1);

                    break;
                case ObjectiveType.KILLS:
                    this.setMapValue('killType', value1);

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

    /**
     * 
     * @param {String} parameterSubstring the value to follow objective__ in the map custom parameter
     * Valid values:
     *   string - main string
     *   type - what kind of objective. int value from the ObjectiveType enum
     *   enemiesLeft - rout
     *   turnsLeft - survive
     *   playerCount - escape
     *   kills - FE10 3-F
     *   killType - whose deaths are we trackin here? int value from the KillCountType enum
     *   customValue - numerical value for custom objectives
     * @param {*} value the value to set for the thing being tracked. could be a string or a number, depending on the substring (ily javascript)
     */
    setMapValue: function (parameterSubstring, value) {
        var validValues = [
            'string',
            'type',
            'enemiesLeft',
            'turnsLeft',
            'playerCount',
            'kills',
            'killType',
            'customValue'
        ];

        if (validValues.indexOf(parameterSubstring) !== '-1') {
            var map = root.getCurrentSession().getCurrentMapInfo();
            var mapParameter = 'objective__' + parameterSubstring;

            map.custom[mapParameter] = value;
        } else {
            root.msg('invalid value for the setter: ' + parameterSubstring);
        }
    },

    /**
     * 
     * @param {String} parameterSubstring the value to follow objective__ in the map custom parameter
     * Valid values:
     *   string - objective text
     *   type - what kind of objective. int value from the ObjectiveType enum
     *   enemiesLeft - rout
     *   turnsLeft - survive
     *   playerCount - escape
     *   kills - FE10 3-F
     *   killType - whose deaths are we trackin here? int value from the KillCountType enum
     *   customValue - numerical value for custom objectives
     */
    getMapValue: function (parameterSubstring) {
        var validValues = [
            'string',
            'type',
            'enemiesLeft',
            'turnsLeft',
            'playerCount',
            'kills',
            'killType',
            'customValue'
        ];

        if (validValues.indexOf(parameterSubstring) !== '-1') {
            var map = root.getCurrentSession().getCurrentMapInfo();
            var mapParameter = 'objective__' + parameterSubstring;
            var defaultValue = parameterSubstring === 'string' ? '' : 0;

            return map.custom[mapParameter] || defaultValue;
        } else {
            root.msg('invalid value for the getter: ' + parameterSubstring);
        }
    },

    setCustomMapValue: function (newVal, type) {
        var customValue = this.getMapValue('customValue');

        // treat as 0 if not already valid
        if (!customValue) {
            customValue = 0;
        }

        switch (type) {
            case CustomArgType.SET:
                customValue = newVal;
                break;
            case CustomArgType.ADD:
                customValue += newVal;
                break;
            case CustomArgType.SUB:
                customValue -= newVal;
                break;
        }

        this.setMapValue('customValue', customValue);
    },

    drawMapParts: function () {
        var text = this.getMapValue('string');
        var x = this._getPositionX(text);
        var y = this._getPositionY();

        if (text !== '') {
            this._drawMain(x, y);
        }
    },

    _drawMain: function (x, y) {
        var text = this.getMapValue('string');
        var width = this._getWindowWidth(text);
        var height = this._getWindowHeight();
        var textui = this._getWindowTextUI();
        var pic = textui.getUIImage();

        WindowRenderer.drawStretchWindow(x, y, width, height, pic);

        x += this._getWindowXPadding() + 2;
        y += this._getWindowYPadding();
        this._drawContent(x, y, text);

        y += this._getWindowYPadding() * 1.5;

        switch (this.getMapValue('type')) {
            case ObjectiveType.NORMAL:
                break;
            case ObjectiveType.ROUT:
                this._drawBottomSection(x, y, this.getMapValue('enemiesLeft'), ObjectiveStrings.LEFT);
                break;
            case ObjectiveType.TURNS:
                this._drawBottomSection(x, y, this.getMapValue('turnsLeft'), ObjectiveStrings.LEFT);
                break;
            case ObjectiveType.ESCAPE:
                this._drawBottomSection(x, y, this.getMapValue('playerCount'), ObjectiveStrings.LEFT);
                break;
            case ObjectiveType.KILLS:
                this._drawBottomSection(x, y, this.getMapValue('kills'), ObjectiveStrings.KILLS);
                break;
            case ObjectiveType.CUSTOM:
                this._drawBottomSection(x, y, this.getMapValue('customValue'), ObjectiveStrings.CUSTOM);
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

        if (this.getMapValue('type') !== ObjectiveType.TURNS || this.getMapValue('turnsLeft') > 1) {
            TextRenderer.drawText(x, y, text, length, color, font)
            x += this._getWindowXPadding() * 3;
            NumberRenderer.drawRightNumber(x, y - 3, value);
        } else {
            color = 0x4deb77;
            TextRenderer.drawText(x, y, ObjectiveStrings.LASTTURN, length, color, font);
        }
    },

    _getText: function () {
        return this.getMapValue('string');
    },

    _getTextLength: function (text) {
        return this._getWindowWidth(text) - DefineControl.getWindowXPadding();
    },

    _getPositionX: function (text) {
        var dx = LayoutControl.getRelativeX(10) - 54;

        return root.getGameAreaWidth() - this._getWindowWidth(text) - dx;
    },

    _getPositionY: function () {
        var xBuffer = GraphicsFormat.MAPCHIP_WIDTH + 1;
        var yBuffer = GraphicsFormat.MAPCHIP_HEIGHT + 1;
        var x = LayoutControl.getPixelX(this.getMapPartsX());
        var dx = root.getGameAreaWidth() / 2 + xBuffer; // without the exta buffer, it flickers rapidly if MarkyJoe's smooth scroll plugin is active
        var y = LayoutControl.getPixelY(this.getMapPartsY());
        var dy = root.getGameAreaHeight() / 2 + yBuffer; // ditto
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
        var textui = this._getWindowTextUI();
        var font = textui.getFont();

        return TextRenderer.getTextWidth(text, font) + 40;
    },

    _getWindowHeight: function () {
        var count = this.getMapValue('type') ? 2 : 1;

        return 30 + (this.getIntervalY() * count);
    },

    _getWindowTextUI: function () {
        return root.queryTextUI('default_window');
    }
});
