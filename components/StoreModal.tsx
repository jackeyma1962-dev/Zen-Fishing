import React from 'react';
import { X, ShoppingBag, ArrowUpCircle, Lock } from 'lucide-react';
import { UpgradeState, ShopItem } from '../types';

interface StoreModalProps {
  onClose: () => void;
  currentMoney: number;
  upgrades: UpgradeState;
  onPurchase: (item: ShopItem) => void;
}

// Shop Data Configuration
const SHOP_ITEMS: ShopItem[] = [
    // Rod Upgrades (Safe Zone)
    { id: 'rod_1', type: 'rod', levelRequired: 1, name: "碳纖維釣竿", description: "更輕盈的材質，增加 15% 操控穩定性。", price: 300 },
    { id: 'rod_2', type: 'rod', levelRequired: 2, name: "專業鈦合金竿", description: "頂級工藝，大幅增加操控區寬度。", price: 1500 },
    { id: 'rod_3', type: 'rod', levelRequired: 3, name: "海神三叉戟", description: "傳說中的神器，釣魚如喝水般簡單。", price: 5000 },

    // Reel Upgrades (Power/Speed)
    { id: 'reel_1', type: 'reel', levelRequired: 1, name: "高速捲線器", description: "改良的齒輪比，收線速度提升 20%。", price: 250 },
    { id: 'reel_2', type: 'reel', levelRequired: 2, name: "電動捲線器", description: "強大的扭力，讓大魚無處可逃。", price: 1200 },
    { id: 'reel_3', type: 'reel', levelRequired: 3, name: "量子引力引擎", description: "利用黑科技直接將魚吸過來。", price: 4500 },

    // Bait Upgrades (Luck)
    { id: 'bait_1', type: 'bait', levelRequired: 1, name: "特製香料魚餌", description: "獨特香氣，略微增加稀有魚機率。", price: 500 },
    { id: 'bait_2', type: 'bait', levelRequired: 2, name: "大師級秘方餌", description: "祖傳配方，高機率吸引珍稀生物。", price: 2000 },
    { id: 'bait_3', type: 'bait', levelRequired: 3, name: "龍涎香精華", description: "連深海巨獸也無法抗拒的誘惑。", price: 8000 },
];

const StoreModal: React.FC<StoreModalProps> = ({ onClose, currentMoney, upgrades, onPurchase }) => {
  
  const getCurrentLevel = (type: string) => {
      if (type === 'rod') return upgrades.rodLevel;
      if (type === 'bait') return upgrades.baitLevel;
      if (type === 'reel') return upgrades.reelLevel;
      return 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl h-[80vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800">
            <div className="flex items-center gap-3">
                <div className="bg-yellow-500/20 p-3 rounded-xl">
                    <ShoppingBag className="text-yellow-400" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">漁具商店</h2>
                    <p className="text-slate-400 text-sm">升級裝備，挑戰傳說巨物</p>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">持有資金</p>
                    <p className="text-2xl text-yellow-400 font-mono font-bold">${currentMoney.toLocaleString()}</p>
                </div>
                <button 
                    onClick={onClose}
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SHOP_ITEMS.map((item) => {
                    const currentLvl = getCurrentLevel(item.type);
                    const isPurchased = currentLvl >= item.levelRequired;
                    const isLocked = currentLvl + 1 < item.levelRequired;
                    const canAfford = currentMoney >= item.price;
                    const isNextUpgrade = currentLvl + 1 === item.levelRequired;

                    return (
                        <div 
                            key={item.id} 
                            className={`
                                relative p-4 rounded-xl border-2 transition-all group
                                ${isPurchased 
                                    ? 'bg-emerald-900/20 border-emerald-500/30' 
                                    : isLocked 
                                        ? 'bg-slate-800/50 border-slate-700 opacity-60' 
                                        : 'bg-slate-800 border-slate-600 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2 rounded-lg ${getTypeColorBg(item.type)}`}>
                                    {getTypeIcon(item.type)}
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${isPurchased ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                    Lv.{item.levelRequired}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                            <p className="text-sm text-slate-400 mb-4 h-10 leading-snug">{item.description}</p>

                            {isPurchased ? (
                                <button disabled className="w-full py-2 bg-emerald-600/20 text-emerald-400 font-bold rounded-lg border border-emerald-500/50 cursor-default flex items-center justify-center gap-2">
                                    <span>已擁有</span>
                                </button>
                            ) : isLocked ? (
                                <button disabled className="w-full py-2 bg-slate-700 text-slate-500 font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                                    <Lock size={16} />
                                    <span>需先購買前置升級</span>
                                </button>
                            ) : (
                                <button 
                                    onClick={() => onPurchase(item)}
                                    disabled={!canAfford}
                                    className={`w-full py-2 font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95
                                        ${canAfford 
                                            ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20' 
                                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    <span>${item.price.toLocaleString()}</span>
                                    {!canAfford && <span className="text-xs font-normal opacity-70">(餘額不足)</span>}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

      </div>
    </div>
  );
};

const getTypeIcon = (type: string) => {
    switch(type) {
        case 'rod': return <span className="text-xl">🎣</span>;
        case 'reel': return <span className="text-xl">⚙️</span>;
        case 'bait': return <span className="text-xl">🪱</span>;
        default: return <span>?</span>;
    }
}

const getTypeColorBg = (type: string) => {
    switch(type) {
        case 'rod': return 'bg-blue-500/20';
        case 'reel': return 'bg-orange-500/20';
        case 'bait': return 'bg-purple-500/20';
        default: return 'bg-slate-500/20';
    }
}

export default StoreModal;