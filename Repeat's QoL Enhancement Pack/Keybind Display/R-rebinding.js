/**
 * By Repeat.
 * v1.5
 * Adds new UI to the title screen, allowing players to rebind their controls in-game.
 * 
 * Controller rebinding is not in scope for the initial release of this plugin.
 * It's hardly worth making anyway, but I guess I'll have to do it eventually.
 */

REBIND_CURSOR_1 = null;
REBIND_CURSOR_2 = null;
KEYBOARD_IMAGE = null;
GAMEPAD_IMAGE = null;
MOUSE_IMAGE = null;

(function () {
    // Add command to title screen
    var alias1 = TitleScene._configureTitleItem;
    TitleScene._configureTitleItem = function (groupArray) {
        alias1.call(this, groupArray);

        // insert the command into roughly the middle
        groupArray.insertObject(RebindCommand, Math.floor(groupArray.length / 2));
    }

    var alias2 = MapCommand.configureCommands;
    MapCommand.configureCommands = function (groupArray) {
        alias2.call(this, groupArray);

        groupArray.insertObject(RebindCommand, Math.floor(groupArray.length / 2));
    };

    var alias3 = SetupControl.setup;
    SetupControl.setup = function () {
        alias3.call(this);

        KEYBOARD_IMAGE = root.getMaterialManager().createImage(KEYBOARD_CONTROLS.Folder, KEYBOARD_CONTROLS.Image);
        GAMEPAD_IMAGE = root.getMaterialManager().createImage(XBOX_CONTROLS.Folder, XBOX_CONTROLS.Image);
        MOUSE_IMAGE = root.getMaterialManager().createImage(MOUSE_CONTROLS.Folder, MOUSE_CONTROLS.Image);

        REBIND_CURSOR_1 = root.getMaterialManager().createImage(REBIND_CURSORS.Folder, REBIND_CURSORS.Cursor0);
        REBIND_CURSOR_2 = root.getMaterialManager().createImage(REBIND_CURSORS.Folder, REBIND_CURSORS.Cursor1);
    }
})();

var KeyboardLayout = [
    'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12',
    'esc', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'enter',
    'shift', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'up', '',
    'ctrl', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'space', 'left', 'down', 'right'
];

var KeyTypes = {
    LEFT: 0,
    UP: 1,
    RIGHT: 2,
    DOWN: 3,
    SELECT: 4,
    CANCEL: 5,
    OPTION: 6,
    OPTION2: 7,
    L_SWITCH: 8,
    R_SWITCH: 9,
    SYSTEM: 10,
    SKIP: 11,
    FULLSCREEN: 12,
    RESET: 13,
    EXIT: 14
};

var KeybindList = [
    'LEFT',
    'UP',
    'RIGHT',
    'DOWN',
    'SELECT',
    'CANCEL',
    'OPTION',
    'OPTION2',
    'L_SWITCH',
    'R_SWITCH',
    'SYSTEM',
    'SKIP',
    'FULLSCREEN',
    'RESET',
    'EXIT'
];

// Defines whether the first or second bind of a key is being edited (which scrollbar to draw/which binding to edit)
var RebindState = {
    NONE: 0,
    FIRST: 1,
    RCLICK: 2,
    SECOND: 3
};

var RebindCommand = defineObject(BaseTitleCommand, {
    _bottomWindow: null,
    _rebindWindow: null,
    _topWindow: null,

    openCommand: function () {
        this._topWindow = createObject(TopRebindWindow);
        this._rebindWindow = createWindowObject(RebindWindow, this); // rebindWindow needs access to the parent to update the help text
        this._bottomWindow = createObject(BottomRebindWindow);
        this.setHelpText(BottomHelpText.DEFAULT)
    },

    moveCommand: function () {
        if (this._rebindWindow.moveWindow() !== MoveResult.CONTINUE) {
            return MoveResult.END;
        }

        return MoveResult.CONTINUE;
    },

    setHelpText: function (text) {
        this._bottomWindow.setHelpText(text);
    },

    drawCommand: function () {
        var x = LayoutControl.getCenterX(-1, this._rebindWindow.getWindowWidth());
        var y = LayoutControl.getCenterY(-1, this._rebindWindow.getWindowHeight());

        this._topWindow.drawWindow(x, y - this._topWindow.getWindowHeight());
        this._bottomWindow.drawWindow(x, y + this._rebindWindow.getWindowHeight());
        this._rebindWindow.drawWindow(x, y);
    },

    getCommandName: function () {
        return KeybindStrings.REBINDCOMMAND;
    },

    // This function is required for the command to be added to map commands (i.e. BaseTitleCommand doesn't have this already)
    isCommandDisplayable: function () {
        return SHOW_REBIND_MAP_COMMAND;
    }
});

