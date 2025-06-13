/**
 * By Repeat.
 * Walkies plugin extension. Adds the ability to view and use items from the walking unit's inventory.
 * The override is just to get rid of calls to endCommandAction which doesn't apply to map commands.
 */

MapCommand.WalkItem = defineObject(UnitCommand.Item, {
    _exitCommand: false,

    _moveTop: function () {
        var item;
        var unit = this.getCommandTarget();
        var result = this._itemSelectMenu.moveWindowManager();

        if (result === ItemSelectMenuResult.USE) {
            item = this._itemSelectMenu.getSelectItem();
            this._itemSelection = ItemPackageControl.getItemSelectionObject(item);

            if (this._itemSelection !== null) {
                if (this._itemSelection.enterItemSelectionCycle(unit, item) === EnterResult.NOTENTER) {
                    this._useItem();
                    this.changeCycleMode(ItemCommandMode.USE);
                } else {
                    this.changeCycleMode(ItemCommandMode.SELECTION);
                }
            }
        }
        else if (result === ItemSelectMenuResult.CANCEL) {
            // Rebuild the command. This is because the weapons equipped on the unit may have been changed or items may have been discarded.
            this.rebuildCommand();

            return MoveResult.END;
        }

        return MoveResult.CONTINUE;
    },

    _moveUse: function () {
        if (this._itemUse.moveUseCycle() !== MoveResult.CONTINUE) {
            var item = this._itemSelectMenu.getSelectItem();

            // SWITCH items need to close the menu completely or the event will wait to fire til you close it manually, which feels terrible
            if (item.getItemType() === ItemType.SWITCH) {
                this.setExitCommand(true);
            }

            return MoveResult.END;
        }

        return MoveResult.CONTINUE;
    },

    setExitCommand: function (exitCommand) {
        this._exitCommand = exitCommand;
    },

    getExitCommand: function () {
        return this._exitCommand;
    }
});