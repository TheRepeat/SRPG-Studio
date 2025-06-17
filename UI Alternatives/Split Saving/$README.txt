Split Saving
v1.0

This plugin separates saving and loading across 3 screens:
 * Chapter Saves
 * Battle Saves
 * Load

Battle Saves are a list of specifically dedicated saves that can only be made mid-battle, while Chapter Saves can be made outside of combat, such as in battle preps, base, between maps, etc.
The idea is that a Chapter Save is a "safe save" that players can easily revert to without being able to carelessly save over it.
In a way, this plugin makes saving much more like Fire Emblem in that it enforces having a point to reset to.

With Chapter and Battle Saves being separate screens, the Load screen has also been overhauled to show both screens at once, where you can choose to load either kind of save.

This is plug and play, but there are configurable options in 0_split-save-config.js. The most important one is BATTLE_SAVE_COUNT, which is what you'll use to decide how many save slots to dedicate only to Battle Saves.

Update history:
6/17/25: initial upload