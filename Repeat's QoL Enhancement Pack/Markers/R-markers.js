/**
 * By Repeat.
 * Unit State Animator integration by McMagister.
 * Places floating markers over enemies and allies that fulfill certain criteria.
 * These markers can be opted in and out of by changing a handful of boolean values below.
 * You can also use custom parameter {warning:true} on weapons or units to give warning markers to individuals.
 *  */

(function () {

    EFFECTIVE_WARNING = true;   // if true, enemies with weaponry effective against the selected unit will be marked
    CRITICAL_WARNING = true;    // if true, enemies with a high critical rate will be marked
    TALK_WARNING = true;        // if true, units whom the selected unit can speak to will be marked
    SUPPORT_WARNING = true;     // if true, units who give support bonuses to the selected unit will be marked
    SEAL_WARNING = true;        // if true, enemies who would seal the selected unit's attack will be marked

    var selectionAlias = MapEdit._selectAction;
    MapEdit._selectAction = function (unit) {
        var result = MapEditResult.NONE;

        WarningMarkers.checkForMarkConditions(unit);

        result = selectionAlias.call(this, unit);
        return result;
    }

    var WarningMarkers = defineObject(BaseObject, {
        checkForMarkConditions: function (unit) {
            if (unit !== null && unit.getUnitType() == UnitType.PLAYER && !unit.isWait()) {
                var enemies = EnemyList.getAliveList();

                // ENEMY MARKERS
                for (var i = 0; i < enemies.getCount(); i++) {

                    var enemyUnit = enemies.getData(i);

                    if (enemyUnit.isInvisible()) continue;
                    var enemyWeapon = ItemControl.getEquippedWeapon(enemyUnit);

                    if (SEAL_WARNING) {
                        this.searchSealWarnings(unit, enemyUnit, enemyWeapon);
                    }

                    if (enemyUnit.custom.warning) enemyUnit.custom.unitWarning = true;

                    // Unarmed enemies can still have Seal skills and custom warnings. Other enemy markers can be skipped.
                    if (enemyWeapon === null) continue;

                    if (CRITICAL_WARNING) {
                        this.searchCriticalWarnings(unit, enemyUnit, enemyWeapon);
                    }

                    // Effectiveness warning
                    if (EFFECTIVE_WARNING) {
                        this.searchEffectivityWarnings(unit, enemyUnit, enemyWeapon);
                    }

                    if (enemyWeapon.custom.warning) enemyUnit.custom.weapWarning = true;
                }

                // END ENEMY-ONLY MARKERS

                if (TALK_WARNING) {
                    this.searchTalkWarnings(unit);
                }

                if (SUPPORT_WARNING) {
                    this.searchSupportWarnings(unit);
                }
            }

            UnitStateAnimator.updateIcons();
        },

        // Seal warning does account for player unit's Break Seal skills and equipped weapon
        searchSealWarnings: function (unit, enemyUnit, enemyWeapon) {
            var unitWeapon = ItemControl.getEquippedWeapon(unit);
            var hasBreakSealSkill = false;
            var hasSealSkill = false;

            // look for Break Seal skills
            if (unitWeapon) {
                hasBreakSealSkill = unitWeapon.getWeaponOption() === WeaponOption.SEALATTACKBREAK;
            }
            hasBreakSealSkill = hasBreakSealSkill || this.hasValidBreakSealSkill(unit, enemyWeapon, enemyUnit);

            // look for Seal skills if Break Seal not found
            if (!hasBreakSealSkill) {
                if (enemyWeapon) {
                    hasSealSkill = enemyWeapon.getWeaponOption() === WeaponOption.SEALATTACK;
                }
                hasSealSkill = hasSealSkill || this.hasValidSealSkill(unit, unitWeapon, enemyUnit);
            }

            enemyUnit.custom.sealWarning = hasSealSkill;
        },

        // Critical rate warning
        // The enemy's Crit is compared to the user's Critical Avoid (supports not taken 
        // into consideration) and compared against CRT_THRESHOLD.
        searchCriticalWarnings: function (unit, enemyUnit, enemyWeapon) {
            if (!Miscellaneous.isCriticalAllowed(enemyUnit, null)) {
                var crt = 0;
            } else {
                var crt = AbilityCalculator.getCritical(enemyUnit, enemyWeapon);
            }
            var cav = AbilityCalculator.getCriticalAvoid(unit);
            if ((crt - cav) >= CRT_THRESHOLD) enemyUnit.custom.critWarning = true;
        },

        searchEffectivityWarnings: function (unit, enemyUnit, enemyWeapon) {
            var eff = DamageCalculator.isEffective(enemyUnit, unit, enemyWeapon, false, TrueHitValue.NONE);
            if (eff) enemyUnit.custom.effWarning = true;
        },

        searchTalkWarnings: function (unit) {
            var talkArr = EventCommonArray.createArray(root.getCurrentSession().getTalkEventList(), EventType.TALK);
            // for all events
            for (var j = 0; j < talkArr.length; j++) {
                var event = talkArr[j];
                talkInfo = event.getTalkEventInfo();
                src = talkInfo.getSrcUnit();
                dest = talkInfo.getDestUnit();
                if (src === null || dest === null) {
                    continue;
                }
                if (unit !== src && unit !== dest) {
                    continue;
                } else if (unit !== src && !talkInfo.isMutual()) {
                    continue;
                } else if (src.getSortieState() !== SortieType.SORTIE || dest.getSortieState() !== SortieType.SORTIE) {
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
        },

        // getting support pardners
        // If unit receives non-skill support from someone, draw icon
        // TODO: different icons for different supporters
        searchSupportWarnings: function (unit) {
            var i, j, data;
            var amigos = PlayerList.getAliveList();
            for (i = 0; i < amigos.getCount(); i++) {
                var friend = amigos.getData(i);
                if (friend.getSortieState() !== SortieType.SORTIE) continue;
                var supportCount = friend.getSupportDataCount();
                for (j = 0; j < supportCount; j++) {
                    data = friend.getSupportData(j);
                    if (unit === data.getUnit() && data.isGlobalSwitchOn() && data.isVariableOn()) {
                        friend.custom.supWarning = true;
                    }
                }
            }
        },


        hasValidSealSkill: function (unit, item, targetUnit) {
            var skill = SkillControl.getBattleSkillFromValue(targetUnit, unit, SkillType.BATTLERESTRICTION, BattleRestrictionValue.SEALATTACK);
            if (skill) {
                var targets = skill.getTargetAggregation();
                if (targets.isCondition(unit) || targets.isConditionFromWeapon(unit, item)) {
                    return true;
                }
            }
            return false;
        },

        hasValidBreakSealSkill: function (unit, item, targetUnit) {
            var skill = SkillControl.getBattleSkillFromFlag(unit, targetUnit, SkillType.INVALID, InvalidFlag.SEALATTACKBREAK);
            if (skill) {
                var targets = skill.getTargetAggregation();
                if (targets.isCondition(targetUnit) || targets.isConditionFromWeapon(targetUnit, item)) {
                    return true;
                }
            }
            return false;
        },

        // helper function to remove warning custom parameters
        removeMarkers: function () {
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
                enemyUnit.custom.sealWarning = false;
            }
            for (i = 0; i < players.getCount(); i++) {
                var playerUnit = players.getData(i);
                playerUnit.custom.talkWarning = false;
                playerUnit.custom.critWarning = false;
                playerUnit.custom.effWarning = false;
                playerUnit.custom.weapWarning = false;
                playerUnit.custom.unitWarning = false;
                playerUnit.custom.supWarning = false;
                playerUnit.custom.sealWarning = false;
            }
            for (i = 0; i < allies.getCount(); i++) {
                var allyUnit = allies.getData(i);
                allyUnit.custom.talkWarning = false;
                allyUnit.custom.critWarning = false;
                allyUnit.custom.effWarning = false;
                allyUnit.custom.weapWarning = false;
                allyUnit.custom.unitWarning = false;
                allyUnit.custom.supWarning = false;
                allyUnit.custom.sealWarning = false;
            }

            UnitStateAnimator.updateIcons();
        }
    })

    // --------------------
    // SPECIAL UPDATE CASES
    // --------------------

    // ...when changing the inventory
    // Namely, when changing the equipped item or when trading
    // E.g. switching to a weapon that breaks seals or raises Crit Avoid
    var equipUpdateAlias = ItemControl.updatePossessionItem;
    ItemControl.updatePossessionItem = function (unit) {
        equipUpdateAlias.call(this, unit);
        WarningMarkers.removeMarkers();
        WarningMarkers.checkForMarkConditions(unit);
    };

    // ...when checking adjacent spaces for talk partners
    // Notably, updates as soon as a Talk event completes to account for action-after-talk and Canto/Use Leftover Move
    var appendTalkEventAlias = UnitCommand._appendTalkEvent;
    UnitCommand._appendTalkEvent = function (groupArray) {
        var unit = this.getListCommandUnit();
        WarningMarkers.removeMarkers();
        WarningMarkers.checkForMarkConditions(unit);

        appendTalkEventAlias.call(this, groupArray);
    };

    // -------------
    // REMOVAL CASES
    // -------------

    // ...when Cancel/Right mouse button is pressed
    var cancelActionAlias = MapEdit._moveCursorMove;
    MapEdit._moveCursorMove = function () {
        var result = MapEditResult.NONE;
        if (InputControl.isCancelState() || root.isMouseAction(MouseType.RIGHT)) {
            WarningMarkers.removeMarkers();
        }
        result = cancelActionAlias.call(this);
        if (result == MapEditResult.NONE) {
            WarningMarkers.removeMarkers();
        }
        return result;
    }

    // ...after unit acts
    var unitWaitAlias = PlayerTurn.recordPlayerAction;
    PlayerTurn.recordPlayerAction = function (isPlayerActioned) {
        unitWaitAlias.call(this, isPlayerActioned);
        if (isPlayerActioned) {
            WarningMarkers.removeMarkers();
        }
    }

    // ...when switching units' sortie positions during battle prep
    var changePosAlias = SetupEdit._changePos;
    SetupEdit._changePos = function (obj) {
        WarningMarkers.removeMarkers();
        changePosAlias.call(this, obj);
    }

    // Delegate the responsibility of rendering the custom parameters to UnitStateAnimator
    // Icon data is defined in warn-markers-values.js
    var iconUpdaterAlias = UnitStateAnimator._updateIconByUnit;
    UnitStateAnimator._updateIconByUnit = function (unit) {
        iconUpdaterAlias.call(this, unit);

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

        if (unit.custom.sealWarning) {
            var SEALED_ICON_HANDLE = root.createResourceHandle(SEALED_ICON.isRuntime, SEALED_ICON.id, 0, SEALED_ICON.xSrc, SEALED_ICON.ySrc);
            this._addIcon(unit, SEALED_ICON_HANDLE);
        }
    }

})();