
import React, { useState } from 'react';
import { FishAnalysis } from '../types';
import { Coins, Fish, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { getBiomeName } from '../services/fishService';

interface InventoryItem {
  count: number;
  totalValue: number;
  data: FishAnalysis;
}

interface InventoryProps {
  caughtFishes: Record<string, InventoryItem>;
  totalMoney: number;
  playerLevel: number;
}

const Inventory: React.FC<InventoryProps> = ({ caughtFishes, totalMoney, playerLevel }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fishes = Object.values(caughtFishes) as InventoryItem[];
  const totalCount = fishes.reduce((acc, curr) => acc + curr.count, 0);
  const currentBiome = getBiomeName(playerLevel);

  return (
    <div className="pointer-events-none animate-in slide-in-from-left-4 fade-in duration-700 flex flex-col max-h-[40vh] sm:max-h-[50vh]">
      
      {/* Wallet Card */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-slate-950/90 backdrop-blur-md border border-yellow-500/30 rounded-xl p-3 mb-2 shadow-xl shrink-0 pointer-events-auto cursor-pointer active:scale-95 transition-transform flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-full">
                <Coins className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">錢包</p>
                <p className="text-white text-lg sm:text-xl font-mono font-bold leading-none">${totalMoney.toLocaleString()}</p>
            </div>
        </div>
        <div className="sm:hidden text-slate-500">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Biome Indicator: 新增海域顯示，加強等級感知 */}
      <div className="bg-blue-950/80 border border-blue-500/20 rounded-xl p-2 mb-2 shadow-lg shrink-0 pointer-events-auto flex items-center gap-2">
         <MapPin size={12} className="text-blue-400" />
         <span className="text-white text-[10px] font-bold uppercase tracking-tighter">當前海域：{currentBiome}</span>
      </div>

      {/* Fish List */}
      <div className={`
        bg-slate-950/90 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden shadow-xl flex-1 flex flex-col min-h-0 pointer-events-auto transition-all duration-300
        ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 sm:opacity-100 sm:scale-100 h-0 sm:h-auto pointer-events-none sm:pointer-events-auto'}
      `}>
        <div className="p-2 bg-white/5 border-b border-white/10 flex items-center gap-2 shrink-0">
             <Fish size={14} className="text-blue-400" />
             <span className="text-white text-xs font-bold truncate">魚簍 ({totalCount})</span>
        </div>
        
        <div className="overflow-y-auto flex-1 custom-scrollbar">
            {fishes.length === 0 ? (
                <div className="p-4 text-center text-slate-600 text-[10px] italic">魚簍空空的...</div>
            ) : (
                <div className="divide-y divide-white/5">
                    {fishes.map((item) => (
                        <div key={item.data.name} className="p-2 flex justify-between items-center hover:bg-white/5 transition-colors">
                            <div className="flex-1 min-w-0 mr-2">
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getRarityDotColor(item.data.rarity)}`}></span>
                                    <p className="text-white text-[10px] sm:text-xs font-medium truncate leading-tight">{item.data.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-600/30 text-blue-300 text-[9px] font-bold px-1.5 py-0.5 rounded leading-none">x{item.count}</span>
                                <span className="text-yellow-400 text-[9px] font-mono">${item.totalValue.toLocaleString()}</span>
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
