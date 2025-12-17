import React from 'react';
import { X, Star, ChefHat, Info, Coins } from 'lucide-react';
import { FishAnalysis } from '../types';

interface ModalProps {
  data: FishAnalysis | null;
  onClose: () => void;
  loading: boolean;
}

const Modal: React.FC<ModalProps> = ({ data, onClose, loading }) => {
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white/10 border border-white/20 p-8 rounded-2xl flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg font-medium">正在分析漁獲數據...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative transform transition-all scale-100">
        
        {/* Header / Image Area Placeholder */}
        <div className={`h-32 w-full flex items-center justify-center bg-gradient-to-r ${getRarityColor(data.rarity)} relative`}>
            <div className="text-6xl animate-bounce">🐟</div>
            
            {/* Price Tag */}
            <div className="absolute -bottom-4 bg-slate-900 border-2 border-yellow-500 text-yellow-400 px-4 py-1 rounded-full font-mono font-bold text-xl shadow-lg flex items-center gap-2">
                <Coins size={18} />
                ${data.price}
            </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 pt-8 space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-white">{data.name}</h2>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  className={i < data.rarity ? "fill-yellow-400 text-yellow-400" : "text-slate-600"} 
                />
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 text-sky-400 mb-1">
              <Info size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">生物圖鑑</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{data.description}</p>
          </div>

          <div className="bg-orange-900/20 p-4 rounded-xl border border-orange-900/50">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <ChefHat size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">料理建議</span>
            </div>
            <p className="text-slate-300 text-sm italic">{data.cookingTip}</p>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            <span>收入魚簍</span>
            <span className="opacity-70 text-sm font-normal">(+${data.price})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const getRarityColor = (rarity: number) => {
  switch (rarity) {
    case 5: return "from-purple-600 via-pink-600 to-red-600";
    case 4: return "from-yellow-500 via-orange-500 to-red-500";
    case 3: return "from-blue-500 to-cyan-400";
    case 2: return "from-green-500 to-emerald-400";
    default: return "from-slate-500 to-slate-400";
  }
}

export default Modal;