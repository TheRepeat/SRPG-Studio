MapParts.Terrain._drawMain = function(x, y) {
	var width = this._getWindowWidth();
	var height = this._getWindowHeight();
	var xCursor = this.getMapPartsX();
	var yCursor = this.getMapPartsY();
	var terrain = PosChecker.getTerrainFromPos(xCursor, yCursor);
	var textui = this._getWindowTextUI();
	var pic = textui.getUIImage();
	
	if (terrain != null){
		if (terrain.getAvoid() !== 0){
			if(terrain.getAutoRecoveryValue() !== 0){
				WindowRenderer.drawStretchWindow(x, y, width, Math.round(height*1.2), pic);
			}
			else{
				WindowRenderer.drawStretchWindow(x, y, width, height, pic);
			}
		}
		else{
			if(terrain.getAutoRecoveryValue() !== 0){
				WindowRenderer.drawStretchWindow(x, y, width, height, pic);
			}
			else{
				WindowRenderer.drawStretchWindow(x, y, width, Math.round(height*0.75), pic);
			}
		}
		
	}
	
	x += this._getWindowXPadding();
	y += this._getWindowYPadding();
	
	this._drawContent(x, y, terrain);
};

MapParts.Terrain._drawContent = function(x, y, terrain) {
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
	if (terrain.getAvoid() !== 0){
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

	if(terrain.getAutoRecoveryValue() !== 0){
		y += this.getIntervalY();
		if(terrain.getAutoRecoveryValue() > 0){
			this._drawKeyword(x, y, "Heal", terrain.getAutoRecoveryValue());
		}
		else if(terrain.getAutoRecoveryValue() < 0){
			this._drawKeyword(x, y, "Dmg", terrain.getAutoRecoveryValue());
		}
	}
};