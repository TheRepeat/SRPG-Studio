(function () {
    // inflict the effect after combat (not a state)
    var alias1 = PreAttack._doEndAction;
    PreAttack._doEndAction = function () {
        var active = this.getActiveUnit();
        var passive = this.getPassiveUnit();

        AutoberserkControl.conditionallySetAutoberserk(active);
        AutoberserkControl.conditionallySetAutoberserk(passive);

        AutoberserkControl.conditionallyUnsetAutoberserk(active, passive);

        alias1.call(this);
    }

    // Revert all affected units to players at end of map
    var alias2 = MapEndFlowEntry.enterFlowEntry;
    MapEndFlowEntry.enterFlowEntry = function (battleResultScene) {
        if (AutoberserkConfig.revertAtMapEnd) {
            AutoberserkControl.resetAllBerserkedUnits();
        }

        return alias2.call(this, battleResultScene);
    }

    var alias3 = BaseTurnLogoFlowEntry.doMainAction;
    BaseTurnLogoFlowEntry.doMainAction = function (isMusic) {
        // At the start of player phase, update counters
        if (root.getCurrentSession().getTurnType() === TurnType.PLAYER) {
            AutoberserkControl.updateTurnsLeft();
            AutoberserkControl.updateKillsLeft();
        }


        alias3.call(this, isMusic);
    }

    // The AI looooves to use their new autoberserk weapon
    var alias4 = AIScorer.Weapon.getScore;
    AIScorer.Weapon.getScore = function (unit, combination) {
        if (combination.item === null || !combination.item.isWeapon()) {
            return 0;
        }

        if (AutoberserkConfig.aiPrefersBerserkWeapon && combination.item.custom.autoberserk) {
            return 500;
        } else {
            return alias4.call(this, unit, combination);
        }
    }

    var alias5 = WeaponBrokenFlowEntry._checkDelete;
    WeaponBrokenFlowEntry._checkDelete = function (unit, generator) {
        alias5.call(this, unit, generator);

        var weapon = BattlerChecker.getBaseWeapon(unit);
        if (weapon === null) {
            return;
        }

        // use either the weapon's custom parameter or the default from the config to see if breaking the weapon cures autoberserk
        var removeBerserkAfterBreak = typeof weapon.custom.autoberserkBreakCures === 'boolean' ?
            weapon.custom.autoberserkBreakCures : AutoberserkConfig.defaultRemoveBerserkOnWeaponBreak;

        if (removeBerserkAfterBreak &&
            ItemControl.isItemBroken(weapon) &&
            weapon.custom.autoberserk) {
            unit.custom.justBrokeWeapon = true;
        }
    }

    // specific kinds of restore staves can remove the autoberserk status
    // Note that the staff has to be able to target ally units
    // This function allows the unit to select their staff if there is an autoberserked unit in range
    var alias6 = StateRecoveryItemAvailability.isItemAllowed;
    StateRecoveryItemAvailability.isItemAllowed = function (unit, targetUnit, item) {
        var able = item.custom.curesAutoberserk && targetUnit.custom.isBerserked;

        return alias6.call(this, unit, targetUnit, item) || able;
    }

    // This function allows the unit to select an autoberserked unit with their staff
    var alias7 = StateRecoveryItemSelection.isPosSelectable;
    StateRecoveryItemSelection.isPosSelectable = function () {
        var targetUnit = this._posSelector.getSelectorTarget(true);

        if (targetUnit === null) {
            return false;
        }

        if (this._item.custom.curesAutoberserk && targetUnit.custom.isBerserked) {
            return true;
        }

        return alias7.call(this);
    }

    // This function actually removes the autoberserk status from the target unit
    var alias8 = StateRecoveryItemUse.mainAction;
    StateRecoveryItemUse.mainAction = function () {
        var itemTargetInfo = this._itemUseParent.getItemTargetInfo();
        var item = itemTargetInfo.item;
        var unit = itemTargetInfo.targetUnit;

        alias8.call(this);

        if (item.custom.curesAutoberserk && unit.custom.isBerserked) {
            // revert status
            AutoberserkControl.removeAutoberserk(unit);
        }
    }

    var alias9 = UnitWaitFlowEntry._completeMemberData;
    UnitWaitFlowEntry._completeMemberData = function (playerTurn) {
        var event;
        var unit = playerTurn.getTurnTargetUnit();

        unit.setMostResentMov(0);

        if (!unit.custom.isBerserked) {
            return alias9.call(this, playerTurn);
        }

        // If a unit has just been berserked, don't set wait to true or they'll still be grayed out on their first Ally Phase
        // The faction change occurs *after* this, so we can say not to setWait if the unit has the custom parameter but is still a blue unit
        if (!Miscellaneous.isPlayerFreeAction(unit) && !(unit.getUnitType() === UnitType.PLAYER && unit.custom.isBerserked)) {
            unit.setWait(true);
        }

        event = this._getWaitEvent(unit);
        if (event === null) {
            return EnterResult.NOTENTER;
        }

        return this._capsuleEvent.enterCapsuleEvent(event, true);
    }

})();