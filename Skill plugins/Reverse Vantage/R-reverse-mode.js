/**
 * By Repeat.
 * Another "reverse vantage" script but this time based on difficulty.
 * Essentially it lets you have a Lunatic' mode (aka Reverse Lunatic) like FE12, where enemies always go first.
 * In Difficulties, add custom parameter {reverseMode:true} to your difficulty of choice
 */

(function () {
    var alias1 = NormalAttackOrderBuilder._isDefaultPriority;
    NormalAttackOrderBuilder._isDefaultPriority = function (virtualActive, virtualPassive) {
        var isDefaultPriority = alias1.call(this, virtualActive, virtualPassive);
        var difficulty = root.getMetaSession().getDifficulty();

        if (!difficulty.custom.reverseMode) {
            return isDefaultPriority;
        }

        if (this._attackInfo.isCounterattack) {
            return false;
        }

        return isDefaultPriority;
    }
})();
