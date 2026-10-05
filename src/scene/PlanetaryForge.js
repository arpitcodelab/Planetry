import * as THREE from 'three';

export class PlanetaryForge {
  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(-25, -2, -75); // Scene coordinates for Act III
    this.asteroids = [];
    this.init();
  }

  init() {
    // 1. Primordial Molten Planet Core
    const planetGeo = new THREE.SphereGeometry(5.2, 64, 64);
    
    // Shader with continental noise, magma trenches, and glowing rifts
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      uniform float uTime;

      // Fast procedural hash noise
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                   mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p *= 2.05;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uvCoord = vUv * 8.0;
        float n = fbm(uvCoord + vec2(uTime * 0.02, 0.0));
        
        // Basalt oceanic crust vs glowing geothermal magma rifts
        vec3 cBasalt = vec3(0.06, 0.08, 0.12);    // Dark mineral stone
        vec3 cContinent = vec3(0.12, 0.22, 0.32); // Oceanic shelf
        vec3 cLava = vec3(1.0, 0.28, 0.02);       // Molten magma
        vec3 cLavaCore = vec3(1.0, 0.85, 0.3);   // Intense yellow-white thermal fissure

        float rift = smoothstep(0.48, 0.54, n) * (1.0 - smoothstep(0.54, 0.60, n));
        vec3 surface = mix(cBasalt, cContinent, smoothstep(0.3, 0.7, n));
        
        // Add pulsating geothermal veins
        float pulse = 0.8 + 0.2 * sin(uTime * 2.0 + vPosition.x * 3.0);
        vec3 lavaGlow = mix(cLava, cLavaCore, rift * 1.8) * rift * pulse * 4.0;
        
        vec3 finalColor = surface + lavaGlow;

        // Diffuse shading
        vec3 lightDir = normalize(vec3(1.5, 1.0, 1.2));
        float diff = max(dot(vNormal, lightDir), 0.05);

        gl_FragColor = vec4(finalColor * diff + lavaGlow * 0.5, 1.0);
      }
    `;

    this.planetMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 }
      }
    });

    this.planetMesh = new THREE.Mesh(planetGeo, this.planetMaterial);
    this.group.add(this.planetMesh);

    // 2. Cyan Rayleigh Atmospheric Scattering Glow
    const atmoGeo = new THREE.SphereGeometry(5.75, 48, 48);
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float fresnel = pow(1.0 - dot(vNormal, vec3(0, 0, 1.0)), 2.6);
          vec3 atmoColor = vec3(0.0, 0.85, 1.0) * fresnel * 1.8;
          gl_FragColor = vec4(atmoColor, fresnel * 0.85);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    this.group.add(this.atmoMesh);

    // 3. Planetary Asteroid Belt
    this.createAsteroidBelt();

    // 4. Glowing Magnetic Field Lines
    this.createMagneticFieldLines();
  }

  createAsteroidBelt() {
    const count = 350;
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.85,
      metalness: 0.2
    });

    const innerR = 7.5;
    const outerR = 13.8;

    for (let i = 0; i < count; i++) {
      const scale = 0.12 + Math.random() * 0.45;
      const geo = new THREE.DodecahedronGeometry(scale, 1);
      const mesh = new THREE.Mesh(geo, asteroidMat);

      const r = innerR + Math.random() * (outerR - innerR);
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 1.6;

      mesh.position.set(r * Math.cos(theta), y, r * Math.sin(theta));
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      this.asteroids.push({
        mesh,
        orbitRadius: r,
        orbitAngle: theta,
        orbitSpeed: 0.15 / Math.sqrt(r),
        rotSpeed: (Math.random() - 0.5) * 1.5
      });

      this.group.add(mesh);
    }
  }

  createMagneticFieldLines() {
    this.fieldRings = [];
    const count = 4;
    for (let i = 0; i < count; i++) {
      const radius = 6.8 + i * 1.4;
      const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius * 1.35,
        0, 2 * Math.PI,
        false, 0
      );
      const points = curve.getPoints(80);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending
      });
      const line = new THREE.Line(geo, mat);
      line.rotation.y = (i * Math.PI) / count;
      line.rotation.x = Math.PI / 2;
      this.fieldRings.push(line);
      this.group.add(line);
    }
  }

  update(delta, time) {
    if (this.planetMaterial && this.planetMaterial.uniforms.uTime) {
      this.planetMaterial.uniforms.uTime.value = time;
    }

    // Orbit asteroid belt
    this.asteroids.forEach(a => {
      a.orbitAngle += a.orbitSpeed * delta;
      a.mesh.position.x = Math.cos(a.orbitAngle) * a.orbitRadius;
      a.mesh.position.z = Math.sin(a.orbitAngle) * a.orbitRadius;
      a.mesh.rotation.x += a.rotSpeed * delta;
      a.mesh.rotation.y += a.rotSpeed * delta;
    });

    // Slow planetary axial rotation
    this.planetMesh.rotation.y = time * 0.05;

    // Field ring gentle resonance
    this.fieldRings.forEach((ring, idx) => {
      ring.rotation.z = Math.sin(time * 0.5 + idx) * 0.1;
    });

    this.group.rotation.y = time * 0.02;
  }
}
