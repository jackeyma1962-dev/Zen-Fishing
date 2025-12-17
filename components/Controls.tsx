import React from 'react';
import { GameState } from '../types';
import { Disc3, Anchor } from 'lucide-react';
import clsx from 'clsx';

interface ControlsProps {
  gameState: GameState;
  onCast: () => void;
  onReelStart: () => void;
  onReelEnd: () => void;
  tension: number; // 0-100
  progress: number; // 0-100
  safeZoneStart: number; // 0-100
  safeZoneWidth: number; // width in %
}

const Controls: React.FC<ControlsProps> = ({
  gameState,
  onCast,
  onReelStart,
  onReelEnd,
  tension,
  progress,
  safeZoneStart,
  safeZoneWidth
}) => {
  
  const isReeling = gameState === GameState.REELING;
  const isIdle = gameState === GameState.IDLE;
  const isWaiting = gameState === GameState.WAITING;
  const isBite = gameState === GameState.BITE;

  // Tension Bar Color
  let barColor = 'bg-emerald-400';
  if (tension > safeZoneStart + safeZoneWidth || tension < safeZoneStart) {
    barColor = 'bg-red-500';
  } else {
    barColor = 'bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)]';
  }

  return (
    <div className="absolute bottom-0 w-full p-6 flex flex-col items-center justify-end pb-12 pointer-events-none">
      
      {/* Instructions / Status Text */}
      <div className="mb-8 text-center pointer-events-auto">
        {isIdle && <div className="animate-bounce bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-white font-bold tracking-widest border border-white/20">點擊投擲魚餌</div>}
        {isWaiting && <div className="text-white/80 font-mono animate-pulse">等待魚影...</div>}
        {isBite && <div className="text-red-400 font-black text-4xl animate-ping uppercase drop-shadow-[0_2px_10px_rgba(255,0,0,0.5)]">魚上鉤了!</div>}
      </div>

      {/* Reeling Mini-Game Interface */}
      {isReeling && (
        <div className="w-full max-w-sm mb-6 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in">
          {/* Progress Circle or Bar */}
          <div className="flex items-center justify-between text-white text-xs font-bold mb-1 px-1">
             <span>逃脫</span>
             <span>捕獲 {Math.floor(progress)}%</span>
          </div>
          <div className="h-4 w-full bg-slate-900/80 rounded-full overflow-hidden border border-slate-700 mb-4">
             <div 
                className="h-full bg-blue-500 transition-all duration-100" 
                style={{ width: `${progress}%` }}
             ></div>
          </div>

          {/* Tension Bar */}
          <div className="relative h-8 w-full bg-slate-800 rounded-full border-2 border-slate-600 overflow-hidden">
             {/* Safe Zone Indicator */}
             <div 
                className="absolute top-0 bottom-0 bg-white/10 border-x border-white/30"
                style={{
                    left: `${safeZoneStart}%`,
                    width: `${safeZoneWidth}%`
                }}
             ></div>
             
             {/* Tension Indicator (The cursor) */}
             <div 
                className={clsx("absolute top-1 bottom-1 w-4 rounded-full transition-all duration-75", barColor)}
                style={{ left: `calc(${tension}% - 8px)` }}
             ></div>
          </div>
          <p className="text-center text-white/50 text-xs mt-2">按住按鈕增加張力，保持在區域內</p>
        </div>
      )}

      {/* Main Action Button */}
      <div className="pointer-events-auto">
        {isReeling || isBite ? (
           <button
             onPointerDown={onReelStart}
             onPointerUp={onReelEnd}
             onPointerLeave={onReelEnd}
             className={clsx(
               "w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] active:scale-95",
               isBite ? "bg-red-600 border-red-400 animate-pulse shadow-red-900/50" : "bg-gradient-to-tr from-orange-600 to-amber-500 border-amber-300 shadow-amber-500/50"
             )}
           >
             {isBite ? (
                <Anchor className="text-white w-10 h-10 animate-bounce" />
             ) : (
                <Disc3 className="text-white w-12 h-12 animate-spin" style={{ animationDuration: '3s' }} />
             )}
           </button>
        ) : (
          <button
            onClick={onCast}
            disabled={!isIdle}
            className={clsx(
              "w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all",
              isIdle 
                ? "bg-blue-600 border-blue-400 text-white shadow-lg hover:bg-blue-500 active:scale-90 cursor-pointer" 
                : "bg-slate-700 border-slate-600 text-slate-500 opacity-50 cursor-not-allowed hidden"
            )}
          >
            <span className="font-bold">CAST</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default Controls;