import * as THREE from 'three';

export class StarField {
  constructor(count = 10000) {
    this.count = count;
    this.group = new THREE.Group();
    this.init();
  }

  init() {
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const scales = new Float32Array(this.count);
    const phases = new Float32Array(this.count);

    const palette = [
      new THREE.Color(0xffffff), // Pure white
      new THREE.Color(0xa5c9eb), // Cold cyan-blue
      new THREE.Color(0xffd59e), // Warm stellar gold
      new THREE.Color(0xbf95ff), // Deep violet
      new THREE.Color(0x7df9ff)  // Electric aqua
    ];

    for (let i = 0; i < this.count; i++) {
      // Spherical distribution with radius between 80 and 800
      const radius = 80 + Math.pow(Math.random(), 1.6) * 720;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color selection
      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      scales[i] = Math.random() * 2.5 + 0.8;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    // Custom Shader for twinkling points
    const vertexShader = `
      attribute float aScale;
      attribute float aPhase;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
        // Twinkle factor
        float twinkle = 0.65 + 0.35 * sin(uTime * 2.0 + aPhase);
        
        gl_PointSize = aScale * twinkle * uPixelRatio * (280.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;

      void main() {
        // Circular soft star particle
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;

        // Core glow falloff
        float intensity = pow(1.0 - (dist * 2.0), 2.0);
        gl_FragColor = vec4(vColor, intensity * 0.95);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) }
      }
    });

    this.points = new THREE.Points(geometry, this.material);
    this.group.add(this.points);

    // Subtle cosmic dust nebulae clouds
    this.createNebulaClouds();
  }

  createNebulaClouds() {
    const cloudCount = 1200;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(cloudCount * 3);
    const col = new Float32Array(cloudCount * 3);

    const c1 = new THREE.Color(0x38184c); // Deep cosmic purple
    const c2 = new THREE.Color(0x0a2540); // Deep oceanic teal

    for (let i = 0; i < cloudCount; i++) {
      const r = 120 + Math.random() * 400;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 220;

      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      const mixVal = Math.random();
      const mixed = c1.clone().lerp(c2, mixVal);
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 45,
      vertexColors: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.nebulaPoints = new THREE.Points(geo, mat);
    this.group.add(this.nebulaPoints);
  }

  update(delta, time) {
    if (this.material && this.material.uniforms.uTime) {
      this.material.uniforms.uTime.value = time;
    }
    // Extremely slow cosmic drift
    this.group.rotation.y = time * 0.012;
    this.group.rotation.x = Math.sin(time * 0.008) * 0.04;
  }
}
