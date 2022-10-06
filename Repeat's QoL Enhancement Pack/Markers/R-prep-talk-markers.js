/**
 * Prep talk markers (part of the Markers plugin)
 * Version 3.6.1
 * By Repeat. Thanks for the idea bwdyeti :)
 * In the battle prep, when selecting units, units that participate in any talk event have a talk marker next to them.
 * 
 * In R-markers-values, check out showBattlePrepOneWays and decide if you want that to be true or false.
 * 
 * TALK_ICON comes from R-markers-values.js.
 */

(function () {
    var alias1 = UnitSortieListScrollbar.drawScrollContent;
    UnitSortieListScrollbar.drawScrollContent = function (x, y, object, isSelect, index) {
        alias1.call(this, x, y, object, isSelect, index)
        this.drawTalkMarkers(x, y, index);
    }
})();

// How much space you want between the left side of the window and the marker
UnitSortieListScrollbar._getTalkMarkerWidth = function () {
    return 100;
}

UnitSortieListScrollbar._talkMarkerArr = [];
UnitSortieListScrollbar._talkIconHandle = null;

UnitSortieListScrollbar.setDataList = function (list) {
    BaseScrollbar.setDataList.call(this, list);
    this._talkIconHandle = root.createResourceHandle(TALK_ICON.isRuntime, TALK_ICON.id, 0, TALK_ICON.xSrc, TALK_ICON.ySrc);

    for (var i = 0; i < list.getCount(); i++) {
        this._talkMarkerArr[i] = this.unitHasTalkMarker(list.getData(i));
    }
}

UnitSortieListScrollbar.unitHasTalkMarker = function (unit) {
    var talkArr = EventCommonArray.createArray(root.getCurrentSession().getTalkEventList(), EventType.TALK);

    for (var j = 0; j < talkArr.length; j++) {
        var event = talkArr[j];
        talkInfo = event.getTalkEventInfo();
        src = talkInfo.getSrcUnit();
        dest = talkInfo.getDestUnit();

        // unlike warning markers, should still draw if talk partner isn't on the field yet, so no null check

        // skip unit if it's somehow the "active" unit to prevent some possible jank
        if (unit === src && talkInfo.isSrcActive()) {
            continue;
        }
        if (unit !== src && unit !== dest) {
            continue;
        }
        if (!MarkerDisplay.showBattlePrepOneWays && unit !== src && !talkInfo.isMutual()) {
            continue;
        }
        // skip dead units
        if (src && src.getAliveState() !== AliveType.ALIVE) {
            continue;
        }
        if (dest && dest.getAliveState() !== AliveType.ALIVE) {
            continue;
        }

        // set index to true and end the loop if a talk partner has been found
        if (event.isEvent() && event.getExecutedMark() === EventExecutedType.FREE) {
            return true;
        }
    }
}

UnitSortieListScrollbar.drawTalkMarkers = function (x, y, index) {
    if (this._talkMarkerArr[index]) {
        var TALK_ICON_HANDLE = this._talkIconHandle;
        var graphicsRenderParam = StructureBuilder.buildGraphicsRenderParam();
        graphicsRenderParam.alpha = 255;
        GraphicsRenderer.drawImageParam(x + this._getTalkMarkerWidth(), y, TALK_ICON_HANDLE, GraphicsType.ICON, graphicsRenderParam);
    }
}
