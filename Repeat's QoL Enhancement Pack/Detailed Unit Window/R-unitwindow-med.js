
/*--------------------------------------------------------------------------
  
	Created by TheRepeat.
	Changes the layout of the 'Medium' setting for the detailed unit window.
	This shows the unit's Atk and AS stats instead of EXP progress.

	MEDIUM_SHOWS_STATS:
	FACE		Name
	FACE		HP
	FACE		ATK	AS
	FACE		Weapon

	!MEDIUM_SHOWS_STATS:
	FACE		Name
	FACE		HP
	FACE		LV EXP
	FACE		Weapon
	
	Modified from official window-unitsimple.js plugin by SapphireSoft:
	http://srpgstudio.com/
  
--------------------------------------------------------------------------*/

(function () {

	MapParts.UnitInfo._totalStatus = null;

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
		x += GraphicsFormat.FACE_WIDTH + this._getInterval();
	};

	UnitSimpleRenderer._drawSubInfo = function (x, y, unit, textui, mhp, totalStatus) {
		var length = this._getTextLength();
		var color = textui.getColor();
		var statColor = STAT_COLOR;
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
		if (!MEDIUM_SHOWS_STATS) {
			ContentRenderer.drawLevelInfo(x, y, unit);
			y += 21;
		}

		var weapon;
		var agi;
		if (ItemControl.getEquippedWeapon(unit) === null) {
			if (MEDIUM_SHOWS_STATS) {
				agi = RealBonus.getSpd(unit);
				TextRenderer.drawText(x + dx[0], y + 3, root.queryCommand('attack_capacity'), 64, statColor, font);
				TextRenderer.drawKeywordText(x + dx[1], y, StringTable.SignWord_WaveDash, -1, color, font);
				TextRenderer.drawText(x + dx[2], y + 3, root.queryCommand('agility_capacity'), 64, statColor, font);
				NumberRenderer.drawNumber(x + dx[3], y, agi);
				y += 23;
			}
			TextRenderer.drawText(x + GraphicsFormat.ICON_WIDTH, y, "(Unarmed)", length, color, font);
			return;
		}
		else {
			weapon = ItemControl.getEquippedWeapon(unit);
			agi = AbilityCalculator.getAgility(unit, weapon);
		}

		if (MEDIUM_SHOWS_STATS) {
			var atk = AbilityCalculator.getPower(unit, weapon) + pwrBonus;

			TextRenderer.drawText(x + dx[0], y + 3, root.queryCommand('attack_capacity'), 64, statColor, font);
			NumberRenderer.drawNumber(x + dx[1], y, atk);
			TextRenderer.drawText(x + dx[2], y + 3, root.queryCommand('agility_capacity'), 64, statColor, font);
			NumberRenderer.drawNumber(x + dx[3], y, agi);
			y += 21;
		}

		// equipped weapon
		ItemRenderer.drawItemSmall(x, y, weapon, textui.getColor(), textui.getFont(), false);
	};
})();
