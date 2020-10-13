	Detailed Unit Window by Repeat
This plugin changes the Map Unit Window from two sizes to four: Small, Medium, Large, and Extra Large. The small size is the same as vanilla.



	ABOUT THIS PLUGIN: LARGE/EXTRA LARGE SETTINGS
In the in-game Config, the size of the unit window can be changed under Map Unit Window. The larger the setting, the more information is displayed.
The numbers shown DO take supports and terrain into account, e.g. forests giving extra Avo, or a support giving extra Def/Res.

The Extra Large setting displays 8 useful stats: Atk, Agi, Hit, Avo, Def, Res, Crt, and CAv.
The Large setting of this file trims it down to just the 4 essentials: Atk, Agi, Def, and Res.

All stats are displayed with the name defined in-engine, so change them in Resources > Resource Location > Strings instead
of in this plugin. The only exception is Critical Avoid (CAv), which  is never named in SRPG Studio.
If you want to change that name, change CRIT_AVOID_STAT on line 8 of 0_unitwindow-config.js.

Another option you have is to change ICONS_ONLY on line 9 of the same file to change the functionality! 
If you change that line to ICONS_ONLY = true; then instead of displaying the unit's equipped weapon, the icons of the first 5 items in the unit's inventory will be shown instead.


	ABOUT: MEDIUM SETTING OPTIONS
This affects the Medium setting of the unit window. This window also shows up when trading items, regardless of the config setting.

This file displays the unit's name, current HP, and equipped weapon in the unit's hover window.

You can toggle between the two versions of this file by opening 0_unitwindow-config.js in a text editor and changing MEDIUM_SHOWS_STATS on line 11 to true or false.

VERSION 1 (MEDIUM_SHOWS_STATS = true;) of this file shows the unit's Atk and Agi.
VERSION 2 (MEDIUM_SHOWS_STATS = false;) of this file shows the unit's Level and EXP instead.

Alternatively, if you just aren't a fan, then just don't put the unitwindow-medium.js file in your plugins folder, and the SRPG Studio default version will be used instead.
This version of the window shows the unit's name, class, and current HP alongside an HP bar.

I included a comparison image of each version of the medium size to help you make an educated decision :)


	ABOUT: CUSTOM PARAMETERS
This plugin can use custom parameters for extra convenience. If you give a weapon the custom parameter {lrgname:'New Name'}, then while that weapon is equipped and 
the unit window's setting is L or XL, the equipped weapon's name will be displayed as the specified name instead of its name given in-engine.
Likewise, the same effect occurs for {smallname:'New Name'} when the unit window size is set to M.

This is useful if a weapon has a particularly long name, such that it fits fine in a unit's inventory screen but is too long for the unit window. 
An example image of how this can be useful is included with this plugin.

As a reminder, if you want to use multiple custom parameters on one thing, you want to put them all within the same pair of curly braces {} and separate them with commas.
For example, {smallname:'name1',lrgname:'name2'}. The order doesn't matter, obviously.


UPDATE HISTORY:
1/8/2020: Formerly-hardcoded Critical Avoid string now set to a CRIT_AVOID_STAT constant for easier editing.
	  Adjustments for text when unit is unarmed:
	  * "(Unarmed)" string shifted downward to closer resemble height of equipped weapon text.
	  * Useless stats now appear. In place of a number, uses a wavedash ("-") as in the unit sentence window. (e.g. Hit didn't used to display at all; now it's displayed as "Hit -")
1/12/2020: Stat abbreviations now use drawText function instead of drawSignText function to allow for more customization. 
	   * Text color of these is given as the variable statColor, which can be edited.
	   * This applies to the Large setting and medium-v1 setting.
1/16/2020: The way the Large setting gathers support bonus information is now more efficient. It used to lag the game when too many units were visible onscreen, but this has been fixed.
2/11/2020: Minus sign if Avoid is negative is now white instead of blue in order to match the number's color.
3/24/2020: medium-v1 setting now takes support bonuses into account when calculating Atk. (It's already efficient, I tested!)
3/24/2020 part 2: fix to medium-v1 so it doesn't crash when trading items
3/26/2020: added second version of the large setting that only displays 4 stats, plus comparison images for large & medium
4/21/2020: Overhauled in honor of posting all my stuff on GitHub:
	   * Merged both "large" versions into XL and L sizes that are compatible with each other. (Removed comparison image as a result, since you don't have to choose between them anymore)
	   * Made smallname/lrgname custom parameters public & added a tutorial image.
	   * Moved CRIT_AVOID_STAT and the custom parameter handling to a separate file.