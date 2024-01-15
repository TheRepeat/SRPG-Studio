/**
 * Defines the new Fatigue/Ftg stat.
 */
(function () {
    var alias1 = ParamGroup._configureUnitParameters;
    ParamGroup._configureUnitParameters = function (groupArray) {
        alias1.call(this, groupArray);

        groupArray.appendObject(UnitParameter.FATIGUE);
    }
})();

RealBonus.getFatigue = function (unit) {
    return ParamBonus.getBonus(unit, ParamType.FATIGUE);
}

ParamType.FATIGUE = 776; // the number's arbitrary soooo

UnitParameter.FATIGUE = defineObject(BaseUnitParameter, {
    _unit: null,

    getUnitValue: function (unit) {
        var value = 0;

        if (unit.custom.fatigue) {
            value = unit.custom.fatigue;
        }

        return value;
    },

    setUnitValue: function (unit, value) {
        unit.custom.fatigue = value;
    },

    getMaxValue: function (unit, i) {
        return FatigueConfig.StatCap;
    },

    getParameterName: function () {
        return FatigueConfig.StatName;
    },

    getParameterType: function () {
        return ParamType.FATIGUE;
    },

    isParameterDisplayable: function (unitStatusType) {
        return FatigueControl.isFatigueDifficulty() &&
            FatigueConfig.ShowFatigueStat &&
            unitStatusType === UnitStatusType.UNITMENU;
    }
});