var RebindWindow = defineObject(BaseWindow, {
    _choiceWindow: null,
    _imgX: null,
    _imgY: null,
    _initialBindings: null,
    _initialIndices: null,
    _keyboardScrollbar: null,
    _keyboardScrollbar2: null,
    _pic: null,
    _rclickChoiceWindow: null,
    _rebindState: RebindState.NONE,
    _rebindScrollbar: null,
    _selectedBinds: [],
    _showChoiceWindow: false,
    _showRclickChoiceWindow: false,
    _showImage: false,

    initialize: function () {
        this._pic = KEYBOARD_IMAGE;

        var picColumns = this._pic.getWidth() / GraphicsFormat.ICON_WIDTH;
        var picRows = this._pic.getHeight() / GraphicsFormat.ICON_HEIGHT;

        this._initialBindings = this.setInitialBindings();

        this._rebindScrollbar = createScrollbarObject(RebindScrollbar, this);
        this._rebindScrollbar.setScrollFormation(2, REBIND_MENU_ROWS);
        this._rebindScrollbar.setScrollData(this._initialBindings);
        this._rebindScrollbar.setActive(true);

        this._keyboardScrollbar = createScrollbarObject(KeyboardScrollbar, this);
        this._keyboardScrollbar.setScrollFormation(picColumns, picRows);
        this._keyboardScrollbar.setScrollData(this._pic, false);
        this._keyboardScrollbar.setActive(false);

        this._keyboardScrollbar2 = createScrollbarObject(KeyboardScrollbar, this);
        this._keyboardScrollbar2.setScrollFormation(picColumns, picRows);
        this._keyboardScrollbar2.setScrollData(this._pic, true);
        this._keyboardScrollbar2.setActive(false);
    },

    moveWindowContent: function () {
        if (this._showChoiceWindow) {
            return this._moveChoiceWindow();
        }

        if (!this._showImage && InputControl.isCancelAction()) {
            this.playCancelSound();

            // do this stuff only once
            if (!this._showChoiceWindow) {
                this.getParentInstance().setHelpText(BottomHelpText.CLOSE);

                this._createChoiceWindow();
                this._showChoiceWindow = true;
                this._rebindScrollbar.setActive(false);
                this._choiceWindow.openWindow();
            }
        }

        this._manageSelections();

        if (this._rebindState === RebindState.FIRST) {
            this._keyboardScrollbar.moveInput();
        } else if (this._rebindState === RebindState.SECOND) {
            this._keyboardScrollbar2.moveInput();
        } else if (this._rebindState === RebindState.RCLICK) {
            this._moveRclickChoiceWindow();
        } else if (!this._showChoiceWindow) {
            this._rebindScrollbar.moveInput();
        }

        return MoveResult.CONTINUE;
    },

    drawWindowContent: function (x, y) {
        this._rebindScrollbar.drawScrollbar(x, y);
        if (this._showImage) {
            this._drawImage(x, y);
        }

        if (this._showChoiceWindow) {
            this._drawChoiceWindow(x, y);
        }

        if (this._rebindState === RebindState.RCLICK) {
            this._rclickChoiceWindow.drawWindow(x, y + 32);
        }
    },

    _createChoiceWindow: function () {
        var dataObject = {
            heading: '',
            description: ''
        };

        dataObject.heading = ConfirmWindowStrings.HEADING;
        dataObject.description = ConfirmWindowStrings.DESC;
        dataObject.choices = ChoiceStrings;

        this._choiceWindow = createWindowObject(RebindChoiceWindow, this);
        this._choiceWindow.setScrollbar(dataObject);

        this._createKeyInfoWindow(MiniWindowType.DETAIL, this._choiceWindow.getWindowWidth());
    },

    _createRclickChoiceWindow: function () {
        var dataObject = {
            heading: '',
            description: ''
        };

        dataObject.heading = RclickWindowStrings.HEADING;
        dataObject.description = RclickWindowStrings.DESC;
        dataObject.choices = RclickWindowStrings.CHOICES;

        this._rclickChoiceWindow = createWindowObject(RclickChoiceWindow, this);
        this._rclickChoiceWindow.setScrollbar(dataObject);
    },

    _createKeyInfoWindow: function (type, width) {
        // this is initialized here instead of when the window opens so that the latest controls are displayed
        this._miniWindow = createWindowObject(KeyInfoWindow, this);
        this._miniWindow.init(type, width);
    },

    _moveRclickChoiceWindow: function () {
        if (this._rclickChoiceWindow.moveWindowContent() !== MoveResult.CONTINUE) {
            if (this._rclickChoiceWindow.getChoice()) {
                this._rclickChoiceWindow = null;
                var selectedType = this._rebindScrollbar.getObject().nameinternal

                this._showImage = false;
                this._keyboardScrollbar.setForceSelect(-1)
                this._rebindScrollbar.setActive(true);
                this._keyboardScrollbar.setActive(false);
                this._keyboardScrollbar2.setActive(false);

                this.rebind(selectedType, this._selectedBinds[0], 'rclick');

                this.getParentInstance().setHelpText(BottomHelpText.DEFAULT);
                this.changeState(RebindState.NONE);
            } else {
                this._rclickChoiceWindow = null;

                this._keyboardScrollbar.setForceSelect(this._keyboardScrollbar.getIndex());
                this._keyboardScrollbar.setActive(false);
                this._keyboardScrollbar2.setForceSelect(-1);
                this._keyboardScrollbar2.setActive(true);

                this.getParentInstance().setHelpText(BottomHelpText.BIND2);
                this.changeState(RebindState.SECOND);
            }
        }
    },

    _moveChoiceWindow: function () {
        if (this._choiceWindow.moveWindow() !== MoveResult.CONTINUE) {
            this._showChoiceWindow = false;

            switch (this._choiceWindow.getChoice()) {
                case ChoiceType.CONFIRM:
                    return MoveResult.END;
                case ChoiceType.REVERT:
                    this.resetBindings();
                    return MoveResult.END;
                case ChoiceType.CLOSE:
                    this._rebindScrollbar.setActive(true);
                    break;
                case ChoiceType.RESTORE:
                    this.restoreDefaultBindings();
                    return MoveResult.END;
            }

            this.getParentInstance().setHelpText(BottomHelpText.DEFAULT);
            this._choiceWindow.closeWindow();
        }

        return MoveResult.CONTINUE;
    },

    _drawImage: function (x, y) {
        this._pic.draw(x, y);
        this._keyboardScrollbar.drawScrollbar(x, y);
        this._keyboardScrollbar2.drawScrollbar(x, y);

        this._miniWindow.drawWindow(x, y + this._pic.getHeight() + 8);
    },

    _drawChoiceWindow: function (x, y) {
        this._choiceWindow.drawWindow(x, y);
        this._miniWindow.drawWindow(x, y + this._choiceWindow.getWindowHeight());
    },

    resetBindings: function () {
        var binds = this._initialBindings;

        for (var i = 0; i < KeybindList.length; i++) {
            if (binds[i]) {
                root.setKeyBinding(KeybindList[i], binds[i][0], binds[i][1]);
            }
        }
    },

    restoreDefaultBindings: function () {
        for (var i = 0; i < KeybindList.length; i++) {
            var currentBind = DefaultKeybinds[KeybindList[i]];

            if (currentBind) {
                root.setKeyBinding(KeybindList[i], currentBind[0], currentBind[1]);
            }
        }
    },

    /**
     * Finds the indices of the current keybinds in the KeyboardLayout array.
     * These indices are used to place the cursor at the correct starting position 
     * when the KeyboardScrollbar is opened.
     * 
     * @param {string} type keybind to check, e.g. 'SELECT'
     * @returns {Array} 2-entry array containing the correct indices for each entry in KeyboardLayout
     */
    getInitialIndices: function (type) {
        var initialKeys = root.getKeyBinding(type);
        var arr = [,];

        for (var i = 0; i < KeyboardLayout.length; i++) {
            var cur = KeyboardLayout[i];
            if (initialKeys[0] === cur) {
                arr[0] = i;
            }
            if (initialKeys[1] === cur) {
                arr[1] = i;
            }
        }

        // note: 35 is the empty key in the graphic by default
        // this is a "magic number" I know but idk how I could improve this
        if (!arr[0]) {
            arr[0] = 35;
        }
        if (!arr[1]) {
            arr[1] = 35;
        }

        return arr;
    },

    // "what happens when I click something?"
    _manageSelections: function () {
        if (InputControl.isSelectAction()) {
            var selectedType = this._rebindScrollbar.getObject().nameinternal
            if (this._rebindState === RebindState.NONE) { // upon opening the keyboard image
                this._showImage = true;
                this._createKeyInfoWindow(MiniWindowType.SIMPLE, this._pic.getWidth());
                this._initialIndices = this.getInitialIndices(selectedType);

                this._keyboardScrollbar.setActive(true);
                this._keyboardScrollbar.setIndex(this._initialIndices[0]);
                this._rebindScrollbar.setActive(false);
                this._keyboardScrollbar2.setIndex(this._initialIndices[1]);
                this._keyboardScrollbar2.setForceSelect(this._initialIndices[1]);

                this.getParentInstance().setHelpText(BottomHelpText.BIND1);
                this.changeState(RebindState.FIRST);
            } else if (this._rebindState === RebindState.FIRST) { // upon selecting the first key
                var selectedIndex = this._keyboardScrollbar.getIndex();
                var actionIndex = this._rebindScrollbar.getIndex();
                var continueToBind2 = !this.isSkipOrSystemAction(actionIndex);

                // assign first keybind
                this._selectedBinds[0] = this._keyboardScrollbar.getObject().name;

                // freezes first keyboard on the key it selected and switches to keyboard2 or rclick choice
                this._keyboardScrollbar.setForceSelect(selectedIndex);
                this._keyboardScrollbar.setActive(false);

                if (continueToBind2) {
                    this._keyboardScrollbar2.setForceSelect(-1);
                    this._keyboardScrollbar2.setActive(true);

                    this.getParentInstance().setHelpText(BottomHelpText.BIND2);
                    this.changeState(RebindState.SECOND);
                } else {
                    this._createRclickChoiceWindow();

                    this.getParentInstance().setHelpText(BottomHelpText.RCLICK);
                    this.changeState(RebindState.RCLICK)
                }
            } else if (this._rebindState === RebindState.SECOND) { // upon selecting the second key (closes the image, rebinds controls, returns to the rebind scrollbar)
                this._showImage = false;
                // assign second keybind
                this._selectedBinds[1] = this._keyboardScrollbar2.getObject().name;

                this._keyboardScrollbar.setForceSelect(-1)
                this._rebindScrollbar.setActive(true);
                this._keyboardScrollbar.setActive(false);
                this._keyboardScrollbar2.setActive(false);

                this.rebind(selectedType, this._selectedBinds[0], this._selectedBinds[1]);

                this.getParentInstance().setHelpText(BottomHelpText.DEFAULT);
                this.changeState(RebindState.NONE);
            }
        } else if (InputControl.isCancelAction() && !this._showChoiceWindow) {
            this._showImage = false;
            this._rebindScrollbar.setActive(true);
            this._keyboardScrollbar.setActive(false);
            this._keyboardScrollbar2.setActive(false);

            this.getParentInstance().setHelpText(BottomHelpText.DEFAULT);
            this.changeState(RebindState.NONE);
        }
    },

    rebind: function (type, key1, key2) {
        root.setKeyBinding(type, key1, key2);

        this._rebindScrollbar.setScrollData();
    },

    /**
     * This needs to return an object instead of an array because OPTION2 is skippable.
     * An array is read in order, but an object can skip numbers (in OPTION2'S case, 7) since key names are arbitrary.
     */
    setInitialBindings: function () {
        var obj = {};

        for (var i = 0; i < KeybindList.length; i++) {
            if (i !== KeyTypes.OPTION2 || SHOW_OPTION2) {
                obj[i] = root.getKeyBinding(KeybindList[i]);
            }
        }

        return obj;
    },

    changeState: function (newState) {
        this._rebindState = newState;
    },

    isSkipOrSystemAction: function (index) {
        if (SHOW_OPTION2) {
            return index === 10 || index === 11;
        } else {
            return index === 9 || index === 10;
        }
        // this is so stupid dude
    },

    getWindowWidth: function () {
        return 600;
    },

    // dynamic height based on number and height of displayable scrollbar entries
    getWindowHeight: function () {
        var displayedRows = this._rebindScrollbar.getRowCount();
        var rowHeight = this._rebindScrollbar.getObjectHeight();
        var height = displayedRows * rowHeight;

        return rowHeight + height;
    },

    playCancelSound: function () {
        MediaControl.soundDirect('commandcancel');
    },

    playMenuTargetChangeSound: function () {
        MediaControl.soundDirect('menutargetchange');
    }
});

