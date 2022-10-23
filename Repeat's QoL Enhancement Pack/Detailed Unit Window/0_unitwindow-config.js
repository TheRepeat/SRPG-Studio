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

CRIT_AVOID_STAT = "CAv";            // Edit this to change string for Critical Avoid
ICONS_ONLY = false;                 // if true, show icons of all items in inventory. If false, show equipped weapon and name.
STAT_COLOR = ColorValue.INFO;       // color of the stat names
MEDIUM_SHOWS_STATS = true;          // true: atk/as, false: lv/exp. You can remove unitwindow-med.js if you prefer the SRPG Studio default
CAV_IS_UNIQUE = false;              // true: prevent-crit skills show MAX_CAV_TEXT instead of calculated critical avoid value.
MAX_CAV_TEXT = StringTable.SignWord_WaveDash;   // units that invalidate critical hits have special text next to critical avoid (just a hyphen by default).

ConfigItem.UnitMenuStatus = defineObject(BaseConfigtItem, {
    selectFlag: function (index) {
        root.getMetaSession().setDefaultEnvironmentValue(8, index);
    },

    getFlagValue: function () {
        return root.getMetaSession().getDefaultEnvironmentValue(8);
    },

    getFlagCount: function () {
        return 5;
    },

    getConfigItemTitle: function () {
        return StringTable.Config_MapUnitWindow;
    },

    getConfigItemDescription: function () {
        return StringTable.Config_MapUnitWindowDescription;
    },

    getObjectArray: function () {
        return ['XL', 'W', 'L', 'M', 'S'];
    }
});

MapPartsCollection._configureMapParts = function (groupArray) {
    var n = root.getMetaSession().getDefaultEnvironmentValue(8);

    if (n === 0) {
        groupArray.appendObject(MapParts.UnitInfoExtraLarge);
    } else if (n === 1) {
        groupArray.appendObject(MapParts.UnitInfoWide);
    } else if (n === 2) {
        groupArray.appendObject(MapParts.UnitInfoLarge);
    } else if (n === 3) {
        groupArray.appendObject(MapParts.UnitInfo);
    } else {
        groupArray.appendObject(MapParts.UnitInfoSmall);
    }

    groupArray.appendObject(MapParts.Terrain);
};
