
/*--------------------------------------------------------------------------

	Character walking operation

Author: 名前未定（仮）/ namae mitei (kari) / namae kakkokari / name undecided (provisional) / name TBD (tentative)
Translation: Google, DeepL
Localization, TL notes, and some new features and fixes: Repeat

■ Overview
	By specifying custom parameters on the map, you will be able to create a map 
	that allows you to move a unit with the arrow keys.

	! Caution !
	If you grab the unit by left-clicking the mouse during testplay with the mouse off,
	the position of the walking unit may shift and movement may malfunction.
	When testplaying with the mouse off, do not grab the unit on the screen.

	This plugin has support for the Fog of War plugins.
	However, the fog will be scrolled "in the case of a walking map, taking into account the scrolling state of the map".
	(Because the original background scrolling process does not consider the map scrolling state, it makes the fog drawing 
		feel strange when scrolling the map.)

■ How to use
	When working on a map, click Map Info → Custom Parameter button (at the bottom)
	By setting the following custom parameters, you can make a walking map (normal type).
	"Normal type" means if multiple player units are fielded, you can switch the walking unit using the C key
	and have them walk separately.

	[Custom parameters for walking map (normal)]
		{isWalkMap: 1}

	Or, if you set the below custom parameters, you can make a walking map (group type).
	If multiple player units are sortied, the only the first unit in the list is shown on the field. Pressing the C key 
	switches out the lead unit. 
	TL note: Think traditional JRPGs that let you change which character is in the lead, e.g. "Tales of" games.

	[Custom parameters for walking map (group)]
		{isWalkMap: 1, walkGroup: 1}

	Addition by Repeat: Disable Run feature for the map.
	If you don't want the current map to allow the player to run (to enforce a particular pace), use the following 
	custom parameter:
		{isWalkMap: 1, cannotRun: true}
	(You can also include the walkGroup parameter if you want.)

	Addition by Repeat: Specific run speed by map.
	As described below, the MoveSpeed variable in this file refers to the default movement speed.
	If you want a particular map to be faster or slower, you can give it the following custom parameter:
		{isWalkMap: 1, currentMapMoveSpeed: 0}
	Just like MoveSpeed described below, currentMapMoveSpeed can have a value of 0, 1, 2, or 3, where 3 is the slowest.
	This can be combined with the walkGroup and cannotRun parameters if you wish.

■ Keyboard Controls
	Arrow keys: Move up / down / left / right
	Z key:
		* When standing neutrally: Check for any place events at your feet
			(Place event: Custom-> Treasure chest-> Village-> Store-> Information)
		* When facing a direction:
			First, check underfoot for events
				(place event: custom → treasure chest → village → store → information)
			Then check the adjacent tile being faced 
				(conversation event → place event: custom → treasure chest → door → information)

	X key: Show map commands
		* Addition by Repeat: hold X while moving to run, doubling your movement speed.
			Note that this is tied to the SYSTEM key, not the CANCEL key, just like other types of speedup in SRPG Studio.
			It's only by coincidence that the X key is also bound to SYSTEM with default controls,
			(which is why I don't like default controls lol, I recommend putting it on the D key in game.ini)
	C key: Switch the controlled unit (when switching, the unit stands neutrally) 
		* This can be disabled. See Customization section, step 9.

	The lead unit moves 32 pixels at a time, e.g. the default size of one tile. 
	(Currently, map sizes other than 32px are not supported)

	Movement cost is ignored, of course, but the lead unit cannot walk on terrain that's impassible by their class.
		(Flying units can go over rivers, etc. Be sure to be careful with your terrain types.)

	Place events of type Wait execute as soon as the lead unit steps on the event (it doesn't execute if you 
		check with the Z key)

	TL note regarding controls:
		* Z key refers to the default Select action
		* X key refers to the default Cancel action (except regarding Run, which is the System state)
		* C key refers to the default Option action (e.g. the action that you check units' inventories with)
	So everything still works on controllers, and controls will reflect any remappings in game.ini.
	The plugin author refers to them as Z, X and C, but this explains what is meant by those.

	If you know your way around the InputControl object in singleton-inputcontrol.js, you can customize the walk map controls 
	inside the new InputWrapper object, made by Repeat.

■ Mouse Controls
	Move: Left-click on a tile in the vertical and horizontal directions of the target unit to move in that direction.
	Check operation: When left-clicking a cell other than moving with the mouse, check the location where the unit is and the 
		direction in which it is facing.
	Right-click: Show map commands
	Scroll wheel down: Switch the lead unit (when switching, the unit stands neutrally)
		* The lead unit switches as fast as you can spin the wheel. Which is fun, but be sure to be precise about it.
		(TL note: some paraphrasing on my part^)

■ Customization
	1. I want to turn to face the other person during a conversation (requires UnitDirectionControl.js if true)
		→ Set isTalkFaceToFace = true.

	2. I want to change the sound effect when switching the lead unit (I want to use a different RTP sound effect)
		→ Change the value of use_ChgSE_ID settings to a different RTP sound effect ID (default value is 11).
		(If set to -1, no sound effect will play when switching characters)
		
	** IMPORTANT TL NOTE: to see IDs in SRPG Studio, go to Tools → Options → Data and check "Display id next to data name"

	2b I want to change the sound effect when switching the lead unit (I want to make it my own sound effect)
		* Add your own sound effect in Resources → Media → Sound, click Add 
			(TL note: file needs to be in <project path>/Audio/sound)
		→ Set isRTP_ChgSE to false.
		Then change the value of use_ChgSE_ID settings to the ID of your imported sound effect's ID.

	3. I want to change the spot "Stock" (TL note: Convoy, Storage, etc.) is in the map command menu.
		→ Change the value of MapStockCommandIndex to a number of 1 or more.
			Default value is 0, meaning it'll be displayed at the bottom of the list of map commands.
			If the value is 1 or more, it'll be displayed starting from the top (e.g. 1 is top, 2 is second from top, etc.).
			If the value is -1, the Convoy command will be hidden.
		* Other plugins could modify this value and cause strange results. Please exercise caution.

	3b I want to display "Manage Units" instead of "Stock" in the map command.
		→ Change the value of MapUnitMarshalIndex to a value of 0 or more (default is -1).
			If the value is 0, it'll be displayed at the bottom of the list of map commands.
			If the value is 1 or more, it'll be displayed starting from the top (e.g. 1 is top, 2 is second from top, etc.).
			If it is -1, "Manage Units" command will be hidden.
			Note: if both MapStockCommandIndex and MapUnitMarshalIndex are set to 0 or higher, both commands will display. 
				The plugin author recommends only one be displayed, for some reason.
		* Other plugins could modify this value and cause strange results. Please exercise caution.

	4. I want to change the movement speed when walking
		→ Change MoveSpeed to 0, 1, 2, or 3.
		0 is the fastest, 2 is the default, and 3 is the slowest.
			0: super fast [16 pixels twice]
			1: fast [8 pixels four times]
			2: normal [4 pixels eight times]
			3: slow [2 pixels sixteen times]
		Addition by Repeat: As described above, this can be set in a map's custom parameters too.
		Please keep the values from 0 to 3.

	5a I don't want to detect certain place event types when I'm standing on them
		→ If the following settings are true, set it to false (on the contrary, if you do not want to detect it, set it to false)
			isSearchTalk		Detects talk events underfoot
			isSearchCustom		Detects custom events underfoot
			isSearchTreasure	Detects treasure chests underfoot 
				(TL note: fixed a typo, 'isSearchTresure' → 'isSearchTreasure')
			isSearchVillage		Detects village events underfoot
			isSearchShop		Detects shops underfoot
			isSearchGate		Detects doors underfoot
			isSearchInfo		Detects Info-type events underfoot

	5b I don't want to detect certain place event types when I'm adjacent to them
		→ If the following items in the settings are true, set it to false (on the contrary, if you do not want to detect it, set it to false)
			isSearchTalkDir			Detects conversation events at the destination
			isSearchCustomDir
			etc.
				(TL note: another typo fix, 'isSearchTresureDir' → 'isSearchTreasureDir')

	*If both 5a (underfoot event) and 5b (adjacent event) of an event type is false, it can't be triggered.
		e.g. if isSearchTalk and isSearchTalkDir are both false, you can't trigger Talk events whatsoever.

	6. I want to use mapchips that are 48x48 pixels big
		→ Set MapChipSize from 32 to 48.
		* Please note that the map chip size must be a multiple of 16, such as 48 and 64, to scroll properly.

	7. I want to always hide the unit window in the bottom left of the screen
		→ Set isWalkMapWindowDisp = false.

	8. I want to switch to silent mode with reduced automatic event checking
		→ Set isAutoEventSilent = true.
			(TL note: another typo fix, 'isAutoEventSilen' → 'isAutoEventSilent')
		It will be in silent mode where the automatic event is not checked after opening and closing the map command 
		or after auto cursor processing at the start of the turn. (Not in the wind ○ scene mode) (TL note: ??? wtf is this ???)
		* In this mode, all Auto Events with Start and End conditions will not be executed.

	** TL note: I don't understand this step very well so here's an alternate translation using DeepL:

	8. I want to use silent mode with less automatic event checking.
		→ Set isAutoEventSilent = true.
		After opening and closing map commands, or after processing the auto-cursor at the start of a turn, 
		the game will be in silent mode with no automatic event checking.
		(This is not Windy's "silent mode.")
		In this mode, all auto-start events with start and end conditions will not be executed.
			TL note: Windy might refer to another plugin creator?
				I'm not sure if the gist is that Auto Events of type Map Start/End (or even Start of Player/Enemy Phase?) 
				are prevented, or if it's Opening/Ending Events.

	9. I want to disable character switching with the C key
		→ Set canTargetChange = false.
		→ (Addition by Repeat) In Map Information → Custom Parameters, use custom parameter canTargetChange to enable or disable character switching for individual maps.
			Ex: {canTargetChange:true}

	10. (Addition by Repeat) I want to disable the ability to Run entirely
		→ Set cannotRun = true

    11. (Addition by Repeat) I want to hide the phase change graphic and sfx when I start a walk map.
		→ Set hidePhaseChangeEffect = true

	12. (Addition by Repeat) I want to Run using the SYSTEM key (X by default) instead of the  LSWITCH/RSWITCH keys (A and S by default).
		→ Set runWithSystem = true

■ Commands that can be used with Execute Script
	Event command: These commands can be used in Execute Script → Execute Code.

	WalkControl.findNextUnit();
		→ If the unit erased by erasing the unit is the unit being operated, the display is switched to the next unit.
			(Call this if you erased the unit that was dispatched by erasing the unit)
			* Event command: If you use location attention, the cursor position will shift, but
			Whether to pay attention to the location of the operation unit before it becomes operable
			Execute one of WalkControl.findNextUnit() (the cursor position will return to the operation unit)

	WalkControl.setFrontUnit(unitid);
		→ Sets the lead unit according to their unit ID in the database.
			(Nothing happens if the unit is dead, injured, carried in Fusion (Rescue/Capture), or isn't sortied)

	WalkControl.setFrontUnitByTable(page, id);
		→ Variable page: Sets the lead unit according to numbers held in variables in SRPG Studio.
			If you specify a variable with ID: 3 on variable page 1, it will be WalkControl.setFrontUnitByTable(1, 3);
			(Nothing happens if the unit is dead, injured, carried in Fusion (Rescue/Capture), or isn't sortied)
			TL note: this is useful if you want to set the lead unit dynamically, instead of hard-coding it

	WalkControl.recoverSortieUnit();
		→ Fully recovers all sortied units' HP, injury, and status, and disables wait/immortal/invisible/status guard.
			Also cancels active Fusion and Transformation on all units.
			TL note: Basically, this is a parent "recover" function, while the below are all specific ones that recover 
			one or multiple of the above.
				FYI, Wait/Immortal/Invisible/Status Guard are all enabled and disabled by the Change Unit State event command.

	WalkControl.recoverSortieUnitEx(HpRecover, StateRecover, InjuryRecover);
		→ Same as above, but allows you to specify whether to perform HP recovery, state recovery, or injury recovery.
			HpRecover: Do you want to recover HP?
			StateRecover: Do you want to recover the state?
			InjuryRecover: Do you want to recover from an injury?
			Pass true or false for each parameter as you wish.

		Examples:
		(Ex. 1) WalkControl.recoverSortieUnitEx(true, false, false);
			Only Wait/Immortal/Invisible/Status Guard disabling, Fusion/Transformation cancelling, and HP recovery are performed.
			(Injury recovery, all states will not be released)
		(Ex. 2) WalkControl.recoverSortieUnitEx(false, true, false);
			Only Wait/Immortal/Invisible/Status Guard disabling, Fusion/Transformation cancelling, and status recovery are performed.
			(HP recovery, injury recovery will not be performed)
		(Ex. 3) WalkControl.recoverSortieUnitEx(false, false, true);
			Only Wait/Immortal/Invisible/Status Guard disabling, Fusion/Transformation cancelling, and injury recovery are performed.
			(HP recovery, all states will not be released)
		(Silly example) WalkControl.recoverSortieUnitEx(true, true, true);
			If all are true, it behaves identically to WalkControl.recoverSortieUnit(), so just use that instead.

	WalkControl.recoverSortieUnitHp();
		→ Recovers the HP of the sortie unit.

	WalkControl.recoverSortieUnitInjury();
		→ Recovers any units that have been injured after sortie. Units that have recovered from injury will have 1 HP.

	WalkControl.recoverSortieState();
		→ All sortied units will have their status effects cleared.

	WalkControl.recoverSortieUnitState();
		→ All sortied units will have Wait/Immortal/Invisible/Status Guard states disabled.

	WalkControl.recoverSortieUnitFusionMetamorphoze();
		→ All sortied units will have Fusions and Transformations cancelled.

	WalkControl.invisibleWalkGroup();
		→ If map has walkGroup custom parameter, hides units besides the current lead unit.

	WalkControl.recoverDirection();
		→ Makes all sortied units face neutrally (normal idle stance).

	WalkControl.recoverWait();
		→ Cancels Wait states of sortied units.

	WalkControl.changePlayerTurnWalk(isWalkMap);
	※Please only use in Auto Events (ideally Map Start/Start of X Phase) and Place Events.
			(Since the process of "end of turn" is forcibly executed, it'd be strange if it were executed during battle etc.)
		→ Switch between normal and walking operation according to the value of isWalkMap.
			Switch to normal map (basically, turn off walking map): use 0 or false in place of isWalkMap.
			Switch to walking map: use 1 or true in place if isWalkMap.
			When switching, it proceed to the next player turn. The state of the unit remains the same.

TL note - This is just the machine translated update history, not worth scrutinizing
20/03/01 Newly created
20/03/02 Fixed so that the map command cannot be opened while moving (not directly above the map chip).
		  Added processing to turn the unit to the front when clearing the map
		  Changed the map command display process so that "stock" can be performed after inheriting the conventional map command.
		  Changed to maintain the facing direction when the key is released
		  Changed to check your feet first and then the direction you are facing when you press the Z key.
20/03/03 Supports mouse operation
		  Added a function that can be called from the outside
		  Fixed a bug that if the leader unit was sortie on the walking map, the coordinates would match the leader unit instead of the first unit and the coordinates would shift.
20/03/04 Support for changing map size
		  Fixed a mistake in the execution conditions of automatic events
		  Changed to update the cursor position when WalkControl.findNextUnit () is executed (the cursor can be returned after performing location attention)
		  Fixed missing conditions for scrolling
20/03/07 Added face window display ON / OFF setting at the bottom left
		  Added automatic event check after wait event check process
20/03/07b Added silent mode (not the wind ○ scene mode because the spelling is different)
20/03/07c Changed silent mode not to run auto-start events at map start, turn start, and turn end
20/03/08 Fixed a bug that an error may occur when changing the position of the stock command.
		  Fixed a logic mistake in the deletion process of the map command "End of Turn"
		  Corrected to issue a warning message because an error will occur if WalkControl.changePlayerTurnWalk () is performed immediately after the map starts.
20/03/08b Added display function for unit organization
20/03/15 Added super fast to the speed of movement (the setting value of the speed of movement has changed a little)
20/03/17 Added setting to disable character switching with c key
20/03/18 Compatible with fog production plug-in
20/03/19 Corrected because there was an error in the combined processing with the fog production plug-in
20/03/31 Fixed a bug that an error occurs when transitioning to a base in combination with a fog production plug-in.
20/05/05 Fixed that the cursor was shifted if you did not pay attention to the operation unit after using the place attention event.
20/05/09 WalkControl.changePlayerTurnWalk (isWalkMap) has multiple execution events, and if multiple execution conditions are satisfied at the same time and a message is displayed in the second and subsequent events, it will be strange.
20/06/01 Added settings for detecting events at your feet and destinations other than treasure chests
20/06/02 Corrected the position of attention to be near the center of the square when paying attention to the location on the walking map.
20/06/16 Fixed a bug that an error occurs when a conversation event is held at a base.
20/09/12 When the walking map starts without the battle preparation screen, the position where the place was focused in the OP event and the position immediately after the start of the map are slightly different.
20/09/13 01 map chip display on top Supports use with .js (01 map chip display on walking map works on top)
20/10/13 Fixed a mistake in the description of the conditional statement in the MapCursorByUnit.drawCursor function.
20/10/18 Event command: Fixed the case where an error occurs when using scene change
20/10/20 Fixed a bug where WalkControl.recoverSortieUnit(), WalkControl.recoverSortieUnitHp() and WalkControl.recoverSortieUnitInjury() were not working for injured units.
20/10/21 Fixed a bug that unsorted friends can check the status screen etc. when displaying unit organization in the map command of the walking map.
20/10/23 Added WalkControl.recoverSortieUnitEx().
		  When HP is reduced, HP recovery items can be used on the walking map (tools only, wands not allowed).
20/12/12 Fixed the unit switching judgment in MapEditByUnit._moveCursorMove because there was a delay in scrolling.
20/12/13 Fixed error when calling WalkControl.setFrontUnit() immediately after opening or starting map
20/12/24 Corresponds to the case where the conversation from the active unit to the target does not work well on the walking map
21/01/16 Supports interruption and resumption by official system-interruption.js
21/05/08 1.228 compatible
21/06/27 1.235 compatible

■ Supported version
SRPG Studio Version: 1.235

■ Terms
・ Use is limited to games using SRPG Studio.
・ It does not matter whether it is commercial or non-commercial. It's free.
-There is no problem with processing. Please remodel more and more.
・ No credit specified OK
・ Redistribution and reprint OK
・ Please comply with the SRPG Studio Terms of Service.

■ Repeat's modifications
8/23/2021 Added InputWrapper, Run feature, currentMapMoveSpeed map custom parameter, WalkControl.setFrontUnitByTable() bugfix
11/9/2022 Added ability to hide phase change visuals and sfx

--------------------------------------------------------------------------*/