// This is the scrollbar where you choose the new key(s).
// Most of this is invisible, just overlaid on an image drawn elsewhere. Movie magic.
var KeyboardScrollbar = defineObject(BaseScrollbar, {
    _isSecondCursor: null,
    _pic: null,

    setScrollData: function (pic, isSecondCursor) {
        this._pic = pic;
        this._isSecondCursor = isSecondCursor; // use the primary or secondary cursor? (there are 2 keyboard scrollbars drawn at once)

        var picColumns = this._pic.getWidth() / GraphicsFormat.ICON_WIDTH;
        var picRows = this._pic.getHeight() / GraphicsFormat.ICON_HEIGHT;

        var count = picRows * picColumns;

        for (var i = 0; i < count; i++) {
            this.objectSet({
                name: KeyboardLayout[i]
            });
        }

        this.objectSetEnd();
    },

    drawDescriptionLine: function () { },

    getObjectWidth: function () {
        return GraphicsFormat.ICON_WIDTH;
    },

    getObjectHeight: function () {
        return GraphicsFormat.ICON_HEIGHT;
    },

    // switches between a blue and yellow cursor depending on whether bind 1 or bind 2 is being edited
    getCursorPicture: function () {
        var pic = this._isSecondCursor ? REBIND_CURSOR_2 : REBIND_CURSOR_1
        return pic;
    },

    drawCursor: function (x, y, isActive) {
        var pic = this.getCursorPicture();

        y -= (32 - this._objectHeight) / 2;
        x += 21; // move it further right since it's a square-shaped cursor instead of the pointer finger

        this._commandCursor.drawCursor(x, y, isActive, pic);
    }
});

