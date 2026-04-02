/**
 * By Repeat.
 * Split Saving v2.1
 * Non-optional extension to Split Saves plugin.
 * Unlike saving, loading uses both scrollbars at the same time. The minimap is in the middle on the largest res, or pops out on smaller resolutions.
 * You can switch between them by pressing left/right or the OPTION key.
 * The minimap shows nothing when in Chapter Save mode.
 * 
 * 
 * Function(s) overridden without alias:
 *  * LoadSaveControl.getLoadScreenObject
 *  * The Load command now uses its own distinct screen (UnifiedLoadScreen) instead of directly reusing the Save screens
 */

var SaveLoadScreenBreakpoints = {
    LARGE: 1088,
    MEDIUM: 832,
    SMALL: 800,
    XSMALL: 768
};

LoadSaveControl.getLoadScreenObject = function () {
    var screenWidth = root.getGameAreaWidth();

    return screenWidth > SaveLoadScreenBreakpoints.LARGE ? UnifiedLoadScreen : SmallLoadScreen;
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
    _saveFileDetailWindow: null,

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
         * Leads to a relatively seamless mouse operation.
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


/**
 * Unified load screen for smaller resolutions.
 * 
 * Screen width is retrievable with root.getGameAreaWidth()
 * Screen height isn't significant for this plugin
 * 
 * Breakpoints of note:
 * 1280: index 3, max vanilla screen size
 * 1088: 34 tile map, smallest that fits the whole load window
 * 1056: 33 tile map
 * 1024: index 2
 * 832: 26 tile map, smallest that fits the 2-column chapter save screen
 * 800: index 1
 * 768: 24 tile map, smallest that fits the battle save screen
 * 640: index 0, min vanilla screen size
 * 416: unrealistic 13 tile map, smallest that fits the chapter save screen if I changed it to 1 col. Don't need to worry about that
 * 
 * Game plan:
 * Chapter save: below 832px, change getFileCol to return 1 column
 * Battle save: below 768px, don't show the preview image, just the column of save files
 * Load screen: below 1088px, no preview img.
 *  * as low as 640px it can still fit with the 2 columns and no img since the battle save column is narrower. Simplest solution.
 *  * not having the img sucks though, so I implemented a popout when you move your cursor to BSS. Slave to the art
 */

var SmallLoadScreen = defineObject(UnifiedLoadScreen, {
    _loadMode: LoadMode.CHAPTER,
    _chapterSaveScrollbar: null, // left
    _battleSaveScrollbar: null, // right
    _prevMouseX: null,
    _prevMouseY: null,
    _mapPreviewX: null, // saveFileDetailWindow slides in and out from the left side of the screen - this tracks its position

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

        this._saveFileDetailWindow = createWindowObject(SaveFileDetailWindow, this);
        this._saveFileDetailWindow.setSize(Math.floor(this._battleSaveScrollbar.getScrollbarHeight() * 1.2), this._battleSaveScrollbar.getScrollbarHeight());
        this._saveFileDetailWindow.setSaveFileInfo(this.getDummySaveFile());

        this._mapPreviewX = 0 - this._saveFileDetailWindow.getWindowWidth();
    },

    setDetailWindowSlide: function () {
        var curX = this._mapPreviewX;
        var finalPos = 8; // x position of where the window ends up

        if (curX < finalPos) {
            var width = this._saveFileDetailWindow.getWindowWidth();
            var slideDuration = 8; // frames it takes to slide in

            curX += width / slideDuration;
        } else {
            curX = finalPos;
        }

        this._mapPreviewX = curX;
    },

    setDetailWindowSlideReverse: function () {
        var curX = this._mapPreviewX;
        var finalPos = 0 - this._saveFileDetailWindow.getWindowWidth(); // x position of where the window ends up

        if (curX > finalPos) {
            var width = this._saveFileDetailWindow.getWindowWidth();
            var slideDuration = 8; // frames it takes to slide in

            curX -= width / slideDuration;
        } else {
            curX = finalPos;
        }

        this._mapPreviewX = curX;
    },

    drawScreenCycle: function () {
        var screenWidth = root.getGameAreaWidth();
        var isXSmall = screenWidth < SaveLoadScreenBreakpoints.SMALL;

        var x = isXSmall ? 16 : 32;
        var rightBuf = isXSmall ? 4 : 8;
        var y = LayoutControl.getCenterY(-1, this._battleSaveScrollbar.getScrollbarHeight());
        var rightScrollbarX = screenWidth - this._battleSaveScrollbar.getObjectWidth() - rightBuf;
        var mouseX = root.getMouseX();
        var mouseY = root.getMouseY();

        // adjust the position for the map preview img, sliding in or out depending on loadmode
        if (this._loadMode === LoadMode.BATTLE) {
            this.setDetailWindowSlide();
        } else {
            this.setDetailWindowSlideReverse();
        }

        this._chapterSaveScrollbar.drawScrollbar(x, y);
        this._saveFileDetailWindow.drawWindow(this._mapPreviewX, y);
        this._battleSaveScrollbar.drawScrollbar(rightScrollbarX, y);

        if (mouseX !== this._prevMouseX || mouseY !== this._prevMouseY) {
            this._handleMouseHover(x, rightScrollbarX, y, y);
        }

        this._prevMouseX = mouseX;
        this._prevMouseY = mouseY;
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

            // reset the slidein position
            this._saveFileDetailWindow.setSaveFileInfo(this.getDummySaveFile());
        }
    },

    drawScreenTopText: function (textui) {
        if (textui === null) {
            return;
        }

        var pic = textui.getUIImage();

        if (!pic) {
            return;
        }

        if (this._loadMode === LoadMode.CHAPTER || SplitSaveTopConfig.drawAsDefault) {
            drawScreenTopTextEx(8, this.getScreenTitleName(), textui, false);
        } else {
            var pic = textui.getUIImage();
            var newX = root.getGameAreaWidth() - pic.getWidth();

            drawScreenTopTextEx(newX, this.getScreenTitleName(), textui, SplitSaveTopConfig.reverseImage);
        }
    },

    _checkSaveFile: function () {
        if (this._battleSaveScrollbar.checkAndUpdateIndex()) {
            this._saveFileDetailWindow.setSaveFileInfo(this._battleSaveScrollbar.getObject());
        }
    }
});

// Reversible title ui with configurable x
function drawScreenTopTextEx(xBase, titleName, textui, isReverse) {
    var range;
    var x = xBase;
    var y = 0;
    var color = textui.getColor();
    var font = textui.getFont();
    var pic = textui.getUIImage();
    var buf = 105;
    var align = TextFormat.LEFT;

    if (pic !== null) {
        pic.draw(x, y);
        pic.setReverse(isReverse);

        if (isReverse) {
            buf *= -1;
            align = TextFormat.RIGHT;
        }

        range = createRangeObject(x + buf, y, UIFormat.SCREENFRAME_WIDTH, 45);
        TextRenderer.drawRangeText(range, align, titleName, -1, color, font);
    }

}