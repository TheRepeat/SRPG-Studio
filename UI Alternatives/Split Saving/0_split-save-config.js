/**
 * Part of the Split Saving plugin.
 * BATTLE_SAVE_COUNT is the number of save slots to set aside for Battle Saves only. They are taken from the end of the list of Chapter Save slots.
 * SaveLoadScreenStrings has the overrides for the titles at the top of the Save and Load screens.
 * SplitSaveTopConfig has a few minor config options if you're interested in changing the way the header (Top Frame) image behaves outside of the highest resolution.
 */

BATTLE_SAVE_COUNT = 25;

// If drawAsDefault is true, header image behavior will remain as it is in vanilla (will not move depending on which column you are hovering)
//  * reverseImage is thus ignored
// If drawAsDefault is false and reverseImage is true, header image will flip when it moves to the right side of the screen
// If drawAsDefault is false and reverseImage is false, header image will not flip when it moves to the right side of the screen
// (This config object is not relevant on 1280x720 resolution)
var SplitSaveTopConfig = {
    drawAsDefault: false,
    reverseImage: false
};

var SaveLoadScreenStrings = {
    TITLE__LOAD_BATTLE: 'Load Battle Save',
    TITLE__LOAD_CHAPTER: 'Load Chapter Save',
    TITLE__SAVE_BATTLE: 'Battle Save',
    TITLE__SAVE_CHAPTER: 'Chapter Save'
};

StringTable.LoadSave_NoData = '- No Data -';

// If you haven't already messed with this number, you can uncomment this function and mess with it here.
// DefineControl.getMaxSaveFileCount = function () {
//     // The maximum value is 99.
//     return 50;
// }
