/* By Repeat, edited by McMagister
   Places warning markers over enemies that have high critical rates or
   have weaponry effective against the selected player unit.
   (If you wish, you can also denote specific weapons or enemies with {warning:true} 
   to give them a unique warning icon.)
   Also puts a marker over units the current unit can Talk to, and allies that give 
   support bonuses to the current unit.
*/
(function () {

    var alias1 = MapEdit._selectAction;
    MapEdit._selectAction = function (unit) {
        var result = MapEditResult.NONE;

        if (unit != null && unit.getUnitType() == UnitType.PLAYER) {
            result = MapEditResult.UNITSELECT; // normal cursor effect
            // Check for danger:
            if (!unit.isWait()) {
                var enemies = EnemyList.getAliveList();

                for (var i = 0; i < enemies.getCount(); i++) {

                    var enemyUnit = enemies.getData(i);

                    if (enemyUnit.isInvisible()) continue;
                    if (ItemControl.getEquippedWeapon(enemyUnit) === null) continue;

                    var weapon = ItemControl.getEquippedWeapon(enemyUnit);

                    // Critical rate warning
                    // The enemy's Crit is compared to the user's Critical Avoid (supports not taken 
                    // into consideration) and compared against CRT_THRESHOLD.
                    if (!Miscellaneous.isCriticalAllowed(enemyUnit, null)) {
                        var crt = 0;
                    } else {
                        var crt = AbilityCalculator.getCritical(enemyUnit, weapon);
                    }
                    var cav = AbilityCalculator.getCriticalAvoid(unit);
                    if ((crt - cav) >= CRT_THRESHOLD) enemyUnit.custom.critWarning = true;

                    // Effectiveness warning
                    var eff = DamageCalculator.isEffective(enemyUnit, unit, weapon, false, TrueHitValue.NONE);
                    if (eff) enemyUnit.custom.effWarning = true;

                    if (weapon.custom.warning) enemyUnit.custom.weapWarning = true;

                    if (enemyUnit.custom.warning) enemyUnit.custom.unitWarning = true;
                }

                var talkArr = EventCommonArray.createArray(root.getCurrentSession().getTalkEventList(), EventType.TALK);
                // for all events
                for (var j = 0; j < talkArr.length; j++) {
                    event = talkArr[j];
                    talkInfo = event.getTalkEventInfo();
                    src = talkInfo.getSrcUnit();
                    dest = talkInfo.getDestUnit();
                    if (src === null || dest === null) {
                        continue;
                    }
                    if (unit != src && unit != dest) {
                        continue;
                    } else if (unit != src && !talkInfo.isMutual()) {
                        continue;
                    }

                    // talk warning
                    if (event.isEvent() && event.getExecutedMark() === EventExecutedType.FREE) {
                        var unit2;
                        if (unit === src) {
                            unit2 = dest;
                        } else {
                            unit2 = src;
                        }
                        unit2.custom.talkWarning = true;
                    }
                }

                // getting support pardners
                // If unit receives non-skill support from someone, draw icon
                // TODO: different icons for different supporters
                var i,j, data;
                var amigos = PlayerList.getAliveList();
                for (i = 0; i < amigos.getCount(); i++) {
                    var friend = amigos.getData(i);
                    var supportCount = friend.getSupportDataCount();
                    for (j = 0; j < supportCount; j++) {
                        data = friend.getSupportData(j);
                        if (unit === data.getUnit() && data.isGlobalSwitchOn() && data.isVariableOn()) {
                            friend.custom.supWarning = true;
                        }
                    }
                }
            }
        }

        UnitStateAnimator.updateIcons();

        result = alias1.call(this, unit);
        return result;
    }

    InputControl.isCancelState = function () {
        return root.isInputState(InputType.BTN2) || root.isMouseAction(MouseType.RIGHT);
    }

    // REMOVE STATES

    // remove states when Cancel/Right mouse button is pressed
    var alias2 = MapEdit._moveCursorMove;
    MapEdit._moveCursorMove = function () {
        var result = MapEditResult.NONE;
        if (InputControl.isCancelState()) {
            removeWarningStates();
        }
        result = alias2.call(this);
        if (result == MapEditResult.NONE) {
            removeWarningStates();
        }
        return result;
    }

    // remove states after unit acts
    var alias4 = PlayerTurn.recordPlayerAction;
    PlayerTurn.recordPlayerAction = function (isPlayerActioned) {
        alias4.call(this, isPlayerActioned);
        if (isPlayerActioned) {
            removeWarningStates();
        }
    }

    // remove states when switching units' sortie positions during battle prep
    var alias5 = SetupEdit._changePos;
    SetupEdit._changePos = function (obj) {
        removeWarningStates();
        alias5.call(this, obj);
    }

    // END REMOVE STATES

    // helper function to remove warning custom parameters
    var removeWarningStates = function () {
        var enemies = EnemyList.getAliveList();
        var players = PlayerList.getAliveList();
        var allies = AllyList.getAliveList();

        for (i = 0; i < enemies.getCount(); i++) {
            var enemyUnit = enemies.getData(i);
            enemyUnit.custom.talkWarning = false;
            enemyUnit.custom.critWarning = false;
            enemyUnit.custom.effWarning = false;
            enemyUnit.custom.weapWarning = false;
            enemyUnit.custom.unitWarning = false;
            enemyUnit.custom.supWarning = false;
        }
        for (i = 0; i < players.getCount(); i++) {
            var playerUnit = players.getData(i);
            playerUnit.custom.talkWarning = false;
            playerUnit.custom.critWarning = false;
            playerUnit.custom.effWarning = false;
            playerUnit.custom.weapWarning = false;
            playerUnit.custom.unitWarning = false;
            playerUnit.custom.supWarning = false;
        }
        for (i = 0; i < allies.getCount(); i++) {
            var allyUnit = allies.getData(i);
            allyUnit.custom.talkWarning = false;
            allyUnit.custom.critWarning = false;
            allyUnit.custom.effWarning = false;
            allyUnit.custom.weapWarning = false;
            allyUnit.custom.unitWarning = false;
            allyUnit.custom.supWarning = false;
        }

        UnitStateAnimator.updateIcons();
    }


    // Delegate the responsibility of rendering the custom parameters to UnitStateAnimator
    // Icons are defined in warn-markers-values-v2.js
    var alias = UnitStateAnimator._updateIconByUnit;
    UnitStateAnimator._updateIconByUnit = function (unit) {
        alias.call(this, unit);

        if (unit.custom.talkWarning) {
            var TALK_ICON_HANDLE = root.createResourceHandle(TALK_ICON.isRuntime, TALK_ICON.id, 0, TALK_ICON.xSrc, TALK_ICON.ySrc);
            this._addIcon(unit, TALK_ICON_HANDLE);
        }

        if (unit.custom.effWarning) {
            var EFFECTIVE_ICON_HANDLE = root.createResourceHandle(EFFECTIVE_ICON.isRuntime, EFFECTIVE_ICON.id, 0, EFFECTIVE_ICON.xSrc, EFFECTIVE_ICON.ySrc);
            this._addIcon(unit, EFFECTIVE_ICON_HANDLE);
        }

        if (unit.custom.critWarning) {
            var CRITICAL_ICON_HANDLE = root.createResourceHandle(CRITICAL_ICON.isRuntime, CRITICAL_ICON.id, 0, CRITICAL_ICON.xSrc, CRITICAL_ICON.ySrc);
            this._addIcon(unit, CRITICAL_ICON_HANDLE);
        }

        if (unit.custom.weapWarning) {
            var WEAPON_ICON_HANDLE = root.createResourceHandle(WEAPON_ICON.isRuntime, WEAPON_ICON.id, 0, WEAPON_ICON.xSrc, WEAPON_ICON.ySrc);
            this._addIcon(unit, WEAPON_ICON_HANDLE);
        }

        if (unit.custom.unitWarning) {
            var UNIT_ICON_HANDLE = root.createResourceHandle(UNIT_ICON.isRuntime, UNIT_ICON.id, 0, UNIT_ICON.xSrc, UNIT_ICON.ySrc);
            this._addIcon(unit, UNIT_ICON_HANDLE);
        }

        if (unit.custom.supWarning) {
            var SUPPORT_ICON_HANDLE = root.createResourceHandle(SUPPORT_ICON.isRuntime, SUPPORT_ICON.id, 0, SUPPORT_ICON.xSrc, SUPPORT_ICON.ySrc);
            this._addIcon(unit, SUPPORT_ICON_HANDLE);
        }
    }

})();