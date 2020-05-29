/* By Repeat.
   When a unit has a skill with keyword "Powermove", the unit will gain attack power based on
   how much movement it spent to reach the target.
   By default, the power boost is equal to how many spaces the unit moved.
   With the custom parameter {boost:n}, where n is an integer, the unit's power 
   is instead increased by n times the number of spaces moved.
*/

(function () {

    // I referenced the blow skills script to learn how to do all this, so thank you Rena :)
    var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
    SkillRandomizer.isCustomSkillInvokedInternal = function (active, passive, skill, keyword) {
        if (keyword === 'Powermove') {
            return this._isSkillInvokedInternal(active, passive, skill);
        }
        return alias1.call(this, active, passive, skill, keyword);
    }

    var alias2 = DamageCalculator.calculateAttackPower;
    DamageCalculator.calculateAttackPower = function (active, passive, weapon, isCritical, totalStatus, trueHitValue) {
        var pow = alias2.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue);
        var skill = SkillControl.getPossessionCustomSkill(active, 'Powermove');

        if (skill) {
            if (typeof skill.custom.boost !== 'undefined') {
                pow += active.getMostResentMov() * skill.custom.boost;
            }
            else {
                pow += active.getMostResentMov();
            }
        }

        return pow;
    }
})();