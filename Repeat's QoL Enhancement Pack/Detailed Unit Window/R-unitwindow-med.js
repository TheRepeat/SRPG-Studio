/**
 * By Repeat.
 * Changes the layout of the medium (M) setting for the detailed unit window.
 * Shows the unit's equipped weapon instead of the HP bar and class.
 * 
 * Depending on the value of MEDIUM_SHOWS_STATS, displays either the unit's Atk and Agi or the unit's Lv and EXP.
 * 
 * Functions overridden without an alias:
 *  * MapParts.UnitInfo.setUnit
 *  * MapParts.UnitInfo._drawContent
 *  * UnitSimpleRenderer.drawContentEx
 *  * UnitSimpleWindow.setFaceUnitData
 *  * UnitSimpleWindow.drawWindowContent
 *  * UnitSimpleRenderer._drawSubInfo
 */

function getIconHandles(unit) {
    var handleArr = [];

    var i = 0;
    var activeItem = unit.getItem(0);
    while (activeItem !== null) {
        handle = activeItem.getIconResourceHandle();
        handleArr.push(handle);

        i++;
        activeItem = unit.getItem(i) !== null ? unit.getItem(i) : null;
    }

    return handleArr;
}

MapParts.UnitInfo._unitData = null;
UnitSimpleWindow._unitData = null;

// need to grab some data ahead of time since it's expensive
MapParts.UnitInfo.setUnit = function (unit) {
    if (unit !== null) {
        this._mhp = ParamBonus.getMhp(unit);
        var weapon = ItemControl.getEquippedWeapon(unit);
        var atk = 0;
        if (weapon) {
            atk = AbilityCalculator.getPower(unit, weapon);
        }
        this._unitData = {
            agi: AbilityCalculator.getAgility(unit, weapon),
            atk: atk,
            handleArr: getIconHandles(unit),
            totalStatus: SupportCalculator.createTotalStatus(unit),
            weapon: weapon
        }
    }
}

MapParts.UnitInfo._drawContent = function (x, y, unit, textui) {
    UnitSimpleRenderer.drawContentEx(x, y, unit, textui, this._mhp, this._unitData);
}

// Pass data on Trade/Manage Status screens
UnitSimpleWindow.setFaceUnitData = function (unit) {
    this._unit = unit;
    this._mhp = ParamBonus.getMhp(unit);
    var weapon = ItemControl.getEquippedWeapon(unit);
    var atk = 0;
    if (weapon) {
        atk = AbilityCalculator.getPower(unit, weapon);
    }
    this._unitData = {
        agi: AbilityCalculator.getAgility(unit, weapon),
        atk: atk,
        handleArr: getIconHandles(unit),
        totalStatus: SupportCalculator.createTotalStatus(unit),
        weapon: weapon
    }
}

UnitSimpleWindow.drawWindowContent = function (x, y) {
    UnitSimpleRenderer.drawContentEx(x, y, this._unit, this.getWindowTextUI(), this._mhp, this._unitData);
}

UnitSimpleRenderer.drawContentEx = function (x, y, unit, textui, mhp, unitData) {
    this._drawFace(x, y, unit, textui);
    this._drawName(x, y, unit, textui);
    if (unitData) {
        this._drawHp(x, y, unit, textui, mhp);
        this._drawSubInfo(x, y, unit, textui, unitData);
        this._drawWeaponInfo(x, y, unit, textui, unitData);
    }
}

UnitSimpleRenderer._drawHp = function (x, y, unit, textui, mhp) {
    x += GraphicsFormat.FACE_WIDTH + this._getInterval();
    y += 28;

    ContentRenderer.drawHp(x, y, unit.getHp(), mhp);
}

UnitSimpleRenderer._drawSubInfo = function (x, y, unit, textui, unitData) {
    var agi = unitData.agi;
    var totalStatus = unitData.totalStatus;

    var pwrBonus = 0;
    if (totalStatus) {
        pwrBonus = totalStatus.powerTotal;
    }
    var atk = unitData.atk + pwrBonus;

    x += GraphicsFormat.FACE_WIDTH + this._getInterval();
    y += 50;

    if (!MEDIUM_SHOWS_STATS) {
        ContentRenderer.drawLevelInfo(x, y, unit);
    } else {
        this._drawCombatStat(x, y, unit, textui, unitData, root.queryCommand('attack_capacity'), atk)
        this._drawCombatStat(x + 60, y, unit, textui, unitData, root.queryCommand('agility_capacity'), agi)
    }
}

UnitSimpleRenderer._drawCombatStat = function (x, y, unit, textui, unitData, name, value) {
    var font = textui.getFont();
    var color = textui.getColor();

    TextRenderer.drawText(x, y, name, -1, STAT_COLOR, font);
    x += 44;

    if (name === root.queryCommand('attack_capacity') && unitData.weapon === null) {
        TextRenderer.drawKeywordText(x, y - 3, StringTable.SignWord_WaveDash, -1, color, font)
    } else {
        this._drawStatValue(x, y - 3, value, font);
    }
}

UnitSimpleRenderer._drawStatValue = function (x, y, value, font) {
    var xMod = 12;
    if (value < 0) {
        if (value <= -10) xMod = 20;
        TextRenderer.drawText(x - xMod, y + 3, ' - ', 64, 0xFFFFFF, font);
        value *= -1;
    }
    NumberRenderer.drawNumber(x, y, value);
}

UnitSimpleRenderer._drawWeaponInfo = function (x, y, unit, textui, unitData) {
    var length = this._getTextLength();
    var color = textui.getColor();
    var font = textui.getFont();
    var weapon = unitData.weapon;

    x += GraphicsFormat.FACE_WIDTH + this._getInterval();
    y += 70;

    // equipped weapon or list of icons in inventory
    if (!ICONS_ONLY) {
        if (!weapon) {
            TextRenderer.drawText(x, y + 4, '(Unarmed)', length, color, font);
        } else {
            ItemRenderer.drawItemLarge(x, y, weapon, textui.getColor(), textui.getFont(), false);
        }
    } else {
        this._drawItemIcons(x, y, unit, textui, 4, unitData);
    }
}

UnitSimpleRenderer._drawItemIcons = function (x, y, unit, textui, itemCount, unitData) {
    var length = this._getTextLength();
    var color = textui.getColor();
    var font = textui.getFont();
    var iconWidth = GraphicsFormat.ICON_WIDTH + 5;
    var handle;
    var graphicsRenderParam = StructureBuilder.buildGraphicsRenderParam();
    var handleArr = unitData.handleArr;

    if (!handleArr || !handleArr.length) {
        TextRenderer.drawText(x, y + 4, '(No items)', length, color, font);
        return;
    }

    if (handleArr) {
        var count = Math.min(handleArr.length, itemCount);

        for (var i = 0; i < count; i++) {
            handle = handleArr[i];
            GraphicsRenderer.drawImageParam(x + (iconWidth * i), y, handle, GraphicsType.ICON, graphicsRenderParam);
        }
    }
}
