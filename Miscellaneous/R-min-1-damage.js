/**
 * By Repeat.
 * Modifies the damage calculator so that the minimum damage a unit can take is 1.
 * If a unit or the unit's class has the custom parameter zeroDamage, then the minimum will be 0.
 * Custom parameter example:
    {zeroDamage:true}
 * If the unit gets a crit while dealing the minimum damage, the damage dealt will still multiply by the critical coefficient.
 * This plugin also adds an optional MAXIMUM damage. Change the return value of DefineControl.getMaxDamage to change the cap.
 *  * If you don't want a damage cap, have DefineControl.getMaxDamage return -1.
 * 
 * Functions overridden without an alias:
 *  * DefineControl.getMinDamage
 *  * DamageCalculator.validValue
 *  * DamageCalculator.calculateDamage is only aliased if the attack is not a critical hit
 */

DefineControl.getMinDamage = function () {
    return 1;
}

// New function in case you want to cap damage at a particular value too.
// If you don't, set the value equal to -1 and there will be no damage cap.
DefineControl.getMaxDamage = function () {
    return -1;
}

// passes isCritical as a new argument to validValue if applicable
var alias1 = DamageCalculator.calculateDamage;
DamageCalculator.calculateDamage = function (active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue) {
    var pow, def, damage;

    if (!isCritical) {
        return alias1.apply(this, arguments)
    }

    if (this.isHpMinimum(active, passive, weapon, isCritical, trueHitValue)) {
        return -1;
    }

    pow = this.calculateAttackPower(active, passive, weapon, isCritical, activeTotalStatus, trueHitValue);
    def = this.calculateDefense(active, passive, weapon, isCritical, passiveTotalStatus, trueHitValue);

    damage = pow - def;
    if (this.isHalveAttack(active, passive, weapon, isCritical, trueHitValue)) {
        if (!this.isHalveAttackBreak(active, passive, weapon, isCritical, trueHitValue)) {
            damage = Math.floor(damage / 2);
        }
    }

    if (this.isCritical(active, passive, weapon, isCritical, trueHitValue)) {
        damage = Math.floor(damage * this.getCriticalFactor());
    }

    return this.validValue(active, passive, weapon, damage, isCritical);
}

// Unit damage floors at 1 unless the unit's class has custom parameter 
// {zeroDamage:true}
// in which case it'll floor at 0.
DamageCalculator.validValue = function (active, passive, weapon, damage, isCritical) {
    var cls = passive.getClass();
    var weapon = ItemControl.getEquippedWeapon(passive);
    var damageFloorsAtZero = cls.custom.zeroDamage || passive.custom.zeroDamage || (weapon && weapon.custom.zeroDamage);
    var minDamage = damageFloorsAtZero ? 0 : DefineControl.getMinDamage();

    if (damage < minDamage) {
        damage = minDamage;

        if (isCritical) {
            damage *= this.getCriticalFactor();
        }
    }

    if (DefineControl.getMaxDamage() !== -1 && damage > DefineControl.getMaxDamage()) {
        damage = DefineControl.getMaxDamage();
    }

    return damage;
}
