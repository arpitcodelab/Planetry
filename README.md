# 🪐 CHRONOS : PLANETRY
### Odyssey into Deep Time & Stellar Genesis — Cinematic 3D WebGL Storytelling

[![Live Demo](https://img.shields.io/badge/Live-Demo-00f0ff?style=for-the-badge&logo=googlechrome&logoColor=black)](https://arpitcodelab.github.io/Planetry/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-ScrollTrigger-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](LICENSE)

An award-winning caliber, scroll-driven cinematic 3D web experience exploring cosmic genesis across 5 procedural celestial acts. Built with **Three.js**, **GSAP ScrollTrigger**, **Lenis** inertia physics, and a procedural **Web Audio API** synthesizer.

---

## 🌌 The Narrative Acts

1. **Act 01: The Void Singularity** (Origin) — Schwarzschild event horizon, Einstein ring Fresnel glow, Keplerian accretion swirl, and zero-G monolithic shards.
2. **Act 02: The Stellar Crucible** (+1.48M Yr) — Thermonuclear core ignition with procedural 3D simplex noise vertex displacement, dynamic corona, and relativistic bipolar plasma jets.
3. **Act 03: Planetary Forge** (+4.10M Yr) — Magma fissure continents, cyan Rayleigh atmospheric scattering, and a 350-piece orbiting asteroid belt.
4. **Act 04: The Dyson Monolith** (+8.90M Yr) — Gyroscopic megastructure rings, central levitating hyper-crystal, and laser interferometry guides.
5. **Act 05: Transcendent Horizon** (Eternal) — Light-speed warp tunnel with streaking starlight filaments and refractive gateway core.

---

## ✨ Features & Architecture

- **3D Post-Processing & Cinematic Lighting**:
  - `EffectComposer` pipeline with `UnrealBloomPass` for anamorphic lens bloom.
  - Near-camera floating space dust (350 micro-motes) for immediate physical depth parallax.
- **Catmull-Rom Spline Flight Rails**:
  - `THREE.CatmullRomCurve3` centripetal splines for continuous C1 curvature camera flight and banking.
- **Dual Exploration Modes**:
  - **Story Cruise Mode**: Camera follows the narrative scroll rails.
  - **Free 3D Orbit Mode**: Unlock 360° mouse drag / touch rotation around the active celestial object with inertia damping.
- **Procedural Web Audio Engine**:
  - Native browser Web Audio API synthesizer (no external MP3 downloads).
  - 55Hz sub-bass sine drone with breathing LFO filter modulation and harmonic chord shifts on act transitions.
- **Precision HUD Telemetry**:
  - Real-time 60 FPS counter with adaptive quality governor.
  - Camera spatial coordinate readouts (`X, Y, Z`) and astronomical coordinates.
  - Interactive chapter scrubber (`01` through `05`).
- **60 FPS Performance Discipline**:
  - 100% procedural GPU GLSL shaders — 0 MB 3D asset downloads.
  - Clamped pixel ratio (`Math.min(devicePixelRatio, 2)`).
  - Deprecated `THREE.Clock` replaced with high-precision `performance.now()`.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/arpitcodelab/Planetry.git
cd Planetry

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🌐 Deployment to GitHub Pages

### Method 1: Instant via `/docs` folder
1. Go to repository **Settings** $\to$ **Pages**.
2. Under **Build and deployment** $\to$ **Source**, choose **Deploy from a branch**.
3. Select **Branch**: `main`, and **Folder**: `/docs`.
4. Click **Save** — the site will be deployed at `https://arpitcodelab.github.io/Planetry/`.

### Method 2: Automated CI/CD via GitHub Actions
A GitHub Actions workflow is included at `.github/workflows/deploy.yml`.

---

## 📖 Detailed Documentation

See the comprehensive architecture breakdown at [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md).

---

## 📄 License
MIT © [arpitcodelab](https://github.com/arpitcodelab)
