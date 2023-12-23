/**
 * By Repeat.
 * This plugin creates a skill that adds the weapon's weight to attack power.
 * 
 * Instructions:
 * Create a Custom skill with the following keyword:
 *      weightPower
 */

(function () {
    var calculatorAlias = DamageCalculator.calculateAttackPower;
    DamageCalculator.calculateAttackPower = function (active, passive, weapon, isCritical, totalStatus, trueHitValue) {
        var pow = calculatorAlias.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue)
        var skill = SkillControl.getPossessionCustomSkill(active, 'weightPower');

        if (skill) {
            pow += weapon.getWeight();
        }

        return pow;
    }
})();
