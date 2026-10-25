/**
 * Procedural Particle System for Western FPS
 * High-performance pooled particle bursts for muzzle smoke, sparks, splinters,
 * dust clouds, and dynamite explosions.
 */

import * as THREE from 'three';

interface Particle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  gravity: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;
  private maxParticles = 800;

  private posArray: Float32Array;
  private colArray: Float32Array;

  constructor(scene: THREE.Scene) {
    this.posArray = new Float32Array(this.maxParticles * 3);
    this.colArray = new Float32Array(this.maxParticles * 3);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.posArray, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colArray, 3));

    // Procedural round particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(240, 220, 180, 0.8)');
    gradient.addColorStop(0.7, 'rgba(180, 140, 100, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    this.material = new THREE.PointsMaterial({
      size: 0.35,
      map: texture,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    scene.add(this.points);
  }

  // Muzzle smoke puff at barrel tip
  public emitMuzzleSmoke(pos: THREE.Vector3, dir: THREE.Vector3) {
    for (let i = 0; i < 14; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const spread = 0.15;
      const vel = new THREE.Vector3(
        dir.x * (1.5 + Math.random() * 2) + (Math.random() - 0.5) * spread,
        dir.y * (1.5 + Math.random() * 2) + (Math.random() - 0.5) * spread + 0.3,
        dir.z * (1.5 + Math.random() * 2) + (Math.random() - 0.5) * spread
      );
      this.particles.push({
        pos: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05)),
        vel,
        color: new THREE.Color(0x8a847e), // gray smoke
        size: 0.25,
        alpha: 0.7,
        life: 0.45 + Math.random() * 0.3,
        maxLife: 0.65,
        gravity: -0.4, // smoke rises slowly
      });
    }
  }

  // Dust impact on ground / stone
  public emitDustImpact(pos: THREE.Vector3, normal: THREE.Vector3) {
    for (let i = 0; i < 20; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const vel = new THREE.Vector3(
        normal.x * 2.0 + (Math.random() - 0.5) * 2.5,
        normal.y * 2.0 + Math.random() * 2.5,
        normal.z * 2.0 + (Math.random() - 0.5) * 2.5
      );
      this.particles.push({
        pos: pos.clone(),
        vel,
        color: new THREE.Color(0xbfa57d), // desert sand
        size: 0.28,
        alpha: 0.8,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.7,
        gravity: 4.0,
      });
    }
  }

  // Wood splinters when crate or building hit
  public emitWoodSplinters(pos: THREE.Vector3, normal: THREE.Vector3) {
    for (let i = 0; i < 25; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const vel = new THREE.Vector3(
        normal.x * 3.0 + (Math.random() - 0.5) * 3.5,
        normal.y * 3.0 + Math.random() * 3.5,
        normal.z * 3.0 + (Math.random() - 0.5) * 3.5
      );
      this.particles.push({
        pos: pos.clone(),
        vel,
        color: Math.random() > 0.5 ? new THREE.Color(0x6e4827) : new THREE.Color(0x946b3f),
        size: 0.18,
        alpha: 1.0,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 0.8,
        gravity: 8.0,
      });
    }
  }

  // Sparks when metal or lantern hit
  public emitSparks(pos: THREE.Vector3) {
    for (let i = 0; i < 18; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 5.0,
        Math.random() * 4.5 + 1.0,
        (Math.random() - 0.5) * 5.0
      );
      this.particles.push({
        pos: pos.clone(),
        vel,
        color: new THREE.Color(0xffbf33), // bright fiery spark
        size: 0.15,
        alpha: 1.0,
        life: 0.3 + Math.random() * 0.25,
        maxLife: 0.4,
        gravity: 9.0,
      });
    }
  }

  // Huge explosion burst (TNT / Dynamite)
  public emitExplosion(pos: THREE.Vector3) {
    for (let i = 0; i < 120; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.8 + 0.4,
        (Math.random() - 0.5) * 2
      ).normalize();
      const speed = 4.0 + Math.random() * 10.0;
      const vel = dir.multiplyScalar(speed);

      const isFire = Math.random() < 0.6;
      const color = isFire
        ? (Math.random() > 0.4 ? new THREE.Color(0xff5511) : new THREE.Color(0xffcc22))
        : new THREE.Color(0x443c36);

      this.particles.push({
        pos: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5)),
        vel,
        color,
        size: isFire ? 0.65 : 0.85,
        alpha: 1.0,
        life: 0.7 + Math.random() * 0.8,
        maxLife: 1.2,
        gravity: isFire ? -1.0 : 3.0,
      });
    }
  }

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics update
      p.vel.y -= p.gravity * dt;
      p.pos.addScaledVector(p.vel, dt);

      // Simple ground bounce
      if (p.pos.y < 0.05) {
        p.pos.y = 0.05;
        p.vel.y *= -0.3;
        p.vel.x *= 0.6;
        p.vel.z *= 0.6;
      }
    }

    // Update GPU buffers
    const count = Math.min(this.particles.length, this.maxParticles);
    for (let i = 0; i < count; i++) {
      const p = this.particles[i];
      const i3 = i * 3;
      this.posArray[i3] = p.pos.x;
      this.posArray[i3 + 1] = p.pos.y;
      this.posArray[i3 + 2] = p.pos.z;

      // Fade color with remaining life
      const alpha = p.life / p.maxLife;
      this.colArray[i3] = p.color.r * alpha;
      this.colArray[i3 + 1] = p.color.g * alpha;
      this.colArray[i3 + 2] = p.color.b * alpha;
    }

    // Hide unused points
    for (let i = count; i < this.maxParticles; i++) {
      const i3 = i * 3;
      this.posArray[i3 + 1] = -9999;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }
}
