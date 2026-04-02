Split Saving
v2.1

This plugin separates saving and loading across 3 screens:
 * Chapter Saves
 * Battle Saves
 * Load

Battle Saves are a list of specifically dedicated saves that can only be made mid-battle, while Chapter Saves can be made outside of combat, such as in battle preps, base, between maps, etc.
The idea is that a Chapter Save is a "safe save" that players can easily revert to without being able to carelessly save over it while in an unwinnable position.
In a way, this plugin makes saving much more like Fire Emblem in that it enforces having a point to reset to.

With Chapter and Battle Saves being separate screens, the Load screen has also been overhauled to show both screens at once, where you can choose to load either kind of save.
There are different visuals for the load screen depending on the resolution of your game so that everything fits onscreen.
Mouse controls are fully supported.

This is plug and play, but there are configurable options in 0_split-save-config.js. The most important one is BATTLE_SAVE_COUNT, which is what you'll use to decide how many save slots to dedicate only to Battle Saves.

For a slightly technical explanation, the way this works is that BATTLE_SAVE_COUNT plucks a number of entries from the end of the list of save files and dedicates those to Battle Saves only.
So if you had, for example, 50 save files in total, and set BATTLE_SAVE_COUNT to 10, then the first 40 save files would be permanent "safe" Chapter Saves while the last 10 are volatile Battle Saves.
The battle saves are depicted to the player as Battle Save 1 through 10, but internally they will be the 39th through 49th save file in this example (since save file numbers internally start at 0).

Update history:
6/17/25: v1.0: initial upload
6/19/25: v1.1: adjusted the load screen to only check the mouse's position when the mouse is moving
3/19/26: v2.0: "The Responsive Update"
 * Support for all screen sizes
 * Bugfix for battle saves saving in the wrong slot
4/2/26: v2.1: crash fix for users that do not have a Top Frame image set for the save or load screens, and added config options to change the Top Frame's behavior