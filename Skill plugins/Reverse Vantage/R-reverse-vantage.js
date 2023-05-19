/**
 * By Repeat.
 * Skill that basically gives Vantage to the enemy (the enemy always goes first even if this unit initiates).
 * Good for a weapon gimmick, or maybe balance a really broken unit this way, or do whatever idk I'm not your mom
 * Keyword: reverseVantage
 */

(function () {
    var alias1 = NormalAttackOrderBuilder._isDefaultPriority;
    NormalAttackOrderBuilder._isDefaultPriority = function (virtualActive, virtualPassive) {
		var active = virtualActive.unitSelf;
		var passive = virtualPassive.unitSelf;
        var isDefaultPriority = alias1.call(this, virtualActive, virtualPassive);

        if (this._attackInfo.isCounterattack) {
            // If the opponent can counterattack, check if they have the custom skill.
            // If the attacker has no skill of preemptive attack, and the opponent has it instead, the opponent launches an attack.
            var skill = SkillControl.getPossessionCustomSkill(active, 'reverseVantage');
            if (skill) {
                return false;
            }
        }

        return isDefaultPriority;
    }
})();
