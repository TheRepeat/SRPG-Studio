/* By Repeat.
   A package deal with select-jingle-once.js.
   The main highlight here is JingleControl.resetUses(), which you can use 
   in-engine with an Execute Script event.
*/

var JingleControl = {

    // all jingles are reset to usable again (via event command in-engine)
    resetUses: function(){
        var players = PlayerList.getAliveList();
        for (i = 0; i < players.getCount(); i++) {
            players.getData(i).custom.jingleUsed=false;
        }
        
    },

    // to reset only 1 unit's jingle (nonfunctional atm!)
    // resetOneUse: function(unitId){
    //     unit = root.getBaseData().getPlayerList().getDataFromId(unitId);
    //     unit.custom.jingleUsed = false;
    // },

    setJingleUsed: function(unit){
        // root.log('jingle:' + unit.custom.jingleUsed);
        unit.custom.jingleUsed = true;
    },

    isJingleUsed: function(unit){
        return unit.custom.jingleUsed;
    }
}