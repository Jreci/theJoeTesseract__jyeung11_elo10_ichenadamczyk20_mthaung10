//adsf
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
var gravity = 0.2;
var friction = 0.7;
var airResistance = 0.1;

var floodTimer=-10;

//ALL X AND Y COORDINATES FOR CAMERA, PLAYER, AND OBBI ARE ON THE FIRST QUADRANT OF A NORMAL CARTESIAN PLANE.
//THE ONLY PLACES WHERE THE CANVAS COORDINATE SYSTEM IS USED IS WITH RECT METHODS, ETC.

//player object
var Player = function(level) {
    //movement variables
    this.x = 20; //inital values of spawn (top left of the player)
    this.y = 20;
    this.dx = 0;
    this.dy = 0;
    this.maxSpeed = 5;
    this.jumpStrength = 7;
    this.airborne = true;
    this.width = 20;
    this.height = 20;

    //update player physics
    this.move = function() {
        //change position according to velocity
        this.x += this.dx;
        this.y += this.dy;

        //restricting the player to the confines of the level size
        //left wall
        if (this.x < 0) this.x = 0; 
        //right wall
        if (this.x + this.width > level.width) this.x = level.width - this.width; 
        //floor
        if (this.y - this.height < 0) { 
            this.y = this.height;
            this.dy = 0; //hits the ground, resets gravity
            this.airborne = false;
        }
        //ceiling
        if (this.y > level.height) this.y = level.height; 

        //change velocity according to acceleration
        this.dy -= gravity;
    }

    //update speeds based on player inputs
    this.inputUpdate = function() {
        if (inputs.left) this.dx = -this.maxSpeed;
        if (inputs.right) this.dx = this.maxSpeed;
        if (!inputs.left && !inputs.right) this.dx = 0;
        if (inputs.up && !this.airborne) {
            this.dy = this.jumpStrength;
            this.airborne = true;
        }
    }

    //draws the player on the canvas. the player is fixed to the middle height of the canvas, while the world moves around it. (relativity)
    this.render = function() {
        ctx.fillStyle = "#F08080";
        ctx.beginPath();
        ctx.rect(this.x, CANVAS_HEIGHT/2, this.width, this.height);
        ctx.fill();
    };

    //check collision with object
    this.updateCollision = function(obbi) {
        var direction = obbi.checkDirection(this);
        if (direction == "left") {
            this.dx = Math.max(0, this.dx);//obbi is to the left of player
            this.x = obbi.x + obbi.width;
        }
        if (direction == "right") {
            this.dx = Math.min(0, this.dx);//obbi is to the right of player
            this.x = obbi.x - this.width;
        }
        if (direction == "up") {
            this.dy = Math.min(0, this.dy);//obstacle is above player
            this.y = obbi.y - obbi.height;
        }
        if (direction == "down") {
            this.airborne = false; 
            this.dy = Math.max(0, this.dy);//obstacle is below Player
            this.y = obbi.y + this.height;
        }
    };
};

//camera variables
var Camera = {
    //camera position (top left of the camera, relative to level coordiantes)
    x: 0,
    y: CANVAS_HEIGHT / 2,
    follow: function(player) {
        this.y = player.y + CANVAS_HEIGHT / 2;
    },
};

//obstacle
var Obbi = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.cameraYOffset = 0; //this is the canvas coordinate
    //this.anchored = false;
    this.render = function () {
        this.cameraYOffset = Camera.y - this.y; //dist b/t camera and obbi
        if (this.cameraYOffset <= CANVAS_HEIGHT && this.cameraYOffset > 0) {//if the obbi is in the range of the camera, render it
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.rect(this.x, this.cameraYOffset, this.width, this.height);
            ctx.fill();
        }
    };

    //determines the direction that the platform is in from the player's perspective
    this.checkDirection = function(player) { //returns left, right, up, down, or ibbixyzzy
        if (intersect(player.y, player.y + player.height, this.y, this.y + this.height)) { //if the y ranges intersect
            //further testing for left or right
            if (player.x + player.width >= this.x && player.x < this.x) //if the right side of the player is left of the left of the obbi
                return "right"; //then the obbi is right from the player
            if (player.x + player.width > this.x + this.width && player.x <= this.x + this.width)
                return "left";
        }
        if (intersect(player.x, player.x + player.width, this.x, this.x + this.width)) { //if the x ranges intersect
            //further testing for up or down
            if (player.y - player.height <= this.y && player.y > this.y) //if the bottom of the player is above the top of the obbi
                return "down"; //then the obbi is downwards from the player
            if (player.y - player.height < this.y - this.height && player.y >= this.y - this.height)
                return "up";
        }
        return "ibbixyzzy";
        //BUG: collision "works" but distance to the platform isn't being considered: if you're above the platform, you can't move down regardless of touching it, and etc.
    };
};

