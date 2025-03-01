/**
 * By Repeat.
 * 
 * Vanilla damage effects are really fast. A quick animation + sfx plays simultaneously to a number popping up, and that's it.
 * Healing is much slower, being a healing animation + sfx followed by an animation of the gauge increasing with more sfx.
 * Takes much longer and is much more annoying, especially when sped up.
 * This plugin matches the speed of healing effects to the speed of damage effects.
 * 
 * By default, healing will flow like this: animation -> hp increased -> number popup
 * If you change SHOW_POPUP_DURING_ANIME to true, healing will flow like this: animation + popup simultaneously -> hp increased
 * In my personal opinion, the former looks better, but you do you.
 * 
 * Keep in mind that the length of the healing animation will still factor into how long the whole healing process takes.
 * i.e., if you use a shorter animation for HP recovery, this plugin will be more effective.
 * 
 * Changelog:
 *  * 2/28/2025 - Fixed animation hang when Damage Popup config option is Off 
 *
 * Functions overridden without an alias:
 *  * (not a function but) RecoveryBall is overridden entirely instead of simply adding functions to it, for cleanliness
 *  * HpRecoveryEventCommand.moveEventCommandCycle
 *  * HpRecoveryEventCommand.drawEventCommandCycle
 *  * HpRecoveryEventCommand._moveAnime
 *  * HpRecoveryMode enum is replaced, fuck it
 */

SHOW_POPUP_DURING_ANIME = false;

(function () {
    var alias1 = HpRecoveryEventCommand._prepareEventCommandMemberData;
    HpRecoveryEventCommand._prepareEventCommandMemberData = function () {
        alias1.call(this);

        this._isPopupAllowed = EnvironmentControl.isDamagePopup();

        if (this._isPopupAllowed) {
            this._setupRecoveryPopup();

            this._popupDone = false;
        }
    }
})();

var RecoveryBall = defineObject(DamageBall, {
    _hangTime: null,
    _hangTimeCounter: null,
    _incrementAmount: null,
    _isSteady: false,
    _yPrev: null,

    initialize: function () {
        this._hangTimeCounter = null;

        this._incrementAmount = 32;
        this._yPrev = null;
    },

    _getNumberColorIndex: function () {
        return 2; // green
    },

    moveBall: function () {
        if (this._checkWait()) {
            return MoveResult.CONTINUE;
        }

        if (!this._hangTimeCounter && this._isSteady) {
            this._hangTimeCounter = createObject(CycleCounter);
            this._hangTimeCounter.setCounterInfo(20);
        }

        if (this._hangTimeCounter) {
            if (this._hangTimeCounter.moveCycleCounter() !== MoveResult.CONTINUE) {
                this._isLast = true;
                return MoveResult.END;
            }
        }

        return MoveResult.CONTINUE;
    },

    drawBall: function (xScroll, yScroll) {
        var n = this._incrementAmount * -1;
        var colorIndex = this._getNumberColorIndex();
        var x = this._x - xScroll;
        var y = this._y - yScroll - n;
        var width = UIFormat.BIGNUMBER_WIDTH / 10;
        var height = UIFormat.BIGNUMBER_HEIGHT / 5;
        var xSrc = this._damage * width;
        var ySrc = height * colorIndex;
        var pic = this._getNumberUI();

        // smoothly rises up instead of the bounce that damageball does
        this._incrementAmount = Math.ceil(this._incrementAmount / 1.25);

        // when the number stops rising, start the "hang time" counter (a slight pause at the end, looks nice)
        if (this._yPrev === y) {
            this._isSteady = true;
        }

        this._yPrev = y;

        if (pic === null) {
            return;
        }

        pic.drawStretchParts(x, y, width, height, xSrc, ySrc, width, height);
    }
});

// from ANIME and WINDOW to ANIME and POPUP
// Functionally didn't actually HAVE to rename WINDOW to POPUP, but extra clarity is more important than worrying about 
// extremely rare compatibility issues.
var HpRecoveryMode = {
    ANIME: 0,
    POPUP: 1
};

