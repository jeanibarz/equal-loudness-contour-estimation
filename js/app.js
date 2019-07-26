var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

frequencies = [20, 25, 31, 40, 50, 63, 80, 100, 125, 160, 200, 250, 310, 400,
500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3100, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000];
refFreqIndex = 14
testFreqIndex = 14

//set up the different audio nodes we will use for the app
var noiseLeft = audioCtx.createPinkNoise();
var noiseRight = audioCtx.createPinkNoise();
var merger = audioCtx.createChannelMerger(2);
var gainNode = audioCtx.createGain();
var biquadFilter = audioCtx.createBiquadFilter("bandpass", frequencies[refFreqIndex], 1.0);

// connect the nodes together
noiseLeft.connect(merger, 0, 0);
noiseRight.connect(merger, 0, 1);
merger.connect(gainNode);
gainNode.connect(biquadFilter);
biquadFilter.connect(audioCtx.destination);

// Manipulate the Biquad filter
biquadFilter.Q.setValueAtTime(20, audioCtx.currentTime);

let ref_noise = false

var playButton = document.getElementById('playButton');
var refTestFreqs = document.getElementById('refTestFreqs');
refTestFreqs.innerText = 'Ref/test: ' + frequencies[refFreqIndex] + "/" + frequencies[testFreqIndex];

function play() {
    if (ref_noise) {
        playTestNoise();
    }
    else {
        playRefNoise();
    }

    if(audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
};

function incFreq() {
    testFreqIndex += 1;
    if (testFreqIndex >= frequencies.length) testFreqIndex = 0;
    updateTestNoiseFreq();
};

function decFreq() {
    testFreqIndex -= 1;
    if (testFreqIndex < 0) testFreqIndex = frequencies.length - 1;
    updateTestNoiseFreq();
};

function playTestNoise() {
    biquadFilter.frequency.setValueAtTime(frequencies[testFreqIndex], audioCtx.currentTime);
    gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
    playButton.innerText = "Play test noise"
    ref_noise = false;
}

function playRefNoise() {
    biquadFilter.frequency.setValueAtTime(frequencies[refFreqIndex], audioCtx.currentTime);
    gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
    playButton.innerText = "Play reference noise"
    ref_noise = true;
}

function updateTestNoiseFreq() {
    // switch to test noise and update the bandpass frequency
    refTestFreqs.innerText = 'Ref/test: ' + frequencies[refFreqIndex] + "/" + frequencies[testFreqIndex];
    playTestNoise();
};