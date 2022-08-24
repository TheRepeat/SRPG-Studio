/**
 * Droppable Item Icons
 * v2.1
 * By Repeat, using McMagister's Unit State Animator.
 * This plugin will not work without the Unit State Animator plugin.
 * 
 * Draws a still icon over units that will drop an item when defeated.
 * Also offers a config menu option that lets the player disable this if they find it distracting.
 * 
 * OPTIONAL CUSTOM PARAMETER:
 * Use custom parameter hideDropIcon for a unit who you don't want to show an icon for.
 * Example:
 * {hideDropIcon:true}
 * 
 * HOW TO USE THE EDITABLE VALUES, if you've never used the Unit State Animator before:
 *  * isRuntime: whether the asset to be used is RTP or original.
 *  * id: the id of the image file in Icon.
 *  * xSrc & ySrc: the positions of the icon to be used within the file, both starting from 0. 
 *      xSrc: 0 and ySrc: 0 refers to the icon in the top left corner.
 */

// Editable values
var DropIconConfig = {
    isRuntime: true,
    id: 0,
    xSrc: 8,
    ySrc: 8
};

(function () {
    var alias1 = UnitStateAnimator._updateIconByUnit;
    UnitStateAnimator._updateIconByUnit = function (unit) {
        alias1.call(this, unit);

        ItemDropControl.removeIcon(unit);
        if (!ConfigItem.ItemDrops.isDisabled()) {
            // Only draw on valid enemy units
            if (unit.getUnitType() === UnitType.ENEMY && !unit.custom.isMoving && !unit.isInvisible() && !unit.custom.hideDropIcon) {
                ItemDropControl.checkMarkCondition(unit);

                var temp = this._icon;
                this._icon = null;
                if (unit.custom.hasDrop) {
                    var DROP_ICON_HANDLE = root.createResourceHandle(DropIconConfig.isRuntime, DropIconConfig.id, 0, DropIconConfig.xSrc, DropIconConfig.ySrc);
                    this._addIcon(unit, DROP_ICON_HANDLE, UnitStateAnimType.FIXED, 10, 24);
                    this._iconArray.push(this._icon);
                }
                this._icon = temp;
            }
        }
    }

    var alias2 = TurnChangeEnd._startNextTurn;
    TurnChangeEnd._startNextTurn = function () {
        alias2.call(this);

        UnitStateAnimator.updateIcons();
    }

    // Updates when an enemy stops moving
    var alias3 = SimulateMove._endMove;
    SimulateMove._endMove = function (unit) {
        alias3.call(this, unit);

        ItemDropControl.setIsMoving(unit, false);
        UnitStateAnimator.updateIcons();
    }

    var alias4 = CurrentMap.prepareMap;
    CurrentMap.prepareMap = function () {
        alias4.call(this);

        UnitStateAnimator.updateIcons();
    }

    // check to see if the enemy has started moving (to avoid jank where enemies "leave behind" their icons when moving)
    var alias5 = EnemyTurn._startAutoAction;
    EnemyTurn._startAutoAction = function () {
        ItemDropControl.setIsMoving(this._orderUnit, true);
        UnitStateAnimator.updateIcons();

        return alias5.call(this);
    }

    // during "Chapter Complete" event's fadeout, hide icons
    var alias6 = BeforeTransitionFlowEntry.enterFlowEntry;
    BeforeTransitionFlowEntry.enterFlowEntry = function (endingScene) {
        ItemDropControl.disableIcons();
        UnitStateAnimator.updateIcons();

        return alias6.call(this, endingScene);
    }
})();

ItemDropControl = defineObject(BaseObject, {
    checkMarkCondition: function (unit) {
        var list = unit.getDropTrophyList();
        var count = list.getCount();

        for (i = 0; i < count; i++) {
            var trophy = list.getData(i);

            // If the item is droppable, an item, and is immediately dropped, then mark.
            if ((trophy.getFlag() & TrophyFlag.ITEM) && trophy.isImmediately()) {
                this.addFlag(unit);
            }
        }
    },

    addFlag: function (unit) {
        unit.custom.hasDrop = true;
    },

    setIsMoving: function (unit, isMoving) {
        unit.custom.isMoving = isMoving;
    },

    removeIcon: function (unit) {
        unit.custom.hasDrop = false;
    },

    disableIcons: function () {
        var enemies = EnemyList.getAliveList();

        for (var i = 0; i < enemies.getCount(); i++) {
            this.setIsMoving(enemies.getData(i), true);
        }
    }
});

// Player can disable drop icons if they're too distracting
ConfigItem.ItemDrops = defineObject(BaseConfigtItem, {
    isDisabled: function () {
        return this.getFlagValue() === 1;
    },

    selectFlag: function (index) {
        root.getExternalData().env.ItemDrops = index;
        UnitStateAnimator.updateIcons();
    },

    getFlagValue: function () {
        if (typeof root.getExternalData().env.ItemDrops !== 'number') {
            return 0;
        }

        return root.getExternalData().env.ItemDrops;
    },

    getFlagCount: function () {
        return 2;
    },

    getConfigItemTitle: function () {
        return 'Item Drop Indicator';
    },

    getConfigItemDescription: function () {
        var text = '';
        if (this.getFlagValue() === 1) {
            text = 'not ';
        }
        return 'If an enemy will drop an item upon defeat, it will ' + text + 'be marked with an icon on the map.';
    },

    getObjectArray: function () {
        return ["On", "Off"];
    }
});

// enable config item
var configAlias = ConfigWindow._configureConfigItem;
ConfigWindow._configureConfigItem = function (groupArray) {
    configAlias.call(this, groupArray);

    groupArray.appendObject(ConfigItem.ItemDrops);
};
