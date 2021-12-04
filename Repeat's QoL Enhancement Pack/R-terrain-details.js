/**
 * Version 2.0
 * Expanded Terrain Window, by Repeat.
 * Shows the normal data in the terrain window, with additions:
 *  * HP recovery or damage value (change the value of healTerrainText or damageTerrainText as you please)
 *  * Stat bonuses from skills of type "Parameter Bonus" that are granted by the terrain
 * 		- Def and Res parameter bonuses are combined with the default Def/Res display
 *  * Icons of all skills granted by terrain (if they are not hidden)
 * 		- For the most natural feeling, I recommend hiding any stat-boosting skills granted by terrain.
 * 		- If you don't like this, set showSkillIcons to false
 *  * Terrain window is hidden if the terrain's name is empty.
 * 		- If you don't like this, set showEmptyTerrainWindow to false
 *
 * This is plug and play.
 * 
 * Alias notes:
 * 	MapParts.Terrain._drawContent is overwritten without an alias
 * 	MapParts.Terrain._getPartsCount is overwritten without an alias
 */

var TerrainWindowConfig = {
	healTerrainText: 'Heal',
	damageTerrainText: 'Dmg',
	showSkillIcons: true, 			// true = show all skills the terrain grants, false = don't
	showEmptyTerrainWindow: true 	// false = hide terrain window if terrain's name is blank, true = don't
};

(function () {
	var drawTerrainAlias = MapParts.Terrain._drawMain;
    MapParts.Terrain._drawMain = function (x, y) {
        var xCursor = this.getMapPartsX();
        var yCursor = this.getMapPartsY();
        var terrain = PosChecker.getTerrainFromPos(xCursor, yCursor);

        if (terrain.getName() !== '' || TerrainWindowConfig.showEmptyTerrainWindow) {
			drawTerrainAlias.call(this, x, y);
        }
    }
})();

MapParts.Terrain._paramBonusSkillArr = [];
// The indices in the array correspond to ParamType in constants-enumeratedtype.js
// e.g. _terrainBonusArr[2] is Magic because ParamType.MAG = 2
MapParts.Terrain._terrainBonusArr = [];

MapParts.Terrain._setSkillParamBonusList = function (skillReferenceList) {
	var paramBonusSkillArr = [];
	var count = skillReferenceList.getTypeCount();

	if (count === 0) {
		this._paramBonusSkillArr = paramBonusSkillArr;
		return;
	}
	for (var i = 0; i < count; i++) {
		data = skillReferenceList.getTypeData(i);
		if (data.getSkillType() === SkillType.PARAMBONUS) {
			paramBonusSkillArr[i] = data;
		}
	}

	this._paramBonusSkillArr = paramBonusSkillArr;
};

MapParts.Terrain._setTerrainBonusArr = function (terrain) {
	var skillList = this._paramBonusSkillArr;
	var count = skillList.length;
	// Must be the length of ParamType.COUNT (11 by default)
	// The terrain's built-in def/res values are the default, and are increased if terrain bonuses apply
	var tempBonusArr = [0, 0, 0, 0, 0, 0, terrain.getDef(), terrain.getMdf(), 0, 0, 0];

	if (count === 0) {
		this._terrainBonusArr = tempBonusArr;
		return;
	}

	for (var i = 0; i < skillList.length; i++) {
		var skill = skillList[i];
		if (skill && skill.getSkillType() === SkillType.PARAMBONUS) {
			var bonusArr = skill.getParameterBonus();
			for (var j = 0; j < tempBonusArr.length; j++) {
				tempBonusArr[j] += bonusArr.getAssistValue(j);
			}
		}
	}

	this._terrainBonusArr = tempBonusArr;
};

MapParts.Terrain.hasAnyVisibleSkills = function (skillReferenceList) {
	var found = false;
	var count = skillReferenceList.getTypeCount();

	if (count === 0) {
		return found;
	}

	for (var i = 0; i < count; i++) {
		data = skillReferenceList.getTypeData(i);
		if (!data.isHidden()) {
			found = true;
		}
	}

	return found;
};

MapParts.Terrain._getPartsCount = function (terrain) {
	var count = 2;
	var terrainBonusArr = this._terrainBonusArr

	if (terrain.getAvoid() !== 0) {
		count++;
	}

	if (terrainBonusArr) {
		for (var i = 0; i < terrainBonusArr.length; i++) {
			if (terrainBonusArr[i] !== 0) {
				count++;
			}
		}
	}

	if (terrain.getAutoRecoveryValue() !== 0) {
		count++;
	}

	if (TerrainWindowConfig.showSkillIcons && this.hasAnyVisibleSkills(terrain.getSkillReferenceList())) {
		count++;
	}

	return count;
};

MapParts.Terrain._drawContent = function (x, y, terrain) {
	var text;
	var textui = this._getWindowTextUI();
	var font = textui.getFont();
	var color = textui.getColor();
	var length = this._getTextLength();
	var terrainBonusArr = this._terrainBonusArr;
	var paramType = ParamType.MHP; // = 0, just using the enum for clarity of purpose

	if (terrain === null) {
		return;
	}

	this._setSkillParamBonusList(terrain.getSkillReferenceList())
	this._setTerrainBonusArr(terrain);

	x += 2;
	TextRenderer.drawText(x, y, terrain.getName(), length, color, font);

	if (terrain.getAvoid() !== 0) {
		y += this.getIntervalY();
		this._drawKeyword(x, y, root.queryCommand('avoid_capacity'), terrain.getAvoid());
	}

	// Draws all applicable stats from array
	if (terrainBonusArr.length > 0) {
		while (paramType < terrainBonusArr.length) {
			if (terrainBonusArr[paramType] !== 0) {
				text = ParamGroup.getParameterName(ParamGroup.getParameterIndexFromType(paramType));
				y += this.getIntervalY();
				this._drawKeyword(x, y, text, terrainBonusArr[paramType]);
			}
			paramType++;
		}
	}

	if (terrain.getAutoRecoveryValue() !== 0) {
		y += this.getIntervalY();
		var text = terrain.getAutoRecoveryValue() > 0 ? TerrainWindowConfig.healTerrainText : TerrainWindowConfig.damageTerrainText;
		this._drawKeyword(x, y, text, terrain.getAutoRecoveryValue());
	}

	if (TerrainWindowConfig.showSkillIcons) {
		y += this.getIntervalY() + 4;
		var skillReferenceList = terrain.getSkillReferenceList();
		for (var i = 0; i < skillReferenceList.getTypeCount(); i++) {
			var skill = skillReferenceList.getTypeData(i);
			if (!skill.isHidden()) {
				var handle = skill.getIconResourceHandle();
				GraphicsRenderer.drawImage(x, y, handle, GraphicsType.ICON);
				x += GraphicsFormat.ICON_WIDTH;
			}
		}
	}
};