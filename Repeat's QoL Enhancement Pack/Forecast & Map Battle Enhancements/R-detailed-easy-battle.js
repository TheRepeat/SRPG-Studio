/**
 * By Repeat.
 * Displays combat stats when animations are off.
 * 
 * See IS_LARGE at the top of the code:
 * * IS_LARGE=true shows portraits and equipped weapons, while IS_LARGE=false is more space efficient.
 */

(function () {

    IS_LARGE = false; // true: more info, false: more compact

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
    }

    EasyAttackMenu._getAttackStatus = function (unit, targetUnit, isSrc) {
        var arr, isCounterattack;

        if (isSrc) {
            arr = AttackChecker.getAttackStatusInternal(unit, BattlerChecker.getRealBattleWeapon(unit), targetUnit);
        }
        else {
            isCounterattack = AttackChecker.isCounterattack(unit, targetUnit);
            if (isCounterattack) {
                arr = AttackChecker.getAttackStatusInternal(targetUnit, BattlerChecker.getRealBattleWeapon(targetUnit), unit);
            }
            else {
                arr = AttackChecker.getNonStatus();
            }
        }

        return arr;
    }

    EasyAttackWindow._statusArray = null;

    EasyAttackWindow.setEasyAttackUnit = function (unit, arr) {
        this._unit = unit;
        this._weapon = ItemControl.getEquippedWeapon(unit);
        this._statusArray = arr;
        this._isAnimation = false;
        this._gaugeBar = createObject(GaugeBar);
        this._gaugeBar.setGaugeInfo(unit.getHp(), ParamBonus.getMhp(unit), 1);
    }

    EasyAttackWindow.drawWindowContent = function (x, y) {
        var hpMod = IS_LARGE ? -15 : 10;
        var nameMod = IS_LARGE ? 0 : 10;
        var statusMod = IS_LARGE ? 40 : 80;
        this._drawName(x + nameMod, y);
        this._drawHP(x + hpMod, y);
        if (IS_LARGE) this._drawFace(x + 120, y);
        var textui = this.getWindowTextUI();
        var color = ColorValue.KEYWORD;
        var color2 = ColorValue.DEFAULT;
        var font = textui.getFont();
        if (IS_LARGE) {
            y += 80;
            this._drawWeapon(x, y, color2, font);
        }
        StatusRenderer.drawAttackStatus(x, y + statusMod, this._statusArray, color, font, 20);
    }

    EasyAttackWindow.getWindowWidth = function () {
        return IS_LARGE ? 250 : 230; // 40-60 wider
    }

    EasyAttackWindow.getWindowHeight = function () {
        return IS_LARGE ? 170 : 130; // 30-70 taller
    }

    EasyAttackWindow._drawFace = function (x, y) {
        var textui = this.getWindowTextUI();
        var pic, xSrc, ySrc;
        var destWidth = GraphicsFormat.FACE_WIDTH;
        var destHeight = GraphicsFormat.FACE_HEIGHT;
        var srcWidth = destWidth;
        var srcHeight = destHeight;
        var handle = this._unit.getFaceResourceHandle();

        // If you want a frame to surround the player face, uncomment the below code and delete null;
        // Personally not a fan though.
        var picFrame = null; //root.queryUI('objectiveunit_frame');
        var frameWidth = Math.floor(UIFormat.FACEFRAME_WIDTH / 2);
        var frameHeight = UIFormat.FACEFRAME_HEIGHT;
        var xMargin = 16;
        var yMargin = 16;

        if (picFrame !== null) {
            picFrame.drawStretchParts(x - xMargin, y - yMargin, frameWidth, frameHeight, frameWidth, 0, frameWidth, frameHeight);
        }

        if (handle === null) {
            return;
        }

        pic = GraphicsRenderer.getGraphics(handle, GraphicsType.FACE);
        if (pic === null) {
            return;
        }

        if (this._iS_LARGEFace) {
            destWidth = this._faceWidth;
            destHeight = this._faceHeight;
            if (pic.iS_LARGEImage()) {
                srcWidth = destWidth;
                srcHeight = destHeight;
            }
        }

        xSrc = handle.getSrcX();
        ySrc = handle.getSrcY();

        xSrc *= srcWidth;
        ySrc *= srcHeight;
        pic.drawStretchParts(x, y, destWidth, destHeight, xSrc, ySrc, srcWidth, srcHeight);

        if (picFrame !== null) {
            picFrame.drawStretchParts(x - xMargin, y - yMargin, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
        }
    }

    EasyAttackWindow._drawWeapon = function (x, y, color, font) {
        if (this._weapon !== null) {
            ItemRenderer.drawItem(x, y, this._weapon, color, font, false);
        }
        else {
            TextRenderer.drawKeywordText(x, y, StringTable.SignWord_WaveDash, -1, color, font);
        }
    }

})();