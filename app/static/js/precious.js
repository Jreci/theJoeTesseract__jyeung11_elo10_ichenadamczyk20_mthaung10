//preserving a funny bug








































var c = document.getElementById("slate");
var ctx = c.getContext("2d");
const CANVAS_HEIGHT = ctx.canvas.height;
const CANVAS_WIDTH = ctx.canvas.width;
var requestID = 0;
var player;
var canvasFillColor = "#FFFFFF";
//this state variable tracks whether the game is not started, has started, is paused, is finished, etc
var state = "not started";

//physics parameters
var gravity = -0.2;
var friction = 0.7;
var airResistance = 0.1;

//player object
var Player = function() {
    //spawn location
    this.spawn = [200, 200];
    //current location (top left)
    this.x = 20;
    this.y = 20;
    //velocity
    this.dx = 0;
    this.dy = 0;
    this.maxSpeed = 5;
    this.jumpStrength = -5;
    //state var for if player is jumping or not
    this.airborne = true;
    //player collision size
    this.width = 20;
    this.height = 20;
    //update player physics
    this.move = function() {
        this.x += this.dx;
        this.y += this.dy;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.width;
        if (this.y + this.height > CANVAS_HEIGHT) {
            this.y = CANVAS_HEIGHT - this.height;
            this.dy = 0; //hits the ground, resets gravity
            this.airborne = false;
        }
        if (this.y < 0) this.y = 0;
        this.dy -= gravity; //gravity
    }
    //update player inputs
    this.inputUpdate = function() {
        if (inputs.left) this.dx = -this.maxSpeed;
        if (inputs.right) this.dx = this.maxSpeed;
        if (!inputs.left && !inputs.right) this.dx = 0;
        if (inputs.up && !this.airborne) {
            this.dy = this.jumpStrength;
            this.airborne = true;
            console.log("being jumped");
        }
    }
    //draws the player on the canvas
    this.render = function() {
        ctx.fillStyle = "#F08080";
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();
    };
    //check collision with object
    this.updateCollision = function(obbi) {
        var direction = obbi.checkDirection(this);
        if (direction == "left") this.dx = Math.max(0, this.dx);//obbi is to the left of player
        if (direction == "right") this.dx = Math.min(0, this.dx);//obbi is to the right of player
        if (direction == "up") this.dy = Math.max(0, this.dy);//obstacle is above player
        if (direction == "down") {
            this.airborne = false;
            this.dy = Math.min(0, this.dy);//obstacle is below Player
        }
    };
};

//camera variables
var Camera = {
    //camera position
    x: 300,
    y: 300,
    //camera bounds (how far the camera can move away from the player)
    left: 300,
    right: 300,
    bottom: 300,
    top: 600,
    //total field of view
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
};

//obstacle
var Obbi = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    //this.anchored = false;
    this.render = function() {
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();
    };

    //determines the direction that the platform is in from the player's perspective
    this.checkDirection = function(player) { //returns left, right, up, down, or ibbixyzzy
        if (intersect(player.x, player.x + player.width, this.x, this.x + this.width)) { //if the x ranges intersect
            //further testing for up or down
            if (player.y + player.height < this.y) //if the bottom of the player is above the top of the obbi
                return "down"; //then the obbi is downwards from the player
            return "up";
        }
        else if (intersect(player.y, player.y + player.height, this.y, this.y + this.height)) { //if the y ranges intersect
            //further testing for left or right
            if (player.x + player.width < this.x) //if the right side of the player is left of the left of the obbi
                return "right"; //then the obbi is right from the player
            return "left"; 
        }
        return "ibbixyzzy";
    };
};

//level
var Level = function() {
    // load obstacles, set music, spawn, etc.
}

function intersect(p1, p2, q1, q2) {
    var [a, b] = [Math.max(p1, q1), Math.min(p2, q2)];
    if (a < b) return true;
    return false;
}


// moving polygon collisions
{
    //asdf
}

// playing/not playing states
{
    // figure out how to pause the game and stuff idrk
}


var obbies = [];

var onCameraObbies = [];

function init() {
    AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    initializeSounds();
    player = new Player();
    obbies.push(new Obbi(200, 700, 500, 50));

}

var bgm = false;
function render() {
    window.cancelAnimationFrame(requestID);
    if (!bgm) {
        playSound("bgm", "loop");
        bgm = true;
    }
    // clear canvas
    ctx.fillStyle = canvasFillColor;
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fill();

    // update player state through inputs
    player.inputUpdate();

    // update player state through physics

    // update obstacles state if necessary

    // move the player
        // check for collisions through the path
            // if so, deflect the path of the player using projections
            // if the player's startpoint endpoint is in the object, do something to get the player unstuck
    for (var i = 0; i < obbies.length; i++) {
        player.updateCollision(obbies[i]);  
    } //loop through onCameraObbies eventually
    player.move();
    
    // update the camera

    // render the player and obstacles
    player.render();
    for (var i = 0; i < obbies.length; i++) {
        obbies[i].render();
    }

    // play the sounds
    playSounds();

    requestID = window.requestAnimationFrame(render); 
};

function stopRender() {
    playSound("bgm", "STGOP");
    if (Math.random() < 0.99) playSounds(); // trash easter egg
    window.cancelAnimationFrame(requestID);
    bgm = false;
};