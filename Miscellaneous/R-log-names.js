/**
 * By Repeat
 * epic plugin to root log the names of every unit on the field
 * (for my own education)
 */

function concatUnitLists() {
    var listArray = [];

    listArray.push(PlayerList.getSortieDefaultList());
    listArray.push(EnemyList.getAliveDefaultList());
    listArray.push(AllyList.getAliveDefaultList());

    var finalList = StructureBuilder.buildDataList();
    finalList.setDataArray(listArray);

    return finalList;
}

function listAllNames() {
    var list = this.concatUnitLists();

    /**
     * Basically a 2d array - 
     * first dimension being the number of factions (players/enemies/allies) and 2nd dimension being number of units in each faction
     */
    for (var i = 0; i < list.getCount(); i++) {
        var factionList = list.getData(i);

        for (var j = 0; j < factionList.getCount(); j++) {
            var unit = factionList.getData(j);

            root.log(unit.getName())
        }
    }
}