//-------------------------------------------------------
// Settings
//-------------------------------------------------------
var MapChipSize = 32;				// Map chip size (32 by default)
var isWalkMapWindowDisp = true;		// Whether to display the face window at the bottom left of the walking map
var canTargetChange = false;	// If true, player can switch units by pressing C

(function () {

	//-------------------------------------------------------
	// Config
	//-------------------------------------------------------
	var isTalkFaceToFace = false;	// Whether to face the other party during conversation 
	// * If true, UnitDirectionControl.js is required

	var isRTP_ChgSE = true;			// Use RTP SFX when switching units with C? (false=original instead of RTP)
	var use_ChgSE_ID = 11;			// ID of sound effect to use（default: 11, RTP "Use Item" sound）

	var MapStockCommandIndex = 1;	// Stock command position (0: bottom, value of 1 or more: value from top)
	// * If -1, the stock command won't show.
	var MapUnitMarshalIndex = -1;	// Position of unit rearrangement (0: bottom, value of 1 or more: value from top) 
	// * If it is -1, unit rearrangement will not be issued

	var MoveSpeed = 3;				// Default speed ​​of movement, from 0 to 3 (3 is slowest)
	var cannotRun = false;			// If true, Running is disabled completely.
	var runWithSystem = false;		// If true, Run is executed by holding the SYSTEM key instead of one of the the LSWITCH/RSWITCH keys

	/* Place Events section */
	var isSearchTalk = false;		// Detect Talk Events on the tile you're standing on?
	var isSearchCustom = true;		// Detect Custom Events on the tile you're standing on?
	var isSearchTreasure = true;	// Detect Chest Events on the tile you're standing on?
	var isSearchVillage = true;		// Detect Village Events on the tile you're standing on?
	var isSearchShop = true;		// Detect Shop Events on the tile you're standing on?
	var isSearchGate = false;		// Detect Door Events on the tile you're standing on?
	var isSearchInfo = true;		// Detect Info Events on the tile you're standing on?

	var isSearchTalkDir = true;		// Detect Talk Events on the tile you're facing?
	var isSearchCustomDir = true;	// Detect Custom Events on the tile you're facing?
	var isSearchTreasureDir = true;	// Detect Chest Events on the tile you're facing?
	var isSearchVillageDir = false;	// Detect Village Events on the tile you're facing?
	var isSearchShopDir = true;		// Detect Shop Events on the tile you're facing?
	var isSearchGateDir = true;		// Detect Door Events on the tile you're facing?
	var isSearchInfoDir = true;		// Detect Info Events on the tile you're facing?
	/* End Place Events section */

	var isAutoEventSilent = false;	// Silent mode. Whether to reduce the automatic event check of the walking map (true: reduce false: normal)

	var isScrollBGOnlyWalk = true;	// Whether to consider map scrolling in fog display
	// * true: consider only walking map
	// * false: consider both walking and normal maps

	// Program settings

	// Definition of movement speed (used internally)
	var MoveFastest = 0;		// Super fast
	var MoveFast = 1;			// Fast
	var MoveNormal = 2;			// Normal
	var MoveSlow = 3;			// Slow

	// Walking group
	var WalkGroup = {
		ALONE: 0,		// Everyone has a spot on the map, pressing C jumps to controlling them from their spot
		GROUP: 1		// Shows only one character. Pressing C switches them on the spot (think Special Flag from Vesperia)
	}

	var isMovingSound = false;	// Play footsteps when moving? (If set to true, it's noisy.)
	var isUseTurnEnd = false;	// Is the end-of-turn command issued? (For debug, be careful with this)
	var hidePhaseChangeEffect = true; // Will not say "Player Phase" at the start of every walk map

	// Addition by Repeat - helper function to check if Cycle Idle Units (A/S key by default) is being held
	// Different from isLeft/RightPadAction because it excludes the scroll wheel, which cannot be "held"
	InputControl.isCycleState = function () {
		return root.isInputState(InputType.BTN5) || root.isInputState(InputType.BTN6);
	}

	/**
	 * InputWrapper class
	 * By Repeat.
	 * This class wraps all walk-map-related user input into easily readable (and more importantly, editable) functions.
	 * Might also wrap mouse controls in here too later on too
	 */
	var InputWrapper = defineObject(BaseObject, {
		isSelectAction: function () {
			return InputControl.isSelectAction();
		},

		isMapCommandAction: function () {
			return InputControl.isCancelAction();
		},

		isUnitSwitchAction: function () {
			return (InputControl.isOptionAction() || MouseControl.isInputAction(MouseType.DOWNWHEEL));
		},

		isRunState: function () {
			var mapInfo = root.getCurrentSession().getCurrentMapInfo();

			if (cannotRun || mapInfo.custom.cannotRun) {
				return false;
			}

			var running = runWithSystem ?
				InputControl.isSystemState() :
				InputControl.isCycleState();

			// invert result if autorun is on
			if (!ConfigItem.Autorun.isDisabled()) {
				running = !running;
			}

			return running;
		},

		getMovementSpeed: function () {
			var speed = MoveSpeed;

			var mapInfo = root.getCurrentSession().getCurrentMapInfo();
			if (typeof mapInfo.custom.currentMapMoveSpeed === 'number') {
				speed = mapInfo.custom.currentMapMoveSpeed;
			}
			return speed;
		}
	})

	// Addition by Repeat - don't show phase change graphic on walk maps
	var changePhaseAlias = TurnMarkFlowEntry._getTurnFrame;
	TurnMarkFlowEntry._getTurnFrame = function () {
		var pic = changePhaseAlias.call(this);
		if (WalkControl.isWalkMap() && hidePhaseChangeEffect) {
			pic = null;
		}

		return pic;
	}

    // Addition by Repeat.
	// This change prevents the 36-frame "pause" at the start of the map and silences the phase change SFX in walk maps.
	// Note that this is only aliased if hidePhaseChangeEffect is false. It could be rewritten to still remove the "pause" and 
	// be aliased, but the phase change SFX would have to play, which I think is unsightly.
    var changePhaseSfxAlias = TurnMarkFlowEntry._completeMemberData;
	TurnMarkFlowEntry._completeMemberData = function (turnChange) {
        if (!hidePhaseChangeEffect) {
            return changePhaseSfxAlias.call(this, turnChange);
        }

		if (!this._isTurnGraphicsDisplayable()) {
			this.doMainAction(false);
			return EnterResult.NOTENTER;
		}

		if (!(WalkControl.isWalkMap())) {
			this._counter.disableGameAcceleration();
			this._counter.setCounterInfo(36);
			this._playTurnChangeSound();
		}

		return EnterResult.OK;
	}

	//-------------------------------------------
	// ScriptExecuteEventCommand class
	//-------------------------------------------
	// The event that called WalkControl.changePlayerTurnWalk() is duplicated, 
	// and if the message is displayed in the second and subsequent events,
	// is the code execution of WalkControl.changePlayerTurnWalk() treated as an event command call? Seems like??
	// TL note this is pretty much a direct translation lmao
	var alias_ScriptExecuteEventCommand_moveEventCommandCycle = ScriptExecuteEventCommand.moveEventCommandCycle;
	ScriptExecuteEventCommand.moveEventCommandCycle = function () {
		if (this._activeEventCommand === null) {
			return MoveResult.END;
		}

		return alias_ScriptExecuteEventCommand_moveEventCommandCycle.call(this);
	}

	var alias_ScriptExecuteEventCommand_drawEventCommandCycle = ScriptExecuteEventCommand.drawEventCommandCycle;
	ScriptExecuteEventCommand.drawEventCommandCycle = function () {
		if (this._activeEventCommand === null) {
			return;
		}

		alias_ScriptExecuteEventCommand_drawEventCommandCycle.call(this);
	}

	var alias_ScriptExecuteEventCommand_isEventCommandSkipAllowed = ScriptExecuteEventCommand.isEventCommandSkipAllowed;
	ScriptExecuteEventCommand.isEventCommandSkipAllowed = function () {
		if (this._activeEventCommand === null) {
			return false;
		}

		return alias_ScriptExecuteEventCommand_isEventCommandSkipAllowed.call(this);
	}




	//-------------------------------------------
	// LoadSaveScreen class
	//-------------------------------------------
	// Create custom data for saving when saving
	var alias_LoadSaveScreen_getCustomObject = LoadSaveScreen._getCustomObject;
	LoadSaveScreen._getCustomObject = function () {
		var obj = alias_LoadSaveScreen_getCustomObject.call(this);

		// Create saved data
		obj.walkControlObject_ = WalkControl.createDataObject();

		return obj;
	}


	// Load
	var alias_LoadSaveScreen_executeLoad = LoadSaveScreen._executeLoad;
	LoadSaveScreen._executeLoad = function () {
		var object = this._scrollbar.getObject();
		var walkControlObject_ = object.custom.walkControlObject_;

		// If there is original data in the load file, read it
		if (typeof walkControlObject_ !== 'undefined') {
			// Update data
			WalkControl.updateDataObject(walkControlObject_);
		}

		alias_LoadSaveScreen_executeLoad.call(this);
	}




	//-------------------------------------------
	// TitleCommand Class
	//-------------------------------------------
	// Initialize WalkControl class if "From the beginning" is selected in the title
	var alias_TitleCommand_NewGame_createSubObject = TitleCommand.NewGame._createSubObject;
	TitleCommand.NewGame._createSubObject = function () {
		alias_TitleCommand_NewGame_createSubObject.call(this);

		// Initialize WalkControl class
		WalkControl.resetData();
	}




	//-------------------------------------------
	// Suspend save related
	//-------------------------------------------
	// Suspend
	// TL note, this is to account for a separate plugin entirely, nice foresight dude
	if (typeof MapCommand.Interruption !== 'undefined') {
		var alias_MapCommand_Interruption_getCustomObject = MapCommand.Interruption._getCustomObject;
		MapCommand.Interruption._getCustomObject = function () {
			var obj = alias_MapCommand_Interruption_getCustomObject.call(this);

			// 保存データを作成
			obj.walkControlObject_ = WalkControl.createDataObject();

			return obj;
		}
	}


	// Load from Suspend save
	if (typeof TitleCommand.Interruption !== 'undefined') {
		var alias_TitleCommand_Interruption_openCommand = TitleCommand.Interruption.openCommand;
		TitleCommand.Interruption.openCommand = function () {
			var saveFileInfo = root.getLoadSaveManager().getInterruptionFileInfo();
			var walkControlObject_ = saveFileInfo.custom.walkControlObject_;

			// If there is original data in the load file, read it
			if (typeof walkControlObject_ !== 'undefined') {
				// Update data
				WalkControl.updateDataObject(walkControlObject_);
			}

			alias_TitleCommand_Interruption_openCommand.call(this);
		}
	}




	//-------------------------------------------
	// FreeAreaScene class
	//-------------------------------------------
	FreeAreaMode.TURNENDBYUNIT = 999;

	var alias_FreeAreaScene_moveSceneCycle = FreeAreaScene.moveSceneCycle;
	FreeAreaScene.moveSceneCycle = function () {
		var result = alias_FreeAreaScene_moveSceneCycle.call(this);

		var mode = this.getCycleMode();

		if (mode === FreeAreaMode.TURNENDBYUNIT) {
			result = this._moveTurnEndByUnit();
		}

		return result;
	}


	FreeAreaScene._moveTurnEndByUnit = function () {
		if (this._turnChangeEnd.moveTurnChangeCycle() !== MoveResult.CONTINUE) {
			root.getCurrentSession().setTurnType(TurnType.PLAYER);
			this._processMode(FreeAreaMode.TURNSTART);
		}

		return MoveResult.CONTINUE;
	}


	var alias_FreeAreaScene_prepareSceneMemberData = FreeAreaScene._prepareSceneMemberData;
	FreeAreaScene._prepareSceneMemberData = function () {
		alias_FreeAreaScene_prepareSceneMemberData.call(this);

		this._playerTurnObject = createObject(WrapPlayerTurn);		// Replaced with new wrapper class instead of PlayerTurn
		this._playerTurnObject.setupUsePlayerTurn();
	}


	var alias_FreeAreaScene_processMode = FreeAreaScene._processMode;
	FreeAreaScene._processMode = function (mode) {
		alias_FreeAreaScene_processMode.call(this, mode);

		if (mode === FreeAreaMode.TURNENDBYUNIT) {
			if (this._turnChangeEnd.enterTurnChangeCycle() === EnterResult.NOTENTER) {
				root.getCurrentSession().setTurnType(TurnType.PLAYER);
				this._processMode(FreeAreaMode.TURNSTART);
			}
			else {
				this.changeCycleMode(mode);
			}
		}
		else if (mode === FreeAreaMode.MAIN) {
			if (WalkControl.isSetUnitId()) {
				this._playerTurnObject.setFrontUnit(WalkControl.getUnitId());
				WalkControl.resetUnitId();
			}
		}
	}


	FreeAreaScene.turnEndByUnit = function (isWalkMap) {
		this._processMode(FreeAreaMode.TURNENDBYUNIT);
	}




	//-------------------------------------------
	// BattleSetupScene class
	//-------------------------------------------
	var alias_BattleSetupScene_completeSceneMemberData = BattleSetupScene._completeSceneMemberData;
	BattleSetupScene._completeSceneMemberData = function () {
		alias_BattleSetupScene_completeSceneMemberData.call(this);

		var mapInfo = root.getCurrentSession().getCurrentMapInfo();
		var isWalkMap = mapInfo.custom.isWalkMap;
		var walkGroup = WalkGroup.ALONE;

		WalkControl.setMapId(mapInfo.getId());

		if (typeof isWalkMap === 'number' && isWalkMap === 1) {
			WalkControl.setWalkMap(true);
		}
		else {
			WalkControl.setWalkMap(false);
		}

		if (typeof mapInfo.custom.walkGroup === 'number') {
			walkGroup = mapInfo.custom.walkGroup;
		}

		WalkControl.setWalkGroup(walkGroup);
	}




	//-------------------------------------------
	// BattleResultScene class
	//-------------------------------------------
	var alias_BattleResultScene_completeSceneMemberData = BattleResultScene._completeSceneMemberData;
	BattleResultScene._completeSceneMemberData = function () {
		alias_BattleResultScene_completeSceneMemberData.call(this);

		var unit, list, count, i;

		list = PlayerList.getMainList();
		count = list.getCount();

		// Make unit face forward
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			if (unit === null) {
				continue;
			}

			unit.setDirection(DirectionType.NULL);
		}
	}


	var alias_BattleResultScene_drawSceneCycle = BattleResultScene.drawSceneCycle;
	BattleResultScene.drawSceneCycle = function () {
		// In the case of walking map, turn off the movement range display of the unit
		if (WalkControl.isWalkMap() == true) {
			MapLayer.drawUnitLayerByUnit();

			this._straightFlow.drawStraightFlow();
		}
		// Otherwise, business as usual
		else {
			alias_BattleResultScene_drawSceneCycle.call(this);
		}
	}




	//-------------------------------------------
	// BaseTurnChange class
	//-------------------------------------------
	var alias_BaseTurnChange_enterEvent = BaseTurnChange._enterEvent;
	BaseTurnChange._enterEvent = function () {
		// In silent mode, auto-start events at map start, turn start, and turn end are not executed
		// (Condition: If start and end are set, it will not be executed in silent mode)
		if (isAutoEventSilent) {
			return EnterResult.NOTENTER;
		}

		return alias_BaseTurnChange_enterEvent.call(this);
	}




	//-------------------------------------------
	// PlaceEventWrapper class
	//-------------------------------------------
	// A wrapper class for a place event when walking (a system to check with the Z key)
	var PlaceEventWrapper = defineObject(BaseObject,
		{
			_groupArray: null,
			_groupArrayDir: null,
			_currentTarget: null,
			_eventOrner: null,
			_posX: -1,
			_posY: -1,

			initialize: function () {
				this._groupArray = [];
				this.configureCommands(this._groupArray);
				this._groupArrayDir = [];
				this.configureCommandsDir(this._groupArrayDir);
				this.rebuildCommand();
			},

			// When event starts
			openEvent: function () {
				// Returns false if there are no retained events
				if (this._eventOrner == null) {
					return false;
				}

				// If there is a retained event, open it and return true
				this._eventOrner.openEvent();

				return true;
			},

			// Conducting a place event
			moveEvent: function () {
				var result = MoveResult.END;

				if (this._eventOrner != null) {
					result = this._eventOrner.moveEvent();
					if (result !== MoveResult.CONTINUE) {
						this._eventOrner = null;
						this.resetSearchPos();
					}
				}

				return result;
			},

			drawEvent: function () {
				this._eventOrner.drawEvent();
			},

			// Command rebuilding process (currently implemented only at initialization)
			rebuildCommand: function () {
				var i, count;

				count = this._groupArray.length;
				for (i = 0; i < count; i++) {
					this._groupArray[i]._listManager = this;	// Set PlaceEventWrapper for each place event
				}

				count = this._groupArrayDir.length;
				for (i = 0; i < count; i++) {
					this._groupArrayDir[i]._listManager = this;	// Set PlaceEventWrapper for each place event
				}
			},

			// Location event detection
			isFindEvent: function () {
				var i, count;

				this._eventOrner = null;

				count = this._groupArray.length;
				for (i = 0; i < count; i++) {
					// If the location event can be displayed, hold it in this._eventOrner and return true
					if (this._groupArray[i].isEventDisplayable()) {
						this._eventOrner = this._groupArray[i];
						return true;
					}
				}

				// Returns false if there is no visible location event
				return false;
			},

			// Detecting location events in the direction you are facing
			isFindEventDir: function () {
				var i, count;

				this._eventOrner = null;

				count = this._groupArrayDir.length;
				for (i = 0; i < count; i++) {
					// If the location event can be displayed, hold it in this._eventOrner and return true
					if (this._groupArrayDir[i].isEventDisplayable()) {
						this._eventOrner = this._groupArrayDir[i];
						return true;
					}
				}

				// Returns false if there is no visible location event
				return false;
			},

			setListCommandUnit: function (unit) {
				this._currentTarget = unit;
			},

			getListCommandUnit: function () {
				return this._currentTarget;
			},

			setSearchPos: function (x, y) {
				this._posX = x;
				this._posY = y;
			},

			resetSearchPos: function () {
				this._posX = -1;
				this._posY = -1;
			},

			getSearchPos: function () {
				return createPos(this._posX, this._posY);
			},

			// Registration of place event group (for underfoot events)
			configureCommands: function (groupArray) {
				if (isSearchTalk) {
					groupArray.appendObject(PlaceEventByUnit.Talk);
				}
				if (isSearchCustom) {
					groupArray.appendObject(PlaceEventByUnit.PlaceCommand);
				}
				if (isSearchTreasure) {
					groupArray.appendObject(PlaceEventByUnit.Treasure);
				}
				if (isSearchVillage) {
					groupArray.appendObject(PlaceEventByUnit.Village);
				}
				if (isSearchShop) {
					groupArray.appendObject(PlaceEventByUnit.Shop);
				}
				if (isSearchGate) {
					groupArray.appendObject(PlaceEventByUnit.Gate);
				}
				if (isSearchInfo) {
					groupArray.appendObject(PlaceEventByUnit.Information);
				}
			},

			// Registration of place event group (for adjacent events)
			configureCommandsDir: function (groupArray) {
				if (isSearchTalkDir) {
					groupArray.appendObject(PlaceEventByUnit.Talk);
				}
				if (isSearchCustomDir) {
					groupArray.appendObject(PlaceEventByUnit.PlaceCommand);
				}
				if (isSearchTreasureDir) {
					groupArray.appendObject(PlaceEventByUnit.Treasure);
				}
				if (isSearchVillageDir) {
					groupArray.appendObject(PlaceEventByUnit.Village);
				}
				if (isSearchShopDir) {
					groupArray.appendObject(PlaceEventByUnit.Shop);
				}
				if (isSearchGateDir) {
					groupArray.appendObject(PlaceEventByUnit.Gate);
				}
				if (isSearchInfoDir) {
					groupArray.appendObject(PlaceEventByUnit.Information);
				}
			}
		}
	);




	//-------------------------------------------
	// BasePlaceEventByUnit class
	//-------------------------------------------
	// Basic class of place events
	var BasePlaceEventByUnit = defineObject(BaseObject,
		{
			_listManager: null,

			initialize: function () {
			},

			openEvent: function () {
			},

			moveEvent: function () {
				return MoveResult.END;
			},

			drawEvent: function () {
			},

			isEventDisplayable: function () {
				return false;
			},

			getCommandTarget: function () {
				return this._listManager.getListCommandUnit();
			},

			endCommandAction: function () {
			},

			getSearchPos: function () {
				return this._listManager.getSearchPos();
			},

			_getEventType: function () {
				return PlaceEventType.WAIT;
			},

			_getPlaceEventFromPos: function (type, x, y) {
				return PosChecker.getPlaceEventFromPos(type, x, y);
			},

			_getEvent: function () {
				if (this._getEventType() === PlaceEventType.WAIT) {
					return null;
				}

				var pos = this.getSearchPos();
				if (pos.x === -1 || pos.y === -1) {
					return null;
				}

				return this._getPlaceEventFromPos(this._getEventType(), pos.x, pos.y);
			}
		}
	);


	//-------------------------------------------
	// The following is a group of place events
	//-------------------------------------------
	var PlaceEventByUnit = {};


	//-------------------------------------------
	// Location event: Info
	//-------------------------------------------
	PlaceEventByUnit.Information = defineObject(BasePlaceEventByUnit,
		{
			_capsuleEvent: null,

			openEvent: function () {
				this._prepareCommandMemberData();
				this._completeCommandMemberData();
			},

			moveEvent: function () {
				var result = MoveResult.CONTINUE;

				if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
					this.endCommandAction();
					return MoveResult.END;
				}

				return result;
			},

			isEventDisplayable: function () {
				var event = this._getEvent();

				return event !== null && event.isEvent();
			},

			_prepareCommandMemberData: function () {
				this._capsuleEvent = createObject(CapsuleEvent);
			},

			_completeCommandMemberData: function () {
				var event = this._getEvent();

				// Specify false so that it will not be executed
				this._capsuleEvent.enterCapsuleEvent(event, false);
			},

			_getEventType: function () {
				return PlaceEventType.INFORMATION;
			}
		}
	);


	//-------------------------------------------
	// Location event: Village
	//-------------------------------------------
	PlaceEventByUnit.Village = defineObject(BasePlaceEventByUnit,
		{
			_eventTrophy: null,

			openEvent: function () {
				this._prepareCommandMemberData();
				this._completeCommandMemberData();
			},

			moveEvent: function () {
				var mode = this.getCycleMode();
				var result = MoveResult.CONTINUE;

				if (this._eventTrophy.moveEventTrophyCycle() !== MoveResult.CONTINUE) {
					this.endCommandAction();
					return MoveResult.END;
				}

				return result;
			},

			drawEvent: function () {
				this._eventTrophy.drawEventTrophyCycle();
			},

			isEventDisplayable: function () {
				var event = this._getEvent();

				return event !== null && event.getExecutedMark() === EventExecutedType.FREE && event.isEvent();
			},

			_prepareCommandMemberData: function () {
				this._eventTrophy = createObject(EventTrophy);
			},

			_completeCommandMemberData: function () {
				var event = this._getEvent();

				this._eventTrophy.enterEventTrophyCycle(this.getCommandTarget(), event);
			},

			_getEventType: function () {
				return PlaceEventType.VILLAGE;
			}
		}
	);


	//-------------------------------------------
	// Location event: Shop
	//-------------------------------------------
	var ShopCommandByUnitMode = {
		EVENT: 0,
		SCREEN: 1
	};

	PlaceEventByUnit.Shop = defineObject(BasePlaceEventByUnit,
		{
			_capsuleEvent: null,
			_shopLayoutScreen: null,

			openEvent: function () {
				this._prepareCommandMemberData();
				this._completeCommandMemberData();
			},

			moveEvent: function () {
				var mode = this.getCycleMode();
				var result = MoveResult.CONTINUE;

				if (mode === ShopCommandByUnitMode.EVENT) {
					result = this._moveTop();
				}
				else if (mode === ShopCommandByUnitMode.SCREEN) {
					result = this._moveScreen();
				}

				return result;
			},

			isEventDisplayable: function () {
				var event = this._getEvent();

				return event !== null && event.isEvent() && Miscellaneous.isItemAccess(this.getCommandTarget());
			},

			_prepareCommandMemberData: function () {
				this._capsuleEvent = createObject(CapsuleEvent);
			},

			_completeCommandMemberData: function () {
				var event = this._getEvent();

				this._capsuleEvent.enterCapsuleEvent(event, false);
				this.changeCycleMode(ShopCommandByUnitMode.EVENT);
			},

			_moveTop: function () {
				var screenParam;
				var event = this._getEvent();

				if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
					screenParam = this._createScreenParam();
					if (typeof event.custom.Durability === 'number' && typeof DurabilityShopLayoutScreen !== 'undefined') {
						this._shopLayoutScreen = createObject(DurabilityShopLayoutScreen);
					}
					else {
						this._shopLayoutScreen = createObject(ShopLayoutScreen);
					}
					this._shopLayoutScreen.setScreenInteropData(screenParam.shopLayout.getShopInteropData());
					SceneManager.addScreen(this._shopLayoutScreen, screenParam);

					this.changeCycleMode(ShopCommandByUnitMode.SCREEN);
				}

				return MoveResult.CONTINUE;
			},

			_moveScreen: function () {
				if (SceneManager.isScreenClosed(this._shopLayoutScreen)) {
					if (this._shopLayoutScreen.getScreenResult() === ShopLayoutResult.ACTION) {
						this.endCommandAction();
					}

					return MoveResult.END;
				}

				return MoveResult.CONTINUE;
			},

			_getEventType: function () {
				return PlaceEventType.SHOP;
			},

			_createScreenParam: function () {
				var screenParam = ScreenBuilder.buildShopLayout();
				var shopData = this._getEvent().getPlaceEventInfo().getShopData();

				screenParam.unit = this.getCommandTarget();
				screenParam.itemArray = shopData.getShopItemArray();
				screenParam.inventoryArray = shopData.getInventoryNumberArray();
				screenParam.shopLayout = shopData.getShopLayout();

				return screenParam;
			}
		}
	);


	//-------------------------------------------
	// Location event: Door
	//-------------------------------------------
	PlaceEventByUnit.Gate = defineObject(BasePlaceEventByUnit,
		{
			_keyData: null,
			_keyNavigator: null,

			openEvent: function () {
				this._prepareCommandMemberData();
				this._completeCommandMemberData();
			},

			moveEvent: function () {
				if (this._keyNavigator.moveKeyNavigator() !== MoveResult.CONTINUE) {
					if (this._keyNavigator.isUsed()) {
						this.endCommandAction();
					}
					return MoveResult.END;
				}

				return MoveResult.CONTINUE;
			},

			drawEvent: function () {
				this._keyNavigator.drawKeyNavigator();
			},

			isEventDisplayable: function () {
				var skill, item, pos, event;
				var requireFlag = KeyFlag.GATE;
				var unit = this.getCommandTarget();

				this._keyData = null;

				skill = SkillControl.getPossessionSkill(unit, SkillType.PICKING);
				if (skill !== null) {
					this._keyData = KeyEventChecker.buildKeyDataSkill(skill, requireFlag);
				}

				if (this._keyData === null) {
					item = ItemControl.getKeyItem(unit, requireFlag);
					if (item !== null) {
						this._keyData = KeyEventChecker.buildKeyDataItem(item, requireFlag);
					}
				}

				if (this._keyData === null) {
					return false;
				}

				pos = this.getSearchPos();
				event = KeyEventChecker.getKeyEvent(pos.x, pos.y, this._keyData);

				return event !== null && event.isEvent() && event.getExecutedMark() === EventExecutedType.FREE;
			},

			_prepareCommandMemberData: function () {
				this._keyNavigator = createObject(KeyNavigatorByUnit);
			},

			_completeCommandMemberData: function () {
				var pos = this.getSearchPos();
				this._keyNavigator.openKeyNavigatorByUnit(this.getCommandTarget(), this._keyData, pos.x, pos.y);
			}
		}
	);


	//-------------------------------------------
	// Location event: Chest
	//-------------------------------------------
	PlaceEventByUnit.Treasure = defineObject(BasePlaceEventByUnit,
		{
			_keyData: null,
			_keyNavigator: null,

			openEvent: function () {
				this._prepareCommandMemberData();
				this._completeCommandMemberData();
			},

			moveEvent: function () {
				if (this._keyNavigator.moveKeyNavigator() !== MoveResult.CONTINUE) {
					if (this._keyNavigator.isUsed()) {
						this.endCommandAction();
					}
					return MoveResult.END;
				}

				return MoveResult.CONTINUE;
			},

			drawEvent: function () {
				this._keyNavigator.drawKeyNavigator();
			},

			isEventDisplayable: function () {
				var skill, item, pos, event;
				var requireFlag = KeyFlag.TREASURE;
				var unit = this.getCommandTarget();

				this._keyData = null;

				if (!DataConfig.isTreasureKeyEnabled()) {
					this._keyData = KeyEventChecker.buildKeyDataDefault();
				}

				if (this._keyData === null) {
					skill = SkillControl.getPossessionSkill(unit, SkillType.PICKING);
					if (skill !== null) {
						this._keyData = KeyEventChecker.buildKeyDataSkill(skill, requireFlag);
					}
				}

				if (this._keyData === null) {
					item = ItemControl.getKeyItem(unit, requireFlag);
					if (item !== null) {
						this._keyData = KeyEventChecker.buildKeyDataItem(item, requireFlag);
					}
				}

				if (this._keyData === null) {
					return false;
				}

				pos = this.getSearchPos();
				event = KeyEventChecker.getKeyEvent(pos.x, pos.y, this._keyData);

				return event !== null && event.isEvent() && event.getExecutedMark() === EventExecutedType.FREE;
			},

			_prepareCommandMemberData: function () {
				this._keyNavigator = createObject(KeyNavigatorByUnit);
			},

			_completeCommandMemberData: function () {
				var pos = this.getSearchPos();
				this._keyNavigator.openKeyNavigatorByUnit(this.getCommandTarget(), this._keyData, pos.x, pos.y);
			}
		}
	);


	//--------------------------
	// KeyNavigatorByUnit Class 
	//--------------------------
	// Detects matching key. Used for doors and treasure chests.
	var KeyNavigatorByUnit = defineObject(KeyNavigator,
		{
			openKeyNavigatorByUnit: function (unit, keyData, x, y) {
				this._prepareMemberData(unit, keyData);
				this._completeMemberDataByUnit(unit, keyData, x, y);
			},

			_completeMemberDataByUnit: function (unit, keyData, x, y) {
				this._straightFlow.setStraightFlowData(this);
				this._pushFlowEntries(this._straightFlow);

				this._isUsed = true;
				this._placeEvent = KeyEventChecker.getKeyEvent(x, y, keyData);
				this._straightFlow.enterStraightFlow();
				this.changeCycleMode(KeyNavigatorMode.FLOW);
			}
		}
	);


	//-------------------------------------------
	// Location event: Custom
	//-------------------------------------------
	PlaceEventByUnit.PlaceCommand = defineObject(BasePlaceEventByUnit,
		{
			_capsuleEvent: null,

			openEvent: function () {
				this._prepareCommandMemberData();
				this._completeCommandMemberData();
			},

			moveEvent: function () {
				var result = MoveResult.CONTINUE;

				if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
					this.endCommandAction();
					return MoveResult.END;
				}

				return result;
			},

			isEventDisplayable: function () {
				var event = this._getEvent();

				return event !== null && event.getPlaceEventInfo().getPlaceCustomType() === PlaceCustomType.COMMAND && event.isEvent();
			},

			_prepareCommandMemberData: function () {
				this._capsuleEvent = createObject(CapsuleEvent);
			},

			_completeCommandMemberData: function () {
				var event = this._getEvent();

				this._capsuleEvent.enterCapsuleEvent(event, true);
			},

			_getEventType: function () {
				return PlaceEventType.CUSTOM;
			},

			// Location event: Custom is performed many times, so it works the same way
			_getPlaceEventFromPos: function (type, x, y) {
				var i, event, placeInfo;
				var list = root.getCurrentSession().getPlaceEventList();
				var count = list.getCount();

				for (i = 0; i < count; i++) {
					event = list.getData(i);
					placeInfo = event.getPlaceEventInfo();
					if (placeInfo.getPlaceEventType() === type) {
						if (placeInfo.getX() === x && placeInfo.getY() === y) {
							return event;
						}
					}
				}

				return null;
			}
		}
	);


	//-------------------------------------------
	// Talk event
	//-------------------------------------------
	PlaceEventByUnit.Talk = defineObject(BasePlaceEventByUnit,
		{
			_capsuleEvent: null,
			_text: null,

			openEvent: function () {
				this._prepareCommandMemberData();
				this._completeCommandMemberData();
			},

			moveEvent: function () {
				var result = this._moveEventMode();

				return result;
			},

			drawEvent: function () {
			},

			isEventDisplayable: function () {
				var event;
				var pos = this.getSearchPos();
				var unit = this.getCommandTarget();

				// False if the coordinates are equal to your own position (because you'd be looking for your own talk event)
				if (pos.x === unit.getMapX() && pos.y === unit.getMapY()) {
					return false;
				}

				event = this._getTargetEventFromPos(pos.x, pos.y);

				return event !== null && event.isEvent() && event.getExecutedMark() === EventExecutedType.FREE;
			},

			endCommandAction: function () {
				var dest, pos;

				if (isTalkFaceToFace && typeof UnitDirectionControl !== 'undefined') {
					pos = this.getSearchPos();
					dest = PosChecker.getUnitFromPos(pos.x, pos.y);
					if (dest != null) {
						dest.setDirection(DirectionType.NULL);
					}
				}
			},

			_prepareCommandMemberData: function () {
				this._capsuleEvent = createObject(CapsuleEvent);
			},

			_completeCommandMemberData: function () {
				var unit, dest;
				var pos = this.getSearchPos();
				var event = this._getTargetEventFromPos(pos.x, pos.y);
				this._capsuleEvent.enterCapsuleEvent(event, true);

				if (isTalkFaceToFace && typeof UnitDirectionControl !== 'undefined') {
					unit = this.getCommandTarget();
					dest = PosChecker.getUnitFromPos(pos.x, pos.y);

					UnitDirectionControl._setUnitDirecion(unit, dest, DirCtrlValue.FACE);
					UnitDirectionControl._setUnitDirecion(dest, unit, DirCtrlValue.FACE);
				}
			},

			_moveEventMode: function () {
				if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
					this.endCommandAction();
					return MoveResult.END;
				}

				return MoveResult.CONTINUE;
			},

			_getTalkEvent: function (unit, targetUnit) {
				var i, event, talkInfo, src, dest, isEqual;
				var arr = EventCommonArray.createArray(root.getCurrentSession().getTalkEventList(), EventType.TALK);
				var count = arr.length;

				for (i = 0; i < count; i++) {
					event = arr[i];
					talkInfo = event.getTalkEventInfo();
					src = talkInfo.getSrcUnit();
					dest = talkInfo.getDestUnit();

					isEqual = false;

					if (unit === src && targetUnit === dest) {
						isEqual = true;
					}
					else if (talkInfo.isMutual()) {
						if (unit === dest && targetUnit === src) {
							isEqual = true;
						}
					}

					if (isEqual) {
						if (event.getExecutedMark() === EventExecutedType.FREE && event.isEvent()) {
							return event;
						}
					}
				}

				return null;
			},

			_getTargetEventFromPos: function (x, y) {
				var unit = this.getCommandTarget();
				var targetUnit = PosChecker.getUnitFromPos(x, y);

				if (targetUnit === null) {
					return null;
				}

				return this._getTalkEvent(unit, targetUnit);
			}
		}
	);




	//-------------------------------------------
	// MapCursor class
	//-------------------------------------------
	MapCursor.isFindEvent = function () {
		return false;
	}

	MapCursor.openEvent = function () {
		return false;
	}


	MapCursor.isMapCommandDisplayable = function () {
		return false;
	}


	MapCursor.getWalkGroup = function () {
		return WalkGroup.ALONE;
	}


	MapCursor.isWalkGroup = function () {
		return false;
	}


	MapCursor.setWalkGroup = function (mode) {
	}


	MapCursor.invisibleGroup = function () {
	}


	MapCursor.findNextUnit = function () {
	}


	MapCursor.setFrontUnit = function (unitid) {
	}




	//-------------------------------------------
	// MapCursorByUnit class
	//-------------------------------------------
	var MapCursorByUnitMode = {
		NONE: 0,		// Move key reception
		SLIDE: 1,		// On the way
		DELAY: 2,		// Turned state
		WAITEVENT: 3,	// Place event (waiting) in progress
		PLACEEVENT: 4	// Place event (other than waiting) in progress
	};


	// 指定のユニットを操作してる感じのMapCursor
	var MapCursorByUnit = defineObject(MapCursor,
		{
			_isInputEnabled: true,
			_unitSlideCursor: null,
			_unit: null,
			_posLog: [],			// Unit position (currently unused)
			_dir: DirectionType.NULL,
			_mapLineScroll: null,
			_capsuleEvent: null,
			_placeEventWrapper: null,
			_preMode: MapCursorByUnitMode.NONE,
			_activeIndex: 0,
			_walkGroup: WalkGroup.ALONE,

			initialize: function () {
				this._capsuleEvent = createObject(CapsuleEvent);
				this._unitSlideCursor = createObject(UnitSlideCursor);
				this._mapLineScroll = createObject(MapLineScrollByUnit);
				this._placeEventWrapper = createObject(PlaceEventWrapper);

				this.changeCycleMode(MapCursorByUnitMode.NONE);

				this._dir = DirectionType.NULL;
			},

			setUnit: function (unit) {
				this._unit = unit;
			},

			getUnit: function () {
				return this._unit;
			},

			setActiveIndex: function (index) {
				this._activeIndex = index;
			},

			getActiveIndex: function () {
				return this._activeIndex;
			},

			getWalkGroup: function () {
				return this._walkGroup;
			},

			isWalkGroup: function () {
				return (this._walkGroup === WalkGroup.GROUP);
			},

			setWalkGroup: function (mode) {
				this._walkGroup = mode;
			},

			// Hide all but the current first unit
			invisibleWalkGroup: function () {
				var unit, list, count, i;
				var nowUnit = this.getUnit();

				list = PlayerList.getSortieList();
				count = list.getCount();

				for (i = 0; i < count; i++) {
					unit = list.getData(i);
					if (unit === null) {
						continue;
					}

					if (unit === nowUnit) {
						continue;
					}

					unit.setInvisible(true);
				}
			},

			findNextUnit: function () {
				var nowUnit = this.getUnit();

				if (nowUnit.getAliveState() !== AliveType.ALIVE) {
					var unit;

					var list = PlayerList.getSortieList();
					var count = list.getCount();
					var index = this._activeIndex;

					for (; ;) {
						unit = list.getData(index);
						if (unit !== null) {
							if (unit.getAliveState() === AliveType.ALIVE) {
								this._activeIndex = index;
								this.setNextUnit(unit);
								break;
							}
						}

						index++;

						if (index >= count) {
							index = 0;
						}
						else if (index < 0) {
							index = count - 1;
						}

						if (index === this._activeIndex) {
							break;
						}
					}
				}
				else {
					this.setNextUnit(nowUnit);
				}
			},

			setFrontUnit: function (unitid) {
				var unit;
				var nowUnit = this.getUnit();
				var list = PlayerList.getSortieList();
				var count = list.getCount();
				var index = 0;

				for (index = 0; index < count; index++) {
					unit = list.getData(index);
					if (unit !== null && unit.getId() === unitid) {
						this._activeIndex = index;
						this.setNextUnit(unit);

						// When switching units, new unit faces forward
						if (unit !== nowUnit) {
							nowUnit.setDirection(DirectionType.NULL);
						}
						break;
					}
				}
			},

			moveCursor: function () {
				var event;
				var mode = this.getCycleMode();
				var inputType = InputType.NONE;
				var unit = this.getUnit();

				this._mapLineScroll.moveLineScroll();

				if (mode === MapCursorByUnitMode.NONE) {
					inputType = this._getDirectionInputType();

					inputType = this._changeCursorValue(inputType);
					if (inputType === InputType.NONE) {
						inputType = this._changeCursorValue(WalkControl.changeCursorValueFromMouse(unit));
					}

					if (inputType !== InputType.NONE) {
						this._dir = this._cnvInputTypeToDir(inputType);
						this._unitSlideCursor.setSlideData(unit, this._dir, InputWrapper.getMovementSpeed());
						this.changeCycleMode(MapCursorByUnitMode.SLIDE);
					}
					// If you just turned around, wait for the key to be released
					else if (this._dir !== DirectionType.NULL) {
						this.changeCycleMode(MapCursorByUnitMode.DELAY);
					}
				}
				// Processing during slide
				else if (mode === MapCursorByUnitMode.SLIDE) {
					if (this._unitSlideCursor.moveSlideCycle() !== MoveResult.CONTINUE) {
						this._unitSlideCursor.endSlideCycle();

						// Check for underfoot events here
						event = this._getWaitEvent(unit);

						// If there is a place event (waiting) Direction: Without
						// (If you clear the map as it is, the direction will not be in front, so here it is once in front)
						if (event !== null) {
							unit.setDirection(DirectionType.NULL);
						}

						if (event !== null && this._capsuleEvent.enterCapsuleEvent(event, true) === EnterResult.OK) {
							// If there is a place event (waiting), go to implementation
							this.changeCycleMode(MapCursorByUnitMode.WAITEVENT);
						}
						else {
							// Call the auto event check process
							WalkControl.notifyAutoEventCheck();

							// Return to listening for keys when finished
							this.changeCycleMode(MapCursorByUnitMode.NONE);
						}
					}
				}
				// Processing when only the direction is changed (check that the key is released)
				else if (mode === MapCursorByUnitMode.DELAY) {
					// View the key directly
					inputType = this._getDirectionInputType();

					if (inputType === InputType.NONE || this._dir !== this._cnvInputTypeToDir(inputType)) {
						this._dir = DirectionType.NULL;
						this.changeCycleMode(MapCursorByUnitMode.NONE);
					}
				}
				// Processing during the waiting event
				else if (mode === MapCursorByUnitMode.WAITEVENT) {
					if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
						// At the end of the event, put the cursor back on top of the unit.
						// (Because the position of the cursor and the unit shifts when the unit is moved by the event command)
						var session = root.getCurrentSession();
						var xCursor = unit.getMapX();
						var yCursor = unit.getMapY();

						session.setMapCursorX(xCursor);
						session.setMapCursorY(yCursor);

						// Call the automatic event check process
						WalkControl.notifyAutoEventCheck();

						// Listen for keystrokes again when finished
						this.changeCycleMode(MapCursorByUnitMode.NONE);
					}
				}

				return inputType;
			},

			moveCursorAnimation: function () {
				return MoveResult.CONTINUE;
			},

			drawCursor: function () {
				var mode = this.getCycleMode();

				if (mode === MapCursorByUnitMode.SLIDE) {
					this._unitSlideCursor.drawSlideCycle();
				}
			},

			getUnitFromCursor: function () {
				var mode = this.getCycleMode();

				// Returns null if a place event is being executed while moving.
				if (mode === MapCursorByUnitMode.SLIDE ||
					mode === MapCursorByUnitMode.WAITEVENT ||
					mode === MapCursorByUnitMode.PLACEEVENT) {

					return null;
				}

				// Returns null if the up/down/left/right keys are being pressed
				if (this._getDirectionInputType() !== InputType.NONE) {
					return null;
				}

				return MapCursor.getUnitFromCursor.call(this);
			},

			isFindEvent: function () {
				var isFind;
				var unit = this.getUnit();
				var x = unit.getMapX();
				var y = unit.getMapY();
				var dir = unit.getDirection();

				this._placeEventWrapper.setListCommandUnit(unit);
				this._placeEventWrapper.setSearchPos(x, y);
				isFind = this._placeEventWrapper.isFindEvent();

				if (isFind) {
					return isFind;
				}

				if (dir === DirectionType.NULL) {
					return isFind;
				}

				x += XPoint[dir];
				y += YPoint[dir];

				this._placeEventWrapper.setSearchPos(x, y);
				isFind = this._placeEventWrapper.isFindEventDir();
				return isFind;
			},

			openEvent: function () {
				var result;
				var mode = this.getCycleMode();

				// Place event can't be implemented while moving.
				if (mode === MapCursorByUnitMode.SLIDE ||
					mode === MapCursorByUnitMode.WAITEVENT ||
					mode === MapCursorByUnitMode.PLACEEVENT) {

					return false;
				}

				result = this._placeEventWrapper.openEvent();

				if (result) {
					this._preMode = mode;
					this.changeCycleMode(MapCursorByUnitMode.PLACEEVENT);
				}

				return result;
			},

			isMapCommandDisplayable: function () {
				var mode = this.getCycleMode();

				// The map command cannot be executed if the place event is being executed while moving.
				if (mode === MapCursorByUnitMode.SLIDE ||
					mode === MapCursorByUnitMode.WAITEVENT ||
					mode === MapCursorByUnitMode.PLACEEVENT) {

					return false;
				}

				// Can't execute if the arrow keys are being held
				if (this._getDirectionInputType() !== InputType.NONE) {
					return false;
				}

				return true;
			},

			moveEvent: function () {
				var result = this._placeEventWrapper.moveEvent();

				if (result !== MoveResult.CONTINUE) {
					this.changeCycleMode(this._preMode);
				}

				return result;
			},

			changeTarget: function () {
				var unit, list, count, index, nowUnit;
				var mode = this.getCycleMode();

				// Place event can't be implemented while moving.
				if (mode === MapCursorByUnitMode.SLIDE ||
					mode === MapCursorByUnitMode.DELAY ||
					mode === MapCursorByUnitMode.WAITEVENT ||
					mode === MapCursorByUnitMode.PLACEEVENT) {

					return;
				}

				// Can't execute if the arrow keys are being held
				if (this._getDirectionInputType() !== InputType.NONE) {
					return;
				}

				nowUnit = this.getUnit();
				nowUnit.setDirection(DirectionType.NULL);
				list = PlayerList.getSortieList();
				count = list.getCount();
				index = this._activeIndex;

				for (; ;) {
					index++;

					if (index >= count) {
						index = 0;
					}
					else if (index < 0) {
						index = count - 1;
					}

					unit = list.getData(index);
					if (unit === null) {
						break;
					}

					if (!unit.isWait() && nowUnit !== unit) {
						this._activeIndex = index;
						this.setNextUnit(unit);
						this._playChangeSound();
						break;
					}

					if (index === this._activeIndex) {
						break;
					}
				}
			},

			setNextUnit: function (unit) {
				var mode = this.getWalkGroup();
				var nowUnit = this.getUnit();

				// If WalkGroup.GROUP is set, the next unit will be drawn at the same tile location.
				if (mode === WalkGroup.GROUP && unit != null) {
					unit.setMapX(nowUnit.getMapX());
					unit.setMapY(nowUnit.getMapY());

					nowUnit.setInvisible(true);
					unit.setInvisible(false);
				}

				if (unit != null) {
					this.setUnit(unit);
					root.getCurrentSession().setActiveEventUnit(unit);

					this._setFocus(unit);
				}
			},

			_setFocus: function (unit) {
				if (unit.getMapX() === this.getX() && unit.getMapY() === this.getY()) {
					return;
				}

				MapView.changeMapCursorForScroll(unit.getMapX(), unit.getMapY());
			},

			_getWaitEvent: function (unit) {
				var event = PosChecker.getPlaceEventFromUnit(PlaceEventType.WAIT, unit);

				if (event !== null && event.getExecutedMark() === EventExecutedType.FREE && event.isEvent()) {
					return event;
				}

				return null;
			},

			_getDirectionInputType: function () {
				var inputType;

				if (!this._isInputEnabled) {
					return InputType.NONE;
				}

				inputType = InputControl.getInputType();

				return inputType;
			},

			_changeCursorValue: function (input) {
				var session = root.getCurrentSession();
				var xCursor0 = session.getMapCursorX();
				var yCursor0 = session.getMapCursorY();
				// The cursor position is the position of the unit currently being operated (the cursor may move and shift when attacking or talking)
				var nowUnit = this.getUnit();
				var xCursor = nowUnit.getMapX();
				var yCursor = nowUnit.getMapY();
				var n = root.getCurrentSession().getMapBoundaryValue();

				if (input === InputType.NONE) {
					return InputType.NONE;
				}

				// If the unit position and the cursor position are out of alignment, move the cursor to the unit position.
				// (The cursor is returned to the unit position after the cursor position has shifted due to location attention, etc.)
				if (xCursor !== xCursor0 || yCursor !== yCursor0) {
					MapView.changeMapCursorForScroll(xCursor, yCursor);
				}

				this._changeUnitDirection(input);

				if (input === InputType.LEFT) {
					xCursor--;
				}
				else if (input === InputType.UP) {
					yCursor--;
				}
				else if (input === InputType.RIGHT) {
					xCursor++;
				}
				else if (input === InputType.DOWN) {
					yCursor++;
				}

				// Stops you at map edge
				if (xCursor < n) {
					return InputType.NONE;
				}
				else if (yCursor < n) {
					return InputType.NONE;
				}
				else if (xCursor > CurrentMap.getWidth() - 1 - n) {
					return InputType.NONE;
				}
				else if (yCursor > CurrentMap.getHeight() - 1 - n) {
					return InputType.NONE;
				}

				// Checks if next tile is passable
				if (this._isMovable(xCursor, yCursor) !== true) {
					return InputType.NONE;
				}

				this._mapLineScroll.startLineScroll(xCursor, yCursor, this._cnvInputTypeToDir(input), InputWrapper.getMovementSpeed());

				session.setMapCursorX(xCursor);
				session.setMapCursorY(yCursor);

				return input;
			},

			// Is it possible to proceed in the specified direction?
			_isMovable: function (x, y) {
				var unit;
				var nowUnit = this.getUnit();
				var movePoint = PosChecker.getMovePointFromUnit(x, y, nowUnit);

				// Terrain is inaccessible
				if (movePoint === 0) {
					return false;
				}

				// False if the unit is at the specified coordinates and is displayed
				// (If you want to move around, it's OK for ourselves, or it seems that we need to process it if it's the same as our position)
				unit = PosChecker.getUnitFromPos(x, y);

				if (unit !== null && unit.getId() !== nowUnit.getId()) {
					if (unit.isInvisible() !== true) {
						return false;
					}
				}

				return true;
			},

			// Change only the orientation of the unit (without necessarily moving)
			_changeUnitDirection: function (input) {
				var unit = this.getUnit();
				var oldDir = unit.getDirection();
				var dir = this._cnvInputTypeToDir(input);

				if (oldDir !== dir) {
					unit.setDirection(dir);
				}
			},

			_cnvInputTypeToDir: function (input) {
				var dir = DirectionType.NULL;

				if (input === InputType.LEFT) {
					dir = DirectionType.LEFT;
				}
				else if (input === InputType.UP) {
					dir = DirectionType.TOP;
				}
				else if (input === InputType.RIGHT) {
					dir = DirectionType.RIGHT;
				}
				else if (input === InputType.DOWN) {
					dir = DirectionType.BOTTOM;
				}

				return dir;
			},

			_playMovingSound: function () {
				//		MediaControl.soundDirect('mapcursor');
			},

			_playChangeSound: function () {
				var handle = root.createResourceHandle(isRTP_ChgSE, use_ChgSE_ID, 0, 0, 0);

				if (handle.isNullHandle()) {
					root.msg('Invalid sound ID:' + use_ChgSE_ID);
				} else {
					MediaControl.soundPlay(handle);
				}
			}
		}
	);




	//---------------
	// MapView class
	//---------------
	MapView.changeMapCursorForScroll = function (x, y) {
		var session = root.getCurrentSession();
		var xx = x * MapChipSize + (MapChipSize / 2);
		var yy = y * MapChipSize + (MapChipSize / 2);

		session.setMapCursorX(x);
		session.setMapCursorY(y);

		this.setScrollPixel(xx, yy)
		MouseControl.changeCursorFromMap(x, y);
	}


	var alias_MapView_setScroll = MapView.setScroll;
	MapView.setScroll = function (x, y) {
		var mapInfo, isWalkMap;

		// In the case of a walking map, the scroll coordinates after paying attention to the location 
		// should be in the center of the square (MapChipSize / 2 is added).
		if (WalkControl.isWalkMap() == true) {
			return this.setScrollPixel(x * GraphicsFormat.MAPCHIP_WIDTH + (MapChipSize / 2), y * GraphicsFormat.MAPCHIP_HEIGHT + (MapChipSize / 2));
		}
		// Takes maps without battle prep into account
		else if (root.getBaseScene() === SceneType.BATTLESETUP) {
			mapInfo = root.getCurrentSession().getCurrentMapInfo();
			isWalkMap = mapInfo.custom.isWalkMap;

			if (typeof isWalkMap === 'number' && isWalkMap === 1) {
				return this.setScrollPixel(x * GraphicsFormat.MAPCHIP_WIDTH + (MapChipSize / 2), y * GraphicsFormat.MAPCHIP_HEIGHT + (MapChipSize / 2));
			}
		}

		return alias_MapView_setScroll.call(this, x, y);
	}




	//-----------------------
	// UnitSlideCursor class
	//-----------------------
	// The specified unit slides in response to certain operations
	var UnitSlideCursor = defineObject(BaseObject,
		{
			_slideObject: null,
			_targetUnit: null,
			_direction: null,
			_pixelIndex: 0,
			_max: 0,
			_slideType: null,

			// Set the unit at initialization? (At that time, set the coordinates of the unit to the initial position?)
			initialize: function () {
				this._slideObject = createObject(SlideObjectNoMovingSound);
				this._pixelIndex = 3;						// Default speed is Normal (3 + 1)
				this._max = 8;								// Number of slides (?)

				this._targetUnit = null;
				this._direction = DirectionType.NULL;
			},

			setSlideData: function (unit, direction, speed) {
				this._prepareMemberData(unit, direction, speed);
				this._completeMemberData();
			},

			moveSlideCycle: function () {
				return this._slideObject.moveSlide();
			},

			drawSlideCycle: function () {
				this._slideObject.drawSlide();
			},

			endSlideCycle: function () {
				this._slideObject.updateUnitPos();
				this._slideObject.endSlide();

				this._targetUnit = null;
				this._direction = DirectionType.NULL;
			},

			_prepareMemberData: function (unit, direction, speed) {
				this._targetUnit = unit;
				this._direction = direction;

				// If the direction has not been set, set the direction.
				// If the direction of movement does not match the direction of the unit image, change it beforehand using "Change Unit Status".
				if (this._targetUnit !== null && this._slideType === SlideType.START && this._targetUnit.getDirection() === DirectionType.NULL) {
					this._targetUnit.setDirection(this._direction);
				}

				// Each speed value is 1 shorter than actual move speed (e.g. 3+1 in Normal case)
				// Normal speed (default)
				this._pixelIndex = 3;

				switch (speed) {
					case MoveFastest:
						this._pixelIndex = 15;
						break;
					case MoveFast:
						this._pixelIndex = 7;
						break;
					case MoveSlow:
						this._pixelIndex = 1;
						break;
					default:
						this._pixelIndex = 3;
						break;
				}
				if (InputWrapper.isRunState()) {
					// e.g. MoveNormal (3) * 2 + 1 = 7, same as MoveFast
					this._pixelIndex = this._pixelIndex * 2 + 1
				}

				this._max = Math.floor(MapChipSize / (this._pixelIndex + 1));

				this._slideObject.setSlideData(this._targetUnit, this._direction, this._pixelIndex, this._max);
			},

			_completeMemberData: function () {
				this._slideObject.openSlide();
			}
		}
	);

	//-------------------------------------------
	// SlideObjectNoMovingSound class
	//-------------------------------------------
	var SlideObjectNoMovingSound = defineObject(SlideObject,
		{
			setSlideData: function (targetUnit, direction, pixelIndex, max) {
				this._targetUnit = targetUnit;
				this._direction = direction;
				this._interval = pixelIndex + 1;
				this._max = max;
				this._count = 0;
			},

			endSlide: function () {
				this._targetUnit.setSlideX(0);
				this._targetUnit.setSlideY(0);
				// this._targetUnit.setDirection(DirectionType.NULL);
			},

			_playMovingSound: function () {
				if (isMovingSound) {
					Miscellaneous.playFootstep(this._targetUnit.getClass());
				}
			}
		}
	);

	//-------------------------------------------
	// MapLineScrollByUnit class
	//-------------------------------------------
	var MapLineScrollByUnit = defineObject(MapLineScroll,
		{
			_speed: MoveSpeed,			// Scrolling speed (0: super fast, 1: fast, 2: normal, 3: slow)

			setGoalData: function (x1, y1, x2, y2, dir) {
				var x, y;
				var dx = x2 - x1;
				var dy = y2 - y1;
				var e = 0;
				var n = 1;
				var minx = Math.floor(root.getGameAreaWidth() / 2);
				var miny = Math.floor(root.getGameAreaHeight() / 2);
				var maxx = CurrentMap.getWidth() * MapChipSize - minx;
				var maxy = CurrentMap.getHeight() * MapChipSize - miny;

				if (x1 > x2) {
					dx = x1 - x2;
				}
				if (y1 > y2) {
					dy = y1 - y2;
				}

				x = x1;
				y = y1;

				this._goalArray = [];
				this._goalIndex = 0;

				if (dir === DirectionType.NULL) {
					this._goalArray.push(createPos(x2, y2));
					return;
				}

				if (dir === DirectionType.LEFT) {
					if (!(x1 < x2 || (minx > x2 && minx > x1))) {
						for (; x > x2; x -= n) {
							this._goalArray.push(createPos(x, y));
						}
					}
				}

				if (dir === DirectionType.RIGHT) {
					if (!(x1 > x2 || (maxx < x2 && maxx < x1))) {
						for (; x < x2; x += n) {
							this._goalArray.push(createPos(x, y));
						}
					}
				}

				if (dir === DirectionType.TOP) {
					if (!(y1 < y2 || (miny > y2 && miny > y1))) {
						for (; y > y2; y -= n) {
							this._goalArray.push(createPos(x, y));
						}
					}
				}

				if (dir === DirectionType.BOTTOM) {
					if (!(y1 > y2 || (maxy < y2 && maxy < y1))) {
						for (; y < y2; y += n) {
							this._goalArray.push(createPos(x, y));
						}
					}
				}

				this._goalArray.push(createPos(x2, y2));
			},

			moveLineScroll: function () {
				var n = this._getLineInterval();

				if (this._goalArray === null) {
					return MoveResult.END;
				}

				for (; this._goalIndex < this._goalArray.length;) {
					if (this._setLinePos(this._goalArray[this._goalIndex])) {
						this._goalIndex += n;
						break;
					}
					this._goalIndex += n;
				}

				if (this._goalIndex >= this._goalArray.length) {
					this._setLinePos(this._goalArray[this._goalArray.length - 1]);
					this._goalArray = null;
					this._goalIndex = 0;
					return MoveResult.END;
				}

				return MoveResult.CONTINUE;
			},

			startLineScroll: function (x, y, dir, speed) {
				var x1, y1, x2, y2;
				var session = root.getCurrentSession();

				if (session === null) {
					return;
				}

				x1 = session.getScrollPixelX() + Math.floor(root.getGameAreaWidth() / 2);
				y1 = session.getScrollPixelY() + Math.floor(root.getGameAreaHeight() / 2);
				x2 = (x * MapChipSize) + Math.floor(MapChipSize / 2);
				y2 = (y * MapChipSize) + Math.floor(MapChipSize / 2);

				this.setGoalData(x1, y1, x2, y2, dir);

				this._speed = speed;
			},

			_getLineInterval: function () {
				// Scrolling speed (0: super fast) scrolls in 16-dot units
				var actualSpeed = 4;

				switch (this._speed) {
					case (MoveFastest):
						actualSpeed = 16;
						break;
					case (MoveFast):
						actualSpeed = 8;
						break;
					case (MoveSlow):
						actualSpeed = 2;
						break;
					default:
						actualSpeed = 4;
						break;
				}
				if (InputWrapper.isRunState()) {
					actualSpeed *= 2;
				}

				return actualSpeed;
			}
		}
	);




	//-------------------------------------------
	// MapEdit class
	//-------------------------------------------
	MapEdit.isFindEvent = function () {
		return this._mapCursor.isFindEvent();
	}

	MapEdit.getWalkGroup = function () {
		return WalkGroup.ALONE;
	}


	MapEdit.isWalkGroup = function () {
		return false;
	}


	MapEdit.setWalkGroup = function (mode) {
	}


	MapEdit.invisibleWalkGroup = function () {
	}


	MapEdit.findNextUnit = function () {
	}


	MapEdit.setFrontUnit = function (unitid) {
	}




	//-------------------------------------------
	// MapEditByUnit class
	//-------------------------------------------
	// MapEditMode and MapEditResult enums come from map-mapeditor.js

	// Moving the unit
	var MapEditByUnit = defineObject(MapEdit,
		{
			moveMapEdit: function () {
				var mode = this.getCycleMode();
				var result = MapEditResult.NONE;

				if (mode === MapEditMode.CURSORMOVE) {
					result = this._moveCursorMove();
				}
				// Used in handling location events
				else if (mode === MapEditMode.UNITMENU) {
					result = this._moveUnitMenu();
				}

				if (result !== MapEditResult.NONE) {
					// The unit may be updated in future caller operations, so Null the previous unit.
					this._prevUnit = null;
				}

				return result;
			},

			drawMapEdit: function () {
				var mode = this.getCycleMode();

				if (mode === MapEditMode.CURSORMOVE) {
					this._mapCursor.drawCursor();
					this._mapPartsCollection.drawMapPartsCollection();

					MouseControl.drawMapEdge();
				}
				// Used in handling location events
				else if (mode === MapEditMode.UNITMENU) {
					this._mapCursor.drawCursor();

					MouseControl.drawMapEdge();
				}
			},

			setNextUnit: function (unit) {
				this._mapCursor.setNextUnit(unit);
			},

			openEvent: function () {
				var result = this._mapCursor.openEvent();

				if (result) {
					this.changeCycleMode(MapEditMode.UNITMENU);
				}

				return result;
			},

			isMapCommandDisplayable: function () {
				return this._mapCursor.isMapCommandDisplayable();
			},

			moveEvent: function () {
				var result = this._mapCursor.moveEvent();

				if (result !== MoveResult.CONTINUE) {
					this.changeCycleMode(MapEditMode.CURSORMOVE);
				}

				return result;
			},

			isWalkGroup: function () {
				return this._mapCursor.isWalkGroup();
			},

			setWalkGroup: function (mode) {
				this._mapCursor.setWalkGroup(mode);
			},

			invisibleWalkGroup: function () {
				this._mapCursor.invisibleWalkGroup();
			},

			findNextUnit: function () {
				this._mapCursor.findNextUnit();
			},

			setFrontUnit: function (unitid) {
				this._mapCursor.setFrontUnit(unitid);
			},

			_prepareMemberData: function () {
				MapEdit._prepareMemberData.call(this);

				this._mapCursor = createObject(MapCursorByUnit);
				this._mapCursor.setUnit(PlayerList.getSortieList().getData(0));

				this._mapPartsCollection = createObject(MapPartsCollectionByUnit);
			},

			_moveCursorMove: function () {
				var unit = this._mapCursor.getUnitFromCursor();
				var result = MapEditResult.NONE;

				if (InputWrapper.isSelectAction()) {
					// Find out if there is a location event when the Z key is pressed
					result = this._selectAction(unit);
				} else if (InputWrapper.isMapCommandAction()) {
					// Show map command when X key is pressed
					result = this._cancelAction(unit);
				} else if (InputWrapper.isUnitSwitchAction()) {
					if (WalkControl.canTargetChange()) {
						// The unit is switched when the C key is pressed or the wheel is down.
						this._changeTarget(true);
					}
				} else {
					this._mapCursor.moveCursor();
					this._mapPartsCollection.moveMapPartsCollection();

					unit = this.getEditTarget();

					// Update if the unit is not null and has changed
					if (unit != null && unit !== this._prevUnit) {
						this._setUnit(unit);
					}
				}

				return result;
			},

			_selectAction: function (unit) {
				var result = MapEditResult.NONE;

				if (WalkControl.changeCursorValueFromMouse(unit) !== InputType.NONE) {
					return result;
				}

				// Switch to MapEditResult.UNITSELECT if there is a location event (used in the location event)
				if (this._mapCursor.isFindEvent()) {
					result = MapEditResult.UNITSELECT;
				}

				return result;
			},

			_cancelAction: function (unit) {
				// Show map commands
				var result = MapEditResult.MAPCHIPSELECT;

				return result;
			},

			// Used in handling location events
			_moveUnitMenu: function () {
				var result = this._mapCursor.moveEvent();

				return MapEditResult.NONE;
			},

			// Switching units
			_changeTarget: function (isNext) {
				this._mapCursor.changeTarget();

				var unit = this._mapCursor.getUnit();

				if (unit !== this._prevUnit) {
					this._setUnit(unit);
				}
			}
		}
	);




	//-------------------------------------------
	// MapPartsCollectionByUnit class
	//-------------------------------------------
	var MapPartsCollectionByUnit = defineObject(MapPartsCollection,
		{
			_configureMapParts: function (groupArray) {
				if (EnvironmentControl.isMapUnitWindowDetail()) {
					groupArray.appendObject(MapParts.UnitInfoByUnit);
				}
				else {
					groupArray.appendObject(MapParts.UnitInfoSmallByUnit);
				}
			}
		}
	);




	//-------------------------------------------
	// PlayerTurn class
	//-------------------------------------------
	PlayerTurn.getWalkGroup = function () {
		return WalkGroup.ALONE;
	}


	PlayerTurn.isWalkGroup = function () {
		return false;
	}


	PlayerTurn.setWalkGroup = function (mode) {
	}


	PlayerTurn.invisibleWalkGroup = function () {
	}


	PlayerTurn.findNextUnit = function () {
	}


	PlayerTurn.setFrontUnit = function (unitid) {
	}




	//-------------------------------------------
	// PlayerTurnByUnit class
	//-------------------------------------------
	// PlayerTurnMode enum comes from map-playerturn.js

	var PlayerTurnByUnit = defineObject(PlayerTurn,
		{
			moveTurnCycle: function () {
				var mode = this.getCycleMode();
				var result = MoveResult.CONTINUE;

				//		if (this._checkAutoTurnEnd()) {
				//			return MoveResult.CONTINUE;
				//		}

				if (mode === PlayerTurnMode.AUTOCURSOR) {
					result = this._moveAutoCursor();
				}
				else if (mode === PlayerTurnMode.AUTOEVENTCHECK) {
					result = this._moveAutoEventCheck();
				}
				else if (mode === PlayerTurnMode.MAP) {
					result = this._moveMap();
				}
				// Used for location events
				else if (mode === PlayerTurnMode.AREA) {
					result = this._moveArea();
				}
				else if (mode === PlayerTurnMode.MAPCOMMAND) {
					result = this._moveMapCommand();
				}
				//		else if (mode === PlayerTurnMode.UNITCOMMAND) {
				//			result = this._moveUnitCommand();
				//		}

				//		if (this._checkAutoTurnEnd()) {
				//			return MoveResult.CONTINUE;
				//		}

				return result;
			},

			drawTurnCycle: function () {
				var mode = this.getCycleMode();

				if (mode === PlayerTurnMode.AUTOCURSOR) {
					this._drawAutoCursor();
				}
				else if (mode === PlayerTurnMode.AUTOEVENTCHECK) {
					this._drawAutoEventCheck();
				}
				else if (mode === PlayerTurnMode.MAP) {
					this._drawMap();
				}
				// Used for location events
				else if (mode === PlayerTurnMode.AREA) {
					this._drawArea();
				}
				else if (mode === PlayerTurnMode.MAPCOMMAND) {
					this._drawMapCommand();
				}
				//		else if (mode === PlayerTurnMode.UNITCOMMAND) {
				//			this._drawUnitCommand();
				//		}
			},

			isWalkGroup: function () {
				return this._mapEdit.isWalkGroup();
			},

			setWalkGroup: function (mode) {
				this._mapEdit.setWalkGroup(mode);
			},

			invisibleWalkGroup: function () {
				this._mapEdit.invisibleWalkGroup();
			},

			findNextUnit: function () {
				this._mapEdit.findNextUnit();
			},

			setFrontUnit: function (unitid) {
				this._mapEdit.setFrontUnit(unitid);
			},

			_prepareTurnMemberData: function () {
				PlayerTurn._prepareTurnMemberData.call(this);

				this._mapCommandManager = createObject(MapCommandByUnit);
				this._mapEdit = createObject(MapEditByUnit);
			},

			_completeTurnMemberData: function () {
				PlayerTurn._completeTurnMemberData.call(this);

				this._targetUnit = this._mapEdit.getEditTarget();

				if (this._targetUnit != null) {
					// Now set the currently operating unit to active
					root.getCurrentSession().setActiveEventUnit(this._targetUnit);
				}
			},

			_moveAutoCursor: function () {
				var x, y, pos;

				if (this._mapLineScroll.moveLineScroll() !== MoveResult.CONTINUE) {
					pos = this._getDefaultCursorPos();
					if (pos !== null && EnvironmentControl.isAutoCursor()) {
						x = pos.x;
						y = pos.y;
					}
					else {
						x = this._xAutoCursorSave;
						y = this._yAutoCursorSave;
					}
					MapView.changeMapCursor(x, y);
					if (isAutoEventSilent) {
						this.changeCycleMode(PlayerTurnMode.MAP);
					}
					else {
						this._changeEventMode();
					}
				}

				return MoveResult.CONTINUE;
			},

			_moveMap: function () {
				var result = this._mapEdit.moveMapEdit();

				if (result === MapEditResult.UNITSELECT) {
					if (this._mapEdit.openEvent()) {
						this.changeCycleMode(PlayerTurnMode.AREA);
					}
				}
				else if (result === MapEditResult.MAPCHIPSELECT) {
					if (this._mapEdit.isMapCommandDisplayable()) {
						this._targetUnit = this._mapEdit.getEditTarget();
						this._mapCommandManager.setListCommandUnit(this._targetUnit);	// addition

						this._mapCommandManager.openListCommandManager();
						this.changeCycleMode(PlayerTurnMode.MAPCOMMAND);
					}
				}

				return MoveResult.CONTINUE;
			},

			// Used for location events
			_moveArea: function () {
				var result = this._mapEdit.moveEvent();

				if (result !== MoveResult.CONTINUE) {
					this._changeEventMode();
				}

				return result;
			},

			_moveMapCommand: function () {
				var unit;

				if (this._mapCommandManager.moveListCommandManager() !== MoveResult.CONTINUE) {
					unit = this._mapCommandManager.getListCommandUnit();
					// Not executed if end of turn is selected
					if (isAutoEventSilent) {
						this.changeCycleMode(PlayerTurnMode.MAP);
					}
					else {
						this._changeEventMode();
					}
				}

				return MoveResult.CONTINUE;
			},

			_drawAutoCursor: function () {
				MapLayer.drawUnitLayerByUnit();
			},

			_drawAutoEventCheck: function () {
				MapLayer.drawUnitLayerByUnit();
			},

			_drawMap: function () {
				MapLayer.drawUnitLayerByUnit();
				if (!root.isEventSceneActived()) {
					this._mapEdit.drawMapEdit();
				}
			},

			// Used for location events
			_drawArea: function () {
				MapLayer.drawUnitLayerByUnit();
				if (!root.isEventSceneActived()) {
					this._mapEdit.drawMapEdit();
				}
			},

			_drawMapCommand: function () {
				MapLayer.drawUnitLayerByUnit();
				this._mapCommandManager.drawListCommandManager();
			},

			_getDefaultCursorPos: function () {
				var i, unit;
				var targetUnit = null;
				var list = PlayerList.getSortieList();
				var count = list.getCount();

				targetUnit = list.getData(0);

				if (targetUnit !== null) {
					return createPos(targetUnit.getMapX(), targetUnit.getMapY());
				}

				return null;
			}
		}
	);




	//-------------------------------------------
	// MapCommandByUnit class
	//-------------------------------------------
	var MapCommandByUnit = defineObject(MapCommand,
		{
			configureCommands: function (groupArray) {
				var index;

				MapCommand.configureCommands.call(this, groupArray);

				// Remove End Turn command if isUseTurnEnd is not true
				if (isUseTurnEnd !== true) {
					var i, commandLayout;

					i = groupArray.length - 1;
					for (; i >= 0; i--) {
						commandLayout = groupArray[i].getCommandLayout();
						if (commandLayout == null) {
							continue;
						}

						if (commandLayout.getCommandActionType() === CommandActionType.TURNEND) {
							groupArray.splice(i, 1);
						}
					}
				}

				// If the index of the stock command is 0, it's at the bottom (if the index is negative, it's not in the list)
				if (MapStockCommandIndex === 0) {
					groupArray.appendObject(MapCommand.Stock);
				}
				// If the index of the stock command > 0, it's set at the top of the list.
				else if (MapStockCommandIndex > 0) {
					index = MapStockCommandIndex - 1;

					if (index > groupArray.length - 1) {
						index = groupArray.length - 1;
					}

					groupArray.insertObject(MapCommand.Stock, index);
				}

				// If the index of the Manage command is 0, it is the bottom (if the index is negative, it's not in the list)
				if (MapUnitMarshalIndex === 0) {
					groupArray.appendObject(MapCommandUnitMarshal);
				}
				// If the index of the Manage command > 0, it's set at the top of the list.
				else if (MapUnitMarshalIndex > 0) {
					index = MapUnitMarshalIndex - 1;

					if (index > groupArray.length - 1) {
						index = groupArray.length - 1;
					}

					groupArray.insertObject(MapCommandUnitMarshal, index);
				}
			}
		}
	);

	//-------------------------------------------
	// MapCommand.Stock class
	//-------------------------------------------

	// Stock (aka Storage, Convoy, etc.) to display as a map command in walking mode
	MapCommand.Stock = defineObject(UnitCommand.Stock,
		{
			openCommand: function () {
				var screenParam = this._createScreenParam();

				this._stockItemTradeScreen = createObject(DataConfig.isStockTradeWeaponTypeAllowed() ? CategoryStockItemTradeScreenByUnit : StockItemTradeScreenByUnit);
				SceneManager.addScreen(this._stockItemTradeScreen, screenParam);
			},

			moveCommand: function () {

				if (SceneManager.isScreenClosed(this._stockItemTradeScreen)) {
					this._stockItemTradeScreen.getScreenResult();
					return MoveResult.END;
				}

				return MoveResult.CONTINUE;
			},

			isCommandDisplayable: function () {
				// False if stock is hidden
				if (!root.getCurrentSession().isMapState(MapStateType.STOCKSHOW)) {
					return false;
				}

				// False if there is no unit selected
				if (this.getCommandTarget() == null) {
					return false;
				}

				return true;
			},

			_createScreenParam: function () {
				var screenParam = ScreenBuilder.buildStockItemTrade();

				screenParam.unit = this.getCommandTarget();
				screenParam.unitList = PlayerList.getSortieList();

				return screenParam;
			}
		}
	);


	//-------------------------------------------
	// StockItemTradeScreenByUnit class
	//-------------------------------------------
	var StockItemTradeScreenByUnit = defineObject(StockItemTradeScreen,
		{
			_prepareScreenMemberData: function (screenParam) {
				StockItemTradeScreen._prepareScreenMemberData.call(this, screenParam);

				this._dataChanger = createObject(VerticalDataChangerByUnit);
			},

			_drawMainWindow: function () {
				var xInfo, yInfo;
				var unitWindowWidth = this._unitItemWindow.getWindowWidth();
				var stockWindowHeight = this._stockItemWindow.getWindowHeight();
				var width = this._unitItemWindow.getWindowWidth() + this._stockItemWindow.getWindowWidth();
				var x = LayoutControl.getCenterX(-1, width);
				var y = LayoutControl.getCenterY(-1, stockWindowHeight);

				this._itemOperationWindow.drawWindow(x, y);
				this._unitItemWindow.drawWindow(x, y + this._itemOperationWindow.getWindowHeight());

				if (this._isRightSideInfoWindow()) {
					this._stockItemWindow.drawWindow(x + unitWindowWidth, y);

					xInfo = x + this._stockItemWindow.getWindowWidth();
					yInfo = (y + stockWindowHeight) - this._itemInfoWindow.getWindowHeight();
					this._itemInfoWindow.drawWindow(xInfo, yInfo);
				} else {
					xInfo = (x + unitWindowWidth) - this._itemInfoWindow.getWindowWidth();
					yInfo = (y + stockWindowHeight) - this._itemInfoWindow.getWindowHeight();
					this._itemInfoWindow.drawWindow(xInfo, yInfo);

					// Draw after _unitItemWindow or _itemInfoWindow so that the cursor doesn't [cover it or get covered?]
					this._stockItemWindow.drawWindow(x + unitWindowWidth, y);
				}

				xInfo = (x + unitWindowWidth + this._stockItemWindow.getWindowWidth()) - this._stockCountWindow.getWindowWidth();
				yInfo = (y - this._stockCountWindow.getWindowHeight());
				this._stockCountWindow.drawWindow(xInfo, yInfo);

				if (this._unitSimpleWindow !== null) {
					xInfo = (x + unitWindowWidth) - this._unitSimpleWindow.getWindowWidth();
					yInfo = (y + stockWindowHeight) - this._unitSimpleWindow.getWindowHeight();
					this._unitSimpleWindow.drawWindow(xInfo, yInfo);
				}
			}
		}
	);




	//-------------------------------------------
	// CategoryStockItemTradeScreenByUnit class
	//-------------------------------------------
	var CategoryStockItemTradeScreenByUnit = defineObject(CategoryStockItemTradeScreen,
		{
			_prepareScreenMemberData: function (screenParam) {
				CategoryStockItemTradeScreen._prepareScreenMemberData.call(this, screenParam);

				this._dataChanger = createObject(VerticalDataChangerByUnit);
			},

			_drawMainWindow: function () {
				var stockWindowHeight = this._stockItemWindow.getWindowHeight();
				var width = this._unitItemWindow.getWindowWidth() + this._stockItemWindow.getWindowWidth();
				var x = LayoutControl.getCenterX(-1, width);
				var y = LayoutControl.getCenterY(-1, stockWindowHeight);

				StockItemTradeScreenByUnit._drawMainWindow.call(this)

				this._stockCategory.xRendering = x + width;
				this._stockCategory.yRendering = y;
				this._stockCategory.windowHeight = stockWindowHeight;
				this._stockCategory.drawStockCategory();
			}
		}
	);




	//-------------------------------------------
	// VerticalDataChangerByUnit class
	//-------------------------------------------
	var VerticalDataChangerByUnit = defineObject(VerticalDataChanger,
		{
			_changePage: function (list, data, isNext) {
				var i, count;
				var index = -1;

				if (data === null) {
					index = list.getIndex();
					count = list.getObjectCount();
				}
				else {
					count = list.getCount();
					for (i = 0; i < count; i++) {
						if (list.getData(i) === data) {
							index = i;
							break;
						}
					}
				}

				if (count === 1 || index === -1) {
					return -1;
				}

				if (isNext) {
					if (++index > count - 1) {
						index = 0;
					}
				}
				else {
					if (--index < 0) {
						index = count - 1;
					}
				}

				this._playMenuPageChangeSound();

				return index;
			}
		}
	);




	//-------------------------------------------
	// MapCommand.UnitMarshal class
	//-------------------------------------------

	// Manage Units displayed in map commands
	MapCommandUnitMarshal = defineObject(BaseListCommand,
		{
			_screen: null,

			openCommand: function () {
				var screenParam = this._createScreenParam();

				this._screen = createObject(MarshalScreenForWalk);
				SceneManager.addScreen(this._screen, screenParam);
			},

			moveCommand: function () {
				if (SceneManager.isScreenClosed(this._screen)) {
					return MoveResult.END;
				}

				return MoveResult.CONTINUE;
			},

			getCommandName: function () {
				return root.queryScreen('UnitMarshal').getScreenTitleName();
			},

			_createScreenParam: function () {
				return {};
			}
		}
	);




	//-------------------------------------------
	// MarshalScreenForWalk class
	//-------------------------------------------
	var MarshalScreenForWalk = defineObject(MarshalScreen,
		{
			//	getScreenTitleName: function() {
			//		return 'Organize';
			//	},

			_prepareScreenMemberData: function (screenParam) {
				MarshalScreen._prepareScreenMemberData.call(this, screenParam);

				this._marshalCommandWindow = createWindowObject(MarshalCommandWindowForWalk, this);
			},

			_createUnitList: function () {
				// Conventional processing if the walking group is "GROUP"
				if (WalkControl.getWalkGroup() !== 0) {
					return PlayerList.getSortieList();
				}
				// If the walking group is "ALONE", only use the current unit
				var unit = WalkControl.getTurnTargetUnit();
				var list = StructureBuilder.buildDataList();

				list.setDataArray([unit]);

				return list;
			}
		}
	);




	//-------------------------------------------
	// MarshalCommandWindowForWalk class
	//-------------------------------------------
	var MarshalCommandWindowForWalk = defineObject(MarshalCommandWindow,
		{
			_configureMarshalItem: function (groupArray) {
				var isRest = root.getBaseScene() === SceneType.REST;

				if (isRest || root.getCurrentSession().isMapState(MapStateType.STOCKSHOW)) {
					if (this._isStockDisplayable()) {
						groupArray.appendObject(MarshalCommand.StockTrade);
					}
				}

				//		groupArray.appendObject(MarshalCommand.ItemTrade);
				//		groupArray.appendObject(MarshalCommand.UnitSort);
				groupArray.appendObject(MarshalCommand.UnitStatusForWalk);

				if (DataConfig.isBattleSetupItemUseAllowed()) {
					if (this._isStockDisplayable()) {
						groupArray.appendObject(MarshalCommand.ItemUseForWalk);
					}
				}

				//		if (DataConfig.isBattleSetupClassChangeAllowed()) {
				//			groupArray.appendObject(MarshalCommand.ClassChange);
				//		}
			},

			_isStockDisplayable: function () {
				if (WalkControl.getWalkGroup() !== 0) {
					// Shows if WalkGroup.GROUP
					return true;
				}
				else {
					// If WalkGroup.ALONE, only returns true if the current unit can access the convoy.
					var unit = WalkControl.getTurnTargetUnit();
					if (Miscellaneous.isStockAccess(unit) && Miscellaneous.isItemAccess(unit)) {
						return true;
					}
				}

				return false;
			},

			_isShopVisible: function () {
				return false;
			},

			_isBonusVisible: function () {
				return false;
			}
		}
	);




	//----------------------------------------
	// MarshalCommand.UnitStatusForWalk class
	//----------------------------------------
	MarshalCommand.UnitStatusForWalk = defineObject(MarshalCommand.UnitStatus,
		{
			_createScreenParam: function () {
				var screenParam = ScreenBuilder.buildUnitMenu();

				screenParam.unit = this._unitSelectWindow.getFirstUnit();
				screenParam.enummode = UnitMenuEnum.SORTIE;

				// If WalkGroup.ALONE, it will be UnitMenuEnum.SINGLE (normal unit menu)
				if (WalkControl.getWalkGroup() === 0) {
					screenParam.enummode = UnitMenuEnum.SINGLE;
				}

				return screenParam;
			}
		}
	);




	//-------------------------------------------
	// MarshalCommand.ItemUseForWalk class
	//-------------------------------------------
	MarshalCommand.ItemUseForWalk = defineObject(MarshalCommand.ItemUse,
		{
			checkCommand: function () {
				var screenParam = this._createScreenParam();

				if (screenParam.unit === null) {
					return false;
				}

				this._itemUseScreen = createObject(ItemUseScreenForWalk);
				SceneManager.addScreen(this._itemUseScreen, screenParam);

				return true;
			}
		}
	);

	//-------------------------------------------
	// ItemUseScreenForWalk class
	//-------------------------------------------
	var ItemUseScreenForWalk = defineObject(ItemUseScreen,
		{
			_createUnitList: function () {
				if (WalkControl.getWalkGroup() !== 0) {
					return PlayerList.getSortieList();
				}

				var list = StructureBuilder.buildDataList();
				list.setDataArray([this._unit]);

				return list;
			}
		}
	);





	var alias_ItemMessenger_isItemTypeAllowed = ItemMessenger._isItemTypeAllowed;
	ItemMessenger._isItemTypeAllowed = function (unit, item) {
		var result = alias_ItemMessenger_isItemTypeAllowed.call(this, unit, item);

		if (result) {
			return result;
		}

		var itemType = item.getItemType();
		var rangeType = item.getRangeType();

		if (WalkControl.isWalkMap() !== true) {
			return result;
		}

		// For walking maps, enable recovery, total recovery, and state recovery (could add settings?)
		if (itemType === ItemType.RECOVERY) {
			result = true;
		} else if (itemType === ItemType.ENTIRERECOVERY) {
			result = true;
		} else if (itemType === ItemType.STATERECOVERY) {
			result = true;
		}

		return result;
	}




	var alias100 = ItemMessenger.isUsable;
	ItemMessenger.isUsable = function (unit, item) {
		var result = alias100.call(this, unit, item);

		if (WalkControl.isWalkMap() !== true) {
			return result;
		}

		if (result !== true) {
			return result;
		}

		var itemType = item.getItemType();

		if (itemType === ItemType.RECOVERY || itemType === ItemType.ENTIRERECOVERY || itemType === ItemType.STATERECOVERY) {
			return this.isItemUsableForWalk(unit, item);
		}

		return result;
	}


	ItemMessenger.isItemUsableForWalk = function (unit, item) {
		var obj;

		// Staves can't be used outside of combat
		if (item.isWand()) {
			return false;
		}

		if (!ItemControl.isItemUsable(unit, item)) {
			return false;
		}

		obj = ItemPackageControl.getItemAvailabilityObject(item);
		if (obj === null) {
			return false;
		}

		return obj.isItemAvailableCondition(unit, item);
	}




	var alias_RecoveryItemSelection_setInitialSelection = RecoveryItemSelection.setInitialSelection;
	RecoveryItemSelection.setInitialSelection = function () {
		// HP recovery items can be used several times, even if HP is full, so it needs to be corrected
		if (WalkControl.isWalkMap() !== true) {
			return alias_RecoveryItemSelection_setInitialSelection.call(this);
		}

		// In walking mode, you can't select units, so the controlled unit is treated as as "selected" by default.
		this._isSelection = true;
		return EnterResult.NOTENTER;
	}



	var alias_RecoveryItemAvailability_isItemAvailableCondition = RecoveryItemAvailability.isItemAvailableCondition;
	RecoveryItemAvailability.isItemAvailableCondition = function (unit, item) {
		if (WalkControl.isWalkMap() !== true) {
			return alias_RecoveryItemAvailability_isItemAvailableCondition.call(this, unit, item);
		}

		return this._checkSelfOnly(unit, item);
	}




	// When using an item, move the target position if it's a walking map and a group
	var alias300 = ItemTitleFlowEntry.enterFlowEntry;
	ItemTitleFlowEntry.enterFlowEntry = function (itemUseParent) {
		var TurnTargetUnit, targetUnit;

		this.walkPosChange(itemUseParent);

		return alias300.call(this, itemUseParent);
	}


	ItemTitleFlowEntry.walkPosChange = function (itemUseParent) {
		var TurnTargetUnit, targetUnit;

		// In the case of walking map, group and free area (Is there a condition such as only recovery items?)
		if (WalkControl.isWalkMap() && WalkControl.getWalkGroup() === 1 && root.getCurrentScene() === SceneType.FREE) {
			TurnTargetUnit = WalkControl.getTurnTargetUnit();
			targetUnit = itemUseParent.getItemTargetInfo().targetUnit;

			// If TurnTargetUnit and targetUnit are different, make the position of targetUnit the same as TurnTargetUnit.
			if (TurnTargetUnit !== targetUnit) {
				targetUnit.setMapX(TurnTargetUnit.getMapX());
				targetUnit.setMapY(TurnTargetUnit.getMapY());
			}
		}
	}




	var alias_StateRecoveryItemSelection_setInitialSelection = StateRecoveryItemSelection.setInitialSelection;
	StateRecoveryItemSelection.setInitialSelection = function () {
		if (WalkControl.isWalkMap() !== true) {
			return alias_StateRecoveryItemSelection_setInitialSelection.call(this);
		}

		// In walking mode, you can't select units, so the controlled unit is treated as as "selected" by default.
		this._isSelection = true;
		return EnterResult.NOTENTER;
	}


	var alias_StateRecoveryItemAvailability_isItemAvailableCondition = StateRecoveryItemAvailability.isItemAvailableCondition;
	StateRecoveryItemAvailability.isItemAvailableCondition = function (unit, item) {
		if (WalkControl.isWalkMap() !== true) {
			return alias_StateRecoveryItemAvailability_isItemAvailableCondition.call(this, unit, item);
		}

		return this._checkSelfOnly(unit, item);
	}




	//-------------------------------------------
	// MapLayer class
	//-------------------------------------------
	MapLayer.drawUnitLayerByUnit = function () {
		var index = this._counter.getAnimationIndex();
		var index2 = this._counter.getAnimationIndex2();
		var session = root.getCurrentSession();

		//		this._markingPanel.drawMarkingPanel();

		//		this._unitRangePanel.drawRangePanel();
		//		this._mapChipLight.drawLight();

		if (session !== null) {
			session.drawUnitSet(true, true, true, index, index2);
		}

		this._drawColor(EffectRangeType.MAPANDCHAR);

		if (this._effectRangeType === EffectRangeType.MAPANDCHAR) {
			this._drawScreenColor();
		}

		// 01 Draw mapchips on top
		if (typeof MapOverLayer !== 'undefined') {
			MapOverLayer.drawOverLayer();
		}

		// Checks for Fog of War plugin
		this.checkAndExecuteFog();

		// Checks for a different Fog of War plugin (tl note: wow)
		this.checkAndExecuteNewFog();

		if (typeof MyWeatherGenerator !== 'undefined') {
			MyWeatherGenerator.drawWeatherGenerator();

			this.drawDebugWeather();
		}
	}

	MapLayer.drawDebugWeather = function() {
		if (ENABLE_WEATHER_DEBUG) {
			var textY = 0;
			var textX = 2;
			var font = root.queryTextUI("default_window").getFont();
			var color = 0xFFFFFF;
			
			TextRenderer.drawText(textX,textY,"FPS: " + root.getFPS(), -1, color, font)
			textY += 16;
			TextRenderer.drawText(textX,textY,"Weather Object Count: " + MyWeatherGenerator._rainArray.length, -1, color, font)
			textY += 16;
			cacheString = "Weather Cache: "
			count = MyWeatherGenerator._imageCache.length
			for (i = 0; i < count; i++) {
				cacheString += MyWeatherGenerator._imageCache[i].name;
				if (i == count - 1) {" "} else {cacheString += ", "}
			}
			TextRenderer.drawText(textX,textY,cacheString, -1, color, font)
			textY += 16;
			if (MyWeatherGenerator._weatherType != null) {
				TextRenderer.drawText(textX,textY,"Current Weather: " + MyWeatherGenerator._weatherType.getName(), -1, color, font)
				textY += 16;
				TextRenderer.drawText(textX,textY,"Spawn Rate: " + MyWeatherGenerator._weatherType.getSpawnRate(), -1, color, font)
				textY += 16;
				TextRenderer.drawText(textX,textY,"Max Limit: " + MyWeatherGenerator._weatherType.getMaxCount(), -1, color, font)
				textY += 16;
				TextRenderer.drawText(textX,textY,"Wind Multiplier: " + MyWeatherGenerator._weatherType.getWindMultiplier(), -1, color, font)
				textY += 16;
			}
			TextRenderer.drawText(textX,textY,"Wind Current: " + MyWeatherGenerator._windCurrent, -1, color, font)
			textY += 16;
			TextRenderer.drawText(textX,textY,"No. Of Weather Types: " + MyWeatherGenerator._weatherArray.length, -1, color, font)
			textY += 16;
			TextRenderer.drawText(textX,root.getWindowHeight() - 36,"PRESS OPTION 2 (DEFAULT: SHIFT) TO TOGGLE WEATHER", -1, color, font)
			TextRenderer.drawText(textX,root.getWindowHeight() - 20,"To turn off this debug stuff, go to weather-config.js", -1, color, font)
		}
	}


	MapLayer.checkAndExecuteFog = function () {
		// Checks if FoW plugin exists, exits if not
		if (this.isFog() !== true) {
			return;
		}

		var scene = root.getCurrentScene();

		if (typeof this._map.custom.fog === 'object' && typeof this._map.custom.fog.img === 'string' &&
			(scene === SceneType.BATTLESETUP || scene === SceneType.FREE ||
				scene === SceneType.BATTLERESULT || scene === SceneType.EVENT ||
				scene === SceneType.REST)) {

			if (this._switchId === null || this._map.getLocalSwitchTable().isSwitchOn(this._map.getLocalSwitchTable().getSwitchIndexFromId(this._switchId))) {
				this._scrollBackground.moveScrollBackgroundCubeEx(this._map);
				this._scrollBackground.drawScrollBackground();
			}
		}
	}


	MapLayer.isFog = function () {
		if (typeof this._map === 'undefined') {
			return false;
		}

		return true;
	}


	MapLayer.checkAndExecuteNewFog = function () {
		// Ditto but for a different FoW plugin
		if (this.isNewFog() !== true) {
			return;
		}

		if (typeof MapInfo_Data.custom.fog === 'object' && typeof MapInfo_Data.custom.fog.img === 'string' &&
			(root.getCurrentScene() === SceneType.BATTLESETUP || root.getCurrentScene() === SceneType.FREE ||
				root.getCurrentScene() === SceneType.BATTLERESULT || root.getCurrentScene() === SceneType.EVENT ||
				root.getCurrentScene() === SceneType.REST)) {

			if (MapInfo_switchId === null || MapInfo_Data.getLocalSwitchTable().isSwitchOn(MapInfo_Data.getLocalSwitchTable().getSwitchIndexFromId(this._switchId))) {
				MapInfo_scrollBackground.moveScrollBackgroundCubeEx(MapInfo_Data);
				MapInfo_scrollBackground.drawScrollBackground();
			}
		}
	}


	MapLayer.isNewFog = function () {
		if (typeof MapInfo_Data === 'undefined' || typeof MapInfo_switchId === 'undefined' || MapInfo_scrollBackground === 'undefined') {
			return false;
		}

		return true;
	}




	//-------------------------------------------
	// ScrollBackground class
	//-------------------------------------------
	var alias_ScrollBackground_drawScrollBackground = ScrollBackground.drawScrollBackground;
	ScrollBackground.drawScrollBackground = function () {
		// Draws normally if no FoW plugins
		if (MapLayer.isFog() !== true && MapLayer.isNewFog() !== true) {
			alias_ScrollBackground_drawScrollBackground.call(this);
			return;
		}

		// Draws normally if FoW and not a walk map
		if (isScrollBGOnlyWalk && WalkControl.isWalkMap() !== true) {
			alias_ScrollBackground_drawScrollBackground.call(this);
			return;
		}

		// Draw normally if session is null
		var session = root.getCurrentSession();
		if (session === null) {
			alias_ScrollBackground_drawScrollBackground.call(this);
			return;
		}

		// Draws normally if FoW and in the base
		var mapInfo = session.getCurrentMapInfo();
		if (mapInfo === null) {
			alias_ScrollBackground_drawScrollBackground.call(this);
			return;
		}

		if (this._pic === null) {
			return;
		}

		if (this._picCache === null) {
			this._createBackgroundCache();
		}

		// ScrollBackground is drawn relative to the scroll position
		var x = 0;
		var y = 0;

		// Since the actual screen may be scrolling, the drawing position is moved in the X and Y directions.
		// (The drawing start position is changed when scrolling)
		x = -root.getCurrentSession().getScrollPixelX();
		y = -root.getCurrentSession().getScrollPixelY();

		var xScroll = Math.floor(this._xScroll);
		var yScroll = Math.floor(this._yScroll);

		//		this._picCache.drawStretchParts(0, 0, root.getGameAreaWidth(), root.getGameAreaHeight(),
		//			this._xScroll, this._yScroll, this._pic.getWidth(), this._pic.getHeight());
		this._picCache.drawParts(x, y, xScroll, yScroll, this._pic.getWidth(), this._pic.getHeight());
	}




	//-------------------------------------------
	// WrapPlayerTurn class
	//-------------------------------------------
	var WrapPlayerTurn = defineObject(BaseTurn,
		{
			_playerTurn: null,
			_playerTurnByUnit: null,
			_nowPlayerTurn: null,		// Selected player unit's turn
			_otherPlayerTurn: null,		// Unselected unit's turn
			_isWalkMap: false,

			initialize: function () {
				this._playerTurn = createObject(PlayerTurn);
				this._playerTurnByUnit = createObject(PlayerTurnByUnit);

				this._nowPlayerTurn = null;
				this._otherPlayerTurn = null;

				this._isWalkMap = false;
			},

			// Check which PlayerTurn to use and switch (automatic)
			setupUsePlayerTurn: function () {
				if (WalkControl.isWalkMap() == true) {
					this.changePlayerTurn(true);
				}
				else {
					this.changePlayerTurn(false);
				}
			},

			// Switch which PlayerTurn to use (manual)
			changePlayerTurn: function (isWalkMap) {
				if (isWalkMap == true) {
					this._nowPlayerTurn = this._playerTurnByUnit;
					this._otherPlayerTurn = this._playerTurn;
					this._isWalkMap = true;
				}
				else {
					this._nowPlayerTurn = this._playerTurn;
					this._otherPlayerTurn = this._playerTurnByUnit;
					this._isWalkMap = false;
				}
			},

			changePlayerTurnEx: function (isWalkMap) {
				if (this._nowPlayerTurn == null || this._otherPlayerTurn == null) {
					root.msg('PlayerTurn not initialized');
					return;
				}

				this.changePlayerTurn(isWalkMap);
			},

			// Called when the turn changes
			openTurnCycle: function () {
				this._nowPlayerTurn.openTurnCycle();

				if (WalkControl.isWalkMap() == true) {
					// Set walking mode (ALONE or GROUP)
					this._nowPlayerTurn.setWalkGroup(WalkControl.getWalkGroup());

					// Hide other player units if walk type is GROUP
					if (this._nowPlayerTurn.isWalkGroup() == true) {
						this._nowPlayerTurn.invisibleWalkGroup();
					}
				}
			},

			moveTurnCycle: function () {
				return this._nowPlayerTurn.moveTurnCycle();
			},

			drawTurnCycle: function () {
				this._nowPlayerTurn.drawTurnCycle();
			},

			isPlayerActioned: function () {
				return this._nowPlayerTurn.isPlayerActioned();
			},

			recordPlayerAction: function (isPlayerActioned) {
				this._nowPlayerTurn.recordPlayerAction(isPlayerActioned);
			},

			notifyAutoEventCheck: function () {
				this._nowPlayerTurn.notifyAutoEventCheck();
			},

			isDebugMouseActionAllowed: function () {
				return this._nowPlayerTurn.isDebugMouseActionAllowed();
			},

			setCursorSave: function (unit) {
				this._nowPlayerTurn.setCursorSave();
			},

			setPosValue: function (unit) {
				this._nowPlayerTurn.setPosValue();
			},

			setAutoCursorSave: function (isDefault) {
				this._nowPlayerTurn.setAutoCursorSave();
			},

			getTurnTargetUnit: function () {
				return this._nowPlayerTurn.getTurnTargetUnit();
			},

			clearTurnTargetUnit: function () {
				this._nowPlayerTurn.clearTurnTargetUnit();
			},

			isRepeatMoveMode: function () {
				return this._nowPlayerTurn.isRepeatMoveMode();
			},

			clearPanelRange: function () {
				this._nowPlayerTurn.clearPanelRange();
			},

			getMapEdit: function () {
				return this._nowPlayerTurn.getMapEdit();
			},

			findNextUnit: function () {
				this._nowPlayerTurn.findNextUnit();
			},

			setFrontUnit: function (unitid) {
				this._nowPlayerTurn.setFrontUnit(unitid);
			},

			_prepareTurnMemberData: function () {
				this._nowPlayerTurn._prepareTurnMemberData();
				this._otherPlayerTurn._prepareTurnMemberData();
			},

			_completeTurnMemberData: function () {
				this._nowPlayerTurn._completeTurnMemberData();
				this._otherPlayerTurn._completeTurnMemberData();
			},

			_moveAutoCursor: function () {
				return this._nowPlayerTurn._moveAutoCursor();
			},

			_moveAutoEventCheck: function () {
				return this._nowPlayerTurn._moveAutoEventCheck();
			},

			_moveMap: function () {
				return this._nowPlayerTurn._moveMap();
			},

			// Used for location events
			_moveArea: function () {
				return this._nowPlayerTurn._moveArea();
			},

			_moveMapCommand: function () {
				return this._nowPlayerTurn._moveMapCommand();
			},

			_moveUnitCommand: function () {
				return this._nowPlayerTurn._moveUnitCommand();
			},

			_drawAutoCursor: function () {
				this._nowPlayerTurn._drawAutoCursor();
			},

			_drawAutoEventCheck: function () {
				this._nowPlayerTurn._drawAutoEventCheck();
			},

			_drawMap: function () {
				this._nowPlayerTurn._drawMap();
			},

			// Used for location events
			_drawArea: function () {
				this._nowPlayerTurn._drawArea();
			},

			_drawMapCommand: function () {
				this._nowPlayerTurn._drawMapCommand();
			},

			_drawUnitCommand: function () {
				this._nowPlayerTurn._drawUnitCommand();
			},

			_checkAutoTurnEnd: function () {
				return this._nowPlayerTurn._checkAutoTurnEnd();
			},

			_setDefaultActiveUnit: function () {
				this._nowPlayerTurn._setDefaultActiveUnit();
			},

			_getDefaultCursorPos: function () {
				return this._nowPlayerTurn._getDefaultCursorPos();
			},

			_changeAutoCursor: function () {
				this._nowPlayerTurn._changeAutoCursor();
			},

			_changeEventMode: function () {
				this._nowPlayerTurn._changeEventMode();
			},

			_doEventEndAction: function () {
				this._nowPlayerTurn._doEventEndAction();
			}
		}
	);
})();

