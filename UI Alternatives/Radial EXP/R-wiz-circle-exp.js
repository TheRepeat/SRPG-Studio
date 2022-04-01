/**
 * Original EXP Bar plugin by wiz.
 * Modified by Repeat.
 * Radial EXP v1.0
 * 
 * Adds a circle-shaped EXP bar option in addition to the usual bar-shaped one.
 * A config option lets the player choose between them.
 */

var ExpGaugeColor = 0xffffff;
var ExpGaugeColorEmpty = 0x000000;
var ExpGaugeColorFrame = 0xffffff;
var ExpGaugeWidth = 100;
var ExpGaugeHeight = 10;
var ExpGaugeSpeed = 20;
var isLvMaxDisplay = true;

RealExperienceFlowEntry._prepareMemberData = function (coreAttack) {
    var attackFlow = coreAttack.getAttackFlow();
    var order = attackFlow.getAttackOrder();

    this._coreAttack = coreAttack;
    this._unit = attackFlow.getPlayerUnit();
    this._getExp = order.getExp();
    this._growthArray = null;
    this._experienceNumberView = createWindowObject(ExperienceNumberView2, this);
    this._levelupView = createObject(LevelupView);
};

RealExperienceFlowEntry._completeMemberData = function (coreAttack) {
    if (!coreAttack.isRealBattle()) {
        return EnterResult.NOTENTER;
    }

    if (!Miscellaneous.isExperienceEnabled(this._unit, this._getExp)) {
        return EnterResult.NOTENTER;
    }

    this._experienceNumberView.setExperienceNumberData(this._unit, this._getExp);

    this._growthArray = ExperienceControl.obtainExperience(this._unit, this._getExp);

    if (this.isFlowSkip() || this._coreAttack.isBattleCut()) {
        this._doEndAction();
        return EnterResult.NOTENTER;
    }

    this.changeCycleMode(RealExperienceMode.WINDOW);

    return EnterResult.OK;
};

EasyExperienceFlowEntry._prepareMemberData = function (coreAttack) {
    var attackFlow = coreAttack.getAttackFlow();
    var order = attackFlow.getAttackOrder();

    this._coreAttack = coreAttack;
    this._unit = attackFlow.getPlayerUnit();
    this._getExp = order.getExp();
    this._growthArray = null;
    this._experienceNumberView = createWindowObject(ExperienceNumberView2, this);
    this._levelupView = createObject(LevelupView);
};


EasyExperienceFlowEntry._completeMemberData = function (coreAttack) {
    if (coreAttack.isRealBattle()) {
        return EnterResult.NOTENTER;
    }

    if (!Miscellaneous.isExperienceEnabled(this._unit, this._getExp)) {
        return EnterResult.NOTENTER;
    }

    this._experienceNumberView.setExperienceNumberData(this._unit, this._getExp);

    this._growthArray = ExperienceControl.obtainExperience(this._unit, this._getExp);

    if (this.isFlowSkip() || this._coreAttack.isBattleCut()) {

        this._doEndAction();
        return EnterResult.NOTENTER;
    }

    this.changeCycleMode(EasyExperienceMode.WINDOW);

    return EnterResult.OK;
};

ExperiencePlusEventCommand._prepareEventCommandMemberData = function () {
    var eventCommandData = root.getEventCommandObject();

    this._getExp = eventCommandData.getExperienceValue();
    this._type = eventCommandData.getExperiencePlusType();
    this._targetUnit = eventCommandData.getTargetUnit();
    this._levelupView = createObject(LevelupView);
    this._experienceNumberView = createWindowObject(ExperienceNumberView2, this);
    this._growthArray = null;
    this._isMaxLv = false;

    this._experienceNumberView.setExperienceNumberData(this._targetUnit, this._getExp);

    if (this._targetUnit !== null) {
        this._isMaxLv = this._targetUnit.getLv() >= Miscellaneous.getMaxLv(this._targetUnit);
        if (!this._isMaxLv && this._type === ExperiencePlusType.VALUE) {
            this._growthArray = ExperienceControl.obtainExperience(this._targetUnit, this._getExp);
        }
    }
};


ExperiencePlusEventCommand._completeEventCommandMemberData = function () {
    this.changeCycleMode(ExperiencePlusMode.EXP);

    return EnterResult.OK;
};

