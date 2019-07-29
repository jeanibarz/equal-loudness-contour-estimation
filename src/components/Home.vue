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
                <button @click="incGainLeft(1.0); incGainRight(1.0)" class="button special">&#9654; Increase gain</button>
            </li>
            <li id="dec_gain">
                <button @click="incGainLeft(-1.0); incGainRight(-1.0)" class="button special">&#9654; Decrease gain</button>
            </li>
            <li id="bal_left">
                <button @click="incGainLeft(0.5); incGainRight(-0.5)" class="button special">&#9654; Balance left</button>
            </li>
            <li id="bal_right">
                <button @click="incGainLeft(-0.5); incGainRight(0.5)" class="button special">&#9654; Balance right</button>
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
var gainNodeLeft = audioCtx.createGain(0);
var gainNodeRight = audioCtx.createGain(0);
var biquadFilter = audioCtx.createBiquadFilter("bandpass", 0, 1.0);

// connect the nodes together
noiseLeft.connect(gainNodeLeft);
noiseRight.connect(gainNodeRight);
gainNodeLeft.connect(merger, 0, 0);
gainNodeRight.connect(merger, 0, 1);
merger.connect(biquadFilter);
biquadFilter.connect(audioCtx.destination);

// Manipulate the Biquad filter
biquadFilter.Q.setValueAtTime(20, audioCtx.currentTime);

export default {
    name: "Home",
    data() {
        let frequencies = [20, 25, 31, 40, 50, 63, 80, 100, 125, 160, 200, 250, 310, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3100, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000]
        let dataLeft = [0, 0, 0, -1, -2, 3, 1, 2, 2, 2, 1, -2, -4, -7, -8, -7, -8, -10, -8, -3, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0]
        let dataRight = [0, 0, 1, 0, -1, 2, 2, 2, 2, 2, 1, -2, -4, -5, -5, -4, -3, -6, -5, -3, 1, 1, 3, -1, 0, 0, 0, 0, 0, 0, 0]
        return {
            title: 'Equal Loudness Contour Estimation',
            abstract: 'A simple program to estimate your individual Equal Loudness Contour.',
            is_playing_noise: false,
            is_test_noise: true,
            frequencies: frequencies,
            frequenciesLength: frequencies.length,
            dataLeft: dataLeft,
            dataRight: dataRight,
            refFreqIndex: 14,
            testFreqIndex: 16,
            graph_width: 200,
            options: {
                chart: {
                    id: 'vuechart-example'
                },
                xaxis: {
                    title: {
                        text: "Frequency (Hz)"
                    },
                    categories: frequencies,
                    name: 'Hz',
                },
                yaxis: {
                    title: {
                        text: "Amplitude (dB)"
                    },
                    min: -50,
                    max: 0,
                },
                legend: {
                    position: 'top',
                },
                trigger: 0,
            },
            series: [{
                name: 'left',
                data: dataLeft,
                trigger: 0,
            }, {
                name: 'right',
                data: dataRight,
                trigger: 0,
            }]
        }
    },
    methods: {
        play() {
            this.is_playing_noise = true

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
            if (this.testFreqIndex >= this.frequenciesLength) this.testFreqIndex = 0;
            if (this.is_playing_noise) {
                this.playTestNoise();
            }
        },
        decFreq() {
            this.testFreqIndex -= 1;
            if (this.testFreqIndex < 0) this.testFreqIndex = this.frequenciesLength - 1;
            if (this.is_playing_noise) {
                this.playTestNoise();
            }
        },
        incGain(canal, value) {
            var freqIndex
            if (this.is_test_noise) {
                freqIndex = this.testFreqIndex
            }
            else {
                freqIndex = this.refFreqIndex
            }
            this.series[canal].data[freqIndex] += value
        },
        incGainLeft(value) {
            this.incGain(0, value)
            this.series[0].trigger += 1
            this.updateNoise();
        },
        incGainRight(value) {
            this.incGain(1, value)
            this.series[1].trigger += 1
            this.updateNoise();
        },
        playTestNoise() {
            this.is_test_noise = true;

            biquadFilter.frequency.setValueAtTime(this.frequencies[this.testFreqIndex], audioCtx.currentTime);
            gainNodeLeft.gain.setValueAtTime(this.gainLeft, audioCtx.currentTime);
            gainNodeRight.gain.setValueAtTime(this.gainRight, audioCtx.currentTime);
        },
        playRefNoise() {
            this.is_test_noise = false;

            biquadFilter.frequency.setValueAtTime(this.frequencies[this.refFreqIndex], audioCtx.currentTime);
            gainNodeLeft.gain.setValueAtTime(this.gainLeft, audioCtx.currentTime);
            gainNodeRight.gain.setValueAtTime(this.gainRight, audioCtx.currentTime);
        },
        updateNoise() {
            if (this.is_playing_noise) {
                if (this.is_test_noise) {
                    this.playTestNoise()
                }
                else {
                    this.playRefNoise()
                }
            }
        },
    },
    computed: {
        freqIndex() {
            if (this.is_test_noise) {
                return this.testFreqIndex }
            else {
                return this.refFreqIndex }
        },
        gainLeft() {
            this.series[0].trigger
            return Math.pow(10.0, (this.dataLeft[this.freqIndex])/20.0)
        },
        gainRight() {
            this.series[1].trigger
            return Math.pow(10.0, (this.dataRight[this.freqIndex])/20.0)
        },
        playingFreq() {
            if (is_playing_noise) {
                if (is_test_noise) {
                    return this.frequencies[this.testFreqIndex]
                }
                else {
                    return this.frequencies[this.refFreqIndex]
                }
            }
            else {
                return -1
            }
        },
    },
    mounted() {
        console.log('mounted')
        this.options.xaxis.labels = {
            formatter: function(value) {
                if (value == playingFreq) {
                    return '<<< ' + value + '>>>'
                }
                else {
                    return value + 'Hz'
                }
            }
        }
        this.options.trigger += 1
    }
}
</script>