import React from 'react';
import { Sparkles, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastState {
  show: boolean;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface ToastProps {
  toast: ToastState;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast.show) return null;

  return (
    <div className="fixed top-5 right-3 sm:right-5 max-w-sm w-[calc(100%-24px)] sm:w-auto bg-[#131127] border border-amber-400/80 text-amber-200 px-4 py-3 rounded-2xl shadow-2xl z-50 flex items-center justify-between gap-3 text-xs backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="flex items-center gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
        <span className="font-medium text-slate-100">{toast.message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-purple-300 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
