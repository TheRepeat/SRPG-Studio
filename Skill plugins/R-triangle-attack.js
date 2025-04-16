/**
 * By Repeat.
 * Simple plugin for Triangle Attack from FE - when 3 units with this skill are all surrounding an enemy, then critical hits are guaranteed.
 * Effectively, this just sets critical rate to 100 when the conditions are met, ignoring the foe's critical avoid. So this doesn't bypass accuracy or anything.
 * Anything completely negating crits will still negate triangle attacks, such as skills or difficulty settings.
 * The triangle attack critical bonus applies to all of the skill holder's attacks in that round.
 * The check for triangle attack partners does NOT consider the non-attacking allies' equipped weapons, unlike how Tellius requires all parties in the brother triangle 
 * to have 2-range weapons equipped.
 * 
 * Custom skill keyword: 'triangleattack' (case sensitive)
 * Custom parameters:
 *  * initOnly: true
 *      changes it so triangle attacks can only occur on the skill holders' own phase.
 *  * extendTriangle: true
 *      instead of only working at 1 range, triangle attacks will occur if there are valid allies the same distance from the target in cardinal directions.
 *      i.e., Tellius-style triangle attacks, where the triangle can also be 2 spaces away instead of just 1.
 *      This custom parameter expands the triangle to any size as long as the distance matches. 2-tile triangles, 3-tile triangles, 9-tile triangles, etc.
 *      Example of a 2-tile triangle on the right half of this image: https://cdn.fireemblemwiki.org/f/fc/Ss_fe07_triangle_attack_formations.png
 */

(function () {
    var alias1 = CriticalCalculator.calculateCritical;
    CriticalCalculator.calculateCritical = function (active, passive, weapon, activeTotalStatus, passiveTotalStatus) {
        var skill = SkillControl.getPossessionCustomSkill(active, 'triangleattack');
        var range = 1;
        var dist = getDistanceBetweenUnits(active, passive);

        if (!this.isCritical(active, passive, weapon)) {
            return 0;
        }

        if (!skill) {
            return alias1.apply(this, arguments);
        }

        // Don't perform triangle attack on opposite phase if initOnly is true
        if (skill.custom.initOnly && active.getUnitType() !== root.getCurrentSession().getTurnType()) {
            return alias1.apply(this, arguments);
        }

        // Triangle attack isn't possible if the initiator isn't in a cardinal direction from the target
        if (active.getMapX() !== passive.getMapX() && active.getMapY() !== passive.getMapY()) {
            return alias1.apply(this, arguments);
        }

        if (skill.custom.extendTriangle) {
            range = dist;
        } else if (dist > 1) {
            // don't check for triangle attack if the check range is 1-range only and the initiator already fails that condition
            return alias1.apply(this, arguments);
        }

        var partnerArr = getUnitTriangleArray(passive, range);
        var triAttackCount = 0;

        for (var i = 0; i < partnerArr.length; i++) {
            var pal = partnerArr[i];

            if (pal && pal !== active && pal.getUnitType() === active.getUnitType()) {
                var palSkill = SkillControl.getPossessionCustomSkill(pal, 'triangleattack');

                if (palSkill) {
                    triAttackCount++;
                }
            }
        }

        return triAttackCount >= 2 ? 100 : alias1.apply(this, arguments);
    }
})();

// Check for units in the 4 cardinal tiles exactly <range> tiles away from the target
function getUnitTriangleArray(unit, range) {
    var px = unit.getMapX();
    var py = unit.getMapY();

    var unitArr = [
        PosChecker.getUnitFromPos(px - range, py),
        PosChecker.getUnitFromPos(px, py - range),
        PosChecker.getUnitFromPos(px + range, py),
        PosChecker.getUnitFromPos(px, py + range)
    ]; // west/north/east/south, see DirectionType enum (l/t/r/b);

    var finalArr = [, , ,];

    for (var i = 0; i < unitArr.length; i++) {
        finalArr[i] = unitArr[i];
    }

    return finalArr;
}

// You'll never guess what this function does
function getDistanceBetweenUnits(unit, targetUnit) {
    var dist = Math.abs(unit.getMapX() - targetUnit.getMapX())
        + Math.abs(unit.getMapY() - targetUnit.getMapY());

    return dist;
}