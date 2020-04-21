	ABOUT
This plugin allows for warning markers like later FE games and many GBAFE romhacks use.
When a player unit is selected, the following units have a marker put over their heads:
  - Enemies with a dangerously high critical rate
  - Enemies with a weapon effective against the player unit (e.g. an armorslayer)
  - Any unit that the selected unit is able to have a conversation with
  - Specific enemy units or weapons with the custom parameter {warning:true}
  - Allies that grant support bonuses to the selected unit

	TO USE
Unit State Animator by McMagister is required. If you don't already have it from a different plugin, it's bundled with this one as well.
If you haven't already, in SRPG Studio, go into Tools > Options > Data and check "Display id next to data name".

First, import your file of choice into Icon within SRPG Studio (for example, markers-placeholder-icon.png). Remember its ID number.

In the file warn-markers-values.js, you'll see that each icon follows the following template:
    isRuntime:
    id:
    xSrc:
    ySrc:
isRuntime is a true/false value and determines if the file uses a custom imported asset (false) or a default Runtime asset (true).
id refers to the ID number of the file you added to the icon folder in SRPG Studio. If you're just using the icon file included with this, then this is the only value that you need to edit.
xSrc and ySrc are the positions of the particular icon you want to use WITHIN the file. There's an example image that shows what these mean inside this folder.


	KNOWN ISSUES
After a talk conversation, the state will not be removed from the target until the selected unit's action ends. This is relevant when 
the unit has Canto (AKA Use Leftover Mov) or if the action-after-talk plugin is being used, but it is only a visual quirk and does not
present any real problems.

	TO DO
Different icons for different support types. For example, drawing C/B/A/S icons for the typical Fire Emblem-style support hierarchy, or something 
less traditional, like numbered support tiers or displaying affinity.


	UPDATE HISTORY
12/19/2019: fixed bug where game would crash if a talk partner wasn't on the map
1/9/2020: fixed bug where states were not properly removed when switching units' sortie positions in battle preparations
1/13/2020: added unit & weapon warning states with custom parameter functionality
1/13/2020 part 2: re-fixed the bug where the game would crash if a talk partner isn't on the map
1/13/2020 part 3: split the editable values into a second file because all this delicate copy-pasting every time I want to edit things is getting on my nerves
4/6/2020: small edit to the placeholder icon for the Talk marker
4/21/2020: Major overhaul by McMagister. (They even fixed the mouse bug, god bless.) No longer uses states; everything is handled in the values file instead
	   New placeholder image file added
	   Helper file added
	   Support markers added
