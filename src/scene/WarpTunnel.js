import * as THREE from 'three';

export class WarpTunnel {
  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(0, 0, -175); // Scene coordinates for Act V
    this.tunnelRings = [];
    this.warpSpeed = 1.0;
    this.init();
  }

  init() {
    // 1. Warp Streak Particle Filaments
    const streakCount = 1800;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(streakCount * 3);
    const col = new Float32Array(streakCount * 3);
    const speed = new Float32Array(streakCount);

    const c1 = new THREE.Color(0xffffff); // Core warp white
    const c2 = new THREE.Color(0x38bdf8); // Sky blue
    const c3 = new THREE.Color(0xa855f7); // Hyper violet

    for (let i = 0; i < streakCount; i++) {
      const radius = 3.5 + Math.random() * 22;
      const angle = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 160;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = z;

      speed[i] = 25 + Math.random() * 45;

      const mixVal = Math.random();
      const colChoice = mixVal < 0.5 ? c1.clone().lerp(c2, mixVal * 2) : c2.clone().lerp(c3, (mixVal - 0.5) * 2);
      col[i * 3] = colChoice.r;
      col[i * 3 + 1] = colChoice.g;
      col[i * 3 + 2] = colChoice.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.streakPositions = pos;
    this.streakSpeeds = speed;
    this.streakGeo = geo;

    const mat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.streakPoints = new THREE.Points(geo, mat);
    this.group.add(this.streakPoints);

    // 2. Geometric Gateway Portal Rings along Z-axis
    const ringCount = 12;
    for (let i = 0; i < ringCount; i++) {
      const r = 8.5 + Math.sin(i * 0.5) * 1.5;
      const ringGeo = new THREE.TorusGeometry(r, 0.08, 8, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00f0ff : 0xd946ef,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = -70 + i * 14;
      this.tunnelRings.push(ring);
      this.group.add(ring);
    }

    // 3. Central Singularity Gate Core (Prismatic Lens)
    const portalGeo = new THREE.IcosahedronGeometry(3.5, 2);
    const portalMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
      thickness: 2.0,
      specularIntensity: 1.0,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.3
    });
    this.portalCore = new THREE.Mesh(portalGeo, portalMat);
    this.portalCore.position.z = -75;
    this.group.add(this.portalCore);
  }

  setWarpIntensity(val) {
    this.warpSpeed = THREE.MathUtils.lerp(this.warpSpeed, val, 0.1);
  }

  update(delta, time) {
    // Stream particles through the warp corridor
    if (this.streakPositions) {
      const pos = this.streakPositions;
      const spd = this.streakSpeeds;
      const count = pos.length / 3;

      for (let i = 0; i < count; i++) {
        pos[i * 3 + 2] += spd[i] * delta * this.warpSpeed;
        if (pos[i * 3 + 2] > 70) {
          pos[i * 3 + 2] = -90;
        }
      }
      this.streakGeo.attributes.position.needsUpdate = true;
    }

    // Rotate and pulse portal rings
    this.tunnelRings.forEach((ring, idx) => {
      ring.rotation.z += (idx % 2 === 0 ? 0.3 : -0.3) * delta;
      const scale = 1.0 + 0.08 * Math.sin(time * 3.0 + idx);
      ring.scale.set(scale, scale, scale);
    });

    if (this.portalCore) {
      this.portalCore.rotation.x = time * 0.4;
      this.portalCore.rotation.y = time * 0.6;
    }
  }
}
