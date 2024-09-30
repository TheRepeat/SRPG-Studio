/**
 * By Repeat.
 * Adds visible keybinds to the bottom of the title screen. Shows the navigation keys, Select, and Fullscreen.
 * You can toggle which ones are shown by changing values in ShowTitleKeybinds to true or false in the keybind settings file.
 * If you want to adjust where it gets drawn, you'll want to edit these functions:
 *  * getKeyPadding - space between each keybind
 *  * _getKeybindX - x position of the whole thing
 *  * _getKeybindY - y position of the whole thing
 * 
 * Function(s) overridden without alias:
 *  * TitleScene.drawSceneCycle
 */

TitleScene.drawSceneCycle = function () {
    var mode = this.getCycleMode();

    if (mode === TitleSceneMode.FLOW) {
        this._straightFlow.drawStraightFlow();
        return;
    }
    else if (mode === TitleSceneMode.BLACKIN) {
        this._transition.drawTransition();
    }

    this._drawBackground();
    this._drawLogo();
    this._drawScrollbar();

    // this new function call is the only change. Needs to draw after the bg and logo but before _drawOpen, so not aliasable.
    this._drawKeybinds();

    if (mode === TitleSceneMode.SELECT) {
        this._drawSelect();
    }
    else if (mode === TitleSceneMode.OPEN) {
        this._drawOpen();
    }
}

TitleScene._drawKeybinds = function () {
    var mode = this.getCycleMode();
    var x = this._getKeybindX();
    var y = this._getKeybindY();

    if (ShowTitleKeybinds.NAV) {
        this._drawNavigationKeybinds(x, y, [], MapKeybindStrings.Nav);

        x += this.getKeyPadding() + GraphicsFormat.ICON_WIDTH * 2;
    }

    if (ShowTitleKeybinds.SELECT) {
        var key = root.getKeyBinding('SELECT')[0];
        var text = MapKeybindStrings.Select;

        if (key) {
            this._drawKeybind(x, y, key, text);
            x += this.getKeyPadding();
        }
    }

    // deadass the only way I could think to identify the New Game command since I can't seem to get its name via code lmfao
    // Hopefully, dear user, you don't have other plugins that add title commands with their own _moveBlackOut functions! Or maybe this is good for those too?
    var isNewGameCommand = typeof this._scrollbar.getObject()._moveBlackOut !== 'undefined';

    if (ShowTitleKeybinds.CANCEL && mode === TitleSceneMode.OPEN && !isNewGameCommand) {
        var key = root.getKeyBinding('CANCEL')[0];
        var text = MapKeybindStrings.Cancel;

        if (key) {
            this._drawKeybind(x, y, key, text);
            x += this.getKeyPadding();
        }
    }

    if (ShowTitleKeybinds.FULLSCREEN) {
        var key = root.getKeyBinding('FULLSCREEN')[0];
        var text = MapKeybindStrings.Fullscreen;

        if (key) {
            this._drawKeybind(x, y, key, text);
            x += this.getKeyPadding();
        }
    }
}

// draws all of l/t/r/b shaped like arrow keys on a keyboard
TitleScene._drawNavigationKeybinds = function (x, y) {
    var textui = this.getKeybindTextUI();
    var font = textui.getFont();
    var color = textui.getColor(); // 16777215 white
    var shadow = 0; // black
    var length = 64;
    var text = MapKeybindStrings.Nav;

    var keyArr = this.getNavigationKeybindStrings();

    this._drawOneNav(x, y, keyArr, DirectionType.LEFT);

    x += GraphicsFormat.ICON_WIDTH;

    this._drawOneNav(x, y, keyArr, DirectionType.BOTTOM);
    this._drawOneNav(x, y - GraphicsFormat.ICON_HEIGHT, keyArr, DirectionType.TOP);

    x += GraphicsFormat.ICON_WIDTH;

    this._drawOneNav(x, y, keyArr, DirectionType.RIGHT);

    x += 4;

    // The text is drawn twice, once in black to add a "shadow" for readability. Real professional I know
    TextRenderer.drawText(x + 1, y + 1, text, length, shadow, font);
    TextRenderer.drawText(x, y, text, length, color, font);
}

TitleScene._drawOneNav = function (x, y, keyArr, direction) {
    var pic = this.getKeyboardImg();
    var imgObject = KEYBOARD_CONTROLS;
    var binding = keyArr[direction][0];
    var keyObject = imgObject.Key[binding];

    if (keyObject) {
        var xSlice = keyObject[0];
        var ySlice = keyObject[1];

        pic.drawParts(x - GraphicsFormat.ICON_WIDTH, y, xSlice, ySlice, GraphicsFormat.ICON_WIDTH, GraphicsFormat.ICON_HEIGHT);
    }
}

TitleScene._drawKeybind = function (x, y, key, text) {
    var textui = this.getKeybindTextUI();
    var font = textui.getFont();
    var color = textui.getColor(); // 16777215 white
    var shadow = 0; // black
    var length = 64;
    var pic = this.getKeyboardImg();
    var imgObject = KEYBOARD_CONTROLS;

    var keyObject = imgObject.Key[key];
    if (keyObject) {
        var xSlice = keyObject[0];
        var ySlice = keyObject[1];

        pic.drawParts(x - GraphicsFormat.ICON_WIDTH, y, xSlice, ySlice, GraphicsFormat.ICON_WIDTH, GraphicsFormat.ICON_HEIGHT);
    }
    x += 4;

    TextRenderer.drawText(x + 1, y + 1, text, length, shadow, font);
    TextRenderer.drawText(x, y, text, length, color, font);
}

TitleScene.getKeyboardImg = function () {
    return KEYBOARD_IMAGE;
}
TitleScene.getGamepadImg = function () {
    return GAMEPAD_IMAGE;
}
TitleScene.getNavigationKeybindStrings = function () {
    // in DirectionType order, ltrb
    return [
        root.getKeyBinding('LEFT'),
        root.getKeyBinding('UP'),
        root.getKeyBinding('RIGHT'),
        root.getKeyBinding('DOWN'),
    ];
}

TitleScene.getKeybindTextUI = function () {
    return root.queryTextUI('extraname_title');
}

TitleScene.getKeyPadding = function () {
    return 88;
}

TitleScene._getKeybindX = function () {
    return GraphicsFormat.ICON_WIDTH + 8;
}
TitleScene._getKeybindY = function () {
    return root.getGameAreaHeight() - (GraphicsFormat.ICON_HEIGHT + 8);
}