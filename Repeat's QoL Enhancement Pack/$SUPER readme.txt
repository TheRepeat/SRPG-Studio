	USAGE
You are free to use and modify every plugin in here to your heart's content.
Modification: OK
Redistribution: OK
Commercial use: OK
Adult use: OK
If you use my plugins in your own project, it'd be nice if you credited me as Repeat or TheRepeat, but I won't force you to.

The plugins don't usually rely on each other, so you can pick and choose at your leisure, or use them all.
This collection is just to keep all of these enhancements together.


	WHAT ALL IS IN HERE?
There are a bunch of nice plugins included in this enhancement pack:

Terrain Details, which shows the HP recovery (or damage) of terrain, plus displays skills and other quality of life improvements.
 > R-terrain-details.js

Detailed Unit Window, which expands on the unit hover window in the map view.
 > Everything in the Detailed Unit Window subfolder

Forecast and Map Battle Enhancements:
This is a subfolder of individual plugins that are grouped together for cleanliness. They DO NOT rely on each other.
{
	Danger Skills, which shows icons for an enemy's dangerous skills in the combat forecast. See the file for more info.
	> R-danger-skills.js

	Better No-Animation Combat, which displays attack/accuracy/critical rate even when combat animations are turned off. Comes in two sizes.
	> R-detailed-easy-battle.js

	Easy Battle Pauses, which lets you customize the length of time to wait between each attack when combat animations are off (the vanilla pause time is really short!).
	> R-easy-battle-pauses.js

	Intuitive Seals, which hides battle stats on the combat forecast if the unit will be sealed by the opponent's skill or weapon.
	> R-intuitive-seal.js

	Player Phase Animations, which adds a third choice to the Real Battle config option: show full animations only on player phase, and show map animations on other phases.
	Also lets user reverse the config option by holding Cycle (A/S keys, LB/RB buttons). Think "Hold L to Skip" from 3DS Fire Emblem games.
	> R-player-only-battle.js
}

Objective Window, which adds a new window to the map screen that allows you to display custom text and custom objective information (like enemy count or turns remaining).
Latest version: 3.1
 > Everything in the Objective Window subfolder

Warning Markers, which adds floating icons over dangerous enemies, units that can be spoken to, and supporters.
Also adds an icon to units on the unit selection screen in battle prep who have Talk events during the chapter.
Latest version: 3.7
Credit to McMagister for graciously letting me bundle a copy of their Unit State Animator plugin with my markers plugin that uses it
 > Everything in the Markers subfolder

Keybind Display + Rebinding. Displays controls onscreen during normal gameplay and allows players to rebind their controls in-game instead of in game.ini.
Latest version: 1.5
 > Everything in the Keybind Display subfolder

Alternate Controls. Slightly tweaks the default controls to remove redundancies and make the user experience more intuitive.
 > R-alt-controls.js

Show Weapon Type, which shows either the icon or the name of a weapon's type when checking its stats.
 > R-show-weapontype.js

Item Drop Indicators, which places an icon over enemies who have an item they will drop.
Requires McMagister's Unit State Animator, which you can nab from the Markers folder.
 > 0_mcmagister-unit-state-animator.js
 > R-drops-items.js

Unit Roster, which adds new options to the map commands that allow you to view the full rosters of player, enemy, and ally units on the field, including plenty of information about all of them and allowing you to snap your cursor to a unit by selecting them in the menu.
 > R-unit-roster.js

Visualize Sortie. If a unit is not selected in battle prep, their name and charchip will be grayed out in Manage Items.
 > R-visualize-sortie.js

Flash White On Hit. Modified from a Claris plugin. Units will briefly flash white when taking damage in Easy Battle (=animations off).
 > CL-R-flash-white.js

Always Show Dialogue Arrow. Normally, a "proceed" arrow won't show on the final line of dialogue, which this plugin changes.
 > R-dialogue-arrow-always.js

Faster Healing. Replaces the slow vanilla healing animation with a much quicker (and imo less annoying) one.
 > R-faster-healing.js

Show Difficulty on Save/Load. On the save/load screen, the save file's difficulty mode is also displayed over the map preview. Also fixes the misalignment of the colons in the Play Time display.
 > R-show-save-difficulty.js

Single Save. After you save your game, instead of being forced to close the save window yourself, the screen instead closes automatically. More intuitive.
Optionally, you can add a special sound effect for saving, too.
 > R-single-save.js

Fullscreen Config. Adds the ability to toggle fullscreen/windowed mode to the in-game Config settings.
 > R-fullscreen-config.js

Repair Polish. Improves the UX for Repair items, not letting you repair unbreakable or unused items. Includes UI tweaks to make the process more logical too.
 > R-repair-polish.js

Steal Polish. Improves the UX for Steal, hiding the steal command when there is nothing to steal or reverse-pickpocket.
 > R-steal-polish.js

Contact me on Discord if you need help getting anything to work!


UPDATE HISTORY (not comprehensive):
2/11/2020: compiled separate plugins into enhancement pack
2/17/2020: added detailed easy battle
2/24/2020: added intuitive seals
4/21/2020: updated warning markers & detailed unit window
6/9/2020 (nice): show weapontype plugin added
6/18/2020: item drop indicator plugin added
9/27/2020: refactoring to add 'R-' prefix to all filenames to help you organize. Messes with history on GitHub, but history prior to 9/27 can be viewed in cmd/terminal with git log --follow <file>
10/12/2020: detailed unit window overhaul
1/3/2021: added prep talk markers
4/14/2021: added player phase animations
5/9/2021: added danger skills, new fnality for detailed easy battle
5/18/2021: added unit roster
6/14/2021: added visualize sortie
8/15/2021: "Hold L to Skip" added to player phase anims
8/28/2021: warning markers overhaul, cleaning & bugfixes
12/4/2021: terrain details updated to v2.0
12/5/2021: added easy battle pauses
3/31/2022: post-SoN v0.1 github overhaul, incl. objective window 2.0, flash white, always show dialogue arrow
8/14/2022: item drops v2.0
9/11/2022: keybind display/rebind plugin
8/7/2024: objective window v3.0
1/20/2025: repair polish
5/27/2025: added show save difficulty
12/13/2025: steal polish