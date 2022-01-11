/**
 * By Repeat.
 * Adds unit rosters to the map commands, one for each faction.
 * If you only want certain rosters, you can change EnabledType below to true/false depending on your preference.
 */

(function () {

	// Edit these to true/false based on which ones you want to see
	var EnabledType = {
		PLAYER: true,
		ENEMY: true,
		ALLY: true
	};

	var Strings = {
		PLAYERCOMMAND: 'Unit Roster',
		ENEMYCOMMAND: 'Enemy Roster',
		ALLYCOMMAND: 'Ally Roster',
		HEADER: 'Unit Roster',
		PAGE: 'Page: '
	};

	var RosterType = {
		PLAYER: 0,
		ENEMY: 1,
		ALLY: 2
	};

	var RosterPage = {
		OVERVIEW: 0,
		STATS: 1,
		COMBAT: 2,
		SUPPORT: 3,
		CONVERSATION: 4,
		SKILLSTATES: 5
	};

	// I used a color picker to match these with the number colors
	var TextColor = {
		DANGER: 0xC39996,
		SUCCESS: 0xA4B397
	};

	var NumberColor = {
		NORMAL: 0,
		INFO: 1,
		SUCCESS: 2,
		DANGER: 3,
		DARK: 4
	}

	var PageTitle = ['Overview', 'Stats', 'Combat', 'Supporters', 'Conversations', 'Skills'];

	var alias1 = MapCommand.configureCommands;
	MapCommand.configureCommands = function (groupArray) {
		alias1.call(this, groupArray);

		if (EnabledType.PLAYER) groupArray.insertObject(MapCommand.UnitRoster, 0);
		if (EnabledType.ENEMY && EnemyList.getAliveList().getCount() > 0) {
			groupArray.insertObject(MapCommand.EnemyRoster, 1);
		}
		if (EnabledType.ALLY && AllyList.getAliveList().getCount() > 0) {
			groupArray.insertObject(MapCommand.AllyRoster, 2);
		}
	};

	BaseListCommandManager._moveOpen = function () {
		var object = this._commandScrollbar.getObject();
		var result = MoveResult.CONTINUE;

		if (object.moveCommand() !== MoveResult.CONTINUE) {
			this._commandScrollbar.setActive(true);
			this.changeCycleMode(ListCommandManagerMode.TITLE);

			// new check for Special Close to shut the entire MapCommand menu instead of just the UnitRoster window
			if (typeof object.getSpecialClose === 'function') {
				if (object.getSpecialClose()) result = MoveResult.END;
			}
		}

		return result;
	};

	// Condenses the common functions in the three rosters into one parent object
	var BaseRosterCommand = defineObject(BaseListCommand,
		{
			_unitRosterWindow: null,
			_specialClose: false,

			openCommand: function () {
			},

			getCommandName: function () {
			},

			moveCommand: function () {
				return this._unitRosterWindow.moveWindow();
			},

			drawCommand: function () {
				var x = LayoutControl.getCenterX(-1, this._unitRosterWindow.getWindowWidth());
				var y = LayoutControl.getCenterY(-1, this._unitRosterWindow.getWindowHeight());

				this._unitRosterWindow.drawWindow(x, y);
			},

			setSpecialClose: function (value) {
				this._specialClose = value;
			},

			// function to ensure command closes after selecting a unit from the roster
			getSpecialClose: function () {
				return this._specialClose;
			}
		}
	);

	MapCommand.UnitRoster = defineObject(BaseRosterCommand,
		{
			openCommand: function () {
				this._unitRosterWindow = createWindowObject(UnitRosterWindow);
				this._unitRosterWindow.setRosterType(RosterType.PLAYER);
				this._unitRosterWindow.setUnitRosterScrollbar();
			},

			getCommandName: function () {
				return Strings.PLAYERCOMMAND;
			}
		}
	);

	MapCommand.EnemyRoster = defineObject(BaseRosterCommand,
		{
			openCommand: function () {
				this._unitRosterWindow = createWindowObject(UnitRosterWindow);
				this._unitRosterWindow.setRosterType(RosterType.ENEMY);
				this._unitRosterWindow.setUnitRosterScrollbar();
			},

			getCommandName: function () {
				return Strings.ENEMYCOMMAND;
			}
		}
	);
	MapCommand.AllyRoster = defineObject(BaseRosterCommand,
		{
			openCommand: function () {
				this._unitRosterWindow = createWindowObject(UnitRosterWindow);
				this._unitRosterWindow.setRosterType(RosterType.ALLY);
				this._unitRosterWindow.setUnitRosterScrollbar();
			},

			getCommandName: function () {
				return Strings.ALLYCOMMAND;
			}
		}
	);

	var UnitRosterWindow = defineObject(BaseWindow,
		{
			_unitRosterScrollbar: null,
			_windows: null,
			_currentWindowIdx: 0,
			_windowCount: 5,
			_rosterType: false,

			setUnitRosterScrollbar: function () {
				this._unitRosterScrollbar = createScrollbarObject(UnitRosterScrollbar, this);
				this._unitRosterScrollbar.setScrollFormation(1, 5);
				this._setScrollData();
				this._unitRosterScrollbar.setActive(true);
			},

			setRosterType: function (rosterType) {
				this._rosterType = rosterType;
			},

			moveWindowContent: function () {
				var inputType = this._unitRosterScrollbar.getRecentlyInputType();
				this._unitRosterScrollbar.moveInput();
				if (InputControl.isSelectAction()) {
					return MoveResult.END;
				} else if (InputControl.isCancelAction()) {
					this._playCancelSound();
					return MoveResult.END;
				} else if (inputType === InputType.LEFT) {
					this._changeWindow(false);
				} else if (inputType === InputType.RIGHT) {
					this._changeWindow(true);
				}
				return MoveResult.CONTINUE;
			},

			drawWindowContent: function (x, y) {
				var textui = root.queryTextUI('infowindow_title');
				var color = textui.getColor();
				var font = textui.getFont();
				TextRenderer.drawText(x, y, Strings.HEADER, 10, color, font);
				// kinda looks ugly but don't really wanna remove in case someone wants it
				// var titleString = '- ' + PageTitle[this._currentWindowIdx] + ' -';
				// TextRenderer.drawText(x + this.getWindowWidth() / 2.5, y, titleString, -1, color, font);
				var pageString = '< ' + Strings.PAGE + (this._currentWindowIdx + 1) + ' / ' + (this._windowCount + 1) + ' >';
				TextRenderer.drawText(x + this.getWindowWidth() - this._getCharchipWidth() * 2.5, y, pageString, -1, color, font);
				y += this._getCharchipHeight() * 0.75;
				this._drawTopRow(x, y);
				y += this._getCharchipHeight() * 0.6;

				this._drawScrollbar(x, y);
			},

			_drawTopRow: function (x, y) {
				var textui = root.queryTextUI('infowindow_title');
				var color = textui.getColor();
				var font = textui.getFont();
				var length = -1;

				var xBase = x + this._getCharchipWidth();
				// charchip and name always show on every page
				TextRenderer.drawText(xBase, y, 'Name', length, color, font);
				xBase += this._getCharchipWidth() * 2;

				// draw the rest of the content on the top row
				switch (this._currentWindowIdx) {
					case RosterPage.OVERVIEW:
						TextRenderer.drawText(xBase, y, StringTable.Status_Level, length, color, font);
						xBase += this._getCharchipWidth() * 0.75;
						TextRenderer.drawText(xBase, y, StringTable.Status_Experience, length, color, font);
						xBase += this._getCharchipWidth() * 0.75;
						TextRenderer.drawText(xBase, y, root.queryCommand('hp_param'), length, color, font);
						xBase += this._getCharchipWidth() * 1.5;
						TextRenderer.drawText(xBase, y, root.queryCommand('weapon_object'), length, color, font);
						break;
					case RosterPage.STATS:
						TextRenderer.drawText(xBase, y, root.queryCommand('pow_param'), length, color, font);
						xBase += this._getCharchipWidth() * 0.75;
						TextRenderer.drawText(xBase, y, root.queryCommand('mag_param'), length, color, font);
						xBase += this._getCharchipWidth() * 0.75;
						TextRenderer.drawText(xBase, y, root.queryCommand('ski_param'), length, color, font);
						xBase += this._getCharchipWidth() * 0.75;
						TextRenderer.drawText(xBase, y, root.queryCommand('spd_param'), length, color, font);
						xBase += this._getCharchipWidth() * 0.75;
						TextRenderer.drawText(xBase, y, root.queryCommand('luk_param'), length, color, font);
						xBase += this._getCharchipWidth() * 0.75;
						TextRenderer.drawText(xBase, y, root.queryCommand('def_param'), length, color, font);
						xBase += this._getCharchipWidth() * 0.75;
						TextRenderer.drawText(xBase, y, root.queryCommand('mdf_param'), length, color, font);
						break;
					case RosterPage.COMBAT:
						TextRenderer.drawText(xBase, y, 'Class', length, color, font);
						xBase += this._getCharchipWidth() * 1.5;
						TextRenderer.drawText(xBase, y, root.queryCommand('attack_capacity'), length, color, font);
						xBase += this._getCharchipWidth() * 0.75;
						TextRenderer.drawText(xBase, y, root.queryCommand('hit_capacity'), length, color, font);
						xBase += this._getCharchipWidth() * 0.75;
						TextRenderer.drawText(xBase, y, root.queryCommand('avoid_capacity'), length, color, font);
						xBase += this._getCharchipWidth() * 0.75;
						TextRenderer.drawText(xBase, y, root.queryCommand('critical_capacity'), length, color, font);
						xBase += this._getCharchipWidth() * 0.75;
						TextRenderer.drawText(xBase, y, 'CAv', length, color, font);
						break;
					case RosterPage.SUPPORT:
						TextRenderer.drawText(xBase, y, 'Supports', length, color, font);
						break;
					case RosterPage.CONVERSATION:
						TextRenderer.drawText(xBase, y, 'Dialogue Partners', length, color, font);
						break;
					case RosterPage.SKILLSTATES:
						TextRenderer.drawText(xBase, y, 'Skills', length, color, font);
						xBase += this._getCharchipWidth() * 3;
						TextRenderer.drawText(xBase, y, 'Status', length, color, font);
						break;
				}
			},

			_changeWindow: function (isRight) {
				if (isRight) {
					this._currentWindowIdx++;
					if (this._currentWindowIdx > this._windowCount) {
						this._currentWindowIdx = 0;
					}
				} else {
					this._currentWindowIdx--;
					if (this._currentWindowIdx < 0) {
						this._currentWindowIdx = this._windowCount;
					}
				}
				this._playMenuTargetChangeSound();
			},

			_setScrollData: function () {
				var playerList = PlayerList.getSortieDefaultList();
				var enemyList = EnemyList.getAliveDefaultList();
				var allyList = AllyList.getAliveDefaultList();
				var list;
				switch (this._rosterType) {
					case RosterType.PLAYER:
						list = playerList;
						break;
					case RosterType.ENEMY:
						list = enemyList;
						break;
					case RosterType.ALLY:
						list = allyList;
						break;
					default:
						list = playerList;
						break;
				}
				for (var i = 0; i < list.getCount(); i++) {
					var unitObject = this._getUnitData(list.getData(i))
					this._unitRosterScrollbar.objectSet(unitObject);
				}
				this._unitRosterScrollbar.objectSetEnd();
			},

			// pick and choose the exact things I need from Unit so these expensive calls aren't made later
			_getUnitData: function (unit) {
				var unitObject = {};
				// 'unit' object is retained for inexpensive calculations that come straight from unit, e.g. unit.getHp()
				unitObject.unit = unit;

				// primary stats
				unitObject.mhp = ParamBonus.getMhp(unit);
				unitObject.str = RealBonus.getStr(unit);
				unitObject.mag = RealBonus.getMag(unit);
				unitObject.skl = RealBonus.getSki(unit);
				unitObject.spd = RealBonus.getSpd(unit);
				unitObject.lck = RealBonus.getLuk(unit);
				unitObject.def = RealBonus.getDef(unit);
				unitObject.res = RealBonus.getMdf(unit);
				unitObject.mov = RealBonus.getMov(unit);
				unitObject.wlv = RealBonus.getWlv(unit);
				unitObject.con = RealBonus.getBld(unit);

				// combat stats (some require a weapon)
				unitObject.weapon = null;
				unitObject.skillList = [];
				unitObject.stateIconHandles = [];
				unitObject.atk = 0;
				unitObject.hit = 0;
				unitObject.crt = 0;
				unitObject.avo = AbilityCalculator.getAvoid(unit);
				unitObject.cav = AbilityCalculator.getCriticalAvoid(unit);

				if (ItemControl.getEquippedWeapon(unit) !== null) {
					unitObject.weapon = ItemControl.getEquippedWeapon(unit);
					unitObject.agi = AbilityCalculator.getAgility(unit, unitObject.weapon);
					unitObject.atk = AbilityCalculator.getPower(unit, unitObject.weapon);
					if (Miscellaneous.isCriticalAllowed(unit, null)) {
						unitObject.crt = AbilityCalculator.getCritical(unit, unitObject.weapon);
					}
					unitObject.hit = AbilityCalculator.getHit(unit, unitObject.weapon);
				}
				// weapon is allowed to be null
				unitObject.skillList = SkillControl.getSkillMixArray(unit, unitObject.weapon, -1, '');

				// get states and put the icons in an array
				var stateList = unit.getTurnStateList();
				var state;
				for (var i = 0; i < stateList.getCount(); i++) {
					state = stateList.getData(i);
					if (!state.getState().isHidden()) {
						unitObject.stateIconHandles.push(state.getState().getIconResourceHandle())
					}
				}

				// check stat caps here, not as much for efficiency as for keeping code below briefer
				unitObject.strColor = unitObject.str === ParamGroup.getMaxValue(unit, ParamType.POW) ? NumberColor.SUCCESS : NumberColor.NORMAL;
				unitObject.magColor = unitObject.mag === ParamGroup.getMaxValue(unit, ParamType.MAG) ? NumberColor.SUCCESS : NumberColor.NORMAL;
				unitObject.sklColor = unitObject.skl === ParamGroup.getMaxValue(unit, ParamType.SKI) ? NumberColor.SUCCESS : NumberColor.NORMAL;
				unitObject.spdColor = unitObject.spd === ParamGroup.getMaxValue(unit, ParamType.SPD) ? NumberColor.SUCCESS : NumberColor.NORMAL;
				unitObject.lckColor = unitObject.lck === ParamGroup.getMaxValue(unit, ParamType.LUK) ? NumberColor.SUCCESS : NumberColor.NORMAL;
				unitObject.defColor = unitObject.def === ParamGroup.getMaxValue(unit, ParamType.DEF) ? NumberColor.SUCCESS : NumberColor.NORMAL;
				unitObject.resColor = unitObject.res === ParamGroup.getMaxValue(unit, ParamType.MDF) ? NumberColor.SUCCESS : NumberColor.NORMAL;

				return unitObject;
			},

			_drawScrollbar: function (x, y) {
				this._unitRosterScrollbar.drawScrollbar(x, y, this._currentWindowIdx);
			},

			getWindowWidth: function () {
				return 600;
			},

			getWindowHeight: function () {
				return 440;
			},

			_getCharchipHeight: function () {
				return GraphicsFormat.CHARCHIP_HEIGHT;
			},
			_getCharchipWidth: function () {
				return GraphicsFormat.CHARCHIP_WIDTH;
			},

			_playCancelSound: function () {
				var soundHandle = root.querySoundHandle('commandcancel');
				MediaControl.soundPlay(soundHandle);
			},

			_playMenuTargetChangeSound: function () {
				MediaControl.soundDirect('menutargetchange');
			}
		}
	);

	var UnitRosterScrollbar = defineObject(BaseScrollbar,
		{
			_pageIndex: 0,

			_drawSubContent: function (xBase, yBase, unitObject) {
				var textui = root.queryTextUI('default_window');
				var length = -1;
				var color = textui.getColor();
				var font = textui.getFont();
				var alpha = 255;
				var mhpBuffer = unitObject.mhp > 99 ? 40 : 32;

				var hpColor = NumberColor.NORMAL;
				var hpTextColor = color;
				// HP color turns red at 25% or lower (rounded up), green at full health, white otherwise
				if (unitObject.unit.getHp() === unitObject.mhp) {
					hpColor = NumberColor.SUCCESS;
					hpTextColor = TextColor.SUCCESS;
				} else if (unitObject.unit.getHp() <= Math.ceil(unitObject.mhp / 4)) {
					hpColor = NumberColor.DANGER;
					hpTextColor = TextColor.DANGER;
				} else {
					hpColor = NumberColor.NORMAL;
					hpTextColor = color;
				}

				// draw the rest of the unit content
				switch (this._pageIndex) {
					case RosterPage.OVERVIEW:

						NumberRenderer.drawNumberColor(xBase, yBase - 4, unitObject.unit.getLv(), NumberColor.NORMAL, alpha);
						xBase += this._getCharchipWidth() * 0.75;
						// don't draw exp for non player units or max level player units
						if (unitObject.unit.getUnitType() !== UnitType.PLAYER || unitObject.unit.getLv() === Miscellaneous.getMaxLv(unitObject.unit)) {
							TextRenderer.drawText(xBase, yBase, '--', length, color, font);
						} else {
							NumberRenderer.drawNumberColor(xBase + 4, yBase - 4, unitObject.unit.getExp(), NumberColor.NORMAL, alpha);
							if (unitObject.unit.getExp() > 80) {
								this._drawRiseCursor(xBase, yBase);
							}
						}

						xBase += this._getCharchipWidth() * 0.75;
						NumberRenderer.drawNumberColor(xBase + 4, yBase - 4, unitObject.unit.getHp(), hpColor, alpha);
						TextRenderer.drawText(xBase + 16, yBase - 2, '/', length, hpTextColor, font);
						NumberRenderer.drawNumberColor(xBase + mhpBuffer, yBase - 4, unitObject.mhp, hpColor, alpha);
						xBase += this._getCharchipWidth() * 1.5;
						if (unitObject.weapon !== null) {
							ItemRenderer.drawItem(xBase, yBase, unitObject.weapon, color, font, false);
						} else {
							TextRenderer.drawText(xBase, yBase, "--", length, color, font);
						}
						break;
					case RosterPage.STATS:
						// str mag skl spd lck def res
						NumberRenderer.drawNumberColor(xBase + 4, yBase - 4, unitObject.str, unitObject.strColor, alpha);
						xBase += this._getCharchipWidth() * 0.75;
						NumberRenderer.drawNumberColor(xBase + 4, yBase - 4, unitObject.mag, unitObject.magColor, alpha);
						xBase += this._getCharchipWidth() * 0.75;
						NumberRenderer.drawNumberColor(xBase + 4, yBase - 4, unitObject.skl, unitObject.sklColor, alpha);
						xBase += this._getCharchipWidth() * 0.75;
						NumberRenderer.drawNumberColor(xBase + 4, yBase - 4, unitObject.spd, unitObject.spdColor, alpha);
						xBase += this._getCharchipWidth() * 0.75;
						NumberRenderer.drawNumberColor(xBase + 4, yBase - 4, unitObject.lck, unitObject.lckColor, alpha);
						xBase += this._getCharchipWidth() * 0.75;
						NumberRenderer.drawNumberColor(xBase + 4, yBase - 4, unitObject.def, unitObject.defColor, alpha);
						xBase += this._getCharchipWidth() * 0.75;
						NumberRenderer.drawNumberColor(xBase + 4, yBase - 4, unitObject.res, unitObject.resColor, alpha);
						break;
					case RosterPage.COMBAT:
						TextRenderer.drawText(xBase, yBase, unitObject.unit.getClass().getName(), length, color, font);
						xBase += this._getCharchipWidth() * 1.5;
						NumberRenderer.drawNumberColor(xBase + 4, yBase - 4, unitObject.atk, NumberColor.NORMAL, alpha);
						xBase += this._getCharchipWidth() * 0.75;
						NumberRenderer.drawNumberColor(xBase + 4, yBase - 4, unitObject.hit, NumberColor.NORMAL, alpha);
						xBase += this._getCharchipWidth() * 0.75;
						NumberRenderer.drawNumberColor(xBase + 4, yBase - 4, unitObject.avo, NumberColor.NORMAL, alpha);
						xBase += this._getCharchipWidth() * 0.75;
						NumberRenderer.drawNumberColor(xBase + 4, yBase - 4, unitObject.crt, NumberColor.NORMAL, alpha);
						xBase += this._getCharchipWidth() * 0.75;
						NumberRenderer.drawNumberColor(xBase + 4, yBase - 4, unitObject.cav, NumberColor.NORMAL, alpha);
						break;
					case RosterPage.SUPPORT:
						var supportString = '--';
						if (unitObject.unit.getSupportDataCount() > 0) {
							supportString = '';
							for (var i = 0; i < unitObject.unit.getSupportDataCount(); i++) {
								// prevents crash if target is not on map
								if (!unitObject.unit.getSupportData(i).getUnit()) {
									continue;
								}
								supportString += unitObject.unit.getSupportData(i).getUnit().getName();
								if (i + 1 < unitObject.unit.getSupportDataCount()) {
									supportString += ', ';
								}
							}
							// this case is fulfilled if the user has supports but they're not currently on the map
							if (supportString === '') {
								supportString = '--';
							}
						}
						TextRenderer.drawText(xBase, yBase, supportString, length, color, font);
						break;
					case RosterPage.CONVERSATION:
						var partnersString = '';
						var talkArr = EventCommonArray.createArray(root.getCurrentSession().getTalkEventList(), EventType.TALK);
						// for all events
						for (var j = 0; j < talkArr.length; j++) {
							var event = talkArr[j];
							talkInfo = event.getTalkEventInfo();
							src = talkInfo.getSrcUnit();
							dest = talkInfo.getDestUnit();
							if (src === null || dest === null) {
								continue;
							}
							if (unitObject.unit !== src && unitObject.unit !== dest) {
								continue;
							} else if (unitObject.unit !== src && !talkInfo.isMutual()) {
								continue;
							} else if (src.getSortieState() !== SortieType.SORTIE || dest.getSortieState() !== SortieType.SORTIE) {
								continue;
							}

							// conversation partners
							if (event.isEvent() && event.getExecutedMark() === EventExecutedType.FREE) {
								var unit2;
								if (unitObject.unit === src) {
									unit2 = dest;
								} else {
									unit2 = src;
								}
								if (partnersString.length > 0) {
									partnersString += ', ';
								}
								partnersString += unit2.getName();
							}
						}
						if (partnersString.length === 0) {
							partnersString = '--';
						}
						TextRenderer.drawText(xBase, yBase, partnersString, length, color, font);
						break;
					case RosterPage.SKILLSTATES:
						var xStart = xBase;
						if (unitObject.skillList.length === 0) {
							TextRenderer.drawText(xBase, yBase, '--', length, color, font);
						}
						for (var i = 0; i < unitObject.skillList.length; i++) {
							var skill = unitObject.skillList[i].skill;
							if (!skill.isHidden()) {
								var handle = skill.getIconResourceHandle();
								GraphicsRenderer.drawImage(xBase, yBase, handle, GraphicsType.ICON);
								xBase += GraphicsFormat.ICON_WIDTH;
							}
						}

						xStart += this._getCharchipWidth() * 3;
						if (unitObject.stateIconHandles.length === 0) {
							TextRenderer.drawText(xStart, yBase, '--', length, color, font);
							break;
						}
						for (var i = 0; i < unitObject.stateIconHandles.length; i++) {
							var handle = unitObject.stateIconHandles[i];
							GraphicsRenderer.drawImage(xStart, yBase, handle, GraphicsType.ICON);
							xStart += GraphicsFormat.ICON_WIDTH;
						}
						break;
					default:
						break;
				}
			},

			drawScrollContent: function (x, y, object, isSelect, index) {
				var textui = root.queryTextUI('default_window');
				var length = -1;
				var color = textui.getColor();
				var font = textui.getFont();
				var unit = object.unit;
				var yBase = y + 16;
				var xBase = x + this._getCharchipWidth();

				// class and name are always shown
				UnitRenderer.drawDefaultUnit(unit, x, yBase - 8, null);
				TextRenderer.drawText(xBase, yBase, unit.getName(), length, color, font);
				xBase += this._getCharchipWidth() * 2;
				this._drawSubContent(xBase, yBase, object);
			},

			playSelectSound: function () {
				var unitObject = this.getObject();
				var generator = root.getEventGenerator();
				generator.locationFocus(unitObject.unit.getMapX(), unitObject.unit.getMapY(), true);
				generator.execute();
				MapCommand.UnitRoster.setSpecialClose(true);
				MapCommand.EnemyRoster.setSpecialClose(true);
				MapCommand.AllyRoster.setSpecialClose(true);
				MediaControl.soundDirect('commandselect');
			},

			playStartSound: function () {
				MediaControl.soundDirect('commandselect');
			},

			getObjectWidth: function () {
				return UnitRosterWindow.getWindowWidth() - 32;
			},

			getObjectHeight: function () {
				return this._getCharchipHeight() - 8;
			},

			_drawRiseCursor: function (x, y) {
				var ySrc = 0;
				var pic = root.queryUI('parameter_risecursor');
				var width = UIFormat.RISECURSOR_WIDTH / 2;
				var height = UIFormat.RISECURSOR_HEIGHT / 2;

				if (pic !== null) {
					pic.drawParts(x + 8, y - 8, 0, ySrc, width, height);
				}
			},

			_getCharchipHeight: function () {
				return GraphicsFormat.CHARCHIP_HEIGHT;
			},
			_getCharchipWidth: function () {
				return GraphicsFormat.CHARCHIP_WIDTH;
			}
		}
	);

	// need to pass the pageIndex from the parent window to draw new content
	var alias2 = BaseScrollbar.drawScrollbar;
	UnitRosterScrollbar.drawScrollbar = function (xStart, yStart, pageIndex) {
		this._pageIndex = pageIndex;
		alias2.call(this, xStart, yStart);
	}

})();
