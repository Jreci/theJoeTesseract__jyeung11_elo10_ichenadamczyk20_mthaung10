var stopped = true;
var timerOn = false;
var time = 0;
var s = document.getElementById("startStop"); 
var i = document.getElementById("init");

// toggle between start and stop buttons, initially 'start'
var toggle = function() {
    if (stopped == false) {
        stopped = true;
		s.innerHTML = "Start";
        stopRender();
		reset();
        i.disabled = false;
    }
    else {
        stopped = false;
		s.innerHTML = "Stop";
        render();
		timer();
        i.disabled = true;
    }
}

s.addEventListener("click", toggle);

// stop button is disabled until the initialize button is pressed
var enableStart = function() { 
	s.disabled = false;
}

var toggleInit = function() {
    i.disabled = true;
}

i.addEventListener("click", enableStart); 
i.addEventListener("click", toggleInit);

//timerOn initially false, when start button is clicked timerOn changes to true and all the other time fxns are called
var timer = function() {
	if (timerOn == false) {
		timerOn = true;
		runTimer();
	}
	else {
		timerOn = false;
	}
}

//is the actual main timer running function
var runTimer = function() {
	if (timerOn) {
		var timerID = setInterval(incTimer, 100);
	}
}

//increment timer
var incTimer = function() {
	time++; 
	var min = Math.floor(time/600);
	var sec = Math.floor(time/10 % 60);
	var milli = time % 10;

	//if less than 10, will add a 0 in front: ie. instead of 9, it will be 09
	if (min < 10) {
		min = "0" + min; 
	}
	if (sec < 10) {
		sec = "0" + sec;
	}
	//only every ten millisec shows ;-;
	if (milli < 10) {
		milli = milli + "0";
	}

	document.getElementById("timer").innerHTML = min + ":" + sec + ":" + milli;
}

//IT RESETS THE TIMER TO 00:00:00 BUT IT DOESN'T WANNA STOP AHHHHHH
var reset = function() {
	timerOn = false;
	time = 0;
	document.getElementById("timer").innerHTML = "00:00:00";
	clearInterval(timerID); //ik this line is prob wrong but wot i needa change : (
}

s.addEventListener("click", timer);
s.addEventListener("click", reset);


document.querySelector("#init").addEventListener("click", init);

