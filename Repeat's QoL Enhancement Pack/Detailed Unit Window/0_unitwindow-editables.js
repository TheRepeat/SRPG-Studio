/**
 * By Repeat.
 * Part of the detailed unit window plugin.
 * Contains values the user may want to edit.
 * 
 * Make sure this plugin loads before the rest of the detailed unit window plugins. 
 * It has the 0 in the name to make sure it gets loaded first.
 * 
 * Function(s) overridden without an alias:
 *  * MapPartsCollection._configureMapParts
 */

var UnitWindowValues = {
    CriticalAvoidStat: 'CAv',       // Edit this to change string for Critical Avoid
    IconsOnly: false,               // if true, show icons of all items in inventory. If false, show equipped weapon and name.
    StatColor: ColorValue.INFO,     // color of the stat names
    MediumShowsStats: true,         // true: atk/as, false: lv/exp. You can remove unitwindow-med.js if you prefer the SRPG Studio default
    CrtAvoidIsUnique: false,        // true: prevent-crit skills show MaxCrtAvoidText instead of calculated critical avoid value.
    MaxCrtAvoidText: StringTable.SignWord_WaveDash   // units that invalidate critical hits have special text next to critical avoid (just a hyphen by default).
};

// If you only want some of the window sizes, set the value to false instead of true
var UnitWindowAllowedTypes = {
    XL: true,
    W: true,
    L: true,
    M: true,
    S: true
};

var UnitWindowConfigStrings = {
    XL: 'XL',
    W: 'W',
    L: 'L',
    M: 'M',
    S: 'S'
};
