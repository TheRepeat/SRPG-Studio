/**
 * By Repeat.
 * When selected, a unit will say something based on text defined in an Execute Script event.
 * Also, a sound effect will play based on the unit's custom parameter.
 * @param {number} selectfx - the ID number of the sound effect to play.
 * The frequency of how often this sfx plays can be customized by changing the value of SELECT_FX_TYPE below.
 *  */

(function () {
    /**
     * ALWAYSPLAY: Sfx plays every single time an able unit is selected.
     * FIRSTTURNPLAY: Sfx plays every time an able unit is selected, but only on turn 1.
     * PLAYONCE (default): Sfx plays the first time the unit is selected.
     * * With the PLAYONCE option, you can:
     * * use JingleControl.resetUses(); in an Execute Script command to allow the sfx to 
     *   play again for all units.
     * * use JingleControl.resetSingleUnit(unitId); in an Execute Script command to allow 
     *   the sfx to play again for a single unit.
     */
    var SelectFxEnum = {
        ALWAYSPLAY: 0,
        FIRSTTURNPLAY: 1,
        PLAYONCE: 2
    }

    // Edit this value
    SELECT_FX_TYPE = SelectFxEnum.PLAYONCE;

    var alias1 = MapEdit._selectAction;
    MapEdit._selectAction = function (unit) {
        var able = false;
        var generator = root.getEventGenerator();
        if (unit) {
            switch (SELECT_FX_TYPE) {
                case SelectFxEnum.ALWAYSPLAY:
                    able = true;
                    break;
                case SelectFxEnum.FIRSTTURNPLAY:
                    able = root.getCurrentSession().getTurnCount() === 1;
                    break;
                case SelectFxEnum.PLAYONCE:
                    able = !JingleControl.isJingleUsed(unit);
                    break;
                default:
                    break;
            }
        }
        if (unit !== null && unit.getUnitType() === UnitType.PLAYER && !unit.isWait() && root.getCurrentScene() === SceneType.FREE) {
            if (typeof (unit.custom.selectfx) != 'undefined' && able) {
                var soundHandle = root.createResourceHandle(false, unit.custom.selectfx, 0, 0, 0);
                MediaControl.soundPlay(soundHandle);
                JingleControl.setJingleUsed(unit);
            }
            if (unit.custom.selectSpeech && !SpeechControl.isSpeechUsed(unit)) {
                generator.messageShowUnit(unit.custom.selectSpeech.message, unit.custom.selectSpeech.pos, unit);
                generator.execute();
                SpeechControl.setSpeechUsed(unit);
            }

        }

        result = alias1.call(this, unit);
        return result;
    }
})();