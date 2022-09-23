/**
 * Compatible with versions >= 3.2
 * By Repeat.
 * Unit State Animator integration by McMagister.
 * Part of the Warning Markers plugin.
 * These markers can be opted in and out of by changing the boolean values inside the MarkerDisplay enum.
 * 
 * Use this file to define which icons are to be used for each type of warning.
 * 
 * isRuntime: whether the asset to be used is RTP or original.
 * id: the id of the image file in Icon.
 * xSrc and ySrc: the positions of the icon to be used within the file, both starting from 0.
 * 
 * You can also define CRT_THRESHOLD for the critical warning marker specifically.
 * 
 * The default values here are the ones from my placeholder image bundled with this plugin, and can be freely edited.
 */

var MarkerDisplay = {
    effectiveWarning: true,         // if true, enemies with weaponry effective against the selected unit will be marked
    criticalWarning: true,          // if true, enemies with a high critical rate will be marked
    talkWarning: true,              // if true, units whom the selected unit can speak to will be marked
    supportWarning: true,           // if true, units who give support bonuses to the selected unit will be marked
    sealWarning: true,              // if true, enemies who would seal the selected unit's attack will be marked
    showBattlePrepOneWays: true,    // If true, for the Talk display in battle prep, will show conversations that the unit is a participant of even if they cannot initiate.
	countLoadPerLoop: 5,			// How many enemies to load per frame. Increasing this number will make the markers appear faster, but decreases performance.
    countLoadPerLoop30fps: 8       // Ditto, but for High Performance (30 FPS) mode, where the delay between groups is more noticeable.
};

var TALK_ICON = {
    isRuntime: false,
    id: 1,
    xSrc: 1,
    ySrc: 0
};

var EFFECTIVE_ICON = {
    isRuntime: false,
    id: 1,
    xSrc: 0,
    ySrc: 0
};

var CRITICAL_ICON = {
    isRuntime: false,
    id: 1,
    xSrc: 2,
    ySrc: 0
};

var WEAPON_ICON = {
    isRuntime: false,
    id: 1,
    xSrc: 0,
    ySrc: 1
};

var UNIT_ICON = {
    isRuntime: false,
    id: 1,
    xSrc: 1,
    ySrc: 1
};

var SUPPORT_ICON = {
    isRuntime: false,
    id: 1,
    xSrc: 2,
    ySrc: 1
};

var SEALED_ICON = {
    isRuntime: false,
    id: 1,
    xSrc: 3,
    ySrc: 0
};

// Critical warning starts showing up at this % or higher
var CRT_THRESHOLD = 20;
