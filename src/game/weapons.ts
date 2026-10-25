/**
 * Cowboy FPS Weapon System & 3D Viewmodels
 * Procedural 3D models of Colt Peacemaker, Winchester Repeater, Coach Gun, and Dynamite
 * with authentic procedural recoil, lever-action cycling, and weapon switching.
 */

import * as THREE from 'three';
import { sounds } from '../audio/SoundEffects';

export type WeaponType = 'revolver' | 'repeater' | 'shotgun' | 'dynamite';

export interface WeaponDef {
  id: WeaponType;
  name: string;
  magSize: number;
  ammo: number;
  reserveAmmo: number;
  fireRate: number; // shots per sec
  damage: number;
  pellets: number;
  spread: number;
  impulseForce: number;
  reloadTime: number; // in seconds
  recoilKick: number;
}

export class WeaponManager {
  public weapons: Record<WeaponType, WeaponDef> = {
    revolver: {
      id: 'revolver',
      name: 'Colt .45 Peacemaker',
      magSize: 6,
      ammo: 6,
      reserveAmmo: 48,
      fireRate: 2.2,
      damage: 65,
      pellets: 1,
      spread: 0.012,
      impulseForce: 45,
      reloadTime: 1.8,
      recoilKick: 0.16,
    },
    repeater: {
      id: 'repeater',
      name: 'Winchester 1873',
      magSize: 14,
      ammo: 14,
      reserveAmmo: 70,
      fireRate: 1.6,
      damage: 48,
      pellets: 1,
      spread: 0.004,
      impulseForce: 35,
      reloadTime: 2.4,
      recoilKick: 0.12,
    },
    shotgun: {
      id: 'shotgun',
      name: 'Coach Gun 12-Ga',
      magSize: 2,
      ammo: 2,
      reserveAmmo: 24,
      fireRate: 1.2,
      damage: 28,
      pellets: 8,
      spread: 0.048,
      impulseForce: 95,
      reloadTime: 2.2,
      recoilKick: 0.28,
    },
    dynamite: {
      id: 'dynamite',
      name: 'TNT Dynamite Stick',
      magSize: 1,
      ammo: 4,
      reserveAmmo: 4,
      fireRate: 0.8,
      damage: 250,
      pellets: 1,
      spread: 0,
      impulseForce: 300,
      reloadTime: 0.8,
      recoilKick: 0.08,
    },
  };

  public currentWeaponType: WeaponType = 'revolver';
  public viewmodelGroup: THREE.Group = new THREE.Group();
  public weaponMeshes: Record<WeaponType, THREE.Group> = {} as any;

  // Recoil & Kinematics
  public recoilOffset = new THREE.Vector3();
  public recoilRotation = new THREE.Vector3();
  public bobOffset = new THREE.Vector3();
  public isReloading: boolean = false;
  public reloadTimer: number = 0;
  public lastFireTime: number = 0;

  // Moving parts for animations
  private revolverHammer: THREE.Mesh | null = null;
  private repeaterLever: THREE.Mesh | null = null;
  private shotgunBarrels: THREE.Group | null = null;

  constructor() {
    this.createViewmodels();
    this.switchWeapon('revolver');
  }

  public getCurrent(): WeaponDef {
    return this.weapons[this.currentWeaponType];
  }

