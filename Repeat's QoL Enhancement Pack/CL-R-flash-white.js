/**
 * Original Flash White plugin by Claris.
 * Modified by Repeat so the white flash fades out.
 */

(function () {
    var alias1 = EasyMapUnit._showDamageAnime;
    EasyMapUnit._showDamageAnime = function () {
        // On taking damage, the custom parameters are added
        this._unit.custom.FlashWhiteCL = true;
        this._unit.custom.flashWhiteAlphaCounter = 180;

        alias1.call(this);
    };

    var alias2 = UnitRenderer._drawCustomCharChip;
    UnitRenderer._drawCustomCharChip = function (unit, x, y, unitRenderParam) {
        //transfer the unit parameter to the unit render param.
        unitRenderParam.FlashWhiteCL = unit.custom.FlashWhiteCL;
        unitRenderParam.flashWhiteAlphaCounter = unit.custom.flashWhiteAlphaCounter;
        if (unit.custom.flashWhiteAlphaCounter > 0) {
            unit.custom.flashWhiteAlphaCounter -= 8;
        }

        alias2.call(this, unit, x, y, unitRenderParam)
    };

    var alias3 = UnitRenderer.drawCharChip;
    UnitRenderer.drawCharChip = function (x, y, unitRenderParam) {
        if (!unitRenderParam.FlashWhiteCL) {
            alias3.call(this, x, y, unitRenderParam);
        } else {
            var dx, dy, dxSrc, dySrc;
            var directionArray = [4, 1, 2, 3, 0];
            var handle = unitRenderParam.handle;
            var width = GraphicsFormat.CHARCHIP_WIDTH;
            var height = GraphicsFormat.CHARCHIP_HEIGHT;
            var xSrc = handle.getSrcX() * (width * 3);
            var ySrc = handle.getSrcY() * (height * 5);
            var pic = this._getGraphics(handle, unitRenderParam.colorIndex);

            if (pic === null) {
                return;
            }

            dx = Math.floor((width - GraphicsFormat.MAPCHIP_WIDTH) / 2);
            dy = Math.floor((height - GraphicsFormat.MAPCHIP_HEIGHT) / 2);
            dxSrc = unitRenderParam.animationIndex;
            dySrc = directionArray[unitRenderParam.direction];

            // The reason the alpha must be 255 is so that invisible units do not show up as white.
            // flashWhiteAlphaCounter determines the opacity of the white flash, which is decremented each frame.
            if (unitRenderParam.alpha === 255) {
                pic.setColor(0xffffff, unitRenderParam.flashWhiteAlphaCounter);
            }

            pic.setAlpha(unitRenderParam.alpha);
            pic.setDegree(unitRenderParam.degree);
            pic.setReverse(unitRenderParam.isReverse);
            pic.drawStretchParts(x - dx, y - dy, width, height, xSrc + (dxSrc * width), ySrc + (dySrc * height), width, height);
        }
    };

    var alias4 = EasyBattle.endBattle;
    EasyBattle.endBattle = function () {
        var active = this.getActiveBattler().getUnit();
        var passive = this.getPassiveBattler().getUnit();

        active.custom.FlashWhiteCL = false;
        passive.custom.FlashWhiteCL = false;

        alias4.call(this);
    };

    var alias5 = EasyBattle._checkNextAttack;
    EasyBattle._checkNextAttack = function () {
        var active = this.getActiveBattler().getUnit();
        var passive = this.getPassiveBattler().getUnit();

        active.custom.FlashWhiteCL = false;
        passive.custom.FlashWhiteCL = false;
        active.custom.flashWhiteAlphaCounter = 180;
        passive.custom.flashWhiteAlphaCounter = 180;

        alias5.call(this);
    };
})();