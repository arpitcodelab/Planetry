// Procedural Cinematic Web Audio Engine
// Generates ambient cosmic drones, harmonic overtones, warp sweeps, and UI haptics
export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.isInitialized = false;
    this.masterGain = null;
    this.droneGain = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.filter = null;
    this.lfo = null;
    this.lfoGain = null;
    this.analyser = null;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Analyser for UI visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 32;
      this.masterGain.connect(this.analyser);

      // Cosmic Sub-Bass Drone (Oscillator 1 - Deep Sine 55Hz)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

      // Cosmic Harmonic Texture (Oscillator 2 - Triangle 110Hz detuned)
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(110.4, this.ctx.currentTime); // Slight detune for warmth

      // Lowpass Resonant Filter
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(160, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

      // LFO for organic breathing pulse
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8-second breathing cycle
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(40, this.ctx.currentTime);
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.filter.frequency);

      // Drone Gain
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

      this.droneOsc1.connect(this.filter);
      this.droneOsc2.connect(this.filter);
      this.filter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();
      this.lfo.start();

      this.isInitialized = true;
    } catch (err) {
      console.warn('Web Audio not supported or blocked:', err);
    }
  }

  toggleSound() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      if (this.isMuted) {
        this.masterGain.gain.setTargetAtTime(0.0001, now, 0.2);
      } else {
        this.masterGain.gain.setTargetAtTime(0.35, now, 0.4);
        this.playChord([220, 277.18, 329.63], 1.2, 0.15); // Celestial A-major chime
      }
    }
    return !this.isMuted;
  }

  playChord(freqs, duration = 1.0, gainVal = 0.1) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, now);

        g.gain.setValueAtTime(0.001, now);
        g.gain.exponentialRampToValueAtTime(gainVal / freqs.length, now + 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration + 0.1);
      });
    } catch (e) {
      // Audio safety
    }
  }

  // Called when scrolling into new Act
  triggerActTransition(actIndex) {
    if (this.isMuted || !this.ctx) return;
    const chords = [
      [110, 164.81, 220],          // Act 1: A minor (deep, enigmatic)
      [146.83, 220, 293.66],       // Act 2: D sus2 (incipient energy)
      [130.81, 196, 261.63, 329.63],// Act 3: C major 7 (expansive)
      [174.61, 261.63, 349.23],    // Act 4: F major (monolithic majesty)
      [220, 277.18, 329.63, 440]   // Act 5: A major (luminescent transcendence)
    ];
    const chord = chords[actIndex % chords.length] || chords[0];
    this.playChord(chord, 1.8, 0.18);

    // Subtle pitch modulation on drone filter
    if (this.filter && this.ctx) {
      const now = this.ctx.currentTime;
      this.filter.frequency.setTargetAtTime(120 + actIndex * 40, now, 0.5);
    }
  }

  // Subtle UI click haptic
  playClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      g.gain.setValueAtTime(0.05, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  // Warp velocity pulse when scrolling fast
  pulseVelocity(speed) {
    if (this.isMuted || !this.ctx || !this.filter) return;
    const boost = Math.min(speed * 0.05, 120);
    const now = this.ctx.currentTime;
    this.filter.frequency.setTargetAtTime(160 + boost, now, 0.1);
  }

  getSpectrumLevel() {
    if (this.isMuted || !this.analyser) return 0;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum / (data.length * 255);
  }
}
