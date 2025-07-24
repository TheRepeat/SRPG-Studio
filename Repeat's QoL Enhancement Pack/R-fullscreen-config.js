/**
 * By Repeat.
 * Adds "switch to fullscreen" as a config option.
 */

var FullscreenConfigStrings = {
    TITLE: 'Toggle Fullscreen',
    DESCRIPTION: 'Toggle between fullscreen and windowed mode.',
    OPTION__FULLSCREEN: 'Full',
    OPTION__WINDOWED: 'Win.'
};

(function () {
    var alias1 = ConfigWindow._configureConfigItem;
    ConfigWindow._configureConfigItem = function (groupArray) {
        alias1.call(this, groupArray);

        groupArray.appendObject(ConfigItem.Fullscreen);
    };
})();

ConfigItem.Fullscreen = defineObject(BaseConfigtItem, {
    selectFlag: function (index) {
        if (index === 0) {
            root.setAppScreenMode(AppScreenMode.FULLSCREEN);
        } else {
            root.setAppScreenMode(AppScreenMode.WINDOW);
        }
    },

    getFlagValue: function () {
        return root.getAppScreenMode() > AppScreenMode.WINDOW ? 0 : 1;
    },

    getFlagCount: function () {
        return 2;
    },

    getConfigItemTitle: function () {
        return FullscreenConfigStrings.TITLE;
    },

    getObjectArray: function () {
        return [FullscreenConfigStrings.OPTION__FULLSCREEN, FullscreenConfigStrings.OPTION__WINDOWED];
    },

    getConfigItemDescription: function () {
        return FullscreenConfigStrings.DESCRIPTION;
    }
});