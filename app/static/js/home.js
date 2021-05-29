var stopped = true;
var s = document.getElementById("startStop");

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


document.querySelector("#init").addEventListener("click", init);