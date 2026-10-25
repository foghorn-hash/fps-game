/**
 * Dust & Lead: 3D Wild West FPS
 * Root React application mounting the isolated Three.js & Cannon-es Canvas
 * with seamless Game Shell transitions.
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, GameStateHUD } from './game/GameEngine';
import { WeaponType } from './game/weapons';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { sounds } from './audio/SoundEffects';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameStateHUD>({
    health: 100,
    maxHealth: 100,
    weapon: 'revolver',
    weaponName: 'Colt .45 Peacemaker',
    ammo: 6,
    magSize: 6,
    reserveAmmo: 48,
    isReloading: false,
    score: 0,
    bountyTarget: 'Black-Hat Jack',
    banditsRemaining: 8,
    totalBandits: 8,
    wave: 1,
    isHit: false,
    isHeadshotHit: false,
    gameStatus: 'title',
  });

  const [isMuted, setIsMuted] = useState(false);
  const [difficulty, setDifficulty] = useState<'greenhorn' | 'gunslinger' | 'desperado'>('gunslinger');
  const [sensitivity, setSensitivity] = useState(0.0022);

  // Initialize 3D Engine once on mount
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(mountRef.current);
    engineRef.current = engine;

    engine.onHudUpdate = (hud) => {
      setGameState(hud);
    };

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleSelectWeapon = (w: WeaponType) => {
    if (engineRef.current) {
      engineRef.current.weapons.switchWeapon(w);
    }
  };

  const handleChangeSensitivity = (val: number) => {
    setSensitivity(val);
    if (engineRef.current) {
      engineRef.current.sensitivity = val;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#1c120a] select-none">
      {/* Isolated 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

      {/* Title Screen Overlay */}
      {gameState.gameStatus === 'title' && (
        <TitleScreen
          onStart={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          difficulty={difficulty}
          onSelectDifficulty={setDifficulty}
        />
      )}

      {/* In-Game World-Matched HUD Overlay */}
      {gameState.gameStatus !== 'title' && (
        <GameHUD
          hud={gameState}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onResume={handleResume}
          onRestart={handleRestart}
          onSelectWeapon={handleSelectWeapon}
          sensitivity={sensitivity}
          onChangeSensitivity={handleChangeSensitivity}
        />
      )}
    </div>
  );
}
