/**
 * Part of the Split Saving plugin.
 * BATTLE_SAVE_COUNT is the number of save slots to set aside for Battle Saves only. They are taken from the end of the list of Chapter Save slots.
 * SaveLoadScreenStrings has the overrides for the titles at the top of the Save and Load screens.
 */

BATTLE_SAVE_COUNT = 25;

var SaveLoadScreenStrings = {
    TITLE__LOAD_BATTLE: 'Load Battle Save',
    TITLE__LOAD_CHAPTER: 'Load Chapter Save',
    TITLE__SAVE_BATTLE: 'Battle Save',
    TITLE__SAVE_CHAPTER: 'Chapter Save'
};

// If you haven't already messed with this number, you can uncomment this function and mess with it here.
// DefineControl.getMaxSaveFileCount = function () {
//     // The maximum value is 99.
//     return 50;
// }

StringTable.LoadSave_NoData = '- No Data -';