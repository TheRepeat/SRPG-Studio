/*
By Claris.
Some modifications by Repeat.
Allows Rescue/Entrap staves to make an accuracy check.
Add custom parameters as follows to rescue staves:
{
	StaffHitCL:50, //base hit rate
	StaffMissCL:false //lets the staff miss if you want
}
*/

function calculateRescueHit(unit, target, item) {
	var baseChance = typeof item.custom.StaffHitCL === 'number' ? item.custom.StaffHitCL : 15; // adjust the base chance here
	var bonus = 0;
	var weapon = ItemControl.getEquippedWeapon(unit);
	if (weapon !== null) {
		bonus = AbilityCalculator.getHit(unit, weapon); //if the unit has a weapon, call the hit calculation
		bonus -= weapon.getHit(); //subtract weapon hit from the output.
	} else {
		bonus = Math.max(0, RealBonus.getSki(unit) * 3); // hit rate of your choice
	}
	bonus = Math.max(0, bonus - RealBonus.getMdf(target)); // avoid rate of your choice
	return bonus + baseChance
}

var StaffMissCL0 = RescueItemUse._moveSrc;
RescueItemUse._moveSrc = function () {
	var item = this._itemUseParent.getItemTargetInfo().item;
	if (!item.custom.StaffMissCL) {
		return StaffMissCL0.call(this);
	}

	var unit = this._itemUseParent.getItemTargetInfo().unit;
	var target = this._targetUnit;
	var chance = calculateRescueHit(unit, target, item);

	if (Probability.getProbability(chance)) {
		return StaffMissCL0.call(this); // successful hit
	} else {
		var target = this._itemUseParent.getItemTargetInfo().targetUnit;
		var x = LayoutControl.getPixelX(target.getMapX());
		var y = LayoutControl.getPixelY(target.getMapY());
		var missAnime = root.queryAnime('fire');
		var pos = LayoutControl.getMapAnimationPos(x, y, missAnime);
		var gen = root.getEventGenerator();
		gen.damageHitEx(target, missAnime, 0, DamageType.FIXED, -999, unit, false);
		gen.execute();
		this._check = true;
	}
};