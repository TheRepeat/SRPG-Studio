/**
 * By Repeat.
 * When a unit has a skill with keyword "Powermove", the unit will gain attack power based on
 * how many tiles it crossed to reach its target.
 * By default, the power boost is equal to how many spaces the unit moved.
 * With the custom parameter {boost:n}, where n is an integer, the unit's power 
 * is instead increased by n times the number of spaces moved.
 * 
 * More custom parameter shenannies:
 * Use custom parameter {weaponcategory:n,weapontype:n} if you want this skill to only work with one weapon type.
 * weaponcategory is a value from 0 to 2. 0=weapon, 1=bow, 2=magic
 * weapontype is the ID number of the valid weapon type
 * (You can find these ID numbers in Database>Config>Weapon Types in SRPG Studio.)
 * NOTE: This plugin allows either ALL weapon types or ONLY ONE weapon type, nothing in between.
 * You can make multiples of the skill with different custom params if you want it to behave more specifically.
 * 
 * If you want to exclude a weapon from being able to use Powermove, then give that weapon the custom parameter {noPowermove:true} to prevent
 * it from taking advantage of the Powermove skill.
 * 
 * Naturally, if you want to use all of these custom parameters together, just encase them all in the same curly braces {} and
 * separate each parameter with a comma. For example:
{
boost:2,
weaponcategory:0,
weapontype:1
}
 * 
 * The AI can use powermove too, and will consider maximizing their damage with it. Beware.
 */

(function () {
    // set runDistance so it's accessible during damage calc later
    var alias1 = SimulateMove._saveMostResentMov;
    SimulateMove._saveMostResentMov = function (unit, moveCource) {
        unit.custom.runDistance = moveCource.length;

        alias1.call(this, unit, moveCource);
    }

    var alias2 = DamageCalculator.calculateAttackPower;
    DamageCalculator.calculateAttackPower = function (active, passive, weapon, isCritical, totalStatus, trueHitValue) {
        var pow = alias2.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue);
        var able = true;
        var skill = SkillControl.getPossessionCustomSkill(active, 'Powermove');
        var turnMatch = active.getUnitType() === root.getCurrentSession().getTurnType();

        if (!skill || !turnMatch || weapon.custom.noPowermove) {
            return pow;
        }

        var boost = skill.custom.boost || 1;

        if (skill && typeof skill.custom.weapontype !== 'undefined' && typeof skill.custom.weaponcategory !== 'undefined') {
            var weaponType = root.getBaseData()
                .getWeaponTypeList(skill.custom.weaponcategory)
                .getDataFromId(skill.custom.weapontype);

            able = weapon.isWeaponTypeMatched(weaponType);
        }

        return able ? pow + (active.custom.runDistance * boost) : pow;
    }

    // cleanup at end of action
    var alias3 = UnitWaitFlowEntry._completeMemberData;
    UnitWaitFlowEntry._completeMemberData = function (playerTurn) {
        alias3.call(this, playerTurn);

        var unit = playerTurn.getTurnTargetUnit();

        unit.custom.runDistance = null;
    }

    // precludes scenario where you move->see forecast->cancel move->attack a unit without moving -
    // would store the runDistance from the move if it weren't for this
    var alias4 = SimulateMove.noMove;
    SimulateMove.noMove = function (unit) {
        alias4.call(this, unit);

        unit.custom.runDistance = null;
    }

    // Gives AI the ability to use powermove
    var alias5 = AIScorer.Weapon._getDamage;
    AIScorer.Weapon._getDamage = function (unit, combination) {
        var skill = SkillControl.getPossessionCustomSkill(unit, 'Powermove');

        if (!skill) {
            return alias5.call(this, unit, combination);
        }

        var targetUnit = combination.targetUnit;
        var x = targetUnit.getMapX();
        var y = targetUnit.getMapY();
		var goalIndex = CurrentMap.getIndex(x, y);

		var simulator = root.getCurrentSession().createMapSimulator();
		simulator.startSimulation(unit, CurrentMap.getWidth() * CurrentMap.getHeight());
        
        var moveCource = CourceBuilder.createExtendCource(unit, goalIndex, simulator);

        unit.custom.runDistance = moveCource.length;

        // need to call calculateDamage AFTER runDistance is set
        // so the alias must be called here instead of, say, assigning to a variable at the start
		return alias5.call(this, unit, combination);
    }

    var alias6 = CombinationSelector._configureScorerSecond
    CombinationSelector._configureScorerSecond = function(groupArray) {
		alias6.call(this, groupArray);

        groupArray.appendObject(AIScorer.Distance);
	}
})();

// If the point is further from the unit's starting position, score it higher (if they have the skill).
// The enemy will want to move to positions that deal as much powermove damage as possible.
AIScorer.Distance = defineObject(BaseAIScorer, {
    getScore: function(unit, combination) {
        var skill = SkillControl.getPossessionCustomSkill(unit, 'Powermove');

        if (!skill) {
            return 0;
        }

		var score = 0;
		var index = combination.posIndex;
		var simulator = root.getCurrentSession().createMapSimulator();
		simulator.startSimulation(unit, CurrentMap.getWidth() * CurrentMap.getHeight());
        
        var moveCource = CourceBuilder.createExtendCource(unit, index, simulator);
		
		score += moveCource.length;
		
		return score;
	}
});
