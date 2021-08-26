
/*--------------------------------------------------------------------------
  
 Script to change the orientation of the unit

■ Overview
You can change the way a unit is facing via an Execute Script event.
This plugin is also used by character-walking.js

■ How to use
Select the script in the event execution condition and select the check box of the script execution condition.
Then write the following in the text box at the bottom:

"Function List"
  // Direct the unit with ID: unitid of param1 toward the unit with ID: targetid of param2.
  UnitDirectionControl.setDirection(param1, unitid, param2, targetid, direction);
		Valid values for "param1" and "param2":
			Entries in UnitDirValue enum, except ENEMY_REINFORCE_UNIT

		Valid values for "direction":
			DirCtrlValue.FACE                    // Face the target unit
			DirCtrlValue.FACE_R                  // Turn to the right with respect to the target unit
			DirCtrlValue.FACE_L                  // Turn to the left with respect to the target unit
			DirCtrlValue.FACE_REV                // Turn to the opposite side of the target unit
			DirCtrlValue.NULL                    // No direction (stop facing the target unit)


  // Direct the unit with ID: unitid of param1 in the direction "direction" with respect to the map coordinates specified by x and y.
  UnitDirectionControl.setDirectionByPos(param1, unitid, x, y, direction);
		Valid values for "param1":
			UnitDirValue.PLAYER_UNIT
			UnitDirValue.GUEST_UNIT
			UnitDirValue.GUEST_EVENT_UNIT
			UnitDirValue.ENEMY_INIT_UNIT
			UnitDirValue.ENEMY_EVENT_UNIT
			UnitDirValue.ALLY_INIT_UNIT
			UnitDirValue.ALLY_EVENT_UNIT

		Valid values for "direction":
			DirCtrlValue.FACE                    // Face the target unit
			DirCtrlValue.FACE_R                  // Turn to the right with respect to the target unit
			DirCtrlValue.FACE_L                  // Turn to the left with respect to the target unit
			DirCtrlValue.FACE_REV                // Turn to the opposite side of the target unit
			DirCtrlValue.NULL                    // No direction (stop facing the target unit)


  // Variable page tablepage ID: Gets the unit ID from the SRPG Studio variable table instead of being hard-coded.
	UnitDirectionControl.setDirectionByPosFromVA(tablepage, tableid, x, y, direction);
		Valid values for "tablepage": Variable page
			For variable page 1: 0
			For variable page 2: 1
			For variable page 3: 2
			For variable page 4: 3
			For variable page 5: 4

		Valid values for "direction":
			DirCtrlValue.FACE                    // Face the target unit
			DirCtrlValue.FACE_R                  // Turn to the right with respect to the target unit
			DirCtrlValue.FACE_L                  // Turn to the left with respect to the target unit
			DirCtrlValue.FACE_REV                // Turn to the opposite side of the target unit
			DirCtrlValue.NULL                    // No direction (stop facing the target unit)


16/10/23 Newly created
17/03/19 Added UnitDirectionControl.setDirectionByPos() and UnitDirectionControl.setDirectionByPosFromVA()
19/12/20 Added DIRECT_ID_ENEMY and DIRECT_ID_ALLY so that you can specify the unit whose affiliation has changed.


■ Supported version
SRPG Studio Version: 1.207


■ Terms
・ Use is limited to games using SRPG Studio.
・ It does not matter whether it is commercial or non-commercial. It's free.
・ There is no problem with processing. Please remodel more and more.
・ No credit specified OK
・ Redistribution and reprint OK
・ Please comply with the SRPG Studio Terms of Service.
  
--------------------------------------------------------------------------*/


//----------------------------------
// Definition value for specification
//----------------------------------
var UnitDirValue = {
	// Parameters specified in param1 and param2
	PLAYER_UNIT: 0x0101,	// 0x0101=257 in decimal
	GUEST_UNIT: 0x0102,	// 0x0102=258 in decimal
	GUEST_EVENT_UNIT: 0x0103,	// 0x0103=259 in decimal
	ENEMY_INIT_UNIT: 0x0204,	// 0x0204=516 in decimal
	ENEMY_EVENT_UNIT: 0x0205,	// 0x0205=517 in decimal
	ENEMY_REINFORCE_UNIT: 0x0206,	// 0x0206=518 in decimal ※Actually meaningless because the direction of reinforcements cannot be changed.
	ALLY_INIT_UNIT: 0x0304,	// 0x0304=772 in decimal
	ALLY_EVENT_UNIT: 0x0305,	// 0x0305=773 in decimal
	DIRECT_ID_ENEMY: 0x0306,	// Directly specify the ID of the enemy (use this for units that have changed affiliation)
	DIRECT_ID_ALLY: 0x0307	// Directly specify the ID of the ally (use this for units that have changed affiliation)
};


