import React, { useEffect, useRef } from 'react';
import { GameState, FishEntity } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  rodPosition: number; // 0 to 1 (screen width)
  hookDepth: number; // 0 to 100%
  fishes: FishEntity[];
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, rodPosition, hookDepth, fishes }) => {
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      
      {/* Sky */}
      <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-sky-300 to-blue-200">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-100 rounded-full blur-2xl opacity-60"></div>
        {/* Clouds */}
        <div className="absolute top-20 left-[20%] w-32 h-10 bg-white rounded-full blur-lg opacity-40 animate-float"></div>
        <div className="absolute top-10 right-[10%] w-48 h-12 bg-white rounded-full blur-lg opacity-30 animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Ocean */}
      <div className="absolute top-[30%] left-0 w-full h-[70%] bg-gradient-to-b from-blue-500 via-blue-700 to-indigo-950 shadow-[inset_0_10px_20px_rgba(0,0,0,0.2)]">
        
        {/* Sun rays underwater */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[linear-gradient(45deg,transparent_40%,rgba(255,255,255,0.3)_45%,transparent_50%)] bg-[length:200%_200%] animate-pulse"></div>

        {/* Fishes */}
        {fishes.map((fish) => (
          <div
            key={fish.id}
            className="absolute transition-transform duration-1000 ease-linear"
            style={{
              left: `${fish.x}%`,
              top: `${fish.y}%`,
              transform: `scaleX(${fish.direction})`,
              width: '40px',
              height: '20px',
              opacity: 0.6
            }}
          >
             {/* Simple CSS Fish */}
             <svg viewBox="0 0 100 60" className="fill-current text-white drop-shadow-lg">
                <path d="M80,30 Q60,5 30,30 T0,30 Q20,55 50,30 T100,30 L80,30 L90,10 L80,30 Z" />
             </svg>
          </div>
        ))}
        
        {/* Hook Line */}
        <div 
            className="absolute top-0 w-0.5 bg-white/50 origin-top transition-none"
            style={{
                left: '50%', // Simplified to always center for this view, or use rodPosition
                height: `${hookDepth}%`
            }}
        >
            {/* The Hook/Lure */}
            <div className="absolute bottom-0 -left-1.5 w-3 h-4 bg-red-500 rounded-b-full border border-white/50 shadow-[0_0_10px_rgba(255,0,0,0.8)]"></div>
        </div>

      </div>

      {/* Surface Water Line */}
      <div className="absolute top-[30%] left-0 w-full h-4 bg-blue-400 opacity-50 blur-[2px]"></div>

    </div>
  );
};

export default GameCanvas;
