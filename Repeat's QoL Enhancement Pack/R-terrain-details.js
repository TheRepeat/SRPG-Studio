/*	By Repeat, inspired by Claris.
	Hides avoid on terrain when it equals 0 and displays the terrain's recovery/damage value.
	Edit the constants at the top to change the displayed string for recovery/damage values.
*/

HEAL_TERRAIN_TEXT = 'Heal';
DAMAGE_TERRAIN_TEXT = 'Dmg';
MapParts.Terrain._getPartsCount = function (terrain) {
	var count = 0;

	count += 2;
	if (terrain.getAvoid() !== 0) {
		count++;
	}

	if (terrain.getDef() !== 0) {
		count++;
	}

	if (terrain.getMdf() !== 0) {
		count++;
	}

	if (terrain.getAutoRecoveryValue() !== 0) {
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

	if (terrain === null) {
		return;
	}

	x += 2;
	TextRenderer.drawText(x, y, terrain.getName(), length, color, font);
	if (terrain.getAvoid() !== 0) {
		y += this.getIntervalY();
		this._drawKeyword(x, y, root.queryCommand('avoid_capacity'), terrain.getAvoid());
	}
	if (terrain.getDef() !== 0) {
		text = ParamGroup.getParameterName(ParamGroup.getParameterIndexFromType(ParamType.DEF));
		y += this.getIntervalY();
		this._drawKeyword(x, y, text, terrain.getDef());
	}

	if (terrain.getMdf() !== 0) {
		text = ParamGroup.getParameterName(ParamGroup.getParameterIndexFromType(ParamType.MDF));
		y += this.getIntervalY();
		this._drawKeyword(x, y, text, terrain.getMdf());
	}

	if (terrain.getAutoRecoveryValue() !== 0) {
		y += this.getIntervalY();
		if (terrain.getAutoRecoveryValue() > 0) {
			this._drawKeyword(x, y, HEAL_TERRAIN_TEXT, terrain.getAutoRecoveryValue());
		}
		else if (terrain.getAutoRecoveryValue() < 0) {
			this._drawKeyword(x, y, DAMAGE_TERRAIN_TEXT, terrain.getAutoRecoveryValue());
		}
	}
};