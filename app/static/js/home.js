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
		//reset();
        i.disabled = false;
    }
    else {
        stopped = false;
		s.innerHTML = "Stop";
        render();
		//timer();
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

//timer goes here


document.querySelector("#init").addEventListener("click", init);

