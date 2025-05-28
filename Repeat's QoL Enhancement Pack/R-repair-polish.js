/**
 * By Repeat.
 * Changes the way Repair items are used and displayed.
 * By default, Repair is able to "try" to fix weapons that are already full or have infinite durability. Now it can only target valid items.
 * Also, the vanilla Repair display shows the items as they are in the target's inventory, i.e. grayed out if the unit can't use it.
 * I've changed it so now the items are displayed based on whether they are repairable, i.e. grayed out if full or unbreakable.
 */

(function () {
    // Primary check for whether an item is repairable
    var alias1 = Miscellaneous.isDurabilityChangeAllowed;
    Miscellaneous.isDurabilityChangeAllowed = function (item, targetItem) {
        if (item === null || targetItem === null) {
            return true;
        }

        // DurabilityChangeType refers to the setting of the repair item ("Full", "Half", "Break" in the database)
        // Only "Full" is an actual repair item, so it's the only one that matters for this plugin. The rest behave as they do in vanilla
        if (item.getDurabilityInfo().getDurabilityChangeType() === DurabilityChangeType.MAXRECOVERY) {
            return isItemRepairable(targetItem);
        } else {
            return alias1.apply(this, arguments);
        }
    }

    // In vanilla, unrepairable weapons use yellow text, like "Important" items do. Not useful, removed.
    var alias2 = ItemDurabilityListScrollbar._getTextColor;
    ItemDurabilityListScrollbar._getTextColor = function (object, isSelect, index) {
        var item = this._repairItem;
        var type = item.getDurabilityInfo().getDurabilityChangeType();

        if (type === DurabilityChangeType.MAXRECOVERY && !Miscellaneous.isDurabilityChangeAllowed(item, object)) {
            return ColorValue.DEFAULT;
        } else {
            return alias2.apply(this, arguments);
        }
    }

    // Calls a setter to change the list of items that are "available" (repairable)
    var alias3 = ItemDurabilityListScrollbar.setDurabilityItemFormation;
    ItemDurabilityListScrollbar.setDurabilityItemFormation = function (unit, repairItem) {
        alias3.apply(this, arguments);

        // Retain vanilla behavior for "Half" and "Break" items. "Full" uses the new logic.
        if (repairItem.getDurabilityInfo().getDurabilityChangeType() === DurabilityChangeType.MAXRECOVERY) {
            this.setAvailableArray(unit);
        }
    }
})();

// The setter in question
ItemDurabilityListScrollbar.setAvailableArray = function (unit) {
    var count = UnitItemControl.getPossessionItemCount(unit);
    this._availableArray = [];

    for (i = 0; i < count; i++) {
        item = UnitItemControl.getItem(unit, i);
        var available = true;

        // only eligible items are items that have durability and have been used
        if (!isItemRepairable(item)) {
            available = false;
        }

        this._availableArray.push(available);
    }
}

// New miscellaneous function to check a given item to see if it is repairable.
// If you want to make any further changes to repair logic, e.g. making certain kinds of weapons/items unrepairable, you'll want to do it here.
function isItemRepairable(item) {
    if (item) {
        // Repair items cannot repair other Repair items.
        if (!item.isWeapon() && item.getItemType() === ItemType.DURABILITY) {
            return false;
        }

        // Broken items are valid despite having "infinite" durability.
        if (item.getLimit() === WeaponLimitValue.BROKEN) {
            return true;
        }

        // Breakable items that are at least partially used are valid.
        if (item.getLimitMax() > 0 && item.getLimit() < item.getLimitMax()) {
            return true;
        }
    }

    return false;
}