import React from 'react';
import { GameState } from '../types';
import { Disc3, Anchor } from 'lucide-react';
import clsx from 'clsx';

interface ControlsProps {
  gameState: GameState;
  onCast: () => void;
  onReelStart: () => void;
  onReelEnd: () => void;
  tension: number;
  progress: number;
  safeZoneStart: number;
  safeZoneWidth: number;
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

  let barColor = 'bg-emerald-400';
  if (tension > safeZoneStart + safeZoneWidth || tension < safeZoneStart) {
    barColor = 'bg-red-500';
  } else {
    barColor = 'bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)]';
  }

  return (
    <div className="absolute bottom-0 w-full p-4 sm:p-6 flex flex-col items-center justify-end pb-32 sm:pb-48 pointer-events-none">
      
      {/* Instructions / Status Text */}
      <div className="mb-6 sm:mb-8 text-center pointer-events-auto h-12 flex items-center">
        {isIdle && <div className="animate-bounce bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-white text-sm sm:text-base font-bold tracking-widest border border-white/20">點擊投擲</div>}
        {isWaiting && <div className="text-white/80 font-mono text-xs sm:text-sm animate-pulse">等待魚兒中...</div>}
        {isBite && <div className="text-red-400 font-black text-2xl sm:text-4xl animate-ping uppercase drop-shadow-[0_2px_10px_rgba(255,0,0,0.5)]">咬鉤了！</div>}
      </div>

      {/* Reeling Mini-Game Interface */}
      {isReeling && (
        <div className="w-full max-w-xs sm:max-w-sm mb-4 sm:mb-6 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in">
          <div className="flex items-center justify-between text-white text-[10px] sm:text-xs font-bold mb-1 px-1">
             <span className="opacity-50 uppercase tracking-tighter">Escape</span>
             <span className="uppercase tracking-tighter">Catch {Math.floor(progress)}%</span>
          </div>
          <div className="h-3 sm:h-4 w-full bg-slate-900/80 rounded-full overflow-hidden border border-slate-700 mb-3 sm:mb-4 shadow-inner">
             <div 
                className="h-full bg-blue-500 transition-all duration-100 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                style={{ width: `${progress}%` }}
             ></div>
          </div>

          <div className="relative h-6 sm:h-8 w-full bg-slate-800 rounded-full border-2 border-slate-600 overflow-hidden shadow-inner">
             <div 
                className="absolute top-0 bottom-0 bg-white/10 border-x border-white/20"
                style={{
                    left: `${safeZoneStart}%`,
                    width: `${safeZoneWidth}%`
                }}
             ></div>
             <div 
                className={clsx("absolute top-0.5 bottom-0.5 w-3 sm:w-4 rounded-full transition-all duration-75", barColor)}
                style={{ left: `calc(${tension}% - 6px)` }}
             ></div>
          </div>
          <p className="text-center text-white/40 text-[9px] sm:text-[11px] mt-2 font-medium">按住收線，控制張力</p>
        </div>
      )}

      {/* Main Action Button */}
      <div className="pointer-events-auto">
        {isReeling || isBite ? (
           <button
             onPointerDown={(e) => { e.preventDefault(); onReelStart(); }}
             onPointerUp={(e) => { e.preventDefault(); onReelEnd(); }}
             onPointerLeave={onReelEnd}
             className={clsx(
               "w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 flex items-center justify-center transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] active:scale-95 touch-none",
               isBite ? "bg-red-600 border-red-400 animate-pulse shadow-red-900/50" : "bg-gradient-to-tr from-orange-600 to-amber-500 border-amber-300 shadow-amber-500/50"
             )}
           >
             {isBite ? (
                <Anchor className="text-white w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
             ) : (
                <Disc3 className="text-white w-10 h-10 sm:w-12 sm:h-12 animate-spin" style={{ animationDuration: '2s' }} />
             )}
           </button>
        ) : (
          <button
            onClick={(e) => { e.preventDefault(); onCast(); }}
            disabled={!isIdle}
            className={clsx(
              "w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center transition-all touch-none",
              isIdle 
                ? "bg-blue-600 border-blue-400 text-white shadow-lg hover:bg-blue-500 active:scale-90 cursor-pointer" 
                : "bg-slate-700 border-slate-600 text-slate-500 opacity-50 cursor-not-allowed hidden"
            )}
          >
            <span className="font-bold text-xs sm:text-base tracking-widest">CAST</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default Controls;