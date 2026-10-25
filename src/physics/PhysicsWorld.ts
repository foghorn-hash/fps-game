/**
 * Cannon-es Realistic Rigid Body Physics Engine
 * Handles full 3D rigid body dynamics, contact materials, friction, restitution,
 * interactive crates, rolling barrels, tumbleweeds, and explosive impulses.
 */

import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export interface PhysicsObject {
  id: string;
  type: 'crate' | 'tnt' | 'barrel' | 'tumbleweed' | 'dynamite' | 'debris';
  body: CANNON.Body;
  mesh: THREE.Object3D;
  health?: number;
  maxHealth?: number;
  exploded?: boolean;
}

export class PhysicsWorld {
  public world: CANNON.World;
  public objects: Map<string, PhysicsObject> = new Map();
  public groundMaterial: CANNON.Material;
  public woodMaterial: CANNON.Material;
  public playerMaterial: CANNON.Material;
  public tntMaterial: CANNON.Material;

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -18.0, 0), // Snappy, grounded gravity
    });

    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    (this.world.solver as CANNON.GSSolver).iterations = 10;

    // Materials
    this.groundMaterial = new CANNON.Material('ground');
    this.woodMaterial = new CANNON.Material('wood');
    this.playerMaterial = new CANNON.Material('player');
    this.tntMaterial = new CANNON.Material('tnt');

    // Contact rules: Wood on Ground
    const woodGroundContact = new CANNON.ContactMaterial(this.woodMaterial, this.groundMaterial, {
      friction: 0.55,
      restitution: 0.15,
    });
    this.world.addContactMaterial(woodGroundContact);

    // Wood on Wood (stable crate stacking)
    const woodWoodContact = new CANNON.ContactMaterial(this.woodMaterial, this.woodMaterial, {
      friction: 0.65,
      restitution: 0.1,
    });
    this.world.addContactMaterial(woodWoodContact);

    // Player on Ground
    const playerGroundContact = new CANNON.ContactMaterial(this.playerMaterial, this.groundMaterial, {
      friction: 0.1, // low friction for responsive strafing and walking
      restitution: 0.0,
    });
    this.world.addContactMaterial(playerGroundContact);

    // Player on Wood
    const playerWoodContact = new CANNON.ContactMaterial(this.playerMaterial, this.woodMaterial, {
      friction: 0.2,
      restitution: 0.0,
    });
    this.world.addContactMaterial(playerWoodContact);

    // Static Ground Body
    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      material: this.groundMaterial,
    });
    // CANNON planes face +Z by default; rotate to face +Y
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    groundBody.position.set(0, 0, 0);
    this.world.addBody(groundBody);
  }

  // Register physical static boxes for building walls, boardwalks, and fences
  public addStaticBox(
    size: [number, number, number],
    position: [number, number, number],
    rotationY: number = 0
  ): CANNON.Body {
    const shape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2));
    const body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      material: this.woodMaterial,
    });
    body.addShape(shape);
    body.position.set(position[0], position[1], position[2]);
    if (rotationY !== 0) {
      body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationY);
    }
    this.world.addBody(body);
    return body;
  }

  // Spawn dynamic wooden crate
  public createCrate(
    id: string,
    mesh: THREE.Object3D,
    position: [number, number, number],
    size: [number, number, number] = [1.2, 1.2, 1.2],
    mass: number = 18
  ): PhysicsObject {
    const halfExtents = new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2);
    const boxShape = new CANNON.Box(halfExtents);
    const body = new CANNON.Body({
      mass,
      material: this.woodMaterial,
      linearDamping: 0.05,
      angularDamping: 0.1,
    });
    body.addShape(boxShape);
    body.position.set(position[0], position[1], position[2]);
    this.world.addBody(body);

    const obj: PhysicsObject = {
      id,
      type: 'crate',
      body,
      mesh,
      health: 40,
      maxHealth: 40,
    };
    this.objects.set(id, obj);
    return obj;
  }

  // Spawn dynamic TNT powder keg
  public createTntKeg(
    id: string,
    mesh: THREE.Object3D,
    position: [number, number, number],
    radius: number = 0.55,
    height: number = 1.1
  ): PhysicsObject {
    const shape = new CANNON.Cylinder(radius, radius, height, 12);
    const body = new CANNON.Body({
      mass: 22,
      material: this.tntMaterial,
      linearDamping: 0.06,
      angularDamping: 0.1,
    });
    // CANNON cylinder axis is Z by default, rotate to Y
    const quat = new CANNON.Quaternion();
    quat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    body.addShape(shape, new CANNON.Vec3(0, 0, 0), quat);
    body.position.set(position[0], position[1], position[2]);
    this.world.addBody(body);

    const obj: PhysicsObject = {
      id,
      type: 'tnt',
      body,
      mesh,
      health: 20,
      maxHealth: 20,
      exploded: false,
    };
    this.objects.set(id, obj);
    return obj;
  }

  // Spawn rolling barrel
  public createRollingBarrel(
    id: string,
    mesh: THREE.Object3D,
    position: [number, number, number],
    radius: number = 0.5,
    height: number = 1.0
  ): PhysicsObject {
    const shape = new CANNON.Cylinder(radius, radius, height, 12);
    const body = new CANNON.Body({
      mass: 15,
      material: this.woodMaterial,
      linearDamping: 0.04,
      angularDamping: 0.04,
    });
    const quat = new CANNON.Quaternion();
    quat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    body.addShape(shape, new CANNON.Vec3(0, 0, 0), quat);
    body.position.set(position[0], position[1], position[2]);
    this.world.addBody(body);

    const obj: PhysicsObject = {
      id,
      type: 'barrel',
      body,
      mesh,
      health: 60,
    };
    this.objects.set(id, obj);
    return obj;
  }

  // Spawn physical tumbleweed that gets pushed by wind
  public createTumbleweed(
    id: string,
    mesh: THREE.Object3D,
    position: [number, number, number],
    radius: number = 0.65
  ): PhysicsObject {
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
      mass: 1.2, // very light
      material: this.woodMaterial,
      linearDamping: 0.08,
      angularDamping: 0.05,
    });
    body.addShape(shape);
    body.position.set(position[0], position[1], position[2]);
    this.world.addBody(body);

    const obj: PhysicsObject = {
      id,
      type: 'tumbleweed',
      body,
      mesh,
    };
    this.objects.set(id, obj);
    return obj;
  }

  // Spawn dynamite stick thrown by player
  public createDynamite(
    id: string,
    mesh: THREE.Object3D,
    startPos: THREE.Vector3,
    velocity: THREE.Vector3
  ): PhysicsObject {
    const shape = new CANNON.Cylinder(0.1, 0.1, 0.45, 8);
    const body = new CANNON.Body({
      mass: 0.9,
      material: this.woodMaterial,
      linearDamping: 0.02,
      angularDamping: 0.05,
    });
    body.addShape(shape);
    body.position.set(startPos.x, startPos.y, startPos.z);
    body.velocity.set(velocity.x, velocity.y, velocity.z);
    // Add realistic tumble
    body.angularVelocity.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 12
    );
    this.world.addBody(body);

    const obj: PhysicsObject = {
      id,
      type: 'dynamite',
      body,
      mesh,
      health: 1,
      exploded: false,
    };
    this.objects.set(id, obj);
    return obj;
  }

  // Apply kinetic impulse to a body from a bullet impact
  public applyBulletImpulse(
    body: CANNON.Body,
    impactPoint: THREE.Vector3,
    direction: THREE.Vector3,
    forceMagnitude: number
  ) {
    const impulse = new CANNON.Vec3(
      direction.x * forceMagnitude,
      direction.y * forceMagnitude + 2.0, // slight upward kick
      direction.z * forceMagnitude
    );
    const point = new CANNON.Vec3(impactPoint.x, impactPoint.y, impactPoint.z);
    body.wakeUp();
    body.applyImpulse(impulse, point);
  }

  // Apply 3D radial blast wave to all physical bodies
  public applyExplosionImpulse(
    center: THREE.Vector3,
    radius: number,
    strength: number,
    onBodyHit?: (obj: PhysicsObject, damage: number) => void
  ) {
    const cVec = new CANNON.Vec3(center.x, center.y, center.z);

    this.objects.forEach((obj) => {
      const dist = obj.body.position.distanceTo(cVec);
      if (dist < radius && dist > 0.01) {
        const falloff = 1 - dist / radius;
        const dir = new CANNON.Vec3();
        obj.body.position.vsub(cVec, dir);
        dir.normalize();

        // Add upward loft for cinematic ragdoll/box launching
        dir.y += 0.45;
        dir.normalize();

        const impulseStrength = strength * falloff;
        const impulse = new CANNON.Vec3(
          dir.x * impulseStrength,
          dir.y * impulseStrength,
          dir.z * impulseStrength
        );

        obj.body.wakeUp();
        obj.body.applyImpulse(impulse, obj.body.position);

        if (onBodyHit) {
          const damage = Math.round(falloff * 150);
          onBodyHit(obj, damage);
        }
      }
    });
  }

  // Remove physics object and body
  public removeObject(id: string) {
    const obj = this.objects.get(id);
    if (obj) {
      this.world.removeBody(obj.body);
      this.objects.delete(id);
    }
  }

  // Step physics simulation and sync Three.js meshes
  public step(dt: number) {
    const clampedDt = Math.min(dt, 0.05);
    // 60 Hz fixed timestep with substeps
    this.world.step(1 / 60, clampedDt, 4);

    // Apply wind to tumbleweeds
    this.objects.forEach((obj) => {
      if (obj.type === 'tumbleweed') {
        // Desert wind blowing diagonally down main street
        obj.body.applyForce(new CANNON.Vec3(0.8, 0.2, 1.4), obj.body.position);
      }

      // Sync visual mesh with physical body
      obj.mesh.position.set(obj.body.position.x, obj.body.position.y, obj.body.position.z);
      obj.mesh.quaternion.set(
        obj.body.quaternion.x,
        obj.body.quaternion.y,
        obj.body.quaternion.z,
        obj.body.quaternion.w
      );
    });
  }
}
