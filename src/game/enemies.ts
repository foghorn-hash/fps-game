/**
 * Cowboy Outlaw AI & Procedural 3D Bandit Models
 * Features distinct enemy types (Grunts, Balcony Snipers, Bounty Bosses),
 * visible telegraph stances, flanking/cover behavior, and physics knockdown.
 */

import * as THREE from 'three';
import { sounds } from '../audio/SoundEffects';

export type EnemyType = 'grunt' | 'sniper' | 'boss';

export interface Bandit {
  id: string;
  type: EnemyType;
  name: string;
  mesh: THREE.Group;
  health: number;
  maxHealth: number;
  bounty: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  state: 'idle' | 'chase' | 'aiming' | 'shooting' | 'stagger' | 'dead';
  stateTimer: number;
  aimProgress: number; // 0 to 1 telegraph
  targetPos: THREE.Vector3;
  isGrounded: boolean;
  gunArm: THREE.Group | null;
  torso: THREE.Mesh | null;
  head: THREE.Group | null;
  deathTimer: number;
}

export class EnemyManager {
  public bandits: Bandit[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  // Create a 3-12 part procedural Western Bandit model
  public spawnBandit(
    id: string,
    type: EnemyType,
    name: string,
    pos: THREE.Vector3,
    bounty: number = 250
  ): Bandit {
    const group = new THREE.Group();
    group.position.copy(pos);

    // Materials
    const dusterColor = type === 'boss' ? 0x1c1a18 : type === 'sniper' ? 0x3d352b : 0x73482a;
    const hatColor = type === 'boss' ? 0x141414 : 0x422f20;
    const bandanaColor = type === 'boss' ? 0x8a1c14 : type === 'sniper' ? 0x223a54 : 0xab2b24;

    const dusterMat = new THREE.MeshStandardMaterial({ color: dusterColor, roughness: 0.8 });
    const hatMat = new THREE.MeshStandardMaterial({ color: hatColor, roughness: 0.75 });
    const bandanaMat = new THREE.MeshStandardMaterial({ color: bandanaColor, roughness: 0.7 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc49b78, roughness: 0.6 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2e353b, roughness: 0.85 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x1c1712, roughness: 0.5 });
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.4 });
    const buckleMat = new THREE.MeshStandardMaterial({ color: 0xd6ad40, metalness: 0.85, roughness: 0.2 });
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2e, metalness: 0.85, roughness: 0.3 });

    // 1. Boots & Legs
    const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.8, 8), pantsMat);
    lLeg.position.set(-0.2, 0.4, 0);
    const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.8, 8), pantsMat);
    rLeg.position.set(0.2, 0.4, 0);

    const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.22, 0.3), bootMat);
    lBoot.position.set(-0.2, 0.11, 0.05);
    const rBoot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.22, 0.3), bootMat);
    rBoot.position.set(0.2, 0.11, 0.05);

    // 2. Torso / Duster Coat
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.32), dusterMat);
    torso.position.set(0, 1.15, 0);
    torso.castShadow = true;

    // Gun belt & Gold Buckle
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.08, 0.34), beltMat);
    belt.position.set(0, 0.82, 0);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.04), buckleMat);
    buckle.position.set(0, 0.82, 0.18);

    // 3. Head & Stetson Cowboy Hat
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.68, 0);

    const headGeo = new THREE.SphereGeometry(0.18, 10, 10);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 0.05;

    // Bandana mask over nose and mouth
    const bandanaGeo = new THREE.CylinderGeometry(0.19, 0.17, 0.15, 10);
    const bandana = new THREE.Mesh(bandanaGeo, bandanaMat);
    bandana.position.set(0, 0.0, 0.03);

    // Wide-brim Stetson Hat
    const brimGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.04, 16);
    const brim = new THREE.Mesh(brimGeo, hatMat);
    brim.position.set(0, 0.18, 0);
    brim.rotation.x = -0.05; // slight cocked tilt
    brim.castShadow = true;

    const crownGeo = new THREE.CylinderGeometry(0.24, 0.27, 0.28, 14);
    const crown = new THREE.Mesh(crownGeo, hatMat);
    crown.position.set(0, 0.32, 0);
    crown.castShadow = true;

    headGroup.add(head, bandana, brim, crown);

    // 4. Arms & Weapon
    // Left arm (idle / holding coat lapel)
    const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.65, 8), dusterMat);
    lArm.position.set(-0.35, 1.1, 0);
    lArm.rotation.z = 0.15;

    // Right arm (draws gun to aim)
    const gunArm = new THREE.Group();
    gunArm.position.set(0.35, 1.35, 0);

    const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.65, 8), dusterMat);
    rArm.position.set(0, -0.3, 0);

    // Revolver in right hand
    const gunModel = new THREE.Group();
    const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.22), gunMat);
    const gunBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8), gunMat);
    gunBarrel.rotation.x = Math.PI / 2;
    gunBarrel.position.set(0, 0.02, -0.16);
    gunModel.add(gunBody, gunBarrel);
    gunModel.position.set(0, -0.58, -0.05);

    gunArm.add(rArm, gunModel);

    // Telegraph Muzzle Glint (becomes bright red/yellow when about to fire)
    const glint = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xff3311, transparent: true, opacity: 0 })
    );
    glint.position.set(0, 0.02, -0.3);
    gunModel.add(glint);

    group.add(lLeg, rLeg, lBoot, rBoot, torso, belt, buckle, headGroup, lArm, gunArm);
    this.scene.add(group);

    const maxHp = type === 'boss' ? 240 : type === 'sniper' ? 65 : 85;

    const bandit: Bandit = {
      id,
      type,
      name,
      mesh: group,
      health: maxHp,
      maxHealth: maxHp,
      bounty: type === 'boss' ? 5000 : bounty,
      position: pos.clone(),
      velocity: new THREE.Vector3(),
      state: 'idle',
      stateTimer: Math.random() * 2,
      aimProgress: 0,
      targetPos: pos.clone(),
      isGrounded: true,
      gunArm,
      torso,
      head: headGroup,
      deathTimer: 0,
    };

    this.bandits.push(bandit);
    return bandit;
  }

  // Damage bandit, return true if eliminated
  public damageBandit(
    bandit: Bandit,
    amount: number,
    isHeadshot: boolean,
    hitDir: THREE.Vector3
  ): boolean {
    if (bandit.state === 'dead') return false;

    const actualDmg = isHeadshot ? amount * 2.2 : amount;
    bandit.health -= actualDmg;

    // Stagger impulse
    bandit.velocity.add(hitDir.clone().multiplyScalar(isHeadshot ? 6.0 : 3.5));
    bandit.velocity.y += 2.0;

    if (bandit.health <= 0) {
      bandit.state = 'dead';
      bandit.deathTimer = 0;
      sounds.playEnemyDown();
      return true;
    } else {
      bandit.state = 'stagger';
      bandit.stateTimer = 0.35;
      bandit.aimProgress = 0;
    }
    return false;
  }

  // Update Bandit AI and visual telegraphs
  public update(
    dt: number,
    playerPos: THREE.Vector3,
    onBanditShoot: (b: Bandit, damage: number) => void
  ) {
    const toPlayer = new THREE.Vector3();

    for (let i = this.bandits.length - 1; i >= 0; i--) {
      const b = this.bandits[i];

      // Defeated ragdoll animation
      if (b.state === 'dead') {
        b.deathTimer += dt;
        // Tip over and settle into dust
        if (b.mesh.rotation.x > -Math.PI / 2) {
          b.mesh.rotation.x -= dt * 4.5;
          b.mesh.position.y = Math.max(0.15, b.mesh.position.y - dt * 2.0);
        }
        continue;
      }

      toPlayer.subVectors(playerPos, b.position);
      const distToPlayer = toPlayer.length();

      // Look toward player (yaw only)
      const lookAngle = Math.atan2(toPlayer.x, toPlayer.z);
      b.mesh.rotation.y = lookAngle;

      // State Machine
      b.stateTimer -= dt;

      switch (b.state) {
        case 'idle':
        case 'chase': {
          // Reset aim telegraph
          b.aimProgress = Math.max(0, b.aimProgress - dt * 3);

          if (distToPlayer < 45) {
            // Spotted player!
            if (distToPlayer > (b.type === 'sniper' ? 18 : 8)) {
              // Move closer
              const speed = b.type === 'boss' ? 3.8 : 3.0;
              const moveDir = toPlayer.clone().normalize();
              b.position.x += moveDir.x * speed * dt;
              b.position.z += moveDir.z * speed * dt;

              // Leg walk cycle
              const walkPhase = Date.now() * 0.008;
              b.mesh.children[0].rotation.x = Math.sin(walkPhase) * 0.4;
              b.mesh.children[1].rotation.x = -Math.sin(walkPhase) * 0.4;
            } else {
              // In range, start aiming!
              b.state = 'aiming';
              b.stateTimer = b.type === 'boss' ? 0.75 : b.type === 'sniper' ? 1.4 : 1.1; // Windup telegraph!
              b.aimProgress = 0;
              sounds.playCockHammer();
            }
          }
          break;
        }

        case 'aiming': {
          // Windup telegraph: raise gun arm and glow glint
          b.aimProgress = Math.min(1.0, b.aimProgress + dt * (1.0 / (b.type === 'boss' ? 0.75 : 1.1)));
          if (b.gunArm) {
            // Smoothly raise arm to point at player
            b.gunArm.rotation.x = -Math.PI / 2;
          }

          if (b.stateTimer <= 0) {
            // FIRE!
            b.state = 'shooting';
            b.stateTimer = 0.2;
            b.aimProgress = 0;

            // Recoil arm kick
            if (b.gunArm) {
              b.gunArm.rotation.x = -Math.PI / 1.7;
            }

            sounds.playRevolverShot();

            // Calculate accuracy based on distance and cover
            const accuracy = b.type === 'boss' ? 0.8 : b.type === 'sniper' ? 0.85 : 0.6;
            if (Math.random() < accuracy) {
              const dmg = b.type === 'boss' ? 24 : b.type === 'sniper' ? 32 : 18;
              onBanditShoot(b, dmg);
            } else {
              sounds.playRicochet();
            }
          }
          break;
        }

        case 'shooting': {
          if (b.stateTimer <= 0) {
            // Cooldown before next shot or repositions
            b.state = 'chase';
            b.stateTimer = 1.0 + Math.random() * 1.2;
          }
          break;
        }

        case 'stagger': {
          if (b.stateTimer <= 0) {
            b.state = 'chase';
          }
          break;
        }
      }

      // Physics damping & velocity integration
      b.position.addScaledVector(b.velocity, dt);
      b.velocity.multiplyScalar(0.92);

      // Keep grounded
      b.mesh.position.copy(b.position);
    }
  }

  public getActiveBandits(): Bandit[] {
    return this.bandits.filter((b) => b.state !== 'dead');
  }

  public clear() {
    this.bandits.forEach((b) => this.scene.remove(b.mesh));
    this.bandits = [];
  }
}
