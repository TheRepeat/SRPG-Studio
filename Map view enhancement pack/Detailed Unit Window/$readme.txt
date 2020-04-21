This plugin is plug-and-play. Just drop it in Plugins and it should work!
This readme is just informational.

I included a couple of comparison images of all the versions to help you make an educated decision :)


== LARGE SETTING: detailed-unit-window.js ==

In the in-game Config, the size of the unit window can be changed under Map Unit Window.
The Large setting displays the most information of the three, though it takes up the most screen space.
The numbers shown DO take supports and terrain into account, e.g. forests giving extra Avo, or a support giving extra Def/Res.

VERSION 1 of this file displays 8 useful stats: Atk, Agi, Hit, Avo, Def, Res, Crt, and CAv.
VERSION 2 of this file trims it down to just the 4 essentials: Atk, Agi, Def, and Res.

The two versions are mutually exclusive, so place only the one you prefer in your project's Plugin folder.

All stats are displayed with the name defined in-engine, so change them in Resources>Resource Location>Strings instead
of in this plugin. The only exception is Critical Avoid (CAv), which  is never named in SRPG Studio. 
If you want to change that name, change CRIT_AVOID_STAT on line 15 in this plugin.

On smaller resolutions, the text 'Medium' in Config will not fit on one line. You can change the text displayed in the Config menu
in the getObjectArray() function, which you can find with your handy-dandy Ctrl+F hotkey.


== MEDIUM SETTING: detailed-unit-window-med.js ==

This affects the Medium setting of the unit window. This window also shows up when trading items, regardless of the config setting.

This file displays the unit's name, current HP, and equipped weapon in the unit's hover window.

VERSION 1 of this file shows the unit's Atk and Agi.
VERSION 2 of this file shows the unit's Level and EXP instead.

The two versions are mutually exclusive, so place only the one you prefer in your project's Plugin folder.
Alternatively, if you don't use either of these files, then the default version of the medium window will be used instead.
This version of the window shows the unit's name, class, and current HP alongside an HP bar.

Another fun note: you can use one of these files without the larger version if you prefer.



UPDATE HISTORY:
1/8/20: Formerly-hardcoded Critical Avoid stat now set to a CRIT_AVOID_STAT constant for easier editing.
	Adjustments for text when unit is unarmed:
	* "(Unarmed)" string shifted downward to closer resemble height of equipped weapon text.
	* Useless stats now appear. In place of a number, uses a wavedash ("-") as in the unit sentence window. (e.g. Hit didn't used to display at all; now it's displayed as "Hit -")

1/12/20: Stat abbreviations now use drawText function instead of drawSignText function to allow for more customization. 
	 * Text color of these is given as the variable statColor, which can be edited.
	 * This applies to the Large setting and medium-v1 setting.

1/16/20: The way the Large setting gathers support bonus information is now more efficient. It used to lag the game when too many units were visible onscreen, but this has been fixed.

2/11/20: Minus sign if Avoid is negative is now white instead of blue in order to match the number's color.

3/24/20: medium-v1 setting now takes support bonuses into account when calculating Atk. (It's already efficient, I tested!)
3/24/20 part 2: fix to medium-v1 so it doesn't crash when trading items

3/26/20: added second version of the large setting that only displays 4 stats, plus comparison images for large & medium