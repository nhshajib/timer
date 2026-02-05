/* eslint-disable no-restricted-globals */
// Web Worker for Stopwatch Metronome
let intervalId = null;

self.onmessage = (e) => {
    if (e.data === 'START') {
        if (intervalId) clearInterval(intervalId);
        // 100ms precision as requested for stopwatch
        intervalId = setInterval(() => {
            self.postMessage('TICK');
        }, 100);
    }
    else if (e.data === 'STOP') {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
    }
};
