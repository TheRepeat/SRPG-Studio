(function () {
    var alias1 = MapPartsCollection._configureMapParts;
    MapPartsCollection._configureMapParts = function (groupArray) {
        alias1.call(this, groupArray);

        groupArray.appendObject(MapParts.Objective);

    };

    var alias2 = PlayerTurn._doEventEndAction;
    PlayerTurn._doEventEndAction = function () {
        alias2.call(this);

        MapParts.Objective.updateUnitCount();
    };

    var alias3 = BattleSetupScene._prepareSceneMemberData;
    BattleSetupScene._prepareSceneMemberData = function () {
        alias3.call(this);

        MapParts.Objective.updateUnitCount();
    }

    var alias4 = BaseTurnLogoFlowEntry.doMainAction;
    BaseTurnLogoFlowEntry.doMainAction = function (isMusic) {
        // If it's the next player turn, update the objective. Don't update on turn 1.
        if (root.getCurrentSession().getTurnType() === TurnType.PLAYER && root.getCurrentSession().getTurnCount() > 0) {
            MapParts.Objective.updateTurnsLeft();
        }

        alias4.call(this, isMusic);
    }
})();
