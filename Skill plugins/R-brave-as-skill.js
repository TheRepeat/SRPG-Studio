/**
 * By Repeat.
 * This plugin adds a skill to turn all attacks brave (brave meaning the number of attacks per round is multiplied, e.g. Fire Emblem's Brave Swords.)
 * Custom skill type, keyword: 'brave'
 * Custom parameters:
 *  (number) attackCount - number of attacks to perform.
 *      MANDATORY. If left off, the skill does nothing.
 *  (boolean) isInitOnly - if true, brave effect only works if the unit initiates combat.
 *      OPTIONAL. If left off, it is treated as false (works on all phases).
 * 
 * Example custom parameters:
    {
        attackCount:2,
        isInitOnly:true
    }
 * 
 * Special thanks to Goinza's 3H Gauntlets plugin for inspiration.
 */

(function () {
    var alias1 = Calculator.calculateAttackCount;
    Calculator.calculateAttackCount = function (active, passive, weapon) {
        var skill = SkillControl.getPossessionCustomSkill(active, 'brave');
        var count = alias1.call(this, active, passive, weapon);

        if (weapon.getAttackCount() !== 1) {
            return count;
        }
        if (skill && skill.custom.attackCount) {
            if (skill.custom.isInitOnly) {
                var turnMatch = unit.getUnitType() === root.getCurrentSession().getTurnType();
                var ableUnit = root.getCurrentScene() === SceneType.FREE ? turnMatch : false;

                if (!ableUnit) {
                    return count;
                }
            }

            count = skill.custom.attackCount;
        }

        return count;
    }
})();
