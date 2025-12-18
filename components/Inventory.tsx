import React, { useState } from 'react';
import { FishAnalysis } from '../types';
import { Coins, Fish, ChevronDown, ChevronUp } from 'lucide-react';

interface InventoryItem {
  count: number;
  totalValue: number;
  data: FishAnalysis;
}

interface InventoryProps {
  caughtFishes: Record<string, InventoryItem>;
  totalMoney: number;
}

const Inventory: React.FC<InventoryProps> = ({ caughtFishes, totalMoney }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fishes = Object.values(caughtFishes) as InventoryItem[];
  const totalCount = fishes.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="absolute top-16 sm:top-24 left-4 z-20 w-auto sm:w-64 pointer-events-none animate-in slide-in-from-left-4 fade-in duration-700 flex flex-col max-h-[70vh] sm:max-h-[calc(100vh-8rem)]">
      
      {/* Wallet Card - Always Visible */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-slate-900/80 backdrop-blur-md border border-yellow-500/30 rounded-xl p-3 sm:p-4 mb-2 shadow-xl shrink-0 pointer-events-auto cursor-pointer active:scale-95 transition-transform flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-yellow-500/20 rounded-full">
                <Coins className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
                <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-none mb-1">錢包</p>
                <p className="text-white text-lg sm:text-2xl font-mono font-bold leading-none">${totalMoney.toLocaleString()}</p>
            </div>
        </div>
        <div className="sm:hidden text-slate-400">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Fish List - Toggleable on Mobile, Always on Desktop */}
      <div className={`
        bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl flex-1 flex flex-col min-h-0 pointer-events-auto transition-all duration-300
        ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 sm:opacity-100 sm:scale-100 h-0 sm:h-auto pointer-events-none sm:pointer-events-auto'}
      `}>
        <div className="p-2 sm:p-3 bg-white/5 border-b border-white/10 flex items-center gap-2 shrink-0">
             <Fish size={14} className="text-blue-400" />
             <span className="text-white text-xs sm:text-sm font-bold truncate">魚簍 ({totalCount})</span>
        </div>
        
        <div className="overflow-y-auto flex-1 custom-scrollbar">
            {fishes.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-[10px] sm:text-sm italic">
                    空空如也...
                </div>
            ) : (
                <div className="divide-y divide-white/5">
                    {fishes.map((item) => (
                        <div key={item.data.name} className="p-2 sm:p-3 flex justify-between items-center hover:bg-white/5 transition-colors group">
                            <div className="flex-1 min-w-0 mr-2">
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getRarityDotColor(item.data.rarity)}`}></span>
                                    <p className="text-white text-[10px] sm:text-sm font-medium truncate leading-tight">{item.data.name}</p>
                                </div>
                                <p className="text-slate-400 text-[8px] sm:text-xs pl-3 leading-tight">${item.data.price}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="bg-blue-600/80 text-white text-[8px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full mb-0.5">
                                    x{item.count}
                                </span>
                                <span className="text-yellow-400 text-[8px] sm:text-xs font-mono">
                                    ${item.totalValue.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
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