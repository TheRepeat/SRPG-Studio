/* By Repeat.
   Plays a specific sfx for a unit when they are selected, but only on turn 1. 
 */

(function () {

    var alias1 = MapEdit._selectAction;
    MapEdit._selectAction = function (unit){


        if (unit != null && unit.getUnitType() === UnitType.PLAYER && !unit.isWait() && typeof(unit.custom.selectfx)!='undefined' 
                && root.getCurrentScene() === SceneType.FREE && root.getCurrentSession().getTurnCount()===1) {
            var soundHandle = root.createResourceHandle(false, unit.custom.selectfx, 0, 0, 0);  
            MediaControl.soundPlay(soundHandle);
        }

        result = alias1.call(this,unit);
        return result;
    }


})();