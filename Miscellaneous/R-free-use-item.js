/**
 * By Repeat.
 * 
 * Give any item custom parameter {freeUse:true} and the item won't end the user's turn instantly when used.
 * 
 */
UnitCommand.Item._moveUse = function () {
    if (this._itemUse.moveUseCycle() !== MoveResult.CONTINUE) {
        var item = this._itemSelectMenu.getSelectItem();
        if (item.custom.freeUse) {
            this.setExitCommand(this);
            this.rebuildCommand();
        } else {
            this.endCommandAction();
        }
        return MoveResult.END;
    }

    return MoveResult.CONTINUE;
}