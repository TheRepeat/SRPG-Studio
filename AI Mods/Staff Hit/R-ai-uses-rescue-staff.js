/**
 * By Repeat.
 * Enables basic AI allowing enemy units to use Rescue/Entrap staves.
 * This refers to staves of type Rescue.
 * What is referred to as "Rescue" is when the item's filter is set to Player and/or Ally.
 * What is referred to as "Entrap" is when the item's filter is set to Enemy. It takes its name from the staff from Fire Emblem Fates. (ファイアーエムブレムif : ドロー)

 * Notes: 
 * - AI will not target units within a specified minimum range, which can be edited with custom parameters.
 * - AI will always prioritize targets with a lower remaining HP% (HP/MHP).
 * - AI will give slight priority boost to units that are farther away.
 * - Unit will give extra priority to targets it is more likely to hit.

 * OPTIONAL CUSTOM PARAMETERS:
 * @param {number} noRescueRange (unit custom parameter - optional)
 * @param {number} noEntrapRange (unit custom parameter - optional)
 * Define a unit's individual minimum Rescue or Entrap range using custom parameters noRescueRange and noEntrapRange.
 * Example:
 * {noRescueRange:2} 
 * ^AI will not waste Rescue on targets within 2 spaces of unit.
 * If you don't opt into these parameters, they default to 4.
 * You can change these global defaults by editing RESCUE_MIN_RANGE and ENTRAP_MIN_RANGE.

 * @param {number} rescueHitTreatedAs (unit custom parameter - optional)
 * Define a unit's proclivity toward rescuing over entrapping. That is, what hit rate is Rescue treated as for this staff user?
 * (Rescue does not actually have accuracy; this is just for determining AI behaviors, assuming Entrap does have accuracy.)
 * Since higher hit rates are prioritized over lower, this is basically the hit% threshold where the unit stops prioritizing Entrap over Rescue.
 * Examples:
 *   {rescueHitTreatedAs:100}
 *   ^AI will always prioritize guaranteed staff uses over gambles.
 *   {rescueHitTreatedAs:45}
 *   ^If the AI's best Entrap chance is less than 45%, it will prefer using Rescue instead.
 *   {rescueHitTreatedAs:0}
 *   ^AI will always prioritize taking a chance at Entrapping enemies.
 * By default, this value is 50, meaning the staff user will prefer targeting guaranteed Rescue targets instead of Entrap users below 50% hit.
 * You can change this global default by editing RESCUE_HIT_TREATED_AS.
 * 
 * Function(s) overridden without alias:
 *  * RescueItemAI.getItemScore
 *  */

RESCUE_MIN_RANGE = 4;
ENTRAP_MIN_RANGE = 4;
RESCUE_HIT_TREATED_AS = 50;

RescueItemAI.getItemScore = function (unit, combination) {
    var n = 10;
    // The range at which the staff user will not target the unit.
    // 0: All units are eligible. 1: adjacent units are ineligible. 2: units within 2 spaces are ineligible. Etc.
    var noRescueRange = typeof unit.custom.noRescueRange === 'number' ? unit.custom.noRescueRange : RESCUE_MIN_RANGE;
    var noEntrapRange = typeof unit.custom.noEntrapRange === 'number' ? unit.custom.noEntrapRange : ENTRAP_MIN_RANGE;
    var chance = typeof unit.custom.rescueHitTreatedAs === 'number' ? unit.custom.rescueHitTreatedAs : RESCUE_HIT_TREATED_AS;
    var targetUnit = combination.targetUnit;
    var item = combination.item;
    var dist = getDistanceBetweenUnits(unit, targetUnit);

    // Check accuracy if applicable
    if (item.custom.usesAcc) {
        chance = getStaffTrueHit(item.custom.hitValue, unit, targetUnit);
    }

    // Rescue distance
    if (dist <= noRescueRange) {
        return AIValue.MIN_SCORE;
    }

    // Entrap distance
    if (dist <= noEntrapRange) {
        return AIValue.MIN_SCORE;
    }

    // Prioritize targets with lower HP percent
    var percent = targetUnit.getHp() / ParamBonus.getMhp(targetUnit) * 100;
    n += 100 - percent;

    // If HP percents and hit rates are roughly equal, give small edge to units further away
    n += dist;

    // Give further edge to units that are easier to hit, if applicable
    n += chance;

    return n;
}