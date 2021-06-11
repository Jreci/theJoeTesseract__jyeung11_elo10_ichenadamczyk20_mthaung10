var stopped = true;
var timerOn = false;
var time = 0;
var s = document.getElementById("startStop"); 
var i = document.getElementById("init");

//timer goes here
let startTime;
let timePassed = 0;
let timerID = -1;

//formatting the timer mm:ss:ms
var formatter = function(time) {
    let hours = time / 3600000;
    let hh = Math.floor(hours);
    
    let mins = (hours - hh) * 60;
    let mm = Math.floor(mins);
    
    let secs = (mins - mm) * 60;
    let ss = Math.floor(secs);
    
    let milli = (secs - ss) * 100;
    let ms = Math.floor(milli);
    
    let minutes = mm.toString().padStart(2, "0"); //padstart: if a unit of time does not have a length of 2 (i.e. mm = 9), will add a 0 to make length 2 (09 instead of 9)
    let seconds = ss.toString().padStart(2, "0");
    let milliseconds = ms.toString().padStart(2, "0");
    
    return `${minutes}:${seconds}:${milliseconds}`;
}

//start timer with start button
var running = function() {
    startTime = Date.now() - timePassed;
    timerID = setInterval(function output() {
        timePassed = Date.now() - startTime;
        document.getElementById("timer").innerHTML = formatter(timePassed); //change the display of the mm:ss:ms to the actual stopwatch time
    }, 10);
    console.log(timerID)
}

//pause timer with stop button
var pause = function() {
    clearInterval(timerID);
    console.log("paused);")
}

//reset timer with initialize button
var reset = function() {
    clearInterval(timerID);
    timePassed = 0;
    document.getElementById("timer").innerHTML = "00:00:00";
}

// toggle between start and stop buttons, initially 'start'
var toggle = function() {
    if (stopped == false) {
        stopped = true;
		s.innerHTML = "Start";
        stopRender();
        pause();
		//reset();
        i.disabled = false;
    }
    else {
        running();
        stopped = false;
		s.innerHTML = "Stop";
        render();
		//timer();
        i.disabled = true;
    }
}

s.addEventListener("click", toggle);

// stop button is disabled until the initialize button is pressed
var toggleInit = function() { 
	s.disabled = false;
    i.disabled = true;
    reset();
}

i.addEventListener("click", toggleInit); 

document.querySelector("#init").addEventListener("click", init);

