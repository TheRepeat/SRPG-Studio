/**
 * Warning Markers
 * Version 3.1
 * By Repeat.
 * Unit State Animator integration by McMagister.
 * Performance improvements by Purplemandown.
 * 
 * Places floating markers over enemies and allies that fulfill certain criteria.
 * You can also use custom parameter {warning:true} on weapons or units to give warning markers to individuals.
 *  */

 var WarningMarkers = defineObject(BaseObject, {
    _checkingActive: false,
    _enemies: null,
    _unit: null,
    _currentIndex: 0,

    initialize: function (unit) {
        this._unit = unit;
        this._enemies = EnemyList.getAliveList();
        this._checkingActive = true;
        this._currentIndex = 0;
    },

    checkForMarkConditions: function () {
        // Only run the check if we are actively checking and haven't finished
        if (this._checkingActive && this._enemies.getCount() >= this._currentIndex + 1) {
            if (this._unit !== null && this._unit.getUnitType() == UnitType.PLAYER && !this._unit.isWait()) {
                // Set data from costly function calls upfront for performance
                var unitWeapon = ItemControl.getEquippedWeapon(this._unit);
                var cav = AbilityCalculator.getCriticalAvoid(this._unit);

                // Get index max for this pass
                var groupCount = DataConfig.isHighPerformance() ? MarkerDisplay.countLoadPerLoop : MarkerDisplay.countLoadPerLoop30fps;
                var maxIndex = this._currentIndex + groupCount;

                // ENEMY MARKERS
                for (var i = this._currentIndex; i < this._enemies.getCount() && i < maxIndex; i++) {

                    var enemyUnit = this._enemies.getData(i);

                    if (enemyUnit.isInvisible()) continue;
                    var enemyWeapon = ItemControl.getEquippedWeapon(enemyUnit);

                    if (MarkerDisplay.sealWarning) {
                        this.searchSealWarnings(this._unit, unitWeapon, enemyUnit, enemyWeapon);
                    }

                    if (enemyUnit.custom.warning) enemyUnit.custom.unitWarning = true;

                    // Unarmed enemies can still have Seal skills and custom warnings. Other enemy markers can be skipped.
                    if (enemyWeapon === null) continue;

                    if (MarkerDisplay.criticalWarning) {
                        this.searchCriticalWarnings(cav, enemyUnit, enemyWeapon);
                    }

                    // Effectiveness warning
                    if (MarkerDisplay.effectiveWarning) {
                        this.searchEffectivityWarnings(this._unit, enemyUnit, enemyWeapon);
                    }

                    if (enemyWeapon.custom.warning) enemyUnit.custom.weapWarning = true;
                }

                this._currentIndex = i;

                // END ENEMY-ONLY MARKERS

                if (MarkerDisplay.talkWarning) {
                    this.searchTalkWarnings(this._unit);
                }

                if (MarkerDisplay.supportWarning) {
                    this.searchSupportWarnings(this._unit);
                }
            }

            UnitStateAnimator.updateIcons();
        }
    },

    // Seal warning does account for player unit's Break Seal skills and equipped weapon
    searchSealWarnings: function (unit, unitWeapon, enemyUnit, enemyWeapon) {
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
    searchCriticalWarnings: function (unitCritAvo, enemyUnit, enemyWeapon) {
        if (!Miscellaneous.isCriticalAllowed(enemyUnit, null)) {
            var crt = 0;
        } else {
            var crt = AbilityCalculator.getCritical(enemyUnit, enemyWeapon);
        }
        if ((crt - unitCritAvo) >= CRT_THRESHOLD) enemyUnit.custom.critWarning = true;
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

    // helper function to remove warning custom parameters and stop checking for markers
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
        // turn off checking
        this._checkingActive = false;
    }
});

(function () {
    var selectionAlias = MapEdit._selectAction;
    MapEdit._selectAction = function (unit) {
        var result = MapEditResult.NONE;

        WarningMarkers.initialize(unit);
        WarningMarkers.checkForMarkConditions();

        result = selectionAlias.call(this, unit);
        return result;
    }

    // Call every frame on player phase, but logic isn't executed unless _checkActive is true
    var moveTurnCycleAlias = PlayerTurn.moveTurnCycle;
    PlayerTurn.moveTurnCycle = function () {
        var result = moveTurnCycleAlias.call(this);
        WarningMarkers.checkForMarkConditions();
        return result;
    }

    // --------------------
    // SPECIAL UPDATE CASES
    // --------------------

    // ...when changing the inventory
    // Namely, when changing the equipped item or when trading
    // E.g. switching to a weapon that breaks seals or raises Crit Avoid
    var equipUpdateAlias = ItemControl.updatePossessionItem;
    ItemControl.updatePossessionItem = function (unit) {
        equipUpdateAlias.call(this, unit);

        if (root.getBaseScene() === SceneType.FREE) {
            WarningMarkers.removeMarkers();
            WarningMarkers.initialize(unit);
        }
    };

    // ...when checking adjacent spaces for talk partners
    // Notably, updates as soon as a Talk event completes to account for action-after-talk and Canto/Use Leftover Move
    var appendTalkEventAlias = UnitCommand._appendTalkEvent;
    UnitCommand._appendTalkEvent = function (groupArray) {
        var unit = this.getListCommandUnit();
        WarningMarkers.removeMarkers();
        WarningMarkers.initialize(unit);

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

    // ...when the map ends
    var mapEndAlias = MapEndFlowEntry.enterFlowEntry;
    MapEndFlowEntry.enterFlowEntry = function (battleResultScene) {
        WarningMarkers.removeMarkers();

        return mapEndAlias.call(this, battleResultScene);
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
