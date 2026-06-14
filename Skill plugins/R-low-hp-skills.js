/**
 * By Repeat.
 * Recreates 2 skills relating to having low HP: "Vengeance" and "Life or Death"
 * 
 * First: "Vengeance", closer resembling the Three Houses combat art rather than the proc skill from the 3DS games.
 * When active, every point of HP the unit is missing is added to attack power. Extremely overpowered in a vacuum, implement with caution.
 *  * Usage: create a Custom-type skill with keyword 'vengeance'
 * 
 * Second: the "Life or Death" skill from TearRing Saga, aka Wrath in some fan translations due to its similar effect.
 * Every % of HP a unit is missing goes into their crit rate. If they're down 5% of their HP, Crt+5. If they're at half health, Crt+50. etc.
 *  * Usage: create a Custom-type skill with keyword 'life-or-death'
 * 
 * For both/either of these skills, you may rein in their power with the optional custom parameter "boostCap".
 * This defines a maximum to the amount of atk/crit your skill is allowed to grant a unit, in case you don't want a unit to be able to get Crt+95 or Atk+30 from one skill, for example.
 *  * Usage: { boostCap: n } where n is a number of your choosing
 * 
 * Function(s) overridden without an alias:
 *  * None! Yippee!
 */

(function () {
    // Vengeance section
    var alias1 = AbilityCalculator.getPower;
    AbilityCalculator.getPower = function(unit, weapon) {
        var atk = alias1.apply(this, arguments);
        var skill = SkillControl.getPossessionCustomSkill(unit, 'vengeance');

        if (skill) {
            var hpMissing = ParamBonus.getMhp(unit) - unit.getHp();

            if (typeof skill.custom.boostCap === "number" && hpMissing > skill.custom.boostCap) {
                hpMissing = skill.custom.boostCap;
            }

            atk += hpMissing;
        }

        return atk;
    }

    // Life or Death section
    var alias2 = AbilityCalculator.getCritical;
    AbilityCalculator.getCritical = function(unit, weapon) {
        var crt = alias2.apply(this, arguments);
        var skill = SkillControl.getPossessionCustomSkill(unit, 'life-or-death');

        if (skill) {
            var percentRemaining = Math.floor(unit.getHp() / ParamBonus.getMhp(unit) * 100);
            var percentMissing = 100 - percentRemaining;

            if (typeof skill.custom.boostCap === "number" && percentMissing > skill.custom.boostCap) {
                percentMissing = skill.custom.boostCap;
            }

            crt += percentMissing;
        }

        return crt;
    }
})();