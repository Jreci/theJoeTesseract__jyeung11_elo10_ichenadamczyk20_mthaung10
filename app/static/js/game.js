
var c = document.getElementById("slate");
var ctx = c.getContext("2d");
//audio context is for playing music
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const CANVAS_HEIGHT = ctx.canvas.height;
const CANVAS_WIDTH = ctx.canvas.width;
var requestID = 0;
//this state variable tracks whether the game is not started, has started, is paused, is finished, etc
var state = "not started";

//physics parameters
var gravity = 0.6;
var friction = 0.7;
var airResistance = 0.1;

//player object
var Player = function() {
    //spawn location
    this.spawn = [200, 200];
    //current location
    this.x = 20;
    this.y = 20;
    //velocity
    this.dx = 0;
    this.dy = 0;
    this.maxSpeed = 5;
    //state var for if player is jumping or not
    this.jump = true;
    //player collision size
    this.width = 20;
    this.height = 20;
    //draws the player on the canvas
    this.render = function() {
        ctx.fillStyle = "#F08080";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    this.system = []; // the objects that the player is interacting with and have to be physic'ed
    this.forces = []; // forces the player exerts
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
var Obbi = function() {
    this.vertices = [];
    this.dx = 0;
    this.dy = 0;
    this.anchored = false;
    this.render = function() {

    };
    this.system = []; // the objects (and not the player) that have to be physic'ed
    this.forces = []; // forces this object exerts
};

//level
var Level = function() {
    // load obstacles, set music, spawn, etc.
}

//input stuff (TESTED)
// inputs.left, inputs.right, inputs.up are the inputs to "worry" about
{
    var inputs = {
        left: false,
        right: false,
        up: false,
    };
    
    // WASD, IJKL, arrow keys, and spacebar
    function keydown(e) {
        switch(e.keyCode) {
            case 37: //left
                inputs.left = true;
                break;
            case 65: //a
                inputs.left = true;
                break;
            case 74: //j
                inputs.left = true;
                break;
            case 38: //up
                inputs.up = true;
                break;
            case 87: //w
                inputs.up = true;
                break;
            case 73: //i
                inputs.up = true;
                break;
            case 32: //spacebar
                inputs.up = true;
                break;
            case 39: //right
                inputs.right = true;
                break;
            case 76: //l
                inputs.right = true;
                break;
            case 68: //d
                inputs.right = true;
                break;
        }
    };

    function keyup(e) {
        switch(e.keyCode) {
            case 37: //left
                inputs.left = false;
                break;
            case 65: //a
                inputs.left = false;
                break;
            case 74: //j
                inputs.left = false;
                break;
            case 38: //up
                inputs.up = false;
                break;
            case 87: //w
                inputs.up = false;
                break;
            case 73: //i
                inputs.up = false;
                break;
            case 32: //spacebar
                inputs.up = false;
                break;
            case 39: //right
                inputs.right = false;
                break;
            case 76: //l
                inputs.right = false;
                break;
            case 68: //d
                inputs.right = false;
                break;
        }
    };

    //adding the event listeners
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
}

//sound stuff (TESTED)
// don't mind these: soundQueue, loadSound(key, url), makeSoundSource(key), playSounds()
// run initializeSounds() on initialize, run playSound(key, state) to play a sound
{
    var soundQueue = {
        jump: "stop",
        walk: "stop",
        land: "stop",
        sounds: {
            jump: {
                url: "https://ia800109.us.archive.org/16/items/Mu-Ziq_Soundcloud_001-100_of_392/001-100/001%20In%20Hospital.mp3",
                volume: 0.25
            },
            land: {
                url: "https://ia801003.us.archive.org/15/items/Mu-Ziq_Soundcloud_301-392_of_392/371%20µ-Ziq%20-%20BLT.mp3", //"https://www.myinstants.com/media/sounds/discord-notification.mp3",
                volume: 0.25
            },
            walk: {
                url: "https://ia800109.us.archive.org/16/items/Mu-Ziq_Soundcloud_001-100_of_392/001-100/062%20Cheeky%20Chappie.mp3",
                volume: 0.25
            },
            bgm: {
                url: "https://ia801003.us.archive.org/15/items/Mu-Ziq_Soundcloud_301-392_of_392/371%20µ-Ziq%20-%20BLT.mp3",
                volume: 0.25
            },
        }
    };
    var loadSound = function(key, url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            console.log(request.response);
            audioContext.decodeAudioData(request.response, function(buffer) {
                soundQueue.sounds[key].buffer = buffer;
                soundQueue.sounds[key].gain = audioContext.createGain();
                soundQueue.sounds[key].gain.connect(audioContext.destination);
                soundQueue.sounds[key].gain.gain.value = soundQueue.sounds[key].volume;
                makeSoundSource(key);
            }, () => {
                alert("error loading sound");
            });
        };
        request.send();
    };
    var makeSoundSource = function(key) {
        soundQueue.sounds[key].source = audioContext.createBufferSource();
        soundQueue.sounds[key].source.buffer = soundQueue.sounds[key].buffer;
        soundQueue.sounds[key].source.connect(soundQueue.sounds[key].gain);
    };
    var initializeSounds = function() {
        var soundEntries = Object.entries(soundQueue.sounds);
        for (var i = 0; i < soundEntries.length; i++) {
            loadSound(soundEntries[i][0], soundEntries[i][1].url)
        }
    };
    var playSounds = function() {
        var soundStates = Object.entries(soundQueue);
        for (var i = 0; i < soundStates.length; i++) {
            var key = soundStates[i][0];
            if (key == "sounds") continue;

            var state = soundStates[i][1];
            if (state == "stop") continue;
            if (state == "STGOP") {
                soundQueue.sounds[key].source.stop();
                soundQueue[key] = "stop";
                continue;
            }

            if (soundQueue.sounds[key].gain == undefined) {
                console.log("sound not loaded yet LOL");
                continue;
            }
            makeSoundSource(key);
            soundQueue.sounds[key].source.start();
            if (state == "loop") {
                soundQueue.sounds[key].source.loop = true;
                soundQueue[key] = "stop";
            }
            if (state == "once")
                soundQueue[key] = "stop";
        }
    };
    //this function is the really important one
    var playSound = function(key, state) {
        soundQueue[key] = state;
    };
}

// polygon in-or-out stuff (TESTED AND FIXED)
// isItIn(polygonPoints, testPoint, directionPoint), doesItIntersect(segment, startPoint, delta)
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
    initializeSounds();
}

var bgm = false;
function render() {
    window.cancelAnimationFrame(requestID);
    if (!bgm) {
        playSound("bgm", "loop");
        bgm = true;
    }
    // update player state through inputs

    // update player state through physics

    // update obstacles state if necessary

    // move the player
        // check for collisions through the path
            // if so, deflect the path of the player using projections
            // if the player's startpoint endpoint is in the object, do something to get the player unstuck
    
    // update the camera

    // render the player and obstacles

    // play the sounds
    playSounds();

    requestID = window.requestAnimationFrame(render); 
};

function stopRender() {
    window.cancelAnimationFrame(requestID);
    playSound("bgm", "STGOP");
    bgm = false;
};