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
 * - If using Claris's CL_R-Staff-Miss, then unit will give extra priority to targets it is more likely to hit.

 * OPTIONAL CUSTOM PARAMETERS:
 * @param {number} noRescueRange (unit custom parameter - optional)
 * @param {number} noEntrapRange (unit custom parameter - optional)
 * Define a unit's individual minimum Rescue or Entrap range using custom parameters noRescueRange and noEntrapRange.
 * If you don't opt into these parameters, they default to 4 and 1 respectively.
 * Example:
 * {noRescueRange:2} 
 * ^AI will not waste Rescue on targets within 2 spaces of unit.

 * @param {number} rescueHitTreatedAs (unit custom parameter - optional)
 * If you aren't using CL_R-Staff-Miss.js, which gives Entrap staves the ability to miss, this custom parameter means nothing to you.
 * Define a unit's proclivity toward rescuing over entrapping. That is, what hit rate is Rescue treated as for this staff user?
 * Since higher hit rates are prioritized over lower, this is basically the hit% threshold where the unit stops prioritizing Entrap over Rescue.
 * By default, this value is 50, meaning the staff user will prefer targeting guaranteed Rescue targets instead of Entrap users below 50% hit.
 * Examples:
 *   {rescueHitTreatedAs:100}
 *   ^AI will always prioritize guaranteed staff uses over gambles.
 *   {rescueHitTreatedAs:0}
 *   ^AI will always prioritize taking a chance at Entrapping enemies.
 *  */
(function () {

    var getDist = function (unit, targetUnit) {
        var X1, Y1, X2, Y2;
        X1 = unit.getMapX();
        Y1 = unit.getMapY();
        X2 = targetUnit.getMapX();
        Y2 = targetUnit.getMapY();
        return Math.abs((X1 + Y1) - (X2 + Y2));
    }

    RescueItemAI.getItemScore = function (unit, combination) {
        var n = 10;
        // The range at which the staff user will not target the unit.
        // 0: All units are eligible. 1: adjacent units are ineligible. 2: units within 2 spaces are ineligible. Etc.
        var noRescueRange = unit.custom.noRescueRange || 4;
        var noEntrapRange = unit.custom.noEntrapRange || 1;
        var i = 0;
        var chance = unit.custom.rescueHitTreatedAs || 50;

        // This checks the unit's inventory for *some* staff that fills the requirements.
        // It will not work properly if enemies have multiple Entrap staves with varying hit rates, since it only looks for the first one.
        while (unit.getItem(i) !== null) {
            // don't bother looking when it's a Rescue staff
            if(unit.getUnitType() === combination.targetUnit.getUnitType()) {
                break;
            }
            // don't bother looking if not using the modified CL_R-Staff-Miss.js
            if (typeof calculateRescueHit !== 'function') {
                break;
            }
            var item = unit.getItem(i);
            // Check accuracy for Entrap staff only if it has the right custom parameter
            if (item.getItemType() === ItemType.RESCUE && item.custom.StaffMissCL) {
                chance = calculateRescueHit(unit, combination.targetUnit, item);
                break;
            }
            i++;
        }

        // Rescue distance
        if (unit.getUnitType() === combination.targetUnit.getUnitType() && getDist(unit, combination.targetUnit) <= noRescueRange) {
            return AIValue.MIN_SCORE;
        }

        // Entrap distance
        if (unit.getUnitType() !== combination.targetUnit.getUnitType() && getDist(unit, combination.targetUnit) <= noEntrapRange) {
            return AIValue.MIN_SCORE;
        }

        // Prioritize targets with lower HP percent
        var percent = combination.targetUnit.getHp() / ParamBonus.getMhp(combination.targetUnit) * 100;
        n += (100 - percent);

        // If HP percents and hit rates are roughly equal, give small edge to units further away
        n += getDist(unit, combination.targetUnit);

        // Give further edge to units that are easier to hit, if applicable
        n += chance;

        return n;
    }
})();