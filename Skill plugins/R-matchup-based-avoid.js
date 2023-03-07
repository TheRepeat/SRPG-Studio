/**
 * By Repeat.
 * "Matchup-Based Avoid Boost" skill.
 * Grants skill holder an avoid bonus against units wielding a certain weapon category type (physical, bow, or magical).
 * 
 * Make a skill of type Custom. Keyword: "MatchupAvoid"
 * Give skill custom parameter {avoid:n} where n is the amount of avoid to give.
 * Example: {avoid:30}
 * (Optional) Give skill custom parameter {category:n} where n is the category this affects. 0=physical, 1=bow, 2=magical
 *  ^ If not specified, the category is assumed to be physical. If you put another number besides 0, 1, or 2, then the skill will never proc.
 * Example: {category:2}
 */

(function () {
    function isCategoryMatchup(unit, category) {
        var isCategoryMatchup = false;
        var weapon = ItemControl.getEquippedWeapon(unit);
        var weaponCategory = category ? category : WeaponCategoryType.PHYSICS;

        if (weapon && weapon.getWeaponCategoryType() === weaponCategory) {
            isCategoryMatchup = true;
        }

        return isCategoryMatchup;
    }

    var alias1 = HitCalculator.calculateAvoid;
    HitCalculator.calculateAvoid = function (active, passive, weapon, totalStatus) {
        var avo = alias1.call(this, active, passive, weapon, totalStatus);
        var currentSkill;
        var skillArray = SkillControl.getDirectSkillArray(passive, SkillType.CUSTOM, "MatchupAvoid");

        for (i = 0; i < skillArray.length; i++) {
            currentSkill = skillArray[i].skill;

            if (isCategoryMatchup(active, currentSkill.custom.category) && currentSkill.custom.avoid) {
                avo += currentSkill.custom.avoid;
            }
        }

        return avo;
    }
})();
