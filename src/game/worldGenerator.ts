/**
 * Procedural Western Town World Generator
 * Creates "Dusty Creek": Saloon with swinging doors, Sheriff's Office, Bank, Store,
 * Water Tower, boardwalks, cacti, physical dynamic props, and surrounding mesa canyon walls.
 */

import * as THREE from 'three';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { ProceduralTextures } from './proceduralTextures';

export interface TownWorld {
  group: THREE.Group;
  spawnPoints: THREE.Vector3[];
  coverPoints: THREE.Vector3[];
  saloonDoors: THREE.Group[];
}

export class WorldGenerator {
  public static buildWesternTown(scene: THREE.Scene, physics: PhysicsWorld): TownWorld {
    const townGroup = new THREE.Group();
    scene.add(townGroup);

    const woodTex = ProceduralTextures.getWoodTexture();
    const groundTex = ProceduralTextures.getGroundTexture();
    const rockTex = ProceduralTextures.getRockTexture();

    // Standard PBR Materials with proper roughness/metalness variation
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.85,
      metalness: 0.05,
    });
    const darkWoodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: 0x48321e,
      roughness: 0.9,
      metalness: 0.02,
    });
    const paintedRedMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: 0x853229,
      roughness: 0.8,
      metalness: 0.05,
    });
    const paintedWhiteMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: 0xd9cebe,
      roughness: 0.75,
      metalness: 0.05,
    });
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x242426,
      roughness: 0.35,
      metalness: 0.85,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xb58e38,
      roughness: 0.25,
      metalness: 0.9,
    });
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.95,
      metalness: 0.0,
    });
    const rockMat = new THREE.MeshStandardMaterial({
      map: rockTex,
      roughness: 0.92,
      metalness: 0.02,
    });
    const cactusMat = new THREE.MeshStandardMaterial({
      color: 0x3d6e3c,
      roughness: 0.8,
      metalness: 0.05,
    });

    // 1. Vast Desert Ground Plane (extends beyond playable boundaries)
    const groundGeo = new THREE.PlaneGeometry(350, 350, 32, 32);
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    townGroup.add(groundMesh);

    // 2. Surrounding Red Rock Canyon Mesas (Natural outdoor perimeter instead of floating void)
    const mesaCoords = [
      { x: 0, z: -85, sx: 190, sy: 38, sz: 32 },
      { x: 0, z: 85, sx: 190, sy: 42, sz: 32 },
      { x: -95, z: 0, sx: 35, sy: 45, sz: 170 },
      { x: 95, z: 0, sx: 35, sy: 40, sz: 170 },
      // Corner buttresses
      { x: -75, z: -65, sx: 50, sy: 52, sz: 50 },
      { x: 75, z: -65, sx: 52, sy: 48, sz: 50 },
      { x: -75, z: 65, sx: 48, sy: 50, sz: 50 },
      { x: 75, z: 65, sx: 50, sy: 54, sz: 50 },
    ];
    mesaCoords.forEach((m) => {
      const mesaGeo = new THREE.CylinderGeometry(m.sx * 0.42, m.sx * 0.5, m.sy, 10);
      const mesa = new THREE.Mesh(mesaGeo, rockMat);
      mesa.position.set(m.x, m.sy / 2, m.z);
      mesa.castShadow = true;
      mesa.receiveShadow = true;
      townGroup.add(mesa);
      // Physical barrier
      physics.addStaticBox([m.sx * 0.9, m.sy, m.sz * 0.9], [m.x, m.sy / 2, m.z]);
    });

    // Enemy spawn points and cover positions
    const spawnPoints: THREE.Vector3[] = [];
    const coverPoints: THREE.Vector3[] = [];
    const saloonDoors: THREE.Group[] = [];

    // Helper: Build a multi-part Western Building
    const createBuilding = (
      name: string,
      subtitle: string,
      pos: [number, number, number],
      dim: [number, number, number], // w, h, d
      wallMat: THREE.Material,
      options: {
        hasPorch?: boolean;
        hasBalcony?: boolean;
        hasSign?: boolean;
        isSaloon?: boolean;
      } = {}
    ) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(pos[0], pos[1], pos[2]);

      const [w, h, d] = dim;

      // Part 1: Main Structure / Shell
      const wallGeo = new THREE.BoxGeometry(w, h, d);
      const walls = new THREE.Mesh(wallGeo, wallMat);
      walls.position.y = h / 2;
      walls.castShadow = true;
      walls.receiveShadow = true;
      bGroup.add(walls);
      // Static physics collision
      physics.addStaticBox([w, h, d], [pos[0], pos[1] + h / 2, pos[2]]);

      // Part 2: Western False Front Parapet / Roof Trim
      const parapetHeight = 2.2;
      const parapetGeo = new THREE.BoxGeometry(w + 0.4, parapetHeight, 0.4);
      const parapet = new THREE.Mesh(parapetGeo, darkWoodMat);
      parapet.position.set(0, h + parapetHeight / 2 - 0.2, d / 2);
      parapet.castShadow = true;
      bGroup.add(parapet);

      // Part 3: Overhanging Boardwalk Porch
      if (options.hasPorch) {
        const porchDepth = 3.5;
        const porchHeight = 0.4;
        const porchGeo = new THREE.BoxGeometry(w + 1.2, porchHeight, porchDepth);
        const porch = new THREE.Mesh(porchGeo, darkWoodMat);
        porch.position.set(0, porchHeight / 2, d / 2 + porchDepth / 2);
        porch.receiveShadow = true;
        bGroup.add(porch);
        physics.addStaticBox(
          [w + 1.2, porchHeight, porchDepth],
          [pos[0], pos[1] + porchHeight / 2, pos[2] + d / 2 + porchDepth / 2]
        );

        // Porch roof awning
        const roofGeo = new THREE.BoxGeometry(w + 1.2, 0.3, porchDepth);
        const roof = new THREE.Mesh(roofGeo, darkWoodMat);
        roof.position.set(0, 3.8, d / 2 + porchDepth / 2);
        roof.castShadow = true;
        roof.receiveShadow = true;
        bGroup.add(roof);

        // Porch support wooden posts
        const postCount = 4;
        const postSpacing = (w + 0.6) / (postCount - 1);
        for (let i = 0; i < postCount; i++) {
          const px = -w / 2 - 0.3 + i * postSpacing;
          const postGeo = new THREE.CylinderGeometry(0.12, 0.14, 3.8, 8);
          const post = new THREE.Mesh(postGeo, darkWoodMat);
          post.position.set(px, 1.9, d / 2 + porchDepth - 0.2);
          post.castShadow = true;
          bGroup.add(post);

          // Cover point behind post
          coverPoints.push(new THREE.Vector3(pos[0] + px, pos[1], pos[2] + d / 2 + porchDepth + 0.5));
        }

        // Hitching post rail in front of porch
        const hitchRailGeo = new THREE.CylinderGeometry(0.08, 0.08, w * 0.7, 8);
        const hitchRail = new THREE.Mesh(hitchRailGeo, darkWoodMat);
        hitchRail.rotation.z = Math.PI / 2;
        hitchRail.position.set(0, 0.95, d / 2 + porchDepth + 1.4);
        bGroup.add(hitchRail);

        [-w * 0.3, w * 0.3].forEach((hx) => {
          const hpGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.95, 8);
          const hp = new THREE.Mesh(hpGeo, darkWoodMat);
          hp.position.set(hx, 0.475, d / 2 + porchDepth + 1.4);
          bGroup.add(hp);
        });
      }

      // Part 4: Second-story Balcony (for Saloon snipers)
      if (options.hasBalcony) {
        const balcDepth = 2.8;
        const balcGeo = new THREE.BoxGeometry(w * 0.75, 0.3, balcDepth);
        const balc = new THREE.Mesh(balcGeo, darkWoodMat);
        balc.position.set(0, 4.2, d / 2 + balcDepth / 2);
        balc.castShadow = true;
        balc.receiveShadow = true;
        bGroup.add(balc);
        physics.addStaticBox([w * 0.75, 0.3, balcDepth], [pos[0], pos[1] + 4.2, pos[2] + d / 2 + balcDepth / 2]);

        // Balcony railing
        const railGeo = new THREE.BoxGeometry(w * 0.75, 0.9, 0.1);
        const rail = new THREE.Mesh(railGeo, darkWoodMat);
        rail.position.set(0, 4.8, d / 2 + balcDepth);
        bGroup.add(rail);

        // Balcony sniper spawn point
        spawnPoints.push(new THREE.Vector3(pos[0], pos[1] + 4.5, pos[2] + d / 2 + 1.0));
      }

      // Part 5: Signboard
      if (options.hasSign) {
        const signTex = ProceduralTextures.createSignTexture(name, subtitle);
        const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.6 });
        const signGeo = new THREE.BoxGeometry(w * 0.65, 1.4, 0.15);
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, h + 0.6, d / 2 + 0.3);
        sign.castShadow = true;
        bGroup.add(sign);
      }

      // Saloon batwing swinging doors
      if (options.isSaloon) {
        const doorFrameGeo = new THREE.BoxGeometry(2.4, 3.0, 0.3);
        const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x2b1c11 });
        const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat);
        doorFrame.position.set(0, 1.5, d / 2 + 0.1);
        bGroup.add(doorFrame);

        // Two batwing swinging half-doors
        [-0.55, 0.55].forEach((dx, idx) => {
          const swingDoorGroup = new THREE.Group();
          swingDoorGroup.position.set(dx + (idx === 0 ? -0.4 : 0.4), 1.5, d / 2 + 0.1);
          const batwingGeo = new THREE.BoxGeometry(0.8, 1.4, 0.06);
          const batwing = new THREE.Mesh(batwingGeo, woodMat);
          batwing.position.x = idx === 0 ? 0.4 : -0.4;
          batwing.castShadow = true;
          swingDoorGroup.add(batwing);
          bGroup.add(swingDoorGroup);
          saloonDoors.push(swingDoorGroup);
        });
      }

      townGroup.add(bGroup);
      return bGroup;
    };

    // --- Build Town Buildings along Main Street ---
    // North Side (z = -16):
    // 1. Grand Silver Dollar Saloon
    createBuilding(
      'Silver Dollar Saloon',
      'Cold Beer · Warm Spirits · Poker',
      [-18, 0, -18],
      [14, 7.5, 16],
      woodMat,
      { hasPorch: true, hasBalcony: true, hasSign: true, isSaloon: true }
    );
    // 2. First Territorial Bank & Vault
    createBuilding(
      'Territorial Bank',
      'Gold Bullion & Federal Notes',
      [2, 0, -17],
      [11, 6.5, 14],
      paintedWhiteMat,
      { hasPorch: true, hasSign: true }
    );
    // 3. Dry Goods & General Mercantile
    createBuilding(
      'Mercantile Store',
      'Flour · Coffee · Boots · Ammunition',
      [20, 0, -17],
      [12, 6.0, 14],
      paintedRedMat,
      { hasPorch: true, hasSign: true }
    );

    // South Side (z = 16):
    // 4. Sheriff's Office & County Jail
    createBuilding(
      "Sheriff's Office",
      'Law & Order · U.S. Marshal',
      [-18, 0, 18],
      [12, 6.2, 14],
      darkWoodMat,
      { hasPorch: true, hasSign: true }
    );
    // 5. Undertaker & Blacksmith
    createBuilding(
      'Blacksmith & Co.',
      'Horseshoes · Ironworks · Wagon Wheels',
      [1, 0, 17],
      [12, 5.8, 13],
      woodMat,
      { hasPorch: true, hasSign: true }
    );
    // 6. Livery Stable & Depot
    createBuilding(
      'Livery Stable',
      'Horses Boarded · Stagecoach Line',
      [21, 0, 18],
      [14, 6.8, 15],
      paintedRedMat,
      { hasPorch: true, hasSign: true }
    );

    // 7. Water Tower (Crucial Western Landmark)
    const towerGroup = new THREE.Group();
    towerGroup.position.set(-36, 0, 0);
    // 4 tall wooden legs
    const legGeo = new THREE.CylinderGeometry(0.2, 0.25, 12, 8);
    [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, darkWoodMat);
      leg.position.set(lx, 6, lz);
      leg.castShadow = true;
      towerGroup.add(leg);
    });
    // Braces
    const braceGeo = new THREE.BoxGeometry(4.2, 0.15, 0.15);
    [4, 8].forEach((by) => {
      const b1 = new THREE.Mesh(braceGeo, darkWoodMat);
      b1.position.set(0, by, -1.8);
      const b2 = new THREE.Mesh(braceGeo, darkWoodMat);
      b2.position.set(0, by, 1.8);
      towerGroup.add(b1, b2);
    });
    // Platform
    const platGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.4, 16);
    const plat = new THREE.Mesh(platGeo, darkWoodMat);
    plat.position.y = 12;
    plat.receiveShadow = true;
    towerGroup.add(plat);
    // Wooden Water Vat
    const vatGeo = new THREE.CylinderGeometry(3.2, 3.0, 5.5, 18);
    const vat = new THREE.Mesh(vatGeo, woodMat);
    vat.position.y = 15;
    vat.castShadow = true;
    towerGroup.add(vat);
    // Metal barrel hoops
    [13.2, 14.8, 16.5].forEach((hy) => {
      const hoopGeo = new THREE.TorusGeometry(3.2, 0.08, 6, 24);
      const hoop = new THREE.Mesh(hoopGeo, ironMat);
      hoop.rotation.x = Math.PI / 2;
      hoop.position.y = hy;
      towerGroup.add(hoop);
    });
    // Conical roof
    const roofConeGeo = new THREE.ConeGeometry(3.6, 2.2, 18);
    const roofCone = new THREE.Mesh(roofConeGeo, darkWoodMat);
    roofCone.position.y = 18.8;
    roofCone.castShadow = true;
    towerGroup.add(roofCone);
    townGroup.add(towerGroup);
    physics.addStaticBox([5, 18, 5], [-36, 9, 0]);

    // Gallows & Hangman Platform near Sheriff
    const gallowsGroup = new THREE.Group();
    gallowsGroup.position.set(-6, 0, 10);
    const gallowsPlatGeo = new THREE.BoxGeometry(4.2, 1.2, 4.2);
    const gallowsPlat = new THREE.Mesh(gallowsPlatGeo, darkWoodMat);
    gallowsPlat.position.y = 0.6;
    gallowsPlat.castShadow = true;
    gallowsGroup.add(gallowsPlat);
    physics.addStaticBox([4.2, 1.2, 4.2], [-6, 0.6, 10]);

    const gallowsPostGeo = new THREE.BoxGeometry(0.3, 4.5, 0.3);
    const gallowsPost = new THREE.Mesh(gallowsPostGeo, darkWoodMat);
    gallowsPost.position.set(-1.6, 3.2, 0);
    gallowsPost.castShadow = true;
    const gallowsBeamGeo = new THREE.BoxGeometry(3.2, 0.3, 0.3);
    const gallowsBeam = new THREE.Mesh(gallowsBeamGeo, darkWoodMat);
    gallowsBeam.position.set(-0.2, 5.3, 0);
    gallowsGroup.add(gallowsPost, gallowsBeam);

    // Noose rope
    const ropeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x9c8362, roughness: 0.9 });
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.position.set(0.6, 4.5, 0);
    gallowsGroup.add(rope);
    townGroup.add(gallowsGroup);

    // Saguaro Cacti scattered around perimeter
    const cactusCoords = [
      [-42, 0, -22], [-38, 0, 24], [35, 0, -28], [42, 0, 26],
      [-15, 0, -42], [18, 0, -45], [-12, 0, 42], [16, 0, 45],
      [-52, 0, 5], [50, 0, -5]
    ];
    cactusCoords.forEach(([cx, cy, cz]) => {
      const cGroup = new THREE.Group();
      cGroup.position.set(cx, cy, cz);
      const h = 4.5 + Math.random() * 2.5;
      const trunkGeo = new THREE.CylinderGeometry(0.38, 0.42, h, 12);
      const trunk = new THREE.Mesh(trunkGeo, cactusMat);
      trunk.position.y = h / 2;
      trunk.castShadow = true;
      cGroup.add(trunk);

      // Left arm
      const armGeo1 = new THREE.CylinderGeometry(0.24, 0.24, 1.8, 10);
      const arm1 = new THREE.Mesh(armGeo1, cactusMat);
      arm1.rotation.z = Math.PI / 2;
      arm1.position.set(-0.9, h * 0.55, 0);
      const armUp1 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.6, 10), cactusMat);
      armUp1.position.set(-1.6, h * 0.55 + 0.8, 0);
      arm1.castShadow = true;
      armUp1.castShadow = true;
      cGroup.add(arm1, armUp1);

      // Right arm
      if (Math.random() > 0.3) {
        const armGeo2 = new THREE.CylinderGeometry(0.24, 0.24, 1.6, 10);
        const arm2 = new THREE.Mesh(armGeo2, cactusMat);
        arm2.rotation.z = -Math.PI / 2;
        arm2.position.set(0.8, h * 0.42, 0);
        const armUp2 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.4, 10), cactusMat);
        armUp2.position.set(1.5, h * 0.42 + 0.7, 0);
        arm2.castShadow = true;
        armUp2.castShadow = true;
        cGroup.add(arm2, armUp2);
      }
      townGroup.add(cGroup);
      physics.addStaticBox([1.2, h, 1.2], [cx, h / 2, cz]);
    });

    // 8. Dynamic Physical Props (Cannon-es Rigid Bodies)
    // Dynamic Crates stacked in town
    const crateTex = ProceduralTextures.getCrateTexture(false);
    const crateMat = new THREE.MeshStandardMaterial({ map: crateTex, roughness: 0.8 });
    const tntTex = ProceduralTextures.getCrateTexture(true);
    const tntMat = new THREE.MeshStandardMaterial({ map: tntTex, roughness: 0.7 });

    const cratePositions: [number, number, number, boolean][] = [
      // Near Saloon
      [-10, 0.6, -9, false],
      [-10, 1.8, -9, false],
      [-8.6, 0.6, -9, false],
      [-10, 0.6, -7.6, true], // TNT keg near saloon corner!
      // Near Bank
      [8, 0.6, -9, false],
      [8, 1.8, -9, false],
      [9.4, 0.6, -9, false],
      [9.4, 0.6, -7.6, true], // TNT keg near bank!
      // Near Sheriff Office
      [-10, 0.6, 9, false],
      [-10, 1.8, 9, false],
      [-8.6, 0.6, 9, false],
      // Near Blacksmith
      [7, 0.6, 9, false],
      [8.4, 0.6, 9, true],
      // Center town cover cluster
      [-2, 0.6, 3, false],
      [-2, 1.8, 3, false],
      [-0.6, 0.6, 3, false],
      [2, 0.6, -3, false],
      [2, 1.8, -3, false],
      [3.4, 0.6, -3, true], // TNT in center ambush point
    ];

    cratePositions.forEach(([x, y, z, isTNT], idx) => {
      const size = 1.2;
      const geo = new THREE.BoxGeometry(size, size, size);
      const mesh = new THREE.Mesh(geo, isTNT ? tntMat : crateMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      if (isTNT) {
        physics.createTntKeg(`tnt_${idx}`, mesh, [x, y, z], 0.55, 1.1);
      } else {
        physics.createCrate(`crate_${idx}`, mesh, [x, y, z], [size, size, size]);
      }
      coverPoints.push(new THREE.Vector3(x, 0, z));
    });

    // Dynamic Rolling Barrels
    const barrelGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.1, 14);
    const barrelPositions: [number, number, number][] = [
      [-13, 0.6, -7],
      [14, 0.6, -8],
      [-13, 0.6, 7],
      [13, 0.6, 8],
    ];
    barrelPositions.forEach(([bx, by, bz], idx) => {
      const barrel = new THREE.Mesh(barrelGeo, darkWoodMat);
      barrel.castShadow = true;
      scene.add(barrel);
      physics.createRollingBarrel(`barrel_${idx}`, barrel, [bx, by, bz], 0.5, 1.1);
    });

    // Dynamic Physical Tumbleweeds rolling across Main Street
    const tumblePositions: [number, number, number][] = [
      [-30, 1.2, -4],
      [-20, 1.0, 2],
      [-10, 1.0, -2],
      [0, 1.0, 5],
    ];
    tumblePositions.forEach(([tx, ty, tz], idx) => {
      const tumbleGroup = new THREE.Group();
      // Multi-branch dry thorn bundle
      const twigMat = new THREE.MeshStandardMaterial({ color: 0x96784d, roughness: 0.95 });
      for (let i = 0; i < 8; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55 + Math.random() * 0.15, 0.04, 4, 12), twigMat);
        ring.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        tumbleGroup.add(ring);
      }
      scene.add(tumbleGroup);
      physics.createTumbleweed(`tumble_${idx}`, tumbleGroup, [tx, ty, tz], 0.65);
    });

    // Bounty Outlaw Enemy Patrol & Spawn Points
    spawnPoints.push(
      new THREE.Vector3(-18, 0, -8), // Saloon front
      new THREE.Vector3(12, 0, -7),  // Bank alley
      new THREE.Vector3(22, 0, 0),   // East road entrance
      new THREE.Vector3(-24, 0, 8),  // Jailhouse rear
      new THREE.Vector3(14, 0, 8),   // Stable corral
      new THREE.Vector3(-32, 0, 0),  // Water tower base
      new THREE.Vector3(0, 0, 22),   // South desert road
      new THREE.Vector3(0, 0, -24)   // North canyon trail
    );

    // Wanted Posters on Saloon and Sheriff boardwalk walls
    const poster1Tex = ProceduralTextures.getWantedPosterTexture('Black-Hat Jack', 2500);
    const poster2Tex = ProceduralTextures.getWantedPosterTexture('Rattlesnake Pete', 5000);
    const poster1Mat = new THREE.MeshStandardMaterial({ map: poster1Tex, roughness: 0.7 });
    const poster2Mat = new THREE.MeshStandardMaterial({ map: poster2Tex, roughness: 0.7 });

    const p1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.7), poster1Mat);
    p1.position.set(-13, 2.2, -10.1);
    p1.receiveShadow = true;
    townGroup.add(p1);

    const p2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.7), poster2Mat);
    p2.position.set(-13, 2.2, 10.9);
    p2.rotation.y = Math.PI;
    p2.receiveShadow = true;
    townGroup.add(p2);

    return {
      group: townGroup,
      spawnPoints,
      coverPoints,
      saloonDoors,
    };
  }
}
