/**
 * By Repeat.
 * Given a Damage Guard type skill with the custom parameter {damageGuardIndex:n} (where n is a number),
 * you can add a custom parameter {breakDamageGuardIndex:n} to a weapon,
 * where n is the same number as the one on the skill,
 * and that Damage Guard skill will be negated by that weapon.
 * 
 * Example:
 * Weapon custom param: {breakDamageGuardIndex:4}
 * Skill custom param: {damageGuardIndex:4}
 *  * The weapon will break this skill, preventing the damage guard skill from activating.
 * Skill custom param: {damageGuardIndex:1}
 *  * The weapon will not break this skill, because the skill's damageGuardIndex doesn't match the weapon's breakDamageGuardIndex.
 * 
 * Alternatively, instead of a weapon custom param, you can use a custom skill.
 * Keyword: BreakDamageGuard
 * Custom parameter: {breakDamageGuardIndex:n} where n is any number
 * 
 * Function(s) overridden without alias:
 *  * AttackEvaluator.ActiveAction._getDamageGuardValue
 */

AttackEvaluator.ActiveAction._getDamageGuardValue = function(virtualActive, virtualPassive, attackEntry) {
    var i, count, skill;
    var value = -1;
    var arr = SkillControl.getDirectSkillArray(virtualPassive.unitSelf, SkillType.DAMAGEGUARD, '');
    
    count = arr.length;
    for (i = 0; i < count; i++) {
        skill = arr[i].skill;
        
        // Check if the weapon to guard.
        if (!ItemControl.isWeaponTypeAllowed(skill.getDataReferenceList(), virtualActive.weapon)) {
            continue;
        }

        // this condition is the new part - skip if the attacker can ignore this damageguard skill
        if (this._shouldNegateDamageGuard(virtualActive, skill)) {
            continue;
        }
        
        if (!SkillRandomizer.isSkillInvoked(virtualPassive.unitSelf, virtualActive.unitSelf, skill)) {
            // Activation rate of the skill wasn't satisfied.
            continue;
        }
        
        if (skill.isSkillDisplayable()) {
            attackEntry.skillArrayPassive.push(skill);
        }
        
        value = skill.getSkillValue();
        
        break;
    }
    
    return value;
}

AttackEvaluator.ActiveAction._shouldNegateDamageGuard = function (virtualActive, skill) {
    var weapon = virtualActive.weapon;
    var unit = virtualActive.unitSelf;
    var breakSkill = SkillControl.getPossessionCustomSkill(unit, 'BreakDamageGuard');

    if (typeof skill.custom.damageGuardIndex !== 'number') {
        return false;
    }

    if (typeof weapon.custom.breakDamageGuardIndex === 'number' &&
        skill.custom.damageGuardIndex === weapon.custom.breakDamageGuardIndex) {
        return true;
    }

    if (breakSkill && skill.custom.damageGuardIndex === breakSkill.custom.breakDamageGuardIndex) {
        return true;
    }

    return false;
}
