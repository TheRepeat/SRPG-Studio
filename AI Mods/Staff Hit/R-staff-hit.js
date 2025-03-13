/**
 * 
 * Function(s) overridden without an alias:
 *  * StateItemAI.getItemScore
 *  * StateItemUse.enterMainUseCycle
 *  * DamageItemUse.enterMainUseCycle
 *  * DamageItemPotency.setPosMenuData
 *  * BaseItemPotency.setPosMenuData
 *  * BaseItemPotency.drawPosMenuData
 *  * BaseItemAI.getItemScore
 * 
 * Overriding BaseItem___ stuff looks scary but bear with me.
 * Those functions are normally unused. The changes to those functions are to provide a helpful jumping off point 
 * for adding hit to new kinds of staves in the future.
 * With just this much, the UI will already reflect the correct accuracy, and the AI will even consider accuracy when deciding on a target, 
 * as long as you add custom parameters usesAcc and hitValue to the staff in question.
 * This doesn't actually IMPLEMENT the real "item misses" behavior, because that has to be done case by case for every kind of item,
 * and I just wanted to cover the low hanging fruit of State, Damage, Rescue and Steal since those are the most likely to be expected to miss.
 */

(function () {
	var alias1 = DamageItemAI.getItemScore;
	DamageItemAI.getItemScore = function (unit, combination) {
		var score = alias1.apply(this, arguments);
		var item = combination.item;

		// if the item doesn't use stat-based accuracy then it has the same hit on everyone and doesn't bother considering it
		if (score < 0 || !item.custom.usesAcc) {
			return score;
		}

		var baseHit = item.getDamageInfo().getHit();
		var trueHit = getStaffTrueHit(baseHit, unit, combination.targetUnit);

		score += trueHit;

		logAIHitRate(trueHit, combination.targetUnit);

		return score;
	}

	var alias2 = RescueItemUse.enterMainUseCycle;
	RescueItemUse.enterMainUseCycle = function (itemUseParent) {
		var generator;
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var unit = itemTargetInfo.unit;
		var targetUnit = itemTargetInfo.targetUnit;
		var item = itemTargetInfo.item;

		if (item.custom.usesAcc) {
			var hit = item.custom.hitValue;
			hit = getStaffTrueHit(hit, unit, targetUnit);

			if (Probability.getProbability(hit)) {
				return alias2.call(this, itemUseParent);
			} else {
				this._dynamicEvent = createObject(DynamicEvent);
				generator = this._dynamicEvent.acquireEventGenerator();
				var anime = null; // miss animation you can add if you want

				generator.damageHitEx(targetUnit, validateNull(anime), -1, DamageType.PHYSICS, -1, unit, itemUseParent.isItemSkipMode());

				this._dynamicEvent.executeDynamicEvent();

				return EnterResult.NOTENTER;
			}

		} else {
			return alias2.call(this, itemUseParent);
		}
	}

	var alias3 = StealItemUse.enterMainUseCycle;
	StealItemUse.enterMainUseCycle = function (itemUseParent) {
		var generator;
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var unit = itemTargetInfo.unit;
		var targetUnit = itemTargetInfo.targetUnit;
		var item = itemTargetInfo.item;

		if (item.custom.usesAcc) {
			var hit = item.custom.hitValue;
			hit = getStaffTrueHit(hit, unit, targetUnit);

			if (Probability.getProbability(hit)) {
				return alias3.call(this, itemUseParent);
			} else {
				this._dynamicEvent = createObject(DynamicEvent);
				generator = this._dynamicEvent.acquireEventGenerator();
				var anime = null; // miss animation you can add if you want

				generator.damageHitEx(targetUnit, validateNull(anime), -1, DamageType.PHYSICS, -1, unit, itemUseParent.isItemSkipMode());

				this._dynamicEvent.executeDynamicEvent();

				return EnterResult.NOTENTER;
			}

		} else {
			return alias3.call(this, itemUseParent);
		}
	}

	var alias4 = StealItemAI.getItemScore;
	StealItemAI.getItemScore = function (unit, combination) {
		var score = alias4.apply(this, arguments);
		var item = combination.item;

		// if the item doesn't use stat-based accuracy then it has the same hit on everyone and doesn't bother considering it
		if (score < 0 || !item.custom.usesAcc) {
			return score;
		}

		var baseHit = item.custom.hitValue;
		var trueHit = getStaffTrueHit(baseHit, unit, combination.targetUnit);

		score += trueHit;


		return score;
	}
})();

StateItemAI.getItemScore = function (unit, combination) {
	var stateInvocation = combination.item.getStateInfo().getStateInvocation();
	var state = stateInvocation.getState();
	var score = StateScoreChecker.getScore(unit, combination.targetUnit, state);

	// if the item doesn't use stat-based accuracy then it has the same hit on everyone and doesn't bother considering it
	if (score < 0 || !combination.item.custom.usesAcc) {
		return score;
	}

	var baseHit = Probability.getInvocationPercent(unit, stateInvocation.getInvocationType(), stateInvocation.getInvocationValue());
	var trueHit = getStaffTrueHit(baseHit, unit, combination.targetUnit);

	score += trueHit;

	logAIHitRate(trueHit, combination.targetUnit);

	return score;
}

