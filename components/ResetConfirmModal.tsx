import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ResetConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-red-500/30 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle size={32} className="text-red-500" />
            </div>
            
            <h2 className="text-xl font-bold text-white">重置遊戲進度</h2>
            
            <p className="text-slate-400 text-sm leading-relaxed">
                確定要刪除所有存檔並重新開始嗎？<br/>
                <span className="text-red-400 font-bold">此動作無法復原。</span>
            </p>

            <div className="flex gap-3 w-full mt-4">
                <button 
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
                >
                    取消
                </button>
                <button 
                    onClick={onConfirm}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-900/20 transition-colors"
                >
                    確定
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmModal;