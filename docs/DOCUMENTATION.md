# CHRONOS: PLANETRY — TECHNICAL DOCUMENTATION & ARCHITECTURE

## Overview
**CHRONOS (Planetry)** is a cinematic, scroll-driven WebGL storytelling experience built using **Three.js**, **GSAP ScrollTrigger**, and **Lenis** inertia physics. It transports the audience through a 5-Act cosmological journey: from a primordial singularity to an advanced conscious Dyson megastructure and hyper-dimensional transcendence.

---

## 1. Narrative Architecture (The 5 Acts)

### Act I: The Void Singularity (Origin)
- **3D Celestial Core**: Pure black event horizon sphere (`MeshBasicMaterial` in pitch black `#000000`) with zero reflectance.
- **Einstein Ring**: Custom Fresnel rim glow shader simulating gravitational lensing around the Schwarzschild radius.
- **Keplerian Accretion Swirl**: 2,800 particles with orbit velocities inversely proportional to the square root of radius ($v \propto r^{-0.5}$).
- **Monolithic Shards**: 18 low-poly obsidian shards tumbling in zero gravity.

### Act II: The Stellar Crucible (+1.48M Yr)
- **Thermonuclear Core**: Procedural 3D simplex noise vertex displacement shader simulating solar plasma convection.
- **Volumetric Corona**: Dynamic rim shader with high-frequency thermal pulsation.
- **Relativistic Bipolar Jets**: 1,200 high-velocity particles ejected along polar magnetic axes.
- **Solar Flare Rings**: Dual tilted tori with counter-rotating flare filaments.

### Act III: Planetary Forge (+4.10M Yr)
- **Continental Tectonic Plates & Magma Veins**: Procedural fractional Brownian motion (fBm) shader creating magma fissures beneath basalt shelves.
- **Rayleigh Scattering Atmosphere**: Cyan Fresnel atmospheric envelope.
- **Asteroid Belt**: 350 individual low-poly dodecahedron asteroids orbiting in an elliptical debris disk.
- **Magnetic Field Lines**: Resonating elliptical flux curves connecting magnetic poles.

### Act IV: The Dyson Monolith (+8.90M Yr)
- **Central Hyper-Crystal**: Levitating obsidian octahedron encased in a violet wireframe energy lattice.
- **Gyroscopic Megastructure**: 4 concentric interlocking torus rings rotating on orthogonal axes.
- **Laser Interferometry Guides**: 6 collimated guidance light beams.
- **Telemetry Beacons**: 14 orbiting sensor nodes transmitting spatial telemetry.

### Act V: Transcendent Horizon (Eternal)
- **Light-Speed Warp Vortex**: 1,800 starlight streak filaments accelerating along the Z-axis.
- **Portal Rings**: Pulsating geometric gateway rings framing the camera flight.
- **Refractive Singularity Core**: Physical transmission material with chromatic refraction.

---

## 2. Technical Stack & Motion Choreography

- **Three.js + Post-Processing**:
  - `EffectComposer` pipeline with `RenderPass`, `UnrealBloomPass` (anamorphic bloom), and `OutputPass`.
  - `THREE.CatmullRomCurve3` centripetal splines for seamless C1 curvature camera flight rails.
  - Near-camera floating space dust (350 micro-motes) for immediate physical depth parallax.
  - Microsecond-accurate frame delta via `performance.now()`.
- **GSAP ScrollTrigger & Lenis**:
  - Exponential deceleration easing for buttery smooth momentum scrolling.
  - Scrubbed card entrance (`filter: blur(12px) -> blur(0px)`) and exit dissolve into deep space.
- **Procedural Web Audio Engine**:
  - Native browser **Web Audio API** synthesizer (no external audio files).
  - 55Hz sub-bass sine drone with breathing LFO filter modulation.
  - Harmonic chord progressions matching each act transition.
  - Live frequency spectrum visualizer in the top HUD.
- **Responsive HUD**:
  - Real-time 60 FPS counter with adaptive quality governor.
  - Camera spatial coordinate readouts (`X, Y, Z`).
  - Dual Mode toggle: **Story Cruise Mode** vs. **Free 3D Orbit Mode** (360° touch/mouse drag).

---

## 3. Deployment Instructions

### Option A: GitHub Pages via `/docs` Folder (Instant)
1. In your GitHub repository, navigate to **Settings** $\to$ **Pages**.
2. Under **Build and deployment** $\to$ **Source**, choose **Deploy from a branch**.
3. Select **Branch**: `main`, and **Folder**: `/docs`.
4. Click **Save**. The site will be live at `https://arpitcodelab.github.io/Planetry/`.

### Option B: GitHub Actions (Automated CI/CD)
The repository includes `.github/workflows/deploy.yml` which automatically builds and publishes every push to `main` directly to GitHub Pages.

---

## 4. Local Development

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
