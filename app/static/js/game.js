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

var floodTimer=-100;

//ALL X AND Y COORDINATES FOR CAMERA, PLAYER, AND OBBI ARE ON THE FIRST QUADRANT OF A NORMAL CARTESIAN PLANE.
//THE ONLY PLACES WHERE THE CANVAS COORDINATE SYSTEM IS USED IS WITH RECT METHODS, ETC.
function submitThis(form) {
    if (window.XMLHttpRequest) {
        //Firefox, Opera, IE7, and other browsers will use the native object
        var xhttp = new XMLHttpRequest();
    } else {
        //IE 5 and 6 will use the ActiveX control
        var xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open(form.method, form.action, true); //sends form to the form action by form method
    var data = new FormData(form); //gets the form's data
    xhttp.send(data); //sends the form's data
};
//player object
var Player = function(level) {
    //movement variables
    this.x = 400; //inital values of spawn (top left of the player)
    this.y = 40; //700 for next level
    this.dx = 0;
    this.dy = 0;
    this.maxSpeed = 3;
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
        //if (this.y > level.height) this.y = level.height; 

        //change velocity according to acceleration
        this.dy -= gravity;
    }

    //update speeds based on player inputs
    this.inputUpdate = function() {
        if (inputs.left) this.dx = -this.maxSpeed;
        if (inputs.right) this.dx = this.maxSpeed;
        if (!inputs.left && !inputs.right) this.dx = 0;
        if (inputs.up && !this.airborne) {
            playSound("jump", "once");
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
    this.x = x;//top left of obstacle
    this.y = y;
    this.width = width;
    this.height = height;
    this.cameraYOffset = 0; //this is the canvas coordinate
    //this.anchored = false;
    this.render = function () {
        this.cameraYOffset = Camera.y - this.y; //dist b/t camera and obbi
        if (intersect(this.y - this.height, this.y, Camera.y - CANVAS_HEIGHT, Camera.y)) {//if the obbi is in the range of the camera, render it
            ctx.fillStyle = "#000000";
            ctx.beginPath();

            var ptrn = ctx.createPattern(document.querySelector('#woodtexture'), 'repeat');
            ctx.fillStyle = ptrn;
            ctx.rect(this.x, Math.max(0, this.cameraYOffset), this.width, Math.min(this.height + Math.min(0, this.cameraYOffset), CANVAS_HEIGHT));
            //Math.max(0, this.cameraYOffset): if the top of the obbi is above the camera, truncate the y coordinate where the obbi starts so it fits
            //this.height + Math.min(0, this.cameraYOffset): if there was no truncation, then the height would be the full thing
            //                                               if there was truncation, shave off some of the height (cameraYOffset would be a negative # here)
            //Math.min(this.height + Math.min(0, this.cameraYOffset), CANVAS_HEIGHT)): if the total height ends up being too much, just make it the canvas height
            ctx.fill();
        }
    };

    //determines the direction that the platform is in from the player's perspective
    this.checkDirection = function(player) { //returns left, right, up, down, or ibbixyzzy
        if (intersect(player.y - 0.5 * player.height, player.y + 0.5 * player.height,
                this.y - this.height - 0.5 * player.height, this.y - 0.5 * player.height)) { //if the y ranges intersect
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
var Level = function(y) {
    // max size of world
    this.width = 800;
    this.height = 40;
    this.bottom = y;
    this.obbies = [
        new Obbi(0, 0, 800, 20),

    ];

    for (var i = 0; i < this.obbies.length; i++) {
        this.obbies[i].y += this.bottom;
    }

};

//level
var Level1 = function(y) {
    // max size of world
    this.width = 800;
    this.height = 900;
    this.bottom = y + 75;
    this.obbies = [
        new Obbi(0, 825, 20, 900),
        new Obbi(780, 825, 20, 900),

        //
        new Obbi(400, 0, 300,  20),
        new Obbi(680, 20,  20,  20),
        new Obbi(680, 400,  20, 300),
        new Obbi(680, 150,  60,  20),
        new Obbi(740, 300,  60,  20),
        new Obbi(400, 200, 300,  20),
        new Obbi(000, 350, 300,  20),
        new Obbi(275, 500, 525,  20),
        new Obbi(150, 650,  20, 200),
        new Obbi(350, 700,  20, 150),
        new Obbi(500, 700,  20, 200),
        new Obbi(680, 700,  20, 100),
        new Obbi(600, 600, 100,  20),
        new Obbi(000, 800, 700,  20),

    ];

    for (var i = 0; i < this.obbies.length; i++) {
        this.obbies[i].y += this.bottom;
    }

};

//level
var Level2 = function(y) {
    // max size of world
    this.width = 800;
    this.height = 875;
    this.bottom = y + 10;
    this.obbies = [
        new Obbi(0, 865, 20, 875),
        new Obbi(780, 865, 20, 875),

        //
        new Obbi(0, 0, 540,  20),
        new Obbi(240, 800, 20, 700),
        new Obbi(240, 800, 560, 20),
        new Obbi(520, 750, 20, 750),
        new Obbi(580, 0, 60, 20),
        new Obbi(540, 100, 150, 20),
        new Obbi(540, 230, 220, 20),
        new Obbi(540, 330, 20, 20),
        new Obbi(650, 630, 20, 100),
        new Obbi(650, 430, 20, 150),
        new Obbi(670, 550, 20, 20),
        
        new Obbi(260, 650, 180, 20),
        new Obbi(360, 300, 180, 20),

        new Obbi(120, 400, 20, 210),
        new Obbi(140, 248, 20, 20),
        new Obbi(140, 210, 20.1, 20),
        new Obbi(80, 100, 20, 20),
        new Obbi(0, 470, 140, 20),
        new Obbi(160, 470, 80, 20),
        new Obbi(40, 540, 20, 20),
        new Obbi(200, 680, 20, 20),

    ];

    for (var i = 0; i < this.obbies.length; i++) {
        this.obbies[i].y += this.bottom;
    }

};

var Level3 = function(y) {
    // max size of world
    this.width = 800;
    this.height = 1320;
    this.bottom = y;
    this.obbies = [
        new Obbi(0, 1320, 20, 1320),
        new Obbi(780, 1320, 20, 1320),
        new Obbi(0, 100, 600, 20),
        new Obbi(0, 200, 500, 20),
        new Obbi(0, 300, 400, 20),
        new Obbi(0, 400, 300, 20),
        new Obbi(0, 500, 200, 20),
        new Obbi(0, 600, 100, 20),
        new Obbi(200, 700, 600, 20),
        new Obbi(300, 800, 600, 20),
        new Obbi(400, 900, 600, 20),
        new Obbi(500, 1000, 600, 20),
        new Obbi(600, 1100, 600, 20),
        new Obbi(700, 1200, 600, 20),
        new Obbi(50, 1300, 100, 20),
        new Obbi(250, 1300, 100, 20),
        new Obbi(450, 1300, 100, 20),
        new Obbi(650, 1300, 100, 20),

        new Obbi(0, 0, 700, 1),
    ];

    for (var i = 0; i < this.obbies.length; i++) {
        this.obbies[i].y += this.bottom;
    }

};


var Level4 = function(y) {

    this.width=800;
    this.height=820;
    this.bottom=y;
    this.obbies = [
        new Obbi(0, 20, 750, 5),

        new Obbi(700, 60, 100, 20),
        new Obbi(500, 160, 100, 20),
        new Obbi(500, 260, 100, 20),
        new Obbi(500, 360, 100, 20),
        new Obbi(500, 460, 100, 20),

        new Obbi(480, 500, 20, 485),
        new Obbi(350, 500, 130, 20),

        new Obbi(100, 570, 20, 500),
        new Obbi(100, 70, 350, 10),
        new Obbi(350, 370, 20, 300),

        new Obbi(0, 120, 30, 10),
        new Obbi(0, 240, 30, 10),
        new Obbi(0, 360, 30, 10),
        new Obbi(0, 480, 30, 10),
        new Obbi(0, 600, 30, 10),

        new Obbi(50, 700, 700, 20),
        new Obbi(150, 770, 20, 70),
        new Obbi(250, 815, 20, 45),
        new Obbi(150, 770, 39, 10),
        new Obbi(210, 770, 40, 10),
        new Obbi(650, 770, 20, 70),

        new Obbi(0, 820, 750, 5),
        
    ];

    for (var i = 0; i < this.obbies.length; i++) {
        this.obbies[i].y += this.bottom;
    }
}

var Level5 = function(y) {

    this.width=800;
    this.height=1000;
    this.bottom=y;
    this.obbies = [
        new Obbi(0, 1000, 20, 1000),
        new Obbi(780, 1000, 20, 1000),

        new Obbi(0, 0, 500, 20),

        new Obbi(0, 100, 100, 1),
        new Obbi(0, 150, 100, 1),
        new Obbi(0, 200, 100, 1),
        new Obbi(0, 250, 100, 1),
        new Obbi(0, 300, 100, 1),
        new Obbi(0, 350, 100, 1),
        new Obbi(0, 400, 100, 1),
        new Obbi(0, 450, 100, 1),
        new Obbi(0, 500, 100, 1),
        new Obbi(0, 550, 100, 1),
        new Obbi(0, 600, 100, 1),
        new Obbi(0, 650, 100, 1),
        new Obbi(0, 700, 100, 1),
        new Obbi(0, 750, 100, 1),
        new Obbi(0, 800, 100, 1),
        new Obbi(0, 850, 100, 1),
        new Obbi(0, 900, 100, 1),
        new Obbi(0, 950, 100, 1),

        new Obbi(100, 1000, 100, 100),
        new Obbi(100, 850, 100, 750),
     
        new Obbi(200, 800, 10, 1),
        new Obbi(200, 700, 10, 1),
        new Obbi(200, 600, 10, 1),
        new Obbi(200, 500, 10, 1),
        new Obbi(200, 400, 10, 1),
        new Obbi(200, 300, 10, 1),

        new Obbi(220, 750, 10, 1),
        new Obbi(220, 650, 10, 1),
        new Obbi(220, 550, 10, 1),
        new Obbi(220, 450, 10, 1),
        new Obbi(220, 350, 10, 1),
        new Obbi(220, 250, 10, 1),

        new Obbi(230, 1000, 20, 800),
        new Obbi(100, 100, 700, 20),

        new Obbi(250, 100, 550, 1),
        new Obbi(250, 200, 550, 1),
        new Obbi(250, 300, 550, 1),
        new Obbi(250, 400, 550, 1),
        new Obbi(250, 500, 550, 1),
        new Obbi(250, 600, 550, 1),
        new Obbi(250, 700, 550, 1),
        new Obbi(250, 800, 550, 1),
        new Obbi(250, 900, 550, 1),

        new Obbi(500, 1000, 1, 800),

        new Obbi(0, 1000, 750, 5),



        
    ];

    for (var i = 0; i < this.obbies.length; i++) {
        this.obbies[i].y += this.bottom;
    }
}

var LevelStart = function(y) {
    // max size of world
    this.width = 800;
    this.height = 650;
    this.bottom = y;
    this.obbies = [
        new Obbi(0, 650, 20, 650),
        new Obbi(780, 650, 20, 650),
        new Obbi(180, 100, 200, 20),
        new Obbi(480, 200, 200, 20),
        new Obbi(180, 300, 200, 20),
        new Obbi(480, 400, 200, 20),
        new Obbi(180, 500, 200, 20),
        new Obbi(480, 600, 200, 20),

    ];

    for (var i = 0; i < this.obbies.length; i++) {
        this.obbies[i].y += this.bottom;
    }

};

function intersect(p1, p2, q1, q2) {
    var [a, b] = [Math.max(p1, q1), Math.min(p2, q2)];
    if (a < b) return true;
    return false;
}

var first = true;
function generateTiles(y) {
    // randomly generate a level and return
    if (first) {
        first = false;
        return new LevelStart(y);
    }
    //return new Level4(y);
    return random([new Level5(y), new Level4(y), new Level3(y), new Level2(y), new Level1(y)]);
}

function random(list) {
    return list[Math.trunc(Math.random() * list.length)];
}

var elapsed;
var fpsInterval;
var thenFPS;

function init() {
    AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    initializeSounds();
    level = new Level(0);
    player = new Player(level);
    floodTimer=-100;
    fpsInterval = 1000 / 60;
    thenFPS = Date.now();

}

var bgm = false;
var tileHeight = 0;
var tileHeights = [];
var levels = [new Level(0)];
var eheheheh = -1;
var showThing = false;
var tilesCleared = 0;
var textThing = "";

function render() {
    window.cancelAnimationFrame(requestID);
    var now = Date.now();
    elapsed = now - thenFPS;
    //console.log(elapsed);
    if (elapsed < fpsInterval) {
        requestID = window.requestAnimationFrame(render);
        return;
    }
    thenFPS = now - (elapsed % fpsInterval);
    if (!bgm) {
        playSound("bgm", "loop");
        bgm = true;
    }
    // clear canvas
    /*ctx.fillStyle = canvasFillColor;
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fill();*/
    ctx.drawImage(document.querySelector("#forestbg"), 0, 0, 800, 800);

    // update player state through inputs
    player.inputUpdate();


    if (tileHeight < player.y + CANVAS_HEIGHT * 2) {
        levels.push(generateTiles(tileHeight));
        tileHeight += levels[levels.length - 1].height;
        tileHeights.push(tileHeight);
    }

    if (player.y > tileHeights[0]) {
        tileHeights.splice(0, 1);
        eheheheh = 0;
        playSound("level", "once");
        tilesCleared++;
        if (tilesCleared % 3 == 0) {
            loadThing();
            textThing = loadOtherThing(ctx);
            showThing = true;
            playSound("bark", "once");
        } else {
            showThing = false;
        }
    }

    if (eheheheh >= 0) {
        if (eheheheh % 60 <= 30 && eheheheh <= 180) {
            ctx.drawImage(document.querySelector("#amazing"), 0 + 100 * (eheheheh % 2 * 0.5), 0 + eheheheh * 2, 800, 300);
        }
        eheheheh += 1;
        if (eheheheh >= 300) {
            eheheheh = -1;
        }
    }

    // move the player
        // check for collisions through the path
            // if so, deflect the path of the player using projections
            // if the player's startpoint endpoint is in the object, do something to get the player unstuck
    for (var i = 0; i < levels.length; i++)
        for (var j = 0; j < levels[i].obbies.length; j++)
            player.updateCollision(levels[i].obbies[j]); 
     //loop through onCameraObbies eventually
    player.move();
    
    // update the camera
    Camera.follow(player);

    // render the player and obstacles
    player.render();
    for (var i = 0; i < levels.length; i++)
        for (var j = 0; j < levels[i].obbies.length; j++)
           levels[i].obbies[j].render();
    // play the sounds
    playSounds();

    for (var i = 0; i < levels.length;) {
        if (levels[i].bottom + levels[i].height < - (floodTimer-(player.y-CANVAS_HEIGHT/2)) - CANVAS_HEIGHT) {
            levels.splice(i, 1);
            //console.log("unloaded");
        }
        else i++;
    }
    
    if (floodTimer > player.y-CANVAS_HEIGHT/2) { //if flood reaches screen
        //"water"
        /*ctx.beginPath();
        ctx.fillStyle="#ADD8E6";
        ctx.fillRect(0, CANVAS_HEIGHT-(floodTimer-(player.y-CANVAS_HEIGHT/2)), CANVAS_WIDTH, CANVAS_HEIGHT-(floodTimer-(player.y-CANVAS_HEIGHT/2)));
        ctx.stroke();*/
        ctx.drawImage(document.querySelector("#flood"), 0, CANVAS_HEIGHT-(floodTimer-(player.y-CANVAS_HEIGHT/2)), CANVAS_WIDTH, CANVAS_WIDTH);

        //top of water
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT-(floodTimer-(player.y-CANVAS_HEIGHT/2)));
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT-(floodTimer-(player.y-CANVAS_HEIGHT/2)));
        ctx.lineWidth=5;
        ctx.strokeStyle="#0000FF";
        ctx.stroke();
    }
    

    floodTimer+=0.7;//flood rising rate 0.7

    requestID = window.requestAnimationFrame(render);
    if (player.y <= floodTimer) {//if player drowns
        var img = document.getElementById("gameover");
        ctx.drawImage(img, 0, 0);

        posY=Math.trunc(player.y); //record player y pos before resetting

        document.getElementById("startStop").click();
        stopped=true;
        document.getElementById("init").click();
        document.getElementById("startStop").disabled = true;
        document.getElementById("init").disabled = false;
        floodTimer = -100000000; //set flood below player so form is submitted only once
        
        document.getElementById("playerScore").value=posY;
        //console.log(document.getElementById("playerScore"));
        //submitThis(document.getElementById("submitScore"));
        document.getElementById("submitScore").submit();
    }

    //console.log("floodTimer= "+floodTimer);
    //console.log("player y = "+player.y);
    //console.log(stopped);
    document.getElementById("runningScore").innerHTML = "Current score: " + Math.trunc(player.y);
    if (eheheheh >= 0 && showThing) {
        ctx.drawImage(document.querySelector("#otherThing"), 0, 600, 200, 200);
        ctx.fillStyle="#FF0000";
        ctx.textAlign = "start";
        ctx.font = "italic bold 20px Impact";
        for (var i = 0; i < textThing.length; i++) {
            ctx.fillText(textThing[i], 200, 630 + 30 * i);
        }
    }
};

function stopRender() {
    playSound("bgm", "STGOP");
    if (Math.random() < 0.99) playSounds(); // trash easter egg
    window.cancelAnimationFrame(requestID);
    bgm = false;
};