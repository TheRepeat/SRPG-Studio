/**
 * By Repeat.
 * Modification of a plugin by Claris.
 * Gives Inflict State, Damage, Rescue, and Steal items accuracy that scales with unit stats.
 * 
 *  * Default staff hit: (staff's hit) + Mag*3 + Skl
 *  * Default staff avo: Res*4 + Lck
 * 
 * Only applies to items or staves that have the custom parameter {usesAcc: true}
 * 
 * If you want to do something like give minimum/maximum hit and avoid values (say, min 1 and max 99), 
 * feel free to edit STAFF_HIT_FLOOR and STAFF_HIT_CEILING.
 * Distance between the units can factor into hit if you want. The formula is:
 *   Unit's Hit - Target's Avo - (distance * STAFF_DISTANCE_REDUCTION_MULTIPLIER).
 * Say you want the unit to lose 2 points of hit for each tile between them and the target: set STAFF_DISTANCE_REDUCTION_MULTIPLIER equal to 2.
 * Say you don't want distance to be a factor: set STAFF_DISTANCE_REDUCTION_MULTIPLIER equal to 0.
 * Say you're going bonkers and you want hit to *increase* over distance: set STAFF_DISTANCE_REDUCTION_MULTIPLIER equal to a negative number.
 * 
 * Damage and Inflict State items have in-engine Hit rates that are used by this plugin, but Rescue and Steal items do not.
 * To give accuracy to Rescue and Steal, give them not just the usesAcc parameter, but also a hitValue one.
 * Example:
 * { usesAcc: true, hitValue: 80 }
 * 
 * For inflict state staves, enemies will prioritize targets that they have higher Hit against.
 * The same is true for Damage items, but they still consider regular AI rules for dealing damage, 
 * so they still often prefer damage over higher hit.
 * Deployment order is the tiebreaker for equal hit chances.
 */

STAFF_HIT_FLOOR = 0;
STAFF_HIT_CEILING = 100;
STAFF_DISTANCE_REDUCTION_MULTIPLIER = 0;

function getStaffTrueHit(baseHit, unit, targetUnit) {
    var hit = getStaffAccuracy(baseHit, unit);
    var avo = getStaffAvoid(targetUnit);
    var dist = getDistanceBetweenUnits(unit, targetUnit) * STAFF_DISTANCE_REDUCTION_MULTIPLIER;

    return Math.min(Math.max(hit - avo - dist, STAFF_HIT_FLOOR), STAFF_HIT_CEILING);
}

function getStaffAccuracy(baseHit, unit) {
    var result = Math.round(baseHit + (RealBonus.getMag(unit) * 3) + RealBonus.getSki(unit));

    return result;
}

function getStaffAvoid(targetUnit) {
    var result = Math.round(RealBonus.getMdf(targetUnit) * 4 + RealBonus.getLuk(targetUnit));

    return result;
}

function getDistanceBetweenUnits(unit, targetUnit) {
    var dist = Math.abs(unit.getMapX() - targetUnit.getMapX())
        + Math.abs(unit.getMapY() - targetUnit.getMapY());

    return dist;
}

function logAIHitRate(trueHit, targetUnit) {
    root.log('hit=' + trueHit + '% on ' + targetUnit.getName());
}