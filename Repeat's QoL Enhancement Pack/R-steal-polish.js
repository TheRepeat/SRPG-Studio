/**
 * By Repeat.
 * In vanilla, you can steal or reverse-pockpocket items on enemies.
 * The Steal command won't show if stealing requires higher Spd and you don't meet that req, but that's where the logic ends.
 * So like, if neither unit has any stealable/reverse-stealable items, or even if they don't have any items at all, you'll still see the Steal command.
 * This plugin makes things a little more sensible, hiding the Steal command in situations like those.
 * 
 * Function(s) overridden without an alias:
 *  * None! Yippee!
 */

(function () {
    var alias1 = Miscellaneous.isStealEnabled;
    Miscellaneous.isStealEnabled = function (unit, targetUnit, value) {
        var enabled = alias1.apply(this, arguments);

        if (!isStealOrReverseStealPossible(unit, targetUnit, value)) {
            enabled = false;
        }

        return enabled;
    }
})();

function isStealOrReverseStealPossible(unit, targetUnit, stealFlag) {
    var stealerItemCount = UnitItemControl.getPossessionItemCount(unit);
    var victimItemCount = UnitItemControl.getPossessionItemCount(targetUnit);
    var stealerHasStealables = false;
    var victimHasStealables = false;

    if (stealerItemCount === 0 && victimItemCount === 0) {
        return false;
    }

    // check for pickpocketable items
    for (var i = 0; i < victimItemCount; i++) {
        var item = UnitItemControl.getItem(targetUnit, i);
		
		if (!isItemUnstealable(targetUnit, item, stealFlag)) {
			victimHasStealables = true;

            break;
		}
    }

    // check for reverse-pickpocketable items
    for (var i = 0; i < stealerItemCount; i++) {
        var item = UnitItemControl.getItem(unit, i);
		
		if (!isItemUnstealable(unit, item, stealFlag)) {
			stealerHasStealables = true;

            break;
		}
    }

    return victimHasStealables || stealerHasStealables;
}

// slimmed down version of UnitItemStealScreen._isTradeDisabled.
// that function has a tunneled down "lockeditem" property that prevents you from stealing the item that gives you your steal skill, if that's where 
// your ability to steal comes from (as opposed to, say, your class).
// it'd be annoying to tunnel that property into THIS function, so the 1 tiny edge case of this plugin is that if you get your Steal ability from an item, 
// that still erroneously counts as a stealable item (in terms of "will show the steal command" - that Steal item still isn't actually stealable. That hasn't changed)
function isItemUnstealable(unit, item, stealFlag) {
    if (item === null) {
        return false;
    }

    if (unit.getUnitType() === UnitType.PLAYER && item.isImportance()) {
        // The important item which the player possesses cannot be traded.
        return true;
    }

    return Miscellaneous.isStealTradeDisabled(unit, item, stealFlag);
}