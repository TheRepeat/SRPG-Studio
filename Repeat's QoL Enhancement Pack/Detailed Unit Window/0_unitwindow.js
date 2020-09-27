/* Part of the Detailed Unit Window plugin. 
   Make sure this plugin loads before the rest of the detailed unit window plugins. It has the 0 in the name 
   to make sure it gets loaded first.
*/

(function () {
	CRIT_AVOID_STAT = "CAv"; // Edit this to change string for Critical Avoid

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