/**
 * By Repeat, using McMagister's Unit State Animator.
 * This plugin will not work without the Unit State Animator plugin.
 * 
 * Draws a still icon over units that will drop an item when defeated.
 * Also offers a config menu option that lets the player disable this if they find it distracting.
 * TODO: Re-enable icons on enemy phase once I figure out how to not draw icons if the unit is moving.
 * 
 * HOW TO USE THE EDITABLE VALUES, if you've never used the Unit State Animator before:
 * isRuntime: whether the asset to be used is RTP or original.
 * id: the id of the image file in Icon.
 * xSrc & ySrc: the positions of the icon to be used within the file, both starting from 0. (0,0) is the icon in the top left corner.
 */

(function () {

    // Editable values
    var DROP_ICON = {
        isRuntime: true,
        id: 0,
        xSrc: 9,
        ySrc: 15
    };

    var alias = UnitStateAnimator._updateIconByUnit;
    UnitStateAnimator._updateIconByUnit = function (unit) {
        alias.call(this, unit);
        unit.custom.hasdrop = false;
        if (!ConfigItem.ItemDrops.isDisabled()) {
            // Only draw on enemies, and only on player phase (to avoid jank where enemies "leave behind" their icons when moving)
            if (unit.getUnitType() === UnitType.ENEMY && root.getCurrentSession().getTurnType() === TurnType.PLAYER) {
                list = unit.getDropTrophyList();
                count = list.getCount();
                for (i = 0; i < count; i++) {
                    trophy = list.getData(i);
                    // If the item is droppable, an item, and is immediately dropped, then mark.
                    if ((trophy.getFlag() & TrophyFlag.ITEM) && trophy.isImmediately()) {
                        unit.custom.hasdrop = true;
                    }
                }

                var temp = this._icon;
                this._icon = null;
                if (unit.custom.hasdrop) {
                    var DROP_ICON_HANDLE = root.createResourceHandle(DROP_ICON.isRuntime, DROP_ICON.id, 0, DROP_ICON.xSrc, DROP_ICON.ySrc);
                    this._addIcon(unit, DROP_ICON_HANDLE, UnitStateAnimType.FIXED, 10, 24);
                    this._iconArray.push(this._icon);
                }
                this._icon = temp;
            }
        }
    };

    var alias2 = TurnChangeEnd._startNextTurn;
    TurnChangeEnd._startNextTurn = function () {
        alias2.call(this);

        UnitStateAnimator.updateIcons();
    }

    // Obsolete atm.
    // Was trying to figure out how to not draw icon when unit's moving, but got bored.
    // This just makes sure it updates when an enemy stops moving, but that does nothing if they don't show on EP at all.
    var alias3 = SimulateMove._endMove;
    SimulateMove._endMove = function (unit) {
        alias3.call(this, unit);

        UnitStateAnimator.updateIcons();
    }

    var alias4 = CurrentMap.prepareMap;
    CurrentMap.prepareMap = function () {
        alias4.call(this);

        UnitStateAnimator.updateIcons();
    };


    // Player can disable drop icons if they're too distracting
    ConfigItem.ItemDrops = defineObject(BaseConfigtItem, {
        isDisabled: function () {
            return this.getFlagValue() === 1;
        },

        selectFlag: function (index) {
            root.getExternalData().env.ItemDrops = index;
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
            return 'If an enemy can drop one of its items, it will ' + text + 'be marked with an icon on the map.';
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
})();