/* By Repeat.
   A weapon with custom parameter {althit:true} will ignore the opponent's Avoid stat.
   A skill with the keyword "althit" will provide the same effect.
*/

(function () {
    var findAltHit = function (skillReferenceList) {
        var count = skillReferenceList.getTypeCount();
        for (i = 0; i < count; i++) {
            if (skillReferenceList.getTypeData(i).getCustomKeyword() == "althit") {
                return true;
            }
        }
        return false;
    }

    var calhit = HitCalculator.calculateHit;
    HitCalculator.calculateHit = function (active, passive, weapon, activeTotalStatus, passiveTotalStatus) {
        var percent;
        var found = false;

        var unitSkills = active.getSkillReferenceList();
        var unitWeaponSkills = weapon.getSkillReferenceList(); // already have the equipped weapon
        var unitClassSkills = active.getClass().getSkillReferenceList();
        var unitTerrainSkills = root.getCurrentSession().getTerrainFromPos(active.getMapX(), active.getMapY(), true).getSkillReferenceList();
        var unitItemSkills = active.getItem(0) == null ? null : active.getItem(0).getSkillReferenceList();
        var i; // for checking items

        found = found ? found : weapon.custom.althit;
        found = found ? found : findAltHit(unitSkills);
        found = found ? found : findAltHit(unitClassSkills);
        found = found ? found : findAltHit(unitWeaponSkills);
        found = found ? found : findAltHit(unitTerrainSkills);
        found = found ? found : findAltHit(unitSkills);
        i = 0;
        while (unitItemSkills !== null) {
            if (!active.getItem(i).isWeapon()) {
                found = found ? found : findAltHit(unitItemSkills);
            }
            i++;
            unitItemSkills = active.getItem(i) === null ? null : active.getItem(i).getSkillReferenceList();
        }

        if (found) {

            if (root.isAbsoluteHit()) {
                if (passive.isImmortal()) {
                    // If the opponent is immortal, hit rate cannot be 100%.
                    return 99;
                }
                return 100;
            }

            percent = this.calculateSingleHit(active, passive, weapon, activeTotalStatus);
        }
        else {
            percent = calhit.call(this, active, passive, weapon, activeTotalStatus, passiveTotalStatus);
        }
        return this.validValue(active, passive, weapon, percent);
    }
})();