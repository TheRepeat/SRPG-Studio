/**
 * By Repeat.
 * Displays more detail in the unit window by including combat stats and the equipped weapon, for better visibility at a glance.
 * This file creates a BaseLargeUnitInfo class that is extended by the large, extra large, and wide variants.
 */

var BaseLargeUnitInfo = defineObject(MapParts.UnitInfo, {
    _faceWidth: 0,
    _faceHeight: 0,
    _handleArr: null,
    _isCritAllowed: false,
    _isLargeFace: false,
    _mhp: 0,
    _statArr: null,
    _totalStatus: null,
    _weapon: null,

    initialize: function () {
        this._isLargeFace = root.isLargeFaceUse();
        this._faceWidth = root.getLargeFaceWidth();
        this._faceHeight = root.getLargeFaceHeight();
    },

    setUnit: function (unit) {
        if (unit !== null) {
            this._mhp = ParamBonus.getMhp(unit);
            this._weapon = ItemControl.getEquippedWeapon(unit);
            this._totalStatus = SupportCalculator.createTotalStatus(unit);

            this._setStatArr(unit);
            this._setIconHandles(unit);
        }
    },

    _setStatArr: function (unit) {
        var atk = 0;
        var hit = 0;
        var crt = 0;

        if (this._weapon !== null) {
            atk = AbilityCalculator.getPower(unit, this._weapon);
            hit = AbilityCalculator.getHit(unit, this._weapon);
            crt = AbilityCalculator.getCritical(unit, this._weapon);
        }

        this._statArr = [
            atk + SupportCalculator.getPower(this._totalStatus),
            AbilityCalculator.getAgility(unit, this._weapon),
            crt + SupportCalculator.getCritical(this._totalStatus),
            hit + SupportCalculator.getHit(this._totalStatus),
            RealBonus.getDef(unit) + SupportCalculator.getDefense(this._totalStatus),
            RealBonus.getMdf(unit) + SupportCalculator.getDefense(this._totalStatus),
            AbilityCalculator.getCriticalAvoid(unit) + SupportCalculator.getCriticalAvoid(this._totalStatus),
            AbilityCalculator.getAvoid(unit) + SupportCalculator.getAvoid(this._totalStatus)
        ];
    },

    _setIconHandles: function (unit) {
        this._handleArr = [];

        var i = 0;
        var activeItem = unit.getItem(0);
        while (activeItem !== null) {
            handle = activeItem.getIconResourceHandle();
            this._handleArr.push(handle);

            i++;
            activeItem = unit.getItem(i) !== null ? unit.getItem(i) : null;
        }
    },

    _drawContent: function (x, y, unit, textui) {
        var xSpaced = x + GraphicsFormat.FACE_WIDTH + this.getInterval();

        this._drawFace(x, y, unit, textui);
        this._drawName(x + this._faceWidth - this.getInterval(), y + 8, unit, textui);
        this._drawHp(xSpaced, y + 30, unit, textui);
        this._drawLvInfo(xSpaced, y + 52, unit, textui);
        this._drawWeaponInfo(xSpaced, y + 72, unit, textui);
        this._drawStatInfo(x + 4, y + 98, unit, textui);
    },

    _drawFace: function (x, y, unit, textui) {
        var pic, xSrc, ySrc;
        var destWidth = GraphicsFormat.FACE_WIDTH;
        var destHeight = GraphicsFormat.FACE_HEIGHT;
        var srcWidth = destWidth;
        var srcHeight = destHeight;
        var handle = unit.getFaceResourceHandle();

        if (handle === null) {
            return;
        }

        pic = GraphicsRenderer.getGraphics(handle, GraphicsType.FACE);
        if (pic === null) {
            return;
        }

        if (this._isLargeFace) {
            destWidth = this._faceWidth;
            destHeight = this._faceHeight;
            if (pic.isLargeImage()) {
                srcWidth = destWidth;
                srcHeight = destHeight;
            }
        }

        xSrc = handle.getSrcX();
        ySrc = handle.getSrcY();

        xSrc *= srcWidth;
        ySrc *= srcHeight;
        pic.drawStretchParts(x, y, destWidth, destHeight, xSrc, ySrc, srcWidth, srcHeight);
    },

    _drawName: function (x, y, unit, textui) {
        var length = this._getTextLength();
        var color = textui.getColor();
        var font = textui.getFont();

        TextRenderer.drawText(x, y, unit.getName(), length, color, font);
    },

    _drawHp: function (x, y, unit, textui) {
        // Compatibility with "show HP as ???" plugin
        if(typeof Miscellaneous.isUnknownHp !== 'undefined' && Miscellaneous.isUnknownHp(unit)) {
            this.drawUnknownHp(x, y);
        } else {
            ContentRenderer.drawHp(x, y, unit.getHp(), this._mhp);
        }
    },

    drawUnknownHp: function (x, y) {
        var textHp = root.queryCommand('hp_param');
        var textSlash = '/';
        var dx = [0, 34, 60, 88];
        var unknown = '???';
        
        var textui = root.queryTextUI('default_window');
        var color = textui.getColor();
        var font = textui.getFont();
        
        TextRenderer.drawSignText(x + dx[0], y, textHp);
        TextRenderer.drawKeywordText(x + dx[1], y, unknown, -1, color, font);
        TextRenderer.drawSignText(x + dx[2], y, textSlash);
        TextRenderer.drawKeywordText(x + dx[3], y, unknown, -1, color, font);
    },

    _drawLvInfo: function (x, y, unit, textui) {
        ContentRenderer.drawLevelInfo(x, y, unit);
        x += 92;
        if (unit.getExp() > 80) {
            this._drawRiseCursor(x, y);
        }
    },

    _drawRiseCursor: function (x, y) {
        var ySrc = 0;
        var pic = root.queryUI('parameter_risecursor');
        var width = UIFormat.RISECURSOR_WIDTH / 2;
        var height = UIFormat.RISECURSOR_HEIGHT / 2;

        if (pic !== null) {
            pic.drawParts(x + 8, y - 4, 0, ySrc, width, height);
        }
    },

    _drawWeaponInfo: function (x, y, unit, textui) {
        var length = this._getTextLength();
        var color = textui.getColor();
        var font = textui.getFont();
        var weapon = this._weapon;

        // equipped weapon or list of icons in inventory
        if (!UnitWindowValues.IconsOnly) {
            if (!weapon) {
                TextRenderer.drawText(x, y + 4, '(Unarmed)', length, color, font);
            } else {
                ItemRenderer.drawItemLarge(x, y, weapon, textui.getColor(), textui.getFont(), false);
            }
        } else {
            this._drawItemIcons(x, y, unit, textui, 5);
        }
    },

    // if IconsOnly in 0_unitwindow-editables, draw the first n icons in unit inventory
    _drawItemIcons: function (x, y, unit, textui, itemCount) {
        var length = this._getTextLength();
        var color = textui.getColor();
        var font = textui.getFont();
        var iconWidth = GraphicsFormat.ICON_WIDTH + 5;
        var handle;
        var graphicsRenderParam = StructureBuilder.buildGraphicsRenderParam();

        if (!this._handleArr || !this._handleArr.length) {
            TextRenderer.drawText(x, y + 4, '(No items)', length, color, font);
            return;
        }

        if (this._handleArr) {
            var count = Math.min(this._handleArr.length, itemCount);

            for (var i = 0; i < count; i++) {
                handle = this._handleArr[i];
                GraphicsRenderer.drawImageParam(x + (iconWidth * i), y, handle, GraphicsType.ICON, graphicsRenderParam);
            }
        }
    },

    _drawStatInfo: function (x, y, unit, textui) { },

    // CAv is displayed differently if unit has an Invalid Critical skill.
    _getHasInvalidCritSkill: function (unit) {
        if (!UnitWindowValues.CrtAvoidIsUnique) return;

        var hasInvalidCritSkill = false;
        var skillArr = SkillControl.getDirectSkillArray(unit, SkillType.INVALID, '')

        for (var i = 0; i < skillArr.length; i++) {
            var skill = skillArr[i].skill;
            var value = skill.getSkillValue();
            if (value === InvalidFlag.CRITICAL) {
                hasInvalidCritSkill = true;
                break;
            }
            continue;
        }
        return hasInvalidCritSkill;
    },

    // draws both the name and value of a stat in the stat info area
    _drawCombatStat: function (x, y, unit, textui, name, value) {
        var font = textui.getFont();
        var color = textui.getColor();

        TextRenderer.drawText(x, y, name, -1, UnitWindowValues.StatColor, font);
        x += 44;

        if (this._statDependsOnWeapon(name) && this._weapon === null) {
            TextRenderer.drawKeywordText(x, y - 3, StringTable.SignWord_WaveDash, -1, color, font)
        } else if (name === UnitWindowValues.CriticalAvoidStat && this._getHasInvalidCritSkill(unit)) {
            TextRenderer.drawKeywordText(x, y - 3, UnitWindowValues.MaxCrtAvoidText, -1, color, font)
        } else {
            this._drawStatValue(x, y - 3, value, font);
        }
    },

    _statDependsOnWeapon: function (name) {
        return name === root.queryCommand('attack_capacity') ||
            name === root.queryCommand('critical_capacity') ||
            name === root.queryCommand('hit_capacity');
    },

    // Main appeal of this is not having to repeat the negative number check for every stat
    _drawStatValue: function (x, y, stat, font) {
        var xMod = 12;
        if (stat < 0) {
            if (stat <= -10) xMod = 20; // adaptive for double-digit negatives. Rare but I look prescient if I account for em right?
            TextRenderer.drawText(x - xMod, y + 3, ' - ', 64, 0xFFFFFF, font);
            stat *= -1;
        }
        NumberRenderer.drawNumber(x, y, stat);
    },

    _getTextLength: function () {
        return ItemRenderer.getItemWindowWidth() - (this._faceWidth + this.getInterval() + DefineControl.getWindowXPadding()) + this.getSpaceWidth();
    },

    getInterval: function () {
        return 10;
    },

    getSpaceWidth: function () {
        return -25;
    },

    getSpaceHeight: function () {
        return 0;
    },

    _getWindowWidth: function () {
        return 300 + this.getSpaceWidth();
    },

    _getWindowHeight: function () {
        return 128 + this.getSpaceHeight();
    }
});

