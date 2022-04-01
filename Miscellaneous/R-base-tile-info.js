/**
 * By Repeat.
 * Will not use the terrain data of the transparent layer if that terrain has this custom parameter:
 *      {showBaseTileData:true}
 * (The custom parameter has no effect on base-layer terrain.)
 * 
 * The effects of this plugin on the defined terrain include but are not limited to:
 *  * The terrain window displays the base layer's data
 *  * The terrain's battle background is ignored
 *  * The terrain's stat changes are ignored
 *  * The terrain's HP recovery value is ignored
 *  * The terrain can't grant skills 
 * All of these use the data from the terrain on the base layer instead.
 * TL;DR: this plugin removes almost all functionality for the defined terrain and makes it purely visual.
 * 
 * An important exception is that movement costs will still check the transparent layer, not the base layer!
 * There's nothing I can do to fix that since movement costs are checked with an internal function I can't edit (MapSimulator.getSimulationMovePoint()).
 * You'll need to make duplicate transparent-layer tiles with the correct movement costs.
 * 
 * I've also received reports of Terrain Groups sometimes still using the top layer instead of the bottom layer. This also seems to be internal.
 * My recommended solution is praying to the deity of your choice that it works for you.
 */
(function () {
    var terrainGetterAlias = PosChecker.getTerrainFromPos;
    PosChecker.getTerrainFromPos = function (x, y) {
        var terrain = terrainGetterAlias.call(this, x, y);
        if (terrain && !terrain.custom.showBaseTileData) {
            return terrain;
        }
        return this.getTerrainFromPosEx(x, y);
    }
})();
