import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import Controls from './components/Controls';
import Modal from './components/Modal';
import HelpModal from './components/HelpModal';
import Inventory from './components/Inventory';
import StoreModal from './components/StoreModal';
import ResetConfirmModal from './components/ResetConfirmModal';
// Corrected import path to match existing file structure
import { generateFishDetails } from './services/geminiService';
import { GameState, FishEntity, FishAnalysis, UpgradeState, ShopItem } from './types';
import { HelpCircle, ShoppingBag, RotateCcw } from 'lucide-react';

// Game Constants
const BASE_REEL_POWER = 1.2;
const BASE_SAFE_WIDTH = 25;
const TENSION_DECAY = 1.0; 
const PROGRESS_GAIN = 0.4;
const PROGRESS_LOSS = 0.6;
const STORAGE_KEY = 'ZEN_FISHING_SAVE_V2';

function App() {
  // --- State ---
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
  
  // --- Persisted State ---
  // Load initial state safely
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

  const [totalMoney, setTotalMoney] = useState(initialData?.money || 0);
  const [inventory, setInventory] = useState<Record<string, { count: number; totalValue: number; data: FishAnalysis }>>(initialData?.inventory || {});
  const [upgrades, setUpgrades] = useState<UpgradeState>(initialData?.upgrades || { rodLevel: 0, baitLevel: 0, reelLevel: 0 });

  // --- Refs for Game Loop ---
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const isReelingRef = useRef(false);
  const tensionRef = useRef(0);
  const progressRef = useRef(0);
  const safeZoneRef = useRef({ start: 30, width: BASE_SAFE_WIDTH });
  const hookDepthRef = useRef(0);
  const biteTimerRef = useRef(0);

  // --- Persistence Effect ---
  useEffect(() => {
    const saveData = {
        money: totalMoney,
        inventory: inventory,
        upgrades: upgrades
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    } catch (e) {
        console.error("Save failed:", e);
    }
  }, [totalMoney, inventory, upgrades]);

  const handleResetGame = () => {
      console.log("Resetting game to defaults...");
      
      // 1. Clear persistence
      localStorage.removeItem(STORAGE_KEY);
      
      // 2. Soft Reset State (Avoids window.reload crash in dev environments)
      setTotalMoney(0);
      setInventory({});
      setUpgrades({ rodLevel: 0, baitLevel: 0, reelLevel: 0 });

      // 3. Reset Game Mechanics
      setGameState(GameState.IDLE);
      setHookDepth(0);
      hookDepthRef.current = 0;
      setTension(0);
      tensionRef.current = 0;
      setProgress(0);
      progressRef.current = 0;
      setCaughtFish(null);
      setIsAnalyzing(false);
      setFishes([]); // Clear screen fish to respawn new ones
      
      // 4. Close Modal
      setShowResetConfirm(false);
  };

  const handlePurchase = (item: ShopItem) => {
      if (totalMoney >= item.price) {
          setTotalMoney(prev => prev - item.price);
          setUpgrades(prev => {
              const newState = { ...prev };
              if (item.type === 'rod') newState.rodLevel = item.levelRequired;
              if (item.type === 'bait') newState.baitLevel = item.levelRequired;
              if (item.type === 'reel') newState.reelLevel = item.levelRequired;
              return newState;
          });
      }
  };

  // --- Game Loop ---
  const animate = useCallback((time: number) => {
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // 1. Ambient Fish Movement
    setFishes(prev => {
      if (Math.random() < 0.005 && prev.length < 5) {
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
        x: f.x + (f.direction * 0.2), 
      })).filter(f => f.x > -20 && f.x < 120); 
    });

    // 2. State Machine Logic
    switch (gameState) {
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
        // Calculate dynamic stats based on Upgrades
        // Reel Power: Level 0 = Base, Level 3 = Base + 0.6
        const currentReelPower = BASE_REEL_POWER + (upgrades.reelLevel * 0.2);
        
        // Tension Physics
        if (isReelingRef.current) {
          tensionRef.current = Math.min(100, tensionRef.current + currentReelPower);
        } else {
          tensionRef.current = Math.max(0, tensionRef.current - TENSION_DECAY);
        }
        
        if (Math.random() < 0.05) tensionRef.current += 5;

        // Progress Logic
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
        } else if (progressRef.current <= 0 && time > biteTimerRef.current + 1000) {
           // handleEscape(); 
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
  }, [gameState, upgrades]); 

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // --- Handlers ---

  const handleCast = () => {
    setGameState(GameState.CASTING);
    hookDepthRef.current = 0;
    setHookDepth(0);
  };

  const startReelingInteraction = () => {
    if (gameState === GameState.BITE) {
      setGameState(GameState.REELING);
      tensionRef.current = 30; 
      progressRef.current = 20; 
      biteTimerRef.current = performance.now(); 
      
      // Calculate Safe Zone Width based on Rod Level
      // Base: 25, Level 1: 30, Level 2: 35, Level 3: 40
      const extraWidth = upgrades.rodLevel * 5; 
      const width = BASE_SAFE_WIDTH + extraWidth;
      
      // Random start position but keep it within bounds
      const maxStart = 100 - width - 5;
      const start = 5 + Math.random() * (maxStart - 5);

      safeZoneRef.current = {
         start: start,
         width: width
      };
    }
    isReelingRef.current = true;
  };

  const stopReelingInteraction = () => {
    isReelingRef.current = false;
  };

  const handleCatch = async () => {
    setGameState(GameState.CAUGHT);
    setIsAnalyzing(true);
    
    // Call Service with Luck Level from Bait Upgrade
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
        setTotalMoney(prev => prev + caughtFish.price);
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
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden select-none touch-none">
      
      {/* Background & Canvas */}
      <GameCanvas 
        gameState={gameState} 
        rodPosition={0.5} 
        hookDepth={hookDepth}
        fishes={fishes}
      />

      {/* Main UI */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none">
        
        {/* HUD - Left Side Inventory */}
        <Inventory 
          caughtFishes={inventory} 
          totalMoney={totalMoney} 
        />

        {/* Header */}
        <div className="p-6 flex justify-between items-start pointer-events-auto pl-72"> 
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">
              禪意垂釣 <span className="text-blue-300 font-light">ZEN FISHING</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/10 hidden sm:block">
               <span className="text-white font-mono text-sm">DEPTH: {Math.floor(hookDepth / 2)}m</span>
             </div>
             
             {/* Shop Button */}
             <button 
                onClick={() => setShowShop(true)}
                className="bg-yellow-500/20 backdrop-blur-md rounded-full p-2 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 transition-colors shadow-lg active:scale-95"
                title="漁具商店"
             >
                <ShoppingBag size={24} />
             </button>

             {/* Help Button */}
             <button 
                onClick={() => setShowHelp(true)}
                className="bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/10 text-white hover:bg-white/20 transition-colors shadow-lg active:scale-95"
                title="遊戲說明"
             >
                <HelpCircle size={24} />
             </button>

             {/* Reset Button (Moved Here) */}
             <button 
                onClick={() => setShowResetConfirm(true)}
                className="bg-red-500/20 backdrop-blur-md rounded-full p-2 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors shadow-lg active:scale-95"
                title="重置遊戲進度"
             >
                <RotateCcw size={24} />
             </button>
          </div>
        </div>

        {/* Controls */}
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

      {/* Modals */}
      {(caughtFish || isAnalyzing) && (
        <Modal 
          loading={isAnalyzing}
          data={caughtFish} 
          onClose={keepFishAndReset} 
        />
      )}
      
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}

      {showShop && (
        <StoreModal 
            onClose={() => setShowShop(false)} 
            currentMoney={totalMoney}
            upgrades={upgrades}
            onPurchase={handlePurchase}
        />
      )}

      {showResetConfirm && (
        <ResetConfirmModal 
            onClose={() => setShowResetConfirm(false)} 
            onConfirm={handleResetGame} 
        />
      )}

      {/* Fail Overlay */}
      {gameState === GameState.BROKEN && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
             <div className="bg-red-500/80 text-white px-8 py-4 rounded-xl text-2xl font-bold animate-bounce shadow-2xl">
                線斷了! (LINE BROKEN)
             </div>
         </div>
      )}
      
      {gameState === GameState.ESCAPED && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
             <div className="bg-slate-700/80 text-white px-8 py-4 rounded-xl text-2xl font-bold animate-fade-out shadow-2xl">
                魚跑了... (ESCAPED)
             </div>
         </div>
      )}

    </div>
  );
}

export default App;