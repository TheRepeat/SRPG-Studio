/**
 * By Repeat.
 * v2.0
 * This plugin adds a skill to turn all attacks brave ("brave" meaning the number of attacks per round is multiplied, a la Fire Emblem's Brave Sword).
 * Special thanks to Goinza's 3H Gauntlets plugin for inspiration.
 * 
 * Make a Custom-type skill with keyword: 'brave' (case sensitive)
 * Optional custom parameters:
 *  (number) attackCount - number to multiply the attack count by.
 *      OPTIONAL. If left off, this value defaults to 2, i.e. attack count is doubled.
 *  (boolean) isInitOnly - if true, brave effect only works if the unit initiates combat.
 *      OPTIONAL. If left off, it is treated as false (works on all phases).
 *  (number) weaponInteractionType - value of 0, 1 or 2.
 *      OPTIONAL. If left off, it is treated as 0.
 *      0 - if a unit has a brave weapon and a brave skill, the weapon's Attack Count overrides the skill. Default.
 *      1 - the reverse; the skill's effect overrides the weapon's.
 *      2 - if you're feeling a little wild, this makes the weapon's and skill's Attack Counts stack together multiplicatively.
 *      Ex: a weapon that triples attacks alongside a skill that doubles attacks will lead to a final attack count of 6.
 *      If you think 0/1/2 are too vague, you can put BraveSkillType.WEAPONWINS, BraveSkillType.SKILLWINS or BraveSkillType.EFFECTSTACKS instead.
 *      Wordy, but makes it clearer exactly what your skill does when you're looking back through your custom parameters sometime in the future.
 *  (boolean) hasEnemyCondition - whether Effective Targets refers to the skill holder or their opponent.
 *      OPTIONAL. If left off, it is treated as false (Effective Targets refers to the skill holder, not the target).
 *      In-engine, the Effective Targets window lets you pick stuff like classes, weapon types, etc. as conditions that must be true for the skill to activate.
 *      By default, these conditions apply to the USER, the unit that has the skill. The USER must be wielding a sword, the USER must be a swordmaster, whatever.
 *      If you set hasEnemyCondition to true, then Effective Targets will instead apply to the TARGET. The TARGET must be wielding an axe, the TARGET must be a cavalier, whatever.
 * 
 * Example 1:
    {
        attackCount: 3,
        isInitOnly: true,
        weaponInteractionType: 2,
        hasEnemyCondition: true
    }
 * Example 2:
    {
        weaponInteractionType: BraveSkillType.SKILLWINS
    }
 * 
 */

var BraveSkillType = {
    WEAPONWINS: 0,
    SKILLWINS: 1,
    EFFECTSTACKS: 2
};

(function () {
    var alias1 = Calculator.calculateAttackCount;
    Calculator.calculateAttackCount = function (active, passive, weapon) {
        var skill = SkillControl.getPossessionCustomSkill(active, 'brave');

        if (skill) {
            return getAttackCountFromSkill(active, passive, skill, weapon);
        } else {
            return alias1.apply(this, arguments);
        }
    }
})();

function getAttackCountFromSkill(unit, targetUnit, skill, weapon) {
    var baselineAttackCount = weapon.getAttackCount();

    // this covers weaponInteractionType being undefined or 0 - i.e. a weapon with increased Attack Count overrides the skill
    if (!skill.custom.weaponInteractionType && weapon.getAttackCount() !== 1) {
        return baselineAttackCount;
    }

    // if isInitOnly, only proc on unit's own phase
    if (skill.custom.isInitOnly && unit.getUnitType() !== root.getCurrentSession().getTurnType()) {
        return baselineAttackCount;
    }

    // if there are any other conditions specified in Effective Targets, consider those first.
    // Say, a brave skill that only works for a unit with a sword equipped would have that specified in-engine instead of in code
    var aggregation = skill.getTargetAggregation();

    if (skill.custom.hasEnemyCondition) {
        if (!aggregation.isCondition(targetUnit)) {
            return baselineAttackCount;
        }
    } else if (!aggregation.isCondition(unit)) {
        return baselineAttackCount;
    }

    var attackCount = skill.custom.attackCount || 2;

    if (skill.custom.weaponInteractionType === BraveSkillType.EFFECTSTACKS) {
        attackCount *= baselineAttackCount;
    }

    return attackCount;
}
