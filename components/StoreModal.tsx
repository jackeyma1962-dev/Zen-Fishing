
import React from 'react';
import { X, ShoppingBag, Lock, Check, Fish, ShieldAlert } from 'lucide-react';
import { UpgradeState, ShopItem, LevelGoal, FishAnalysis } from '../types';

interface StoreModalProps {
  onClose: () => void;
  currentMoney: number;
  upgrades: UpgradeState;
  inventory: Record<string, { count: number; data: FishAnalysis }>;
  levelGoals: Record<number, LevelGoal>;
  onPurchase: (item: ShopItem) => void;
}

const SHOP_ITEMS: ShopItem[] = [
    // Rod Upgrades (1-10)
    { id: 'rod_1', type: 'rod', levelRequired: 1, name: "碳纖維釣竿", description: "輕盈材質，增加操控穩定性。", price: 150 },
    { id: 'rod_2', type: 'rod', levelRequired: 2, name: "強化玻璃纖維", description: "耐用平衡感提升。", price: 600 },
    { id: 'rod_3', type: 'rod', levelRequired: 3, name: "專業鈦合金竿", description: "增加操控區寬度。", price: 1800 },
    { id: 'rod_4', type: 'rod', levelRequired: 4, name: "深海重型竿", description: "專為對抗大魚設計。", price: 4500 },
    { id: 'rod_5', type: 'rod', levelRequired: 5, name: "奈米強化碳管", description: "極致輕量化，手感極佳。", price: 12000 },
    { id: 'rod_6', type: 'rod', levelRequired: 6, name: "電磁穩定系統", description: "內置感測器協助穩定張力。", price: 30000 },
    { id: 'rod_7', type: 'rod', levelRequired: 7, name: "海龍骨架竿", description: "取自深海巨獸，韌性驚人。", price: 80000 },
    { id: 'rod_8', type: 'rod', levelRequired: 8, name: "流星碎片打造", description: "天外金屬，極其堅硬。", price: 200000 },
    { id: 'rod_9', type: 'rod', levelRequired: 9, name: "海神三叉戟", description: "傳說神器，幾乎自動平衡。", price: 500000 },
    { id: 'rod_10', type: 'rod', levelRequired: 10, name: "虛空之主", description: "掌控空間，釣魚如喝水。", price: 1500000 },

    // Reel Upgrades (1-10)
    { id: 'reel_1', type: 'reel', levelRequired: 1, name: "高速捲線器", description: "改良齒輪比，收線更快。", price: 120 },
    { id: 'reel_2', type: 'reel', levelRequired: 2, name: "雙滾珠軸承", description: "更滑順的收線體驗。", price: 500 },
    { id: 'reel_3', type: 'reel', levelRequired: 3, name: "電動捲線器", description: "強大的扭力，收線更輕鬆。", price: 1500 },
    { id: 'reel_4', type: 'reel', levelRequired: 4, name: "多碟剎車系統", description: "精準控制張力釋放。", price: 4000 },
    { id: 'reel_5', type: 'reel', levelRequired: 5, name: "陶瓷鍍層組件", description: "耐高溫且極低摩擦。", price: 10000 },
    { id: 'reel_6', type: 'reel', levelRequired: 6, name: "磁力渦流控制", description: "利用磁力輔助旋轉。", price: 25000 },
    { id: 'reel_7', type: 'reel', levelRequired: 7, name: "液壓動力增壓", description: "提供無與倫比的拉力。", price: 60000 },
    { id: 'reel_8', type: 'reel', levelRequired: 8, name: "超導傳感捲線", description: "零延遲力道傳達。", price: 150000 },
    { id: 'reel_9', type: 'reel', levelRequired: 9, name: "量子引力引擎", description: "黑科技將魚吸過來。", price: 400000 },
    { id: 'reel_10', type: 'reel', levelRequired: 10, name: "時空收縮器", description: "無視距離的絕對捕獲力。", price: 1200000 },

    // Bait Upgrades (1-10)
    { id: 'bait_1', type: 'bait', levelRequired: 1, name: "香料魚餌", description: "增加吸引稀有魚的機率。", price: 200 },
    { id: 'bait_2', type: 'bait', levelRequired: 2, name: "電子閃光餌", description: "吸引深海生物。", price: 800 },
    { id: 'bait_3', type: 'bait', levelRequired: 3, name: "大師祕方餌", description: "高機率吸引珍稀生物。", price: 2500 },
    { id: 'bait_4', type: 'bait', levelRequired: 4, name: "費洛蒙誘引劑", description: "誘捕特定族群。", price: 6000 },
    { id: 'bait_5', type: 'bait', levelRequired: 5, name: "活體模擬餌", description: "完美模擬小魚動作。", price: 15000 },
    { id: 'bait_6', type: 'bait', levelRequired: 6, name: "螢光蟲精華", description: "在深處閃耀奪目。", price: 40000 },
    { id: 'bait_7', type: 'bait', levelRequired: 7, name: "海精靈鱗片", description: "具有神秘魔力的誘餌。", price: 100000 },
    { id: 'bait_8', type: 'bait', levelRequired: 8, name: "龍涎香精華", description: "令海洋生物瘋狂。", price: 300000 },
    { id: 'bait_9', type: 'bait', levelRequired: 9, name: "神聖珊瑚粉", description: "吸引神話生物。", price: 750000 },
    { id: 'bait_10', type: 'bait', levelRequired: 10, name: "星之塵埃", description: "吸引宇宙海洋生物。", price: 2000000 },
];

