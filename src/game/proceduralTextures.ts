/**
 * Procedural Texture Generator
 * Creates rich Western materials without any external asset dependencies.
 */

import * as THREE from 'three';

export class ProceduralTextures {
  private static cachedTextures: Map<string, THREE.CanvasTexture> = new Map();

  // Weathered Western Wood Planks (horizontal planks, grain, nail heads)
  public static getWoodTexture(): THREE.CanvasTexture {
    if (this.cachedTextures.has('wood')) return this.cachedTextures.get('wood')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base warm sun-bleached wood
    ctx.fillStyle = '#6e5038';
    ctx.fillRect(0, 0, 512, 512);

    // Planks
    const plankHeight = 64;
    for (let y = 0; y < 512; y += plankHeight) {
      // Slight tone shift per plank
      const toneOffset = (Math.random() - 0.5) * 20;
      ctx.fillStyle = `rgb(${110 + toneOffset}, ${80 + toneOffset * 0.7}, ${56 + toneOffset * 0.5})`;
      ctx.fillRect(0, y, 512, plankHeight - 2);

      // Plank grain lines
      for (let i = 0; i < 40; i++) {
        ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(50, 32, 18, 0.22)' : 'rgba(140, 105, 75, 0.18)';
        ctx.lineWidth = Math.random() * 2 + 0.5;
        const lineY = y + Math.random() * (plankHeight - 4);
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.bezierCurveTo(170, lineY + (Math.random() - 0.5) * 6, 340, lineY + (Math.random() - 0.5) * 6, 512, lineY);
        ctx.stroke();
      }

      // Dark seam between planks
      ctx.fillStyle = '#26170d';
      ctx.fillRect(0, y + plankHeight - 3, 512, 3);

      // Iron nail heads
      for (let x = 32; x < 512; x += 128) {
        ctx.fillStyle = '#22201e';
        ctx.beginPath();
        ctx.arc(x + (Math.random() - 0.5) * 6, y + 10, 3, 0, Math.PI * 2);
        ctx.arc(x + (Math.random() - 0.5) * 6, y + plankHeight - 12, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cachedTextures.set('wood', texture);
    return texture;
  }

  // Desert Dirt Ground Texture with dust, gravel, and wagon tracks
  public static getGroundTexture(): THREE.CanvasTexture {
    if (this.cachedTextures.has('ground')) return this.cachedTextures.get('ground')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Sunbaked dusty dirt base
    ctx.fillStyle = '#b68853';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle noise and dust mottling
    for (let i = 0; i < 30000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random();
      if (r < 0.4) {
        ctx.fillStyle = 'rgba(150, 105, 60, 0.12)';
      } else if (r < 0.8) {
        ctx.fillStyle = 'rgba(215, 175, 120, 0.14)';
      } else {
        ctx.fillStyle = 'rgba(75, 48, 25, 0.08)';
      }
      ctx.fillRect(x, y, 2, 2);
    }

    // Small stones and pebbles
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 2.5 + 1;
      ctx.fillStyle = 'rgba(70, 55, 40, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = 'rgba(230, 200, 160, 0.4)';
      ctx.beginPath();
      ctx.arc(x - 0.7, y - 0.7, radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(24, 24);
    this.cachedTextures.set('ground', texture);
    return texture;
  }

  // Red Sandstone Canyon Rock texture for surrounding mesas and cliffs
  public static getRockTexture(): THREE.CanvasTexture {
    if (this.cachedTextures.has('rock')) return this.cachedTextures.get('rock')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Terracotta base
    ctx.fillStyle = '#a65437';
    ctx.fillRect(0, 0, 512, 512);

    // Geological sedimentary strata
    const layers = [
      '#bf6845', '#8f432a', '#c77855', '#7a3621', '#d48866', '#662a19'
    ];
    let curY = 0;
    while (curY < 512) {
      const h = Math.random() * 32 + 16;
      ctx.fillStyle = layers[Math.floor(Math.random() * layers.length)];
      ctx.fillRect(0, curY, 512, h);

      // Micro striations
      for (let j = 0; j < 6; j++) {
        ctx.strokeStyle = 'rgba(40, 15, 8, 0.18)';
        ctx.lineWidth = Math.random() * 2 + 1;
        const ly = curY + Math.random() * h;
        ctx.beginPath();
        ctx.moveTo(0, ly);
        ctx.lineTo(512, ly + (Math.random() - 0.5) * 4);
        ctx.stroke();
      }
      curY += h;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cachedTextures.set('rock', texture);
    return texture;
  }

  // Wooden Crate Texture with cross bracings and frontier stencil
  public static getCrateTexture(isTNT: boolean = false): THREE.CanvasTexture {
    const key = isTNT ? 'tnt_crate' : 'crate';
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Wood base
    ctx.fillStyle = isTNT ? '#9e3223' : '#825e3c';
    ctx.fillRect(0, 0, 256, 256);

    // Planks
    for (let y = 0; y < 256; y += 42) {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, y, 256, 2);
    }

    // Outer border frame
    ctx.strokeStyle = isTNT ? '#5a1910' : '#4a331c';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 242, 242);

    // Cross brace
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(246, 246);
    ctx.stroke();

    // Corner rivets
    ctx.fillStyle = '#1e1c1a';
    [[14, 14], [242, 14], [14, 242], [242, 242]].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stencil text
    ctx.save();
    ctx.fillStyle = isTNT ? '#ffd147' : '#2b1c10';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.translate(128, 128);
    ctx.rotate(isTNT ? 0 : -Math.PI / 4);
    ctx.fillText(isTNT ? 'DANGER TNT' : 'FRONTIER CO.', 0, isTNT ? -10 : 0);
    if (isTNT) {
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('HIGH EXPLOSIVE', 0, 14);
    }
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cachedTextures.set(key, texture);
    return texture;
  }

  // Saloon / Store Signboard
  public static createSignTexture(title: string, sub: string, bgColor = '#362114', textColor = '#f4e2bb'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Wooden background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 128);

    // Weathered border
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 496, 112);
    ctx.strokeRect(14, 14, 484, 100);

    // Typography
    ctx.fillStyle = textColor;
    ctx.font = 'bold 38px serif';
    ctx.textAlign = 'center';
    ctx.fillText(title.toUpperCase(), 256, 58);

    ctx.font = 'italic 18px serif';
    ctx.fillText(sub, 256, 92);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Wanted Poster Texture with bounty portrait
  public static getWantedPosterTexture(name: string, bounty: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 360;
    const ctx = canvas.getContext('2d')!;

    // Parchment paper
    ctx.fillStyle = '#f0deb4';
    ctx.fillRect(0, 0, 256, 360);

    // Aged edges
    ctx.strokeStyle = '#c2a87a';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 248, 352);

    // Header
    ctx.fillStyle = '#2b1b11';
    ctx.font = '900 32px serif';
    ctx.textAlign = 'center';
    ctx.fillText('WANTED', 128, 45);

    ctx.font = 'bold 15px serif';
    ctx.fillText('DEAD OR ALIVE', 128, 70);

    // Outlaw portrait box
    ctx.strokeRect(40, 85, 176, 160);
    ctx.fillStyle = '#dfcb9f';
    ctx.fillRect(42, 87, 172, 156);

    // Bandit sketch (silhouette)
    ctx.fillStyle = '#2b1b11';
    // Hat
    ctx.beginPath();
    ctx.ellipse(128, 130, 48, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(106, 104, 44, 26);
    // Head & Bandana
    ctx.beginPath();
    ctx.arc(128, 145, 20, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#f0deb4';
    ctx.fillRect(118, 142, 6, 3);
    ctx.fillRect(132, 142, 6, 3);
    // Shoulders
    ctx.fillStyle = '#2b1b11';
    ctx.beginPath();
    ctx.moveTo(70, 240);
    ctx.lineTo(128, 170);
    ctx.lineTo(186, 240);
    ctx.closePath();
    ctx.fill();

    // Name & Bounty
    ctx.fillStyle = '#2b1b11';
    ctx.font = 'bold 20px serif';
    ctx.fillText(name.toUpperCase(), 128, 280);

    ctx.fillStyle = '#8f2015';
    ctx.font = '900 24px serif';
    ctx.fillText(`$${bounty.toLocaleString()} REWARD`, 128, 320);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
}
