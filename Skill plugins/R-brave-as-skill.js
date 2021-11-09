/**
 * By Repeat.
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
                var ableUnit = root.getCurrentScene() === SceneType.FREE ? isUnitsOwnPhase(active) : false;
                if (!ableUnit) {
                    return count;
                }
            }
            count = skill.custom.attackCount;
        }

        return count;
    }

    isUnitsOwnPhase = function (unit) {
        var isPlayersPhase = root.getCurrentSession().getTurnType() === TurnType.PLAYER && unit.getUnitType() === UnitType.PLAYER;
        var isAllysPhase = root.getCurrentSession().getTurnType() === TurnType.ALLY && unit.getUnitType() === UnitType.ALLY
        var isEnemysPhase = root.getCurrentSession().getTurnType() === TurnType.ENEMY && unit.getUnitType() === UnitType.ENEMY
        
        return isPlayersPhase || isAllysPhase || isEnemysPhase;
    }

})();
