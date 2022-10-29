/**
 * By Repeat.
 * When selected, a unit will say something based on text defined in an Execute Script event.
 * Also, a sound effect will play based on the unit's custom parameter selectfx, which should be set to the ID number of the sound effect to play.
 * Example:
    {selectfx:[1]}
 * 
 * There are three types of frequencies for sfx to play.
 *  * ALWAYSPLAY (0): Sfx plays every single time an able unit is selected.
 *  * FIRSTTURNPLAY (1): Sfx plays every time an able unit is selected, but only on turn 1.
 *  * PLAYONCE (2): Sfx plays the first time the unit is selected and can be reset with an event command.
 * You can change which type is used by editing SFX_TYPE_DEFAULT below.
 * Or, you can change it on a unit-by-unit basis with the unit custom parameter selectfxType.
 * Example:
    {selectfxType:0}
 *  */

(function () {
    var SelectFxEnum = {
        ALWAYSPLAY: 0,
        FIRSTTURNPLAY: 1,
        PLAYONCE: 2
    }

    SFX_TYPE_DEFAULT = SelectFxEnum.PLAYONCE;

    var alias1 = MapEdit._selectAction;
    MapEdit._selectAction = function (unit) {
        var able = false;
        var generator = root.getEventGenerator();

        if (unit) {
            var conditions = [
                true,
                root.getCurrentSession().getTurnCount() === 1,
                !JingleControl.isJingleUsed(unit)
            ];
            var type = unit.custom.selectfxType;

            if (typeof type === 'number') {
                able = conditions[type];
            } else {
                able = conditions[SFX_TYPE_DEFAULT];
            }
        }

        if (unit !== null && unit.getUnitType() === UnitType.PLAYER && !unit.isWait() && root.getCurrentScene() === SceneType.FREE) {
            var selectfx = unit.custom.selectfx;
            var speechObj = unit.custom.selectSpeech;

            if (Array.isArray(selectfx) && able) {
                // pick a random id from the custom parameter array and play it
                var id = Math.floor(Math.random() * selectfx.length);

                var soundHandle = root.createResourceHandle(false, selectfx[id], 0, 0, 0);
                MediaControl.soundPlay(soundHandle);
                JingleControl.setJingleUsed(unit);
            }
            if (typeof speechObj === 'object' && !SpeechControl.isSpeechUsed(unit)) {
                generator.messageShowUnit(speechObj.message, speechObj.pos, unit);
                generator.execute();
                SpeechControl.setSpeechUsed(unit);
            }

        }

        return alias1.call(this, unit);
    }
})();

// Array.isArray polyfill
// ありがとう、キューブ!!
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray 
if (!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === "[object Array]";
    };
}
