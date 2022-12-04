/**
 * By Repeat.
 * This plugin allows you to make a custom S Drink-type item to reset the user's Fatigue stat.
 * 
 * Item type: Custom
 * Keyword: S Drink
 *  ^ remember this keyword is case sensitive and the space matters ^
 */

(function () {
    var alias1 = ItemControl.isItemUsable;
    ItemControl.isItemUsable = function (unit, item) {
        var result = alias1.call(this, unit, item);

        if (item.getCustomKeyword() === FatigueConfig.ItemKeyword) {
            return RealBonus.getFatigue(unit) > 0
        }

        return result;
    }

    var alias2 = ItemPackageControl.getCustomItemSelectionObject;
    ItemPackageControl.getCustomItemSelectionObject = function (item, keyword) {
        if (keyword === FatigueConfig.ItemKeyword) {
            return SDrinkItemSelection;
        }

        return alias2.call(this, item, keyword);
    }

    var alias3 = ItemPackageControl.getCustomItemAvailabilityObject;
    ItemPackageControl.getCustomItemAvailabilityObject = function (item, keyword) {
        if (keyword === FatigueConfig.ItemKeyword) {
            return SDrinkItemAvailability;
        }
        return alias3.call(this, item, keyword);
    }

    var alias4 = ItemPackageControl.getCustomItemUseObject;
    ItemPackageControl.getCustomItemUseObject = function (item, keyword) {
        if (keyword === FatigueConfig.ItemKeyword) {
            return SDrinkItemUse;
        }
        return alias4.call(this, item, keyword);
    }

    var alias5 = ItemPackageControl.getCustomItemInfoObject;
    ItemPackageControl.getCustomItemInfoObject = function (item, keyword) {
        if (keyword === FatigueConfig.ItemKeyword) {
            return SDrinkItemInfo;
        }
        return alias5.call(this, item, keyword);
    }

    // allows item to be usable during battle prep
    var alias6 = ItemMessenger._isItemTypeAllowed;
    ItemMessenger._isItemTypeAllowed = function (unit, item) {
        var result = alias6.call(this, unit, item);

        return result || item.getCustomKeyword() === FatigueConfig.ItemKeyword;
    }

    // asks to confirm before using the item
    var alias7 = ItemMessenger._isQuestionRequired;
    ItemMessenger._isQuestionRequired = function () {
        var result = alias7.call(this);

        return result || this._item.getCustomKeyword() === FatigueConfig.ItemKeyword;
    }
})();

var SDrinkItemSelection = defineObject(BaseItemSelection, {});
var SDrinkItemInfo = defineObject(BaseItemInfo, {
    drawItemInfoCycle: function (x, y) {
        ItemInfoRenderer.drawKeyword(x, y, FatigueConfig.ItemName);
    },

    getInfoPartsCount: function () {
        return 1;
    }
});

var SDrinkItemAvailability = defineObject(BaseItemAvailability, {
    isItemAvailableCondition: function (unit, item) {
        return RealBonus.getFatigue(unit) > 0;
    }
});

var SDrinkItemUse = defineObject(BaseItemUse, {
    _unit: null,
    _noticeView: null,

    enterMainUseCycle: function (itemUseParent) {
        var itemTargetInfo = itemUseParent.getItemTargetInfo();
        this._unit = itemTargetInfo.targetUnit;

        FatigueControl.resetFatigue(this._unit);

        this._noticeView = createObject(SDrinkNoticeView);
        this._noticeView.setViewText(this._unit.getName());

        return EnterResult.OK;
    },

    moveMainUseCycle: function () {
        if (this._noticeView.moveNoticeView() !== MoveResult.CONTINUE) {
            return MoveResult.END;
        }

        return MoveResult.CONTINUE;
    },

    drawMainUseCycle: function () {
        var x = LayoutControl.getCenterX(-1, this._noticeView.getNoticeViewWidth());
        var y = LayoutControl.getCenterY(-1, this._noticeView.getNoticeViewHeight());

        this._noticeView.drawNoticeView(x, y);
    }
});

var SDrinkNoticeView = defineObject(BaseNoticeView, {

    _text: null,

    setViewText: function (keyword) {
        this._text = keyword + '\'s Fatigue was set to 0!';
    },

    drawNoticeViewContent: function (x, y) {
        var textui = this.getTitleTextUI();
        var color = textui.getColor();
        var font = textui.getFont();

        TextRenderer.drawKeywordText(x, y, this._text, -1, color, font);
    },

    getTitlePartsCount: function () {
        return 8;
    }
});
