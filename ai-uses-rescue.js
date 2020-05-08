/* By Repeat.
   Enables basic AI allowing enemy units to use Rescue/Entrap staves.
   This refers to staves of type Rescue.
   What is referred to as "Rescue" is when the item's filter is set to Player and/or Ally.
   What is referred to as "Entrap" is when the item's filter is set to Enemy. It takes its name from the staff from Fire Emblem Fates. (ファイアーエムブレムif : ドロー)
   
   Notes: 
   * AI will not target units within a specified minimum range. This range is customizable for each type of staff.
   * AI will always prioritize targets with a lower remaining HP% (HP/MHP).
   * AI will give slight priority boost to units that are farther away.

   OPTIONAL CUSTOM PARAMETERS:
   Custom parameters can be used to have wielders only target units in their "squad".
   Affects Rescue staff only. Entrap is unaffected by custom parameters.
   An example: 
   {isSquad:true,squad:0} for wielder, {squad:0} for any squadmates. Staff user will only use Rescue on allies in squad 0.
   For a separate squad, {isSquad:true,squad:1} for wielder, {squad:1} for squadmates.
   
   If isSquad is false, user will target any ally, not just squadmates. (This is the default.)
   If isSquad is true but there are no valid squadmates, user will never use Rescue.
*/
(function () {

    // How far away the unit is allowed to be before it becomes an eligible target (1 being "only adjacent units are ineligible," 0 being "all units are eligible")
    RESCUE_MIN_RANGE = 4;
    ENTRAP_MIN_RANGE = 1;

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

        // for Rescue, only target units sharing wielder's squad (if applicable)
        if (unit.getUnitType() === combination.targetUnit.getUnitType() && unit.custom.isSquad
            && unit.custom.squad !== combination.targetUnit.custom.squad) {
            return AIValue.MIN_SCORE;
        }

        // Rescue distance
        if (unit.getUnitType() === combination.targetUnit.getUnitType() && getDist(unit, combination.targetUnit) <= RESCUE_MIN_RANGE) {
            return AIValue.MIN_SCORE;
        }

        // Entrap distance
        if (unit.getUnitType() !== combination.targetUnit.getUnitType() && getDist(unit, combination.targetUnit) <= ENTRAP_MIN_RANGE) {
            return AIValue.MIN_SCORE;
        }

        // Prioritize targets with lower HP percent
        var percent = combination.targetUnit.getHp() / ParamBonus.getMhp(combination.targetUnit) * 100;
        n += (100 - percent);
		
        // If HP percents are roughly equal, give small edge to units further away
        n += getDist(unit, combination.targetUnit);

        return n;
    }
})();