// Below is the logic for drawing the custom name specified by the smallname or lrgname custom parameters.

// FOR THE MEDIUM SIZE
ItemRenderer.drawItemSmall = function (x, y, item, color, font, isDrawLimit) {
    if (typeof item.custom.smallname !== 'undefined') {
        this.drawItemAlphaSmall(x, y, item, color, font, isDrawLimit, 255);
    } else {
        this.drawItemAlpha(x, y, item, color, font, isDrawLimit, 255);
    }
}

ItemRenderer.drawItemAlphaSmall = function (x, y, item, color, font, isDrawLimit, alpha) {
    var interval = this._getItemNumberInterval();
    var iconWidth = GraphicsFormat.ICON_WIDTH + 5;
    var length = this._getTextLength();
    var handle = item.getIconResourceHandle();
    var graphicsRenderParam = StructureBuilder.buildGraphicsRenderParam();

    graphicsRenderParam.alpha = alpha;
    GraphicsRenderer.drawImageParam(x, y, handle, GraphicsType.ICON, graphicsRenderParam);

    TextRenderer.drawAlphaText(x + iconWidth, y + ContentLayout.KEYWORD_HEIGHT, item.custom.smallname, length, color, alpha, font);

    if (isDrawLimit) {
        this.drawItemLimit(x + iconWidth + interval, y, item, alpha);
    }
}
// END MEDIUM SECTION

