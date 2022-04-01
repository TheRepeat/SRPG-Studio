/**
 * By Repeat.
 * Unlocks all music in the sound room immediately.
 */
(function () {
    SoundRoomScreen._createDictionaryScrollbarParam = function () {
        var dictionaryScrollbarParam = StructureBuilder.buildDictionaryScrollbarParam();

        dictionaryScrollbarParam.funcCondition = function (object, index) {
            return true; // this is the change
        };

        return dictionaryScrollbarParam;
    };
})();
