/**
 * By Repeat.
 * Adds new command to battle prep that does the same thing that pressing Cancel does, switching view to SetupEdit (where you manage your units' spawn points and stuff).
 */

(function () {
    var alias1 = SetupCommand.configureCommands;
    SetupCommand.configureCommands = function (groupArray) {
        alias1.call(this, groupArray);

        // inserts the command into the middle of the other commands, feel free to mess with this
        groupArray.insertObject(SetupCommand.SetupEditView, Math.floor(groupArray.length / 2));
    }
})();

BaseListCommand.shouldCloseCommandManager = function () {
    return false;
}

SetupCommand._moveOpen = function () {
    var object = this._commandScrollbar.getObject();
    var result = MoveResult.CONTINUE;

    if (object.moveCommand() !== MoveResult.CONTINUE) {
        if (object.shouldCloseCommandManager()) {
            return MoveResult.END;
        }

        this._commandScrollbar.setActive(true);
        this.changeCycleMode(ListCommandManagerMode.TITLE);
    }

    return result;
}

SetupCommand.SetupEditView = defineObject(BaseListCommand, {
    moveCommand: function () {
        return MoveResult.END;
    },

    shouldCloseCommandManager: function () {
        return true;
    },

    getCommandName: function () {
        return 'Reposition Units';
    }
});
