// polygon in-or-out stuff (TESTED AND FIXED)
// isItIn(polygonPoints, testPoint), doesItIntersect(segment, startPoint)
{
    //uses ray-casting algorithm: https://en.wikipedia.org/wiki/Point_in_polygon#Ray_casting_algorithm
    //basically draws a vector from the point towards anywhere; if the vector crosses the polygon an even number of times, the point has to be outside. if it crosses once, the point is inside.
    
    //this fxn determines if a given point is within a polygon
    function isItIn(polygonPoints, testPoint) {
        // uses the ray that goes from testPoint in the west direction
        var intersects = 0;
        //iterate through each polygon point to form a segment (each side of the polygon)
        for (var i = 0; i < polygonPoints.length; i++) {
            var segment;
            if (i == polygonPoints.length - 1) {
                segment = [polygonPoints[i], polygonPoints[0]];
            } else {
                segment = [polygonPoints[i], polygonPoints[i + 1]];
            }
            intersects += doesItIntersect(segment, testPoint);
            console.log(intersects);
        }
        return (intersects % 2 == 0) ? false : true;
    }
    //vector overlapping checking
    function doesItIntersect(segment, testPoint) {
        var lowY = Math.min(segment[0][1], segment[1][1]);
        var highY = Math.max(segment[0][1], segment[1][1]);
        var highX = Math.max(segment[0][0], segment[1][0]);
        if (testPoint[1] <= lowY || testPoint[1] >= highY) return 0;
        if (testPoint[0] >= highX) return 0;
        return 1;
    }
    
    // TEST CASES
    // concave, point is in
    console.log(isItIn([[0, 0], [0, 1], [1, 1], [1, 0]], [0.5, 0.5]));
    // concave, point is out
    console.log(isItIn([[0, 0], [0, 1], [1, 1], [1, 0]], [-0.5, -0.5]));
    // convex, point is in
    console.log(isItIn([[0, 0], [0, 2], [1, 2], [1, 1], [2, 1], [2, 0]], [0.5, 1.5]));
    console.log(isItIn([[0, 0], [0, 2], [1, 2], [1, 1], [2, 1], [2, 0]], [1.5, 0.5]));
    // convex, point is out
    console.log(isItIn([[0, 0], [0, 2], [1, 2], [1, 1], [2, 1], [2, 0]], [1.5, 1.5]));
    console.log(isItIn([[0, 0], [0, 2], [1, 2], [1, 1], [2, 1], [2, 0]], [-0.5, -0.5]));
    
}
