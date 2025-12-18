
import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import Controls from './components/Controls';
import Modal from './components/Modal';
import HelpModal from './components/HelpModal';
import Inventory from './components/Inventory';
import StoreModal from './components/StoreModal';
import ResetConfirmModal from './components/ResetConfirmModal';
import { generateFishDetails } from './services/fishService';
import { audioService } from './services/audioService';
import { GameState, FishEntity, FishAnalysis, UpgradeState, ShopItem, LevelGoal } from './types';
import { HelpCircle, ShoppingBag, RotateCcw, Trophy, CheckCircle2, Circle } from 'lucide-react';

const TENSION_DECAY = 1.0; 
const PROGRESS_GAIN = 0.4;
const PROGRESS_LOSS = 0.6;
const STORAGE_KEY = 'ZEN_FISHING_SAVE_FINAL_V2';

const LEVEL_GOALS: Record<number, LevelGoal> = {
  1: { targetFish: "深海鮪魚", requiredToolLevel: 1, rewardText: "晉升至 Lv.2：探索發光海域" },
  2: { targetFish: "發光的鱸魚", requiredToolLevel: 2, rewardText: "晉升至 Lv.3：前往遠洋巨獸區" },
  3: { targetFish: "巨大的鯊魚", requiredToolLevel: 3, rewardText: "晉升至 Lv.4：尋找古代活化石" },
  4: { targetFish: "古代鰻魚", requiredToolLevel: 4, rewardText: "晉升至 Lv.5：解鎖機械廢土港" },
  5: { targetFish: "機械水母", requiredToolLevel: 5, rewardText: "晉升至 Lv.6：進入極寒冰川海域" },
  6: { targetFish: "透明的螃蟹", requiredToolLevel: 6, rewardText: "晉升至 Lv.7：進入彩虹珊瑚礁" },
  7: { targetFish: "彩虹錦鯉", requiredToolLevel: 7, rewardText: "晉升至 Lv.8：探索幽靈霧海" },
  8: { targetFish: "幽靈魟魚", requiredToolLevel: 8, rewardText: "晉升至 Lv.9：前往熔岩火山口" },
  9: { targetFish: "火焰魷魚", requiredToolLevel: 9, rewardText: "晉升至 Lv.10：大師黃金試煉" },
  10: { targetFish: "黃金龍蝦", requiredToolLevel: 10, rewardText: "傳說大師成就達成" },
};

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
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  const isResettingRef = useRef(false);

  const loadSaveData = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  };

  const initialData = loadSaveData();
  const [totalMoney, setTotalMoney] = useState<number>(initialData?.money || 0);
  const [inventory, setInventory] = useState<Record<string, { count: number; totalValue: number; data: FishAnalysis }>>(initialData?.inventory || {});
  const [upgrades, setUpgrades] = useState<UpgradeState>(initialData?.upgrades || { playerLevel: 1, rodLevel: 0, baitLevel: 0, reelLevel: 0 });

  const gameStateRef = useRef(gameState);
  const upgradesRef = useRef(upgrades);
  const lastFishUpdateRef = useRef(0);

  useEffect(() => { 
      if (gameState !== gameStateRef.current) {
          if (gameState === GameState.BITE) audioService.playSplash();
          if (gameState === GameState.BROKEN || gameState === GameState.ESCAPED) audioService.playFail();
      }
      gameStateRef.current = gameState; 
  }, [gameState]);
  
  useEffect(() => { upgradesRef.current = upgrades; }, [upgrades]);

  const requestRef = useRef<number>();
  const isReelingRef = useRef(false);
  const tensionRef = useRef(0);
  const progressRef = useRef(0);
  const safeZoneRef = useRef({ start: 30, width: 25 });
  const hookDepthRef = useRef(0);
  const biteTimerRef = useRef(0);

  useEffect(() => {
    if (isResettingRef.current) return;
    if (gameState !== GameState.IDLE && !showResetConfirm) {
        const saveData = { money: totalMoney, inventory: inventory, upgrades: upgrades };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    }
  }, [totalMoney, inventory, upgrades, gameState, showResetConfirm]);

  const handleResetGame = () => {
      isResettingRef.current = true;
      audioService.playClick();
      localStorage.clear();
      window.location.replace(window.location.origin + window.location.pathname);
  };

  const handlePurchase = (item: ShopItem) => {
      if (upgrades.playerLevel < item.levelRequired) {
          audioService.playFail();
          return;
      }

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
        return prev.map(f => ({ ...f, x: f.x + (f.direction * 0.4) })).filter(f => f.x > -20 && f.x < 120); 
      });
      lastFishUpdateRef.current = time;
    }

    switch (currentGameState) {
      case GameState.CASTING:
        if (hookDepthRef.current < 60) {
           hookDepthRef.current += 1.2;
           setHookDepth(hookDepthRef.current);
        } else {
           setGameState(GameState.WAITING);
           biteTimerRef.current = time + 1200 + Math.random() * 2000;
        }
        break;
      case GameState.WAITING:
        if (time > biteTimerRef.current) {
           setGameState(GameState.BITE);
           biteTimerRef.current = time; 
        }
        break;
      case GameState.BITE:
        if (time > biteTimerRef.current + 2500) handleEscape();
        break;
      case GameState.REELING:
        const currentReelPower = 1.35 + (currentUpgrades.reelLevel * 0.3);
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
        if (progressRef.current >= 100) handleCatch();
        else if (tensionRef.current >= 100) handleBreak();
        setTension(tensionRef.current);
        setProgress(progressRef.current);
        break;
      case GameState.ESCAPED:
      case GameState.BROKEN:
      case GameState.CAUGHT:
           if (hookDepthRef.current > 0) {
               hookDepthRef.current -= 3.5;
               setHookDepth(hookDepthRef.current);
           } else if (currentGameState !== GameState.CAUGHT) {
               setGameState(GameState.IDLE);
           }
           break;
    }
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [animate]);

  const handleEscape = () => setGameState(GameState.ESCAPED);
  const handleBreak = () => setGameState(GameState.BROKEN);

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
      const width = 25 + upgrades.rodLevel * 4;
      const start = 5 + Math.random() * (95 - width);
      safeZoneRef.current = { start, width };
    }
    isReelingRef.current = true;
  };

  const stopReelingInteraction = () => { isReelingRef.current = false; };

  const handleCatch = async () => {
    setGameState(GameState.CAUGHT);
    audioService.playSuccess();
    setIsAnalyzing(true);
    const seed = Math.floor(Math.random() * 999999);
    
    // CRITICAL FIX: Always use upgradesRef.current.playerLevel to avoid closure stale state
    const currentLevel = upgradesRef.current.playerLevel;
    const targetFish = LEVEL_GOALS[currentLevel]?.targetFish;
    
    // Check inventory using state is fine here as catch is one-off, but latest inventory might be better
    const alreadyCaughtTarget = inventory[targetFish]?.count > 0;
    
    const data = await generateFishDetails(
        seed, 
        upgradesRef.current.baitLevel + (currentLevel * 0.5),
        alreadyCaughtTarget ? undefined : targetFish,
        currentLevel 
    );
    
    setCaughtFish(data);
    setIsAnalyzing(false);
  };

  const keepFishAndReset = () => {
    if (caughtFish) {
        audioService.playClick();
        const newMoney = totalMoney + caughtFish.price;
        setTotalMoney(newMoney);
        
        const newInventory = { ...inventory };
        const current = newInventory[caughtFish.name] || { count: 0, totalValue: 0, data: caughtFish };
        newInventory[caughtFish.name] = {
            count: current.count + 1,
            totalValue: current.totalValue + caughtFish.price,
            data: caughtFish
        };
        setInventory(newInventory);

        const currentLvl = upgrades.playerLevel;
        const currentGoal = LEVEL_GOALS[currentLvl];
        
        if (currentGoal) {
            const hasTarget = newInventory[currentGoal.targetFish]?.count > 0;
            const hasRod = upgrades.rodLevel >= currentGoal.requiredToolLevel;
            const hasReel = upgrades.reelLevel >= currentGoal.requiredToolLevel;
            const hasBait = upgrades.baitLevel >= currentGoal.requiredToolLevel;
            
            if (hasTarget && hasRod && hasReel && hasBait && currentLvl < 10) {
                setTimeout(() => {
                    audioService.playSuccess();
                    setUpgrades(prev => ({ ...prev, playerLevel: prev.playerLevel + 1 }));
                    setShowLevelUp(true);
                }, 400);
            }
        }
    }
    setGameState(GameState.IDLE);
    setCaughtFish(null);
    setHookDepth(0);
    hookDepthRef.current = 0;
  };

  const currentGoal = LEVEL_GOALS[upgrades.playerLevel];
  const goalFishCaught = currentGoal ? (inventory[currentGoal.targetFish]?.count > 0) : false;
  const goalToolsMet = currentGoal ? (upgrades.rodLevel >= currentGoal.requiredToolLevel && upgrades.reelLevel >= currentGoal.requiredToolLevel && upgrades.baitLevel >= currentGoal.requiredToolLevel) : true;

  return (
    <div className="relative w-full h-[100dvh] bg-slate-900 overflow-hidden select-none touch-none">
      <GameCanvas gameState={gameState} rodPosition={0.5} hookDepth={hookDepth} fishes={fishes} />

      <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none">
        
        <div className="absolute top-16 sm:top-24 left-4 z-20 flex flex-col gap-2 w-auto sm:w-64">
           <Inventory caughtFishes={inventory} totalMoney={totalMoney} playerLevel={upgrades.playerLevel} />
           
           {currentGoal && (
             <div className="bg-slate-950/90 backdrop-blur-md border border-blue-500/30 rounded-xl p-3 shadow-2xl pointer-events-auto animate-in slide-in-from-left duration-500">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        <Trophy size={14} className="text-yellow-400" />
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">任務 Lv.{upgrades.playerLevel}</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                            {goalFishCaught ? <CheckCircle2 size={12} className="text-green-400" /> : <Circle size={12} className="text-slate-600" />}
                            <span>捕獲 <span className="text-blue-300 font-bold">"{currentGoal.targetFish}"</span></span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                            {goalToolsMet ? <CheckCircle2 size={12} className="text-green-400" /> : <Circle size={12} className="text-slate-600" />}
                            <span>齊全 Lv.{currentGoal.requiredToolLevel} 套裝</span>
                        </div>
                    </div>
                </div>
                {goalFishCaught && goalToolsMet && (
                    <div className="mt-2 text-[10px] text-green-400 font-bold animate-pulse text-center bg-green-400/10 py-1.5 rounded-lg border border-green-500/20">
                        條件達成！晉升評定中
                    </div>
                )}
             </div>
           )}
        </div>

        <div className="p-4 sm:p-6 flex justify-between items-start pointer-events-auto sm:pl-72"> 
          <div className="max-w-[50%] sm:max-w-none">
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tighter drop-shadow-lg flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span>禪意垂釣</span> 
              <span className="text-blue-300 font-light text-xs sm:text-lg uppercase">ZEN FISHING</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/10 text-white font-mono text-xs sm:text-sm hidden md:block">
               Lv.{upgrades.playerLevel} {upgrades.playerLevel === 10 ? '★大師' : ''}
             </div>
             
             <button onClick={() => { audioService.playClick(); setShowShop(true); }} className="bg-yellow-500/20 backdrop-blur-md rounded-full p-2 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 shadow-lg active:scale-95 transition-all">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
             </button>
             <button onClick={() => { audioService.playClick(); setShowHelp(true); }} className="bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/10 text-white hover:bg-white/20 shadow-lg active:scale-95 transition-all">
                <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
             </button>
             <button onClick={() => { audioService.playClick(); setShowResetConfirm(true); }} className="bg-red-500/20 backdrop-blur-md rounded-full p-2 border border-red-500/30 text-red-400 hover:bg-red-500/30 shadow-lg active:scale-95 transition-all">
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
             </button>
          </div>
        </div>

        <Controls 
           gameState={gameState} onCast={handleCast} onReelStart={startReelingInteraction} onReelEnd={stopReelingInteraction}
           tension={tension} progress={progress} safeZoneStart={safeZoneRef.current.start} safeZoneWidth={safeZoneRef.current.width}
        />
      </div>

      {(caughtFish || isAnalyzing) && <Modal loading={isAnalyzing} data={caughtFish} onClose={keepFishAndReset} />}
      {showHelp && <HelpModal onClose={() => { audioService.playClick(); setShowHelp(false); }} />}
      {showShop && <StoreModal onClose={() => { audioService.playClick(); setShowShop(false); }} currentMoney={totalMoney} upgrades={upgrades} inventory={inventory} levelGoals={LEVEL_GOALS} onPurchase={handlePurchase} />}
      {showResetConfirm && <ResetConfirmModal onClose={() => { audioService.playClick(); setShowResetConfirm(false); }} onConfirm={handleResetGame} />}

      {showLevelUp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-900/60 backdrop-blur-xl p-4 animate-in fade-in zoom-in duration-500">
              <div className="bg-slate-950 border-4 border-yellow-400 p-8 rounded-3xl text-center shadow-[0_0_100px_rgba(250,204,21,0.5)] max-w-sm w-full">
                  <div className="text-7xl mb-4 animate-bounce">🎖️</div>
                  <h2 className="text-4xl font-black text-white mb-2 tracking-tighter italic uppercase">晉升成功!</h2>
                  <div className="h-1 w-24 bg-yellow-400 mx-auto mb-6"></div>
                  <p className="text-yellow-400 text-2xl font-bold mb-2">等級 {upgrades.playerLevel}</p>
                  <p className="text-slate-400 mb-8 text-sm italic">"{LEVEL_GOALS[upgrades.playerLevel-1]?.rewardText}"</p>
                  <button onClick={() => setShowLevelUp(false)} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black px-12 py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-yellow-900/40">解鎖新海域漁具</button>
              </div>
          </div>
      )}

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
