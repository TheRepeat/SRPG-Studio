/* By Repeat.
   A weapon with custom parameter {althit:true} will ignore the opponent's Avoid stat.
   A skill with the keyword "althit" will provide the same effect.
*/

(function () {

    var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
    SkillRandomizer.isCustomSkillInvokedInternal = function (active, passive, skill, keyword) {
        if (keyword === 'althit') {
            return this._isSkillInvokedInternal(active, passive, skill);
        }
        return alias1.call(this, active, passive, skill, keyword);
    }

    var calhit = HitCalculator.calculateHit;
    HitCalculator.calculateHit = function (active, passive, weapon, activeTotalStatus, passiveTotalStatus) {
        var percent;
        var skill = SkillControl.getPossessionCustomSkill(active, 'althit');

        if (skill || weapon.custom.althit) {

            if (root.isAbsoluteHit()) {
                if (passive.isImmortal()) {
                    // If the opponent is immortal, hit rate cannot be 100%.
                    return 99;
                }
                return 100;
            }

            percent = this.calculateSingleHit(active, passive, weapon, activeTotalStatus);
        }
        else {
            percent = calhit.call(this, active, passive, weapon, activeTotalStatus, passiveTotalStatus);
        }
        return this.validValue(active, passive, weapon, percent);
    }
})();