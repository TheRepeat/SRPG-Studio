/* By Repeat.
   Before battle, if a unit's attacks will be sealed by the other's skills/equipped weapon,
   that unit's battle stats will not display in the battle forecast.
   If you're using the Effectivity Recolor plugin, then make sure this one is LATER in the load order!
*/

// match all skills with one that seals either fighter. The weapon option for Seal is handled elsewhere
var findSealSkill = function (skillReferenceList, unit, item) {
    var data, type, value, targets;
    var count = skillReferenceList.getTypeCount();
    for (i = 0; i < count; i++) {
        data = skillReferenceList.getTypeData(i);
        type = data.getSkillType();
        value = data.getSkillValue();
        if (type === SkillType.BATTLERESTRICTION && value === BattleRestrictionValue.SEALATTACK) {
            // get seal skill's aggregation data to see if the unit is a valid target to be sealed
            targets = data.getTargetAggregation();
            if (targets.isCondition(unit) || targets.isConditionFromWeapon(unit, item)) {
                return true;
            }
        }
    }
    return false;
}

// find any Break Seal skills. The weapon option for Break Seal is handled on its own, not here
var findBreakSealSkill = function (skillReferenceList, unit, item) {
    var data, type, value, targets;
    var count = skillReferenceList.getTypeCount();
    for (i = 0; i < count; i++) {
        data = skillReferenceList.getTypeData(i);
        type = data.getSkillType();
        value = data.getSkillValue();
        if (type === SkillType.INVALID && value === InvalidFlag.SEALATTACKBREAK) {
            targets = data.getTargetAggregation();
            if (targets.isCondition(unit) || targets.isConditionFromWeapon(unit, item)) {
                return true;
            }
        }
    }
    return false;
}

// Need to check every source a seal skill can come from.
// Skills can come from the unit, equipped weapon, class, terrain, and any items in the inventory.
PosAttackWindow.isUnitSealed = function (unit, item, targetUnit) {
    var found = false; // "does unit have a Break Seal Attack skill?"
    var result = false;

    var targetUnitSkills = targetUnit.getSkillReferenceList();
    var targetWeapon = ItemControl.getEquippedWeapon(targetUnit);
    if (targetWeapon !== null) {
        var targetWeaponSkills = targetWeapon.getSkillReferenceList();
    }
    var targetClassSkills = targetUnit.getClass().getSkillReferenceList();
    var targetTerrainSkills = root.getCurrentSession().getTerrainFromPos(targetUnit.getMapX(), targetUnit.getMapY(), true).getSkillReferenceList();
    var targetItemSkills = targetUnit.getItem(0) == null ? null : targetUnit.getItem(0).getSkillReferenceList(); // get only first item for now

    var unitSkills = unit.getSkillReferenceList();
    var unitWeapon = ItemControl.getEquippedWeapon(unit);
    if (unitWeapon !== null) {
        var unitWeaponSkills = unitWeapon.getSkillReferenceList();
    }
    var unitClassSkills = unit.getClass().getSkillReferenceList();
    var unitTerrainSkills = root.getCurrentSession().getTerrainFromPos(unit.getMapX(), unit.getMapY(), true).getSkillReferenceList();
    var unitItemSkills = unit.getItem(0) == null ? null : unit.getItem(0).getSkillReferenceList();
    var i; // for checking items

    // Don't bother looking for seal skills if the unit has a Break Seal skill.
    // This code kind of looks confusing, but all it's saying is if the skill's 
    // been found, set found=true; otherwise, keep looking
    found = found ? found : findBreakSealSkill(unitSkills, targetUnit, item);
    found = found ? found : findBreakSealSkill(unitWeaponSkills, targetUnit, item);
    found = found ? found : findBreakSealSkill(unitClassSkills, targetUnit, item);
    found = found ? found : findBreakSealSkill(unitTerrainSkills, targetUnit, item);
    i = 0;
    while (unitItemSkills != null) {
        if (!unit.getItem(i).isWeapon()) {
            found = found ? found : findBreakSealSkill(unitItemSkills);
        }
        i++;
        unitItemSkills = unit.getItem(i) == null ? null : unit.getItem(i).getSkillReferenceList();
    }

    // look for Seal skills
    if (targetWeapon !== null && item !== null && item.isWeapon() && item.getWeaponOption() !== WeaponOption.SEALATTACKBREAK && !found) {
        i = 0;
        if (targetWeapon.getWeaponOption() === WeaponOption.SEALATTACK) {
            result = true;
        }
        result = result ? result : findSealSkill(targetUnitSkills, unit, item);
        result = result ? result : findSealSkill(targetWeaponSkills, unit, item);
        result = result ? result : findSealSkill(targetClassSkills, unit, item);
        result = result ? result : findSealSkill(targetTerrainSkills, unit, item);
        while (targetItemSkills !== null) { // Check all items individually. Thanks to goinza's wary fighter script for help here
            if (!targetUnit.getItem(i).isWeapon()) {
                result = result == true ? true : findSealSkill(targetItemSkills, unit, item);
            }
            i++;
            targetItemSkills = targetUnit.getItem(i) == null ? null : targetUnit.getItem(i).getSkillReferenceList();
        }
    }
    return result;
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
