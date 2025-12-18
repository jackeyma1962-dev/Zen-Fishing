import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import Controls from './components/Controls';
import Modal from './components/Modal';
import HelpModal from './components/HelpModal';
import Inventory from './components/Inventory';
import StoreModal from './components/StoreModal';
import ResetConfirmModal from './components/ResetConfirmModal';
import { generateFishDetails } from './services/geminiService';
import { audioService } from './services/audioService';
import { GameState, FishEntity, FishAnalysis, UpgradeState, ShopItem } from './types';
import { HelpCircle, ShoppingBag, RotateCcw } from 'lucide-react';

const BASE_REEL_POWER = 1.2;
const BASE_SAFE_WIDTH = 25;
const TENSION_DECAY = 1.0; 
const PROGRESS_GAIN = 0.4;
const PROGRESS_LOSS = 0.6;
const STORAGE_KEY = 'ZEN_FISHING_SAVE_V2';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [hookDepth, setHookDepth] = useState(0); 
  const [tension, setTension] = useState(0); 
  const [progress, setProgress] = useState(0); 
  const [fishes, setFishes] = useState<FishEntity[]>([]);
  const [caughtFish, setCaughtFish] = useState<FishAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const loadSaveData = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error("Failed to load save:", e);
    }
    return null;
  };

  const initialData = loadSaveData();
  const [totalMoney, setTotalMoney] = useState<number>(initialData?.money || 0);
  const [inventory, setInventory] = useState<Record<string, { count: number; totalValue: number; data: FishAnalysis }>>(initialData?.inventory || {});
  const [upgrades, setUpgrades] = useState<UpgradeState>(initialData?.upgrades || { rodLevel: 0, baitLevel: 0, reelLevel: 0 });

  const gameStateRef = useRef(gameState);
  const upgradesRef = useRef(upgrades);
  const lastFishUpdateRef = useRef(0);

  useEffect(() => { 
      if (gameState !== gameStateRef.current) {
          if (gameState === GameState.BITE) audioService.playSplash();
          if (gameState === GameState.BROKEN) audioService.playFail();
          if (gameState === GameState.ESCAPED) audioService.playFail();
      }
      gameStateRef.current = gameState; 
  }, [gameState]);
  
  useEffect(() => { upgradesRef.current = upgrades; }, [upgrades]);

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const isReelingRef = useRef(false);
  const tensionRef = useRef(0);
  const progressRef = useRef(0);
  const safeZoneRef = useRef({ start: 30, width: BASE_SAFE_WIDTH });
  const hookDepthRef = useRef(0);
  const biteTimerRef = useRef(0);

  useEffect(() => {
    const saveData = { money: totalMoney, inventory: inventory, upgrades: upgrades };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    } catch (e) {
        console.error("Save failed:", e);
    }
  }, [totalMoney, inventory, upgrades]);

  const handleResetGame = () => {
      audioService.playClick();
      localStorage.removeItem(STORAGE_KEY);
      setTotalMoney(0);
      setInventory({});
      setUpgrades({ rodLevel: 0, baitLevel: 0, reelLevel: 0 });
      setGameState(GameState.IDLE);
      setHookDepth(0);
      hookDepthRef.current = 0;
      setTension(0);
      tensionRef.current = 0;
      setProgress(0);
      progressRef.current = 0;
      setCaughtFish(null);
      setIsAnalyzing(false);
      setFishes([]);
      setShowResetConfirm(false);
  };

  const handlePurchase = (item: ShopItem) => {
      if (totalMoney >= item.price) {
          audioService.playSuccess();
          setTotalMoney((prev: number) => prev - item.price);
          setUpgrades((prev: UpgradeState) => {
              const newState = { ...prev };
              if (item.type === 'rod') newState.rodLevel = item.levelRequired;
              if (item.type === 'bait') newState.baitLevel = item.levelRequired;
              if (item.type === 'reel') newState.reelLevel = item.levelRequired;
              return newState;
          });
      } else {
          audioService.playFail();
      }
  };

  const animate = useCallback((time: number) => {
    lastTimeRef.current = time;
    const currentGameState = gameStateRef.current;
    const currentUpgrades = upgradesRef.current;

    if (time - lastFishUpdateRef.current > 32) {
      setFishes(prev => {
        if (prev.length < 5 && Math.random() < 0.01) {
          return [...prev, {
            id: Date.now(),
            x: Math.random() < 0.5 ? -10 : 110,
            y: 20 + Math.random() * 60,
            speed: (0.05 + Math.random() * 0.1),
            direction: Math.random() < 0.5 ? 1 : -1,
            depth: Math.random()
          }];
        }
        return prev.map(f => ({
          ...f,
          x: f.x + (f.direction * 0.4),
        })).filter(f => f.x > -20 && f.x < 120); 
      });
      lastFishUpdateRef.current = time;
    }

    switch (currentGameState) {
      case GameState.CASTING:
        if (hookDepthRef.current < 60) {
           hookDepthRef.current += 1;
           setHookDepth(hookDepthRef.current);
        } else {
           setGameState(GameState.WAITING);
           biteTimerRef.current = time + 2000 + Math.random() * 3000;
        }
        break;
      case GameState.WAITING:
        if (time > biteTimerRef.current) {
           setGameState(GameState.BITE);
           biteTimerRef.current = time; 
        }
        break;
      case GameState.BITE:
        if (time > biteTimerRef.current + 3000) {
           handleEscape();
        }
        break;
      case GameState.REELING:
        const currentReelPower = BASE_REEL_POWER + (currentUpgrades.reelLevel * 0.2);
        if (isReelingRef.current) {
          tensionRef.current = Math.min(100, tensionRef.current + currentReelPower);
        } else {
          tensionRef.current = Math.max(0, tensionRef.current - TENSION_DECAY);
        }
        if (Math.random() < 0.05) tensionRef.current += 5;
        const safeStart = safeZoneRef.current.start;
        const safeEnd = safeStart + safeZoneRef.current.width;
        if (tensionRef.current >= safeStart && tensionRef.current <= safeEnd) {
          progressRef.current = Math.min(100, progressRef.current + PROGRESS_GAIN);
        } else {
          progressRef.current = Math.max(0, progressRef.current - PROGRESS_LOSS);
        }
        if (progressRef.current >= 100) {
          handleCatch();
        } else if (tensionRef.current >= 100) {
          handleBreak();
        }
        setTension(tensionRef.current);
        setProgress(progressRef.current);
        break;
      case GameState.ESCAPED:
      case GameState.BROKEN:
           if (hookDepthRef.current > 0) {
               hookDepthRef.current -= 2;
               setHookDepth(hookDepthRef.current);
           } else {
               setGameState(GameState.IDLE);
           }
           break;
      case GameState.CAUGHT:
           if (hookDepthRef.current > 0) {
               hookDepthRef.current -= 2;
               setHookDepth(hookDepthRef.current);
           }
           break;
    }
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const handleCast = () => {
    audioService.playCast();
    setGameState(GameState.CASTING);
    hookDepthRef.current = 0;
    setHookDepth(0);
  };

  const startReelingInteraction = () => {
    if (gameState === GameState.BITE) {
      audioService.playClick();
      setGameState(GameState.REELING);
      tensionRef.current = 30; 
      progressRef.current = 20; 
      biteTimerRef.current = performance.now(); 
      const width = BASE_SAFE_WIDTH + upgrades.rodLevel * 5;
      const start = 5 + Math.random() * (100 - width - 10);
      safeZoneRef.current = { start, width };
    }
    isReelingRef.current = true;
  };

  const stopReelingInteraction = () => {
    isReelingRef.current = false;
  };

  const handleCatch = async () => {
    setGameState(GameState.CAUGHT);
    audioService.playSuccess();
    setIsAnalyzing(true);
    const seed = Math.floor(Math.random() * 10000);
    const data = await generateFishDetails(seed, upgrades.baitLevel);
    setCaughtFish(data);
    setIsAnalyzing(false);
  };

  const handleBreak = () => {
    setGameState(GameState.BROKEN);
    tensionRef.current = 0;
    progressRef.current = 0;
  };

  const handleEscape = () => {
    setGameState(GameState.ESCAPED);
    tensionRef.current = 0;
    progressRef.current = 0;
  };

  const keepFishAndReset = () => {
    if (caughtFish) {
        audioService.playClick();
        setTotalMoney((prev: number) => prev + caughtFish.price);
        setInventory(prev => {
            const current = prev[caughtFish.name] || { count: 0, totalValue: 0, data: caughtFish };
            return {
                ...prev,
                [caughtFish.name]: {
                    count: current.count + 1,
                    totalValue: current.totalValue + caughtFish.price,
                    data: caughtFish
                }
            };
        });
    }
    setGameState(GameState.IDLE);
    setCaughtFish(null);
    setHookDepth(0);
    hookDepthRef.current = 0;
  };

  return (
    <div className="relative w-full h-[100dvh] bg-slate-900 overflow-hidden select-none touch-none">
      <GameCanvas gameState={gameState} rodPosition={0.5} hookDepth={hookDepth} fishes={fishes} />

      <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none">
        <Inventory caughtFishes={inventory} totalMoney={totalMoney} />

        <div className="p-4 sm:p-6 flex justify-between items-start pointer-events-auto sm:pl-72"> 
          <div className="max-w-[50%] sm:max-w-none">
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tighter drop-shadow-lg flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span>禪意垂釣</span> 
              <span className="text-blue-300 font-light text-xs sm:text-lg uppercase">ZEN FISHING</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="bg-white/10 backdrop-blur-md rounded-lg p-1.5 sm:p-2 border border-white/10 hidden md:block">
               <span className="text-white font-mono text-[10px] sm:text-sm uppercase tracking-tighter">DEPTH: {Math.floor(hookDepth / 2)}m</span>
             </div>
             
             <button 
                onClick={() => { audioService.playClick(); setShowShop(true); }}
                className="bg-yellow-500/20 backdrop-blur-md rounded-full p-2 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 transition-colors shadow-lg active:scale-95"
             >
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
             </button>

             <button 
                onClick={() => { audioService.playClick(); setShowHelp(true); }}
                className="bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/10 text-white hover:bg-white/20 transition-colors shadow-lg active:scale-95"
             >
                <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
             </button>

             <button 
                onClick={() => { audioService.playClick(); setShowResetConfirm(true); }}
                className="bg-red-500/20 backdrop-blur-md rounded-full p-2 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors shadow-lg active:scale-95"
             >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
             </button>
          </div>
        </div>

        <Controls 
           gameState={gameState}
           onCast={handleCast}
           onReelStart={startReelingInteraction}
           onReelEnd={stopReelingInteraction}
           tension={tension}
           progress={progress}
           safeZoneStart={safeZoneRef.current.start}
           safeZoneWidth={safeZoneRef.current.width}
        />
      </div>

      {(caughtFish || isAnalyzing) && <Modal loading={isAnalyzing} data={caughtFish} onClose={keepFishAndReset} />}
      {showHelp && <HelpModal onClose={() => { audioService.playClick(); setShowHelp(false); }} />}
      {showShop && <StoreModal onClose={() => { audioService.playClick(); setShowShop(false); }} currentMoney={totalMoney} upgrades={upgrades} onPurchase={handlePurchase} />}
      {showResetConfirm && <ResetConfirmModal onClose={() => { audioService.playClick(); setShowResetConfirm(false); }} onConfirm={handleResetGame} />}

      {gameState === GameState.BROKEN && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
             <div className="bg-red-500/80 text-white px-8 py-4 rounded-xl text-xl sm:text-2xl font-bold animate-bounce shadow-2xl">線斷了!</div>
         </div>
      )}
      
      {gameState === GameState.ESCAPED && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
             <div className="bg-slate-700/80 text-white px-8 py-4 rounded-xl text-xl sm:text-2xl font-bold animate-fade-out shadow-2xl">魚跑了...</div>
         </div>
      )}
    </div>
  );
}

export default App;