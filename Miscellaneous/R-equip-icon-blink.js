/**
 * By Repeat.
 * Simple on/off config switch for the engine's new IconDecorationType.EQUIPWEAPON feature.
 * On=show blinking icons (like status effects or rescue/capture icons) representing units' equipped weapons.
 * Off=do not do that.
 * 
 * Feel free to edit the text at the top.
 */

var EquipIconBlinkEnum = {
    CONFIG_TITLE: 'Blinking Equip Icon',
    CONFIG_DESC: 'Show equipped weapons as blinking icons on the map.'
};

(function () {
    var alias1 = MapIconDecorator._addDecorationData;
    MapIconDecorator._addDecorationData = function (obj) {
        alias1.call(this, obj);

        if (!ConfigItem.EquipIconBlink.isDisabled()) {
            var pos = this._getStatePos();

            obj.addObjectType(pos.x, pos.y, IconDecorationType.EQUIPWEAPON, true);
        }
    }

    var alias2 = ConfigWindow._configureConfigItem;
    ConfigWindow._configureConfigItem = function (groupArray) {
        alias2.call(this, groupArray);

        groupArray.appendObject(ConfigItem.EquipIconBlink);
    };
})();

ConfigItem.EquipIconBlink = defineObject(BaseConfigtItem, {
    isDisabled: function () {
        return this.getFlagValue() === 1;
    },

    selectFlag: function (index) {
        root.getExternalData().env.EquipIconBlink = index;
		MapIconDecorator.setupDecoration();
    },

    getFlagValue: function () {
        if (typeof root.getExternalData().env.EquipIconBlink !== 'number') {
            return 0;
        }

        return root.getExternalData().env.EquipIconBlink;
    },

    getFlagCount: function () {
        return 2;
    },

    getConfigItemTitle: function () {
        return EquipIconBlinkEnum.CONFIG_TITLE;
    },

    getObjectArray: function () {
        return [StringTable.Select_On, StringTable.Select_Off];
    },

    getConfigItemDescription: function () {
        return EquipIconBlinkEnum.CONFIG_DESC;
    }
});
