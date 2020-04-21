	ABOUT
With this plugin, when a unit is selected, a particular sound is played.
Similar to games like Fire Emblem Heroes where units play a particular voice 
line when selected.

	HOW TO USE
(If you haven't already, go to Tools > Options > Data and select 'Display id next to data name'.)

Use {selectfx:#} in your unit's custom parameters in the database, where '#' is the ID number 
of the SFX asset you want your character to use. For example, {selectfx:0} to play the first sound asset.

Note that this refers to the IDs in the Original section, not Runtime. If you want to use an RTP sound effect, 
you'll have to export and import the particular file.

	WHICH FILES DO YOU NEED?
Each file behaves differently. They override each other, so only use the one(s) you need.

 select-jingle-all.js :
The default one. Any time a player unit is selected, they play their sound effect if they have one.

 select-jingle-first.js :
Units will only play their sound effect if it is the first turn of the map.

 select-jingle-once.js & select-jingle-once-obj.js (these two MUST be used together) :
Units will only play their sound effect a single time. Using an event command (preferably in an opening event), you can reset 
all sound effects so they can be played one more time per unit.

To do this:
1. Create an event that runs the Execute Script event command
2. Set the type to Execute Code
3. Copy the following command into the Code box: JingleControl.resetUses();
   (Be sure to include the parentheses!)

NOTE: You can make a Map Common Event of type "Opening Events" if you want this to occur every chapter.