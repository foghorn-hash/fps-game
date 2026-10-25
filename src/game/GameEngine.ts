/**
 * Dust & Lead - 3D Cowboy FPS Game Engine
 * Coordinates Three.js, Cannon-es Physics, Procedural Western Town, Weapon Viewmodels,
 * Outlaw AI, Dynamic Rigid Bodies, and Low-Latency Input.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { sounds } from '../audio/SoundEffects';
import { Bandit, EnemyManager } from './enemies';
import { ParticleSystem } from './particles';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { WeaponManager, WeaponType } from './weapons';
import { TownWorld, WorldGenerator } from './worldGenerator';

export interface GameStateHUD {
  health: number;
  maxHealth: number;
  weapon: WeaponType;
  weaponName: string;
  ammo: number;
  magSize: number;
  reserveAmmo: number;
  isReloading: boolean;
  score: number;
  bountyTarget: string;
  banditsRemaining: number;
  totalBandits: number;
  wave: number;
  isHit: boolean;
  isHeadshotHit: boolean;
  gameStatus: 'title' | 'playing' | 'paused' | 'victory' | 'gameover';
}

export class GameEngine {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public physics: PhysicsWorld;
  public weapons: WeaponManager;
  public enemies: EnemyManager;
  public particles: ParticleSystem;
  public town: TownWorld | null = null;

  // Game Play State
  public status: 'title' | 'playing' | 'paused' | 'victory' | 'gameover' = 'title';
  public playerHealth = 100;
  public playerMaxHealth = 100;
  public score = 0;
  public currentWave = 1;
  public totalBandits = 8;
  public sensitivity = 0.0022;

  // Player Physics & First Person Kinematics
  public playerPos = new THREE.Vector3(0, 1.7, 12);
  public playerVel = new THREE.Vector3();
  public cameraYaw = 0;
  public cameraPitch = 0;
  public isGrounded = true;
  public isSprinting = false;
  public isAimingADS = false;

  // Camera Shake & Hitstop
  public cameraShake = new THREE.Vector3();
  public shakeTrauma = 0;
  public hitstopTimer = 0;
  public hitMarkerTimer = 0;
  public isHeadshot = false;
  public playerDamageFlash = 0;

  // Input state
  private keys: Record<string, boolean> = {};
  private walkTime = 0;
  private isPointerLocked = false;
  private animFrameId: number = 0;
  private lastTime: number = 0;

  // HUD callback for React
  public onHudUpdate: ((state: GameStateHUD) => void) | null = null;

  // Cinematic title camera
  private titleCamAngle = 0;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Detect software WebGL per Three.js directives
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Three.js Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd29762); // Sunbaked dusty Western sky
    this.scene.fog = new THREE.FogExp2(0xd29762, 0.014); // Canyon atmospheric horizon fade

    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    this.scene.add(this.camera);

    // 4. Studio Environment Reflection Map
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig (Warm key light vs cool ambient fill)
    // Key Sun Light
    const sunLight = new THREE.DirectionalLight(0xffecd0, 2.4);
    sunLight.position.set(45, 60, -35);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 180;
    const shadowD = 50;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    this.scene.add(sunLight);

    // Cool blue sky / warm ground bounce fill
    const hemiLight = new THREE.HemisphereLight(0x7fb3d5, 0x935b33, 0.85);
    this.scene.add(hemiLight);

    // 6. Subsystems
    this.physics = new PhysicsWorld();
    this.weapons = new WeaponManager();
    this.enemies = new EnemyManager(this.scene);
    this.particles = new ParticleSystem(this.scene);

    // Attach weapon viewmodel to camera
    this.camera.add(this.weapons.viewmodelGroup);

    // 7. Procedural World Generation
    this.town = WorldGenerator.buildWesternTown(this.scene, this.physics);

    // 8. Event Listeners
    this.setupInputs();
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);

    // Start game loop
    this.lastTime = performance.now();
    this.tick = this.tick.bind(this);
    this.animFrameId = requestAnimationFrame(this.tick);
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Single action presses
      if (e.code === 'KeyR' && this.status === 'playing') {
        this.weapons.reload();
      }
      if (e.code === 'Digit1') this.weapons.switchWeapon('revolver');
      if (e.code === 'Digit2') this.weapons.switchWeapon('repeater');
      if (e.code === 'Digit3') this.weapons.switchWeapon('shotgun');
      if (e.code === 'Digit4' || e.code === 'KeyG') this.throwDynamite();

      // Escape toggles pause
      if (e.code === 'Escape' && (this.status === 'playing' || this.status === 'paused')) {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('blur', () => {
      this.keys = {};
    });

    // Pointer lock & mouse look
    this.renderer.domElement.addEventListener('click', () => {
      if (this.status === 'playing' && !this.isPointerLocked) {
        this.renderer.domElement.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
      if (!this.isPointerLocked && this.status === 'playing') {
        this.status = 'paused';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isPointerLocked || this.status !== 'playing') return;

      const sens = this.isAimingADS ? this.sensitivity * 0.55 : this.sensitivity;
      this.cameraYaw -= e.movementX * sens;
      this.cameraPitch -= e.movementY * sens;

      // Clamp pitch to avoid flip (-85° to +85°)
      this.cameraPitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.cameraPitch));
    });

    window.addEventListener('mousedown', (e) => {
      if (!this.isPointerLocked || this.status !== 'playing') return;
      if (e.button === 0) {
        // LMB: Shoot
        this.handlePlayerShoot();
      } else if (e.button === 2) {
        // RMB: Aim Down Sights (ADS)
        this.isAimingADS = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.isAimingADS = false;
      }
    });

    window.addEventListener('wheel', (e) => {
      if (this.status !== 'playing') return;
      const weaponList: WeaponType[] = ['revolver', 'repeater', 'shotgun', 'dynamite'];
      const curIndex = weaponList.indexOf(this.weapons.currentWeaponType);
      const nextIndex = e.deltaY > 0 ? (curIndex + 1) % weaponList.length : (curIndex - 1 + weaponList.length) % weaponList.length;
      this.weapons.switchWeapon(weaponList[nextIndex]);
    });

    // Prevent context menu on right click
    this.renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  public startGame() {
    this.status = 'playing';
    this.playerHealth = 100;
    this.score = 0;
    this.currentWave = 1;
    this.playerPos.set(0, 1.7, 10);
    this.playerVel.set(0, 0, 0);
    this.cameraYaw = 0;
    this.cameraPitch = 0;

    // Reset weapons
    this.weapons.weapons.revolver.ammo = 6;
    this.weapons.weapons.revolver.reserveAmmo = 48;
    this.weapons.weapons.repeater.ammo = 14;
    this.weapons.weapons.repeater.reserveAmmo = 70;
    this.weapons.weapons.shotgun.ammo = 2;
    this.weapons.weapons.shotgun.reserveAmmo = 24;
    this.weapons.weapons.dynamite.ammo = 4;
    this.weapons.switchWeapon('revolver');

    // Spawn wave 1 bandits
    this.spawnWave(1);

    // Request pointer lock
    this.renderer.domElement.requestPointerLock();
  }

  public togglePause() {
    if (this.status === 'playing') {
      this.status = 'paused';
      if (document.exitPointerLock) document.exitPointerLock();
    } else if (this.status === 'paused') {
      this.status = 'playing';
      this.renderer.domElement.requestPointerLock();
    }
  }

  public spawnWave(wave: number) {
    this.enemies.clear();
    const spawnPoints = this.town?.spawnPoints || [new THREE.Vector3(0, 0, -20)];

    const outlawNames = [
      'Black-Hat Jack', 'Rattlesnake Pete', 'Wild Bill', 'Cole Younger',
      'Calamity Dan', 'Deadeye McGee', 'Buckskin Frank', 'El Diablo'
    ];

    const banditCount = 5 + wave * 2;
    this.totalBandits = banditCount;

    for (let i = 0; i < banditCount; i++) {
      const sp = spawnPoints[i % spawnPoints.length].clone();
      sp.x += (Math.random() - 0.5) * 6;
      sp.z += (Math.random() - 0.5) * 6;

      const isBoss = i === 0 && wave >= 2;
      const isSniper = i % 3 === 2;
      const type = isBoss ? 'boss' : isSniper ? 'sniper' : 'grunt';
      const name = isBoss ? 'El Diablo (Desperado)' : outlawNames[i % outlawNames.length];

      this.enemies.spawnBandit(`bandit_${wave}_${i}`, type, name, sp);
    }
  }

  // Player shooting mechanics with raycasting, physics impulses & hit feedback
  private handlePlayerShoot() {
    const now = performance.now() / 1000;
    const curWep = this.weapons.getCurrent();

    if (curWep.id === 'dynamite') {
      this.throwDynamite();
      return;
    }

    if (!this.weapons.shoot(now)) return;

    // Camera recoil kick
    this.addCameraShake(curWep.recoilKick * 1.4);
    this.cameraPitch += curWep.recoilKick * 0.35;

    // Barrel smoke particles
    const shootDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const barrelPos = this.camera.position.clone().add(shootDir.clone().multiplyScalar(0.7));
    this.particles.emitMuzzleSmoke(barrelPos, shootDir);

    // Fire bullets / buckshot pellets
    const pelletCount = curWep.pellets;
    const raycaster = new THREE.Raycaster();

    for (let p = 0; p < pelletCount; p++) {
      // Calculate spread cone
      const spreadX = (Math.random() - 0.5) * curWep.spread * (this.isAimingADS ? 0.4 : 1.0);
      const spreadY = (Math.random() - 0.5) * curWep.spread * (this.isAimingADS ? 0.4 : 1.0);
      const pelletDir = shootDir.clone();
      pelletDir.x += spreadX;
      pelletDir.y += spreadY;
      pelletDir.normalize();

      raycaster.set(this.camera.position, pelletDir);
      raycaster.far = 120;

      // 1. Raycast against Outlaw enemies
      const activeBandits = this.enemies.getActiveBandits();
      let hitEnemy = false;

      for (const bandit of activeBandits) {
        const hits = raycaster.intersectObjects(bandit.mesh.children, true);
        if (hits.length > 0) {
          const hit = hits[0];
          // Check if headshot
          const isHead = hit.point.y > bandit.position.y + 1.5;
          const eliminated = this.enemies.damageBandit(bandit, curWep.damage, isHead, pelletDir);

          this.hitMarkerTimer = 0.22;
          this.isHeadshot = isHead;
          sounds.playHitMarker(isHead);

          // Hitstop on heavy hits or headshots
          if (isHead || eliminated) {
            this.hitstopTimer = 0.06; // 60ms visceral hitstop!
          }

          if (eliminated) {
            this.score += bandit.bounty;
            this.particles.emitExplosion(hit.point); // dust & defeat burst
          }

          this.particles.emitDustImpact(hit.point, hit.face ? hit.face.normal : new THREE.Vector3(0, 1, 0));
          hitEnemy = true;
          break;
        }
      }

      if (hitEnemy) continue;

      // 2. Raycast against Physical Rigid Bodies (Crates, TNT Kegs, Barrels)
      let hitRigidBody = false;
      this.physics.objects.forEach((obj) => {
        if (hitRigidBody) return;
        const hits = raycaster.intersectObject(obj.mesh, true);
        if (hits.length > 0) {
          const hit = hits[0];
          hitRigidBody = true;

          // Apply kinetic impulse to rigid body
          this.physics.applyBulletImpulse(obj.body, hit.point, pelletDir, curWep.impulseForce);

          if (obj.type === 'tnt') {
            // Bullet ignited TNT keg!
            sounds.playFuseFizzle();
            setTimeout(() => {
              this.detonateExplosion(obj.body.position);
              this.physics.removeObject(obj.id);
              this.scene.remove(obj.mesh);
            }, 300);
          } else {
            sounds.playWoodImpact();
            this.particles.emitWoodSplinters(hit.point, hit.face ? hit.face.normal : new THREE.Vector3(0, 1, 0));
          }
        }
      });

      if (hitRigidBody) continue;

      // 3. Raycast against Ground & World buildings
      if (this.town) {
        const worldHits = raycaster.intersectObjects(this.town.group.children, true);
        if (worldHits.length > 0) {
          const hit = worldHits[0];
          const normal = hit.face ? hit.face.normal : new THREE.Vector3(0, 1, 0);
          this.particles.emitDustImpact(hit.point, normal);
          sounds.playWoodImpact();
        }
      }
    }

    // Check wave victory
    if (this.enemies.getActiveBandits().length === 0) {
      this.currentWave++;
      sounds.playVictorySting();
      if (this.currentWave > 3) {
        this.status = 'victory';
        if (document.exitPointerLock) document.exitPointerLock();
        try {
          window.parent.postMessage({
            type: 'DUST_AND_LEAD_SCORE',
            score: this.score,
            wave: this.currentWave,
            name: 'Marshal',
          }, '*');
        } catch (e) {}
      } else {
        setTimeout(() => this.spawnWave(this.currentWave), 2500);
      }
    }
  }

  // Throw a dynamic physical Dynamite stick
  public throwDynamite() {
    const dynWep = this.weapons.weapons.dynamite;
    if (dynWep.ammo <= 0) return;
    dynWep.ammo--;
    sounds.playFuseFizzle();

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const throwPos = this.camera.position.clone().add(forward.clone().multiplyScalar(0.8));
    const throwVel = forward.clone().multiplyScalar(18).add(new THREE.Vector3(0, 4.5, 0));

    // Dynamic 3D dynamite mesh
    const dynGroup = new THREE.Group();
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.35, 10),
      new THREE.MeshStandardMaterial({ color: 0xc42b1c, roughness: 0.8 })
    );
    const fuse = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.1, 6),
      new THREE.MeshStandardMaterial({ color: 0xffaa00 })
    );
    fuse.position.y = 0.22;
    dynGroup.add(tube, fuse);
    this.scene.add(dynGroup);

    const dynId = `dyn_${Date.now()}`;
    this.physics.createDynamite(dynId, dynGroup, throwPos, throwVel);

    // 3.2s fuse countdown -> EXPLOSION!
    setTimeout(() => {
      const obj = this.physics.objects.get(dynId);
      if (obj) {
        this.detonateExplosion(obj.body.position);
        this.physics.removeObject(dynId);
        this.scene.remove(dynGroup);
      }
    }, 3200);
  }

  // Massive Radial Explosion (Dynamite / TNT Keg)
  public detonateExplosion(pos: { x: number; y: number; z: number }) {
    const blastPos = new THREE.Vector3(pos.x, pos.y, pos.z);
    sounds.playExplosion();
    this.particles.emitExplosion(blastPos);
    this.addCameraShake(1.2);

    // Physics shockwave applied to all rigid bodies
    this.physics.applyExplosionImpulse(blastPos, 14, 450, (obj, dmg) => {
      // Wood splinter debris
      this.particles.emitWoodSplinters(obj.mesh.position, new THREE.Vector3(0, 1, 0));
    });

    // Damage enemies caught in blast radius
    this.enemies.getActiveBandits().forEach((bandit) => {
      const dist = bandit.position.distanceTo(blastPos);
      if (dist < 12) {
        const falloff = 1 - dist / 12;
        const dmg = Math.round(falloff * 240);
        const blastDir = bandit.position.clone().sub(blastPos).normalize();
        this.enemies.damageBandit(bandit, dmg, false, blastDir);
        this.score += 150;
      }
    });

    // Check player blast distance
    const distToPlayer = this.playerPos.distanceTo(blastPos);
    if (distToPlayer < 9) {
      const playerDmg = Math.round((1 - distToPlayer / 9) * 45);
      this.takePlayerDamage(playerDmg);
    }
  }

  // Player damaged by bandit gunfire or explosions
  public takePlayerDamage(amount: number) {
    if (this.status !== 'playing') return;
    this.playerHealth = Math.max(0, this.playerHealth - amount);
    this.playerDamageFlash = 0.5;
    this.addCameraShake(0.6);
    sounds.playPlayerHurt();

    if (this.playerHealth <= 0) {
      this.status = 'gameover';
      if (document.exitPointerLock) document.exitPointerLock();
      try {
        window.parent.postMessage({
          type: 'DUST_AND_LEAD_SCORE',
          score: this.score,
          wave: this.currentWave,
          name: 'Deputy',
        }, '*');
      } catch (e) {}
    }
  }

  public addCameraShake(amount: number) {
    this.shakeTrauma = Math.min(1.0, this.shakeTrauma + amount);
  }

  // Update Player Movement & Physics Controller
  private updatePlayer(dt: number) {
    // Sprint toggle
    this.isSprinting = !!this.keys['ShiftLeft'] || !!this.keys['ShiftRight'];
    const baseSpeed = this.isAimingADS ? 2.5 : this.isSprinting ? 7.5 : 4.5;

    // Movement direction from WASD relative to camera yaw
    const moveX = (this.keys['KeyD'] ? 1 : 0) - (this.keys['KeyA'] ? 1 : 0);
    const moveZ = (this.keys['KeyS'] ? 1 : 0) - (this.keys['KeyW'] ? 1 : 0);

    const inputDir = new THREE.Vector3(moveX, 0, moveZ).normalize();
    inputDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

    const isMoving = inputDir.lengthSq() > 0.01;
    if (isMoving) {
      this.playerVel.x = THREE.MathUtils.damp(this.playerVel.x, inputDir.x * baseSpeed, 12, dt);
      this.playerVel.z = THREE.MathUtils.damp(this.playerVel.z, inputDir.z * baseSpeed, 12, dt);
      this.walkTime += dt * (this.isSprinting ? 1.6 : 1.0);

      // Footstep sound cadence
      if (Math.sin(this.walkTime * 8) > 0.96) {
        sounds.playFootstep();
      }
    } else {
      this.playerVel.x = THREE.MathUtils.damp(this.playerVel.x, 0, 14, dt);
      this.playerVel.z = THREE.MathUtils.damp(this.playerVel.z, 0, 14, dt);
    }

    // Jump
    if (this.keys['Space'] && this.isGrounded) {
      this.playerVel.y = 7.0;
      this.isGrounded = false;
      sounds.playFootstep();
    }

    // Gravity
    if (!this.isGrounded) {
      this.playerVel.y -= 18.0 * dt;
    }

    // Integrate player position
    this.playerPos.x += this.playerVel.x * dt;
    this.playerPos.y += this.playerVel.y * dt;
    this.playerPos.z += this.playerVel.z * dt;

    // Ground floor collision check (dirt level = 1.7m eye height)
    if (this.playerPos.y <= 1.7) {
      this.playerPos.y = 1.7;
      this.playerVel.y = 0;
      this.isGrounded = true;
    }

    // Playable boundaries clamping (keep within frontier town perimeter)
    this.playerPos.x = Math.max(-55, Math.min(55, this.playerPos.x));
    this.playerPos.z = Math.max(-55, Math.min(55, this.playerPos.z));

    // Update weapon viewmodel bob & kinematics
    this.weapons.update(dt, isMoving, baseSpeed, this.walkTime);

    // ADS camera FOV zoom
    const targetFov = this.isAimingADS ? 48 : 75;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 14, dt);
    this.camera.updateProjectionMatrix();

    // Camera orientation & camera shake
    this.shakeTrauma = Math.max(0, this.shakeTrauma - dt * 2.2);
    const shakeAmount = this.shakeTrauma * this.shakeTrauma;
    this.cameraShake.set(
      (Math.random() - 0.5) * 0.08 * shakeAmount,
      (Math.random() - 0.5) * 0.08 * shakeAmount,
      (Math.random() - 0.5) * 0.08 * shakeAmount
    );

    this.camera.position.copy(this.playerPos).add(this.cameraShake);
    this.camera.rotation.set(0, 0, 0);
    this.camera.rotateY(this.cameraYaw);
    this.camera.rotateX(this.cameraPitch);
  }

  // Main 60fps Game Loop
  private tick() {
    this.animFrameId = requestAnimationFrame(this.tick);

    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    // Frame delta clamping per Game Craft directives
    const dt = Math.min(rawDt, 0.05);

    // Hitstop freeze
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // Hit marker timer decay
    if (this.hitMarkerTimer > 0) {
      this.hitMarkerTimer -= dt;
    }
    if (this.playerDamageFlash > 0) {
      this.playerDamageFlash -= dt * 2.0;
    }

    if (this.status === 'title') {
      // Atmospheric cinematic title camera pan along Dusty Creek
      this.titleCamAngle += dt * 0.15;
      const camX = Math.cos(this.titleCamAngle) * 22;
      const camZ = Math.sin(this.titleCamAngle) * 22;
      this.camera.position.set(camX, 3.5, camZ);
      this.camera.lookAt(0, 2.0, 0);

      // Step physics for tumbleweeds
      this.physics.step(dt);
      this.particles.update(dt);
    } else if (this.status === 'playing') {
      // 1. Update Player Controls
      this.updatePlayer(dt);

      // 2. Step Cannon Physics
      this.physics.step(dt);

      // 3. Update Bandit AI & Outlaw actions
      this.enemies.update(dt, this.playerPos, (bandit, dmg) => {
        this.takePlayerDamage(dmg);
      });

      // 4. Update Particles
      this.particles.update(dt);
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);

    // Notify React HUD
    if (this.onHudUpdate) {
      const curWep = this.weapons.getCurrent();
      const activeBandits = this.enemies.getActiveBandits();
      const boss = activeBandits.find((b) => b.type === 'boss');

      this.onHudUpdate({
        health: Math.round(this.playerHealth),
        maxHealth: this.playerMaxHealth,
        weapon: this.weapons.currentWeaponType,
        weaponName: curWep.name,
        ammo: curWep.ammo,
        magSize: curWep.magSize,
        reserveAmmo: curWep.reserveAmmo,
        isReloading: this.weapons.isReloading,
        score: this.score,
        bountyTarget: boss ? boss.name : activeBandits.length > 0 ? activeBandits[0].name : 'Territory Cleared',
        banditsRemaining: activeBandits.length,
        totalBandits: this.totalBandits,
        wave: this.currentWave,
        isHit: this.hitMarkerTimer > 0,
        isHeadshotHit: this.isHeadshot && this.hitMarkerTimer > 0,
        gameStatus: this.status,
      });
    }
  }

  private onWindowResize() {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  public destroy() {
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
