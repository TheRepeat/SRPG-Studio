/* By Repeat.
   Displays the current objective in a box on the map screen.
   To use, follow this formatting in the map's custom parameters:
   {objective:true}
   You set the objective text within SRPG Studio itself.
*/

(function () {

    var alias1 = MapPartsCollection._configureMapParts;
    MapPartsCollection._configureMapParts = function (groupArray) {
        var mapInfo = root.getCurrentSession().getCurrentMapInfo();

        alias1.call(this, groupArray);

        if (mapInfo.custom.objective) {
            groupArray.appendObject(MapParts.Objective);
        }

    };

    MapParts.Objective = defineObject(BaseMapParts,
        {
            _objectiveStr: '',

            drawMapParts: function () {
                var text = this._getText();
                var x = this._getPositionX(text);
                var y = this._getPositionY();

                if (this._objectiveStr != '') {
                    this._drawMain(x, y);
                }
            },

            _drawMain: function (x, y) {
                var text = this._getText();
                var width = this._getWindowWidth(text);
                var height = this._getWindowHeight();
                var textui = this._getWindowTextUI();
                var pic = textui.getUIImage();

                WindowRenderer.drawStretchWindow(x, y, width, height, pic);

                x += this._getWindowXPadding();
                y += this._getWindowYPadding();
                this._drawContent(x, y, text);
            },

            // user input
            changeObjective: function (str) {
                this._objectiveStr = str;
            },

            _drawContent: function (x, y, text) {
                var textui = this._getWindowTextUI();
                var font = textui.getFont();
                var color = textui.getColor();
                var length = this._getTextLength(text);

                x += 2;
                TextRenderer.drawText(x, y, text, length, color, font);
            },

            _getText: function () {
                var mapInfo = root.getCurrentSession().getCurrentMapInfo();

                if (!mapInfo.custom.objective) {
                    return '';
                }
                return this._objectiveStr;
            },

            _getTextLength: function (text) {
                return this._getWindowWidth(text) - DefineControl.getWindowXPadding();
            },

            _getPositionX: function (text) {
                var dx = LayoutControl.getRelativeX(10) - 54;

                return root.getGameAreaWidth() - this._getWindowWidth(text) - dx;
            },

            _getPositionY: function () {
                var x = LayoutControl.getPixelX(this.getMapPartsX());
                var dx = root.getGameAreaWidth() / 2;
                var y = LayoutControl.getPixelY(this.getMapPartsY());
                var dy = root.getGameAreaHeight() / 2;
                var yBase = LayoutControl.getRelativeY(10) - 28;

                if (y < dy && x > dx) {
                    return root.getGameAreaHeight() - this._getWindowHeight() - yBase;
                }
                else {
                    return yBase;
                }
            },

            _getWindowXPadding: function () {
                return DefineControl.getWindowXPadding();
            },

            _getWindowYPadding: function () {
                return DefineControl.getWindowYPadding();
            },

            _getWindowWidth: function (text) {
                var textPadding = 50 - text.length;
                if (textPadding < 10) {
                    textPadding = 10;
                }
                return text.length * 7.5 + textPadding;
            },

            _getWindowHeight: function () {
                return 30 + this.getIntervalY();
            },

            _getWindowTextUI: function () {
                return root.queryTextUI('default_window');
            }
        });
})();
