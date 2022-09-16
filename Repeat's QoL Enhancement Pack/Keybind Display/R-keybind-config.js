

(function () {
    var alias1 = ConfigWindow._configureConfigItem;
    ConfigWindow._configureConfigItem = function (groupArray) {
        alias1.call(this, groupArray);

        groupArray.appendObject(ConfigItem.ShowKeybinds);
    };
})();

ConfigItem.ShowKeybinds = defineObject(BaseConfigtItem, {
    isDisabled: function () {
        return this.getFlagValue() === 2;
    },

    selectFlag: function (index) {
        root.getExternalData().env.ShowKeybinds = index;
    },

    getFlagValue: function () {
        if (typeof root.getExternalData().env.ShowKeybinds !== 'number') {
            return 0;
        }

        return root.getExternalData().env.ShowKeybinds;
    },

    getFlagCount: function () {
        return 3;
    },

    getConfigItemTitle: function () {
        return KeybindStrings.CONFIGNAME;
    },

    getObjectArray: function () {
        return [KeybindStrings.OPTION_PC, KeybindStrings.OPTION_XBOX, StringTable.Select_Off];
    },

    getConfigItemDescription: function () {
        return KeybindStrings.CONFIGDESC;
    }
});
