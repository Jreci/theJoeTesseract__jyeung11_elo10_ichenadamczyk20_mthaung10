var c = document.getElementById("slate");
var ctx = c.getContext("2d");
const CANVAS_HEIGHT = ctx.canvas.height;
const CANVAS_WIDTH = ctx.canvas.width;
var requestID = 0;
var state = "not started";
var gravity = 0.6;
var friction = 0.7;
var airResistance = 0.1;

var Player = function() {
    this.spawn = [200, 200];
    this.x = 200;
    this.y = 200;
    this.dx = 0;
    this.dy = 0;
    this.maxSpeed = 5;
    this.jump = true;
    this.width = 20;
    this.height = 20;
    this.render = function() {
        ctx.fillStyle = "#F08080";
        ctx.fillRect((player.x)-20, (player.y)-20, player.width, player.height);
    };
};

var Obbi = function() {

};

var inputs = {
    left: false,
    right: false,
    up: false,
};
var obbies = [];

function render() {
    window.cancelAnimationFrame(requestID);
    ctx.fillStyle = "blue";
    ctx.fillRect(50,50,100,200);
    ctx.fill();
    requestID = window.requestAnimationFrame(step); 
};

function stopRender() {
    window.cancelAnimationFrame(requestID);
};

// Adding the event listeners
document.addEventListener("keydown",keydown);
document.addEventListener("keyup",keyup);
setInterval(loop,22);
//////////////////////////////////