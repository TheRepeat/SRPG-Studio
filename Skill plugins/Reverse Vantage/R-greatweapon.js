/**
 * By Repeat.
 * Kinda like reverse vantage, but the enemy gets to do all their attacks in a row before the player's are considered.
 * Basically Engage's Greatsword et al.
 * Keyword for your custom skill: Greatweapon
 */

(function () {
    var alias1 = Calculator.calculateAttackCount;
    Calculator.calculateAttackCount = function (active, passive, weapon) {
        var skill = SkillControl.getPossessionCustomSkill(passive, 'Greatweapon');
        var attackCount = alias1.call(this, active, passive, weapon);

        if (!skill) {
            return attackCount;
        }

        var roundCount = this.calculateRoundCount(active, passive, weapon, true);

        return attackCount * roundCount;
    }

    var alias2 = Calculator.calculateRoundCount;
    Calculator.calculateRoundCount = function (active, passive, weapon, shouldGetTrueRoundCount) {
        var skill = SkillControl.getPossessionCustomSkill(passive, 'Greatweapon');
        var roundCount = alias2.call(this, active, passive, weapon);

        if (!skill || shouldGetTrueRoundCount) {
            return roundCount;
        }

       return 1;
    }

    var alias3 = NormalAttackOrderBuilder._isDefaultPriority;
    NormalAttackOrderBuilder._isDefaultPriority = function (virtualActive, virtualPassive) {
		var active = virtualActive.unitSelf;
        var isDefaultPriority = alias3.call(this, virtualActive, virtualPassive);

        if (this._attackInfo.isCounterattack) {
            var skill = SkillControl.getPossessionCustomSkill(active, 'Greatweapon');
            if (skill) {
                return false;
            }
        }

        return isDefaultPriority;
    }
})();
