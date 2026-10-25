/**
 * Title Screen for Dust & Lead 3D Cowboy FPS
 * Bespoke inline SVG Western lockup, live 3D world backdrop, start CTA, and control hints.
 */

import React, { useEffect } from 'react';
import { Volume2, VolumeX, ShieldAlert, Crosshair, Award } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface TitleScreenProps {
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  difficulty: 'greenhorn' | 'gunslinger' | 'desperado';
  onSelectDifficulty: (d: 'greenhorn' | 'gunslinger' | 'desperado') => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  isMuted,
  onToggleMute,
  difficulty,
  onSelectDifficulty,
}) => {
  // Listen for Space / Enter to start game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-8 select-none pointer-events-none z-20 text-[#f6ecd2]">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center space-x-2 text-xs font-serif tracking-widest uppercase bg-[#231710]/80 border border-[#8f6844] px-3 py-1.5 rounded-sm">
          <span className="w-2 h-2 rounded-full bg-[#c89240] inline-block" />
          <span>Territorial Outpost · Dusty Creek 1881</span>
        </div>

        <button
          onClick={onToggleMute}
          className="pointer-events-auto flex items-center space-x-2 bg-[#231710]/80 hover:bg-[#3d2719] border border-[#8f6844] px-3 py-1.5 rounded-sm transition cursor-pointer text-xs uppercase tracking-wider text-[#e6c99c]"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#e6c99c]" />}
          <span>{isMuted ? 'Muted' : 'Sound ON'}</span>
        </button>
      </div>

      {/* Hero Centerpiece Lockup with Bespoke SVG */}
      <div className="flex flex-col items-center justify-center my-auto text-center">
        {/* Western Sheriff Star & Badge Lockup */}
        <div className="mb-4">
          <svg className="w-24 h-24 text-[#d9a84e] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" viewBox="0 0 100 100" fill="currentColor">
            {/* 7-point Sheriff Star */}
            <path
              d="M50 4 L61 31 L90 32 L68 52 L76 80 L50 65 L24 80 L32 52 L10 32 L39 31 Z"
              fill="#c89240"
              stroke="#543715"
              strokeWidth="2"
            />
            {/* Inner Circle & Star Emblem */}
            <circle cx="50" cy="50" r="19" fill="#2d1c10" stroke="#f6ecd2" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="2.5" fill="#f6ecd2" />
            <text x="50" y="53" textAnchor="middle" fill="#d9a84e" fontSize="7" fontWeight="bold" fontFamily="serif" letterSpacing="0.5">MARSHAL</text>
          </svg>
        </div>

        {/* Title Lockup */}
        <h1 className="text-6xl md:text-7xl font-black tracking-tight font-serif uppercase text-[#fdf4db] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
          DUST & LEAD
        </h1>
        <div className="flex items-center space-x-4 my-2">
          <div className="h-[2px] w-16 bg-gradient-to-r from-transparent to-[#c89240]" />
          <p className="text-sm md:text-base font-serif tracking-[0.25em] uppercase text-[#e4bc75] font-semibold">
            Wild West 3D First-Person Gunfighter
          </p>
          <div className="h-[2px] w-16 bg-gradient-to-l from-transparent to-[#c89240]" />
        </div>

        <p className="max-w-md text-xs md:text-sm text-[#d4b998] font-sans leading-relaxed drop-shadow mt-1 mb-6">
          Rigid-body physics engine, destructive TNT kegs, bullet ricochets, and relentless frontier outlaws.
        </p>

        {/* Difficulty Selector */}
        <div className="flex items-center space-x-2 mb-6 pointer-events-auto">
          {(['greenhorn', 'gunslinger', 'desperado'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => onSelectDifficulty(lvl)}
              className={`px-3 py-1 text-xs font-serif uppercase tracking-wider rounded-sm border transition cursor-pointer ${
                difficulty === lvl
                  ? 'bg-[#8f241a] text-[#fff0d6] border-[#d9834e] font-bold shadow-lg shadow-black/60'
                  : 'bg-[#21150e]/80 text-[#ba9a79] border-[#5e432c] hover:bg-[#362215]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Primary Draw / Start CTA */}
        <button
          onClick={onStart}
          className="pointer-events-auto group relative px-10 py-3.5 bg-gradient-to-b from-[#b34026] to-[#7a2012] hover:from-[#c94b2f] hover:to-[#912516] active:translate-y-0.5 border-2 border-[#d9a84e] shadow-[0_8px_24px_rgba(0,0,0,0.85)] rounded-sm cursor-pointer transition flex items-center space-x-3 text-lg font-serif font-black tracking-widest uppercase text-[#fff7e6]"
        >
          <Crosshair className="w-5 h-5 text-[#ffd375] group-hover:rotate-45 transition duration-300" />
          <span>DRAW REVOLVER</span>
          <span className="text-xs bg-[#24130a] text-[#ffd375] px-2 py-0.5 rounded border border-[#8a5d2b] font-mono">SPACE</span>
        </button>
      </div>

      {/* Control Hint Line (Per Game Craft Directives) */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full text-xs font-mono text-[#d6b792] border-t border-[#8f6844]/40 pt-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="tracking-wide">
          <span className="text-[#ffd375] font-semibold">WASD</span> Move · <span className="text-[#ffd375] font-semibold">Shift</span> Sprint · <span className="text-[#ffd375] font-semibold">Space</span> Jump · <span className="text-[#ffd375] font-semibold">LMB</span> Shoot · <span className="text-[#ffd375] font-semibold">RMB</span> Fan/Aim · <span className="text-[#ffd375] font-semibold">R</span> Reload · <span className="text-[#ffd375] font-semibold">1-4 / Scroll</span> Weapons · <span className="text-[#ffd375] font-semibold">G</span> Dynamite · <span className="text-[#ffd375] font-semibold">Esc</span> Pause
        </div>
        <div className="mt-2 md:mt-0 font-serif text-[#ffd375]/90 text-[11px] tracking-wider uppercase">
          Full 3D Physics · Cannon-es · Web Audio
        </div>
      </div>
    </div>
  );
};
