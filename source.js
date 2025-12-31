/**
 * FALLOUT RADIO TERMINAL SCRIPT
 * ------------------------------------------------------------------
 * Handles audio streaming, visualizer rendering, and UI interactions.
 * Inspired by RobCo Industries Termlink Protocol.
 */

// --- CONFIGURATION ---
const STATIONS = [
    { name: "SomaFM: Groove Salad", url: "https://ice1.somafm.com/groovesalad-128-mp3" },
    { name: "SomaFM: Deep Space One", url: "https://ice1.somafm.com/deepspaceone-128-mp3" },
    { name: "SomaFM: Secret Agent", url: "https://ice1.somafm.com/secretagent-128-mp3" },
    { name: "SomaFM: Drone Zone", url: "https://ice1.somafm.com/dronezone-128-mp3" },
    { name: "Nightwave Plaza", url: "https://radio.plaza.one/mp3" },
    { name: "Radio Fallout (Placeholder)", url: "https://ice1.somafm.com/defcon-128-mp3" } // Placeholder for custom stream
];
// STATIONS_DATA is expected to be loaded from stations.js

// --- STATE MANAGEMENT ---
let audioCtx;
let audioSource;
let analyser;
let audioPlayer;
let hls; // HLS instance
let isPlaying = false;
let currentStationIdx = 0;
let animationId;
let currentStationList = []; // Track filtered list

// --- DOM ELEMENTS ---
const powerBtn = document.getElementById('power-btn');
const volumeSlider = document.getElementById('volume');
const stationListEl = document.getElementById('station-list');
const searchInput = document.getElementById('search-input');
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');
const statusSignal = document.getElementById('signal-status');
const statusStation = document.getElementById('current-station');
const clockEl = document.getElementById('clock');

// --- INITIALIZATION ---
function init() {
    // Use STATIONS_DATA from stations.js
    currentStationList = STATIONS_DATA;
    renderStationList(currentStationList);

    // Create Audio Element
    audioPlayer = new Audio();
    audioPlayer.crossOrigin = "anonymous";

    // Event Listeners
    powerBtn.addEventListener('click', togglePower);
    volumeSlider.addEventListener('input', updateVolume);
    searchInput.addEventListener('input', handleSearch);

    updateClock();
    setInterval(updateClock, 1000);

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function renderStationList(stationsToRender) {
    stationListEl.innerHTML = '';

    if (stationsToRender.length === 0) {
        const li = document.createElement('li');
        li.className = 'station-item';
        li.textContent = "NO SIGNALS DETECTED";
        li.style.opacity = "0.5";
        stationListEl.appendChild(li);
        return;
    }

    stationsToRender.forEach((station) => {
        // Find original index in master list
        const originalIndex = STATIONS_DATA.indexOf(station);

        const li = document.createElement('li');
        li.className = 'station-item';
        if (originalIndex === currentStationIdx) {
            li.classList.add('active');
        }
        li.textContent = station.name;
        li.dataset.index = originalIndex;
        li.addEventListener('click', () => switchStation(originalIndex));
        stationListEl.appendChild(li);
    });
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filtered = STATIONS_DATA.filter(station =>
        station.name.toLowerCase().includes(query)
    );
    renderStationList(filtered);
}

// --- AUDIO SYSTEM ---
function initAudioContext() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    audioSource = audioCtx.createMediaElementSource(audioPlayer);
    audioSource.connect(analyser);
    analyser.connect(audioCtx.destination);
}

function togglePower() {
    if (!audioCtx) {
        initAudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }
    if (isPlaying) {
        stopRadio();
    } else {
        startRadio();
    }
}

function startRadio() {
    isPlaying = true;
    powerBtn.textContent = "TERMINATE";
    powerBtn.classList.add('active'); // Style feedback

    statusSignal.textContent = "ACQUIRING...";
    statusSignal.classList.add('blink');

    playStation(currentStationIdx);
    drawVisualizer();
}

function stopRadio() {
    isPlaying = false;
    audioPlayer.pause();

    if (hls) {
        hls.destroy();
        hls = null;
    }

    powerBtn.textContent = "INITIALIZE";
    powerBtn.classList.remove('active');

    statusSignal.textContent = "STANDBY";
    statusSignal.classList.remove('blink');
    statusStation.textContent = "---";

    if (animationId) cancelAnimationFrame(animationId);
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function switchStation(index) {
    if (!audioCtx) initAudioContext();
    currentStationIdx = index;

    // Refresh list to show active state
    const query = searchInput.value.toLowerCase();
    const filtered = STATIONS_DATA.filter(station =>
        station.name.toLowerCase().includes(query)
    );
    renderStationList(filtered);

    if (isPlaying) {
        playStation(index);
    } else {
        startRadio();
    }
}

function playStation(index) {
    if (!STATIONS_DATA[index]) return;

    const station = STATIONS_DATA[index];
    statusStation.textContent = station.name;
    const url = station.url;

    // Check if HLS (m3u8)
    const isM3U8 = url.includes('.m3u8');

    if (hls) {
        hls.destroy();
        hls = null;
    }

    if (isM3U8 && Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(audioPlayer);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audioPlayer.play().catch(e => console.error("Play error:", e));
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                console.error("HLS Fatal Error:", data);
                statusSignal.textContent = "SIGNAL ERR";
                stopRadio();
            }
        });
    } else if (audioPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        audioPlayer.src = url;
        audioPlayer.load();
        audioPlayer.play();
    } else {
        // Standard Audio
        audioPlayer.src = url;
        audioPlayer.load();
        audioPlayer.play();
    }

    statusSignal.textContent = "BROADCASTING";
    statusSignal.classList.remove('blink');
}

function updateVolume() {
    audioPlayer.volume = volumeSlider.value;
}

// --- VISUALIZER ---
function resizeCanvas() {
    // Set actual canvas size to match CSS display size for crisp rendering
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width - 4; // Minus borders roughly
    canvas.height = rect.height - 4;
}

function drawVisualizer() {
    if (!isPlaying) return;

    animationId = requestAnimationFrame(drawVisualizer);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(dataArray);

    // Clear content
    canvasCtx.fillStyle = '#000000'; // Make sure we clear with black for contrast or transparent
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2; // Scale down

        // Color based on height (Gradient effect)
        // Simple monochrome green for Fallout style
        const alpha = barHeight / 150 + 0.5; // Dynamic opacity
        canvasCtx.fillStyle = `rgba(51, 255, 0, ${alpha})`;

        // Draw bar
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1; // Spacing
    }
}

// --- UTILS ---
function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
}

// Start
init();
