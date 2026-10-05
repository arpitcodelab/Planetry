import './style.css';
import { SoundEngine } from './audio/SoundEngine.js';
import { ThreeScene } from './scene/ThreeScene.js';
import { TelemetryHUD } from './ui/TelemetryHUD.js';
import { StoryController } from './ui/StoryController.js';
import { CustomCursor } from './ui/Cursor.js';
import gsap from 'gsap';

class App {
  constructor() {
    this.soundEngine = null;
    this.threeScene = null;
    this.telemetryHud = null;
    this.storyController = null;
    this.customCursor = null;

    this.init();
  }

  init() {
    // 1. Procedural Audio Engine
    this.soundEngine = new SoundEngine();

    // 2. Custom Magnetic Cursor
    this.customCursor = new CustomCursor();

    // 3. WebGL Canvas & Master 3D Scene
    const container = document.getElementById('webgl-canvas-container');
    this.threeScene = new ThreeScene(container);

    // 4. Telemetry HUD
    this.telemetryHud = new TelemetryHUD(
      this.soundEngine,
      this.threeScene,
      (targetAct) => {
        if (this.storyController) {
          this.storyController.scrollToAct(targetAct);
        }
      }
    );

    // Feed real-time 3D telemetry into HUD
    this.threeScene.onTelemetryUpdate = (data) => {
      this.telemetryHud.updateTelemetry(data);
    };

    // 5. Scroll Controller & Narrative Timeline
    this.storyController = new StoryController(
      this.threeScene,
      this.soundEngine,
      (progress, currentAct) => {
        this.telemetryHud.updateScrollProgress(progress, currentAct);
      }
    );

    // 6. Interactive In-Card CTA Jump Buttons
    this.bindJumpButtons();

    // 7. Preloader Sequence
    this.runPreloaderCalibration();
  }

  bindJumpButtons() {
    const jumpButtons = document.querySelectorAll('.jump-act-btn');
    jumpButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetAct = parseInt(btn.getAttribute('data-target'), 10);
        this.soundEngine.playClick();
        if (this.storyController) {
          this.storyController.scrollToAct(targetAct);
        }
      });
    });

    const finaleOrbitBtn = document.getElementById('finale-orbit-btn');
    if (finaleOrbitBtn) {
      finaleOrbitBtn.addEventListener('click', () => {
        const mode = this.threeScene.toggleMode();
        this.soundEngine.playClick();
        this.telemetryHud.showModeToast(mode);
        const modeBtn = document.getElementById('hud-mode-toggle');
        if (modeBtn) {
          modeBtn.classList.toggle('orbit-active', mode === 'orbit');
          const modeText = modeBtn.querySelector('.mode-text');
          if (modeText) {
            modeText.textContent = mode === 'orbit' ? 'ORBIT MODE (DRAG 3D)' : 'STORY CRUISE';
          }
        }
      });
    }

    const finaleReplayBtn = document.getElementById('finale-replay-btn');
    if (finaleReplayBtn) {
      finaleReplayBtn.addEventListener('click', () => {
        this.soundEngine.playClick();
        if (this.storyController) {
          this.storyController.scrollToAct(0);
        }
      });
    }
  }

  runPreloaderCalibration() {
    const preloader = document.getElementById('cinematic-preloader');
    const fill = document.getElementById('preloader-fill');
    const percent = document.getElementById('preloader-percent');
    const status = document.getElementById('preloader-status');
    const enterBtn = document.getElementById('preloader-btn');

    const steps = [
      { pct: 24, text: "WARMING SHADER COMPILERS" },
      { pct: 52, text: "CALIBRATING KEPLER ACCRETION MATRIX" },
      { pct: 81, text: "SYNCHRONIZING GRAVITATIONAL SENSORS" },
      { pct: 100, text: "EXPEDITION READY // ALL SYSTEMS GO" }
    ];

    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const item = steps[currentStep];
        if (fill) fill.style.width = `${item.pct}%`;
        if (percent) percent.textContent = `${item.pct}%`;
        if (status) status.textContent = item.text;
        currentStep++;
      } else {
        clearInterval(interval);
        if (enterBtn) {
          enterBtn.classList.add('ready');
          enterBtn.addEventListener('click', () => {
            // Dismiss preloader with smooth cinematic reveal
            this.soundEngine.init();
            // Automatically start cosmic audio on user interaction!
            const isPlaying = this.soundEngine.toggleSound();
            const soundBtn = document.getElementById('hud-sound-toggle');
            if (soundBtn) {
              soundBtn.classList.toggle('active', isPlaying);
              const statusSpan = soundBtn.querySelector('.sound-status');
              if (statusSpan) statusSpan.textContent = isPlaying ? 'ACTIVE' : 'MUTED';
            }

            gsap.to(preloader, {
              opacity: 0,
              duration: 1.2,
              ease: 'power3.inOut',
              onComplete: () => {
                preloader.classList.add('dismissed');
              }
            });

            // Gentle opening camera push
            gsap.from(this.threeScene.camera.position, {
              z: 35,
              duration: 2.5,
              ease: 'power3.out'
            });
          });
        }
      }
    }, 280);
  }
}

// Instantiate on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
