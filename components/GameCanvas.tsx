import React from 'react';
import { GameState, FishEntity } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  rodPosition: number; 
  hookDepth: number; 
  fishes: FishEntity[];
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, rodPosition, hookDepth, fishes }) => {
  
  const getFishVisuals = (id: number) => {
    const hash = id * 2654435761 % 2 ** 32;
    const hue = Math.abs(hash % 360);
    const scale = 0.8 + (Math.abs(hash % 50) / 100);
    const animType = Math.abs(hash % 3);
    const duration = 2 + (Math.abs(hash % 20) / 10);
    const delay = -(Math.abs(hash % 50) / 10);
    
    let animName = 'swim-basic';
    if (animType === 1) animName = 'swim-wobble';
    if (animType === 2) animName = 'swim-dash';

    return {
      filter: `hue-rotate(${hue}deg) drop-shadow(0 4px 6px rgba(0,0,0,0.3))`,
      animation: `${animName} ${duration}s ease-in-out infinite alternate`,
      animationDelay: `${delay}s`,
      transform: `scale(${scale})`
    };
  };

  const isWaiting = gameState === GameState.WAITING;
  const isBite = gameState === GameState.BITE;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-gradient-to-b from-sky-400 to-sky-200">
      
      <style>{`
        @keyframes swim-basic {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-3deg); }
          100% { transform: translateY(8px) rotate(3deg); }
        }
        @keyframes swim-wobble {
          0% { transform: rotate(-5deg) scaleY(1); }
          50% { transform: rotate(0deg) scaleY(1.05); }
          100% { transform: rotate(5deg) scaleY(1); }
        }
        @keyframes swim-dash {
          0% { transform: translateX(0); }
          30% { transform: translateX(5px); }
          100% { transform: translateX(0); }
        }
        @keyframes bobber-waiting {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes bobber-bite {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(4px) rotate(-5deg); }
          75% { transform: translateY(4px) rotate(5deg); }
        }
        .animate-bobber-waiting {
          animation: bobber-waiting 2s ease-in-out infinite;
        }
        .animate-bobber-bite {
          animation: bobber-bite 0.15s ease-in-out infinite;
        }
      `}</style>

      {/* Sky Decor */}
      <div className="absolute top-20 left-[20%] w-32 h-10 bg-white rounded-full blur-lg opacity-40 animate-float"></div>
      <div className="absolute top-10 right-[10%] w-48 h-12 bg-white rounded-full blur-lg opacity-30 animate-float" style={{animationDelay: '1.5s'}}></div>

      {/* Ocean Body */}
      <div className="absolute top-[30%] left-0 w-full h-[70%] bg-gradient-to-b from-blue-500 via-blue-800 to-slate-950">
        
        {/* Fishes */}
        {fishes.map((fish) => {
          const visuals = getFishVisuals(fish.id);
          return (
            <div
              key={fish.id}
              className="absolute transition-all duration-1000 ease-linear"
              style={{
                left: `${fish.x}%`,
                top: `${fish.y}%`,
                width: '40px',
                height: '20px',
                opacity: 0.6,
                zIndex: 10
              }}
            >
               <div style={{ transform: `scaleX(${fish.direction})`, width: '100%', height: '100%' }}>
                 <div style={visuals} className="w-full h-full origin-center">
                    <svg viewBox="0 0 100 60" className="fill-current text-white/80">
                        <path d="M80,30 Q60,5 30,30 T0,30 Q20,55 50,30 T100,30 L80,30 Z" />
                        <path d="M80,30 L95,15 L95,45 L80,30 Z" className="opacity-60" />
                        <circle cx="20" cy="25" r="3" className="fill-black/40" />
                    </svg>
                 </div>
               </div>
            </div>
          );
        })}

        {/* Hook Line */}
        <div 
            className="absolute top-0 w-0.5 bg-white/40 origin-top transition-none z-20"
            style={{
                left: '50%', 
                height: `${hookDepth}%`
            }}
        >
            <div className={`absolute bottom-0 -left-1.5 w-3 h-4 bg-red-500 rounded-b-full border border-white/50 shadow-[0_0_10px_rgba(255,0,0,0.5)] ${isWaiting ? 'animate-bobber-waiting' : ''} ${isBite ? 'animate-bobber-bite' : ''}`}>
                <div className="absolute -bottom-1 left-1 w-1 h-2 bg-slate-300 rounded-full"></div>
            </div>
        </div>

      </div>

      {/* Surface Line */}
      <div className="absolute top-[30%] left-0 w-full h-1 bg-white/20 blur-[1px] z-30"></div>

    </div>
  );
};

export default GameCanvas;