//-------------------------------------------------------
// Below, the program (external)
//-------------------------------------------------------

//-------------------------------------------
// MapParts.UnitInfoByUnit class
//-------------------------------------------
MapParts.UnitInfoByUnit = defineObject(MapParts.UnitInfo,
	{
		_drawMain: function (x, y) {
			var unit = this.getMapPartsTarget();
			var width = this._getWindowWidth();
			var height = this._getWindowHeight();
			var textui = this._getWindowTextUI();
			var pic = textui.getUIImage();

			// Hide unit window in the bottom left corner?
			if (isWalkMapWindowDisp !== true) {
				return;
			}

			if (unit === null || WalkControl.isMouseLeftState()) {
				return;
			}

			WindowRenderer.drawStretchWindow(x, y, width, height, pic);

			x += this._getWindowXPadding();
			y += this._getWindowYPadding();
			this._drawContent(x, y, unit, textui);
		}
	}
);




//-------------------------------------------
// MapParts.UnitInfoSmallByUnit class
//-------------------------------------------
MapParts.UnitInfoSmallByUnit = defineObject(MapParts.UnitInfoSmall,
	{
		_drawMain: function (x, y) {
			MapParts.UnitInfoByUnit._drawMain.call(this, x, y);
		}
	}
);




//-------------------------------------------
// WalkControl class
//-------------------------------------------
var WalkControl = {
	_mapId: 1000,
	_isWalkMap: false,
	_walkGroup: 0,
	_unitid: -1,

	getTurnTargetUnit: function () {
		var playerTurnObject;
		var type = root.getCurrentSession().getTurnType();

		// Only do things on player phase
		if (type !== TurnType.PLAYER) {
			return null;
		}

		// Only do things if it's a walk map
		playerTurnObject = SceneManager.getActiveScene()._playerTurnObject;
		if (typeof playerTurnObject === 'undefined' || playerTurnObject._isWalkMap !== true) {
			return null;
		}

		// In walk mode, return the current unit
		return playerTurnObject.getTurnTargetUnit();
	},

	// If the current unit is deleted, switch to the next unit
	findNextUnit: function () {
		var playerTurnObject;
		var type = root.getCurrentSession().getTurnType();

		if (type !== TurnType.PLAYER) {
			return;
		}

		playerTurnObject = SceneManager.getActiveScene()._playerTurnObject;
		if (typeof playerTurnObject === 'undefined' || playerTurnObject._isWalkMap !== true) {
			return;
		}

		// In walking mode, if the current unit is deleted, the unit is switched.
		playerTurnObject.findNextUnit();
	},

	canTargetChange: function () {
		var canChange = canTargetChange;
		var mapInfo = root.getCurrentSession().getCurrentMapInfo();
		var mapChangeValue = mapInfo.custom.canTargetChange;

		if (typeof mapChangeValue === 'boolean') {
			canChange = mapChangeValue;
		}

		return canChange;
	},

	// Set the unit with the specified ID as the first unit
	isSetUnitId: function () {
		return (this._unitid !== -1);
	},

	resetUnitId: function () {
		this._unitid = -1;
	},

	getUnitId: function () {
		return this._unitid;
	},

	// Set the unit with the specified ID as the first unit
	setFrontUnit: function (unitid) {
		var playerTurnObject;
		var type = root.getCurrentSession().getTurnType();

		if (type !== TurnType.PLAYER) {
			return;
		}

		playerTurnObject = SceneManager.getActiveScene()._playerTurnObject;
		if (typeof playerTurnObject === 'undefined') {
			this._unitid = unitid;
			return;
		}

		if (playerTurnObject._isWalkMap !== true) {
			return;
		}

		if (playerTurnObject._mapEdit == null) {
			this._unitid = unitid;
			return;
		}

		playerTurnObject.setFrontUnit(unitid);
	},

	// Switch the unit in front using the variable table and index IDs
	// TL note: fun fact, this used to just straight up crash if called. I fixed it
	setFrontUnitByTable: function (page, id) {
		var table, index, unitid;

		// Variable pages only go from 1 to 6
		if (page < 1 || page > 6) {
			return;
		}

		table = root.getMetaSession().getVariableTable(page - 1);
		index = table.getVariableIndexFromId(id);
		unitid = table.getVariable(index);

		this.setFrontUnit(unitid);
	},

	// In WalkGroup.GROUP, hide other player units
	invisibleWalkGroup: function () {
		var playerTurnObject;
		var type = root.getCurrentSession().getTurnType();

		if (type !== TurnType.PLAYER) {
			return;
		}

		playerTurnObject = SceneManager.getActiveScene()._playerTurnObject;
		if (typeof playerTurnObject === 'undefined' || playerTurnObject._isWalkMap !== true) {
			return;
		}

		if (playerTurnObject.isWalkGroup() !== true) {
			return;
		}

		playerTurnObject.invisibleWalkGroup();
	},

	// Face sortied units forward
	recoverDirection: function () {
		var unit, list, count, i;

		list = PlayerList.getSortieList();
		count = list.getCount();

		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			if (unit === null) {
				continue;
			}

			unit.setDirection(DirectionType.NULL);
		}
	},

	// Cancel sortied units' Wait status
	recoverWait: function () {
		var unit, list, count, i;

		list = PlayerList.getSortieList();
		count = list.getCount();

		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			if (unit === null) {
				continue;
			}

			unit.setWait(false);
		}
	},

	// Refresh sortied units
	recoverSortieUnit: function () {
		var i, unit;
		var list = PlayerList.getSortieOnlyList();
		var count = list.getCount();

		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			UnitProvider._resetHp(unit);
			this._recoverInjury(unit, true);
			UnitProvider._resetState(unit);
			UnitProvider._resetUnitState(unit);
			UnitProvider._resetUnitStyle(unit);
		}
	},

	// Refresh sortied units based on specified parameters
	recoverSortieUnitEx: function (HpRecover, StateRecover, InjuryRecover) {
		var i, unit;
		var list = PlayerList.getSortieOnlyList();
		var count = list.getCount();

		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			if (HpRecover == true) {
				UnitProvider._resetHp(unit);
			}
			if (InjuryRecover == true) {
				this._recoverInjury(unit, true);
			}
			if (StateRecover == true) {
				UnitProvider._resetState(unit);
			}
			UnitProvider._resetUnitStyle(unit);
		}
	},

	// The following is a function to execute only a part of all cancellations except the sortie state

	// Recover HP and injuries
	recoverSortieUnitHp: function () {
		var i, unit;
		var list = PlayerList.getSortieOnlyList();
		var count = list.getCount();

		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			UnitProvider._resetHp(unit);
			UnitProvider._resetInjury(unit);
		}
	},

	// Recovers injured unit with 1 HP
	recoverSortieUnitInjury: function () {
		var i, unit;
		var list = PlayerList.getSortieOnlyList();
		var count = list.getCount();

		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			this._recoverInjury(unit, true);
		}
	},

	_recoverInjury: function (unit, isVisible) {
		if (unit.getAliveState() === AliveType.INJURY) {
			// Set HP to 1 if injured
			unit.setHp(1);
			UnitProvider._resetInjury(unit);

			// If isVisible is true, the unit that has recovered from the injury will be displayed, and if it is false, it will be hidden.
			// Normally, you can specify true, but you can set arguments just in case (currently, only true specification is specified in higher-level functions).
			unit.setInvisible(!isVisible);
		}
	},

	// Recover status effects
	recoverSortieState: function () {
		var i, unit;
		var list = PlayerList.getSortieOnlyList();
		var count = list.getCount();

		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			UnitProvider._resetState(unit);
		}
	},

	recoverSortieUnitState: function () {
		var i, unit;
		var list = PlayerList.getSortieOnlyList();
		var count = list.getCount();

		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			UnitProvider._resetUnitState(unit);
		}
	},

	// Resets Fusion and Transform properties (coordinates don't change)
	recoverSortieUnitFusionMetamorphoze: function () {
		var i, unit;
		var list = PlayerList.getSortieOnlyList();
		var count = list.getCount();

		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			UnitProvider._resetUnitStyle(unit);
		}
	},

	//---------------------------------------------------------------
	// The following is a function for mouse-related detection
	//---------------------------------------------------------------

	// Get the index of the map corresponding to the current mouse cursor
	getMapIndexFromMouse: function () {
		var index = 0;
		var session = root.getCurrentSession();
		var xCursor = Math.floor((root.getMouseX() + session.getScrollPixelX() - root.getViewportX()) / MapChipSize);
		var yCursor = Math.floor((root.getMouseY() + session.getScrollPixelY() - root.getViewportY()) / MapChipSize);

		if (!EnvironmentControl.isMouseOperation()) {
			return -1;
		}

		// Don't consider the mouse if in Software-mode fullscreen (tl note: referring to the setting in game.ini)
		if (root.getAppScreenMode() === AppScreenMode.SOFTFULLSCREEN) {
			return -1;
		}

		// -1 if left click is not pressed
		if (this.isMouseLeftState() !== true) {
			return -1;
		}

		index = CurrentMap.getIndex(xCursor, yCursor);
		return index;
	},

	// Left click detection
	isMouseLeftState: function () {
		return root.isMouseState(MouseType.LEFT);
	},

	// Converts the index of the map specified by the mouse to the movement direction
	changeCursorValueFromMouse: function (unit) {
		var unitX, unitY, x, y, xx, yy, absx, absy;
		var input = InputType.NONE;
		var mapIndex = WalkControl.getMapIndexFromMouse();

		if (mapIndex === -1) {
			return InputType.NONE;
		}

		if (unit == null) {
			return InputType.NONE;
		}

		x = CurrentMap.getX(mapIndex);
		y = CurrentMap.getY(mapIndex);

		unitX = unit.getMapX();
		unitY = unit.getMapY();

		// If the point clicked with the mouse does not match the x or y coordinates of the operation unit, do nothing
		if (unitX !== x && unitY !== y) {
			return InputType.NONE;
		}

		// If the point clicked with the mouse is the same as the coordinates of the operation unit, do nothing
		if (unitX === x && unitY === y) {
			return InputType.NONE;
		}

		if (unitX === x) {
			yy = unitY - y;
			absy = Math.abs(yy);
			if (absy < 1 || absy > 24) {
				return InputType.NONE;
			}

			if (yy > 0) {
				input = InputType.UP;
			} else {
				input = InputType.DOWN;
			}
		} else {
			xx = unitX - x;
			absx = Math.abs(xx);
			if (absx < 1 || absx > 40) {
				return InputType.NONE;
			}

			if (xx > 0) {
				input = InputType.LEFT;
			} else {
				input = InputType.RIGHT;
			}
		}
		return input;
	},

	//---------------------------------------------------------------
	// The following is a function for state reference (referring to an external plug-in)
	//---------------------------------------------------------------

	getMapId: function () {
		return this._mapId;
	},

	isWalkMap: function () {
		if (typeof this._isWalkMap === 'boolean') {
			return this._isWalkMap;
		}

		return (this._isWalkMap !== 0);
	},

	// See WalkGroup enum for expected values
	getWalkGroup: function () {
		return this._walkGroup;
	},

	//---------------------------------------------------------------
	// The following is used to switch between normal and walking operations
	// * Please call from the location event or auto-start event
	// (If you call it directly from the unit event, it may be strange to switch the map state while the battle screen is displayed)
	//---------------------------------------------------------------
	// Switch between normal and walking operations
	changePlayerTurnWalk: function (isWalkMap) {
		var playerTurnObject;
		var type = root.getCurrentSession().getTurnType();

		this.recoverDirection();
		this.recoverWait();			// If you don't disable Wait, then Auto Turn End could trigger depending on other plugins.
		playerTurnObject = SceneManager.getActiveScene()._playerTurnObject;
		if (playerTurnObject == null) {
			root.msg('playerTurnObject does not exist yet. End the game');
			return;
		}

		playerTurnObject.changePlayerTurnEx(isWalkMap);
		this.setWalkMap(isWalkMap);

		SceneManager.getActiveScene().turnEndByUnit(isWalkMap);
	},

	//---------------------------------------------------------------
	// The following is a function for managing plugins.
	// Don't mess with it unless you know what you're doing.
	//---------------------------------------------------------------

	// Automatic event check (can be used on the walk map)
	notifyAutoEventCheck: function () {
		var playerTurnObject;
		var type = root.getCurrentSession().getTurnType();

		if (type !== TurnType.PLAYER) {
			return;
		}

		playerTurnObject = SceneManager.getActiveScene()._playerTurnObject;
		if (typeof playerTurnObject === 'undefined' || playerTurnObject._isWalkMap !== true) {
			return;
		}

		SceneManager.getActiveScene().notifyAutoEventCheck();
	},

	// Walking-related data reset
	resetData: function () {
		this._mapId = 1000;
		this._isWalkMap = false;
		this._walkGroup = 0;
	},

	// TL note - this._mapId seems to be unused, according to this comment by the author?
	// マップIDのセット（設定してるけど今は使ってない）
	// DeepL: "A set of map IDs (I have them set up, but I'm not using them right now)"
	setMapId: function (id) {
		this._mapId = id;
	},

	setWalkMap: function (isWalkMap) {
		if (typeof isWalkMap === 'boolean') {
			this._isWalkMap = isWalkMap;
		}
		else {
			this._isWalkMap = (isWalkMap !== 0);
		}
	},

	setWalkGroup: function (walkGroup) {
		this._walkGroup = walkGroup;
	},

	// Create custom data for saving
	createDataObject: function () {
		var customData = {};

		customData._mapId = this._mapId;
		customData._isWalkMap = this._isWalkMap;
		customData._walkGroup = this._walkGroup;

		return customData;
	},

	// Reflect loaded custom data
	updateDataObject: function (customData) {
		this._mapId = customData._mapId;
		this._isWalkMap = customData._isWalkMap;
		this._walkGroup = customData._walkGroup;
	}
};
