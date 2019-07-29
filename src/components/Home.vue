<template>
<div>
    <header id="demo-header">
        <h1>{{title}}</h1>
        <section id="abstract">
            <p>{{abstract}}</p>
        </section>
        <ul class="actions">
            <li id="play">
                <button v-on:click="play">
                    <div v-if="is_test_noise">Play ref. noise</div>
                    <div v-else>Play test noise</div>
                </button>
            </li>
            <li id="inc_freq">
                <button @click="incFreq" class="button special">&#9654; Increase freq.</button>
            </li>
            <li id="dec_freq">
                <button @click="decFreq" class="button special">&#9654; Decrease freq.</button>
            </li>
            <li id="inc_gain">
                <button @click="incGain" class="button special" disabled="true">&#9654; Increase gain</button>
            </li>
            <li id="dec_gain">
                <button @click="decGain" class="button special" disabled="true">&#9654; Decrease gain</button>
            </li>
        </ul>
    </header>

    <body>
        <div class="holder">
            <ul class="icons">
                <li v-for="(data, index) in frequencies" :key='index'>
                    <span v-if="(index == testFreqIndex && is_test_noise) || (index == refFreqIndex && !is_test_noise)">(</span>
                    <span v-if="index == testFreqIndex || index == refFreqIndex"><b>{{data}}</b></span>
                    <span v-else>{{data}}</span>
                    <span v-if="(index == testFreqIndex && is_test_noise) || (index == refFreqIndex && !is_test_noise)">)</span>
                </li>
            </ul>
        </div>
        <div>
            <apexchart width="1000" height="500" type="line" :options="options" :series="series"></apexchart>
        </div>
    </body>
</div>
</template>

<!-- Development -->
<script src="../../../Audiolet/src/audiolet/Audiolet.js"></script>

<!-- Common 
<script src="js/filter.js"></script> -->

<!-- Noise library -->
<script src="../../js/noise.js"></script>

<script>
import Vue from 'vue'
import VueApexCharts from 'vue-apexcharts'
import Noise from '../../js/noise.js'

Vue.component('apexchart', VueApexCharts)

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

//set up the different audio nodes we will use for the app
var noiseLeft = audioCtx.createPinkNoise();
var noiseRight = audioCtx.createPinkNoise();
var merger = audioCtx.createChannelMerger(2);
var gainNode = audioCtx.createGain(0);
var biquadFilter = audioCtx.createBiquadFilter("bandpass", 0, 1.0);

// connect the nodes together
noiseLeft.connect(merger, 0, 0);
noiseRight.connect(merger, 0, 1);
merger.connect(gainNode);
gainNode.connect(biquadFilter);
biquadFilter.connect(audioCtx.destination);

// Manipulate the Biquad filter
biquadFilter.Q.setValueAtTime(20, audioCtx.currentTime);

export default {
    name: "Home",
    data() {
        return {
            title: 'Equal Loudness Contour Estimation',
            abstract: 'A simple program to estimate your individual Equal Loudness Contour.',
            frequencies: [20, 25, 31, 40, 50, 63, 80, 100, 125, 160, 200, 250, 310, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3100, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000],
            is_playing_noise: false,
            is_test_noise: true,
            refFreqIndex: 14,
            testFreqIndex: 14,
            options: {
                chart: {
                    id: 'vuechart-example'
                },
                xaxis: {
                    title: {
                        text: "Frequency (Hz)"
                    },
                    categories: [20, 25, 31, 40, 50, 63, 80, 100, 125, 160, 200, 250, 310, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3100, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000],
                    name: 'Hz'
                },
                yaxis: {
                    title: {
                        text: "Amplitude (dB)"
                    },
                },
            },
            series: [{
                name: 'left',
                data: [0, 0, 0, -1, -2, 3, 1, 2, 2, 2, 1, -2, -4, -7, -8, -7, -8, -10, -8, -3, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0]
            }, {
                name: 'right',
                data: [0, 0, 1, 0, -1, 2, 2, 2, 2, 2, 1, -2, -4, -5, -5, -4, -3, -6, -5, -3, 1, 1, 3, -1, 0, 0, 0, 0, 0, 0, 0]
            }]
        }
    },

    methods: {
        play() {
            if (this.is_test_noise) {
                this.playRefNoise();
            }
            else {
                this.playTestNoise();
            }

            if(audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        },
        incFreq() {
            this.testFreqIndex += 1;
            if (this.testFreqIndex >= this.frequencies.length) this.testFreqIndex = 0;
            this.updateTestNoiseFreq();
        },
        decFreq() {
            this.testFreqIndex -= 1;
            if (this.testFreqIndex < 0) this.testFreqIndex = this.frequencies.length - 1;
            this.updateTestNoiseFreq();
        },
        incGain() {
            this.series[0].data[this.testFreqIndex] += 1.0
            // console.log("new value:"+this.series[0].data[this.testFreqIndex])
        },
        decGain() {
            this.series[0].data[this.testFreqIndex] -= 1.0
        },
        playTestNoise() {
            //console.log('Test noise')
            biquadFilter.frequency.setValueAtTime(this.frequencies[this.testFreqIndex], audioCtx.currentTime);
            gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
            this.is_playing_noise = true
            this.is_test_noise = true;
        },
        playRefNoise() {
            //console.log('Ref noise')
            biquadFilter.frequency.setValueAtTime(this.frequencies[this.refFreqIndex], audioCtx.currentTime);
            gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
            this.is_playing_noise = true
            this.is_test_noise = false;
        },
        updateTestNoiseFreq() {
            if(this.is_playing_noise) {
                this.playTestNoise()
            }
        }
    }
}
</script>