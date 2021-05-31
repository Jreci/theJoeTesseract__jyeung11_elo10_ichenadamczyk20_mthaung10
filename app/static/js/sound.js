//sound stuff (TESTED)
// don't mind these: soundQueue, loadSound(key, url), makeSoundSource(key), playSounds()
// run initializeSounds() on initialize, run playSound(key, state) to play a sound
//audio context is for playing music
var AudioContext;
var audioContext;
var soundQueue = {
    jump: "stop",
    walk: "stop",
    land: "stop",
    sounds: {
        jump: {
            url: "/static/sounds/jump.mp3",
            volume: 0.25
        },
        land: {
            url: "/static/sounds/land.mp3",
            volume: 0.25
        },
        walk: {
            url: "/static/sounds/walk.mp3",
            volume: 0.25
        },
        bgm: {
            url: "https://ia801905.us.archive.org/7/items/super-mario-64-soundtrack/Super%20Mario%2064%20%28Soundtrack%29/1-02%20Title%20Theme.mp3",
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
            if (soundQueue.sounds[key].source == null) continue;
            soundQueue.sounds[key].source.disconnect();
            soundQueue.sounds[key].source = null;
            soundQueue[key] = "stop";
            continue;
        }

        if (soundQueue.sounds[key].gain == undefined) {
            // console.log("sound not loaded yet LOL");
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
