This plugin adds functionality to terrain that changes combat in a similar manner to Pokemon's Trick Room.
That is, during combat, if either unit is standing on this "trick room" terrain, then the slower unit will 
be the one that can follow-up attack, rather than the faster unit.

	ABOUT
There are two variants: the default Trick Room, and the alternative that I'll call "Super Trick Room."

Trick Room is the normal one that takes the Pursuit threshold into account; that is, just like how a unit may 
need to have 4 extra Speed to be able to double in normal circumstances, the slower unit would in this case 
need to have 4 LESS Speed in order to double.

Super Trick Room is a little more extreme: it ignores the Pursuit threshold, so if a unit is slower AT ALL, then that unit 
will double. I figure, since this plugin will likely be used as a one-chapter gimmick for most kinds of projects, this could 
make the gimmick suitably threatening and memorable. :)

	USAGE
To give your terrain Trick Room, use the following custom parameter: {trick:true}

To give your terrain Super Trick Room, use the following custom parameter: {supertrick:true}