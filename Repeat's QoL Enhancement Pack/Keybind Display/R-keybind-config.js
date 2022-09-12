

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
        return 'Display Keybinds';
    },

    getObjectArray: function () {
        return ['PC', '360', StringTable.Select_Off];
    },

    getConfigItemDescription: function () {
        return 'Choose whether to display the current keybinds onscreen during gameplay.';
    }
});
