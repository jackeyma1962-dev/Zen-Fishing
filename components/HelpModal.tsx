import React from 'react';
import { X, MousePointer2, Anchor, Disc3 } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative p-6">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🎣</span> 遊戲說明
        </h2>

        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0 border-2 border-blue-400">
                    <MousePointer2 className="text-white" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">1. 拋竿 (Cast)</h3>
                    <p className="text-slate-400 text-sm">點擊藍色的 <span className="text-blue-300 font-mono">CAST</span> 按鈕拋出魚餌，然後耐心等待浮標動靜。</p>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shrink-0 animate-pulse border-2 border-red-400">
                    <Anchor className="text-white" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">2. 上鉤 (Hook)</h3>
                    <p className="text-slate-400 text-sm">當出現 <span className="text-red-400 font-bold">"魚上鉤了!"</span> 且按鈕變紅時，<span className="text-white font-bold">立即按住</span>按鈕不放！反應太慢魚會跑掉。</p>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 border-2 border-emerald-400">
                    <Disc3 className="text-white" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">3. 收線 (Reel)</h3>
                    <p className="text-slate-400 text-sm">
                        <span className="text-emerald-400 font-bold">按住</span>提升張力，<span className="text-slate-400 font-bold">放開</span>降低張力。
                        <br/>
                        將張力指標保持在 <span className="bg-white/10 px-1 rounded border border-white/20 text-white">亮色區域</span> 內，直到捕獲進度滿 100%。
                    </p>
                </div>
            </div>
        </div>

        <button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-8 transition-all shadow-lg shadow-blue-900/20"
        >
            開始釣魚
        </button>
      </div>
    </div>
  );
};

export default HelpModal;
