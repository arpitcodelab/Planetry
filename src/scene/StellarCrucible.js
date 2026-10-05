import * as THREE from 'three';

export class StellarCrucible {
  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(28, 5, -35); // Positioned in 3D scene space for Act II
    this.init();
  }

  init() {
    // 1. Procedural Plasma Star with Noise Vertex Displacement
    const starGeo = new THREE.IcosahedronGeometry(4.8, 32);

    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uTime;

      // Simplex 3D noise approximation
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
        vNormal = normal;
        vPosition = position;
        
        // Dynamic turbulent surface displacement
        float displacement = snoise(position * 0.45 + vec3(uTime * 0.4)) * 0.42;
        displacement += snoise(position * 1.2 - vec3(uTime * 0.8)) * 0.18;
        
        vec3 newPos = position + normal * displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uTime;

      void main() {
        // Multi-tier thermal palette
        vec3 cCore = vec3(1.0, 0.98, 0.9);   // Pure white-yellow heat
        vec3 cMid = vec3(1.0, 0.55, 0.05);   // Blazing solar amber
        vec3 cEdge = vec3(0.9, 0.08, 0.02);  // Relativistic deep red plasma
        
        float dist = length(vPosition);
        float pulse = sin(dist * 2.0 - uTime * 3.0) * 0.5 + 0.5;
        
        vec3 color = mix(cMid, cCore, pulse * 0.7);
        // Rim thermal dissipation
        float rim = 1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0);
        color = mix(color, cEdge, pow(rim, 2.5));

        gl_FragColor = vec4(color * 1.4, 1.0);
      }
    `;

    this.starMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 }
      }
    });

    this.starMesh = new THREE.Mesh(starGeo, this.starMaterial);
    this.group.add(this.starMesh);

    // 2. High-Energy Corona Halo
    const coronaGeo = new THREE.SphereGeometry(5.8, 32, 32);
    const coronaMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform float uTime;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.8);
          float flicker = 0.9 + 0.1 * sin(uTime * 5.0);
          vec3 corona = vec3(1.0, 0.65, 0.1) * intensity * flicker * 2.5;
          gl_FragColor = vec4(corona, intensity);
        }
      `,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.coronaMaterial = coronaMat;
    this.coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    this.group.add(this.coronaMesh);

    // 3. Relativistic Plasma Jets (North & South Poles)
    this.createRelativisticJets();

    // 4. Fiery Orbiting Torus of Solar Flares
    this.createSolarRings();
  }

  createRelativisticJets() {
    const count = 1200;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color(0xffffff);
    const c2 = new THREE.Color(0xff8800);
    const c3 = new THREE.Color(0x7928ca);

    for (let i = 0; i < count; i++) {
      const sign = i % 2 === 0 ? 1 : -1;
      const height = Math.random() * 22;
      const spread = (height * 0.12) * (Math.random() - 0.5);
      const angle = Math.random() * Math.PI * 2;

      pos[i * 3] = Math.cos(angle) * spread;
      pos[i * 3 + 1] = sign * (4.5 + height);
      pos[i * 3 + 2] = Math.sin(angle) * spread;

      vel[i * 3 + 1] = sign * (12 + Math.random() * 16);

      const t = height / 22;
      const col = t < 0.4 ? c1.clone().lerp(c2, t * 2.5) : c2.clone().lerp(c3, (t - 0.4) * 1.66);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.jetPositions = pos;
    this.jetVelocities = vel;
    this.jetGeo = geo;

    const mat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.jetPoints = new THREE.Points(geo, mat);
    this.group.add(this.jetPoints);
  }

  createSolarRings() {
    const ringGeo = new THREE.TorusGeometry(8.5, 0.08, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffa020,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.ring1 = new THREE.Mesh(ringGeo, ringMat);
    this.ring1.rotation.x = Math.PI / 2.3;
    this.group.add(this.ring1);

    const ringGeo2 = new THREE.TorusGeometry(11.2, 0.05, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    this.ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    this.ring2.rotation.x = Math.PI / 1.8;
    this.ring2.rotation.y = 0.4;
    this.group.add(this.ring2);
  }

  update(delta, time) {
    if (this.starMaterial && this.starMaterial.uniforms.uTime) {
      this.starMaterial.uniforms.uTime.value = time;
    }
    if (this.coronaMaterial && this.coronaMaterial.uniforms.uTime) {
      this.coronaMaterial.uniforms.uTime.value = time;
    }

    // Animate jet particles
    if (this.jetPositions) {
      const pos = this.jetPositions;
      const vel = this.jetVelocities;
      const count = pos.length / 3;

      for (let i = 0; i < count; i++) {
        const sign = i % 2 === 0 ? 1 : -1;
        pos[i * 3 + 1] += vel[i * 3 + 1] * delta;
        // Recycle particles when beyond height threshold
        if (Math.abs(pos[i * 3 + 1]) > 28) {
          pos[i * 3 + 1] = sign * 4.6;
          const angle = Math.random() * Math.PI * 2;
          const spread = Math.random() * 0.4;
          pos[i * 3] = Math.cos(angle) * spread;
          pos[i * 3 + 2] = Math.sin(angle) * spread;
        }
      }
      this.jetGeo.attributes.position.needsUpdate = true;
    }

    // Rotate rings
    if (this.ring1) this.ring1.rotation.z += delta * 0.4;
    if (this.ring2) this.ring2.rotation.z -= delta * 0.25;

    this.group.rotation.y = time * 0.08;
  }
}
