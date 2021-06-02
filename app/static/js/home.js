var stopped = true;
var s = document.getElementById("startStop"); 
var i = document.getElementById("init");
var min = document.getElementById("minutes");
var sec = document.getElementById("seconds");

// toggle between start and stop buttons
var toggle = function () {
    if (stopped == false) {
        stopped = true;
		s.innerHTML = "Start";
        stopRender();
    }
    else{
        stopped = false;
		s.innerHTML = "Stop";
        render();
    }
}

s.addEventListener("click", toggle);

// stop button is disabled until the initialize button is pressed
var enableStart = function() { 
	s.disabled = false;
}

i.addEventListener("click", enableStart); 

//timer for start/stop buttons

document.querySelector("#init").addEventListener("click", init);

