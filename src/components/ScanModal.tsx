import React, { useState } from 'react';
import { X, CheckCircle2, Scan, Search } from 'lucide-react';
import { Order } from '../types.ts';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onSelectScannedOrder: (orderId: string) => void;
}

export const ScanModal: React.FC<ScanModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectScannedOrder,
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const query = barcodeInput.trim().toUpperCase();
    const cleanId = query.startsWith('#') ? query : `#${query}`;
    const found = orders.find(
      (o) => o.id.toUpperCase() === cleanId || o.id.replace('#', '').toUpperCase() === query
    );
    if (found) {
      setFeedback({ type: 'success', message: `Resi ${found.id} (${found.customerName}) terdeteksi!` });
      setTimeout(() => {
        onSelectScannedOrder(found.id);
        onClose();
      }, 700);
    } else {
      setFeedback({ type: 'error', message: `Resi "${barcodeInput}" tidak ditemukan dalam daftar order aktif.` });
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5 min-w-0">
            <Scan className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="font-extrabold text-white text-sm sm:text-base font-heading truncate">
              Pemindai Barcode / QR Label Resi
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera / Optical scanner viewport */}
        <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-black border-2 border-emerald-500/50 shadow-inner">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=700&q=80"
            alt="Viewfinder"
            className="w-full h-full object-cover opacity-60"
          />
          {/* Reticle brackets */}
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
            <div className="w-48 sm:w-56 h-32 sm:h-36 border-2 border-dashed border-emerald-400 rounded-xl relative flex items-center justify-center">
              <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-scanline"></div>
              {feedback?.type === 'success' ? (
                <div className="bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-xl flex items-center space-x-2 font-bold text-xs shadow-lg animate-in zoom-in-90 text-center">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">{feedback.message}</span>
                </div>
              ) : (
                <span className="text-[10px] sm:text-[11px] text-white/90 font-medium px-2 py-0.5 bg-black/60 rounded backdrop-blur-xs text-center max-w-[90%]">
                  Arahkan scanner ke barcode atau ketik ID resi di bawah
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Input Barcode Scanner */}
        <form onSubmit={handleScanSubmit} className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Scan barcode fisik atau ketik nomor order..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer shrink-0 text-center"
            >
              Cari & Buka
            </button>
          </div>
          {feedback && feedback.type === 'error' && (
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs">
              {feedback.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
