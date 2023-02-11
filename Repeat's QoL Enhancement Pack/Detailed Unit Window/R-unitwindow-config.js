(function () {
    var alias1 = ConfigWindow._configureConfigItem;
    ConfigWindow._configureConfigItem = function (groupArray) {
        alias1.call(this, groupArray);

        for (var i = 0; i < groupArray.length; i++) {
            if (groupArray[i].getConfigItemTitle() === StringTable.Config_MapUnitWindow && getUnitWindowAllowedCount() < 2) {
                groupArray.splice(i, 1);
            }
        }

    }
})();

function getUnitWindowAllowedCount() {
    var count = 0;
    var entries = Object.entries(UnitWindowAllowedTypes);

    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i]; // e.g. ['XL',true]

        if (entry[1]) {
            count++;
        }
    }

    return count;
}

ConfigItem.UnitMenuStatus = defineObject(BaseConfigtItem, {
    selectFlag: function (index) {
        root.getMetaSession().setDefaultEnvironmentValue(8, index);
    },

    getFlagValue: function () {
        return root.getMetaSession().getDefaultEnvironmentValue(8);
    },

    getFlagCount: function () {
        return getUnitWindowAllowedCount();
    },

    getConfigItemTitle: function () {
        return StringTable.Config_MapUnitWindow;
    },

    getConfigItemDescription: function () {
        return StringTable.Config_MapUnitWindowDescription;
    },

    getConfigStrings: function () {
        var entries = Object.entries(UnitWindowConfigStrings);
        var configStrings = [];

        for (var i = 0; i < entries.length; i++) {
            var key = entries[i][0];
            var str = entries[i][1];

            if (UnitWindowAllowedTypes[key]) {
                configStrings.push(str);
            }
        }

        return configStrings;
    },

    getObjectArray: function () {
        return this.getConfigStrings();
    }
});

MapPartsCollection._configureMapParts = function (groupArray) {
    var n = root.getMetaSession().getDefaultEnvironmentValue(8);
    var parts = {
        XL: MapParts.UnitInfoExtraLarge,
        W: MapParts.UnitInfoWide,
        L: MapParts.UnitInfoLarge,
        M: MapParts.UnitInfo,
        S: MapParts.UnitInfoSmall
    };
    var partsArr = [];
    var entries = Object.entries(UnitWindowAllowedTypes);

    for (var i = 0; i < entries.length; i++) {
        var key = entries[i][0];
        var value = entries[i][1];

        if (value) {
            partsArr.push(parts[key]);
        }
    }

    groupArray.appendObject(partsArr[n]);
    groupArray.appendObject(MapParts.Terrain);
};
