/* By Repeat.
   Before battle, if a unit's attacks will be sealed by the other's skills/equipped weapon,
   that unit's battle stats will not display in the battle forecast.
   If you're using the Effectivity Recolor plugin, then make sure this intuitive seal plugin is LATER in the load order!
*/

(function () {
    PosAttackWindow.hasValidSealSkill = function (unit, item, targetUnit) {
        var skill = SkillControl.getBattleSkillFromValue(targetUnit, unit, SkillType.BATTLERESTRICTION, BattleRestrictionValue.SEALATTACK);
        if (skill) {
            var targets = skill.getTargetAggregation();
            if (targets.isCondition(unit) || targets.isConditionFromWeapon(unit, item)) {
                return true;
            }
        }
        return false;
    }

    PosAttackWindow.hasValidBreakSealSkill = function (unit, item, targetUnit) {
        var skill = SkillControl.getBattleSkillFromFlag(unit, targetUnit, SkillType.INVALID, InvalidFlag.SEALATTACKBREAK);
        if (skill) {
            var targets = skill.getTargetAggregation();
            if (targets.isCondition(targetUnit) || targets.isConditionFromWeapon(targetUnit, item)) {
                return true;
            }
        }
        return false;
    }

    PosAttackWindow.isUnitSealed = function (unit, item, targetUnit) {
        var targetWeapon = ItemControl.getEquippedWeapon(targetUnit);
        var hasBreakSealSkill = false;
        var hasSealSkill = false;

        // look for Break Seal skills
        if (item) {
            hasBreakSealSkill = item.getWeaponOption() === WeaponOption.SEALATTACKBREAK;
        }
        hasBreakSealSkill = hasBreakSealSkill || this.hasValidBreakSealSkill(unit, targetWeapon, targetUnit);

        // look for Seal skills if Break Seal not found
        if (!hasBreakSealSkill) {
            if (targetWeapon) {
                hasSealSkill = targetWeapon.getWeaponOption() === WeaponOption.SEALATTACK;
            }
            hasSealSkill = hasSealSkill || this.hasValidSealSkill(unit, item, targetUnit);
        }

        return hasSealSkill;
    }

    // check isUnitSealed before updating statusarray
    var intSealAlias = PosAttackWindow.setPosTarget;
    PosAttackWindow.setPosTarget = function (unit, item, targetUnit, targetItem, isSrc) {
        var isCalculation = false;

        // compatibility. Not foolproof yet
        if (item !== null && !this.isUnitSealed(unit, item, targetUnit)) {
            intSealAlias.call(this, unit, item, targetUnit, targetItem, isSrc);
        }

        if (item !== null && item.isWeapon()) {

            if (isSrc) {
                // If the player has launched an attack, you need to check for any Seal Attack conditions.
                if (!this.isUnitSealed(unit, item, targetUnit)) {
                    this._statusArray = AttackChecker.getAttackStatusInternal(unit, item, targetUnit);
                    isCalculation = true;
                }
                else {
                    this._statusArray = AttackChecker.getNonStatus();
                }
            }
            else {
                if (AttackChecker.isCounterattack(targetUnit, unit) && !this.isUnitSealed(unit, item, targetUnit)) {
                    this._statusArray = AttackChecker.getAttackStatusInternal(unit, item, targetUnit);
                    isCalculation = true;
                }
                else {
                    this._statusArray = AttackChecker.getNonStatus();
                }
            }
        }
        else {
            this._statusArray = AttackChecker.getNonStatus();
        }

        if (isCalculation) {
            this._roundAttackCount = Calculator.calculateRoundCount(unit, targetUnit, item);
            this._roundAttackCount *= Calculator.calculateAttackCount(unit, targetUnit, item);
        }
        else {
            this._roundAttackCount = 0;
        }

        this.setPosInfo(unit, item, isSrc);
    }
})();

