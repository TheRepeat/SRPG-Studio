/**
 * By Repeat.
 * Set Level Total v1.0
 * 
 * Execute Script event that returns a value equal to the total level of all player units.
 * I'm so over hacky event solutions.
 * 
 * To use:
 *  * Execute Script event -> select Execute Code
 *  * Code:
            setLvTotal();
 *  * Check "Save return value as variable" in the event command and choose the variable to store the result in.
 */

function getLvTotal() {
    var lvTotal = 0;

    var list = PlayerList.getAliveList();
    var count = list.getCount();
    var unit;
    for (var i = 0; i < count; i++) {
        unit = list.getData(i);
        lvTotal += unit.getLv()
    }

    return lvTotal;
}