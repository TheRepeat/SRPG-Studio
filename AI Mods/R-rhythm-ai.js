/**
 * By Repeat.
 * Rhythm AI v1.0
 * 
 * Adds custom AI where the unit will "waste" every other turn. I.e., their AI is set to Wait Only every other turn, and Approach  otherwise.
 * There are two variants, Even and Odd. If Odd, unit will only act on odd turns and will skip evens. 
 * The variants are tied to skills. If no skill, Even is the default.
 * 
 * This behavior can definitely be done scriptless by using pages, but that gets annoying at scale.
 * This plugin streamlines the process considerably.
 * 
 * - Usage -
 * Custom AI Keyword: "Rhythm" (case insensitive)
 * Custom skill Keyword: "OddRhythm" ("EvenRhythm" is the presumed default and doesn't have to be included. This IS case sensitive)
 */

var RhythmAIKeywords = {
    AIPATTERN: 'rhythm',
    EVEN: 'EvenRhythm',
    ODD: 'OddRhythm'
};

(function () {
    var alias1 = AutoActionBuilder.buildCustomAction;
    AutoActionBuilder._turnToSkipMod = 0; // 0 = even, 1 = odd
    AutoActionBuilder.buildCustomAction = function (unit, autoActionArray, keyword) {
        var formattedKeyword = keyword.toLowerCase();

        if (formattedKeyword === RhythmAIKeywords.AIPATTERN) {
            return this._buildRhythmAction(unit, autoActionArray);
        }
        else {
            return alias1.call(this, unit, autoActionArray, keyword);
        }
    };

    AutoActionBuilder._buildRhythmAction = function(unit, autoActionArray) {
        this._setRhythmType(unit);
        var turn = root.getCurrentSession().getTurnCount();

        if (turn % 2 === this._turnToSkipMod) {
            return this._buildEmptyAction();
        } else {
            return this.buildRhythmApproachAction(unit, autoActionArray);
        }
    };

    AutoActionBuilder._setRhythmType = function (unit) {
        var oddRhythm = SkillControl.getPossessionCustomSkill(unit, RhythmAIKeywords.ODD);

        if (oddRhythm) {
            this._turnToSkipMod = 0;
        } else {
            this._turnToSkipMod = 1;
        }
    };

    // custom approach action that doesn't check approachPatternInfo
    AutoActionBuilder.buildRhythmApproachAction = function(unit, autoActionArray) {
		var combination;
		
		combination = CombinationManager.getApproachCombination(unit, true);
		if (combination === null) {
				combination = CombinationManager.getEstimateCombination(unit);
				if (combination === null) {
					return this._buildEmptyAction();
				}
				else {
					this._pushMove(unit, autoActionArray, combination);
					this._pushWait(unit, autoActionArray, combination);
				}
		}
		else {
			this._pushGeneral(unit, autoActionArray, combination);
		}
		
		return true;
	};
})();
