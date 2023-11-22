/**
 * By Repeat.
 * When the user has a custom skill with keyword "recoverystate", they are given a state when healed.
 * Custom parameter {recoveryStateId:x} on the skill defines the ID of the state (x) to inflict.
 * Ex:
{
    recoveryStateId:2
}
 * 
 * By "when healed", I mean:
 *  * Healed using an item of type HP Recovery
 *  * Healed using an item of type Full Recovery
 *  * Healed via a skill of type Damage Absorption
 *  * Healed via a weapon that has the Damage Absorption weapon option
 * 
 * Function(s) overridden without an alias:
 *  * AttackEvaluator.ActiveAction._arrangeActiveDamage
 */

(function () {
    var alias1 = RecoveryItemUse.enterMainUseCycle;
    RecoveryItemUse.enterMainUseCycle = function (itemUseParent) {
        var itemTargetInfo = itemUseParent.getItemTargetInfo();

        addRecoveryState(itemTargetInfo.targetUnit);

        return alias1.call(this, itemUseParent);
    }

    var alias2 = EntireRecoveryItemUse.mainAction;
    EntireRecoveryItemUse.mainAction = function () {
        var i, targetUnit;
        var info = this._itemUseParent.getItemTargetInfo();
        var arr = EntireRecoveryControl.getTargetArray(info.unit, info.item);
        var count = arr.length;

        for (i = 0; i < count; i++) {
            targetUnit = arr[i];
            addRecoveryState(targetUnit);
        }

        return alias2.call(this);
    }
})();

// this could probably be aliased but idc
AttackEvaluator.ActiveAction._arrangeActiveDamage = function (virtualActive, virtualPassive, attackEntry) {
    var max;
    var active = virtualActive.unitSelf;
    var damageActive = attackEntry.damageActive;
    var damagePassive = attackEntry.damagePassive;

    if (this._isAbsorption(virtualActive, virtualPassive, attackEntry)) {
        max = ParamBonus.getMhp(active);

        damageActive = damagePassive;

        if (virtualActive.hp < max) {
            addRecoveryState(active);
        }

        if (virtualActive.hp + damageActive > max) {
            damageActive = max - virtualActive.hp;

        }

        // If damage is minus, it means recovery.
        damageActive *= -1;
    }
    else {
        damageActive = 0;
    }

    return damageActive;
}

function addRecoveryState(unit) {
    var skill = SkillControl.getPossessionCustomSkill(unit, 'recoverystate');

    if (!skill) {
        return;
    }

    if (!skill.custom.recoveryStateId) {
        throwRecoveryStateError(skill);
    }

    var state = root.getBaseData().getStateList().getDataFromId(skill.custom.recoveryStateId);

    StateControl.arrangeState(unit, state, IncreaseType.INCREASE);
}

function throwRecoveryStateError(skill) {
    root.msg('Error with skill \"' + skill.getName() + '\"\n* Needs custom parameter \'recoveryStateId\'.')
    root.endGame();
}