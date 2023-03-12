/**
 * By Repeat.
 * Changes the unit list in the Manage Units screen to always be 3 columns instead of 2 on smaller resolutions.
 * Or if 3 isn't the number you want, feel free to edit UNIT_COLUMN_COUNT.
 * 
 * Functions overridden without an alias:
 *  * UnitSelectWindow.setInitialList
 */

UNIT_COLUMN_COUNT = 3;

UnitSelectWindow.setInitialList = function(unitList) {
    var rowCount = LayoutControl.getObjectVisibleCount(77, 6);
    
    this._scrollbar = createScrollbarObject(UnitSelectScrollbar, this);
    this._scrollbar.setScrollFormation(UNIT_COLUMN_COUNT, rowCount);
    this._scrollbar.setDataList(unitList);
    
    this.changeCycleMode(UnitSelectMode.NONE);
}
