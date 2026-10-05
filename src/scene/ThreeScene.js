import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { StarField } from './StarField.js';
import { Singularity } from './Singularity.js';
import { StellarCrucible } from './StellarCrucible.js';
import { PlanetaryForge } from './PlanetaryForge.js';
import { DysonMonolith } from './DysonMonolith.js';
import { WarpTunnel } from './WarpTunnel.js';

export class ThreeScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.isWebGLSupported = this.checkWebGL();
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollProgress = 0; // 0.0 to 1.0 from GSAP / Lenis
    this.smoothScroll = 0;
    this.currentActIndex = 0;

    // Interaction modes: 'story' vs 'orbit'
    this.mode = 'story';
    this.orbit = {
      isDragging: false,
      prevX: 0,
      prevY: 0,
      rotX: 0,
      rotY: 0,
      targetRotX: 0,
      targetRotY: 0,
      distance: 22
    };

    // FPS tracking for telemetry HUD & adaptive quality
    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.lowFpsCount = 0;

    // Telemetry callback
    this.onTelemetryUpdate = null;

    if (this.isWebGLSupported) {
      this.init();
    } else {
      this.initFallback();
    }
  }

  checkWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  init() {
    // 1. Scene & Deep Cosmic Fog
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x040407, 0.0035);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 1600);
    this.currentCameraTarget = new THREE.Vector3(0, 0, 0);

    // 3. Catmull-Rom Spline Flight Rails
    this.setupCameraSpline();

    // 4. Renderer with Clamped DPR
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: window.devicePixelRatio < 2,
      alpha: true,
      stencil: false,
      depth: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // 5. Postprocessing: Cinematic Unreal Bloom
    this.setupPostProcessing();

    // 6. Multi-Point Lighting Rig
    this.setupLighting();

    // 7. Celestial Scenes
    this.starField = new StarField(12000);
    this.scene.add(this.starField.group);

    this.act1Singularity = new Singularity();
    this.scene.add(this.act1Singularity.group);

    this.act2Crucible = new StellarCrucible();
    this.scene.add(this.act2Crucible.group);

    this.act3Planet = new PlanetaryForge();
    this.scene.add(this.act3Planet.group);

    this.act4Dyson = new DysonMonolith();
    this.scene.add(this.act4Dyson.group);

    this.act5Warp = new WarpTunnel();
    this.scene.add(this.act5Warp.group);

    // 8. Near-Camera Floating Space Dust for Spatial Depth
    this.createCameraDust();

    // 9. Event Listeners
    this.bindEvents();

    // 10. High-precision Timing & Render Loop
    this.prevTime = performance.now();
    this.startTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupCameraSpline() {
    // 5 Key Celestial Waypoints
    this.waypoints = [
      {
        pos: new THREE.Vector3(0, 2.5, 20),
        target: new THREE.Vector3(0, 0, 0),
        name: "SINGULARITY_CORE",
        coords: "RA 18h 36m // DEC +38° 47′",
        bloom: 0.65
      },
      {
        pos: new THREE.Vector3(22, 6.5, -20),
        target: new THREE.Vector3(28, 5, -35),
        name: "STELLAR_CRUCIBLE",
        coords: "RA 05h 35m // DEC -05° 23′",
        bloom: 1.25 // Fiery solar bloom
      },
      {
        pos: new THREE.Vector3(-18, 3.5, -60),
        target: new THREE.Vector3(-25, -2, -75),
        name: "PLANETARY_GENESIS",
        coords: "RA 19h 50m // DEC +08° 52′",
        bloom: 0.75
      },
      {
        pos: new THREE.Vector3(15, 6, -102),
        target: new THREE.Vector3(20, 2, -120),
        name: "DYSON_MONOLITH",
        coords: "RA 20h 42m // DEC +45° 16′",
        bloom: 0.85
      },
      {
        pos: new THREE.Vector3(0, 0.5, -148),
        target: new THREE.Vector3(0, 0, -180),
        name: "EVENT_HORIZON_GATEWAY",
        coords: "HYPER-DIMENSION // Z: INF",
        bloom: 1.4 // Prismatic warp bloom
      }
    ];

    // Spline curve for smooth cinematic camera banking
    const camPoints = this.waypoints.map(w => w.pos);
    const targetPoints = this.waypoints.map(w => w.target);

    this.cameraSpline = new THREE.CatmullRomCurve3(camPoints, false, 'centripetal', 0.5);
    this.targetSpline = new THREE.CatmullRomCurve3(targetPoints, false, 'centripetal', 0.5);

    // Initial position
    this.camera.position.copy(camPoints[0]);
    this.currentCameraTarget.copy(targetPoints[0]);
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    
    // Render Pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Cinematic Bloom Pass
    const bloomResolution = new THREE.Vector2(this.width, this.height);
    this.bloomPass = new UnrealBloomPass(
      bloomResolution,
      0.75, // strength
      0.45, // radius
      0.72  // threshold
    );
    this.composer.addPass(this.bloomPass);

    // Output Pass
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0x0a0c16, 1.2);
    this.scene.add(this.ambientLight);

    // Primary warm point light (shifts position with scroll)
    this.keyLight = new THREE.PointLight(0xffa726, 4.2, 85, 1.2);
    this.keyLight.position.set(0, 5, 10);
    this.scene.add(this.keyLight);

    // Cold rim directional light
    this.rimLight = new THREE.DirectionalLight(0x00f0ff, 2.2);
    this.rimLight.position.set(-20, 15, 20);
    this.scene.add(this.rimLight);

    // Magenta accent light
    this.accentLight = new THREE.PointLight(0xa855f7, 2.8, 65, 1.5);
    this.accentLight.position.set(15, -10, -50);
    this.scene.add(this.accentLight);
  }

  createCameraDust() {
    // 350 micro-motes floating in camera-relative sphere for immediate spatial parallax
    const count = 350;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.cameraDust = new THREE.Points(geo, mat);
    this.scene.add(this.cameraDust);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());

    // Mouse movement for parallax
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

      if (this.mode === 'orbit' && this.orbit.isDragging) {
        const deltaX = e.clientX - this.orbit.prevX;
        const deltaY = e.clientY - this.orbit.prevY;
        this.orbit.targetRotY += deltaX * 0.008;
        this.orbit.targetRotX += deltaY * 0.008;
        this.orbit.targetRotX = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, this.orbit.targetRotX));
        this.orbit.prevX = e.clientX;
        this.orbit.prevY = e.clientY;
      }
    });

    // Touch support for mobile parallax & orbit
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.mouse.targetX = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouse.targetY = -(touch.clientY / window.innerHeight) * 2 + 1;

        if (this.mode === 'orbit' && this.orbit.isDragging) {
          const deltaX = touch.clientX - this.orbit.prevX;
          const deltaY = touch.clientY - this.orbit.prevY;
          this.orbit.targetRotY += deltaX * 0.012;
          this.orbit.targetRotX += deltaY * 0.012;
          this.orbit.prevX = touch.clientX;
          this.orbit.prevY = touch.clientY;
        }
      }
    }, { passive: true });

    // Orbit drag controls
    window.addEventListener('mousedown', (e) => {
      if (this.mode === 'orbit') {
        this.orbit.isDragging = true;
        this.orbit.prevX = e.clientX;
        this.orbit.prevY = e.clientY;
      }
    });
    window.addEventListener('mouseup', () => {
      this.orbit.isDragging = false;
    });

    window.addEventListener('touchstart', (e) => {
      if (this.mode === 'orbit' && e.touches.length > 0) {
        this.orbit.isDragging = true;
        this.orbit.prevX = e.touches[0].clientX;
        this.orbit.prevY = e.touches[0].clientY;
      }
    }, { passive: true });
    window.addEventListener('touchend', () => {
      this.orbit.isDragging = false;
    });
  }

  setScrollProgress(progress) {
    this.scrollProgress = Math.max(0, Math.min(1, progress));
  }

  toggleMode() {
    this.mode = this.mode === 'story' ? 'orbit' : 'story';
    if (this.mode === 'orbit') {
      this.orbit.rotX = 0;
      this.orbit.rotY = 0;
      this.orbit.targetRotX = 0;
      this.orbit.targetRotY = 0;
    }
    return this.mode;
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (this.camera && this.renderer) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      if (this.composer) {
        this.composer.setSize(this.width, this.height);
      }
    }
  }

  interpolateCamera() {
    // Ultra-creamy cubic lerp for scroll progress
    this.smoothScroll = THREE.MathUtils.lerp(this.smoothScroll, this.scrollProgress, 0.05);
    const clampedProgress = Math.max(0.0001, Math.min(0.9999, this.smoothScroll));

    // Spline evaluated camera position & lookAt target
    const splineCamPos = this.cameraSpline.getPoint(clampedProgress);
    const splineTarget = this.targetSpline.getPoint(clampedProgress);

    const totalActs = this.waypoints.length;
    this.currentActIndex = Math.min(Math.floor(clampedProgress * totalActs), totalActs - 1);
    const activeWp = this.waypoints[this.currentActIndex];

    // Dynamic bloom modulation
    if (this.bloomPass && activeWp) {
      this.bloomPass.strength = THREE.MathUtils.lerp(this.bloomPass.strength, activeWp.bloom, 0.05);
    }

    // Dynamic light tracking
    if (this.keyLight) {
      this.keyLight.position.lerp(splineTarget, 0.08);
      this.keyLight.position.y += 3.0;
    }

    if (this.mode === 'story') {
      // Add subtle cursor parallax tilt
      splineCamPos.x += this.mouse.x * 1.8;
      splineCamPos.y += this.mouse.y * 1.2;

      this.camera.position.lerp(splineCamPos, 0.075);
      this.currentCameraTarget.lerp(splineTarget, 0.075);
      this.camera.lookAt(this.currentCameraTarget);
    } else {
      // Free Orbit Mode around current narrative target
      this.orbit.rotX = THREE.MathUtils.lerp(this.orbit.rotX, this.orbit.targetRotX, 0.08);
      this.orbit.rotY = THREE.MathUtils.lerp(this.orbit.rotY, this.orbit.targetRotY, 0.08);

      const radius = this.orbit.distance;
      const target = activeWp.target;

      const x = target.x + radius * Math.sin(this.orbit.rotY) * Math.cos(this.orbit.rotX);
      const y = target.y + radius * Math.sin(this.orbit.rotX);
      const z = target.z + radius * Math.cos(this.orbit.rotY) * Math.cos(this.orbit.rotX);

      this.camera.position.lerp(new THREE.Vector3(x, y, z), 0.1);
      this.camera.lookAt(target);
    }

    // Keep camera dust motes aligned around camera
    if (this.cameraDust) {
      this.cameraDust.position.copy(this.camera.position);
    }

    // Pass warp speed intensity to Act 5
    if (this.act5Warp) {
      const warpFactor = Math.max(0, (clampedProgress - 0.75) * 4);
      this.act5Warp.setWarpIntensity(1.0 + warpFactor * 3.5);
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const currentTime = performance.now();
    const delta = Math.min((currentTime - this.prevTime) / 1000, 0.1);
    const time = (currentTime - this.startTime) / 1000;
    this.prevTime = currentTime;

    // Mouse lerp for creamy micro-motion
    this.mouse.x = THREE.MathUtils.lerp(this.mouse.x, this.mouse.targetX, 0.06);
    this.mouse.y = THREE.MathUtils.lerp(this.mouse.y, this.mouse.targetY, 0.06);

    // Drive camera along spline flight rails
    this.interpolateCamera();

    // Update 3D celestial entities
    if (this.starField) this.starField.update(delta, time);
    if (this.act1Singularity) this.act1Singularity.update(delta, time);
    if (this.act2Crucible) this.act2Crucible.update(delta, time);
    if (this.act3Planet) this.act3Planet.update(delta, time);
    if (this.act4Dyson) this.act4Dyson.update(delta, time);
    if (this.act5Warp) this.act5Warp.update(delta, time);

    // Rotate camera dust gently
    if (this.cameraDust) {
      this.cameraDust.rotation.y = time * 0.02;
    }

    // Render via EffectComposer with cinematic bloom
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // Adaptive 60 FPS Performance Monitoring
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;

      // If FPS drops below 40 repeatedly, dynamically adjust bloom radius/DPR
      if (this.fps < 40) {
        this.lowFpsCount++;
        if (this.lowFpsCount > 3 && this.bloomPass) {
          this.bloomPass.enabled = false; // Fallback to raw render for steady 60 FPS
        }
      } else {
        this.lowFpsCount = Math.max(0, this.lowFpsCount - 1);
      }

      if (this.onTelemetryUpdate) {
        const wp = this.waypoints[this.currentActIndex] || this.waypoints[0];
        this.onTelemetryUpdate({
          fps: this.fps,
          x: this.camera.position.x.toFixed(1),
          y: this.camera.position.y.toFixed(1),
          z: this.camera.position.z.toFixed(1),
          actName: wp.name,
          coords: wp.coords,
          mode: this.mode
        });
      }
    }
  }

  initFallback() {
    console.warn("WebGL not supported, initializing CSS fallback.");
    if (this.container) {
      this.container.classList.add('webgl-fallback');
      this.container.innerHTML = `
        <div class="fallback-gradient-bg"></div>
        <div class="fallback-notice">
          <span>HIGH-PRECISION 2D COMPOSITING ACTIVE // WEBGL ACCELERATION OPTIONAL</span>
        </div>
      `;
    }
  }
}
