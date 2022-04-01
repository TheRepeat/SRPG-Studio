/**
 * By Repeat.
 * Modified objective screen v1.0
 * This refers to the screen in the list of map commands, which shows the objectives, map description, and remaining units.
 * 
 * Changes:
 *  * Removes chapter number from the top. Just shows the map name, bookended by hyphens for style.
 *  * Removes the faces, stacks unit counts vertically, and puts the turn and gold to the right of the unit counts.
 *      - ObjectiveFaceZone is no longer used at all.
 *  * Shrinks the screen height slightly since this takes up less space than the vanilla version with the faces.
 *  * "TURN: 0" text in (for example) battle prep is replaced with "TURN: --"
 * 
 * These functions are overwritten without aliases:
 *  * ObjectiveWindow._drawTop
 *  * ObjectiveWindow.drawWindowContent
 *  * ObjectiveWindow._drawArea
 *  * BaseObjectiveParts._getTitleTextUI
 *  * BaseObjectiveParts.drawObjectiveParts
 *  * ObjectiveParts.Turn now has its own drawObjectiveParts function instead of inheriting it from BaseObjectiveParts
 */

ObjectiveWindow._drawTop = function (x, y) {
    var textui = this._getTitleTextUI();
    var color = textui.getColor();
    var font = textui.getFont();
    var pic = textui.getUIImage();
    var mapInfo = root.getCurrentSession().getCurrentMapInfo();
    var text = '- ' + mapInfo.getName() + ' -';
    var titleCount = 7;
    var sx = LayoutControl.getCenterX(-1, TitleRenderer.getTitlePartsWidth() * (titleCount + 2));

    TextRenderer.drawFixedTitleText(sx, y - 48, text, color, font, TextFormat.CENTER, pic, titleCount);
};

ObjectiveWindow.drawWindowContent = function (x, y) {
    this._drawTop(x, y);
    this._drawUnitCountArea(x, y);
    this._drawObjectiveArea(x, y);
    this._drawArea(x, y);
};

ObjectiveWindow._drawUnitCountArea = function (x, y) {
    x += 10;
    y += 12;

    var i, unitType;
    var arr = [UnitType.PLAYER, UnitType.ENEMY, UnitType.ALLY];
    var count = arr.length;

    for (i = 0; i < count; i++) {
        unitType = arr[i];

        this._drawUnitCountByFaction(x, y, unitType)

        y += DefineControl.getTextPartsHeight() + 10;
    }
};

ObjectiveWindow._drawUnitCountByFaction = function (x, y, unitType) {
    var total = this._getUnitCount(unitType);
    var textui = this._getSpecialTitleTextUI();
    var color = ColorValue.KEYWORD;
    var font = textui.getFont();
    var pic = textui.getUIImage();
    var text = [StringTable.UnitType_Player, StringTable.UnitType_Enemy, StringTable.UnitType_Ally];

    TitleRenderer.drawTitle(pic, x - 20 + 5, y - 10, TitleRenderer.getTitlePartsWidth(), TitleRenderer.getTitlePartsHeight(), 5);
    TextRenderer.drawText(x + 5, y + 12, text[unitType], -1, color, font);
    if (total > 0) {
        NumberRenderer.drawNumber(x + 160, y + 7, total);
    } else {
        TextRenderer.drawText(x + 160, y + 12, StringTable.SignWord_Limitless, -1, color, font);
    }
};

ObjectiveWindow._getUnitCount = function (unitType) {
    var list;

    if (unitType === UnitType.PLAYER) {
        list = PlayerList.getSortieDefaultList();
    }
    else if (unitType === UnitType.ENEMY) {
        list = EnemyList.getAliveDefaultList();
    }
    else {
        list = AllyList.getAliveDefaultList();
    }

    return list.getCount();
};

ObjectiveWindow._drawArea = function (x, y) {
    var i;
    var count = this._objectArray.length;

    x += 265;
    y += 28;

    for (i = 0; i < count; i++) {
        this._objectArray[i].drawObjectiveParts(x, y);

        y += DefineControl.getTextPartsHeight() + 10;
    }
};

ObjectiveWindow._getSpecialTitleTextUI = function () {
    return root.queryTextUI('description_title');
};

BaseObjectiveParts._getTitleTextUI = function () {
    return root.queryTextUI('description_title');
};

BaseObjectiveParts.drawObjectiveParts = function (x, y) {
    var text = this.getObjectivePartsName();
    var value = this.getObjectivePartsValue();
    var textui = this._getTitleTextUI();
    var color = ColorValue.KEYWORD;
    var font = textui.getFont();
    var pic = textui.getUIImage();

    TitleRenderer.drawTitle(pic, x, y, TitleRenderer.getTitlePartsWidth(), TitleRenderer.getTitlePartsHeight(), 5);
    TextRenderer.drawKeywordText(x + 15, y + 14, text, -1, color, font);
    NumberRenderer.drawNumber(x + 160, y + 14, value);
}

ObjectiveParts.Turn.drawObjectiveParts = function (x, y) {
    var text = this.getObjectivePartsName();
    var value = this.getObjectivePartsValue();
    var textui = this._getTitleTextUI();
    var color = ColorValue.KEYWORD;
    var font = textui.getFont();
    var pic = textui.getUIImage();

    TitleRenderer.drawTitle(pic, x, y, TitleRenderer.getTitlePartsWidth(), TitleRenderer.getTitlePartsHeight(), 5);
    TextRenderer.drawKeywordText(x + 15, y + 14, text, -1, color, font);
    if (value > 0) {
        NumberRenderer.drawNumber(x + 160, y + 14, value);
    } else {
        TextRenderer.drawKeywordText(x + 160, y + 14, StringTable.SignWord_Limitless, -1, color, font);
    }
}
