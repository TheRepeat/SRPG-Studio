/**
 * By Repeat.
 * Shows descriptions for recollection events even if they have not been unlocked yet.
 * Plug and play.
 */
(function () {
    var alias1 = DescriptionChanger.setDescriptionText;
    DescriptionChanger.setDescriptionText = function (scrollbar) {
        var text;
        var index = scrollbar.getIndex();
        var event = scrollbar.getObject();

        if (event.getEventType() !== EventType.RECOLLECTION) {
            return alias1.call(this, scrollbar);
        }

        if (index === this._prevIndex) {
            return;
        }

        text = event.getDescription();

        this._messageAnalyzer.setMessageAnalyzerText(text);
        this._prevIndex = index;
    }
})();
