/* By Repeat.
   When combat begins, if either unit is standing on a Trick Room tile,
   the pursuit formula flips, with the slower unit now doubling.
   Use custom parameter {trick:true} on the special terrain.
   Use custom parameter {supertrick:true} for even more potent trick room terrain.
*/
(function () {
    var crc = Calculator.calculateRoundCount;
    Calculator.calculateRoundCount = function (active, passive, weapon) {
        var found = false;
        var found2 = false;
        var activeTerrain = PosChecker.getTerrainFromPosEx(active.getMapX(), active.getMapY());
        var passiveTerrain = PosChecker.getTerrainFromPosEx(passive.getMapX(), passive.getMapY());
        var value;

        if (!this.isRoundAttackAllowed(active, passive)) {
            return 1;
        }

        activeAgi = AbilityCalculator.getAgility(active, weapon);
        passiveAgi = AbilityCalculator.getAgility(passive, ItemControl.getEquippedWeapon(passive));
        value = this.getDifference();

        found = found ? found : findTrickTerrain(activeTerrain);
        found = found ? found : findTrickTerrain(passiveTerrain);
        found2 = found2 ? found2 : findSuperTrickTerrain(activeTerrain);
        found2 = found2 ? found2 : findSuperTrickTerrain(passiveTerrain);

        // supertrick overrules trick, in case you were curious
        if (found2){
            return activeAgi < passiveAgi ? 2 : 1;
        }
        else if (found) {
            return activeAgi < passiveAgi && ((passiveAgi - activeAgi) >= value) ? 2 : 1;
        }
        else {
            return crc.call(this,active,passive,weapon);
        }
    }

    var findTrickTerrain = function (terrain) {
        return terrain.custom.trick;
    }

    var findSuperTrickTerrain = function (terrain) {
        return terrain.custom.supertrick;
    }
})();