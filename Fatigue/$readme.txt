Fatigue System
By Repeat
Version 1.0

	ABOUT
This plugin enables a fatigue system akin to Fire Emblem: Thracia 776. When units perform actions, such as engaging in combat, a new Fatigue stat is incremented. If that unit's Fatigue stat equals or exceeds the user's maximum HP by the end of the battle, then the unit will not be able to sortie on the next map. Fatigue carries over across maps, but resets to 0 if the unit is not sortied for a battle. This plugin also adds the ability to create a custom S Drink item, which manually resets the user's Fatigue to 0.

These actions will increment a unit's Fatigue stat:
 - Participating in a round of combat at all
 - Using a staff
 - "Dancing" (using any "Again"-style unit command)
 - Stealing (including reverse-pickpocketing)

The unit is shown as fully fatigued by the Fatigue stat's numerical value turning red in the unit menu. If a unit is fully fatigued, their name is red and unselectable in the Unit Select screen in battle preparation. (Note: if a unit is force deployed, then their fatigue will be ignored and they will still sortie.)


	TO USE
If you're only using this plugin's most basic features, which closely resemble those of Thracia 776, then this plugin is plug-and-play. However, there are a few optional niceties you can take advantage of.


	CUSTOM PARAMETERS (optional)
With a unit custom parameter fatigueRate, you can determine a multiplier at which a unit's Fatigue stat increases, rather than sticking to the default of 1. 0 means the character will never increase their Fatigue, like Leif from Thracia 776. 2 means the unit's Fatigue increases at double speed.
Example:
{fatigueRate:0}

By default, every weapon and staff costs 1 Fatigue to use. With custom parameter fatigueCost, that can be customized on a per-item basis. This could be used to recreate the system in Thracia 776 where higher-rank staves cost more Fatigue than lower-rank ones.
Example:
{fatigueCost:5}

If you want fatigue to be disabled for a particular difficulty, give that difficulty the custom parameter noFatigue and the Fatigue stat will not increment nor display.
Example:
{noFatigue:true}

	S DRINK ITEMS
To create an S Drink item:
 1. create a new item in the database
 2. change Item Type to Custom
 3. click the Item Effects menu and enter 'S Drink' (without the quotes) in the Keyword field

The only way in which this plugin significantly differs from Thracia 776's implementation of Fatigue is in the way S Drinks work in battle preparations. Instead of just the act of holding an S Drink being enough to allow a unit to be selected and sortied, the S Drink can instead simply be consumed from Manage -> Use Item like other consumable items.


	MANUALLY RESETTING FATIGUE
You can reset the Fatigue of all player units to 0 by using an event command if you'd like:
 1. create an event wherever you want it
 2. add an Execute Script event command
 3. click on the Execute Code radio button
 4. in the big Code textbox, paste the following line of code: 
FatigueControl.resetAllFatigue();

If you want to do the same thing with one single unit instead of all of them, it's a bit more complicated:
 1. create an event wherever you want it
 2. add an Execute Script event command
 3. in the Original Data tab, change the value of Unit to the unit whose fatigue you want to reset
 4. back in the first tab, click on the Execute Code radio button
 5. in the big Code textbox, paste the following chunk of code:

(function() {
var originalContent = root.getEventCommandObject().getOriginalContent();
var unit = originalContent.getUnit();
FatigueControl.resetFatigue(unit);
})();

^Don't forget the last line! Should be 5 lines of code you're pasting.


	FURTHER NOTES
You can customize more of this plugin by opening the file 0_fatigue-config.js in a program like VS Code or Notepad++. You can change the red color of a fully fatigued unit's name, or whether the fatigue stat is displayed to the player, or the shortened name of the stat, for example.

Have fun!


	UPDATE HISTORY
8/13/2022: v1.0, Initial release
