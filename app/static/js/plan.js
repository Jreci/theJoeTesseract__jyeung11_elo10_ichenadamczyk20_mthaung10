//physics engine map

var Player = function() { // the player object
    // state variables of location, speed, size, actions that it is doing
    this.forces = []; // force queue
    this.system = []; // for not getting squeezed between objects
    this.update = function() {
        // checks to see if the player is inside an object, e.g. being pushed by an object
        // moves the player accordingly by applying the object's velocity (object moved right by 10 px=>player moves right by 10px)
        // finds the edge the player exited using a new doesItIntersect, and  uses that to apply momentum to the player's velocity

        // applies player's velocity to its position and checks to see if the new location the player is going to hits an object
        // if it does, it finds the first edge the player would pass through and projects the player's change in position vector
        // onto that edge (e.g. if the player jumps into an angled polygon, the player would be pushed to the left/right)
        // for the duration of the projection of the change in position vector, friction is also applied
        // finally it exerts the reverse force on the object for the next frame
    }
};

var Obbi = function() { // the obstacle object
    // state variables of speed and size, maybe also mass, friction coefficient, (un)anchored, also min/max X/Y for optimization
    this.forces = []; //force queue
    this.onScreen = function() {
    }
    this.update = function(otherObstacle) {
    } 
};

function render() {

}