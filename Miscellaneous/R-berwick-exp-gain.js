/**
 * By Repeat.
 * Berwick-style EXP Gain v1.0
 * 
 * In Berwick Saga, EXP calculations are pretty simple:
 *  * EXP gain = ECE + MOD
 *  *  * ECE = Enemy class experience, taken from a table of classes in Berwick. Here determined by class's "Optional Exp" in-engine
 *  *  * MOD = EXP modifier. Comes from formula based on the difference in levels between the player unit and the killed unit
 *  * EXP is only gained after a kill
 * For more: https://wiki.serenesforest.net/index.php/Berwick_Saga_Calculations#Experience_Points
 * 
 * This plugin doesn't affect hardcoded means of gaining EXP (e.g. staves), events, or Paragon (via skill or difficulty option)
 * This plugin removes the check for DataConfig.isFixedExperience ("Get optional exp of class when enemy is killed").
 * 
 * Functions overridden without aliases:
 *  * ExperienceCalculator._getNoDamageExperience
 *  * ExperienceCalculator._getNormalValue
 *  * ExperienceCalculator._getVictoryExperience
 */

(function () {
    ExperienceCalculator._getNoDamageExperience = function (data) {
        return 0;
    };

    ExperienceCalculator._getNormalValue = function (data) {
        return 0;
    };

    ExperienceCalculator._getVictoryExperience = function (data) {
        var exp;
		var playerUnit = data.active;
		var defeatedUnit = data.passive;
		var baseExp = this._getBaseExperience();
		var classExp = defeatedUnit.getClass().getBonusExp();
		var expMod = 0;
		var levelDiff = defeatedUnit.getLv() - playerUnit.getLv();

		if (levelDiff < -8) {
			levelDiff = -8;
		} else if (levelDiff > 7) {
			levelDiff = 7;
		}
		
		// Setting "Optional Exp" to -1 means the class will grant no experience on kill
		if (classExp < 0) {
			return 0;
		}

		if (levelDiff < 0) {
			expMod = levelDiff * 5;
		} else if (levelDiff === 7) {
			expMod = 15;
		} else {
			expMod = levelDiff * 2;
		}

		exp = baseExp + classExp + expMod;

		return this._getValidExperience(exp);
    };
})();