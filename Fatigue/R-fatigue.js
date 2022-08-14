/**
 * By Repeat.
 * Thracia 776 style fatigue stat/system.
 * Units gain fatigue when performing actions:
 *  * 1 after an attack (win or loss) by default - weapon can have custom parameter fatigueCost for a different cost than 1
 *  * 1 after stealing
 *  * 1 after dancing
 *  * 1 after a staff by default - can also use custom parameter fatigueCost
 * 
 * When a map begins and a unit's Fatigue stat >= the unit's max HP, then the unit is not selectable in battle prep.
 *  * Related behavior: this plugin makes it so all units are deselected at map start, instead of autoselecting as many as it can.
 * 
 * A unit's Fatigue stat is reset to 0 at the end of a map if they were not sortied.
 * 
 * A unit's Fatigue stat can also be reset by using a custom consumable item.
 * 
 * Units can use a custom parameter fatigueRate to affect their fatigue growth per action. 
 *  * 0 for no fatigue growth (i.e. Leif), 1 for normal (default, doesn't need custom parameter), 2 for double fatigue rate, etc.
 */

(function () {
    // Reset stat to 0 for unsortied units on map end
    var alias1 = MapEndFlowEntry.enterFlowEntry;
    MapEndFlowEntry.enterFlowEntry = function (battleResultScene) {
        FatigueControl.resetUnsortiedFatigue();

        return alias1.call(this, battleResultScene);
    }

    // increment after any combat
    var alias2 = PreAttack._doEndAction;
    PreAttack._doEndAction = function () {
        // The attacker is Active if they kill and Passive if the target survives, so need to cover both cases.
        // SRPG Studio moment
        var active = this.getActiveUnit();
        var passive = this.getPassiveUnit();

        FatigueControl.incrementFatigue(active, ItemControl.getEquippedWeapon(active));
        FatigueControl.incrementFatigue(passive, ItemControl.getEquippedWeapon(passive));

        alias2.call(this);
    }

    // increment after using a staff
    var alias3 = ItemUseParent._completeMemberData;
    ItemUseParent._completeMemberData = function (itemTargetInfo) {
        var result = alias3.call(this);

        if (itemTargetInfo.item.isWand()) {
            FatigueControl.incrementFatigue(itemTargetInfo.unit, itemTargetInfo.item);
        }

        return result;
    }
})();

// increment after dancing
UnitCommand.Quick.endCommandAction = function () {
    FatigueControl.incrementFatigue(this.getCommandTarget());

    UnitListCommand.endCommandAction.call(this);
}

// increment after stealing
UnitCommand.Steal.endCommandAction = function () {
    FatigueControl.incrementFatigue(this.getCommandTarget());

    UnitListCommand.endCommandAction.call(this);
}

// object to do all the fatigue manipulation
var FatigueControl = defineObject(BaseObject, {
    incrementFatigue: function (unit, item) {
        if (unit.getUnitType() === UnitType.PLAYER) {
            var oldVal = RealBonus.getFatigue(unit);
            var newVal = this.getNewValue(unit, item, oldVal);

            UnitParameter.FATIGUE.setUnitValue(unit, newVal);
        }
    },

    getNewValue: function (unit, item, oldValue) {
        var value = 1;

        if (item && typeof item.custom.fatigueCost === 'number') {
            value = item.custom.fatigueCost;
        }

        if (typeof unit.custom.fatigueRate === 'number') {
            value *= unit.custom.fatigueRate
        }

        return oldValue + value;
    },

    isFatigued: function (unit) {
        return RealBonus.getFatigue(unit) >= ParamBonus.getMhp(unit);
    },

    resetUnsortiedFatigue: function () {
        var players = PlayerList.getAliveList();

        for (var i = 0; i < players.getCount(); i++) {
            var unit = players.getData(i);

            if (unit.getSortieState() === SortieType.UNSORTIE) {
                this.resetFatigue(unit);
            }
        }
    },

    resetAllFatigue: function () {
        var players = PlayerList.getAliveList();

        for (var i = 0; i < players.getCount(); i++) {
            this.resetFatigue(players.getData(i));
        }
    },

    resetFatigue: function (unit) {
        UnitParameter.FATIGUE.setUnitValue(unit, 0);
    }
})