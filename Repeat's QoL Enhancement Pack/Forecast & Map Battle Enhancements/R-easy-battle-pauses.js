/**
 * By Repeat.
 * Adds slightly longer pause between attacks in easy battle (map animations). You can edit the number of frames to pause for in the PauseFrames object. 
 * 1 frame = 1/60th of a second, so 30 will be half a second. 
 *    This is automatically scaled if your game is 30FPS instead of 60FPS, i.e. 30 will never not be half a second.
 * The frames are added *before* the attack starts, so the first attack has a separate value if you want that pause to be a different length than the pauses between other attacks.
 *    If my explanation is bad here then you can mess with the numbers and see what I mean for yourself.
 * 
 * The following function is overwritten without an alias. Be aware that if other plugins use this function, a conflict could occur.
 *  * EasyBattle._processModeActionStart
 */

(function () {
    var PauseFrames = {
        FIRST: 10,
        REST: 30
    }

    EasyBattle._firstAttackDone = false;
    EasyBattle._processModeActionStart = function () {
        if (this._battleTable.enterActionStart() === EnterResult.NOTENTER) {
            var pauseFrames = this._firstAttackDone ? PauseFrames.REST : PauseFrames.FIRST;
            this._changeIdleMode(EasyBattleMode.BATTLE, pauseFrames);
            this._firstAttackDone = true;
        }
        else {
            this.changeCycleMode(EasyBattleMode.ACTIONSTART);
        }
    }
})();
