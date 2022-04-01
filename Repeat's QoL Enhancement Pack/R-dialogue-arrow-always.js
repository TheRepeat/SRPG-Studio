/**
 * By Repeat.
 * In Show Message events, the arrow is not usually shown for the final textbox.
 * This plugin changes it so the arrow is always drawn as long as the text has finished moving.
 * 
 * Function overridden without alias:
 *  * MessageAnalyzer.drawMessageAnalyzer
 */

MessageAnalyzer.drawMessageAnalyzer = function (xMessage, yMessage, xCursor, yCursor, pic) {
    this._coreAnalyzer.drawCoreAnalyzer(xMessage, yMessage + 5);

    if (pic !== null) {
        if ((this._messageState === MessageAnalyzerState.READBLOCK || this._messageState === MessageAnalyzerState.ENDTEXT)
            && !this._waitChain.isAutoMode()) {
            this._pageCursor.drawCursor(xCursor, yCursor, pic);
        }
    }
};