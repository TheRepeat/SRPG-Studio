/** By Repeat.
 *  Separates avoid and magic avoid. Default value is Spd+Luk, like Gaiden.
 *  */ 

AbilityCalculator.getMAvoid = function (unit) {
	var avoid;

	// Here's what you want to edit
	avoid = RealBonus.getSpd(unit) + RealBonus.getLuk(unit);

	return avoid;
};

HitCalculator.calculateMAvoid = function (active, passive, weapon, totalStatus) {
	return AbilityCalculator.getMAvoid(passive) + CompatibleCalculator.getAvoid(passive, active, ItemControl.getEquippedWeapon(passive)) + SupportCalculator.getAvoid(totalStatus);
};

HitCalculator.calculateHit = function (active, passive, weapon, activeTotalStatus, passiveTotalStatus) {
	var hit, avoid, percent;

	if (root.isAbsoluteHit()) {
		if (passive.isImmortal()) {
			// If the opponent is immortal, hit rate cannot be 100%.
			return 99;
		}
		return 100;
	}

	hit = this.calculateSingleHit(active, passive, weapon, activeTotalStatus);
	// only change from vanilla: check weapon type before getting avoid
	if (Miscellaneous.isPhysicsBattle(weapon)) {
		avoid = this.calculateAvoid(active, passive, weapon, passiveTotalStatus);
	}
	else {
		avoid = this.calculateMAvoid(active, passive, weapon, passiveTotalStatus);
	}


	percent = hit - avoid;

	return this.validValue(active, passive, weapon, percent);
};
