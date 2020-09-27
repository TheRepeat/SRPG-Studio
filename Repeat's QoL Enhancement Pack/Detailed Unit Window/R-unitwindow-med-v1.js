
/*--------------------------------------------------------------------------
  
  Created by TheRepeat.
  Changes the layout of the 'Medium' setting for the detailed unit window.
  This shows the unit's Atk and AS stats instead of EXP progress.
  
  Modified from official window-unitsimple.js plugin by SapphireSoft:
  http://srpgstudio.com/
  
--------------------------------------------------------------------------*/

(function () {

	MapParts.UnitInfo._totalStatus = 0;

	// need to grab totalStatus ahead of time since it's expensive
	MapParts.UnitInfo.setUnit = function (unit) {
		if (unit !== null) {
			this._mhp = ParamBonus.getMhp(unit);
			this._totalStatus = SupportCalculator.createTotalStatus(unit);

		}
		else {
			this._totalStatus = null;
		}
	}

	MapParts.UnitInfo._drawContent = function (x, y, unit, textui) {
		UnitSimpleRenderer.drawContentEx(x, y, unit, textui, this._mhp, this._totalStatus);
	}

	UnitSimpleRenderer.drawContentEx = function (x, y, unit, textui, mhp, totalStatus) {
		this._drawFace(x, y, unit, textui);
		this._drawName(x, y, unit, textui);
		this._drawInfo(x, y, unit, textui);
		this._drawSubInfo(x, y, unit, textui, mhp, totalStatus);
	}

	UnitSimpleRenderer._drawInfo = function (x, y, unit, textui) {
		var length = this._getTextLength();
		var color = textui.getColor();
		var font = textui.getFont();

		x += GraphicsFormat.FACE_WIDTH + this._getInterval();
	};

	UnitSimpleRenderer._drawSubInfo = function (x, y, unit, textui, mhp, totalStatus) {
		var length = this._getTextLength();
		var color = textui.getColor();
		var statColor = ColorValue.INFO;
		var font = textui.getFont();
		var pwrBonus = 0;
		if (totalStatus) {
			pwrBonus = totalStatus.powerTotal;
		}

		var dx = [0, 44, 60, 98, -60, -20];

		x += GraphicsFormat.FACE_WIDTH + this._getInterval();
		y += 30;
		ContentRenderer.drawHp(x, y, unit.getHp(), mhp);
		y += 20;

		var weapon;
		var agi = AbilityCalculator.getAgility(unit, weapon);
		if (ItemControl.getEquippedWeapon(unit) === null) {
			TextRenderer.drawText(x + dx[0], y + 3, root.queryCommand('attack_capacity'), 64, statColor, font);
			TextRenderer.drawKeywordText(x + dx[1], y, StringTable.SignWord_WaveDash, -1, color, font);
			TextRenderer.drawText(x + dx[2], y + 3, root.queryCommand('agility_capacity'), 64, statColor, font);
			NumberRenderer.drawNumber(x + dx[3], y, agi);
			y += 23;
			TextRenderer.drawText(x + 16, y, "(Unarmed)", length, color, font);
			return;
		}
		else {
			weapon = ItemControl.getEquippedWeapon(unit);
		}

		var atk = AbilityCalculator.getPower(unit, weapon) + pwrBonus;

		TextRenderer.drawText(x + dx[0], y + 3, root.queryCommand('attack_capacity'), 64, statColor, font);
		NumberRenderer.drawNumber(x + dx[1], y, atk);
		TextRenderer.drawText(x + dx[2], y + 3, root.queryCommand('agility_capacity'), 64, statColor, font);
		NumberRenderer.drawNumber(x + dx[3], y, agi);
		y += 21;

		// equipped weapon
		ItemRenderer.drawItemSmall(x, y, weapon, textui.getColor(), textui.getFont(), false);
		y += 22;
	};
})();
