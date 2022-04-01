/**
 * By Repeat.
 * An alternative flavor for the battle UI that moves all the info to the bottom of the screen.
 * Inspired by the Kaga-era Fire Emblem games and TearRing Saga.
 * 
 * Overridden without alias:
 *  * UIBattleLayout._drawFrame
 *  * UIBattleLayout._drawNameArea
 *  * UIBattleLayout._drawInfoArea
 *  * UIBattleLayout._drawHpArea
 *  * UIBattleLayout._drawWeaponArea
 *  * UIBattleLayout._drawMain
 */

NameplateUI = {
    isRuntime: true,
    titleId: 0
};

UIBattleLayout._drawFrame = function (isTop) { };

UIBattleLayout._frameWidth = 0;
UIBattleLayout._namePic = null;
UIBattleLayout._hpGaugePic = null;
UIBattleLayout._drawBottomFrame = function (x, y, unit) {
    var textui = UIBattleLayout.getWindowTextUI(unit);
    var pic = textui.getUIImage();
    var width = GraphicsFormat.BATTLEBACK_WIDTH / 4 + GraphicsFormat.FACE_WIDTH;
    var height = GraphicsFormat.FACE_HEIGHT + 16;
    this._frameWidth = width;

    WindowRenderer.drawStretchWindow(x, y, width, height, pic);
}

UIBattleLayout._drawNameArea = function (unit, isRight) {
    var x, y;
    var count = 4;
    var text = unit.getName();
    var color = ColorValue.DEFAULT;
    var font = TextRenderer.getDefaultFont();
    var dx = 10 + this._getIntervalX();
    var xOffset = this._getBattleAreaWidth() / 2 + 10;
    var width = TitleRenderer.getTitlePartsWidth() * (count + 2);

    if (isRight) {
        x = xOffset + this._frameWidth - width;
    }
    else {
        x = dx;
    }
    y = 320;

    var textui = root.queryTextUI('default_window');
    var color = textui.getColor();
    var font = textui.getFont();
    if (!this._namePic) {
        this._namePic = root.getBaseData().getUIResourceList(UIType.TITLE, NameplateUI.isRuntime).getDataFromId(NameplateUI.titleId);
    }

    TextRenderer.drawFixedTitleText(x, y, text, color, font, TextFormat.CENTER, this._namePic, count);
};

UIBattleLayout.getWindowTextUI = function (unit) {
    return Miscellaneous.getColorWindowTextUI(unit);
}

UIBattleLayout._drawInfoArea = function (unit, isRight) {
    var x, y, arr, xStatus;
    var dx = 10 + this._getIntervalX();
    var color = ColorValue.KEYWORD;
    var font = TextRenderer.getDefaultFont();

    if (isRight) {
        x = this._getBattleAreaWidth() / 2 + dx;
        xStatus = x + 16;
        arr = this._statusRight;
    } else {
        x = dx;
        xStatus = x + GraphicsFormat.FACE_WIDTH + 32;
        arr = this._statusLeft;
    }

    y = 365; // AQUI
    if (unit) {
        this._drawBottomFrame(x, y, unit);
    }
    StatusRenderer.drawSnesAttackStatus(xStatus, y + 60, arr, color, font, 28);
};

UIBattleLayout._drawHpArea = function (unit, isRight) {
    var x, gauge, hp, xNumber, yNumber;
    var y = 405; // AQUI
    var dx = 70 + this._getIntervalX();
    var dyNumber = 6;
    if (!this._hpGaugePic) {
        this._hpGaugePic = root.queryUI('battle_gauge');
    }

    if (isRight) {
        x = this._getBattleAreaWidth() - this._gaugeRight.getGaugeWidth() - dx - GraphicsFormat.FACE_WIDTH;
        gauge = this._gaugeRight;
        hp = this._gaugeRight.getBalancer().getCurrentValue();

        xNumber = x + gauge.getGaugeWidth() + 24;
        yNumber = y - dyNumber;

    }
    else {
        x = dx + GraphicsFormat.FACE_WIDTH + 4;
        gauge = this._gaugeLeft;
        hp = gauge.getBalancer().getCurrentValue();

        xNumber = x - 24;
        yNumber = y - dyNumber;
    }

    gauge.drawGaugeBar(x, y, this._hpGaugePic);

    NumberRenderer.drawAttackNumberCenter(xNumber, yNumber, hp);
};

UIBattleLayout._drawWeaponArea = function (unit, isRight) {
    var x, y, width, height, item, text;
    var color = ColorValue.DEFAULT;
    var font = TextRenderer.getDefaultFont();
    var dx = this._getIntervalX();

    if (isRight) {
        item = this._itemRight;
    }
    else {
        item = this._itemLeft;
    }

    if (item === null) {
        return;
    }

    text = item.getName();
    width = TextRenderer.getTextWidth(text, font) + GraphicsFormat.ICON_WIDTH;
    height = 25;

    if (isRight) {
        x = this._getBattleAreaWidth() - this._gaugeRight.getGaugeWidth() - dx - GraphicsFormat.WEAPON_WIDTH;
        y = 360;
    }
    else {
        x = dx + GraphicsFormat.FACE_WIDTH + 4;
        y = 360;
    }

    x += (185 - width) / 2;
    y = Math.floor((y + (y + height)) / 2);

    if (item !== null) {
        ItemRenderer.drawItem(x, y, item, color, font, false);
    }
};

