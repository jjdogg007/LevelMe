
// Simple synth for system sounds without external assets
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

// Track active battle nodes
let battleOscillators: OscillatorNode[] = [];
let battleGains: GainNode[] = [];
let battleInterval: any = null;

// Initialize Audio Context (Mobile Fix)
// Mobile browsers block audio until a user gesture. We call this on the first click.
export const initAudio = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    // iOS Speech Synthesis "Warm up"
    // iOS won't speak unless the first utterance is triggered by a direct user action.
    if (window.speechSynthesis) {
        const warmUp = new SpeechSynthesisUtterance("");
        warmUp.volume = 0;
        window.speechSynthesis.speak(warmUp);
    }
};

// Text to Speech Function
export const speakSystemMessage = (text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel any current speech to prevent queue buildup
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1; // Slightly faster
    utterance.pitch = 0.8; // Lower pitch for "System" feel
    utterance.volume = 1.0;

    // Try to find a good robotic/English voice
    const voices = window.speechSynthesis.getVoices();
    // Prefer higher quality native voices if available
    const preferredVoice = voices.find(v => 
        v.name.includes('Google US English') || 
        v.name.includes('Samantha') || 
        v.name.includes('Daniel')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
};

const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
    if (!audioCtx) return;
    
    // Ensure context is running (redundant safety)
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
};

// --- BATTLE SOUNDTRACK (Procedural Drone) ---
export const startBattleMusic = () => {
    if (!audioCtx) return;
    if (battleOscillators.length > 0) return; // Already playing

    if (audioCtx.state === 'suspended') audioCtx.resume();

    // 1. Low Drone (Sawtooth)
    const droneOsc = audioCtx.createOscillator();
    const droneGain = audioCtx.createGain();
    
    droneOsc.type = 'sawtooth';
    droneOsc.frequency.setValueAtTime(55, audioCtx.currentTime); // Low A (A1)
    
    // LFO for drone pulsing
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.5, audioCtx.currentTime); // Slow pulse
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(droneGain.gain);
    
    droneGain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    
    droneOsc.connect(droneGain);
    droneGain.connect(audioCtx.destination);
    
    droneOsc.start();
    lfo.start();

    battleOscillators.push(droneOsc, lfo);
    battleGains.push(droneGain, lfoGain);

    // 2. Rhythmic Industrial Beat (Noise Burst simulation)
    battleInterval = setInterval(() => {
        // Kick
        playTone(60, 'square', 0.1, 0.2);
        // Hi-hats logic
        setTimeout(() => playTone(1200, 'triangle', 0.05, 0.05), 250);
        setTimeout(() => playTone(1200, 'triangle', 0.05, 0.05), 500);
        setTimeout(() => playTone(1200, 'triangle', 0.05, 0.05), 750);
    }, 1000);
};

export const stopBattleMusic = () => {
    battleOscillators.forEach(osc => {
        try { osc.stop(); } catch(e) {}
    });
    battleOscillators = [];
    battleGains = [];
    
    if (battleInterval) {
        clearInterval(battleInterval);
        battleInterval = null;
    }
};

export const playSystemSound = (type: 'hover' | 'click' | 'success' | 'levelUp' | 'glitch' | 'start') => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        // Haptic Feedback
        switch (type) {
            case 'click': window.navigator.vibrate(20); break;
            case 'hover': window.navigator.vibrate(5); break;
            case 'success': window.navigator.vibrate([50, 50, 50]); break;
            case 'levelUp': window.navigator.vibrate([100, 50, 100, 50, 200]); break;
            case 'glitch': window.navigator.vibrate([30, 30, 30, 30, 100]); break;
            case 'start': window.navigator.vibrate(100); break;
        }
    }

    if (!audioCtx) return;
    
    switch (type) {
        case 'hover':
            // High pitch short blip
            playTone(800, 'sine', 0.05, 0.02);
            break;
        case 'click':
            // Mechanical click
            playTone(1200, 'square', 0.05, 0.05);
            break;
        case 'start':
            // Power up sound
            playTone(200, 'sawtooth', 0.3, 0.1);
            setTimeout(() => playTone(400, 'sawtooth', 0.3, 0.1), 100);
            setTimeout(() => playTone(800, 'sawtooth', 0.5, 0.1), 200);
            break;
        case 'success':
            // Victory chord
            playTone(440, 'sine', 0.5, 0.1);
            setTimeout(() => playTone(554, 'sine', 0.5, 0.1), 100);
            setTimeout(() => playTone(659, 'sine', 0.8, 0.1), 200);
            break;
        case 'levelUp':
            // Orchestral hit simulation
            playTone(110, 'sawtooth', 1.5, 0.2); // Bass
            setTimeout(() => playTone(440, 'square', 1.0, 0.1), 50);
            setTimeout(() => playTone(880, 'sine', 1.0, 0.1), 100);
            break;
        case 'glitch':
            // Dissonant noise
            playTone(50, 'sawtooth', 0.5, 0.3);
            setTimeout(() => playTone(43, 'square', 0.3, 0.3), 50);
            setTimeout(() => playTone(1200, 'sawtooth', 0.1, 0.2), 100);
            break;
    }
};