// when i get around to it i'll prolly need 2 scrollbars on different pages, one for kb/one for conch
var RebindScrollbar = defineObject(BaseScrollbar, {
    _pic: null,
    _mousePic: null,

    setScrollData: function (initialBindings) {
        this._pic = KEYBOARD_IMAGE;
        this._mousePic = MOUSE_IMAGE;

        this.resetScrollData();

        for (var i = 0; i < KeybindList.length; i++) {
            var nameinternal = KeybindList[i];

            if (i !== KeyTypes.OPTION2 || SHOW_OPTION2) {
                this.objectSet({
                    name: ActionNameStrings[i],
                    nameinternal: nameinternal,
                    keys: initialBindings ? initialBindings[i] : root.getKeyBinding(nameinternal)
                });
            }
        }
        this.objectSetEnd();
    },

    drawScrollContent: function (x, y, object, isSelect, index) {
        y += GraphicsFormat.ICON_WIDTH / 2;
        var textui = root.queryTextUI('default_window');
        var length = -1;
        var color = textui.getColor();
        var font = textui.getFont();
        var name = object.name;
        var key1 = object.keys[0];
        var key2 = object.keys[1];

        TextRenderer.drawText(x, y, name, length, color, font);

        x += 144;

        if (KEYBOARD_CONTROLS.Key[key1]) {
            this.drawKey(x, y, key1);
        }

        if (KEYBOARD_CONTROLS.Key[key2] || MOUSE_CONTROLS.Key[key2]) {
            x += GraphicsFormat.ICON_WIDTH + 8;

            TextRenderer.drawText(x, y + 8, ',', length, color, font);

            x += 8
            this.drawKey(x, y, key2);
        }
    },

    drawKey: function (x, y, key) {
        var pic = this._pic;
        var keyDimensions;

        if (key === 'rclick') {
            keyDimensions = MOUSE_CONTROLS.Key[key];
            pic = this._mousePic;
        } else {
            keyDimensions = KEYBOARD_CONTROLS.Key[key] ? KEYBOARD_CONTROLS.Key[key] : KEYBOARD_CONTROLS.Key.defaultKey;
        }

        var xSlice = keyDimensions[0];
        var ySlice = keyDimensions[1];

        pic.drawParts(x, y, xSlice, ySlice, GraphicsFormat.ICON_WIDTH, GraphicsFormat.ICON_HEIGHT);
    },

    getObjectWidth: function () {
        return RebindWindow.getWindowWidth() / 2 - 8;
    },

    getObjectHeight: function () {
        return GraphicsFormat.ICON_HEIGHT * 2;
    }
});
