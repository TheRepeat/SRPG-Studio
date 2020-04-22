
/*--------------------------------------------------------------------------
  
  By Repeat.
  Displays more detail in the unit window with combat stats and the equipped 
  weapon, for better visibility at a glance.
  
  Modified from official config-largemapunitwindow.js plugin by SapphireSoft:
  SapphireSoft
  http://srpgstudio.com/
  
--------------------------------------------------------------------------*/

(function () {
	MapParts.UnitInfoLarge = defineObject(MapParts.UnitInfo,
		{
			_mhp: 0,
			_weapon: null,
			_isLargeFace: false,
			_faceWidth: 0,
			_faceHeight: 0,
			_totalStatus: null,

			initialize: function () {
				this._isLargeFace = root.isLargeFaceUse();
				this._faceWidth = root.getLargeFaceWidth();
				this._faceHeight = root.getLargeFaceHeight();
			},

			setUnit: function (unit) {
				if (unit !== null) {
					this._mhp = ParamBonus.getMhp(unit);
					this._weapon = ItemControl.getEquippedWeapon(unit);
					this._totalStatus = SupportCalculator.createTotalStatus(unit);
				}
				else {
					this._weapon = null;
					this._totalStatus = null;
				}
			},

			_drawContent: function (x, y, unit, textui) {
				this._drawFace(x, y, unit, textui);
				this._drawName(x, y, unit, textui);
				this._drawInfo(x, y, unit, textui);
				this._drawSubInfo(x, y, unit, textui, this._mhp);
			},

			_drawFace: function (x, y, unit, textui) {
				var pic, xSrc, ySrc;
				var destWidth = GraphicsFormat.FACE_WIDTH;
				var destHeight = GraphicsFormat.FACE_HEIGHT;
				var srcWidth = destWidth;
				var srcHeight = destHeight;
				var handle = unit.getFaceResourceHandle();

				if (handle === null) {
					return;
				}

				pic = GraphicsRenderer.getGraphics(handle, GraphicsType.FACE);
				if (pic === null) {
					return;
				}

				if (this._isLargeFace) {
					destWidth = this._faceWidth;
					destHeight = this._faceHeight;
					if (pic.isLargeImage()) {
						srcWidth = destWidth;
						srcHeight = destHeight;
					}
				}

				xSrc = handle.getSrcX();
				ySrc = handle.getSrcY();

				xSrc *= srcWidth;
				ySrc *= srcHeight;
				pic.drawStretchParts(x, y, destWidth, destHeight, xSrc, ySrc, srcWidth, srcHeight);
			},

			_drawName: function (x, y, unit, textui) {
				var length = this._getTextLength();
				var color = textui.getColor();
				var font = textui.getFont();

				x += this._faceWidth - this._getInterval();
				y += 10;
				TextRenderer.drawText(x, y, unit.getName(), length, color, font);
			},

			_drawInfo: function (x, y, unit, textui) {
				var length = this._getTextLength();
				var color = textui.getColor();
				var font = textui.getFont();

				x += GraphicsFormat.FACE_WIDTH + this._getInterval();
			},

			_getTotalStatus: function (unit) {
				return this._totalStatus;
			},

			_drawSubInfo: function (x, y, unit, textui, mhp) {
				var length = this._getTextLength();
				var color = textui.getColor();
				var statColor = ColorValue.INFO;
				var font = textui.getFont();

				var dxComp = -(GraphicsFormat.FACE_WIDTH) / 2 + 5;
				var dx1 = [dxComp, dxComp + 44, dxComp + 60, dxComp + 98, dxComp - 60, dxComp - 20, dxComp + 119, dxComp + 160];

				var totalStatus = this._getTotalStatus(unit);
				var defBonus = 0,
					pwrBonus = 0
				if (totalStatus) {
					defBonus = totalStatus.defenseTotal;
					pwrBonus = totalStatus.powerTotal;
				}
				var def = RealBonus.getDef(unit) + defBonus;
				var res = RealBonus.getMdf(unit) + defBonus;
				var agi = AbilityCalculator.getAgility(unit,weapon);

				x += GraphicsFormat.FACE_WIDTH + this._getInterval();
				y += 32;
				ContentRenderer.drawHp(x, y, unit.getHp(), ParamBonus.getMhp(unit));
				y += 20;
				ContentRenderer.drawLevelInfo(x, y, unit);
				y += 22;

				var weapon;
				// no weapon equipped
				if (ItemControl.getEquippedWeapon(unit) === null) {
					TextRenderer.drawText(x, y + 2, "(Unarmed)", length, color, font);

					// stats line 1
					y += 22;
					TextRenderer.drawText(x + dx1[4], y + 3, root.queryCommand('attack_capacity'), 64, statColor, font);
					TextRenderer.drawKeywordText(x + dx1[5], y, StringTable.SignWord_WaveDash, -1, color, font);
					TextRenderer.drawText(x + dx1[0], y + 3, root.queryCommand('agility_capacity'), 64, statColor, font);
					NumberRenderer.drawNumber(x + dx1[1], y, agi);
					TextRenderer.drawText(x + dx1[2], y + 3, root.queryCommand('def_param'), 64, statColor, font);
					NumberRenderer.drawNumber(x + dx1[3], y, def);
					TextRenderer.drawText(x + dx1[6], y + 3, root.queryCommand('mdf_param'), 64, statColor, font);
					NumberRenderer.drawNumber(x + dx1[7], y, res);
					return;
				}
				else {
					weapon = ItemControl.getEquippedWeapon(unit);
				}

				var atk = AbilityCalculator.getPower(unit, weapon) + pwrBonus;

				// equipped weapon
				ItemRenderer.drawItemLarge(x, y, weapon, textui.getColor(), textui.getFont(), false);
				y += 22;

				// stats line 1
				TextRenderer.drawText(x + dx1[4], y + 3, root.queryCommand('attack_capacity'), 64, statColor, font);
				NumberRenderer.drawNumber(x + dx1[5], y, atk);
				TextRenderer.drawText(x + dx1[0], y + 3, root.queryCommand('agility_capacity'), 64, statColor, font);
				NumberRenderer.drawNumber(x + dx1[1], y, agi);
				TextRenderer.drawText(x + dx1[2], y + 3, root.queryCommand('def_param'), 64, statColor, font);
				NumberRenderer.drawNumber(x + dx1[3], y, def);
				TextRenderer.drawText(x + dx1[6], y + 3, root.queryCommand('mdf_param'), 64, statColor, font);
				NumberRenderer.drawNumber(x + dx1[7], y, res);
			},

			_getTextLength: function () {
				return ItemRenderer.getItemWindowWidth() - (this._faceWidth + this._getInterval() + DefineControl.getWindowXPadding()) + this._getSpaceWidth();
			},

			_getInterval: function () {
				return 10;
			},

			_getSpaceWidth: function () {
				return -25;
			},

			_getWindowWidth: function (unit) {
				return ItemRenderer.getItemWindowWidth() + (this._faceWidth - GraphicsFormat.FACE_WIDTH) + this._getSpaceWidth();
			},

			_getWindowHeight: function (unit) {
				return DefineControl.getFaceWindowHeight() + (this._faceHeight - GraphicsFormat.FACE_HEIGHT * 1.25);
			}
		}
	);
})();