const StoreModal: React.FC<StoreModalProps> = ({ onClose, currentMoney, upgrades, inventory, levelGoals, onPurchase }) => {
  const [activeTab, setActiveTab] = React.useState<'rod' | 'reel' | 'bait'>('rod');

  const filteredItems = SHOP_ITEMS.filter(item => item.type === activeTab);
  const currentToolLvl = activeTab === 'rod' ? upgrades.rodLevel : activeTab === 'reel' ? upgrades.reelLevel : upgrades.baitLevel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-950 border border-slate-800 w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900">
            <div className="flex items-center gap-3">
                <div className="bg-yellow-500/20 p-3 rounded-xl">
                    <ShoppingBag className="text-yellow-400" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">漁具商店</h2>
                    <p className="text-slate-500 text-xs">資產: <span className="text-yellow-400 font-mono font-bold">${currentMoney.toLocaleString()}</span></p>
                </div>
            </div>
            <button onClick={onClose} className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-full transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-slate-900/50">
            {(['rod', 'reel', 'bait'] as const).map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-sm font-bold tracking-widest transition-all ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    {tab === 'rod' ? '🎣 釣竿' : tab === 'reel' ? '⚙️ 捲線器' : '🪱 魚餌'}
                    <span className="ml-2 opacity-50 text-xs">Lv.{tab === 'rod' ? upgrades.rodLevel : tab === 'reel' ? upgrades.reelLevel : upgrades.baitLevel}</span>
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
            {filteredItems.map((item) => {
                const isPurchased = currentToolLvl >= item.levelRequired;
                
                // STRICT LOCK RULES:
                // 1. To buy Lv.N, Player Level must be >= N
                // (Player Level increases when N-1 target is caught AND tools are Lv.N-1)
                const isLocked = upgrades.playerLevel < item.levelRequired;
                
                // Reason for lock
                let lockReason = "";
                if (isLocked) {
                    const prevLvlGoal = levelGoals[item.levelRequired - 1];
                    if (prevLvlGoal) {
                        const caughtPrev = inventory[prevLvlGoal.targetFish]?.count > 0;
                        if (!caughtPrev) {
                            lockReason = `需先捕獲 "${prevLvlGoal.targetFish}"`;
                        } else {
                            lockReason = `需購齊全套 Lv.${item.levelRequired - 1} 漁具`;
                        }
                    }
                }

                const canAfford = currentMoney >= item.price;

                return (
                    <div 
                        key={item.id} 
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all ${isPurchased ? 'bg-emerald-950/20 border-emerald-500/20' : isLocked ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-900 border-slate-800 hover:border-blue-500/50'}`}
                    >
                        <div className="flex items-center gap-4 flex-1 mb-3 sm:mb-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${isPurchased ? 'bg-emerald-500/20 text-emerald-400' : isLocked ? 'bg-slate-800 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>
                                {isPurchased ? <Check size={24} /> : isLocked ? <Lock size={20} /> : item.levelRequired}
                            </div>
                            <div>
                                <h3 className={`font-bold leading-none mb-1.5 ${isLocked ? 'text-slate-600' : 'text-white'}`}>{item.name}</h3>
                                <p className={`text-xs ${isLocked ? 'text-slate-700' : 'text-slate-500'}`}>{item.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {isPurchased ? (
                                <span className="text-emerald-400 text-xs font-bold px-4 py-2 bg-emerald-400/10 rounded-lg w-full text-center">已裝備</span>
                            ) : isLocked ? (
                                <div className="flex flex-col items-end w-full">
                                    <div className="flex items-center gap-1.5 text-red-500/60 text-[10px] font-bold uppercase mb-1">
                                        <ShieldAlert size={12} />
                                        <span>未達成條件</span>
                                    </div>
                                    <div className="text-slate-600 text-[11px] bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-800 w-full text-center">
                                        {lockReason}
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => onPurchase(item)}
                                    disabled={!canAfford}
                                    className={`w-full sm:px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 ${canAfford ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                >
                                    ${item.price.toLocaleString()}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default StoreModal;
