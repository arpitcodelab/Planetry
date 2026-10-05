export class TelemetryHUD {
  constructor(soundEngine, threeScene, onChapterClick) {
    this.soundEngine = soundEngine;
    this.threeScene = threeScene;
    this.onChapterClick = onChapterClick;

    this.fpsEl = document.getElementById('hud-fps');
    this.vectorEl = document.getElementById('hud-vector');
    this.coordsEl = document.getElementById('hud-coords');
    this.actNameEl = document.getElementById('hud-act-name');
    this.progressBar = document.getElementById('hud-progress-fill');
    this.progressPercent = document.getElementById('hud-progress-percent');
    this.soundBtn = document.getElementById('hud-sound-toggle');
    this.soundBars = document.querySelectorAll('.audio-bar');
    this.modeBtn = document.getElementById('hud-mode-toggle');
    this.chapterItems = document.querySelectorAll('.hud-chapter-item');

    this.init();
  }

  init() {
    // Sound Toggle
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', () => {
        const isPlaying = this.soundEngine.toggleSound();
        this.soundBtn.classList.toggle('active', isPlaying);
        const statusSpan = this.soundBtn.querySelector('.sound-status');
        if (statusSpan) {
          statusSpan.textContent = isPlaying ? 'ACTIVE' : 'MUTED';
        }
      });
    }

    // Free Orbit / Story Mode Toggle
    if (this.modeBtn) {
      this.modeBtn.addEventListener('click', () => {
        const currentMode = this.threeScene.toggleMode();
        this.soundEngine.playClick();
        this.modeBtn.classList.toggle('orbit-active', currentMode === 'orbit');
        const modeText = this.modeBtn.querySelector('.mode-text');
        if (modeText) {
          modeText.textContent = currentMode === 'orbit' ? 'ORBIT MODE (DRAG 3D)' : 'STORY CRUISE';
        }
        
        // Show brief floating toast
        this.showModeToast(currentMode);
      });
    }

    // Chapter Navigation Clicks
    this.chapterItems.forEach((item) => {
      item.addEventListener('click', () => {
        const targetAct = parseInt(item.getAttribute('data-act'), 10);
        this.soundEngine.playClick();
        if (this.onChapterClick) {
          this.onChapterClick(targetAct);
        }
      });
    });

    // Start Audio Visualizer Loop
    this.startAudioVisualizerLoop();
  }

  updateTelemetry(data) {
    if (this.fpsEl && data.fps) {
      this.fpsEl.textContent = `${data.fps} FPS`;
      if (data.fps < 45) {
        this.fpsEl.style.color = '#f59e0b';
      } else {
        this.fpsEl.style.color = '#10b981';
      }
    }
    if (this.vectorEl) {
      this.vectorEl.textContent = `X: ${data.x}  Y: ${data.y}  Z: ${data.z}`;
    }
    if (this.coordsEl && data.coords) {
      this.coordsEl.textContent = data.coords;
    }
    if (this.actNameEl && data.actName) {
      this.actNameEl.textContent = data.actName;
    }
  }

  updateScrollProgress(progress, currentAct) {
    const pct = Math.round(progress * 100);
    if (this.progressBar) {
      this.progressBar.style.width = `${pct}%`;
    }
    if (this.progressPercent) {
      this.progressPercent.textContent = `${pct.toString().padStart(2, '0')}%`;
    }

    // Update active chapter state
    this.chapterItems.forEach((item, idx) => {
      const actNum = parseInt(item.getAttribute('data-act'), 10);
      if (actNum === currentAct) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  showModeToast(mode) {
    let toast = document.getElementById('mode-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'mode-toast';
      toast.className = 'mode-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = mode === 'orbit' 
      ? `<span>✦ FREE ORBIT UNLOCKED</span><small>CLICK & DRAG TO ROTATE CURRENT CELESTIAL SECTOR</small>`
      : `<span>✦ STORY CRUISE ENGAGED</span><small>SCROLL TO TRAVEL DEEP COSMIC TIMELINE</small>`;
    
    toast.classList.add('visible');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2800);
  }

  startAudioVisualizerLoop() {
    const update = () => {
      const level = this.soundEngine.getSpectrumLevel();
      this.soundBars.forEach((bar, i) => {
        const height = Math.max(3, Math.sin(Date.now() * 0.01 + i) * 12 * level + 4);
        bar.style.height = `${height}px`;
      });
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
}
