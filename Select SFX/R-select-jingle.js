/* By Repeat.
   Plays a specific sfx for a unit when they are selected, but only the first time they are selected.
 */

(function () {
    SELECT_FX_TYPE = SelectFxType.PLAYONCE;

    var SelectFxType = {
        ALWAYSPLAY: 0,
        FIRSTTURNPLAY: 1,
        PLAYONCE: 2
    }
    var alias1 = MapEdit._selectAction;
    MapEdit._selectAction = function (unit){
        var condition = false;
        switch (SELECT_FX_TYPE) {
            case SelectFxType.ALWAYSPLAY:
                condition = true;
                break;
            case SelectFxType.FIRSTTURNPLAY:
                condition = root.getCurrentSession().getTurnCount()===1;
                break;
            case SelectFxType.PLAYONCE:
                condition = !JingleControl.isJingleUsed(unit);
                break;
            default:
                break;
        }

        if (unit != null && unit.getUnitType() === UnitType.PLAYER && !unit.isWait() && typeof(unit.custom.selectfx)!='undefined' 
                         && root.getCurrentScene() === SceneType.FREE && !JingleControl.isJingleUsed(unit)) {

            var soundHandle = root.createResourceHandle(false, unit.custom.selectfx, 0, 0, 0);  
            MediaControl.soundPlay(soundHandle);
            JingleControl.setJingleUsed(unit);
        }

        result = alias1.call(this,unit);
        return result;
    }
})();