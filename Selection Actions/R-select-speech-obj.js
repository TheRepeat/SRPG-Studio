/**
 * By Repeat.
 * A package deal with R-selection-actions.js.
 * NOTE: Any references to a unitId refers to the unit's DATABASE ID.
 * Be sure to go to Tools > Options > Data and check 'Display id next to data name' to see these numbers.
 *  */

var SpeechControl = {

    // all speeches are reset to usable again (via event command in-engine)
    // TO USE: SpeechControl.resetUses();
    resetUses: function () {
        var players = PlayerList.getAliveList();
        for (i = 0; i < players.getCount(); i++) {
            players.getData(i).custom.speechUsed = false;
        }
    },

    // resets a single unit's speech
    // SAMPLE USE: SpeechControl.resetSingleUnit(0)
    resetSingleUnit: function (unitId) {
        var players = PlayerList.getAliveList();
        for (var i = 0; i < players.getCount(); i++) {
            var player = players.getData(i);
            if (player.getId() !== unitId) {
                continue;
            }
            players.getData(i).custom.speechUsed = false;
        }
    },

    // sets one unit's dialogue
    // SAMPLE USE: SpeechControl.setSpeech('Your message here, milord.', 0, MessagePos.CENTER);
    // NOTE: pos can be either a number from 0-2 or use the built-in enum MessagePos for clarity (see constants-enumeratedtype.js)
    setSpeech: function (message, unitId, pos) {
        var players = PlayerList.getAliveList();
        for (var i = 0; i < players.getCount(); i++) {
            var player = players.getData(i);
            if (player.getId() !== unitId) {
                continue;
            }
            player.custom.selectSpeech = { message: '', pos: 0 }
            player.custom.selectSpeech.message = message;
            player.custom.selectSpeech.pos = pos;
        }
    },

    // Internal use
    setSpeechUsed: function (unit) {
        unit.custom.speechUsed = true;
    },

    // Internal use
    isSpeechUsed: function (unit) {
        return unit.custom.speechUsed;
    }
}