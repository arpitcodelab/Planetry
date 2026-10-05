import * as THREE from 'three';

export class Singularity {
  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0);
    this.shards = [];
    this.init();
  }

  init() {
    // 1. Schwarzschild Black Hole Event Horizon
    const coreGeo = new THREE.SphereGeometry(4.2, 64, 64);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.group.add(this.coreMesh);

    // 2. Gravitational Lensing Fresnel Halo (Einstein Ring)
    const haloGeo = new THREE.SphereGeometry(4.65, 64, 64);
    const haloVertexShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const haloFragmentShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      uniform vec3 uColor;
      uniform float uTime;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        
        // Edge Fresnel glow
        float fresnel = 1.0 - dot(normal, viewDir);
        fresnel = pow(fresnel, 3.2);

        // Subtle chromatic energy pulsation
        float pulse = 0.85 + 0.15 * sin(uTime * 1.5);
        vec3 glow = uColor * fresnel * pulse * 2.8;

        gl_FragColor = vec4(glow, fresnel * 0.95);
      }
    `;

    this.haloMaterial = new THREE.ShaderMaterial({
      vertexShader: haloVertexShader,
      fragmentShader: haloFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color(0xa8c5ff) }, // Ethereal icy-blue/violet
        uTime: { value: 0 }
      },
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.haloMesh = new THREE.Mesh(haloGeo, this.haloMaterial);
    this.group.add(this.haloMesh);

    // 3. Accretion Particle Torus
    this.createAccretionSwirl();

    // 4. Floating Monolithic Geometric Shards
    this.createMonolithicShards();
  }

  createAccretionSwirl() {
    const particleCount = 2800;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const angles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);

    const innerRadius = 5.2;
    const outerRadius = 14.5;

    const cInner = new THREE.Color(0xffffff); // White-hot inner ring
    const cMid = new THREE.Color(0x38bdf8);   // Cyan
    const cOuter = new THREE.Color(0x7c3aed); // Deep violet outer

    for (let i = 0; i < particleCount; i++) {
      const norm = Math.pow(Math.random(), 0.7);
      const r = innerRadius + norm * (outerRadius - innerRadius);
      const theta = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * (0.8 + norm * 1.2);

      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = r * Math.sin(theta);

      angles[i] = theta;
      radii[i] = r;
      // Closer particles orbit much faster (Keplerian physics simulation)
      speeds[i] = 1.8 / Math.sqrt(r);

      const color = norm < 0.25 
        ? cInner.clone().lerp(cMid, norm * 4) 
        : cMid.clone().lerp(cOuter, (norm - 0.25) * 1.33);

      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.swirlAngles = angles;
    this.swirlRadii = radii;
    this.swirlSpeeds = speeds;
    this.swirlPositions = pos;
    this.swirlGeo = geo;

    const mat = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.swirlPoints = new THREE.Points(geo, mat);
    // Tilt accretion disk for dramatic cinematic slant
    this.swirlPoints.rotation.x = THREE.MathUtils.degToRad(32);
    this.swirlPoints.rotation.z = THREE.MathUtils.degToRad(-15);
    this.group.add(this.swirlPoints);
  }

  createMonolithicShards() {
    const shardCount = 18;
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x0f1118,
      roughness: 0.15,
      metalness: 0.95,
      wireframe: false
    });

    for (let i = 0; i < shardCount; i++) {
      const height = 1.2 + Math.random() * 2.8;
      const width = 0.3 + Math.random() * 0.6;
      const geo = new THREE.CylinderGeometry(width * 0.6, width, height, 4);
      const mesh = new THREE.Mesh(geo, shardMat);

      const dist = 9 + Math.random() * 10;
      const angle = (i / shardCount) * Math.PI * 2 + Math.random() * 0.5;
      const y = (Math.random() - 0.5) * 8;

      mesh.position.set(Math.cos(angle) * dist, y, Math.sin(angle) * dist);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      this.shards.push({
        mesh,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.6,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 0.5
        },
        orbitAngle: angle,
        orbitDist: dist,
        orbitSpeed: 0.08 / Math.sqrt(dist)
      });

      this.group.add(mesh);
    }
  }

  update(delta, time) {
    if (this.haloMaterial && this.haloMaterial.uniforms.uTime) {
      this.haloMaterial.uniforms.uTime.value = time;
    }

    // Animate swirl particles along their Keplerian orbits
    if (this.swirlGeo && this.swirlPositions) {
      const pos = this.swirlPositions;
      const angles = this.swirlAngles;
      const radii = this.swirlRadii;
      const speeds = this.swirlSpeeds;
      const count = angles.length;

      for (let i = 0; i < count; i++) {
        angles[i] += speeds[i] * delta * 1.5;
        const r = radii[i];
        pos[i * 3] = r * Math.cos(angles[i]);
        pos[i * 3 + 2] = r * Math.sin(angles[i]);
      }
      this.swirlGeo.attributes.position.needsUpdate = true;
    }

    // Tumble shards in zero-G
    this.shards.forEach((s) => {
      s.mesh.rotation.x += s.rotSpeed.x * delta;
      s.mesh.rotation.y += s.rotSpeed.y * delta;
      s.mesh.rotation.z += s.rotSpeed.z * delta;

      s.orbitAngle += s.orbitSpeed * delta;
      s.mesh.position.x = Math.cos(s.orbitAngle) * s.orbitDist;
      s.mesh.position.z = Math.sin(s.orbitAngle) * s.orbitDist;
    });

    // Slow organic precession
    this.group.rotation.y = time * 0.04;
  }
}