var ExperienceNumberView2 = defineObject(ExperienceNumberView, {
    _gauge: null,
    _isMaxLv: false,

    setExperienceNumberData: function (unit, exp) {
        var max, lim;
        var lv, mlv, max_exp;

        if (exp === 1) {
            max = 0;
        } else {
            max = 2;
        }

        lv = unit.getLv();
        mlv = Miscellaneous.getMaxLv(unit);
        if (lv == (mlv - 1)) {
            max_exp = 100 - unit.getExp();

            if (exp >= max_exp) {
                this._isMaxLv = true;
            }

            if (exp > max_exp) {
                exp = max_exp;
            }
        }

        lim = unit.getExp();
        this._unit = unit;
        this._exp = exp;

        this._balancer = createObject(SimpleBalancer);
        this._balancer.setBalancerInfo(lim, 200);
        this._balancer.setBalancerSpeed(ExpGaugeSpeed);
        this._balancer.startBalancerMove(exp);

        this._gauge = createObject(GaugeBarShape);

        this._counter = createObject(CycleCounter);
        this._counter.setCounterInfo(max);
        this.changeCycleMode(ExperienceNumberMode.COUNT);
    },

    _drawExp: function (x, y) {
        var textui = this._getTitleTextUI();
        var color = textui.getColor();
        var font = textui.getFont();
        var pic = textui.getUIImage();
        var width = TitleRenderer.getTitlePartsWidth();
        var height = TitleRenderer.getTitlePartsHeight();
        var count = this._getTitlePartsCount();
        var exp = this._balancer.getCurrentValue();

        TitleRenderer.drawTitle(pic, x, y, width, height, count);

        this._gauge.setGaugeInfo((exp % 100), 100);
        this._gauge.drawGaugeBar(x + 20, y + 26);

        var buf = ConfigItem.ExpGainType.getFlagValue() ? 140 : 112;

        x += buf;
        y += 16;

        if (this.isMaxLvUp(exp)) {
            TextRenderer.drawText(x + 10, y + 6, 'Max', -1, ColorValue.KEYWORD, font);
        } else {
            NumberRenderer.drawNumber(x, (y + 2), (exp % 100));
            TextRenderer.drawText(x + 15, y + 6, 'Exp', -1, color, font);
        }
    },

    isMaxLvUp: function (exp) {
        if (isLvMaxDisplay == true) {
            if (this._isMaxLv == true && exp == 100) {
                return true;
            }
        }
        return false;
    },

    _getTitlePartsCount: function () {
        return ConfigItem.ExpGainType.getFlagValue() ? 5 : 4;
    }
});

var GaugeBarShape = defineObject(GaugeBar, {
    setGaugeInfo: function (value, maxValue) {
        this._balancer.setBalancerInfo(value, maxValue);
    },

    drawGaugeBar: function (x, y) {
        if (!ConfigItem.ExpGainType.getFlagValue()) {
            this.drawRadialGauge(x + 32, y);
        } else {
            this.drawRectGauge(x, y);
        }
    },

    drawRadialGauge: function (x, y) {
        var radius = 32;
        var curValue = this._balancer.getCurrentValue();
        var canvas = root.getGraphicsManager().getCanvas();

        this.drawBgEllipse(x, y, canvas);

        canvas.setFillColor(ExpGaugeColor, 255);

        // Circle is 100 sections.
        // Full circle is 360 degrees, so each slice is 360/100 or 3.6 degrees offset from the previous slice.
        // x = r * sin(2piθ / 360), y = r * cos(2piθ / 360)
        for (var i = 0; i < curValue; i++) {
            var angle = 3.6 * i;
            var x2 = radius * Math.sin(Math.PI * 2 * angle / 360);
            var y2 = radius * Math.cos(Math.PI * 2 * angle / 360);

            canvas.drawLine(x, y, x + x2, y - y2, 1);
        }
    },

    drawBgEllipse: function (x, y, canvas) {
        var ellipseRadius = 36;
        canvas.setStrokeInfo(ExpGaugeColorFrame, 255, 2, false);
        canvas.setFillColor(0x0, 255);

        canvas.drawEllipse(x - ellipseRadius, y - ellipseRadius, ellipseRadius * 2, ellipseRadius * 2);
    },

    drawRectGauge: function (x, y) {
        var curValue = this._balancer.getCurrentValue();
        var maxValue = this._balancer.getMaxValue();
        var w = ExpGaugeWidth;
        var h = ExpGaugeHeight;
        var w2 = w * (curValue / maxValue);

        var canvas = root.getGraphicsManager().getCanvas();

        canvas.setStrokeInfo(ExpGaugeColorFrame, 255, 2, true);
        canvas.setFillColor(ExpGaugeColor, 255);
        this.drawShape(x, y, w, h, canvas);

        canvas.setFillColor(ExpGaugeColorEmpty, 255);
        this.drawShape(x + w2, y, w - w2, h, canvas);
    },

    drawShape: function (x, y, w, h, canvas) {
        canvas.drawRectangle(x, y, w, h);
    }
});
