import React from 'react';
import { FishAnalysis } from '../types';
import { Coins, Fish } from 'lucide-react';

interface InventoryItem {
  count: number;
  totalValue: number;
  data: FishAnalysis;
}

interface InventoryProps {
  caughtFishes: Record<string, InventoryItem>;
  totalMoney: number;
  // Removed onReset prop
}

const Inventory: React.FC<InventoryProps> = ({ caughtFishes, totalMoney }) => {
  const fishes = Object.values(caughtFishes) as InventoryItem[];

  return (
    <div className="absolute top-24 left-4 z-20 w-64 pointer-events-none animate-in slide-in-from-left-4 fade-in duration-700 flex flex-col max-h-[80vh] sm:max-h-[calc(100vh-8rem)]">
      
      {/* Wallet Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-yellow-500/30 rounded-xl p-4 mb-4 shadow-xl shrink-0">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-full">
                <Coins className="text-yellow-400" size={24} />
            </div>
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">總資產</p>
                <p className="text-white text-2xl font-mono font-bold">${totalMoney.toLocaleString()}</p>
            </div>
        </div>
      </div>

      {/* Fish List */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl flex-1 flex flex-col min-h-0 pointer-events-auto">
        <div className="p-3 bg-white/5 border-b border-white/10 flex items-center gap-2 shrink-0">
             <Fish size={16} className="text-blue-400" />
             <span className="text-white text-sm font-bold">漁獲清單 ({fishes.reduce((acc, curr) => acc + curr.count, 0)})</span>
        </div>
        
        <div className="overflow-y-auto flex-1 custom-scrollbar">
            {fishes.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm italic">
                    魚簍是空的...
                </div>
            ) : (
                <div className="divide-y divide-white/5">
                    {fishes.map((item) => (
                        <div key={item.data.name} className="p-3 flex justify-between items-center hover:bg-white/5 transition-colors group">
                            <div className="flex-1 min-w-0 mr-2">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${getRarityDotColor(item.data.rarity)}`}></span>
                                    <p className="text-white text-sm font-medium truncate">{item.data.name}</p>
                                </div>
                                <p className="text-slate-400 text-xs pl-4">${item.data.price} / 隻</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="bg-blue-600/80 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                                    x{item.count}
                                </span>
                                <span className="text-yellow-400 text-xs font-mono">
                                    ${item.totalValue.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        {/* Footer removed */}
      </div>
    </div>
  );
};

const getRarityDotColor = (rarity: number) => {
    switch (rarity) {
      case 5: return "bg-red-500 shadow-[0_0_8px_red]";
      case 4: return "bg-orange-500";
      case 3: return "bg-blue-400";
      case 2: return "bg-green-400";
      default: return "bg-slate-400";
    }
  }

export default Inventory;