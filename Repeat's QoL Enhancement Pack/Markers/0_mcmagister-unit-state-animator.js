/**
Copyright (c) 2020 McMagister
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/* 
Animates any kind of unit state, display a animated icon above the unit.
The default animation is a bounce.

For example, this could be used to show talk events, enemies with high critical
hit rate or an effective weapon, or units with a support rank, similar to the
later Fire Emblems.

IMPORTANT: Load this before all your other scripts that use this Animation Engine!

Changelog:
2020-04-21: Initial release
2020-04-24: Add support for 2 more types of animations for a total of 3: bounce, blink and fixed (no animation)
*/
(function () {

    var alias1 = UnitCounter.initialize;
    UnitCounter.initialize = function () {
        alias1.call(this);

        this._counterIcon = createObject(CycleCounter);
        this._counterIcon.setCounterInfo(3); // increase this to slow the animation
        this._counterIcon.disableGameAcceleration();

        this._iconAnimationIndex = 0;
    }

    var alias2 = UnitCounter.moveUnitCounter;
    UnitCounter.moveUnitCounter = function () {
        var result = alias2.call(this);

        result = this._counterIcon.moveCycleCounter();
        if (result !== MoveResult.CONTINUE) {
            if (++this._iconAnimationIndex === 16) { // by default, 16 frames of animation
                this._iconAnimationIndex = 0;
            }
        }

        return result;
    }

    UnitCounter.getIconAnimationIndex = function () {
        var a = [0, 0, 1, 2, 4, 6, 7, 7, 7, 7, 6, 4, 2, 1, 0, 0]; // non-linear easing, more pleasing to the eye
        return a[this._iconAnimationIndex];
    }

    var alias3 = MapLayer.drawUnitLayer;
    MapLayer.drawUnitLayer = function () {
        alias3.call(this);
        this._drawIcons();
    }

    MapLayer._drawIcons = function () {
        if (UnitStateAnimator._iconArray == null) return;

        var session = root.getCurrentSession();
        if (session == null) return;

        var dy = this._counter.getIconAnimationIndex();

        for (var i = 0; i < UnitStateAnimator._iconArray.length; i++) {
            var icon = UnitStateAnimator._iconArray[i];

            var hide = false;
            if (this._counter._iconAnimationIndex == 15) { // 15 is one less than the number of frames in the icon bounce animation
                if (++icon.cycle == icon.handle.length) { // changing the icon.cycle means changing the currently displayed icon
                    icon.cycle = 0;
                    if (icon.handle.length > 1) hide = true; // hide icon for one frame when switching icons
                }
            }

            if (hide) continue;

            if (icon.type == null || icon.type == UnitStateAnimType.BOUNCE) {
                GraphicsRenderer.drawImage(icon.x - session.getScrollPixelX(), icon.y - session.getScrollPixelY() - dy, icon.handle[icon.cycle], GraphicsType.ICON);
            } else if (icon.type == UnitStateAnimType.BLINK) {
                if (dy >= 4) {
                    GraphicsRenderer.drawImage(icon.x - session.getScrollPixelX(), icon.y - session.getScrollPixelY(), icon.handle[icon.cycle], GraphicsType.ICON);
                }
            } else if (icon.type == UnitStateAnimType.FIXED) {
                GraphicsRenderer.drawImage(icon.x - session.getScrollPixelX(), icon.y - session.getScrollPixelY(), icon.handle[icon.cycle], GraphicsType.ICON);
            }
        }
    }

    // Data structure for the iconArray elements
    StructureBuilder.buildIconRenderInfo = function (x, y, handle, type) {
        var info = {
            x: 0,
            y: 0,
            handle: [],
            cycle: 0,  // cycle is used when there is more than one handle, loops through all the handles
            type: UnitStateAnimType.BOUNCE
        };
        info.x = x;
        info.y = y;
        info.handle.push(handle);
        if (type != null) info.type = type;
        return info;
    }

})();

var UnitStateAnimType = {
    BOUNCE: 0,  // bounce up and down, the default
    BLINK: 1,   // blink, like SRPG Studio's states
    FIXED: 2    // don't move at all
};

// Object that keeps track of the icons that need to be animated
var UnitStateAnimator = {

    // Define icons in your plugin, using the below template

    // WARNING_ICON = {
    //     isRuntime: true,
    //     id: 0,				
    //     xSrc: 0,			
    //     ySrc: 9			
    // },

    // TALK_ICON = {
    //     isRuntime: true,
    //     id: 0,				
    //     xSrc: 1,			
    //     ySrc: 9				
    // },

    // Stores the list of icons to be drawn, updated by updateIcons()
    _iconArray: [],

    // Stores the current icon to be processed in _updateIconByUnit()
    _icon: null,

    // call this function any time the unit custom parameters related to the icons change
    updateIcons: function () {
        if (root.getCurrentScene() === SceneType.REST) return;
        this._iconArray = [];

        var enemies = EnemyList.getAliveList();
        var players = PlayerList.getAliveList();
        var allies = AllyList.getAliveList();

        for (var e = 0; e < enemies.getCount(); e++) {
            this._updateIconByUnit(enemies.getData(e));
            if (this._icon != null) this._iconArray.push(this._icon);
        }

        for (var p = 0; p < players.getCount(); p++) {
            this._updateIconByUnit(players.getData(p));
            if (this._icon != null) this._iconArray.push(this._icon);
        }

        for (var a = 0; a < allies.getCount(); a++) {
            this._updateIconByUnit(allies.getData(a));
            if (this._icon != null) this._iconArray.push(this._icon);
        }
    },

    // call this function to add icon to an arbitrary position (doesn't have to be a unit)
    addIconXY: function (x, y, handle, type) {
        if (!handle.isNullHandle()) {
            if (this._icon == null) {
                this._icon = StructureBuilder.buildIconRenderInfo(x, y, handle, type);
            } else {
                this._icon.handle.push(handle);
            }
        }
    },

    _addIcon: function (unit, handle, type, xOffset, yOffset) {
        if (xOffset === undefined) xOffset = 0;
        if (yOffset === undefined) yOffset = 0;
        var x = unit.getMapX() * GraphicsFormat.MAPCHIP_WIDTH + GraphicsFormat.MAPCHIP_WIDTH / 8 + xOffset;
        var y = unit.getMapY() * GraphicsFormat.MAPCHIP_HEIGHT - GraphicsFormat.MAPCHIP_HEIGHT / 2 + yOffset;

        this.addIconXY(x, y, handle, type);
    },

    _updateIconByUnit: function (unit) {
        this._icon = null;

        // Extend this function by using code similar to the below

        // if (unit.custom.talkWarning) {
        //     var TALK_ICON_HANDLE = root.createResourceHandle(TALK_ICON.isRuntime, TALK_ICON.id, 0, TALK_ICON.xSrc, TALK_ICON.ySrc);
        //     this._addIcon(unit, TALK_ICON_HANDLE);
        // }

        // if (unit.custom.mark) {
        //     var TALK_ICON_HANDLE = root.createResourceHandle(TALK_ICON.isRuntime, TALK_ICON.id, 0, TALK_ICON.xSrc, TALK_ICON.ySrc);
        //     this._addIcon(unit, TALK_ICON_HANDLE);
        // } 

        // if (unit.custom.critWarning) {
        //     var WARNING_ICON_HANDLE = root.createResourceHandle(WARNING_ICON.isRuntime, WARNING_ICON.id, 0, WARNING_ICON.xSrc, WARNING_ICON.ySrc);
        //     this._addIcon(unit, WARNING_ICON_HANDLE);
        // }
    }
}
