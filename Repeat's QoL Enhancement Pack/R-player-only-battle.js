/**
 * By Repeat.
 * Adds a third choice to the Real Battle config that lets the player have combat animations only occur on player phase.
 * Player can hold a "Cycle Units" key (A/S by default, or LB/RB on controller) as combat begins to invert the chosen config option.
 * Plug and play.
 */
 (function () {
    ConfigItem.RealBattle = defineObject(BaseConfigtItem,
        {
            selectFlag: function (index) {
                root.getMetaSession().setDefaultEnvironmentValue(2, index);
            },

            getFlagValue: function () {
                return root.getMetaSession().getDefaultEnvironmentValue(2);
            },

            getFlagCount: function () {
                return 3;
            },

            getConfigItemTitle: function () {
                return StringTable.Config_RealBattle;
            },

            getConfigItemDescription: function () {
                return StringTable.Config_RealBattleDescription;
            },

            getObjectArray: function () {
                return [StringTable.Select_On, 'Map', 'Player']
            }
        }
    );

    EnvironmentControl.getBattleType = function () {
        var battleType;
        var n = root.getMetaSession().getDefaultEnvironmentValue(2);

        if (n === 0) {
            battleType = BattleType.REAL;
        } else if (n === 1) {
            battleType = BattleType.EASY;
        } else if (n === 2) {
            if (root.getCurrentSession().getTurnType() === TurnType.PLAYER) {
                battleType = BattleType.REAL;
            } else {
                battleType = BattleType.EASY;
            }
        } else {
            battleType = BattleType.REAL;
        }

        // Invert selection if player is holding a Cycle Units key
        if (InputControl.isCycleState()) {
            if (battleType === BattleType.REAL) {
                battleType = BattleType.EASY;
            } else {
                battleType = BattleType.REAL;
            }
        }

        return battleType;
    }

    // Check if Cycle key is being held (NB: isInputAction = pressed, isInputState = held)
    InputControl.isCycleState = function () {
        return root.isInputState(InputType.BTN5) || root.isInputState(InputType.BTN6);
    }

})();
