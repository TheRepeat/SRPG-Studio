/* By Repeat.
   When a unit has a skill with keyword "Powermove", the unit will gain attack power based on
   how much movement it spent to reach the target.
   By default, the power boost is equal to how many spaces the unit moved.
   With the custom parameter {boost:n}, where n is an integer, the unit's power 
   is instead increased by n times the number of spaces moved.

   More custom parameter shenannies:
   Use custom parameter {weaponcategory:n,weapontype:n} if you want this skill to only work with one weapon type.
   weaponcategory is a value from 0 to 2. 0=weapon, 1=bow, 2=magic
   weapontype is the ID number of the valid weapon type
   (You can find these ID numbers in Database>Config1>Weapon Types in SRPG Studio.)
   NOTE: This plugin allows either ALL weapon types or ONLY ONE weapon type, nothing in between.
   You can make multiples of the skill with different custom params if you want it to behave more specifically.

   Naturally, if you want to use all three custom parameters together, just encase them all in the same curly braces {} and
   separate each parameter with a comma. For example:
   {
   boost:2,
   weaponcategory:0,
   weapontype:1
   }
*/

(function () {

    // I referenced the blow skills script to learn how to invoke custom skills, so thank you Rena :)
    var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
    SkillRandomizer.isCustomSkillInvokedInternal = function (active, passive, skill, keyword) {
        if (keyword === 'Powermove') {
            return this._isSkillInvokedInternal(active, passive, skill);
        }
        return alias1.call(this, active, passive, skill, keyword);
    }

    var alias2 = DamageCalculator.calculateAttackPower;
    DamageCalculator.calculateAttackPower = function (active, passive, weapon, isCritical, totalStatus, trueHitValue) {
        var pow = alias2.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue);
        var skill = SkillControl.getPossessionCustomSkill(active, 'Powermove');
        
        // unit is presumed able to use it unless user specifies only one weapon type can use it
        var able = true;
        if(skill && typeof skill.custom.weapontype !== 'undefined' && typeof skill.custom.weaponcategory !== 'undefined'){
            weaponType = root.getBaseData().getWeaponTypeList(skill.custom.weaponcategory).getDataFromId(skill.custom.weapontypes);
            able = weapon.isWeaponTypeMatched(weaponType);
        }

        if (skill && able) {
            if (typeof skill.custom.boost !== 'undefined') {
                pow += active.getMostResentMov() * skill.custom.boost;
            }
            else {
                pow += active.getMostResentMov();
            }
        }

        return pow;
    }
})();