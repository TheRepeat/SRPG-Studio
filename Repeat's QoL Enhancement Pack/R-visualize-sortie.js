/**
 * By Repeat.
 * Modified from a Cube script for visualizing sortied units. Cube's original script added floating green text to sortied units, 
 * while this modification grays out the names and charchips of non-sortied units.
 * As a result, this does not use an alias like Cube's, but I prefer this implementation and you might too.
 */

(function () {
	UnitSelectScrollbar.drawScrollContent = function (x, y, object, isSelect, index) {
		var range;
		var unit = object;
		var unitRenderParam = StructureBuilder.buildUnitRenderParam();
		var alpha = 255;
		var dx = Math.floor((this.getObjectWidth() - GraphicsFormat.CHARCHIP_WIDTH) / 2) + 16;
		var length = this._getTextLength();
		var textui = this.getParentTextUI();
		var color = textui.getColor();
		var font = this.getParentTextUI().getFont();

		if (this._selectableArray !== null && !this._selectableArray[index]) {
			alpha = 128;
		}
		
		x += dx;
		y += 10;
		unitRenderParam.alpha = alpha;

		if (unit.getSortieState() !== SortieType.SORTIE) {
			color = 0xAEAEAE;
			range = createRangeObject(x - 50, y + 30, length, 40);
			TextRenderer.drawRangeAlphaText(range, TextFormat.CENTER, unit.getName(), length, color, alpha, font);

			unitRenderParam.colorIndex = 3; // wait/gray
			UnitRenderer.drawDefaultUnit(unit, x, y, unitRenderParam);
			return;
		}
		
		range = createRangeObject(x - 50, y + 30, length, 40);
		TextRenderer.drawRangeAlphaText(range, TextFormat.CENTER, unit.getName(), length, color, alpha, font);
		UnitRenderer.drawDefaultUnit(unit, x, y, unitRenderParam);
	};
})();