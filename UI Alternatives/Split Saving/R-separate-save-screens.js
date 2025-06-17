/**
 * By Repeat.
 * Split Saving v1.0
 * Changes saves so saving during battle prep/base/EOC ("Chapter Saves") is a separate list of saves from mid-map saves ("Battle Saves").
 * LoadSaveScreen (no minimap) is repurposed for Chapter Saves exclusively.
 * LoadSaveScreenEx (w/ minimap) is repurposed for Battle Saves exclusively.
 * Loading is a mix of both using new class UnifiedLoadScreen.
 * 
 * Notes:
 *  * In 0_split-save-config.js, set BATTLE_SAVE_COUNT equal to the number of save slots to allot for battles only. The rest are used for Chapter Saves
 *  * DataConfig.isSaveScreenExtended is no longer used. "Display thumbnails on Load/Save screen" in Config now does nothing
 *  * Warning!! Various uses of getScreenTitleName are OVERRIDDEN, so the names you put for "Save" and "Load" in Resource Location in-engine are now ignored.
 *      If you want to change those strings, refer to SaveLoadScreenStrings in 0_split-save-config.js
 * 
 * Function(s) overridden without alias:
 *  * LoadSaveControl.getSaveScreenObject
 *  * LoadSaveScreen._completeScreenMemberData
 *  * LoadSaveScreen._getScrollbarObject
 *  * LoadSaveScreen._getFileCol
 *  * LoadSaveScreen.getScreenTitleName
 *  * LoadSaveScrollbarEx.getObjectWidth
 *  * LoadSaveScrollbarEx._drawDifficulty
 *  * LoadSaveScrollbarEx._drawEmptyFile
 *  * LoadSaveScreenEx.drawScreenCycle
 *  * LoadSaveScreenEx.getScreenTitleName
 *  * LoadSaveScreenEx._executeSave
 *  * LoadSaveScreenEx._completeScreenMemberData
 *  * LoadSaveScreenEx._setScrollData
 *  * LoadSaveScreenEx._setDefaultSaveFileIndex
 *  * LoadSaveScreen (for Chapter Saves) uses a new scrollbar (ChapterSaveScrollbar) instead of the default LoadSaveScrollbar
 */

(function () {
    var alias1 = LoadSaveScreen._getCustomObject;
    LoadSaveScreen._getCustomObject = function () {
        var obj = alias1.call(this);

        this._setLeaderSettings(obj);

        return obj;
    }
})();

var ChapterSaveScrollbar = defineObject(LoadSaveScrollbar, {
    _drawMain: function (x, y, object, index) {
        this._drawChapterNumber(x, y, object);
        this._drawChapterName(x, y, object);
        this._drawPlayTime(x, y, object);
        this._drawLeader(x, y, object); // <- replaces _drawTurnNo
        this._drawDifficulty(x, y, object);
    },

    _drawLeader: function (xBase, yBase, object) {
        var length = this._getTextLength();
        var textui = this._getWindowTextUI();
        var font = textui.getFont();
        var color = textui.getColor();
        var x = xBase + 80;
        var y = yBase + 25;
        var obj = object.custom;

        if (typeof obj.leaderLv !== 'undefined') {
            TextRenderer.drawKeywordText(x, y, StringTable.Status_Level, -1, color, font);
            NumberRenderer.drawNumber(x + 32, y, obj.leaderLv);
        }

        if (typeof obj.leaderName !== 'undefined') {
            TextRenderer.drawKeywordText(x + 48, y, obj.leaderName, length, color, font);
        }
    },

    getObjectWidth: function () {
        return 400;
    },

    _drawDifficulty: function (xBase, yBase, object) {
        var textui = this._getWindowTextUI();
        var font = textui.getFont();
        var difficulty = object.getDifficulty();
        var difficultyColor = ColorValue.KEYWORD;
        var x = xBase + 220;
        var y = yBase + 23;

        if (difficulty.custom.nameColor) {
            difficultyColor = difficulty.custom.nameColor;
        }

        if (this.getCol() === 1 && !DataConfig.isHighResolution()) {
            x -= 34;
            y -= 2;
        }

        GraphicsRenderer.drawImage(x, y, difficulty.getIconResourceHandle(), GraphicsType.ICON);
        TextRenderer.drawKeywordText(x + GraphicsFormat.ICON_WIDTH, y, difficulty.getName(), -1, difficultyColor, font);
    },

    _drawEmptyFile: function (xBase, yBase, index) {
        var length = this._getTextLength();
        var textui = this._getWindowTextUI();
        var color = textui.getColor();
        var font = textui.getFont();
        var x = xBase;
        var y = yBase;

        if (this._getTitleTextUI().getUIImage() === null) {
            TextRenderer.drawKeywordText(x, y, StringTable.LoadSave_SaveFileMark + (index + 1), length, color, font);

            x += 90;
            TextRenderer.drawKeywordText(x, y, StringTable.LoadSave_NoData, -1, ColorValue.KEYWORD, font);
        }
        else {
            x += 144; // <- from 70
            y += 10;
            TextRenderer.drawKeywordText(x, y, StringTable.LoadSave_NoData, -1, ColorValue.KEYWORD, font);
        }
    }
});