//level
var Level = function() {
    // max size of world
    this.width = 800;
    this.height = 10000;
    this.obbies = [
        new Obbi(0, 0, 800, 20),
        new Obbi(0, 0, 20,  10000),
        // new Obbi(200, 30, 600, 20),
        // new Obbi(300, 130, 600, 20),
        // new Obbi(400, 230, 600, 20),
        // new Obbi(500, 330, 600, 20),
        // new Obbi(600, 430, 600, 20),
        // new Obbi(700, 530, 600, 20),
        // new Obbi(0, 630, 600, 20),
        // new Obbi(0, 730, 500, 20),
        // new Obbi(0, 830, 400, 20),
        // new Obbi(0, 930, 300, 20),
        // new Obbi(0, 1030, 200, 20),
        // new Obbi(0, 1130, 100, 20),
        // new Obbi(200, 1230, 600, 20),
        // new Obbi(300, 1330, 600, 20),
        // new Obbi(400, 1430, 600, 20),
        // new Obbi(500, 1530, 600, 20),
        // new Obbi(600, 1630, 600, 20),
        // new Obbi(700, 1730, 600, 20),
        // new Obbi(0, 1830, 600, 20),
        // new Obbi(0, 1930, 500, 20),
        // new Obbi(0, 2030, 400, 20),
        // new Obbi(0, 2130, 300, 20),
        // new Obbi(0, 2230, 200, 20),
        // new Obbi(0, 2330, 100, 20),
        // new Obbi(200, 2430, 600, 20),
        // new Obbi(300, 2530, 600, 20),
        // new Obbi(400, 2630, 600, 20),
        // new Obbi(500, 2730, 600, 20),
        // new Obbi(600, 2830, 600, 20),
        // new Obbi(700, 2930, 600, 20),
        // new Obbi(0, 3030, 600, 20),
        // new Obbi(0, 3130, 500, 20),
        // new Obbi(0, 3230, 400, 20),
        // new Obbi(0, 3330, 300, 20),
        // new Obbi(0, 3430, 200, 20),
        // new Obbi(0, 3530, 100, 20),



    ];

};

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

function init() {
    AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    initializeSounds();
    level = new Level();
    player = new Player(level);


    floodTimer=-10;
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
    for (var i = 0; i < level.obbies.length; i++) {
        player.updateCollision(level.obbies[i]);  
    } //loop through onCameraObbies eventually
    player.move();
    
    // update the camera
    Camera.follow(player);

    // render the player and obstacles
    player.render();
    for (var i = 0; i < level.obbies.length; i++) {
        level.obbies[i].render();
    }

    // play the sounds
    //playSounds();
    
    if (floodTimer > player.y-400) { //if flood reaches screen
        //"water"
        ctx.beginPath();
        ctx.fillStyle="#ADD8E6";
        ctx.fillRect(0, 800-(floodTimer-(player.y-400)), 800, 800-(floodTimer-(player.y-400)));
        ctx.stroke();

        //top of water
        ctx.beginPath();
        ctx.moveTo(0, 800-(floodTimer-(player.y-400)));
        ctx.lineTo(800, 800-(floodTimer-(player.y-400)));
        ctx.lineWidth=5;
        ctx.strokeStyle="#0000FF";
        ctx.stroke();
    }
    

    floodTimer+=0.0;//flood rising rate

    if (player.y <= floodTimer) {//if player drowns
        var img = document.getElementById("gameover");
        ctx.drawImage(img, 0, 0);
        document.getElementById("startStop").click();
        stopped=true;
        document.getElementById("init").click();
        yPos = player.y;
        console.log(yPos);
        //document.getElementById("submitScore").submit();
    }
    //console.log("floodTimer= "+floodTimer);
    //console.log("player y = "+player.y);
    //console.log(stopped);

    requestID = window.requestAnimationFrame(render); 
};

function stopRender() {
    playSound("bgm", "STGOP");
    if (Math.random() < 0.99) playSounds(); // trash easter egg
    window.cancelAnimationFrame(requestID);
    bgm = false;
};