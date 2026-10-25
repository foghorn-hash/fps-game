# 🤠 Dust & Lead: 3D Wild West FPS (WordPress Plugin & Standalone Game)

[![WordPress 6.0+](https://img.shields.io/badge/WordPress-6.0%2B-blue.svg)](https://wordpress.org)
[![PHP 7.4+](https://img.shields.io/badge/PHP-7.4%2B-purple.svg)](https://php.net)
[![Three.js](https://img.shields.io/badge/Three.js-r160%2B-black.svg)](https://threejs.org)
[![Cannon-es](https://img.shields.io/badge/Physics-Cannon--es-orange.svg)](https://github.com/pmndrs/cannon-es)
[![License: GPL-2.0](https://img.shields.io/badge/License-GPL%202.0-green.svg)](http://www.gnu.org/licenses/gpl-2.0.txt)

**Dust & Lead** is an action-packed 3D first-person shooter set in the dusty frontier town of **Dusty Creek**, powered by **Three.js** and the **Cannon-es** rigid-body physics engine.

This repository includes both the modern TypeScript source code and a production-ready **WordPress plugin** (`dust-and-lead-fps.zip`) ready to install on any WordPress site via shortcode, Gutenberg block, or dedicated full-viewport page.

---

## 🌟 Key Features

- **Realistic Rigid-Body Physics Engine (`cannon-es`)**:
  - **Dynamic Wooden Crates**: Stackable, kickable rigid bodies that splinter and topple when struck by bullets or blast waves.
  - **Explosive TNT Powder Kegs**: Ignited by gunfire, detonating into radial blast shockwaves that launch nearby barrels and outlaws into the air.
  - **Rolling Barrels & Windblown Tumbleweeds**: Spherical and cylindrical dynamic bodies affected by rolling friction and ambient desert wind.
  - **Throwable Physical Dynamite**: Bouncing explosive sticks with a 3.2-second sizzling fuse and high-impulse radial damage.
- **Frontier Cowboy Realm**:
  - Complete Western town featuring the **Silver Dollar Saloon** (with swinging batwing doors and sniper balcony), **Territorial Bank & Vault**, **Mercantile Store**, **Sheriff's Office & Jail**, **Gallows**, **Water Tower**, and natural red-rock canyon mesas.
- **Authentic Weapon Arsenal (3D Viewmodels)**:
  - **Colt .45 SAA "Peacemaker"**: 6-round revolving cylinder, animated hammer strike, and fan-the-hammer ADS.
  - **Winchester 1873 Lever-Action**: 14-round tubular magazine, pinpoint long-range precision, and authentic lever-cock cycling.
  - **Coach Gun 12-Gauge**: Twin side-by-side barrels delivering massive buckshot spread and physical knockback.
  - **TNT Dynamite Sticks**: Physical throwable explosives with fuse sparks.
- **Procedural Web Audio Synthesizer**:
  - Zero-dependency audio generating revolver cracks with canyon reverb, lever-action metallic clicks, shotgun blasts, explosive detonations, ricochet whistles, and victory stings.
- **WordPress Integration**:
  - Embed anywhere via `[dust_and_lead_fps]` shortcode or Gutenberg block.
  - Built-in REST API bounty leaderboard storing top outlaw hunter scores in the WordPress database.
  - Standalone full-screen page template at `/dust-and-lead-game/`.

---

## 📦 WordPress Plugin Installation

The plugin is bundled as a self-contained archive at `/wordpress-plugin/dust-and-lead-fps.zip`.

### Method 1: WordPress Admin Upload (Recommended)
1. In your WordPress admin panel, go to **Plugins** → **Add New**.
2. Click **Upload Plugin** at the top of the page.
3. Select `dust-and-lead-fps.zip` and click **Install Now**.
4. Click **Activate Plugin**.

### Method 2: Manual FTP / Directory Installation
1. Extract `dust-and-lead-fps.zip` (or copy the `/wordpress-plugin/dust-and-lead-fps/` directory).
2. Upload the `dust-and-lead-fps` folder to your WordPress installation:
   ```
   wp-content/plugins/dust-and-lead-fps/
   ```
3. Go to **Plugins** → **Installed Plugins** and click **Activate** under **Dust & Lead - 3D Wild West FPS**.

---

## 🎮 Usage & Embedding in WordPress

### 1. Shortcode Embed
Paste the shortcode into any WordPress Post, Page, or Widget:

```text
[dust_and_lead_fps]
```

#### Shortcode Attributes Matrix:
| Attribute | Default | Description | Allowed Values |
| :--- | :--- | :--- | :--- |
| `width` | `100%` | Width of the game container | CSS values: `100%`, `960px`, `1200px` |
| `height` | `720px` | Viewport height | CSS values: `600px`, `720px`, `80vh` |
| `difficulty` | `gunslinger` | Default game difficulty | `greenhorn`, `gunslinger`, `desperado` |
| `fullscreen` | `yes` | Display fullscreen expand button | `yes`, `no` |
| `sound` | `on` | Initial audio status | `on`, `off` |
| `title` | `Dust & Lead - 3D Wild West FPS` | Header title label | Any text string |

#### Example Custom Shortcodes:
```text
<!-- Cinematic widescreen embed -->
[dust_and_lead_fps width="100%" height="800px" fullscreen="yes"]

<!-- Hardcore Desperado duel mode -->
[dust_and_lead_fps difficulty="desperado" height="750px"]
```

---

### 2. Gutenberg Block
1. Open the Gutenberg editor on any page or post.
2. Click the `+` button and search for **Dust & Lead**.
3. Insert the **Dust & Lead 3D FPS** block.
4. Customize container height, default difficulty, and fullscreen options in the Block Inspector sidebar.

---

### 3. Dedicated Full-Viewport Page (No Theme Interference)
The plugin automatically registers a dedicated standalone URL on your WordPress domain:
```
https://yourdomain.com/dust-and-lead-game/
```
Visiting this URL serves the full-viewport 3D game without any theme headers, sidebars, or footers for an authentic 100% fullscreen desktop FPS experience.

---

### 4. Elementor, Divi & Page Builders
Add a **Shortcode** widget or **HTML** widget in Elementor, Divi, Beaver Builder, or WPBakery, and enter:
```html
[dust_and_lead_fps width="100%" height="750px"]
```

---

## ⚙️ WordPress Admin Settings & Bounty Leaderboard

Navigate to **Settings** → **Dust & Lead FPS** in your WordPress dashboard to access:

1. **Default Embed Settings**: Set global canvas height, width, and default difficulty.
2. **Fullscreen Button Toggle**: Show or hide the top-right fullscreen expand button.
3. **Bounty Leaderboard**: View the Sheriff Hall of Fame recording top player scores submitted via the REST API.

### REST API Endpoints:
- `GET /wp-json/dust-and-lead/v1/scores`: Returns the top 10 player bounties.
- `POST /wp-json/dust-and-lead/v1/score`: Submits a bounty score with player name, wave reached, and difficulty level.

---

## 🕹️ Controls Reference

| Control | Action |
| :--- | :--- |
| **Mouse Look** | Aim / Look (Click canvas to lock pointer) |
| **W, A, S, D** | Move Forward / Left / Backward / Right |
| **Left Shift** | Sprint |
| **Space** | Jump (Grounded physics check) |
| **Left Mouse Button (LMB)** | Fire Weapon / Throw Dynamite |
| **Right Mouse Button (RMB)** | Aim Down Sights (ADS) / Fan Hammer |
| **R** | Reload Ammunition |
| **1** | Equip Colt .45 Peacemaker Revolver |
| **2** | Equip Winchester 1873 Lever-Action |
| **3** | Equip Coach Gun 12-Gauge Double-Barrel |
| **4 / G** | Equip / Quick Throw Dynamite |
| **Mouse Wheel** | Cycle Weapon Inventory |
| **Esc** | Pause Game / Adjust Mouse Sensitivity & Audio |

---

## 🛠️ Local Development & Building

### Prerequisites
- Node.js 18+
- npm or bun

### Setup & Run Dev Server
```bash
# Clone the repository
git clone https://github.com/matti-kiviharju/dust-and-lead-fps.git
cd dust-and-lead-fps

# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev
```

### Build & Package for WordPress
```bash
# 1. Compile production bundle
npm run build

# 2. Copy compiled assets into the WordPress plugin game directory
cp -r dist/* wordpress-plugin/dust-and-lead-fps/game/

# 3. Create distributable zip archive
cd wordpress-plugin && python3 -c "import shutil; shutil.make_archive('dust-and-lead-fps', 'zip', '.', 'dust-and-lead-fps')"
```

---

## 📁 Directory Structure

```
├── wordpress-plugin/
│   ├── dust-and-lead-fps.zip          # Ready-to-install WordPress plugin archive
│   └── dust-and-lead-fps/             # Plugin source folder
│       ├── dust-and-lead-fps.php      # Main plugin bootstrap, shortcode & rewrite rules
│       ├── includes/
│       │   ├── class-dust-and-lead-admin.php  # Admin settings page & leaderboard
│       │   └── class-dust-and-lead-api.php    # WP REST API score endpoints
│       ├── assets/
│       │   ├── css/dust-and-lead.css          # Frontier responsive theme styles
│       │   └── js/dust-and-lead-embed.js      # Pointer lock, fullscreen & postMessage helper
│       └── game/                              # Bundled standalone game build
│           ├── index.html
│           └── assets/
├── src/
│   ├── audio/
│   │   └── SoundEffects.ts            # Procedural Web Audio synthesizer
│   ├── physics/
│   │   └── PhysicsWorld.ts            # Cannon-es rigid body physics & explosions
│   ├── game/
│   │   ├── GameEngine.ts              # Core game coordinator & 60fps loop
│   │   ├── weapons.ts                 # 3D viewmodels, recoil & ballistics
│   │   ├── enemies.ts                 # Outlaw AI, telegraph windup & ragdolls
│   │   ├── worldGenerator.ts          # Procedural Western town & buildings
│   │   ├── proceduralTextures.ts      # Canvas-generated wood, dirt & rock textures
│   │   └── particles.ts               # GPU pooled smoke, spark & blast particles
│   ├── components/
│   │   ├── TitleScreen.tsx            # Cinematic title screen with SVG lockup
│   │   └── GameHUD.tsx                # Low-occlusion perimeter HUD & revolver cylinder
│   ├── App.tsx                        # Isolated Three.js canvas container
│   ├── index.css
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔒 Security & Browser Compatibility

- **Pointer Lock API**: When embedded inside WordPress via iframe, the plugin applies `allow="pointer-lock; fullscreen; autoplay"` to allow standard first-person mouse look.
- **WebGL2 Support**: Supported in all modern browsers (Chrome, Edge, Firefox, Safari, Brave). If hardware acceleration is disabled, an automatic software WebGL guard safely downscales shadow passes while keeping all game logic and 3D scenes identical.
- **Audio Autoplay**: Sound begins following the first user gesture (e.g. clicking "Draw Revolver" or pressing `Space`/`Enter`), complying with browser autoplay restrictions.

---

## 📜 License

This project is licensed under the **GNU General Public License v2.0 or later (GPL-2.0+)**.
