/**
 * By Repeat.
 * Displays the keybinds (controls) at the bottom of the screen while on the map.
 * "Check" only appears when hovering over a unit.
 * Editable values are in R-keybind-ui-values.js. Don't edit anything in this file unless you know what you're doing.
 */

(function () {
    var alias1 = MapPartsCollection._configureMapParts;
    MapPartsCollection._configureMapParts = function (groupArray) {
        alias1.call(this, groupArray);

        if (!ConfigItem.ShowKeybinds.isDisabled()) {
            groupArray.appendObject(MapParts.Keybinds);
        }
    }
})();

// enum also matches the order
var KeybindTypes = {
    SELECT: 0,
    RANGE: 1,
    CYCLE: 2,
    CHECK: 3
};

// THIS IS A TOTAL BLIND-FAITH GUESS.
// The following are correct for my personal Xbox One controller so I'm going to have to hope it's good enough.
// Determining the player's particular controller layout is impossible, so I just went with a pretty common controller for PC games.
var XboxKeyNames = {
    7: 'a',
    8: 'b',
    5: 'x',
    6: 'y',
    9: 'lb',
    10: 'rb',
    12: 'start'
};

// TODO: reorder the functions to read better
MapParts.Keybinds = defineObject(BaseMapParts, {
    _keyStrings: [], // array of arrays containing all of the current keybinds (e.g. [['z','enter'],['x'],['s'],['c']])
    _gamepadBinds: [], // array containing all the current gamepad binds (e.g. [8, 5, 9, 10]) 
    _pic: null, // the full image from keyboard-keys.js
    _textStrings: [], // Contains text displayed to the player like 'Range'. Needs to match _keyString's type (obj/arr) and order (see enum)
    _direction: KeybindEditables.direction, // on which sides of the screen are the controls drawn? (top/bot, bot/top, l/r, or r/l)
    // ^corresponds to the DirectionType enum - l/t/r/b. Bottom (3) is default

    initialize: function () {
        this._pic = this.getPic();
        this._gamepadPic = this.getGamepadPic();

        // Note: the order needs to match between _keyStrings and _textStrings
        // _keyStrings is an array of arrays - it contains both binds for each key
        this._keyStrings = this.getKeybindStrings();
        this._textStrings = this.getTextArray();
        this._gamepadBinds = this.getGamepadBinds();
    },

    drawMapParts: function () {
        var x = this.getPositionX();
        var y = this.getPositionY();

        this.drawContent(x, y);
    },

    drawContent: function (x, y) {
        var configOption = this.getConfigOption();
        var keyStrings = configOption === 1 ? this._gamepadBinds : this._keyStrings;
        var textArray = this._textStrings;
        var unit = this.getMapPartsTarget();
        var direction = this._direction;

        for (var i = 0; i < keyStrings.length; i++) {
            var key = configOption === 1 ? keyStrings[i] : keyStrings[i][0];
            var text = textArray[i];

            if (!key || text === MapKeybindStrings.Check && !unit) {
                continue;
            }

            this._drawKeybind(x, y, key, text, configOption);

            if (direction % 2 === 1) {
                x += this.getKeyPadding();
            } else {
                y += GraphicsFormat.ICON_HEIGHT + 4;
            }
        }
    },

    _drawKeybind: function (x, y, key, text, configOption) {
        var textui = this.getWindowTextUI();
        var font = textui.getFont();
        var color = textui.getColor(); // 16777215 white
        var shadow = 0; // black
        var length = this.getTextLength(text);
        var pic, imgObject;

        if (configOption === 1) {
            pic = this._gamepadPic;
            imgObject = XBOX_CONTROLS;
            key = XboxKeyNames[key];
        } else {
            pic = this._pic;
            imgObject = KEYBOARD_CONTROLS
        }

        var keyObject = imgObject.Key[key];
        if (keyObject) {
            var xSlice = keyObject[0];
            var ySlice = keyObject[1];

            pic.drawParts(x - this.getButtonPadding(), y, xSlice, ySlice, GraphicsFormat.ICON_WIDTH, GraphicsFormat.ICON_HEIGHT);
        }
        x += 4;

        // The text is drawn twice, once in black to add a "shadow" for readability. Real professional I know
        TextRenderer.drawText(x + 1, y + 1, text, length, shadow, font);
        TextRenderer.drawText(x, y, text, length, color, font);
    },

    getPic: function () {
        return KEYBOARD_IMAGE;
    },

    getGamepadPic: function () {
        return GAMEPAD_IMAGE;
    },

    getKeybindStrings: function () {
        return [
            root.getKeyBinding('SELECT'),
            root.getKeyBinding('CANCEL'),
            root.getKeyBinding('R_SWITCH'),
            root.getKeyBinding('OPTION')
        ];
    },

    getGamepadBinds: function () {
        return [
            root.getGamepadBinding('SELECT'),
            root.getGamepadBinding('CANCEL'),
            root.getGamepadBinding('R_SWITCH'),
            root.getGamepadBinding('OPTION')
        ];
    },

    getTextArray: function () {
        return [
            MapKeybindStrings.Select,
            MapKeybindStrings.Range,
            MapKeybindStrings.Cycle,
            MapKeybindStrings.Check
        ];
    },

    getPositionX: function () {
        var topBottomX = root.getGameAreaWidth() / 2 - 128 + this.getKeyPadding() + KeybindEditables.xMod;
        var direction = this._direction;

        var xOptions = [
            32,
            topBottomX,
            root.getGameAreaWidth() - this.getKeyPadding(),
            topBottomX
        ];

        var newDirection = direction;
        if (direction === DirectionType.LEFT) { // left
            var x = LayoutControl.getPixelX(this.getMapPartsX());
            var tooLeft = GraphicsFormat.MAPCHIP_WIDTH + this.getKeyPadding();

            if (x < tooLeft) {
                newDirection = 2;
            }
            else {
                newDirection = 0;
            }
        } else if (direction === DirectionType.RIGHT) {
            var x = LayoutControl.getPixelX(this.getMapPartsX());
            var tooRight = root.getGameAreaWidth() - GraphicsFormat.MAPCHIP_WIDTH - this.getKeyPadding();

            if (x > tooRight) {
                newDirection = 0;
            }
            else {
                newDirection = 2;
            }
        }

        return xOptions[newDirection];
    },

    getPositionY: function () {
        var leftRightY = root.getGameAreaWidth() / 2 - 128 + KeybindEditables.yMod;
        var direction = this._direction;

        var yOptions = [
            leftRightY,
            8,
            leftRightY,
            root.getGameAreaHeight() - 32
        ];

        var newDirection = direction;

        if (direction === DirectionType.TOP) {
            var y = LayoutControl.getPixelY(this.getMapPartsY());
            var topRow = GraphicsFormat.MAPCHIP_HEIGHT;

            if (y > topRow) {
                newDirection = 1;
            }
            else {
                newDirection = 3;
            }
        } else if (direction === DirectionType.BOTTOM) {
            var y = LayoutControl.getPixelY(this.getMapPartsY());
            var bottomRow = root.getGameAreaHeight() - GraphicsFormat.MAPCHIP_HEIGHT;

            if (y < bottomRow) {
                newDirection = 3;
            }
            else {
                newDirection = 1;
            }
        }

        return yOptions[newDirection];
    },

    // 0: keyboard, 1: xbox, 2: off. see ConfigItem.KeybindsType
    getConfigOption: function () {
        return ConfigItem.ShowKeybinds.getFlagValue();
    },

    getWindowWidth: function () {
        return 50;
    },

    getButtonPadding: function () {
        return GraphicsFormat.ICON_WIDTH;
    },

    getKeyPadding: function () {
        return 80;
    },

    getTextLength: function (text) {
        return this.getWindowWidth(text) - DefineControl.getWindowXPadding();
    },

    getWindowTextUI: function () {
        // why tf am I getting windowtextui, just do this differently ffs. Pick up a football dork
        return root.queryTextUI('extraname_title');
    }
});
