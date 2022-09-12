/**
 * Divides up the keyboard and controller images into slices in order to draw individual keys.
 */

var REBIND_CURSORS = {
    Folder: 'Keybinds',
    Cursor0: 'rebindcursor0.png',
    Cursor1: 'rebindcursor1.png'
};

var KEYBOARD_CONTROLS = {
    Folder: 'Keybinds',
    Image: 'keyboard.png',
    Key: {
        f1: [GraphicsFormat.ICON_WIDTH * 0, GraphicsFormat.ICON_HEIGHT * 0],
        f2: [GraphicsFormat.ICON_WIDTH * 1, GraphicsFormat.ICON_HEIGHT * 0],
        f3: [GraphicsFormat.ICON_WIDTH * 2, GraphicsFormat.ICON_HEIGHT * 0],
        f4: [GraphicsFormat.ICON_WIDTH * 3, GraphicsFormat.ICON_HEIGHT * 0],
        f5: [GraphicsFormat.ICON_WIDTH * 4, GraphicsFormat.ICON_HEIGHT * 0],
        f6: [GraphicsFormat.ICON_WIDTH * 5, GraphicsFormat.ICON_HEIGHT * 0],
        f7: [GraphicsFormat.ICON_WIDTH * 6, GraphicsFormat.ICON_HEIGHT * 0],
        f8: [GraphicsFormat.ICON_WIDTH * 7, GraphicsFormat.ICON_HEIGHT * 0],
        f9: [GraphicsFormat.ICON_WIDTH * 8, GraphicsFormat.ICON_HEIGHT * 0],
        f10: [GraphicsFormat.ICON_WIDTH * 9, GraphicsFormat.ICON_HEIGHT * 0],
        f11: [GraphicsFormat.ICON_WIDTH * 10, GraphicsFormat.ICON_HEIGHT * 0],
        f12: [GraphicsFormat.ICON_WIDTH * 11, GraphicsFormat.ICON_HEIGHT * 0],

        esc: [GraphicsFormat.ICON_WIDTH * 0, GraphicsFormat.ICON_HEIGHT * 1],
        q: [GraphicsFormat.ICON_WIDTH * 1, GraphicsFormat.ICON_HEIGHT * 1],
        w: [GraphicsFormat.ICON_WIDTH * 2, GraphicsFormat.ICON_HEIGHT * 1],
        e: [GraphicsFormat.ICON_WIDTH * 3, GraphicsFormat.ICON_HEIGHT * 1],
        r: [GraphicsFormat.ICON_WIDTH * 4, GraphicsFormat.ICON_HEIGHT * 1],
        t: [GraphicsFormat.ICON_WIDTH * 5, GraphicsFormat.ICON_HEIGHT * 1],
        y: [GraphicsFormat.ICON_WIDTH * 6, GraphicsFormat.ICON_HEIGHT * 1],
        u: [GraphicsFormat.ICON_WIDTH * 7, GraphicsFormat.ICON_HEIGHT * 1],
        i: [GraphicsFormat.ICON_WIDTH * 8, GraphicsFormat.ICON_HEIGHT * 1],
        o: [GraphicsFormat.ICON_WIDTH * 9, GraphicsFormat.ICON_HEIGHT * 1],
        p: [GraphicsFormat.ICON_WIDTH * 10, GraphicsFormat.ICON_HEIGHT * 1],
        enter: [GraphicsFormat.ICON_WIDTH * 11, GraphicsFormat.ICON_HEIGHT * 1],

        shift: [GraphicsFormat.ICON_WIDTH * 0, GraphicsFormat.ICON_HEIGHT * 2],
        a: [GraphicsFormat.ICON_WIDTH * 1, GraphicsFormat.ICON_HEIGHT * 2],
        s: [GraphicsFormat.ICON_WIDTH * 2, GraphicsFormat.ICON_HEIGHT * 2],
        d: [GraphicsFormat.ICON_WIDTH * 3, GraphicsFormat.ICON_HEIGHT * 2],
        f: [GraphicsFormat.ICON_WIDTH * 4, GraphicsFormat.ICON_HEIGHT * 2],
        g: [GraphicsFormat.ICON_WIDTH * 5, GraphicsFormat.ICON_HEIGHT * 2],
        h: [GraphicsFormat.ICON_WIDTH * 6, GraphicsFormat.ICON_HEIGHT * 2],
        j: [GraphicsFormat.ICON_WIDTH * 7, GraphicsFormat.ICON_HEIGHT * 2],
        k: [GraphicsFormat.ICON_WIDTH * 8, GraphicsFormat.ICON_HEIGHT * 2],
        l: [GraphicsFormat.ICON_WIDTH * 9, GraphicsFormat.ICON_HEIGHT * 2],
        up: [GraphicsFormat.ICON_WIDTH * 10, GraphicsFormat.ICON_HEIGHT * 2],
        none: [GraphicsFormat.ICON_WIDTH * 11, GraphicsFormat.ICON_HEIGHT * 2],

        ctrl: [GraphicsFormat.ICON_WIDTH * 0, GraphicsFormat.ICON_HEIGHT * 3],
        z: [GraphicsFormat.ICON_WIDTH * 1, GraphicsFormat.ICON_HEIGHT * 3],
        x: [GraphicsFormat.ICON_WIDTH * 2, GraphicsFormat.ICON_HEIGHT * 3],
        c: [GraphicsFormat.ICON_WIDTH * 3, GraphicsFormat.ICON_HEIGHT * 3],
        v: [GraphicsFormat.ICON_WIDTH * 4, GraphicsFormat.ICON_HEIGHT * 3],
        b: [GraphicsFormat.ICON_WIDTH * 5, GraphicsFormat.ICON_HEIGHT * 3],
        n: [GraphicsFormat.ICON_WIDTH * 6, GraphicsFormat.ICON_HEIGHT * 3],
        m: [GraphicsFormat.ICON_WIDTH * 7, GraphicsFormat.ICON_HEIGHT * 3],
        space: [GraphicsFormat.ICON_WIDTH * 8, GraphicsFormat.ICON_HEIGHT * 3],
        left: [GraphicsFormat.ICON_WIDTH * 9, GraphicsFormat.ICON_HEIGHT * 3],
        down: [GraphicsFormat.ICON_WIDTH * 10, GraphicsFormat.ICON_HEIGHT * 3],
        right: [GraphicsFormat.ICON_WIDTH * 11, GraphicsFormat.ICON_HEIGHT * 3]
    }
};

var XBOX_CONTROLS = {
    Folder: 'Keybinds',
    Image: 'xbox.png',
    Key: {
        lb: [GraphicsFormat.ICON_WIDTH * 0, GraphicsFormat.ICON_HEIGHT * 0],
        rb: [GraphicsFormat.ICON_WIDTH * 1, GraphicsFormat.ICON_HEIGHT * 0],
        lt: [GraphicsFormat.ICON_WIDTH * 2, GraphicsFormat.ICON_HEIGHT * 0],
        rt: [GraphicsFormat.ICON_WIDTH * 3, GraphicsFormat.ICON_HEIGHT * 0],

        a: [GraphicsFormat.ICON_WIDTH * 0, GraphicsFormat.ICON_HEIGHT * 1],
        b: [GraphicsFormat.ICON_WIDTH * 1, GraphicsFormat.ICON_HEIGHT * 1],
        x: [GraphicsFormat.ICON_WIDTH * 2, GraphicsFormat.ICON_HEIGHT * 1],
        y: [GraphicsFormat.ICON_WIDTH * 3, GraphicsFormat.ICON_HEIGHT * 1]
    }
};
