/**
 * By Repeat. Thanks for the idea bwdyeti :)
 * In the battle prep, when selecting units, units that participate in any talk event have a talk marker next to them.
 * 
 * Check out SHOW_ONE_WAY_CONVOS and decide if you want that to be true or false.
 * 
 * TALK_ICON comes from warn-markers-values.js.
 */

(function () {

    // If true, will show conversations that the unit is a participant of even if they cannot initiate.
    SHOW_ONE_WAY_CONVOS = true;

    var alias1 = UnitSortieListScrollbar.drawScrollContent;
    UnitSortieListScrollbar.drawScrollContent = function (x, y, object, isSelect, index) {
        alias1.call(this, x, y, object, isSelect, index)
        this.drawTalkMarkers(x, y, object);
    };

    // How much space you want between the left side of the window and the marker.
    UnitSortieListScrollbar._getTalkMarkerWidth = function () {
        return 100;
    };

    UnitSortieListScrollbar.drawTalkMarkers = function (x, y, unit) {
        var talkArr = EventCommonArray.createArray(root.getCurrentSession().getTalkEventList(), EventType.TALK);
        // for all talk events
        for (var j = 0; j < talkArr.length; j++) {
            var event = talkArr[j];
            talkInfo = event.getTalkEventInfo();
            src = talkInfo.getSrcUnit();
            dest = talkInfo.getDestUnit();

            // unlike warning markers, should still draw if talk partner isn't on the field yet, so no null check.

            if (unit !== src && unit !== dest) {
                continue;
            } else if (!SHOW_ONE_WAY_CONVOS && unit !== src && !talkInfo.isMutual()) {
                continue;
            }

            // draw talk warning
            if (event.isEvent() && event.getExecutedMark() === EventExecutedType.FREE) {
                var TALK_ICON_HANDLE = root.createResourceHandle(TALK_ICON.isRuntime, TALK_ICON.id, 0, TALK_ICON.xSrc, TALK_ICON.ySrc);
                var graphicsRenderParam = StructureBuilder.buildGraphicsRenderParam();
                graphicsRenderParam.alpha = 255;
                GraphicsRenderer.drawImageParam(x + this._getTalkMarkerWidth(), y, TALK_ICON_HANDLE, GraphicsType.ICON, graphicsRenderParam);
            }
        }
    };


})();