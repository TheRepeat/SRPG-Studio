/**
 * By Repeat.
 * Draws dangerous skills on enemies in the combat forecast.
 * 
 * If SHOW_PRECISE = false, then all skills will be shown beneath the forecast.
 * If SHOW_PRECISE = true (default), then an enemy's skills with custom parameter {dangerSkill:true} will show in the forecast.
 * 
 * @param {boolean} dangerSkill - Give this to a dangerous skill you'd want your players to be warned about if an enemy possesses it.
 * Generally, you wouldn't expect an enemy to have a ton of dangerous skills, 
 * so this is intended for those units to have 3 or fewer such dangerous skills.
 */
(function () {

    SHOW_PRECISE = false; // true: show enemy skills with custom parameter, false: show all skills below forecast

    var alias1 = PosAttackWindow.drawInfo;
    PosAttackWindow.drawInfo = function (xBase, yBase) {
        alias1.call(this, xBase, yBase);
        this._drawSkillIcons(xBase, yBase);
    }

    PosAttackWindow._drawSkillIcons = function (x, y) {
        var unit = this._unit;
        var isEnemy = this._unit.getUnitType() === UnitType.ENEMY;
        var xBase = x;
        var yBase = y;
        if (SHOW_PRECISE) {
            xBase += this.getWindowWidth() - GraphicsFormat.FACE_WIDTH / 2;
        } else {
            yBase += this.getWindowHeight() - 16;
        }


        // weapon is allowed to be null
        var skillList = SkillControl.getSkillMixArray(unit, ItemControl.getEquippedWeapon(unit), -1, '');

        for (var i = 0; i < skillList.length; i++) {
            var skill = skillList[i].skill;
            var able = SHOW_PRECISE ? !skill.isHidden() && skill.custom.dangerSkill && isEnemy : !skill.isHidden();
            if (able) {
                var handle = skill.getIconResourceHandle();
                GraphicsRenderer.drawImage(xBase, yBase, handle, GraphicsType.ICON);
                if (SHOW_PRECISE) {
                    yBase += GraphicsFormat.ICON_HEIGHT;
                } else {
                    xBase += GraphicsFormat.ICON_WIDTH;
                }
            }
        }
    }
})();