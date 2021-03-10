	ABOUT
This plugin makes things happen when a player unit is selected.
Currently, there are two functionalities of this plugin:
   A) When a blue unit is selected, a particular sound is played.
      Similar to games like Fire Emblem Heroes where units play a particular voice line when selected.
   B) When a blue unit is selected, an event will play where they speak custom dialogue.
      Similar to the endgame of Fire Emblem Echoes, where each unit has a special final chapter speech when selected.

	HOW TO USE
(If you haven't already, go to Tools > Options > Data and select 'Display id next to data name'. This is absolutely essential.)

 (A) Select FX
Use {selectfx:#} in your unit's custom parameters in the database, where '#' is the ID number of the SFX asset you want your character to use. 
For example, {selectfx:0} to play the first sound asset.

(Note that this refers to the IDs in the Original section, not Runtime. If you want to use an RTP sound effect, you'll have to export and import the particular file.)

NOTE: Under the default behavior, units will only play their sound effect a single time, until you reset their sfx via event.
To reset:
1. Create an event that runs the Execute Script event command
2. Set the type to Execute Code
3. Copy the following command into the Code box: JingleControl.resetUses();
   (Be sure to include the parentheses!)
You can repeat this whenever you want units to play their sfx again. For example, if you want units to play their sfx the first time they are selected in every chapter, you can put this event command in a Map Common Event of type "Opening Events".

If you want to reset only a single unit, perform the following:
1. Create an event that runs the Execute Script event command
2. Set the type to Execute Code
3. Copy the following command into the Code box: JingleControl.resetSingleUnit(unitId);
   Where unitId is a number corresponding to the database ID of the unit you want to reset.


 (B) Select Speech
Select Speech is a little trickier, but if you know how to use Execute Script event commands (and especially if you have the basic knowledge of how to call a function in JavaScript), you're golden.

First, you have to initialize the dialogue:
1. Create an event that runs the Execute Script event command.
2. Set the type to Execute Code.
3. Use this command: SpeechControl.setSpeech(message, unitId, pos);
   But, whoa there, you can't just copy and paste that and expect it to work. You need to have an actual message and specify a unit to do the talking!
   Replace the unitId parameter with a number corresponding to the ID number of the unit you want to attach this dialogue event to.
   Replace the message parameter with a string--that is, text enclosed in single quotes--to give an actual message.
   Replace the pos parameter with one of these three: MessagePos.TOP, MessagePos.CENTER, or MessagePos.BOTTOM, depending on where you want the textbox to be.

Here is an example of a valid Select Speech event:
   SpeechControl.setSpeech('Some sample dialogue', 0, MessagePos.TOP);
This is all you need for the most basic application of this plugin.


	ADVANCED USE OF SELECT SPEECH
Basics not enough for you? Do you want control characters, line breaks, and quotes? Here's where things get tricky.

If you need to use single quotes, you must 'escape' the single quote with a backslash. Like this:
   SpeechControl.setSpeech('Here\'s my sample dialogue. You\'re welcome!', 5, MessagePos.CENTER);

If you just write out a bunch of ordinary text in the message string, it will stretch out past the textbox and even off the screen.
To add line breaks, put in \n where you feel it's appropriate.

To add control characters in a Show Message event in-engine, you would do something like this: \C[4]Look, red text!\C[0]
It behaves very similarly in this plugin, but these backslashes must also be escaped... with a second backslash. Example: \\C[1]Look, blue text!\\C[0]
One big boon of this plugin is that, unlike with in-engine Show Message events, CONTROL CHARACTERS TAKE NO LINE SPACE. That is pretty rad, imo.

Because this way of writing text makes longer bits of dialogue... kind of a pain, I have personal recommendations for how you can make that easier on yourself.
Your mileage may vary.
1. Write out all of your dialogue in some Show Message event in-engine. Do not include any control characters.
2. Press OK to close and save the message.
3. Reopen that Show Message event. Copy all of the text and paste it in Notepad.
4. Place \n at the start of every line except the first. If there is a gap between lines, use more than one \n.
5. Escape every single-quote with a backslash. (If the game crashes from this plugin, the most likely culprit is that you forgot to escape a quote.)
6. Now, add all of the control characters you want. Remember to use double slashes.
7. When you're happy with it, copy all of your new text and paste it in the same document. Now, put all of it on one line. It'll look ugly, I know. (It's important you keep a copy of the formatted, multi-line text in case you need to edit it later. Saves you some heartache.)
8. Paste your one line of formatted dialogue into the message parameter of SpeechControl.setSpeech.
9. Should be good to go!

Below is a complex example you can paste into your project to use as a reference and see what this plugin can do:

SpeechControl.setSpeech('Unit Information: Lyn is the \\C[1]blue unit\\C[0]. The enemy \nunits are \\C[4]red\\C[0]. Mark, you are \\C[3]green\\C[0].\n\nEssentially, battle consists of \\C[1]blue\\C[0] (allied) units and \n\\C[4]red\\C[0] (enemy) units taking turns moving on the field. \n\nYou\'re only here as a strategist, Mark. You will only \nappear during special events.\n\nYour job as strategist is to place the cursor on \\C[1]blue\\C[0] \n\\C[1]units\\C[0] to issue their orders. First, select a unit. Place \nthe cursor on Lyn and press \\C[4]the A Button\\C[0].', 0, MessagePos.CENTER);
