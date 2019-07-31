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
        <div>
            <apexchart width="1000" height="500" type="line" :options="chart_options" :series="series"></apexchart>
        </div>
        <!-- <Dropdown /> -->
    </body>
</div>
</template>

<!-- Audiolet -->
<script src="../../../Audiolet/src/audiolet/Audiolet.js"></script>

<!-- Noise library -->
<script src="../../js/noise.js"></script>

<script>
import Vue from 'vue'
import VueApexCharts from 'vue-apexcharts'
import Noise from '../../js/noise.js'
//import Dropdown from "./dropdown";
import Vuetify from 'vuetify';

Vue.use(Vuetify);

var apexchart = Vue.component('apexchart', VueApexCharts)
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
        let refFreqIndex = 14
        let testFreqIndex = 16
        return {
            title: 'Equal Loudness Contour Estimation',
            abstract: 'A simple program to estimate your individual Equal Loudness Contour.',
            is_playing_noise: false,
            is_test_noise: true,
            frequencies: frequencies,
            frequenciesLength: frequencies.length,
            dataLeft: dataLeft,
            dataRight: dataRight,
            refFreqIndex: refFreqIndex,
            testFreqIndex: testFreqIndex,
            graph_width: 200,
/*             menu_config: {
                options: [
                {
                    value: "Import data"
                },
                {
                    value: "Export data"
                }
                ],
                placeholder: "Menu",
                backgroundColor: "#cde4f5",
                textColor: "black",
                borderRadius: "1.5em",
                border: "1px solid gray",
                width: 180,
            }, */
            chart_options: {
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
                    min: -20,
                    max: 10,
                },
                markers: {
                    size: 3,
                    colors: undefined,
                    strokeColors: '#fff',
                    strokeWidth: 2,
                    strokeOpacity: 0.9,
                    fillOpacity: 1,
                    discrete: [],
                    shape: "circle",
                    radius: 2,
                    offsetX: 0,
                    offsetY: 0,
                    onClick: undefined,
                    onDblClick: undefined,
                    hover: {
                    size: undefined,
                    sizeOffset: 3
                    }
                },
                legend: {
                    position: 'top',
                },
                stroke: {
                    curve: 'smooth'
                },
                grid: {
                    borderColor: '#e7e7e7',
                    row: {
                        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                        opacity: 0.5
                    },
                },
                annotations: {
                    xaxis: [
                    {
                        // in a datetime series, the x value should be a timestamp, just like it is generated below
                        x: refFreqIndex+1,
                        strokeDashArray: 0,
                        borderColor: "orange",
                        label: {
                            borderColor: "orange",
                            style: {
                                color: "black",
                                background: "orange"
                            },
                            orientation: "horizontal",
                            position: 'top',
                            offsetY: -5,
                            text: "Ref."
                        },
                    },
                    {
                        // in a datetime series, the x value should be a timestamp, just like it is generated below
                        x: testFreqIndex+1,
                        strokeDashArray: 0,
                        borderColor: "#775DD0",
                        label: {
                            borderColor: "#775DD0",
                            style: {
                                color: "#fff",
                                background: "#775DD0"
                            },
                            orientation: "horizontal",
                            position: 'top',
                            offsetY: 15,
                            text: "Test"
                        }
                    }
                    ],
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
            }],
        }
    },
    methods: {
        play() {
            this.is_playing_noise = true
            this.is_test_noise = !this.is_test_noise
            this.playNoise()

            if(audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        },
        incFreq() {
            this.testFreqIndex += 1;
            if (this.testFreqIndex >= this.frequenciesLength) {
                this.testFreqIndex = 0;
            }
            if (this.is_playing_noise) {
                this.is_test_noise = true
                this.playNoise();
            }

            this.chart_options.annotations.xaxis[1].x = this.testFreqIndex+1
            this.series[0].trigger += 1 // to trigger an update of the apexchart
        },
        decFreq() {
            this.testFreqIndex -= 1;
            if (this.testFreqIndex < 0) {
                this.testFreqIndex = this.frequenciesLength - 1;
            }
            if (this.is_playing_noise) {
                this.is_test_noise = true
                this.playNoise();
            }

            this.chart_options.annotations.xaxis[1].x = this.testFreqIndex+1
            this.series[0].trigger += 1 // to trigger an update of the apexchart
        },
        incGain(canal, value) {
            this.series[canal].data[this.freqIndex] += value
        },
        incGainLeft(value) {
            this.incGain(0, value)
            this.series[0].trigger += 1 // to trigger an update of the apexchart
            this.playNoise();
        },
        incGainRight(value) {
            this.incGain(1, value)
            this.series[1].trigger += 1 // to trigger an update of the apexchart
            this.playNoise();
        },
        playNoise() {
            this.is_playing_noise = true

            biquadFilter.frequency.setValueAtTime(this.frequencies[this.freqIndex], audioCtx.currentTime);
            gainNodeLeft.gain.setValueAtTime(this.gainLeft, audioCtx.currentTime);
            gainNodeRight.gain.setValueAtTime(this.gainRight, audioCtx.currentTime);
        }
    },
    computed: {
        freqIndex() {
            if (this.is_test_noise) {
                return this.testFreqIndex
            }
            else {
                return this.refFreqIndex
            }
        },
        gainLeft() {
            this.series[0].trigger // to force recomputing when this.series[0].trigger changes
            return Math.pow(10.0, (this.dataLeft[this.freqIndex])/20.0)
        },
        gainRight() {
            this.series[1].trigger // to force recomputing when this.series[0].trigger changes
            return Math.pow(10.0, (this.dataRight[this.freqIndex])/20.0)
        }
    },
}
</script>