// ----------------------------------
// Note: ID correction value for each unit affiliation / type
// (These are also given in comments next to each function, near the bottom)
// ----------------------------------
// Own army: ID as it is
// Enemy unit: ID + 65536 (65536 * 1)
// Event enemy unit: ID + 131072 (65536 * 2)
// Alliance: ID + 196608 (65536 * 3)
// Alliance event: ID + 262144 (65536 * 4)
// Reinforcement enemy unit: ID + 327680 (65536 * 5)
// Guest: ID + 393216 (65536 * 6)
// Guest event: ID + 458752 (65536 * 7)


var DirCtrlValue = {
	FACE: 0,
	FACE_R: 1,
	FACE_L: -1,
	FACE_REV: 2,
	NULL: 999
};

//----------------------------------
// UnitDirectionControl class
//----------------------------------
var UnitDirectionControl = {
	// Face the specified direction based on the target unit
	setDirection: function (param1, unitid, param2, targetid, direction) {
		var unit = this._getUnit(param1, unitid);
		var targetunit = this._getUnit(param2, targetid);

		if (unit == null) {
			root.log('Unit acquisition failure param1:0x' + param1.toString(16) + ' ID:' + unitid);
			return;
		}

		if (targetunit == null) {
			root.log('Unit acquisition failure param2:0x' + param2.toString(16) + ' ID:' + targetid);
			return;
		}

		this._setUnitDirecion(unit, targetunit, direction);
	},

	// Orient in the specified direction based on the target coordinate
	setDirectionByPos: function (param1, unitid, x, y, direction) {
		var unit = this._getUnit(param1, unitid);

		if (unit == null) {
			root.log('Unit acquisition failure param1:0x' + param1.toString(16) + ' ID:' + unitid);
			return;
		}

		this._setUnitDirecionByPos(unit, x, y, direction);
	},

	// Orient in the specified direction based on the target coordinate
	setDirectionByPosFromVA: function (tablepage, tableid, x, y, direction) {
		var unitid = this._getVATable(tablepage, tableid);
		var unit = this._getUnitFromId(unitid);

		if (unit == null) {
			root.log('Unit acquisition failure ID:' + unitid);
			return;
		}

		this._setUnitDirecionByPos(unit, x, y, direction);
	},

	// Get specified variable
	_getVATable: function (tablepage, tableid) {
		var table = root.getMetaSession().getVariableTable(tablepage);
		var index = table.getVariableIndexFromId(tableid);
		return table.getVariable(index);
	},

	// --------------------------------------------------
	// Gets unit by calling specific unit getters by type
	// --------------------------------------------------
	// Get the specified unit
	_getUnit: function (param, unitid) {
		switch (param) {
			case UnitDirValue.PLAYER_UNIT:
				return this._getPlayerUnit(unitid);
			case UnitDirValue.GUEST_UNIT:
				return this._getGuestUnit(unitid);
			case UnitDirValue.GUEST_EVENT_UNIT:
				return this._getGuestEventUnit(unitid);
			case UnitDirValue.ENEMY_INIT_UNIT:
				return this._getInitEnemyUnit(unitid);
			case UnitDirValue.ENEMY_EVENT_UNIT:
				return this._getEnEnemyUnit(unitid);
			case UnitDirValue.ENEMY_REINFORCE_UNIT:
				return this._getReEnemyUnit(unitid);
			case UnitDirValue.ALLY_INIT_UNIT:
				return this._getInitAllyUnit(unitid);
			case UnitDirValue.ALLY_EVENT_UNIT:
				return this._getPaAllyUnit(unitid);
			case UnitDirValue.DIRECT_ID_ENEMY:
				return this._getEnemyUnitFromID(unitid);
			case UnitDirValue.DIRECT_ID_ALLY:
				return this._getAllyUnitFromID(unitid);
			default:
				root.log('Parameter \'param\' invalid:0x' + param.toString(16));
				return null;
		}
	},

	// Get the unit with the specified id
	_getUnitFromId: function (unitid) {
		var unit;

		// Player units, Guests, Event Guests
		if (unitid < 65536 || unitid >= 393216) {
			return this._getPlayerUnitFromID(unitid);
		}
		// Enemy units, Event Enemies, Reinforcements
		if ((unitid >= 65536 && unitid < 196608) || (unitid >= 327680 && unitid < 393216)) {
			unit = this._getEnemyUnitFromID(unitid);
			if (unit !== null) {
				return unit;
			}
			// Check allied forces if not in enemy forces
			return this._getAllyUnitFromID(unitid);
		}
		// Ally units, Event Allies
		if ((unitid >= 196608 && unitid < 327680)) {
			unit = this._getAllyUnitFromID(unitid);
			if (unit !== null) {
				return unit;
			}
			// Check enemy forces if not in allied forces
			return this._getEnemyUnitFromID(unitid);
		}
		// Otherwise null
		return null;
	},

	// Change the orientation of the unit based on the target unit
	_setUnitDirecion: function (unit, targetunit, direction) {
		var dir = this._setDirecionXY(unit.getMapX(), unit.getMapY(), targetunit.getMapX(), targetunit.getMapY(), direction);
		// Set the orientation of the unit
		unit.setDirection(dir);
	},

	// Change the orientation of the unit based on the target unit
	_setUnitDirecionByPos: function (unit, target_x, target_y, direction) {
		var dir = this._setDirecionXY(unit.getMapX(), unit.getMapY(), target_x, target_y, direction);
		// Set the orientation of the unit
		unit.setDirection(dir);
	},

	// Change the orientation of the unit
	_setDirecionXY: function (unit_x, unit_y, target_x, target_y, direction) {
		var dir = DirectionType.NULL;

		// Find the difference between X and Y between the unit you want to change direction and the target unit.
		var x = unit_x - target_x;
		var y = unit_y - target_y;
		// Make the difference between X and Y an absolute value
		var absx = Math.abs(x);
		var absy = Math.abs(y);

		// If the difference in absolute value X <= the difference in absolute value Y, it faces up or down.
		if (absx <= absy) {
			if (y < 0) {
				// Since the unit you want to change the direction is on the top, the direction to face is calculated based on the bottom.
				dir = this._cnvDir(direction, DirectionType.BOTTOM);
			}
			else {
				// Since the unit you want to change direction is at the bottom, the direction you are facing is calculated based on the top.
				dir = this._cnvDir(direction, DirectionType.TOP);
			}
		}
		// Otherwise, turn to the right or left
		else {
			if (x < 0) {
				// The unit you want to turn is on the left, so the direction you want to turn is calculated based on the right.
				dir = this._cnvDir(direction, DirectionType.RIGHT);
			}
			else {
				// The unit you want to turn is on the right, so the direction you want to turn is calculated based on the left.
				dir = this._cnvDir(direction, DirectionType.LEFT);
			}
		}
		// Return the orientation of the unit
		return dir;
	},

	// Convert direction according to the value of 'direction'
	// direction: value from DirCtrlValue enum
	// now_dir: value from DirectionType enum (in constants-enumeratedtype.js)
	// If you AND the result of (direction + now_dir) with 0x03, it will change in the desired direction.
	_cnvDir: function (direction, now_dir) {
		if (direction == DirCtrlValue.NULL) {
			return DirectionType.NULL;
		}

		return ((direction + now_dir) & 0x03);
	},

	//-----------------------
	// Player faction related
	//-----------------------
	// Get Player unit by ID
	_getPlayerUnit: function (unitid) {
		return this._getPlayerUnitFromID(unitid);
	},

	// Get Guest unit by ID
	_getGuestUnit: function (unitid) {
		return this._getPlayerUnitFromID(unitid + 393216);		// Guest ID 0 = 393216
	},

	// Get Event Guest unit by ID
	_getGuestEventUnit: function (unitid) {
		return this._getPlayerUnitFromID(unitid + 458752);		// Event Guest ID 0 = 458752
	},

	//-----------------------
	// Enemy faction related
	//-----------------------
	// Get Enemy unit by ID
	_getInitEnemyUnit: function (unitid) {
		return this._getEnemyUnitFromID(unitid + 65536);		// Enemy ID 0 = 65536
	},

	// Get Event Enemy unit by ID
	_getEnEnemyUnit: function (unitid) {
		return this._getEnemyUnitFromID(unitid + 131072);		// Event Enemy ID 0 = 131072
	},

	// Get Reinforcement Enemy unit by ID
	_getReEnemyUnit: function (unitid) {
		return this._getEnemyUnitFromID(unitid + 327680);		// Reinforcement ID 0 = 327680
	},

	//-----------------------
	// Ally faction related
	//-----------------------
	// Get Ally unit by ID
	_getInitAllyUnit: function (unitid) {
		return this._getAllyUnitFromID(unitid + 196608);		// Ally ID 0 = 196608
	},

	// Get Event Ally unit by ID
	_getPaAllyUnit: function (unitid) {
		return this._getAllyUnitFromID(unitid + 262144);		// Event Ally ID 0 = 262144
	},

	//----------------------------------
	// Agnostic unit getter functions
	//----------------------------------
	// Get Player unit by ID
	_getPlayerUnitFromID: function (unitid) {
		var unitlist = root.getCurrentSession().getPlayerList();
		var unit = unitlist.getDataFromId(unitid);
		return unit;
	},

	// Get Enemy unit by ID
	_getEnemyUnitFromID: function (unitid) {
		var unitlist = root.getCurrentSession().getEnemyList();
		var unit = unitlist.getDataFromId(unitid);
		return unit;
	},

	// Get Ally unit by ID
	_getAllyUnitFromID: function (unitid) {
		var unitlist = root.getCurrentSession().getAllyList();
		var unit = unitlist.getDataFromId(unitid);
		return unit;
	}
};