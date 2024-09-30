/**
 * By Repeat.
 * Part of the rebinding plugin but should be usable by code anywhere if it has access to the rebind plugin's editable values.
 * (Specifically, this uses the same image for drawing keys that the rebind plugin does.)
 * Just a small window to display the Select and Cancel keys.
 */

var MiniWindowType = {
    SIMPLE: 0,
    DETAIL: 1
};

var KeyInfoWindow = defineObject(BaseWindow, {
    _cancelKey: null,
    _pic: null,
    _selectKey: null,
    _type: null,
    _width: 400,

    init: function (type, width) {
        this._pic = KEYBOARD_IMAGE;
        this._type = type;
        this._width = width;

        // no idea if these root calls are expensive but calling them only once to be safe
        this._selectKey = root.getKeyBinding('SELECT')[0];
        this._cancelKey = root.getKeyBinding('CANCEL')[0];
    },

    drawWindowContent: function (x, y) {
        var selectText = ActionNameStrings[KeyTypes.SELECT];
        var cancelText = ActionNameStrings[KeyTypes.CANCEL];
        var selectObject = KEYBOARD_CONTROLS.Key[this._selectKey] || KEYBOARD_CONTROLS.Key['none'];
        var cancelObject = KEYBOARD_CONTROLS.Key[this._cancelKey] || KEYBOARD_CONTROLS.Key['none'];

        if (this._type === MiniWindowType.DETAIL) {
            cancelText += ' (' + ChoiceStrings[ChoiceType.CLOSE] + ')';
        }

        x += 4;
        this.drawKey(x, y, selectObject, selectText);
        x += this.getControlPadding();
        this.drawKey(x, y, cancelObject, cancelText);
    },

    drawKey: function (x, y, keyObject, text) {
        var textui = root.queryTextUI('default_window');
        var color = textui.getColor();
        var font = textui.getFont();
        var length = -1;
        var xSlice = keyObject[0];
        var ySlice = keyObject[1];

        this._pic.drawParts(x, y - 8, xSlice, ySlice, GraphicsFormat.ICON_WIDTH, GraphicsFormat.ICON_HEIGHT);
        x += GraphicsFormat.ICON_WIDTH + 8;
        TextRenderer.drawText(x, y - 5, text, length, color, font);
    },

    getControlPadding: function () {
        return 96;
    },

    getWindowWidth: function () {
        return this._width;
    },

    getWindowHeight: function () {
        return GraphicsFormat.ICON_HEIGHT + 16;
    }
});
