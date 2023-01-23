/**
 * By Repeat.
 * Creates a weapon that turns a player unit into an ally unit upon using a certain weapon in combat.
 * I'm gonna call this "autoberserk".
 * Idea credited to Excelblem: https://youtu.be/ig7HoszbQmI
 * 
 * Custom parameter {autoberserk:true} on the weapon to enable this effect
 * 
 * Notes:
 *  * No further effects occur if the unit is not on the Player faction. The weapon behaves as normal for allies and enemies.
 *  * The unit, if alive, is reverted to a player unit at the end of the map (by default).
 *  * AI will always prioritize using the autoberserk weapon if they have it (by default). They should anyway since it should be a really good weapon, but best to be sure.
 *  * You can't trade the autoberserk weapon away while a unit is berserked. I mean, blue & green units can't even trade by default. Easiest implementation of all time.
 *  
 * Besides EOC, should it wear off in other circumstances? All optional custom parameters for the weapon:
 *  * {autoberserkTurns:n} - wears off after n number of turns. This includes the same turn that the unit is changed to an ally
 *  * {autoberserkBreakCures:true} - wears off if the weapon breaks
 *  * {autoberserkKills:n} - wears off at start of Player Phase after killing n number of enemies. This does NOT count if an enemy is killed by the same attack that autoberserks the player unit
 *  * Status-curing staves that have custom parameter {curesAutoberserk:true} can cure autoberserk status on units, as long as the staff is able to affect ally units
 */

var AutoberserkControl = defineObject(BaseObject, {
    updateTurnsLeft: function () {
        var list = AllyList.getAliveList();
        var count = list.getCount();

        for (var i = 0; i < count; i++) {
            var unit = list.getData(i);

            if (unit.custom.isBerserked && unit.custom.abTurns > 0) {
                unit.custom.abTurns -= 1;
            }

            if (unit.custom.abTurns === 0) {
                this.removeAutoberserk(unit);
            }
        }
    },

    updateKillsLeft: function () {
        var list = AllyList.getAliveList();
        var count = list.getCount();

        for (var i = 0; i < count; i++) {
            var unit = list.getData(i);

            if (unit.custom.isBerserked && unit.custom.abKills === 0) {
                this.removeAutoberserk(unit);
            }
        }
    },

    // unit is self-berserked if they completed an attack using a weapon with a specific custom parameter
    conditionallySetAutoberserk: function (unit) {
        if (DamageControl.isLosted(unit)) {
            return;
        }

        var weapon = ItemControl.getEquippedWeapon(unit);

        if (DamageControl.isLosted(unit) || !weapon || unit.getUnitType() !== UnitType.PLAYER) {
            return;
        }

        // In some functions, the unitAssign event would crash the game with a memory overflow error (c0000005)
        // That's why in some situations, I just set custom parameters in order to call this later in a function where it DOES work, like PreAttack._doEndAction
        if (weapon.custom.autoberserk) {
            var generator = root.getEventGenerator();
            var anime = root.queryAnime('realcritical');

            this.setParameters(unit, weapon);
            generator.mapPosOperation(unit, unit.getMapX(), unit.getMapY(), anime);
            generator.unitAssign(unit, UnitType.ALLY);
            generator.execute();
        }
    },

    // unit can be un-berserked if their weapon broke or killed enough enemies
    conditionallyUnsetAutoberserk: function (active, passive) {
        if (active.custom.justBrokeWeapon) {
            this.removeAutoberserk(active);
        }

        if (passive.custom.justBrokeWeapon) {
            this.removeAutoberserk(passive);
        }

        var activeKills = active.custom.abKills;

        if (DamageControl.isLosted(passive) && activeKills > 0) {
            activeKills -= 1;

            active.custom.abKills = activeKills;
            // For some reason I can't remove autoberserk *in this if statement specifically*, so it just happens at start of PP
            // This unitAssign event command is SUPER finicky and crashes without an error message. Not a big fan
        }
    },

    removeAutoberserk: function (unit) {
        root.log('reverting...');
        var generator = root.getEventGenerator();
        var anime = root.queryAnime('realdamage');

        this.removeParameters(unit);
        generator.mapPosOperation(unit, unit.getMapX(), unit.getMapY(), anime);
        generator.unitAssign(unit, UnitType.PLAYER);
        generator.execute();
    },

    resetAllBerserkedUnits: function () {
        var list = AllyList.getAliveList();
        var count = list.getCount();

        for (var i = 0; i < count; i++) {
            var unit = list.getData(i);

            if (unit.custom.isBerserked) {
                this.removeAutoberserk(unit);
            }
        }
    },

    setParameters: function (unit, weapon) {
        unit.custom.isBerserked = true;

        if (typeof weapon.custom.autoberserkTurns === 'number' && typeof unit.custom.abTurns !== 'number') {
            unit.custom.abTurns = weapon.custom.autoberserkTurns;
        }

        if (typeof weapon.custom.autoberserkKills === 'number' && typeof unit.custom.abKills !== 'number') {
            unit.custom.abKills = weapon.custom.autoberserkKills;
        }
    },

    removeParameters: function (unit) {
        unit.custom.isBerserked = undefined;
        unit.custom.abTurns = undefined;
        unit.custom.abKills = undefined;
        unit.custom.justBrokeWeapon = undefined;
    }
});