// Shrink the battle save scrollbar's width slightly so a) the load screen fits better and b) the chapter saves stand out as "more significant"
LoadSaveScrollbarEx.getObjectWidth = function () {
    return 220;
}
LoadSaveScrollbarEx._drawDifficulty = function (xBase, yBase, object) {
    var difficulty = object.getDifficulty();
    var x = xBase + 170;
    var y = yBase + 24;

    if (this.getCol() === 1 && !DataConfig.isHighResolution()) {
        x -= 34;
        y -= 2;
    }

    GraphicsRenderer.drawImage(x, y, difficulty.getIconResourceHandle(), GraphicsType.ICON);
}
LoadSaveScrollbarEx._drawEmptyFile = function (xBase, yBase, index) {
    var length = this._getTextLength();
    var textui = this._getWindowTextUI();
    var color = textui.getColor();
    var font = textui.getFont();
    var x = xBase;
    var y = yBase;

    if (this._getTitleTextUI().getUIImage() === null) {
        TextRenderer.drawKeywordText(x, y, StringTable.LoadSave_SaveFileMark + (index + 1), length, color, font);

        x += 90;
        TextRenderer.drawKeywordText(x, y, StringTable.LoadSave_NoData, -1, ColorValue.KEYWORD, font);
    }
    else {
        x += 56; // <- from 70
        y += 10;
        TextRenderer.drawKeywordText(x, y, StringTable.LoadSave_NoData, -1, ColorValue.KEYWORD, font);
    }
}

// smaller version of logic from LoadSaveScreenEx (don't need the handle, just the leader name and lv)
LoadSaveScreen._setLeaderSettings = function (obj) {
    var unit = this._getLeaderUnit();

    if (unit === null) {
        obj.leaderName = 'undefined';
        return;
    }

    obj.leaderName = unit.getName();
    obj.leaderLv = unit.getLv();
}

// duplicated logic from LoadSaveScreenEx
LoadSaveScreen._getLeaderUnit = function () {
    var i, count;
    var list = PlayerList.getMainList();
    var unit = null;
    var firstUnit = null;

    count = list.getCount();
    if (count === 0) {
        return null;
    }

    for (i = 0; i < count; i++) {
        unit = list.getData(i);
        if (unit.getAliveState() === AliveType.ERASE) {
            continue;
        }

        if (firstUnit === null) {
            firstUnit = unit;
        }

        if (unit.getImportance() === ImportanceType.LEADER) {
            break;
        }
    }

    if (i === count) {
        unit = firstUnit;
    }

    return unit;
}

// THESE ARE HARD OVERRIDES
LoadSaveScreen.getScreenTitleName = function () {
    return SaveLoadScreenStrings.TITLE__SAVE_CHAPTER;
}
LoadSaveScreenEx.getScreenTitleName = function () {
    return SaveLoadScreenStrings.TITLE__SAVE_BATTLE;
}

LoadSaveScreen._executeSave = function () {
    var index = this._scrollbar.getIndex();

    root.getLoadSaveManager().saveFile(index, this._screenParam.scene, this._screenParam.mapId, this._getCustomObject());

    root.getExternalData().env.ChapterSaveActiveIndex = this._scrollbar.getIndex();
}

LoadSaveScreenEx._executeSave = function () {
    var index = this._scrollbar.getIndex() + BATTLE_SAVE_COUNT;

    root.getLoadSaveManager().saveFile(index, this._screenParam.scene, this._screenParam.mapId, this._getCustomObject());

    root.getExternalData().env.BattleSaveActiveIndex = this._scrollbar.getIndex();

    this._saveFileDetailWindow.setSaveFileInfo(this._scrollbar.getObject());
}

LoadSaveScreen._getScrollbarObject = function () {
    return ChapterSaveScrollbar;
}

LoadSaveControl.getSaveScreenObject = function () {
    return this.isBattleSave() ? DataSaveScreenEx : DataSaveScreen;
}

LoadSaveControl.isBattleSave = function () {
    return root.getCurrentScene() === SceneType.FREE;
}

