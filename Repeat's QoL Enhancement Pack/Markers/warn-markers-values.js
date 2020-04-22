/* Version 2
   By Repeat and McMagister.
   Part of the warning markers plugin.
   Use this file to define which icons are to be used for each type of warning.

   isRuntime: whether the asset to be used is RTP or original.
   id: the id of the image file in Icon.
   xSrc and ySrc: the positions of the icon to be used within the file, both starting from 0.

   You can also define CRT_THRESHOLD for the critical warning marker specifically.
   
   The default values here are the ones from my placeholder image bundled with this plugin, and can be freely edited.
*/

var TALK_ICON = {
    isRuntime: false,
    id: 0,
    xSrc: 1,
    ySrc: 0
}

var EFFECTIVE_ICON = {
    isRuntime: false,
    id: 0,
    xSrc: 0,
    ySrc: 0
}

var CRITICAL_ICON = {
    isRuntime: false,
    id: 0,
    xSrc: 2,
    ySrc: 0
}

var WEAPON_ICON = {
    isRuntime: false,
    id: 0,
    xSrc: 0,
    ySrc: 1
}

var UNIT_ICON = {
    isRuntime: false,
    id: 0,
    xSrc: 1,
    ySrc: 1
}

var SUPPORT_ICON = {
    isRuntime: false,
    id: 0,
    xSrc: 2,
    ySrc: 1
}

// Critical warning starts showing up at this % or higher
var CRT_THRESHOLD = 20;