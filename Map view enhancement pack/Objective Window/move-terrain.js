/*  By Repeat.
    By default, terrain details are shown on the right side of the window.
    This moves the terrain window to the bottom of the screen instead, to be more like GBA FE.
    Please, hold your applause.
 */


(function() {

    MapParts.Terrain._getPositionX = function() {
        var x = LayoutControl.getPixelX(this.getMapPartsX());
		var dx = root.getGameAreaWidth() / 2;
		var y = LayoutControl.getPixelY(this.getMapPartsY());
		var dy = root.getGameAreaHeight() / 2;
		var xBase = LayoutControl.getRelativeX(10) - 50;
		
		if (x < dx) {
			return root.getGameAreaWidth() - this._getWindowWidth() - xBase;
		}
		else {
			return xBase;
		}
    };

    // fixed at bottom of screen
    MapParts.Terrain._getPositionY = function() {
        var yBase = LayoutControl.getRelativeY(10) - 20;
        
        return root.getGameAreaHeight() - this._getWindowHeight() - yBase;
    };


    // unit info only moves when the cursor is in the top left (so it won't overlap)
    MapParts.UnitInfo._getPositionY = function() {
        var x = LayoutControl.getPixelX(this.getMapPartsX());
		var dx = root.getGameAreaWidth() / 2;
		var y = LayoutControl.getPixelY(this.getMapPartsY());
		var dy = root.getGameAreaHeight() / 2;
        var yBase = LayoutControl.getRelativeY(10) - 28;
		
		if (x < dx && y < dy) {
			return root.getGameAreaHeight() - this._getWindowHeight() - yBase;
		}
		else {
			return yBase;
		}
    };

})();
