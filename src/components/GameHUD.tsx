/**
 * World-Matched, Low-Occlusion Western FPS HUD
 * Unobstructed playfield (>85%), perimeter status clusters, revolver cylinder UI,
 * hitmarkers, and Pause/Victory/Game Over modals.
 */

import React from 'react';
import { GameStateHUD } from '../game/GameEngine';
import { WeaponType } from '../game/weapons';
import { Volume2, VolumeX, RotateCcw, Play, Skull, Award, Crosshair } from 'lucide-react';

interface GameHUDProps {
  hud: GameStateHUD;
  isMuted: boolean;
  onToggleMute: () => void;
  onResume: () => void;
  onRestart: () => void;
  onSelectWeapon: (type: WeaponType) => void;
  sensitivity: number;
  onChangeSensitivity: (s: number) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  isMuted,
  onToggleMute,
  onResume,
  onRestart,
  onSelectWeapon,
  sensitivity,
  onChangeSensitivity,
}) => {
  const isDead = hud.gameStatus === 'gameover';
  const isVictory = hud.gameStatus === 'victory';
  const isPaused = hud.gameStatus === 'paused';

  // Revolver cylinder chamber rendering
  const renderRevolverCylinder = () => {
    const chambers = [];
    for (let i = 0; i < 6; i++) {
      const isLoaded = i < hud.ammo;
      const angle = (i * 60 * Math.PI) / 180;
      const cx = 24 + Math.cos(angle) * 14;
      const cy = 24 + Math.sin(angle) * 14;

      chambers.push(
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={4.2}
          fill={isLoaded ? '#e5b84c' : '#2d2720'}
          stroke={isLoaded ? '#82591b' : '#141210'}
          strokeWidth="1.2"
        />
      );
      if (isLoaded) {
        chambers.push(
          <circle key={`primer_${i}`} cx={cx} cy={cy} r={1.6} fill="#a64019" />
        );
      }
    }
    return chambers;
  };

  return (
    <div className="absolute inset-0 select-none pointer-events-none z-10 text-[#f5ecd5] font-serif overflow-hidden">
      {/* Damage vignette flash */}
      {hud.health < 40 && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            boxShadow: 'inset 0 0 90px rgba(160, 20, 10, 0.65)',
            opacity: (40 - hud.health) / 40,
          }}
        />
      )}

      {/* --- Perimeter Top Cluster --- */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        {/* Left: Health & Sheriff Vitality */}
        <div className="bg-[#1f140e]/85 border border-[#855e3a] px-3.5 py-2 rounded-sm shadow-lg flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            {/* Health Flask Icon */}
            <svg className="w-6 h-6 text-[#c93b28]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] tracking-widest uppercase text-[#c29b71] font-sans font-semibold">
              Grit / Health
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span
                className={`text-2xl font-black font-mono tabular-nums leading-none ${
                  hud.health <= 25 ? 'text-red-400' : 'text-[#f5ecd5]'
                }`}
              >
                {hud.health}
              </span>
              <span className="text-xs text-[#9c7855] font-mono">/ 100</span>
            </div>
          </div>
        </div>

        {/* Center: Wave & Town Threat Meter */}
        <div className="bg-[#1f140e]/85 border border-[#855e3a] px-4 py-2 rounded-sm shadow-lg text-center">
          <div className="text-[10px] tracking-widest uppercase text-[#c29b71] font-sans font-semibold">
            Wave {hud.wave} · Dusty Creek
          </div>
          <div className="flex items-center space-x-2 mt-0.5 justify-center">
            <span className="text-lg font-bold font-mono tabular-nums text-[#f3cf7a]">
              {hud.banditsRemaining}
            </span>
            <span className="text-xs text-[#a3805b] uppercase font-sans">
              Outlaws in Town
            </span>
          </div>
        </div>

        {/* Right: Bounty Ledger */}
        <div className="bg-[#1f140e]/85 border border-[#855e3a] px-3.5 py-2 rounded-sm shadow-lg text-right">
          <div className="text-[10px] tracking-widest uppercase text-[#c29b71] font-sans font-semibold">
            Bounty Reward
          </div>
          <div className="text-xl font-black font-mono tabular-nums text-[#52ba6e]">
            ${hud.score.toLocaleString()}
          </div>
        </div>
      </div>

      {/* --- Central Crosshair & Dynamic Hitmarker --- */}
      {hud.gameStatus === 'playing' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Subtle Western Crosshair */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Center dot */}
            <div className="w-1.5 h-1.5 bg-[#f5ecd5] rounded-full shadow-[0_0_4px_rgba(0,0,0,0.8)]" />

            {/* Crosshair ticks */}
            <div className="absolute top-0 w-[1.5px] h-2 bg-[#f5ecd5]/80" />
            <div className="absolute bottom-0 w-[1.5px] h-2 bg-[#f5ecd5]/80" />
            <div className="absolute left-0 h-[1.5px] w-2 bg-[#f5ecd5]/80" />
            <div className="absolute right-0 h-[1.5px] w-2 bg-[#f5ecd5]/80" />

            {/* Hitmarker X flash */}
            {hud.isHit && (
              <div
                className={`absolute inset-0 flex items-center justify-center animate-ping duration-150 ${
                  hud.isHeadshotHit ? 'text-red-500 scale-125' : 'text-[#f5ecd5]'
                }`}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <path d="M6 6L18 18M18 6L6 18" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Perimeter Bottom Cluster --- */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
        {/* Left: Quick Controls Reminder / Dynamite counter */}
        <div className="bg-[#1f140e]/85 border border-[#855e3a] px-3 py-2 rounded-sm shadow-lg flex items-center space-x-3 pointer-events-auto">
          <div className="text-xl">🧨</div>
          <div>
            <div className="text-[10px] tracking-wider uppercase text-[#c29b71] font-sans">
              Dynamite [G]
            </div>
            <div className="text-base font-black font-mono text-[#f5ecd5]">
              Ready
            </div>
          </div>
        </div>

        {/* Center: Sleek Weapon Selector Dock */}
        <div className="bg-[#1f140e]/90 border border-[#855e3a] p-1.5 rounded-sm shadow-xl flex items-center space-x-2 pointer-events-auto">
          {(
            [
              { id: 'revolver', key: '1', label: 'Peacemaker' },
              { id: 'repeater', key: '2', label: 'Winchester' },
              { id: 'shotgun', key: '3', label: 'Coach Gun' },
              { id: 'dynamite', key: '4', label: 'Dynamite' },
            ] as const
          ).map((w) => (
            <button
              key={w.id}
              onClick={() => onSelectWeapon(w.id)}
              className={`px-3 py-1.5 rounded-sm text-xs font-serif uppercase tracking-wider transition cursor-pointer flex items-center space-x-1.5 ${
                hud.weapon === w.id
                  ? 'bg-[#802419] text-[#fff2d9] border border-[#d68549] font-bold shadow-md'
                  : 'bg-[#2a1b12] text-[#b39577] hover:bg-[#3d2719] border border-transparent'
              }`}
            >
              <span className="font-mono text-[10px] opacity-70 bg-black/40 px-1 py-0.2 rounded">
                {w.key}
              </span>
              <span>{w.label}</span>
            </button>
          ))}
        </div>

        {/* Right: Weapon & Ammo Cylinder Cluster */}
        <div className="bg-[#1f140e]/85 border border-[#855e3a] p-3 rounded-sm shadow-lg flex items-center space-x-3 pointer-events-auto">
          {hud.weapon === 'revolver' ? (
            <svg className="w-12 h-12" viewBox="0 0 48 48">
              {/* Cylinder outline */}
              <circle cx="24" cy="24" r="22" fill="#18130e" stroke="#634529" strokeWidth="2" />
              <circle cx="24" cy="24" r="4" fill="#3d2c1e" stroke="#18130e" strokeWidth="1" />
              {renderRevolverCylinder()}
            </svg>
          ) : (
            <div className="text-2xl text-[#d9a84e]">
              {hud.weapon === 'repeater' ? '🎯' : hud.weapon === 'shotgun' ? '💥' : '🧨'}
            </div>
          )}

          <div>
            <div className="text-xs uppercase font-sans tracking-wider text-[#c29b71] font-semibold">
              {hud.weaponName}
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black font-mono tabular-nums leading-none text-[#f5ecd5]">
                {hud.isReloading ? 'RELOAD' : hud.ammo}
              </span>
              {hud.weapon !== 'dynamite' && (
                <span className="text-xs text-[#9c7855] font-mono">
                  / {hud.reserveAmmo}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Pause Modal --- */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-4 pointer-events-auto z-30">
          <div className="bg-[#1f140e] border-2 border-[#855e3a] p-6 max-w-sm w-full text-center shadow-2xl rounded-sm">
            <h2 className="text-2xl font-black uppercase tracking-widest text-[#f5ecd5] mb-1 font-serif">
              GAME PAUSED
            </h2>
            <div className="h-[1px] w-24 bg-[#855e3a] mx-auto mb-6" />

            {/* Mouse Sensitivity Slider */}
            <div className="mb-5 text-left bg-[#140c08] p-3 rounded border border-[#523821]">
              <div className="flex justify-between text-xs text-[#c29b71] mb-1">
                <span>Aim Sensitivity</span>
                <span className="font-mono text-[#f5ecd5]">
                  {(sensitivity * 1000).toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="4.5"
                step="0.1"
                value={sensitivity * 1000}
                onChange={(e) => onChangeSensitivity(parseFloat(e.target.value) / 1000)}
                className="w-full accent-[#c93b28] cursor-pointer"
              />
            </div>

            <div className="flex flex-col space-y-2.5">
              <button
                onClick={onResume}
                className="w-full py-2.5 bg-[#852b1e] hover:bg-[#a63727] text-[#fff3de] font-serif uppercase tracking-widest font-bold text-sm rounded-sm transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Resume Game</span>
              </button>

              <button
                onClick={onToggleMute}
                className="w-full py-2 bg-[#2d1e15] hover:bg-[#3d2b1f] text-[#c29b71] font-serif uppercase tracking-wider text-xs rounded-sm transition cursor-pointer flex items-center justify-center space-x-2 border border-[#593c24]"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                <span>{isMuted ? 'Unmute Sound' : 'Mute Sound'}</span>
              </button>

              <button
                onClick={onRestart}
                className="w-full py-2 bg-[#21150e] hover:bg-[#2d1e15] text-[#9c7b5a] font-serif uppercase tracking-wider text-xs rounded-sm transition cursor-pointer flex items-center justify-center space-x-2 border border-[#422d1b]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Duel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Game Over Modal --- */}
      {isDead && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-4 pointer-events-auto z-30">
          <div className="bg-[#1a0e08] border-2 border-[#8a2216] p-8 max-w-md w-full text-center shadow-2xl rounded-sm">
            <div className="text-5xl mb-2 text-[#b02e21]">⚰️</div>
            <h2 className="text-3xl font-black uppercase tracking-widest text-[#f5ecd5] font-serif">
              SHOT DOWN
            </h2>
            <p className="text-xs text-[#a68665] font-sans mt-1 mb-6">
              You succumbed to the outlaw gunfire in the dusty streets.
            </p>

            <div className="bg-[#120a06] p-4 rounded border border-[#452718] mb-6 flex justify-around">
              <div>
                <div className="text-[10px] uppercase text-[#8c6b4d] font-sans">
                  Final Bounty
                </div>
                <div className="text-xl font-black font-mono text-[#52ba6e]">
                  ${hud.score.toLocaleString()}
                </div>
              </div>
              <div className="w-[1px] bg-[#361e12]" />
              <div>
                <div className="text-[10px] uppercase text-[#8c6b4d] font-sans">
                  Wave Reached
                </div>
                <div className="text-xl font-black font-mono text-[#f5ecd5]">
                  {hud.wave}
                </div>
              </div>
            </div>

            <button
              onClick={onRestart}
              className="w-full py-3 bg-[#852b1e] hover:bg-[#a63727] text-[#fff3de] font-serif uppercase tracking-widest font-bold text-sm rounded-sm transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Draw Again (Restart)</span>
            </button>
          </div>
        </div>
      )}

      {/* --- Victory Modal --- */}
      {isVictory && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 pointer-events-auto z-30">
          <div className="bg-[#1f140e] border-2 border-[#d9a84e] p-8 max-w-md w-full text-center shadow-2xl rounded-sm">
            <div className="text-5xl mb-2 text-[#d9a84e]">⭐</div>
            <h2 className="text-3xl font-black uppercase tracking-widest text-[#fdf4db] font-serif">
              TERRITORY PACIFIED
            </h2>
            <p className="text-xs text-[#d4b998] font-sans mt-1 mb-6">
              You wiped out the outlaw gangs and restored law and order to Dusty Creek!
            </p>

            <div className="bg-[#140c08] p-4 rounded border border-[#6b4e2d] mb-6">
              <div className="text-[10px] uppercase text-[#c29b71] font-sans">
                Total Bounty Collected
              </div>
              <div className="text-3xl font-black font-mono text-[#52ba6e] mt-1">
                ${hud.score.toLocaleString()}
              </div>
            </div>

            <button
              onClick={onRestart}
              className="w-full py-3 bg-[#a8742b] hover:bg-[#bf8736] text-[#fffbf0] font-serif uppercase tracking-widest font-bold text-sm rounded-sm transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg"
            >
              <Award className="w-4 h-4" />
              <span>Patrol Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
