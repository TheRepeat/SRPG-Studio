/**
 * By Repeat.
 * A package deal with R-selection-actions.js.
 * NOTE: Any references to a unitId refers to the unit's DATABASE ID.
 * Be sure to go to Tools > Options > Data and check 'Display id next to data name' to see these numbers.
 *  */

var JingleControl = {

    // all jingles are reset to usable again (via event command in-engine)
    resetUses: function(){
        var players = PlayerList.getAliveList();
        for (i = 0; i < players.getCount(); i++) {
            players.getData(i).custom.jingleUsed=false;
        }
    },

    // resets only 1 unit's jingle
    resetSingleUnit: function(unitId){
        var players = PlayerList.getAliveList();
        for (var i = 0; i < players.getCount(); i++) {
            var player = players.getData(i);
            if (player.getId() !== unitId) {
                continue;
            }
            players.getData(i).custom.jingleUsed = false;
        }
    },

    setJingleUsed: function(unit){
        unit.custom.jingleUsed = true;
    },

    isJingleUsed: function(unit){
        return unit.custom.jingleUsed;
    }
}
