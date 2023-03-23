/**
 * By Repeat.
 * Changes hit calculations to use (a close approximation of) Fates RNG, aka Hybrid RN, aka 1.5RN.
 * Tl;dr it's 1RN at or below 50 hit and is a less extreme version of 2RN above 50.
 * I love 1RN, but I'm receptive to feedback about iffy hit rates so this is the most I'll compromise.
 * (Personally, I think adding ways to improve displayed hit is more interesting than making your hit rates inaccurate)
 * 
 * Technically, *real* hybrid RN uses a much more complicated formula than what I have in this plugin, based on 
 * the different way those games calculate hit (for example, multiplying hit by 100 first) and apparently because of 
 * some oddities born of the 3DS hardware. I dunno, I'm an expert on neither 3DS hardware nor probability models.
 * 
 * Reddit user u/matasj98 made a formula (below) that gets more or less the same result but with a more readable equation.
 * (details: https://www.reddit.com/r/fireemblem/comments/ae5666/echoes_absolutely_uses_fates_rn_bonus_explanation/)
 * So I'm using that. You can root.log hit and trueHit below to check the math.
 * 
 * Formula:
 * {0<x<=50} y = x;
 * {50<x<100} y = x + x (-2/15 * sin(x * (pi/50)))
 */

AttackEvaluator.HitCritical.calculateHit = function (virtualActive, virtualPassive, attackEntry) {
    var hit = HitCalculator.calculateHit(virtualActive.unitSelf, virtualPassive.unitSelf, virtualActive.weapon, virtualActive.totalStatus, virtualPassive.totalStatus);
    var trueHit = hit;

    if (hit > 50) {
        trueHit = hit + hit * (-2 / 15 * Math.sin(hit * (Math.PI / 50)));

        if (trueHit > DefineControl.getMaxHitPercent()){
            trueHit = DefineControl.getMaxHitPercent();
        }
    }

    return Probability.getProbability(trueHit);
}
