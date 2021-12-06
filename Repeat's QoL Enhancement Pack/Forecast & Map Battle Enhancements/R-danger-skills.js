/**
 * By Repeat.
 * Draws dangerous skills on enemies in the combat forecast.
 * 
 * Feel free to edit these values inside the DangerSkillConfig object:
 *  * DangerSkillConfig.showPrecise
 *     - If showPrecise: false, then all skills will be shown in the forecast.
 *     - If showPrecise: true (default), then an enemy's skills with custom parameter {dangerSkill:true} will show in the forecast.
 *  * DangerSkillConfig.drawTop only affects the position of the skills if showPrecise is false. Otherwise you can ignore it.
 *     - If drawTop: false, then skills will be drawn below the forecast. 
 *        * Note that skill icons may be partially hidden behind the "Attack x2" graphic unless that has been changed by another plugin.
 *     - If drawTop: true (default), then skills will be drawn above the forecast.
 * 
 * @param {boolean} dangerSkill - Give this to a dangerous skill you'd want your players to be warned about if an enemy possesses it.
 * Generally, you wouldn't expect an enemy to have a ton of dangerous skills, 
 * so this is intended for those units to have 3 or fewer such dangerous skills.
 */
(function () {
    // Editable values
    var DangerSkillConfig = {
        drawTop: true, // draw either above or below the combat forecast (only matters if showPrecise = false)
        showPrecise: true // show just 3 dangerous skills on enemies (true) or show all skills for both units (false)
    }
    // End of editable values

    var alias1 = PosAttackWindow.drawInfo;
    PosAttackWindow.drawInfo = function (xBase, yBase) {
        this._drawSkillIcons(xBase, yBase);
        alias1.call(this, xBase, yBase);
    }

    PosAttackWindow._drawSkillIcons = function (x, y) {
        var unit = this._unit;
        var isEnemy = this._unit.getUnitType() === UnitType.ENEMY;
        var xBase = x;
        var yBase = y;
        if (DangerSkillConfig.showPrecise) {
            xBase += this.getWindowWidth() - GraphicsFormat.FACE_WIDTH / 2;
        } else {
            var yMod = DangerSkillConfig.drawTop ? -40 : this.getWindowHeight() - 16;
            yBase += yMod;
        }

        // weapon is allowed to be null
        var skillList = SkillControl.getSkillMixArray(unit, ItemControl.getEquippedWeapon(unit), -1, '');

        for (var i = 0; i < skillList.length; i++) {
            var skill = skillList[i].skill;
            var able = DangerSkillConfig.showPrecise ? !skill.isHidden() && skill.custom.dangerSkill && isEnemy : !skill.isHidden();
            if (able) {
                var handle = skill.getIconResourceHandle();
                GraphicsRenderer.drawImage(xBase, yBase, handle, GraphicsType.ICON);
                if (DangerSkillConfig.showPrecise) {
                    yBase += GraphicsFormat.ICON_HEIGHT;
                } else {
                    xBase += GraphicsFormat.ICON_WIDTH;
                }
            }
        }
    }
})();