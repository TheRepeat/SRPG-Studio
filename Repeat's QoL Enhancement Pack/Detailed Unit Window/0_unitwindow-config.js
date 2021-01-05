/*  By Repeat.
    Part of the Detailed Unit Window plugin. 
    Make sure this plugin loads before the rest of the detailed unit window plugins. It has the 0 in the name 
    to make sure it gets loaded first.
*/

(function () {
    CRIT_AVOID_STAT = "CAv";            // Edit this to change string for Critical Avoid
    ICONS_ONLY = false;                 // if true, show icons of all items in inventory. If false, show equipped weapon and name.
    STAT_COLOR = ColorValue.INFO;       // color of the stat names
    MEDIUM_SHOWS_STATS = true;          // true: atk/as, false: lv/exp. You can remove unitwindow-med.js if you prefer the SRPG Studio default
    CAV_IS_UNIQUE = false;              // true: invalid-crit skills show MAX_CAV_TEXT instead of calculated CAv value.
    MAX_CAV_TEXT = StringTable.SignWord_WaveDash;   // units that invalidate critical hits have special text next to CAv (just a hyphen/wavedash by default).

    // FOR THE MEDIUM SIZE
    ItemRenderer.drawItemSmall = function (x, y, item, color, font, isDrawLimit) {
        if (typeof item.custom.smallname !== 'undefined') {
            this.drawItemAlphaSmall(x, y, item, color, font, isDrawLimit, 255);
        }
        else {
            this.drawItemAlpha(x, y, item, color, font, isDrawLimit, 255);
        }
    };

    ItemRenderer.drawItemAlphaSmall = function (x, y, item, color, font, isDrawLimit, alpha) {
        var interval = this._getItemNumberInterval();
        var iconWidth = GraphicsFormat.ICON_WIDTH + 5;
        var length = this._getTextLength();
        var handle = item.getIconResourceHandle();
        var graphicsRenderParam = StructureBuilder.buildGraphicsRenderParam();

        graphicsRenderParam.alpha = alpha;
        GraphicsRenderer.drawImageParam(x, y, handle, GraphicsType.ICON, graphicsRenderParam);

        TextRenderer.drawAlphaText(x + iconWidth, y + ContentLayout.KEYWORD_HEIGHT, item.custom.smallname, length, color, alpha, font);

        if (isDrawLimit) {
            this.drawItemLimit(x + iconWidth + interval, y, item, alpha);
        }
    };
    // END MEDIUM SECTION

    // FOR THE LARGE AND EXTRA LARGE WINDOW SIZES
    ItemRenderer.drawItemLarge = function (x, y, item, color, font, isDrawLimit) {
        if (!item) return;
        if (typeof item.custom.lrgname !== 'undefined') {
            this.drawItemAlphaLarge(x, y, item, color, font, isDrawLimit, 255);
        }
        else {
            this.drawItemAlpha(x, y, item, color, font, isDrawLimit, 255);
        }
    };

    ItemRenderer.drawItemAlphaLarge = function (x, y, item, color, font, isDrawLimit, alpha) {
        var interval = this._getItemNumberInterval();
        var iconWidth = GraphicsFormat.ICON_WIDTH + 5;
        var length = this._getTextLength();
        var handle = item.getIconResourceHandle();
        var graphicsRenderParam = StructureBuilder.buildGraphicsRenderParam();

        graphicsRenderParam.alpha = alpha;
        GraphicsRenderer.drawImageParam(x, y, handle, GraphicsType.ICON, graphicsRenderParam);

        TextRenderer.drawAlphaText(x + iconWidth, y + ContentLayout.KEYWORD_HEIGHT, item.custom.lrgname, length, color, alpha, font);

        if (isDrawLimit) {
            this.drawItemLimit(x + iconWidth + interval, y, item, alpha);
        }

    };
})();