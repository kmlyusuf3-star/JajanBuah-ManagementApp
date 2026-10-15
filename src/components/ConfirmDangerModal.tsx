import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDangerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmButtonText?: string;
  itemName?: string;
}

export const ConfirmDangerModal: React.FC<ConfirmDangerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmButtonText = 'Hapus Permanen',
  itemName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-rose-200 dark:border-rose-900/50 p-5 sm:p-6 space-y-4">
        {/* Warning Icon & Header */}
        <div className="flex items-start space-x-3 sm:space-x-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base font-heading">
              {title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item highlighted box */}
        {itemName && (
          <div className="p-3 rounded-xl bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 break-words">
            Target: <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{itemName}</span>
          </div>
        )}

        <div className="text-[11px] text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60 font-medium leading-relaxed">
          Tindakan destruktif ini tidak dapat dibatalkan (undo) dan akan tercatat di sistem.
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 sm:py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
