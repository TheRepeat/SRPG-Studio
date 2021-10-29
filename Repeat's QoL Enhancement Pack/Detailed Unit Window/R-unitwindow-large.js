
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
			_hp: 0,
			_weapon: null,
			_isLargeFace: false,
			_faceWidth: 0,
			_faceHeight: 0,
			_totalStatus: null,
			_agi: 0,
			_crt: 0,
			_def: 0,
			_res: 0,
			_cav: 0,
			_hit: 0,
			_avo: 0,
			_mt: 0,
			_isCritAllowed: false,

			initialize: function () {
				this._isLargeFace = root.isLargeFaceUse();
				this._faceWidth = root.getLargeFaceWidth();
				this._faceHeight = root.getLargeFaceHeight();
			},

			setUnit: function (unit) {
				if (unit !== null) {
					this._mhp = ParamBonus.getMhp(unit);
					this._hp = unit.getHp();
					this._weapon = ItemControl.getEquippedWeapon(unit);
					this._totalStatus = SupportCalculator.createTotalStatus(unit);
					this._agi = AbilityCalculator.getAgility(unit, this._weapon);
					if (this._weapon === null) {
						this._crt = 0;
						this._hit = 0;
						this._mt = 0;
					} else {
						this._crt = AbilityCalculator.getCritical(unit, this._weapon);
						this._hit = AbilityCalculator.getHit(unit, this._weapon);
						this._mt = AbilityCalculator.getPower(unit, this._weapon);
					}
					this._def = RealBonus.getDef(unit);
					this._res = RealBonus.getMdf(unit);
					this._cav = AbilityCalculator.getCriticalAvoid(unit);
					this._avo = AbilityCalculator.getAvoid(unit);
					this._isCritAllowed = Miscellaneous.isCriticalAllowed(unit, null);
				}
				else {
					this._weapon = null;
					this._totalStatus = null;
					this._hp = 0;
					this._agi = 0;
					this._crt = 0;
					this._def = 0;
					this._res = 0;
					this._cav = 0;
					this._hit = 0;
					this._avo = 0;
					this._mt = 0;
					this._isCritAllowed = false;
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

			// CAv is displayed differently if unit has an Invalid Critical skill.
			_getHasInvalidCritSkill: function (unit) {
				if (!CAV_IS_UNIQUE) return;

				var hasInvalidCritSkill = false;
				var skillArr = SkillControl.getDirectSkillArray(unit, SkillType.INVALID, '')

				for (var i = 0; i < skillArr.length; i++) {
					var skill = skillArr[i].skill;
					var value = skill.getSkillValue();
					if (value === InvalidFlag.CRITICAL) {
						hasInvalidCritSkill = true;
						break;
					}
					continue;
				}
				return hasInvalidCritSkill;
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
					TextRenderer.drawKeywordText(x + dx[5], y, StringTable.SignWord_WaveDash, -1, color, font); // ATK
				} else {
					this._drawSingleStat(x + dx[5], y, atk, font);
				}
				this._drawSingleStat(x + dx[1], y, agi, font);

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
					this._getHasInvalidCritSkill(unit)
						? TextRenderer.drawKeywordText(x + dx[3], y, MAX_CAV_TEXT, -1, color, font)
						: this._drawSingleStat(x + dx[3], y, cav, font);
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
				var agi = 0;
				var crt = 0;
				var hit = 0;
				var def = this._def + defBonus;
				var res = this._res + defBonus;
				var cav = this._cav + cavBonus;
				var avo = this._avo + avoBonus;

				x += GraphicsFormat.FACE_WIDTH + this._getInterval();
				y += 32;
				ContentRenderer.drawHp(x, y, this._hp, this._mhp);
				y += 20;
				ContentRenderer.drawLevelInfo(x, y, unit);
				y += 22;

				var weapon;
				var isUnarmed = false; // determines whether to draw certain stats
				// no weapon equipped; don't try to get combat stats
				if (this._weapon === null) {
					isUnarmed = true;
				}
				weapon = this._weapon;
				agi = this._agi;
				atk = this._mt + pwrBonus;
				if (!this._isCritAllowed) {
					crt = 0;
				} else {
					crt = this._crt + crtBonus;
				}
				hit = this._hit + hitBonus;

				// equipped weapon or list of icons in inventory
				if (!ICONS_ONLY) {
					if (isUnarmed) {
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