StateItemUse.enterMainUseCycle = function (itemUseParent) {
	var generator;
	var itemTargetInfo = itemUseParent.getItemTargetInfo();
	var unit = itemTargetInfo.unit;
	var targetUnit = itemTargetInfo.targetUnit;
	var item = itemTargetInfo.item;
	var info = item.getStateInfo();

	var stateInvocation = info.getStateInvocation();
	var state = stateInvocation.getState()
	var hit = Probability.getInvocationPercent(unit, stateInvocation.getInvocationType(), stateInvocation.getInvocationValue())

	if (StateControl.isStateBlocked(targetUnit, unit, state)) {
		hit = 0;
	} else if (item.custom.usesAcc) {
		hit = getStaffTrueHit(hit, unit, targetUnit);
	}

	this._dynamicEvent = createObject(DynamicEvent);
	generator = this._dynamicEvent.acquireEventGenerator();

	if (Probability.getProbability(hit)) {
		StateControl.arrangeState(targetUnit, state, IncreaseType.INCREASE);
	} else {
		var anime = null; // miss animation you can add if you want

		generator.damageHitEx(targetUnit, validateNull(anime), -1, DamageType.PHYSICS, -1, unit, itemUseParent.isItemSkipMode());
	}

	return this._dynamicEvent.executeDynamicEvent();
}

StateItemPotency.setPosMenuData = function (unit, item, targetUnit) {
	var stateInvocation = item.getStateInfo().getStateInvocation();
	var state = stateInvocation.getState();

	if (StateControl.isStateBlocked(targetUnit, unit, state)) {
		this._value = 0;
	} else {
		var hit = Probability.getInvocationPercent(unit, stateInvocation.getInvocationType(), stateInvocation.getInvocationValue());

		if (item.custom.usesAcc) {
			hit = getStaffTrueHit(hit, unit, targetUnit);
		}

		this._value = hit;
	}
}

DamageItemUse.enterMainUseCycle = function (itemUseParent) {
	var generator;
	var itemTargetInfo = itemUseParent.getItemTargetInfo();
	var damageInfo = itemTargetInfo.item.getDamageInfo();
	var type = itemTargetInfo.item.getRangeType();
	var plus = Calculator.calculateDamageItemPlus(itemTargetInfo.unit, itemTargetInfo.targetUnit, itemTargetInfo.item);
	var hit = damageInfo.getHit();

	if (itemTargetInfo.item.custom.usesAcc) {
		hit = getStaffTrueHit(damageInfo.getHit(), itemTargetInfo.unit, itemTargetInfo.targetUnit);

		// NB: in vanilla, a damage hit value of 0 means "will never miss", while -1 means "will never hit", so we need to account for a calculated 0 hit in this way.
		if (hit === 0) {
			hit = -1;
		}
		// We only do this when usesAcc is true because otherwise an "Always hit" staff would actually always miss thanks to this check.
		// For your "Always hit" staves, please don't use the usesAcc param.
	}

	this._dynamicEvent = createObject(DynamicEvent);
	generator = this._dynamicEvent.acquireEventGenerator();

	if (type !== SelectionRangeType.SELFONLY) {
		generator.locationFocus(itemTargetInfo.targetUnit.getMapX(), itemTargetInfo.targetUnit.getMapY(), true);
	}

	generator.damageHitEx(itemTargetInfo.targetUnit, this._getItemDamageAnime(itemTargetInfo), damageInfo.getDamageValue() + plus, damageInfo.getDamageType(), hit, itemTargetInfo.unit, itemUseParent.isItemSkipMode());

	// When using a damaged item with a durability of 1 to obtain "Item Drops",
	// it is unnatural for the damaged item to appear in the item window.
	// By reducing the durability of the damaged item in advance, the item window can be left blank.
	itemUseParent.decreaseItem();
	itemUseParent.disableItemDecrement();

	return this._dynamicEvent.executeDynamicEvent();
}

DamageItemPotency.setPosMenuData = function (unit, item, targetUnit) {
	var damageInfo = item.getDamageInfo();
	var statBonus = Calculator.calculateDamageItemPlus(unit, targetUnit, item);
	var hit = damageInfo.getHit();

	this._value = Calculator.calculateDamageValue(targetUnit, damageInfo.getDamageValue(), damageInfo.getDamageType(), statBonus);

	if (item.custom.usesAcc) {
		this._value2 = getStaffTrueHit(hit, unit, targetUnit);
	} else {
		// without the usesAcc parameter, "Always hit" is represented by 0, so we show 100 in that case.
		if (hit === 0) {
			hit = 100;
		}

		this._value2 = hit;
	}
}

BaseItemPotency._usesHit = null;
BaseItemPotency.setPosMenuData = function (unit, item, targetUnit) {
	if (item.custom.usesAcc) {
		var hit = item.custom.hitValue;

		this._usesHit = true;
		this._value = getStaffTrueHit(hit, unit, targetUnit);
	}
}

BaseItemPotency.drawPosMenuData = function (x, y, textui) {
	if (this._usesHit) {
		var text;
		var color = ColorValue.KEYWORD;
		var font = textui.getFont();

		text = root.queryCommand('hit_capacity');
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
		NumberRenderer.drawNumber(x + 50, y, this._value);
	}
}

BaseItemAI.getItemScore = function (unit, combination) {
	var item = combination.item;

	if (!item.custom.usesAcc) {
		return AIValue.MIN_SCORE;

	}

	var baseHit = item.custom.hitValue;
	var trueHit = getStaffTrueHit(baseHit, unit, combination.targetUnit);

	var score = trueHit;

	logAIHitRate(trueHit, combination.targetUnit);

	return score;
}