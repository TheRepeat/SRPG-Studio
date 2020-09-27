/* By Repeat.
   Plays a specific sfx for a unit when they are selected, but only the first time they are selected.
 */

(function () {
    var alias1 = MapEdit._selectAction;
    MapEdit._selectAction = function (unit){
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