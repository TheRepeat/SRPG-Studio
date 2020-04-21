/* By Repeat. Displays combat stats when animations are off. */

(function () {

    EasyAttackMenu.setMenuUnit = function (unitSrc, unitDest) {
        var isLeft, arr1, arr2;

        this._leftWindow = createWindowObject(EasyAttackWindow, this);
        this._rightWindow = createWindowObject(EasyAttackWindow, this);

        isLeft = Miscellaneous.isUnitSrcPriority(unitSrc, unitDest);
        
        if (isLeft) {
            arr1 = this._getAttackStatus(unitSrc, unitDest, true);
            arr2 = this._getAttackStatus(unitSrc, unitDest, false);
            this._leftWindow.setEasyAttackUnit(unitSrc, arr1);
            this._rightWindow.setEasyAttackUnit(unitDest, arr2);
        }
        else {
            arr1 = this._getAttackStatus(unitSrc, unitDest, false);
            arr2 = this._getAttackStatus(unitSrc, unitDest, true);
            this._leftWindow.setEasyAttackUnit(unitDest, arr1);
            this._rightWindow.setEasyAttackUnit(unitSrc, arr2);
        }

        this._unit = unitSrc;
        this._currentTarget = unitDest;
    },

    EasyAttackMenu._getAttackStatus = function (unit, targetUnit, isSrc) {
        var arr, isCounterattack;

        if (isSrc) {
            arr = AttackChecker.getAttackStatusInternal(unit, BattlerChecker.getRealBattleWeapon(unit), targetUnit);
        }
        else {
            isCounterattack = AttackChecker.isCounterattack(unit,targetUnit);
            if (isCounterattack) {
                arr = AttackChecker.getAttackStatusInternal(targetUnit, BattlerChecker.getRealBattleWeapon(targetUnit), unit);
            }
            else {
                arr = AttackChecker.getNonStatus();
            }
        }

        return arr;
    },

    EasyAttackWindow._statusArray = null;

    EasyAttackWindow.setEasyAttackUnit = function(unit,arr){
        this._unit = unit;
        this._statusArray = arr;
        this._isAnimation = false;
        this._gaugeBar = createObject(GaugeBar);
        this._gaugeBar.setGaugeInfo(unit.getHp(), ParamBonus.getMhp(unit), 1);
    },

    EasyAttackWindow.drawWindowContent = function (x, y) {
        this._drawName(x+10, y);
        this._drawHP(x+10, y);
        var textui = this.getWindowTextUI();
        var color = ColorValue.KEYWORD;
        var font = textui.getFont();
        StatusRenderer.drawAttackStatus(x, y + 80, this._statusArray, color, font, 20);
    }

    EasyAttackWindow.getWindowWidth = function(){
        return 230; // 40 wider
    }

    EasyAttackWindow.getWindowHeight = function(){
        return 130; // 30 taller
    }

})();