// Chapter saves: show (total save count) - (battle save count), e.g. BATTLE_SAVE_COUNT = 25 with 50 slots means Chapter Saves uses slots 0 through 24 and Battle Saves takes 25-49
// Phrased another way, the last X save slots are set aside for Battle Saves only. X = BATTLE_SAVE_COUNT.
// If you wanted to remake FE11 or 12, you would have DefineControl.getMaxSaveFileCount return 5 and set BATTLE_SAVE_COUNT = 2, so your first 3 saves are Chapter Saves and your last 2 are Battle Saves.
LoadSaveScreen._completeScreenMemberData = function (screenParam) {
    var count = 6; // LayoutControl.getObjectVisibleCount(76, 5);

    this._scrollbar.setScrollFormation(this._getFileCol(), count);
    this._scrollbar.setActive(true);
    this._setScrollData(this.getSaveFileCount(), this._isLoadMode);
    this._setDefaultSaveFileIndex();

    this._questionWindow.setQuestionMessage(StringTable.LoadSave_SaveQuestion);

    this.changeCycleMode(LoadSaveMode.TOP);
}

LoadSaveScreenEx._completeScreenMemberData = function (screenParam) {
    var count = 6; // LayoutControl.getObjectVisibleCount(76, 5);

    this._scrollbar.setScrollFormation(this._getFileCol(), count);
    this._scrollbar.setActive(true);
    this._setScrollData(DefineControl.getMaxSaveFileCount(), this._isLoadMode); // <- enforce vanilla check of DefineControl.getMaxSaveFileCount in battle save mode
    this._setDefaultSaveFileIndex();

    this._questionWindow.setQuestionMessage(StringTable.LoadSave_SaveQuestion);

    this.changeCycleMode(LoadSaveMode.TOP);

    this._scrollbar.enablePageChange();

    this._saveFileDetailWindow = createWindowObject(SaveFileDetailWindow, this);
    this._saveFileDetailWindow.setSize(Math.floor(this._scrollbar.getScrollbarHeight() * 1.2), this._scrollbar.getScrollbarHeight());

    this._checkSaveFile();
}

// used for Chapter Saves only - Battle Saves looks at the full list since it has to start partway through and read til the end
LoadSaveScreen.getSaveFileCount = function () {
    return DefineControl.getMaxSaveFileCount() - BATTLE_SAVE_COUNT;
}

LoadSaveScreenEx._setScrollData = function (count, isLoadMode) {
    var i;
    var manager = root.getLoadSaveManager();

    for (i = count - BATTLE_SAVE_COUNT; i < count; i++) {
        this._scrollbar.objectSet(manager.getSaveFileInfo(i));
    }

    this._scrollbar.objectSetEnd();

    this._scrollbar.setLoadMode(isLoadMode);
}

// Flips the order of scrollbar->detailwindow to detailwindow->scrollbar for consistency with the Load screen
LoadSaveScreenEx.drawScreenCycle = function () {
    var width = this._scrollbar.getObjectWidth() + this._saveFileDetailWindow.getWindowWidth();
    var x = LayoutControl.getCenterX(-1, width);
    var y = LayoutControl.getCenterY(-1, this._scrollbar.getScrollbarHeight());

    this._saveFileDetailWindow.drawWindow(x, y);
    this._scrollbar.drawScrollbar(x + this._saveFileDetailWindow.getWindowWidth(), y);

    if (this.getCycleMode() === LoadSaveMode.SAVECHECK) {
        x = LayoutControl.getCenterX(-1, this._questionWindow.getWindowWidth());
        y = LayoutControl.getCenterY(-1, this._questionWindow.getWindowHeight());
        this._questionWindow.drawWindow(x, y);
    }
}

// This function is used to remember your last save slot and start the cursor there when you reopen the Save screen, using root.getExternalData().getActiveSaveFileIndex().
// Sadly, you only get 1, and you can't really control when it gets saved. But the cursor memory actually works just fine with a custom env parameter too, so I ignore getActiveSaveFileIndex and just duplicate the behavior here.
// The respective ActiveIndices are set whenever you make a selection (save or load).
LoadSaveScreen._setDefaultSaveFileIndex = function () {
    var index = root.getExternalData().env.ChapterSaveActiveIndex || 0;

    // Point the cursor at the index of the file which is used before.
    if (this._scrollbar.getObjectCount() > index) {
        this._scrollbar.setIndex(index);
    }
}
// Ditto for battle saves.
LoadSaveScreenEx._setDefaultSaveFileIndex = function () {
    var index = root.getExternalData().env.BattleSaveActiveIndex || 0;

    // Point the cursor at the index of the file which is used before.
    if (this._scrollbar.getObjectCount() > index) {
        this._scrollbar.setIndex(index);
    }
}