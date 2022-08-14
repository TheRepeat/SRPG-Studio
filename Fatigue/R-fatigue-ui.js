/**
 * By Repeat.
 * UI-side changes for the fatigue system.
 *
 * Functions overridden without alias: 
 *  * UnitSortieListScrollbar.playSelectSound
 *  * SortieSetting._setInitialUnitPos
 */

(function () {
    var alias1 = UnitSortieListScrollbar._getSortieColorAndAlpha;
    UnitSortieListScrollbar._getSortieColorAndAlpha = function (object) {
        if (FatigueControl.isFatigued(object)) {
            return {
                color: FatigueConfig.FatiguedUnitNameColor,
                alpha: FatigueConfig.FatiguedUnitNameAlpha
            }
        }

        return alias1.call(this, object);
    }

    UnitStatusScrollbar._unit = null;
    // this lets other functions in UnitStatusScrollbar see the current unit object (useful for alias3 and alias4)
    var alias2 = UnitStatusScrollbar._createStatusEntry;
    UnitStatusScrollbar._createStatusEntry = function (unit, index, weapon) {
        this._unit = unit;

        return alias2.call(this, unit, index, weapon);
    }

    var alias3 = UnitStatusScrollbar.drawScrollContent;
    UnitStatusScrollbar.drawScrollContent = function (x, y, object, isSelect, index) {
        var statusEntry = object;
        var n = statusEntry.param;
        var text = statusEntry.type;
        var textui = this.getParentTextUI();
        var font = textui.getFont();
        var length = this._getTextLength();

        // if the unit is fatigued, the number is drawn red
        if (text === FatigueConfig.StatName && this._unit && FatigueControl.isFatigued(this._unit)) {
            TextRenderer.drawKeywordText(x, y, text, length, ColorValue.KEYWORD, font);
            x += this._getNumberSpace();

            NumberRenderer.drawNumberColor(x, y, n, 3, 255)
        } else {
            alias3.call(this, x, y, object, isSelect, index);
        }
    }

    // hide fatigue stat on non-players
    var alias4 = UnitStatusScrollbar._isParameterDisplayable
    UnitStatusScrollbar._isParameterDisplayable = function (index) {
        if (ParamGroup.getParameterName(index) === FatigueConfig.StatName && this._unit.getUnitType() !== UnitType.PLAYER) {
            return false;
        }

        return alias4.call(this, index);
    }

    var alias5 = SortieSetting.setSortieMark;
    SortieSetting.setSortieMark = function (index) {
        var list = PlayerList.getAliveList();
        var unit = list.getData(index);

        if (!FatigueControl.isFatigued(unit)) {
            return alias5.call(this, index);
        }

        if (!this.isForceSortie(unit)) {
            if (FatigueControl.isFatigued(unit)) {
                this.nonsortieUnit(unit);
            }
        }
        else {
            return false;
        }

        return true;
    }
})();

// Unless force-deployed, no units are sortied at first
// (most of this function is unchanged)
SortieSetting._setInitialUnitPos = function () {
    var i, unit;
    var list = PlayerList.getAliveList();
    var count = list.getCount();
    var maxCount = this._sortiePosArray.length;
    var sortieCount = 0;

    // If the save is executed even once on the battle setup scene on the current map, func returns false. 
    if (!root.getMetaSession().isFirstSetup()) {
        // Initialize the unit of _sortiePosArray as a reference of the current unit position.
        this._arrangeUnitPos();
        return;
    }

    // If the battle setup scene is displayed for the first time, the subsequent process sets the sortie state automatically.

    this._clearSortieList();

    // The unit of force sortie (the specified position) is set to be a sortie state in order.
    for (i = 0; i < count && sortieCount < maxCount; i++) {
        unit = list.getData(i);
        if (this.isForceSortie(unit)) {
            if (this._sortieFixedUnit(unit)) {
                sortieCount++;
            }
        }
    }

    // The unit of force sortie (the unspecified position) is set to be a sortie state in order.
    for (i = 0; i < count && sortieCount < maxCount; i++) {
        unit = list.getData(i);
        if (this.isForceSortie(unit) && unit.getSortieState() !== SortieType.SORTIE) {
            if (this._sortieForceUnit(unit)) {
                sortieCount++;
            }
        }
    }

    // The only change: removed the loop for un-forced units here
}

// use the "invalid" sound when trying to select a fatigued unit
UnitSortieListScrollbar.playSelectSound = function () {
    var object = this.getObject();
    var isSelect = true;

    if (this._isForceSortie(object)) {
        isSelect = false;
    } else if (!this._isSortie(object)) {
        isSelect = false;
    } else if (FatigueControl.isFatigued(object)) {
        isSelect = false;
    } else if (SceneManager.getActiveScene().getSortieSetting().getSortieCount() === SceneManager.getActiveScene().getSortieSetting().getDefaultSortieMaxCount()) {
        if (object.getSortieState() === SortieType.SORTIE) {
            isSelect = true;
        } else {
            isSelect = false;
        }
    }

    if (isSelect) {
        MediaControl.soundDirect('commandselect');
    } else {
        MediaControl.soundDirect('operationblock');
    }
}
