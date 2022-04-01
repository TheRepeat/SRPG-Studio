/**
 * By Repeat.
 * Appends the config option to switch between a rectangle-shaped or a circle-shaped EXP bar.
 */
(function () {
    var alias1 = ConfigWindow._configureConfigItem;
    ConfigWindow._configureConfigItem = function (groupArray) {
        alias1.call(this, groupArray);

        groupArray.appendObject(ConfigItem.ExpGainType);
    };
})();

ConfigItem.ExpGainType = defineObject(BaseConfigtItem, {

    isDisabled: function () {
        return false;
    },

    selectFlag: function (index) {
        root.getExternalData().env.ExpGainType = index;
    },

    getFlagValue: function () {
        if (typeof root.getExternalData().env.ExpGainType !== 'number') {
            return 0;
        }

        return root.getExternalData().env.ExpGainType;
    },

    getFlagCount: function () {
        return 2;
    },

    getConfigItemTitle: function () {
        return 'EXP Display';
    },

    getConfigItemDescription: function () {
        return 'Choose how to display progress when gaining EXP.';
    },

    getObjectArray: function () {
        return ['Radial', 'Bar'];
    }
});