  // Build high-detail procedural 3D weapon meshes (3-12 parts per weapon)
  private createViewmodels() {
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x222428,
      metalness: 0.85,
      roughness: 0.25,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc49a45,
      metalness: 0.9,
      roughness: 0.22,
    });
    const walnutMat = new THREE.MeshStandardMaterial({
      color: 0x4a2a16,
      metalness: 0.05,
      roughness: 0.65,
    });
    const dynamitePaperMat = new THREE.MeshStandardMaterial({
      color: 0xbd2a1e,
      roughness: 0.8,
    });
    const fuseMat = new THREE.MeshStandardMaterial({
      color: 0xe0c896,
      roughness: 0.9,
    });

    // 1. Colt .45 SAA "Peacemaker" Model
    const revGroup = new THREE.Group();
    // Barrel (Octagonal / round)
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.42, 8), steelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.06, -0.22);
    // Cylinder
    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.14, 12), steelMat);
    cylinder.rotation.x = Math.PI / 2;
    cylinder.position.set(0, 0.04, -0.02);
    // Cylinder Flutes
    for (let i = 0; i < 6; i++) {
      const flute = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 6), steelMat);
      flute.rotation.x = Math.PI / 2;
      const angle = (i * Math.PI * 2) / 6;
      flute.position.set(Math.cos(angle) * 0.044, 0.04 + Math.sin(angle) * 0.044, -0.02);
      revGroup.add(flute);
    }
    // Frame & Trigger Guard
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.18), steelMat);
    frame.position.set(0, 0.03, 0.04);
    const triggerGuard = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.008, 6, 12), brassMat);
    triggerGuard.position.set(0, -0.04, 0.04);
    // Walnut Grip
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.16, 0.07), walnutMat);
    grip.rotation.x = -Math.PI / 6;
    grip.position.set(0, -0.09, 0.11);
    // Hammer
    const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.045, 0.03), steelMat);
    hammer.position.set(0, 0.09, 0.07);
    this.revolverHammer = hammer;
    // Front Sight Post
    const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.016, 0.02), brassMat);
    frontSight.position.set(0, 0.095, -0.38);

    revGroup.add(barrel, cylinder, frame, triggerGuard, grip, hammer, frontSight);
    revGroup.position.set(0.24, -0.22, -0.42);
    this.weaponMeshes.revolver = revGroup;
    this.viewmodelGroup.add(revGroup);

    // 2. Winchester 1873 Lever-Action Model
    const repGroup = new THREE.Group();
    // Long Octagonal Barrel
    const repBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.85, 8), steelMat);
    repBarrel.rotation.x = Math.PI / 2;
    repBarrel.position.set(0, 0.06, -0.45);
    // Tubular Magazine below barrel
    const magTube = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.8, 8), steelMat);
    magTube.rotation.x = Math.PI / 2;
    magTube.position.set(0, 0.02, -0.43);
    // Yellow-Boy Brass Receiver
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.28), brassMat);
    receiver.position.set(0, 0.04, 0.02);
    // Walnut Forend
    const forend = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.055, 0.38), walnutMat);
    forend.position.set(0, 0.03, -0.28);
    // Walnut Shoulder Stock
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.14, 0.36), walnutMat);
    stock.rotation.x = -Math.PI / 18;
    stock.position.set(0, -0.05, 0.26);
    // Brass Buttplate
    const buttplate = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.145, 0.02), brassMat);
    buttplate.rotation.x = -Math.PI / 18;
    buttplate.position.set(0, -0.05, 0.44);
    // Finger Lever
    const lever = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 6, 12), steelMat);
    lever.position.set(0, -0.06, 0.06);
    this.repeaterLever = lever;
    // Buckhorn rear sights
    const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.02, 0.03), steelMat);
    rearSight.position.set(0, 0.09, -0.16);

    repGroup.add(repBarrel, magTube, receiver, forend, stock, buttplate, lever, rearSight);
    repGroup.position.set(0.24, -0.26, -0.48);
    this.weaponMeshes.repeater = repGroup;
    this.viewmodelGroup.add(repGroup);

    // 3. Coach Gun Double-Barrel Shotgun Model
    const sgGroup = new THREE.Group();
    const barrelAssembly = new THREE.Group();
    // Twin Side-by-Side Barrels
    const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.65, 10), steelMat);
    b1.rotation.x = Math.PI / 2;
    b1.position.set(-0.024, 0.06, -0.32);
    const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.65, 10), steelMat);
    b2.rotation.x = Math.PI / 2;
    b2.position.set(0.024, 0.06, -0.32);
    // Barrel Rib
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.015, 0.65), steelMat);
    rib.position.set(0, 0.075, -0.32);
    // Front Brass Bead
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), brassMat);
    bead.position.set(0, 0.09, -0.64);
    barrelAssembly.add(b1, b2, rib, bead);
    sgGroup.add(barrelAssembly);
    this.shotgunBarrels = barrelAssembly;

    // Shotgun Frame & Break Action
    const sgFrame = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.09, 0.18), steelMat);
    sgFrame.position.set(0, 0.04, 0.04);
    // Walnut Stock
    const sgStock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.13, 0.35), walnutMat);
    sgStock.rotation.x = -Math.PI / 16;
    sgStock.position.set(0, -0.04, 0.26);
    // Double Triggers
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.03, 0.01), steelMat);
    t1.position.set(-0.008, -0.035, 0.04);
    const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.03, 0.01), steelMat);
    t2.position.set(0.008, -0.035, 0.06);
    sgGroup.add(sgFrame, sgStock, t1, t2);

    sgGroup.position.set(0.24, -0.24, -0.45);
    this.weaponMeshes.shotgun = sgGroup;
    this.viewmodelGroup.add(sgGroup);

    // 4. Dynamite Stick Model (in hand)
    const dynGroup = new THREE.Group();
    // Red wrapped paper tube
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.28, 12), dynamitePaperMat);
    // Brass end caps
    const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.039, 0.039, 0.02, 12), brassMat);
    cap1.position.y = 0.14;
    const cap2 = new THREE.Mesh(new THREE.CylinderGeometry(0.039, 0.039, 0.02, 12), brassMat);
    cap2.position.y = -0.14;
    // Sizzling Fuse
    const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 6), fuseMat);
    fuse.position.set(0, 0.18, 0);
    fuse.rotation.z = Math.PI / 6;
    // Spark tip
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    );
    spark.position.set(0.03, 0.22, 0);

    dynGroup.add(tube, cap1, cap2, fuse, spark);
    dynGroup.rotation.set(Math.PI / 4, 0, -Math.PI / 6);
    dynGroup.position.set(0.22, -0.18, -0.38);
    this.weaponMeshes.dynamite = dynGroup;
    this.viewmodelGroup.add(dynGroup);
  }

  public switchWeapon(type: WeaponType) {
    if (this.currentWeaponType === type && !this.isReloading) return;
    this.currentWeaponType = type;
    this.isReloading = false;
    this.reloadTimer = 0;

    // Toggle mesh visibility
    Object.keys(this.weaponMeshes).forEach((key) => {
      const mesh = this.weaponMeshes[key as WeaponType];
      if (mesh) {
        mesh.visible = key === type;
      }
    });

    sounds.playCockHammer();
  }

  public canShoot(currentTime: number): boolean {
    const cur = this.getCurrent();
    if (this.isReloading) return false;
    if (cur.ammo <= 0) return false;
    if (currentTime - this.lastFireTime < 1.0 / cur.fireRate) return false;
    return true;
  }

  public shoot(currentTime: number): boolean {
    const cur = this.getCurrent();
    if (!this.canShoot(currentTime)) {
      if (cur.ammo <= 0 && !this.isReloading && cur.reserveAmmo > 0) {
        this.reload();
      }
      return false;
    }

    cur.ammo--;
    this.lastFireTime = currentTime;

    // Apply recoil impulse
    this.recoilOffset.z = cur.recoilKick;
    this.recoilRotation.x = cur.recoilKick * 2.2;
    this.recoilRotation.y = (Math.random() - 0.5) * 0.06;

    // Play procedural weapon sound & mechanical animation
    if (cur.id === 'revolver') {
      sounds.playRevolverShot();
      if (this.revolverHammer) {
        this.revolverHammer.rotation.x = -Math.PI / 6;
        setTimeout(() => {
          if (this.revolverHammer) this.revolverHammer.rotation.x = 0;
          sounds.playCockHammer();
        }, 220);
      }
    } else if (cur.id === 'repeater') {
      sounds.playRepeaterShot();
      if (this.repeaterLever) {
        this.repeaterLever.rotation.x = Math.PI / 4;
        setTimeout(() => {
          if (this.repeaterLever) this.repeaterLever.rotation.x = 0;
          sounds.playLeverAction();
        }, 280);
      }
    } else if (cur.id === 'shotgun') {
      sounds.playShotgunShot();
      if (this.shotgunBarrels) {
        this.shotgunBarrels.rotation.x = -0.15;
        setTimeout(() => {
          if (this.shotgunBarrels) this.shotgunBarrels.rotation.x = 0;
        }, 180);
      }
    } else if (cur.id === 'dynamite') {
      sounds.playFuseFizzle();
    }

    return true;
  }

  public reload(): boolean {
    const cur = this.getCurrent();
    if (this.isReloading) return false;
    if (cur.ammo === cur.magSize || cur.reserveAmmo <= 0) return false;

    this.isReloading = true;
    this.reloadTimer = cur.reloadTime;
    sounds.playReload();

    // Trigger visual reload rotation
    this.recoilRotation.z = 0.4;
    this.recoilOffset.y = -0.12;

    return true;
  }

  // Update kinematics and recoil decay
  public update(dt: number, isWalking: boolean, walkSpeed: number, walkTime: number) {
    const cur = this.getCurrent();

    // Reload timer
    if (this.isReloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        const needed = cur.magSize - cur.ammo;
        const available = Math.min(needed, cur.reserveAmmo);
        cur.ammo += available;
        cur.reserveAmmo -= available;
        this.isReloading = false;
        sounds.playCockHammer();
      }
    }

    // Smooth exponential damping on recoil kickback
    this.recoilOffset.lerp(new THREE.Vector3(0, 0, 0), dt * 14);
    this.recoilRotation.lerp(new THREE.Vector3(0, 0, 0), dt * 12);

    // Natural breathing & walk bobbing
    if (isWalking) {
      this.bobOffset.x = Math.sin(walkTime * 8) * 0.015 * walkSpeed;
      this.bobOffset.y = Math.abs(Math.sin(walkTime * 8)) * 0.018 * walkSpeed;
    } else {
      // Idle breathing
      this.bobOffset.x = Math.sin(walkTime * 1.5) * 0.003;
      this.bobOffset.y = Math.cos(walkTime * 3.0) * 0.004;
    }

    const currentMesh = this.weaponMeshes[this.currentWeaponType];
    if (currentMesh) {
      currentMesh.position.x = 0.24 + this.bobOffset.x + this.recoilOffset.x;
      currentMesh.position.y = -0.22 + this.bobOffset.y + this.recoilOffset.y;
      currentMesh.position.z = -0.42 + this.recoilOffset.z;

      currentMesh.rotation.x = this.recoilRotation.x;
      currentMesh.rotation.y = this.recoilRotation.y;
      currentMesh.rotation.z = this.recoilRotation.z;
    }
  }
}
