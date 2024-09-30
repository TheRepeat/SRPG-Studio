/**
 * "Onscreen keybind display", by Repeat.
 * v1.4
 * This file contains user-editable values for this plugin.
 */

var ShowTitleKeybinds = {
    NAV: true,
    SELECT: true,
    CANCEL: true,
    FULLSCREEN: true
};

var MapKeybindStrings = {
    Select: 'Select',
    Range: 'Range',
    Cycle: 'Cycle',
    Check: 'Check',
    Nav: 'Cursor',
    Fullscreen: 'Fullscreen',
    Cancel: 'Cancel'
};
var KeybindStrings = {
    REBINDCOMMAND: 'Game Controls',
    HEADING: 'Control Reassignment',

    CONFIGNAME: 'Display Keybinds',
    CONFIGDESC: 'Choose whether to display the current keybinds onscreen during gameplay.',
    OPTION_PC: 'PC',
    OPTION_XBOX: '360'
};
var BottomHelpText = { // NB: if the string is too long, it is split into multiple lines for you in R-rebind-windows.js (the chunkHelpText function)
    DEFAULT: 'Select an action to reassign to a new key. You can select up to two keys to assign per command. Press the Cancel key to exit.',
    BIND1: 'Select a key to bind to this action.',
    BIND2: '(Optional) Select a second key to bind to this action. Or, select the empty space to skip assigning a second key.',
    RCLICK: 'Choose whether to bind the right mouse button to this action.',
    CLOSE: 'Select an option.'
};
var ConfirmWindowStrings = {
    HEADING: 'Confirm your changes?',
    DESC: 'Select Confirm to lock in your changes, or select Revert to undo your changes and close the window.'
};
var RclickWindowStrings = {
    HEADING: 'Additionally bind the right mouse button to this action?',
    DESC: '(Edits to mouse controls require the game to be closed and reopened to take effect.)',
    CHOICES: {
        YES: StringTable.QuestionWindow_DefaultCase1,
        NO: StringTable.QuestionWindow_DefaultCase2 + ' (choose a key instead)'
    }
};
// Note: Do not edit the order or length of ChoiceStrings (editing the text is fine)
var ChoiceStrings = [
    'Confirm',
    'Revert',
    'Keep editing'
];
// Note: Do not edit the order or length of ActionNameStrings (editing the text is fine). 
// The order and length must match KeybindList in R-rebinding.js
var ActionNameStrings = [
    'Left',
    'Up',
    'Right',
    'Down',
    'Select',
    'Cancel',
    'Check',
    'OPTION2',
    'Previous Unit',
    'Next Unit',
    'Speedup',
    'Skip',
    'Fullscreen Toggle',
    'Reset Game',
    'Close Game'
];

/**
 * SRPG Studio has an unused "OPTION2" key. Certain plugins may use it, but most games won't need it, so it can be disabled on the rebind screen.
 * Set this to true if your project uses its OPTION2 key.
 */
SHOW_OPTION2 = false;

// If true, the command is available as a map command in battle, in addition to the title screen
SHOW_REBIND_MAP_COMMAND = true;

/**
 * Number of rows to show at once on the rebind menu. 
 * The default value of 8 shows all possible controls, but a smaller resolution might need a smaller number to fit the menu onscreen.
 * Note: You don't need to edit this value when you change SHOW_OPTION2 between false and true - the row count automatically adjusts in that case.
 */
REBIND_MENU_ROWS = 8;

/**
 * About KeybindEditables.direction:
 * Change its value to determine the *default* positioning of the controls.
 * The following are valid values:
 * DirectionType.LEFT   (or 0)
 * DirectionType.TOP    (or 1)
 * DirectionType.RIGHT  (or 2)
 * DirectionType.BOTTOM (or 3)
 * Note: the DirectionType enum is defined in constants-enumeratedtype.js
 * 
 * What's meant by "default"? It's where the keybind display will render MOST of the time.
 * For example, "direction: DirectionType.BOTTOM" means that the controls will default to the bottom of the screen.
 * However, if the player's cursor strays too close to the bottom of the screen, the controls will flip to the top of the screen.
 * DirectionType.TOP does the opposite: it defaults to the top, unless the cursor is too close to the top.
 * DirectionType.LEFT and DirectionType.RIGHT follow the same pattern, flipping to the opposite side depending on the position of the cursor.
 * 
 * If this description isn't helping you understand, I recommend changing the value a few times and testing it in-game to see the difference for yourself.
 */
var KeybindEditables = {
    direction: DirectionType.BOTTOM, // 0-left, 1-top, 2-right, 3-bottom (default)
    canFlip: true, // if true, the display will flip to the opposite side of the screen if the player's cursor would overlap the UI
    xMod: 0, // if direction is TOP or BOTTOM, this moves the keys left or right. Negative number moves left. 0 is default.
    yMod: 0 // if direction is LEFT or RIGHT, this moves the displayed keys up or down. Negative number moves up. 0 is default.
};