HpRecoveryEventCommand._recoveryPopup = null;
HpRecoveryEventCommand._popupDone = null;
HpRecoveryEventCommand._isPopupAllowed = null;
HpRecoveryEventCommand._setupRecoveryPopup = function () {
    var effect = createObject(DamagePopupEffect);
    var dx = Math.floor((DamagePopup.WIDTH - GraphicsFormat.CHARCHIP_WIDTH) / 2);
    var dy = Math.floor((DamagePopup.HEIGHT - GraphicsFormat.CHARCHIP_HEIGHT) / 2);
    var targetUnit = this._targetUnit;
    var xPixel = LayoutControl.getPixelX(targetUnit.getMapX());
    var yPixel = LayoutControl.getPixelY(targetUnit.getMapY());

    if (yPixel >= root.getGameAreaHeight() - 32) {
        dy -= 32;
    }
    else {
        dy += 32;
    }
    dx -= 32;

    /**
     * If you pass the recoveryValue as a negative number, the RecoveryBall class will be used instead of DamageBall
     * for the number that pops up.
     */
    effect.setPos(xPixel + dx, yPixel + dy, this._recoveryValue * -1);
    effect.setAsync(true);
    effect.setCritical(false);
    this._recoveryPopup = effect;
}

HpRecoveryEventCommand.moveEventCommandCycle = function () {
    var mode = this.getCycleMode();
    var result = MoveResult.CONTINUE;

    if (SHOW_POPUP_DURING_ANIME && this._isPopupAllowed) {
        result = this._movePopupAndAnime();
    } else {
        if (mode === HpRecoveryMode.ANIME) {
            result = this._moveAnime();
        }
        else if (mode === HpRecoveryMode.POPUP) {
            result = this._movePopup();
        }
    }

    return result;
}

HpRecoveryEventCommand.drawEventCommandCycle = function () {
    var mode = this.getCycleMode();


    if (SHOW_POPUP_DURING_ANIME && this._isPopupAllowed) {
        this._drawPopupAndAnime();
    } else {
        if (mode === HpRecoveryMode.ANIME) {
            this._drawAnime();
        }
        else if (mode === HpRecoveryMode.POPUP) {
            this._drawPopup();
        }
    }
}

HpRecoveryEventCommand._moveAnime = function () {
    var isNextMode = false;

    if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
        isNextMode = true;
    }

    if (this._isAsyncAnime()) {
        // Check if the current frame index has exceeded the half of frame number.
        if (this._dynamicAnime.getFrameIndex() > (this._dynamicAnime.getFrameCount() / 2)) {
            isNextMode = true;
        }
    }

    if (isNextMode) { // only changes are in this if
        this.mainEventCommand(); // heal right before the popup (a little bit more satisfying imo)

        if (this._isPopupAllowed) {
            // skip popup if the damage popup config item is off
            this.changeCycleMode(HpRecoveryMode.POPUP);
        } else {
            return MoveResult.END;
        }
    }

    return MoveResult.CONTINUE;
}

HpRecoveryEventCommand._movePopup = function () {
    if (this._recoveryPopup !== null) {
        if (this._recoveryPopup.moveEffect() !== MoveResult.CONTINUE) {
            return MoveResult.END;
        }
    }

    return MoveResult.CONTINUE;
}

HpRecoveryEventCommand._movePopupAndAnime = function () {
    var isNextMode = false;

    if (this._dynamicAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
        isNextMode = true;
    }

    if (this._isAsyncAnime()) {
        // Check if the current frame index has exceeded the half of frame number.
        if (this._dynamicAnime.getFrameIndex() > (this._dynamicAnime.getFrameCount() / 2)) {
            isNextMode = true;
        }
    }

    // draw popup
    if (this._recoveryPopup !== null) {
        if (this._recoveryPopup.moveEffect() !== MoveResult.CONTINUE) {
            this._popupDone = true;
        }
    }

    // finish when anime and popup have both completed
    if (isNextMode && this._popupDone) {
        this.mainEventCommand();
        return MoveResult.END;
    }

    return MoveResult.CONTINUE;

}

HpRecoveryEventCommand._drawPopup = function () {
    if (this._recoveryPopup !== null) {
        this._recoveryPopup.drawEffect(0, 64, false);
    }
}

HpRecoveryEventCommand._drawPopupAndAnime = function () {
    if (this._recoveryPopup !== null) {
        this._recoveryPopup.drawEffect(0, 64, false);
    }

    this._dynamicAnime.drawDynamicAnime();
}
