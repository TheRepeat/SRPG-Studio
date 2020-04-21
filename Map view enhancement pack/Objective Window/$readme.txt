This plugin gives the map window the functionality of a GBA Fire Emblem game's map window.
Along with the unit window and terrain window from vanilla SRPG Studio, this adds an Objective window as well.


	TO USE:
In your map's custom parameters, use the following format:
{objective:true}
If you do not do this, the objective window will be hidden.

By default, the objective is blank at the start of every map.
To change the current objective, follow these steps:
1. Have some event call an Execute Script command
2. Set the type to Execute Code
3. Copy the following snippet into the Code box: 
		MapParts.Objective._changeObjective('Your text here');
   If you set the objective to '' (that's two single quotes), then the objective will be seen as empty and the window will be hidden.
   You can change the objective at any time by calling that function again with new text.

	ABOUT
move-terrain.js adjusts the positioning of the terrain window to match GBAFE. It's positioned on the bottom of the
screen now, instead of the right side. The unit window's movement has also been adjusted to match GBAFE.

map-objective-editable.js adds the functionality of the objective window. If you opt for no text or if 'objective' is not 
set to true in custom parameters, then the objective window doesn't appear.