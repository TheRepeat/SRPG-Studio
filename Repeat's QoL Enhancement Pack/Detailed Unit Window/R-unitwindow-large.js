/**
 * Part of the Detailed Unit Window plugin.
 * Defines the variants of the large sized window (L, W, and XL).
 */

MapParts.UnitInfoExtraLarge = defineObject(BaseLargeUnitInfo, {
    _drawStatInfo: function (x, y, unit, textui) {
        var names = [
            root.queryCommand('attack_capacity'),
            root.queryCommand('agility_capacity'),
            root.queryCommand('critical_capacity'),
            root.queryCommand('hit_capacity'),

            root.queryCommand('def_param'),
            root.queryCommand('mdf_param'),
            CRIT_AVOID_STAT,
            root.queryCommand('avoid_capacity')
        ];

        if (this._statArr) {
            for (var i = 0; i < names.length; i++) {
                // there's prolly a better way to do this
                var yMod = i >= 4 ? 22 : 0; // basically - after 4th stat, draw the bottom row 22px lower
                var xMod = i >= 4 ? 60 * (i - 4) : 60 * i; // basically - gap between each stat is 60px. Bottom row pretends it's the top row wrt x values (therefore, i-4 is used)
                this._drawCombatStat(x + xMod, y + yMod, unit, textui, names[i], this._statArr[i]);
            }
        }
    },

    getSpaceHeight: function () {
        return 20;
    }
});

// same as XL but only draws the top row of stats and is slightly less tall
MapParts.UnitInfoLarge = defineObject(BaseLargeUnitInfo, {
    _drawStatInfo: function (x, y, unit, textui) {
        var names = [
            root.queryCommand('attack_capacity'),
            root.queryCommand('agility_capacity'),
            root.queryCommand('critical_capacity'),
            root.queryCommand('hit_capacity')
        ];

        if (this._statArr) {
            for (var i = 0; i < names.length; i++) {
                this._drawCombatStat(x + 60 * i, y, unit, textui, names[i], this._statArr[i]);
            }
        }
    }
});

// This variant is wider, draws combat stats off to the side, and has room to display the class and more items
// (similar to the layout of Seas of Novis's unit window)
MapParts.UnitInfoWide = defineObject(BaseLargeUnitInfo, {
    // obtain stats in a different order
    _setStatArr: function (unit) {
        var atk = 0;
        var hit = 0;

        if (this._weapon !== null) {
            atk = AbilityCalculator.getPower(unit, this._weapon);
            hit = AbilityCalculator.getHit(unit, this._weapon);
        }

        this._statArr = [
            atk + SupportCalculator.getPower(this._totalStatus),
            hit + SupportCalculator.getHit(this._totalStatus),
            AbilityCalculator.getAgility(unit, this._weapon),
            RealBonus.getDef(unit) + SupportCalculator.getDefense(this._totalStatus),
            RealBonus.getMdf(unit) + SupportCalculator.getDefense(this._totalStatus)
        ];
    },

    // has to draw stats far to the right of everything else + draw new class section + weapon section is in different spot + shift most things down
    _drawContent: function (x, y, unit, textui) {
        var xSpaced = x + GraphicsFormat.FACE_WIDTH + this.getInterval();

        this._drawFace(x, y, unit, textui);
        this._drawName(xSpaced, y + 8, unit, textui);
        this._drawClass(xSpaced, y + 36, unit, textui);
        this._drawHp(xSpaced, y + 56, unit, textui);
        this._drawLvInfo(xSpaced, y + 76, unit, textui);
        this._drawWeaponInfo(x + 4, y + 98, unit, textui);
        this._drawStatInfo(x + GraphicsFormat.FACE_WIDTH + 136, y + 8, unit, textui);
    },
    _drawClass: function (x, y, unit, textui) {
        var length = this._getTextLength();
        var color = textui.getColor();
        var font = textui.getFont();

        TextRenderer.drawText(x, y, unit.getClass().getName(), length, color, font);
    },

    // weapon section has a lot more room. can show up to 8 icons (from 5) or draw just the equipped weapon PLUS its durability
    // (if the weapon name is long enough to bleed into the durability section, remember you can use 
    // custom parameter {lrgname:true} to shorten the weapon's display name)
    _drawWeaponInfo: function (x, y, unit, textui) {
        var length = this._getTextLength();
        var color = textui.getColor();
        var font = textui.getFont();
        var weapon = this._weapon;

        if (!ICONS_ONLY) {
            if (!weapon) {
                TextRenderer.drawText(x, y + 2, '(Unarmed)', length, color, font);
            } else {
                ItemRenderer.drawItemLarge(x, y, weapon, textui.getColor(), textui.getFont(), false);
                if (weapon.getLimitMax() > 0) {
                    x += GraphicsFormat.FACE_WIDTH * 1.5;
                    NumberRenderer.drawNumber(x, y, weapon.getLimit());
                    TextRenderer.drawText(x + 12, y + 2, '/', length, color, font);
                    NumberRenderer.drawRightNumber(x + 20, y, weapon.getLimitMax());
                }
            }
        } else {
            // draws 8 items, up from 5 on other layouts
            this._drawItemIcons(x, y, unit, 8, length, color, font);
        }
    },

    _drawStatInfo: function (x, y, unit, textui) {
        var names = [
            root.queryCommand('attack_capacity'),
            root.queryCommand('hit_capacity'),
            root.queryCommand('agility_capacity'),
            root.queryCommand('def_param'),
            root.queryCommand('mdf_param')
        ];

        if (this._statArr) {
            for (var i = 0; i < names.length; i++) {
                this._drawCombatStat(x, y + 22 * i, unit, textui, names[i], this._statArr[i]);
            }
        }
    },

    getSpaceHeight: function () {
        return 4;
    },

    getSpaceWidth: function () {
        return 24;
    }
});
