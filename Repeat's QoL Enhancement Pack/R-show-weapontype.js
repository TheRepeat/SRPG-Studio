/* By Repeat.
   Adds new "WeaponType" object to ItemSentence. That is, the weapon's type is displayed alongside its stats when checked.
   This is plug and play, but there are a few values you can edit based on your preference.
 */
(function () {

    // EDITABLE VALUES

    DISPLAY_ICON = true;            // false: name, true: icon
    ON_TOP = true;                  // false: show last, true: show first
    WEAPON_TYPE_STRING = 'Type';    // This string is shown in-game, feel free to change it

    // END OF EDITABLE SECTION

    ItemSentence.WeaponType = defineObject(BaseItemSentence, {
        drawItemSentence: function (x, y, item) {
            if(!(item.isWeapon() || item.isWand())){
                return;
            }
            var text;
            var textui = root.queryTextUI('default_window');
            var color = textui.getColor();
            var font = textui.getFont();

            ItemInfoRenderer.drawKeyword(x, y, WEAPON_TYPE_STRING);
            x += ItemInfoRenderer.getSpaceX();

            if (!DISPLAY_ICON) {
                text = item.getWeaponType().getName();
                TextRenderer.drawKeywordText(x, y, text, -1, color, font);
            }
            else {
                pic = item.getWeaponType().getIconResourceHandle();
                GraphicsRenderer.drawImage(x, y, pic, GraphicsType.ICON);
            }
        },

        getItemSentenceCount: function (item) {
            return (item.isWeapon() || item.isWand()) ? 1 : 0;
        }
    });

    var alias1 = ItemInfoWindow._configureWeapon;
    ItemInfoWindow._configureWeapon = function (groupArray) {
        if(!ON_TOP) alias1.call(this, groupArray);
        groupArray.appendObject(ItemSentence.WeaponType);
        if(ON_TOP) alias1.call(this,groupArray);
    }

    var alias2 = ItemInfoWindow._configureItem;
    ItemInfoWindow._configureItem = function (groupArray) {
        if(!ON_TOP) alias2.call(this, groupArray);
        groupArray.appendObject(ItemSentence.WeaponType);
        if(ON_TOP) alias2.call(this,groupArray);
    }
})()