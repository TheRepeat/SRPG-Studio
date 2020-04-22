
/*--------------------------------------------------------------------------
  
  By Repeat.
  Changes the layout of the 'Medium' setting for the detailed unit window.
  
  Modified from official window-unitsimple.js plugin by SapphireSoft:
  http://srpgstudio.com/
  
--------------------------------------------------------------------------*/

(function () {

	UnitSimpleRenderer._drawInfo = function (x, y, unit, textui) {
		var length = this._getTextLength();
		var color = textui.getColor();
		var font = textui.getFont();

		x += GraphicsFormat.FACE_WIDTH + this._getInterval();
		// y += 32;
		// TextRenderer.drawText(x, y, unit.getClass().getName(), length, color, font);
	};

	UnitSimpleRenderer._drawSubInfo = function (x, y, unit, textui) {
		var length = this._getTextLength();
		var color = textui.getColor();
		var font = textui.getFont();

		x += GraphicsFormat.FACE_WIDTH + this._getInterval();
		y += 30;
		ContentRenderer.drawHp(x, y, unit.getHp(), ParamBonus.getMhp(unit));
		y += 20;
		ContentRenderer.drawLevelInfo(x, y, unit);
		y += 21;

		var weapon;
		if (ItemControl.getEquippedWeapon(unit) === null) {
			y += 2;
			TextRenderer.drawText(x, y, "(Unarmed)", length, color, font);
			return;
		}
		else {
			weapon = ItemControl.getEquippedWeapon(unit);
		}

		// equipped weapon
		ItemRenderer.drawItemSmall(x, y, weapon, textui.getColor(), textui.getFont(), false);
		y += 22;
	};
})();
