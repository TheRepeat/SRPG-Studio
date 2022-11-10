/**
 * By Repeat.
 * Hides the phase change graphic and SFX for certain maps. (The "PLAYER PHASE" graphic and such)
 * Use custom parameter {hidePhaseChange:true} on maps you want to hide this for.
 * 
 * This is a generalized version of another plugin on my github that has the same behavior but only for walking maps.
 * 
 * Functions overridden without an alias:
 *  * TurnMarkFlowEntry._completeMemberData
 */

 (function () {
    // hide the phase change graphic
    var alias1 = TurnMarkFlowEntry._getTurnFrame;
    TurnMarkFlowEntry._getTurnFrame = function () {
        var pic = alias1.call(this);

        var mapInfo = root.getCurrentSession().getCurrentMapInfo();
        if (mapInfo.custom.hidePhaseChange) {
            pic = null;
        }

        return pic;
    }
})();

// This change prevents the 36-frame "pause" at the start of the map and silences the phase change SFX in walk maps.
// Note that this isn't aliased (alias.call(this, turnChange)). It could be rewritten to still remove the "pause" and 
// be aliased, but the phase change SFX would have to play, which I think is unsightly.
TurnMarkFlowEntry._completeMemberData = function (turnChange) {
    var mapInfo = root.getCurrentSession().getCurrentMapInfo();

    if (!this._isTurnGraphicsDisplayable()) {
        this.doMainAction(false);
        return EnterResult.NOTENTER;
    }

    if (!mapInfo.custom.hidePhaseChange) {
        this._counter.disableGameAcceleration();
        this._counter.setCounterInfo(36);
        this._playTurnChangeSound();
    }

    return EnterResult.OK;
}