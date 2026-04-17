/*
This script adds a "Manage" command when in walking mode similar to battle prep.
*/

StringTable.ManageCommandName = "Manage";

(function () {
	var alias0 = MapCommand.configureCommands;
	MapCommand.configureCommands = function (groupArray) {
		alias0.call(this, groupArray);
		groupArray.insertObject(WalkManageCommand, 0);
	};
})();

var WalkManageCommand = defineObject(BaseListCommand, {
	_baseScreen: null,

	initialize: function() {
		this._baseScreen = createObject(MarshalScreen);
	},

	openCommand: function () {
		var screenParam;
		screenParam = this._createScreenParam();
		this._baseScreen.setScreenData(screenParam);
	},

	moveCommand: function () {
		if (this._baseScreen.moveScreenCycle() === MoveResult.END) {
			return MoveResult.END;
		}
		return MoveResult.CONTINUE;
	},

	_createScreenParam: function() { //required method
		return {};
	},

	drawCommand: function () {
		this._baseScreen.drawScreenCycle();
	},

	getCommandName: function () {
		return StringTable.ManageCommandName
	},

	// This function is required for the command to be added to map commands (i.e. BaseTitleCommand doesn't have this already)
	isCommandDisplayable: function () {
		return root.getCurrentSession().getCurrentMapInfo().custom.isWalkMap;
	}
});