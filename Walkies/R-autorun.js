/**
 * By Repeat.
 * Addition to the walkies plugin. Adds an in-game toggle for autorun.
 * Normally, you walk, then hold Cycle to double speed.
 * With autorun enabled, you usually run, and can hold Cycle to halve speed.
 */

(function () {
    var alias1 = ConfigWindow._configureConfigItem;
    ConfigWindow._configureConfigItem = function (groupArray) {
        alias1.call(this, groupArray);

        groupArray.appendObject(ConfigItem.Autorun);
    }
})();

ConfigItem.Autorun = defineObject(BaseConfigtItem, {
    isDisabled: function () {
        return this.getFlagValue() === 0;
    },

    selectFlag: function (index) {
        root.getExternalData().env.Autorun = index;
    },

    getFlagValue: function () {
        if (typeof root.getExternalData().env.Autorun !== 'number') {
            return 0;
        }

        return root.getExternalData().env.Autorun;
    },

    getFlagCount: function () {
        return 2;
    },

    getConfigItemTitle: function () {
        return 'Auto Run';
    },

    getConfigItemDescription: function () {
        var text = 'walks';

        if (!this.isDisabled()) {
            text = 'runs';
        }

        return 'While exploring, the lead unit ' + text + ' by default.';
    },

    getObjectArray: function () {
        return ['Off', 'On'];
    }
});