// FOR THE LARGER SIZES
ItemRenderer.drawItemLarge = function (x, y, item, color, font, isDrawLimit) {
    if (!item) return;
    if (typeof item.custom.lrgname !== 'undefined') {
        this.drawItemAlphaLarge(x, y, item, color, font, isDrawLimit, 255);
    } else {
        this.drawItemAlpha(x, y, item, color, font, isDrawLimit, 255);
    }
}

ItemRenderer.drawItemAlphaLarge = function (x, y, item, color, font, isDrawLimit, alpha) {
    var interval = this._getItemNumberInterval();
    var iconWidth = GraphicsFormat.ICON_WIDTH + 5;
    var length = this._getTextLength();
    var handle = item.getIconResourceHandle();
    var graphicsRenderParam = StructureBuilder.buildGraphicsRenderParam();

    graphicsRenderParam.alpha = alpha;
    GraphicsRenderer.drawImageParam(x, y, handle, GraphicsType.ICON, graphicsRenderParam);

    TextRenderer.drawAlphaText(x + iconWidth, y + ContentLayout.KEYWORD_HEIGHT, item.custom.lrgname, length, color, alpha, font);

    if (isDrawLimit) {
        this.drawItemLimit(x + iconWidth + interval, y, item, alpha);
    }
}
