/**
 * By Repeat.
 * Split Saving v1.1
 * Non-optional extension to Split Saves plugin.
 * Unlike saving, loading uses both scrollbars at the same time. The minimap is in the middle.
 * You can switch between them by pressing left/right or the C key.
 * The minimap shows nothing when in Chapter Save mode.
 * 
 * Function(s) overridden without alias:
 *  * LoadSaveControl.getLoadScreenObject
 *  * The Load command now uses its own distinct screen (UnifiedLoadScreen) instead of directly reusing the Save screens
 */

LoadSaveControl.getLoadScreenObject = function () {
    return UnifiedLoadScreen;
}

var LoadMode = {
    CHAPTER: 0,
    BATTLE: 1
};

var UnifiedLoadScreen = defineObject(LoadSaveScreenEx, {
    _loadMode: LoadMode.CHAPTER,
    _chapterSaveScrollbar: null, // left
    _battleSaveScrollbar: null, // right
    _prevMouseX: null,
    _prevMouseY: null,

    _prepareScreenMemberData: function (screenParam) {
        this._screenParam = screenParam;
        this._isLoadMode = screenParam.isLoad;
        this._loadMode = LoadMode.CHAPTER;
        this._chapterSaveScrollbar = createScrollbarObject(ChapterSaveScrollbar, this);
        this._battleSaveScrollbar = createScrollbarObject(LoadSaveScrollbarEx, this);
    },

    _completeScreenMemberData: function (screenParam) {
        var count = this.getVisibleSaveFileCount();

        this._chapterSaveScrollbar.setScrollFormation(this._getFileCol(), count);
        this._chapterSaveScrollbar.setActive(true);
        this._setScrollData(this.getSaveFileCount(), this._isLoadMode); // <- only show the first (save file count - battle save count) files in chapter save mode
        this._setDefaultSaveFileIndex();

        this._battleSaveScrollbar.setScrollFormation(this._getFileCol(), count);
        this._battleSaveScrollbar.setActive(false);
        this._setBattleScrollData(DefineControl.getMaxSaveFileCount(), this._isLoadMode); // <- use the vanilla check of DefineControl.getMaxSaveFileCount in battle save mode
        this._setDefaultBattleSaveFileIndex();

        this.changeCycleMode(LoadSaveMode.TOP);

        // this._scrollbar.enablePageChange(); // Disabled since left/right have new functionality

        this._saveFileDetailWindow = createWindowObject(SaveFileDetailWindow, this);
        this._saveFileDetailWindow.setSize(Math.floor(this._battleSaveScrollbar.getScrollbarHeight() * 1.2), this._battleSaveScrollbar.getScrollbarHeight());
        this._saveFileDetailWindow.setSaveFileInfo(this.getDummySaveFile());
    },

    _setScrollData: function (count, isLoadMode) {
        var i;
        var manager = root.getLoadSaveManager();

        for (i = 0; i < count; i++) {
            this._chapterSaveScrollbar.objectSet(manager.getSaveFileInfo(i));
        }

        this._chapterSaveScrollbar.objectSetEnd();

        this._chapterSaveScrollbar.setLoadMode(isLoadMode);
    },

    _setBattleScrollData: function (count, isLoadMode) {
        var i;
        var manager = root.getLoadSaveManager();

        for (i = count - BATTLE_SAVE_COUNT; i < count; i++) {
            this._battleSaveScrollbar.objectSet(manager.getSaveFileInfo(i));
        }

        this._battleSaveScrollbar.objectSetEnd();

        this._battleSaveScrollbar.setLoadMode(isLoadMode);
    },

    _moveLoad: function () {
        var input;
        var mode = this.getCycleMode();
        var result = MoveResult.CONTINUE;
        var scrollbar = this._loadMode === LoadMode.BATTLE ? this._battleSaveScrollbar : this._chapterSaveScrollbar;

        if (mode === LoadSaveMode.TOP) {
            input = scrollbar.moveInput();

            if (input === ScrollbarInput.SELECT) {
                this._loadMode === LoadMode.BATTLE ? this._executeBattleLoad() : this._executeLoad();
            }
            else if (input === ScrollbarInput.CANCEL) {
                result = MoveResult.END;
            }
            else if (input === ScrollbarInput.OPTION || this.shouldSwitchLoadModeFromDirection(InputControl.getInputType())) {
                // Switch between loading from chapter and battle saves
                this._switchLoadMode();
                this.playMenuTargetChangeSound();
            }
            else if (this._loadMode === LoadMode.BATTLE) {
                this._checkSaveFile();
            }
        }

        return result;
    },

    shouldSwitchLoadModeFromDirection: function (inputType) {
        return (this._loadMode === LoadMode.CHAPTER && inputType === InputType.RIGHT) ||
            (this._loadMode === LoadMode.BATTLE && inputType === InputType.LEFT);
    },

    drawScreenCycle: function () {
        var width = this._chapterSaveScrollbar.getObjectWidth() + this._saveFileDetailWindow.getWindowWidth() + this._battleSaveScrollbar.getObjectWidth();
        var x = LayoutControl.getCenterX(-1, width);
        var y = LayoutControl.getCenterY(-1, this._battleSaveScrollbar.getScrollbarHeight());
        var rightScrollbarX = x + this._chapterSaveScrollbar.getObjectWidth() + this._saveFileDetailWindow.getWindowWidth();
        var mouseX = root.getMouseX();
        var mouseY = root.getMouseY();

        this._chapterSaveScrollbar.drawScrollbar(x, y);
        this._saveFileDetailWindow.drawWindow(x + this._chapterSaveScrollbar.getObjectWidth(), y);
        this._battleSaveScrollbar.drawScrollbar(rightScrollbarX, y);

        if (mouseX !== this._prevMouseX || mouseY !== this._prevMouseY) {
            this._handleMouseHover(x, rightScrollbarX, y, y);
        }

        this._prevMouseX = mouseX;
        this._prevMouseY = mouseY;
    },

    _handleMouseHover: function (x, x2, y, y2) {
        /**
         * Range objects are the exact w/h of the scrollbars.
         * Hovering in the range of either range object changes which scrollbar is active.
         * Should lead to a relatively seamless mouse operation.
         */
        var range1 = createRangeObject(x, y, this._chapterSaveScrollbar.getObjectWidth(), this._chapterSaveScrollbar.getObjectHeight() * this.getVisibleSaveFileCount());
        var range2 = createRangeObject(x2, y2, this._battleSaveScrollbar.getObjectWidth(), this._battleSaveScrollbar.getObjectHeight() * this.getVisibleSaveFileCount());

        // do not delete
        // debug_drawRange(x, y, this._chapterSaveScrollbar.getObjectWidth(), this._chapterSaveScrollbar.getObjectHeight() * this.getVisibleSaveFileCount());
        // debug_drawRange(x2, y2, this._battleSaveScrollbar.getObjectWidth(), this._battleSaveScrollbar.getObjectHeight() * this.getVisibleSaveFileCount());

        if (this._loadMode === LoadMode.BATTLE && MouseControl.isHovering(range1)) {
            // mousing from battle save -> chapter save
            this._chapterSaveScrollbar.setActive(true);
            this._battleSaveScrollbar.setActive(false);

            this._saveFileDetailWindow.setSaveFileInfo(this.getDummySaveFile());

            this._loadMode = LoadMode.CHAPTER;
        } else if (this._loadMode === LoadMode.CHAPTER && MouseControl.isHovering(range2)) {
            // mousing from chapter save -> battle save
            this._chapterSaveScrollbar.setActive(false);
            this._battleSaveScrollbar.setActive(true);

            this._saveFileDetailWindow.setSaveFileInfo(this._battleSaveScrollbar.getObject());

            this._loadMode = LoadMode.BATTLE;
        }
    },

    getVisibleSaveFileCount: function () {
        return LayoutControl.getObjectVisibleCount(76, 5);
    },

    _checkSaveFile: function () {
        if (this._battleSaveScrollbar.checkAndUpdateIndex()) {
            this._saveFileDetailWindow.setSaveFileInfo(this._battleSaveScrollbar.getObject());
        }
    },

    _executeLoad: function () {
        var object = this._chapterSaveScrollbar.getObject();
        root.getExternalData().env.ChapterSaveActiveIndex = this._chapterSaveScrollbar.getIndex();

        if (object.isCompleteFile() || object.getMapInfo() !== null) {
            SceneManager.setEffectAllRange(true);

            // root.changeScene is called inside and changed to the scene which is recorded at the save file.
            root.getLoadSaveManager().loadFile(this._chapterSaveScrollbar.getIndex());
        }
    },

    _executeBattleLoad: function () {
        var object = this._battleSaveScrollbar.getObject();
        root.getExternalData().env.BattleSaveActiveIndex = this._battleSaveScrollbar.getIndex();

        if (object.isCompleteFile() || object.getMapInfo() !== null) {
            SceneManager.setEffectAllRange(true);

            // root.changeScene is called inside and changed to the scene which is recorded at the save file.
            root.getLoadSaveManager().loadFile(this._battleSaveScrollbar.getIndex() + BATTLE_SAVE_COUNT);
        }
    },

    _switchLoadMode: function () {
        this._loadMode = this._loadMode === LoadMode.BATTLE ? LoadMode.CHAPTER : LoadMode.BATTLE;

        if (this._loadMode === LoadMode.BATTLE) {
            this._chapterSaveScrollbar.setActive(false);
            this._battleSaveScrollbar.setActive(true);

            this._saveFileDetailWindow.setSaveFileInfo(this._battleSaveScrollbar.getObject());
        } else { // chapter save
            this._chapterSaveScrollbar.setActive(true);
            this._battleSaveScrollbar.setActive(false);

            this._saveFileDetailWindow.setSaveFileInfo(this.getDummySaveFile());
        }
    },

    getDummySaveFile: function () {
        return {
            isCompleteFile: function () {
                return false;
            },
            getMapInfo: function () {
                return null;
            }
        }
    },

    _setDefaultSaveFileIndex: function () {
        var index = root.getExternalData().env.ChapterSaveActiveIndex || 0;

        // Point the cursor at the index of the file which is used before.
        if (this._chapterSaveScrollbar.getObjectCount() > index) {
            this._chapterSaveScrollbar.setIndex(index);
        }
    },

    _setDefaultBattleSaveFileIndex: function () {
        var index = root.getExternalData().env.BattleSaveActiveIndex || 0;

        // Point the cursor at the index of the file which is used before.
        if (this._battleSaveScrollbar.getObjectCount() > index) {
            this._battleSaveScrollbar.setIndex(index);
        }
    },

    playMenuTargetChangeSound: function () {
        MediaControl.soundDirect('menutargetchange');
    },

    _getFileCol: function () {
        return 1;
    },

    getScreenTitleName: function () {
        return this._loadMode === LoadMode.CHAPTER ? SaveLoadScreenStrings.TITLE__LOAD_CHAPTER : SaveLoadScreenStrings.TITLE__LOAD_BATTLE;
    }
});
