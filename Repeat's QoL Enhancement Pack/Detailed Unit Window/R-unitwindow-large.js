
/*--------------------------------------------------------------------------
  
	By Repeat.
	Displays more detail in the unit window with combat stats and the equipped 
	weapon, for better visibility at a glance.

	XL:
	FACE		Name
	FACE		HP
	FACE		Lv Ex
	FACE		Weapon/Icons
	ATK  SPD  CRT  HIT
	DEF  RES  CAV  AVO

	L:
	FACE		Name
	FACE		HP
	FACE		Lv Ex
	FACE		Weapon/Icons
	ATK  SPD  DEF  RES
	
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
				x += GraphicsFormat.FACE_WIDTH + this._getInterval();
			},

			_getTotalStatus: function (unit) {
				return this._totalStatus;
			},

			_drawStatText: function (x, y, dx, statColor, font) {
				// ATK/AS positions are the same in XL and L
				TextRenderer.drawText(x + dx[4], y + 3, root.queryCommand('attack_capacity'), 64, statColor, font);
				TextRenderer.drawText(x + dx[0], y + 3, root.queryCommand('agility_capacity'), 64, statColor, font);
				if (this._getConfigOption() === 1) { // large size
					TextRenderer.drawText(x + dx[2], y + 3, root.queryCommand('def_param'), 64, statColor, font);
					TextRenderer.drawText(x + dx[6], y + 3, root.queryCommand('mdf_param'), 64, statColor, font);
				} else { // extra large size
					TextRenderer.drawText(x + dx[2], y + 3, root.queryCommand('critical_capacity'), 64, statColor, font);
					TextRenderer.drawText(x + dx[6], y + 3, root.queryCommand('hit_capacity'), 64, statColor, font);

					// draw bottom stats
					y += 22;

					TextRenderer.drawText(x + dx[4], y + 3, root.queryCommand('def_param'), 64, statColor, font);
					TextRenderer.drawText(x + dx[0], y + 3, root.queryCommand('mdf_param'), 64, statColor, font);
					TextRenderer.drawText(x + dx[2], y + 3, CRIT_AVOID_STAT, 64, statColor, font);
					TextRenderer.drawText(x + dx[6], y + 3, root.queryCommand('avoid_capacity'), 64, statColor, font);
				}
			},

			// Main appeal of this is not having to repeat the negative number check for every stat
			_drawSingleStat: function (x, y, stat, font) {
				var xMod = 12;
				if (stat < 0) {
					if (stat <= -10) xMod = 20; // adaptive for double-digit negatives. Rare but I look prescient if I account for em right?
					TextRenderer.drawText(x - xMod, y + 3, ' - ', 64, 0xFFFFFF, font);
					stat *= -1;
				}
				NumberRenderer.drawNumber(x, y, stat);
			},

			_drawStats: function (x, y, unit, dx, color, font, isUnarmed, atk, agi, crt, hit, def, res, cav, avo) {
				// ATK/SPD positions are the same in XL and L
				if (isUnarmed) {
					agi = RealBonus.getSpd(unit);
					TextRenderer.drawKeywordText(x + dx[5], y, StringTable.SignWord_WaveDash, -1, color, font); // ATK
					this._drawSingleStat(x + dx[1], y, agi, font);
				} else {
					this._drawSingleStat(x + dx[5], y, atk, font);
					this._drawSingleStat(x + dx[1], y, agi, font);
				}

				if (this._getConfigOption() === 1) { // L
					this._drawSingleStat(x + dx[3], y, def, font);
					this._drawSingleStat(x + dx[7], y, res, font);
				} else { // XL
					if (isUnarmed) {
						TextRenderer.drawKeywordText(x + dx[3], y, StringTable.SignWord_WaveDash, -1, color, font); // CRT
						TextRenderer.drawKeywordText(x + dx[7], y, StringTable.SignWord_WaveDash, -1, color, font); // HIT
					} else {
						this._drawSingleStat(x + dx[3], y, crt, font);
						this._drawSingleStat(x + dx[7], y, hit, font);
					}

					// draw bottom stats
					y += 22

					this._drawSingleStat(x + dx[5], y, def, font);
					this._drawSingleStat(x + dx[1], y, res, font);
					this._drawSingleStat(x + dx[3], y, cav, font);
					this._drawSingleStat(x + dx[7], y, avo, font);
				}
			},

			// if ICONS_ONLY in 0_unitwindow-config, draw the first 5 icons in unit inventory
			_drawItemIcons: function (x, y, unit, length, color, font) {
				var iconWidth = GraphicsFormat.ICON_WIDTH + 5;
				var handle;
				var graphicsRenderParam = StructureBuilder.buildGraphicsRenderParam(); // what does this do?
				var i = 0;

				if (unit.getItem(0) === null) {
					TextRenderer.drawText(x, y + 2, "(Unarmed)", length, color, font);
					return;
				}
				var activeItem = unit.getItem(0);
				// With the current layout, only 5 icons will show nicely
				while (activeItem !== null && i < 5) {
					handle = activeItem.getIconResourceHandle();
					GraphicsRenderer.drawImageParam(x + (iconWidth * i), y, handle, GraphicsType.ICON, graphicsRenderParam);

					i++;
					activeItem = unit.getItem(i) === null ? null : unit.getItem(i);
				}
			},

			_drawSubInfo: function (x, y, unit, textui, mhp) {
				var length = this._getTextLength();
				var color = textui.getColor();
				var font = textui.getFont();

				var dxComp = -(GraphicsFormat.FACE_WIDTH) / 2 + 5;
				var dx = [dxComp, dxComp + 44, dxComp + 60, dxComp + 98, dxComp - 60, dxComp - 20, dxComp + 119, dxComp + 160];

				var totalStatus = this._getTotalStatus(unit);
				var defBonus = 0,
					avoBonus = 0,
					cavBonus = 0,
					crtBonus = 0,
					pwrBonus = 0,
					hitBonus = 0;
				if (totalStatus) {
					defBonus = totalStatus.defenseTotal;
					avoBonus = totalStatus.avoidTotal;
					cavBonus = totalStatus.criticalAvoidTotal;
					crtBonus = totalStatus.criticalTotal;
					pwrBonus = totalStatus.powerTotal;
					hitBonus = totalStatus.hitTotal;
				}
				var atk = 0;
				var agi;
				var crt = 0;
				var hit = 0;
				var def = RealBonus.getDef(unit) + defBonus;
				var res = RealBonus.getMdf(unit) + defBonus;
				var cav = AbilityCalculator.getCriticalAvoid(unit) + cavBonus;
				var avo = AbilityCalculator.getAvoid(unit) + avoBonus;

				x += GraphicsFormat.FACE_WIDTH + this._getInterval();
				y += 32;
				ContentRenderer.drawHp(x, y, unit.getHp(), ParamBonus.getMhp(unit));
				y += 20;
				ContentRenderer.drawLevelInfo(x, y, unit);
				y += 22;

				var weapon;
				var isUnarmed = false; // determines whether to draw certain stats
				// no weapon equipped; don't try to get combat stats
				if (ItemControl.getEquippedWeapon(unit) === null) {
					isUnarmed = true;
				} else {
					weapon = ItemControl.getEquippedWeapon(unit);
					agi = AbilityCalculator.getAgility(unit, weapon);
					atk = AbilityCalculator.getPower(unit, weapon) + pwrBonus;
					if (!Miscellaneous.isCriticalAllowed(unit, null)) {
						crt = 0;
					} else {
						crt = AbilityCalculator.getCritical(unit, weapon) + crtBonus;
					}
					hit = AbilityCalculator.getHit(unit, weapon) + hitBonus;
				}

				// equipped weapon or list of icons in inventory
				if (!ICONS_ONLY) {
					if (ItemControl.getEquippedWeapon(unit) === null) {
						TextRenderer.drawText(x + GraphicsFormat.ICON_WIDTH, y + 2, "(Unarmed)", length, color, font);
					} else {
						ItemRenderer.drawItemLarge(x, y, weapon, textui.getColor(), textui.getFont(), false);
					}
				}
				else this._drawItemIcons(x, y, unit, length, color, font);

				y += 22;
				this._drawStatText(x, y, dx, STAT_COLOR, font);
				this._drawStats(x, y, unit, dx, color, font, isUnarmed, atk, agi, crt, hit, def, res, cav, avo);
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

			// Can you believe XL and L used to be entirely different files with just a few slightly different functions?
			_getWindowHeight: function (unit) {
				var heightMod = 1;
				if (this._getConfigOption() === 1) heightMod = 1.25;

				return DefineControl.getFaceWindowHeight() + (this._faceHeight - GraphicsFormat.FACE_HEIGHT * heightMod);
			},

			// this._getConfigOption is way better than writing ConfigItem.UnitMenuStatus.getFlagValue() every time
			_getConfigOption: function () {
				return ConfigItem.UnitMenuStatus.getFlagValue();
			}
		}
	);

	MapPartsCollection._configureMapParts = function (groupArray) {
		var n = root.getMetaSession().getDefaultEnvironmentValue(8);

		if (n === 0 || n === 1) {
			groupArray.appendObject(MapParts.UnitInfoLarge);
		}
		else if (n === 2) {
			groupArray.appendObject(MapParts.UnitInfo);
		}
		else {
			groupArray.appendObject(MapParts.UnitInfoSmall);
		}

		groupArray.appendObject(MapParts.Terrain);
	};

	ConfigItem.UnitMenuStatus = defineObject(BaseConfigtItem,
		{
			selectFlag: function (index) {
				root.getMetaSession().setDefaultEnvironmentValue(8, index);
			},

			getFlagValue: function () {
				return root.getMetaSession().getDefaultEnvironmentValue(8);
			},

			getFlagCount: function () {
				return 4;
			},

			getConfigItemTitle: function () {
				return StringTable.Config_MapUnitWindow;
			},

			getConfigItemDescription: function () {
				return StringTable.Config_MapUnitWindowDescription;
			},

			getObjectArray: function () {
				return ['XL', 'L', 'M', 'S'];
			}
		}
	);

})();
