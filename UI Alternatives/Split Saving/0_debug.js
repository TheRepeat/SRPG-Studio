
// debug feature - draws translucent rectangles visualizing the width of the mouse range areas
function debug_drawRange(x, y, w, h) {
    var canvas = root.getGraphicsManager().getCanvas();

    canvas.setFillColor(0xFF0000, 100);
    canvas.drawRectangle(x, y, w, h);
}