/**
 * Instead of the usual:
 * Atk -- Hit -- Crit --
 * 
 * This draws:
 * Atk -- Hit --
 * Crt -- Agi  --
 * Agi isn't super useful info to have here, except to do some mental math for doubling I guess.
 * Tbh it might be better to just show a "x2" graphic or text if there's doubling going on instead.
 * That is, feel free to edit this to your heart's content.
 */
StatusRenderer.drawSnesAttackStatus = function (x, y, arr, color, font, space) {
    var i, text, xFinal, yFinal;
    var length = this._getTextLength();
    var numberSpace = DefineControl.getNumberSpace();
    var buf = ['attack_capacity', 'hit_capacity', 'critical_capacity', 'agility_capacity'];

    for (i = 0; i < 4; i++) {
        if (i === 0) { // display new string 'Dmg' instead of the unrelated Atk stat
            text = 'Dmg';
        } else {
            text = root.queryCommand(buf[i]);
        }

        if (i % 2 === 0) {
            xFinal = x;
        } else {
            xFinal = x + 28 + numberSpace + space;
        }
        if (i <= 1) {
            yFinal = y;
        } else {
            yFinal = y + 24;
        }

        TextRenderer.drawKeywordText(xFinal, yFinal, text, length, color, font);
        xFinal += 28 + numberSpace;

        if (arr[i] >= 0) {
            NumberRenderer.drawNumber(xFinal, yFinal, arr[i]);
        } else {
            TextRenderer.drawSignText(xFinal - 5, yFinal, StringTable.SignWord_Limitless);
        }
    }
};

UIBattleLayout._drawFaceArea = function (unit, isRight) {
    var x, y;
    var dx = 20 + this._getIntervalX();
    var isReverse = false;

    if (isRight) {
        x = this._getBattleAreaWidth() - GraphicsFormat.FACE_WIDTH - dx;
    }
    else {
        x = 0 + dx;
        isReverse = true;
    }

    y = (0 + this._getBattleAreaHeight()) - GraphicsFormat.FACE_HEIGHT - 12;

    ContentRenderer.drawUnitFace(x, y, unit, isReverse, 255);
}

// Reordered some of the draw functions at the bottom.
UIBattleLayout._drawMain = function () {
    var battler;
    var rightUnit = this._battlerRight.getUnit();
    var leftUnit = this._battlerLeft.getUnit();
    var xScroll = this._realBattle.getAutoScroll().getScrollX();
    var yScroll = 0;

    this._drawBackground(xScroll, yScroll);

    this._drawColor(EffectRangeType.MAP);

    battler = this._realBattle.getActiveBattler();
    if (battler === this._battlerRight) {
        this._drawBattler(xScroll, yScroll, this._battlerLeft, true);
        this._drawColor(EffectRangeType.MAPANDCHAR);
        this._drawBattler(xScroll, yScroll, this._battlerRight, true);
    } else {
        this._drawBattler(xScroll, yScroll, this._battlerRight, true);
        this._drawColor(EffectRangeType.MAPANDCHAR);
        this._drawBattler(xScroll, yScroll, this._battlerLeft, true);
    }

    this._drawCustomPicture(xScroll, yScroll);

    this._drawColor(EffectRangeType.ALL);

    this._drawEffect(xScroll, yScroll, false);

    this._drawInfoArea(rightUnit, true);
    this._drawInfoArea(leftUnit, false);

    this._drawNameArea(rightUnit, true);
    this._drawNameArea(leftUnit, false);

    this._drawWeaponArea(rightUnit, true);
    this._drawWeaponArea(leftUnit, false);

    this._drawFaceArea(rightUnit, true);
    this._drawFaceArea(leftUnit, false);

    this._drawHpArea(rightUnit, true);
    this._drawHpArea(leftUnit, false);

    this._drawEffect(xScroll, yScroll, true);
};

(function () {
    // fourth 'agi' value for the status array
    var alias1 = UIBattleLayout._getAttackStatus;
    UIBattleLayout._getAttackStatus = function (unit, targetUnit, isSrc) {
        var agi;
        var newArr = [, , ,];
        var arr = alias1.call(this, unit, targetUnit, isSrc);

        if (isSrc) {
            agi = AbilityCalculator.getAgility(unit, ItemControl.getEquippedWeapon(unit));
        } else {
            // Always display enemy Agi, even if unarmed and/or unable to counterattack
            agi = AbilityCalculator.getAgility(targetUnit, ItemControl.getEquippedWeapon(targetUnit));
        }

        newArr[0] = arr[0];
        newArr[1] = arr[1];
        newArr[2] = arr[2];
        newArr[3] = agi;

        return newArr;
    };
})();
