/**
 * "Group Experience" by Repeat
 * Intended use is Gaiden-style shared EXP distributed to all party members at the end of a battle.
 * Use an Execute Script event to distribute EXP to all living player characters.
 * Object Name is "GroupExp" (case sensitive).
 * In the Original Data tab, you can set Keyword to "All" (case insensitive) for it to affect all of the player's living units;
 * otherwise, group EXP will only be distributed to units that were sortied for the battle.
 * 
 * Dev note: this worked perfectly and easily as just a function call instead of an event command, but to get the notice view to work I had to redo everything as an event command. It was an unnecessary feature but I just had to have it. The suffering of an artist.
 * */

(function () {
    var configureEventCommandsAlias = ScriptExecuteEventCommand._configureOriginalEventCommand;
    ScriptExecuteEventCommand._configureOriginalEventCommand = function (groupArray) {
        configureEventCommandsAlias.call(this, groupArray);
        groupArray.appendObject(GroupExpEventCommand);
    };
})();

var GroupExpEventCommand = defineObject(BaseEventCommand, {

    _noticeView: null,
    _targetKeyword: null,

    enterEventCommandCycle: function () {
        var originalContent = root.getEventCommandObject().getOriginalContent();
        this._targetKeyword = originalContent.getCustomKeyword() || '';

        this._noticeView = createWindowObject(GroupExpNoticeView, this);
        this._noticeView.setViewText(this._targetKeyword);

        return EnterResult.OK;
    },

    moveEventCommandCycle: function () {
        var result = MoveResult.CONTINUE;

        if (this._noticeView.moveNoticeView() != MoveResult.CONTINUE) {
            this.mainEventCommand();
            result = MoveResult.END;
        }

        return result;
    },

    drawEventCommandCycle: function () {
        var x = LayoutControl.getCenterX(-1, this._noticeView.getNoticeViewWidth());
        var y = LayoutControl.getCenterY(-1, this._noticeView.getNoticeViewHeight());
        this._noticeView.drawNoticeView(x, y);
    },

    mainEventCommand: function () {
        this.distributeGroupExp();
    },

    distributeGroupExp: function () {
        var affectsAllUnits = this._targetKeyword;
        var unitList = affectsAllUnits.toLowerCase() === 'all' ? PlayerList.getAliveList() : PlayerList.getSortieList();
        var count = unitList.getCount();

        for (var i = 0; i < count; i++) {
            var unit = unitList.getData(i);
            var exp = 0;

            exp = this.calculateGroupExp(unit);

            var generator = root.getEventGenerator();
            generator.experiencePlus(unit, exp, true);
            generator.execute();
        }
    },

    // calculate EXP (resulting unit exp should be <= 99)
    // Faithful to the calculation for group EXP in Fire Emblem Gaiden.
    // The Gaiden calculation is (classStrength * (level factor / 5)), where classStrength is an innate class parameter
    // and the level factor is a modifier based on how high the unit's current level is.
    // If you want, you can add custom parameter {classStrength:#} to any player unit's class and it'll affect the unit's
    // group EXP gain; otherwise classStrength defaults to 5.
    calculateGroupExp: function (unit) {
        var exp;
        var levelFactor = this.getLevelFactor(unit);
        var classStrength = unit.getClass().custom.classStrength || 5; // default being 5 is arbitrary

        var tempExp = Math.floor(classStrength * levelFactor / 5);

        // level can't increase from GEXP
        if (unit.getExp() + tempExp >= 99) {
            exp = 99 - unit.getExp();
        } else {
            exp = tempExp;
        }

        return exp;
    },

    getLevelFactor: function (unit) {
        var levelFactor = 0;
        var level = unit.getLv();

        levelFactor = Math.max(10 - level + 2, 2);
        levelFactor = Math.min(levelFactor, 10);

        return levelFactor;
    },

    getEventCommandName: function () {
        return "GroupExp";
    },

    isEventCommandSkipAllowed: function () {
        return false;
    }

})

var GroupExpNoticeView = defineObject(BaseNoticeView, {

    _text: null,

    setViewText: function (keyword) {
        var text = 'Distributed extra experience to '
        var targetUnitText = keyword.toLowerCase() === 'all' ? 'your entire team!' : 'participating units!';
        this._text = text + targetUnitText;
    },

    drawNoticeViewContent: function (x, y) {
        var textui = this.getTitleTextUI();
        var color = textui.getColor();
        var font = textui.getFont();

        TextRenderer.drawKeywordText(x, y, this._text, -1, color, font);
    },

    getTitlePartsCount: function () {
        return 11;
    }

});