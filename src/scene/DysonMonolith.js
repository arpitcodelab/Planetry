import * as THREE from 'three';

export class DysonMonolith {
  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(20, 2, -120); // Positioned for Act IV
    this.rings = [];
    this.nodes = [];
    this.init();
  }

  init() {
    // 1. Central Levitating Monolithic Hyper-Crystal
    const crystalGeo = new THREE.OctahedronGeometry(4.2, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.98,
      roughness: 0.08,
      wireframe: false
    });
    this.crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    this.group.add(this.crystalMesh);

    // Glowing Wireframe Lattice around the crystal
    const wireGeo = new THREE.OctahedronGeometry(4.35, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6, // Violet
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    this.wireMesh = new THREE.Mesh(wireGeo, wireMat);
    this.group.add(this.wireMesh);

    // 2. Concentric Dyson Megastructure Rings
    const ringSpecs = [
      { r: 7.2, tube: 0.12, col: 0x00f0ff, rotX: 0.3, rotY: 0.2, speed: 0.25 },
      { r: 9.8, tube: 0.15, col: 0xa855f7, rotX: 1.1, rotY: 0.7, speed: -0.18 },
      { r: 12.6, tube: 0.14, col: 0x38bdf8, rotX: 2.1, rotY: 1.4, speed: 0.12 },
      { r: 15.4, tube: 0.09, col: 0xff007f, rotX: 0.8, rotY: 2.2, speed: -0.09 }
    ];

    ringSpecs.forEach(spec => {
      const geo = new THREE.TorusGeometry(spec.r, spec.tube, 16, 120);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.2
      });
      const mesh = new THREE.Mesh(geo, mat);

      // Accent energy ring glowing overlay
      const glowGeo = new THREE.TorusGeometry(spec.r, spec.tube * 1.25, 8, 80);
      const glowMat = new THREE.MeshBasicMaterial({
        color: spec.col,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      mesh.add(glowMesh);

      mesh.rotation.x = spec.rotX;
      mesh.rotation.y = spec.rotY;

      this.rings.push({
        mesh,
        speed: spec.speed,
        baseRot: { x: spec.rotX, y: spec.rotY }
      });
      this.group.add(mesh);
    });

    // 3. Laser Interferometry Light Beams
    this.createLaserBeams();

    // 4. Orbiting Telemetry Sensor Nodes
    this.createSensorNodes();
  }

  createLaserBeams() {
    this.laserGroup = new THREE.Group();
    const beamCount = 6;
    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * Math.PI * 2;
      const length = 26;
      const geo = new THREE.CylinderGeometry(0.04, 0.04, length, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00f0ff : 0xec4899,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      const beam = new THREE.Mesh(geo, mat);
      beam.position.set(Math.cos(angle) * 8, 0, Math.sin(angle) * 8);
      beam.rotation.z = Math.PI / 2;
      beam.rotation.y = angle;
      this.laserGroup.add(beam);
    }
    this.group.add(this.laserGroup);
  }

  createSensorNodes() {
    const nodeCount = 14;
    const nodeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1
    });

    for (let i = 0; i < nodeCount; i++) {
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      const dist = 8 + Math.random() * 8;
      const angle = (i / nodeCount) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * dist, (Math.random() - 0.5) * 4, Math.sin(angle) * dist);

      this.nodes.push({
        mesh,
        angle,
        dist,
        speed: (Math.random() * 0.4 + 0.2) * (i % 2 === 0 ? 1 : -1)
      });
      this.group.add(mesh);
    }
  }

  update(delta, time) {
    // Breathing levitation for central crystal
    this.crystalMesh.rotation.y = time * 0.15;
    this.crystalMesh.rotation.x = Math.sin(time * 0.2) * 0.2;
    this.crystalMesh.position.y = Math.sin(time * 0.8) * 0.4;

    this.wireMesh.rotation.y = -time * 0.2;
    this.wireMesh.rotation.z = time * 0.1;
    this.wireMesh.position.y = this.crystalMesh.position.y;

    // Rotate concentric Dyson rings with gyroscopic motion
    this.rings.forEach((r, idx) => {
      r.mesh.rotation.z += r.speed * delta;
      r.mesh.rotation.y += (r.speed * 0.5) * delta;
    });

    // Rotate laser grid
    if (this.laserGroup) {
      this.laserGroup.rotation.y = -time * 0.1;
    }

    // Orbit sensor nodes
    this.nodes.forEach(n => {
      n.angle += n.speed * delta;
      n.mesh.position.x = Math.cos(n.angle) * n.dist;
      n.mesh.position.z = Math.sin(n.angle) * n.dist;
      n.mesh.rotation.x += delta * 2.0;
      n.mesh.rotation.y += delta * 1.5;
    });

    this.group.rotation.y = time * 0.03;
  }
}
