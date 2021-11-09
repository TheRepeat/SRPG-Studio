
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
	MapParts.UnitInfo._unitData = null;

	// need to grab totalStatus ahead of time since it's expensive
	MapParts.UnitInfo.setUnit = function (unit) {
		if (unit !== null) {
			this._mhp = ParamBonus.getMhp(unit);
			var weapon = ItemControl.getEquippedWeapon(unit);
			var mt = 0;
			if (weapon) {
				mt = AbilityCalculator.getPower(unit, weapon);
			}
			this._unitData = {
				agi: AbilityCalculator.getAgility(unit, weapon),
				mt: mt,
				totalStatus: SupportCalculator.createTotalStatus(unit),
				weapon: weapon
			}
		}
		else {
			this._totalStatus = null;
		}
	}

	MapParts.UnitInfo._drawContent = function (x, y, unit, textui) {
		UnitSimpleRenderer.drawContentEx(x, y, unit, textui, this._mhp, this._unitData);
	}

	UnitSimpleRenderer.drawContentEx = function (x, y, unit, textui, mhp, unitData) {
		this._drawFace(x, y, unit, textui);
		this._drawName(x, y, unit, textui);
		this._drawInfo(x, y, unit, textui);
		if (unitData) {
			this._drawSubInfo(x, y, unit, textui, mhp, unitData);
		}
	}

	UnitSimpleRenderer._drawInfo = function (x, y, unit, textui) {
		x += GraphicsFormat.FACE_WIDTH + this._getInterval();
	};

	UnitSimpleRenderer._drawSubInfo = function (x, y, unit, textui, mhp, unitData) {
		var length = this._getTextLength();
		var color = textui.getColor();
		var statColor = STAT_COLOR;
		var font = textui.getFont();

		// wish I had object destructuring
		var agi = unitData.agi;
		var totalStatus = unitData.totalStatus;
		var weapon = unitData.weapon;

		var pwrBonus = 0;
		if (totalStatus) {
			pwrBonus = totalStatus.powerTotal;
		}
		var atk = unitData.mt + pwrBonus;

		var dx = [0, 44, 60, 98, -60, -20];

		x += GraphicsFormat.FACE_WIDTH + this._getInterval();
		y += 30;
		ContentRenderer.drawHp(x, y, unit.getHp(), mhp);
		y += 20;

		if (!MEDIUM_SHOWS_STATS) {
			ContentRenderer.drawLevelInfo(x, y, unit);
		} else {
			TextRenderer.drawText(x + dx[0], y + 3, root.queryCommand('attack_capacity'), 64, statColor, font);
			if (weapon) {
				NumberRenderer.drawNumber(x + dx[1], y, atk);
			} else {
				TextRenderer.drawKeywordText(x + dx[1], y, StringTable.SignWord_WaveDash, -1, color, font);
			}
			TextRenderer.drawText(x + dx[2], y + 3, root.queryCommand('agility_capacity'), 64, statColor, font);
			NumberRenderer.drawNumber(x + dx[3], y, agi);
		}

		y += 21;

		if (!weapon) {
			TextRenderer.drawText(x + GraphicsFormat.ICON_WIDTH, y + 2, "(Unarmed)", length, color, font);
		} else {
			ItemRenderer.drawItemSmall(x, y, weapon, textui.getColor(), textui.getFont(), false);
		}
	};
})();
