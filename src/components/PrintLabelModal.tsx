import React, { useState } from 'react';
import { X, Printer, Check } from 'lucide-react';
import { Order } from '../types.ts';
import { QRCodeDisplay } from './QRCodeDisplay.tsx';

interface PrintLabelModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintLabelModal: React.FC<PrintLabelModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [printSuccess, setPrintSuccess] = useState(false);

  if (!isOpen || !order) return null;

  const totalActualKg = order.items.reduce(
    (s, it) => s + (it.actualWeightKg ?? it.estimatedWeightKg),
    0
  );

  const handlePrint = () => {
    setPrintSuccess(true);
    try {
      window.print();
    } catch {
      // Ignore if iframe blocks print dialog
    }
    setTimeout(() => {
      setPrintSuccess(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 min-w-0">
            <Printer className="w-5 h-5 text-slate-800 dark:text-white shrink-0" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-heading truncate">
              Cetak Thermal Label 79mm (Zebra ZD220)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 79x100mm Thermal Label Canvas */}
        <div className="bg-slate-200/50 dark:bg-slate-800/50 p-2 sm:p-4 rounded-2xl border border-slate-300/80 dark:border-slate-700 flex justify-center overflow-x-auto">
          <div className="w-[300px] sm:w-[320px] max-w-full bg-white text-slate-900 border-2 border-dashed border-slate-400 p-3.5 sm:p-4 rounded-lg shadow-sm font-mono space-y-2.5 sm:space-y-3 shrink-0">
            {/* Brand info */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-2">
              <div>
                <div className="font-black text-base sm:text-lg tracking-wider">JAJANBUAH FULFILLMENT</div>
                <div className="text-[10px] text-slate-600">GUDANG UTAMA SURABAYA</div>
              </div>
              <div className="w-9 h-9 border border-slate-900 flex items-center justify-center text-[10px] font-black shrink-0">
                QC PASS
              </div>
            </div>

            {/* Order Number & Barcode */}
            <div className="text-center py-1">
              <div className="font-black text-lg sm:text-xl tracking-tight">{order.id}</div>
              {/* Barcode visual lines */}
              <div className="flex justify-center items-center space-x-1 my-1.5 h-10 bg-slate-100 p-1 overflow-hidden">
                <div className="w-1 h-8 bg-slate-900"></div>
                <div className="w-0.5 h-8 bg-slate-900"></div>
                <div className="w-2 h-8 bg-slate-900"></div>
                <div className="w-1 h-8 bg-slate-900"></div>
                <div className="w-0.5 h-8 bg-slate-900"></div>
                <div className="w-1.5 h-8 bg-slate-900"></div>
                <div className="w-0.5 h-8 bg-slate-900"></div>
                <div className="w-2 h-8 bg-slate-900"></div>
                <div className="w-1 h-8 bg-slate-900"></div>
                <div className="w-0.5 h-8 bg-slate-900"></div>
                <div className="w-1.5 h-8 bg-slate-900"></div>
                <div className="w-2 h-8 bg-slate-900"></div>
              </div>
              <div className="text-[10px] tracking-widest text-slate-600 font-sans">
                *{order.id.replace('#', '')}*
              </div>
            </div>

            {/* Customer & Route */}
            <div className="border-t-2 border-b-2 border-slate-900 py-2 text-xs space-y-1">
              <div className="flex justify-between items-baseline gap-2">
                <span className="font-bold shrink-0">CUSTOMER:</span>
                <span className="font-black text-right truncate">{order.customerName}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2 text-[11px]">
                <span className="shrink-0">AREA / SEGMEN:</span>
                <span className="text-right truncate">{order.customerArea} ({order.customerSegment})</span>
              </div>
              <div className="flex justify-between items-baseline gap-2 text-[11px]">
                <span className="shrink-0">DOCKING / RAK:</span>
                <span className="font-bold text-right truncate">{order.binLocation || 'Aisle 02 - Palet B-01'}</span>
              </div>
            </div>

            {/* Commodities & Weights */}
            <div className="space-y-1 text-xs">
              <div className="font-bold text-[11px] uppercase border-b border-slate-200 pb-0.5">
                RINCIAN FISIK TIMBANGAN:
              </div>
              {order.items.map((it, i) => (
                <div key={i} className="flex justify-between text-[11px]">
                  <span className="truncate pr-1">{it.fruitName}</span>
                  <span className="font-bold shrink-0">
                    {(it.actualWeightKg ?? it.estimatedWeightKg).toFixed(1)} KG
                  </span>
                </div>
              ))}
            </div>

            {/* Big Total Weight Box */}
            <div className="bg-slate-900 text-white p-2 rounded text-center">
              <div className="text-[10px] uppercase font-bold tracking-wider">
                BERAT TOTAL RIIL (NETTO)
              </div>
              <div className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                {totalActualKg.toFixed(2)} KG
              </div>
            </div>

            {/* Footer QR & Verification */}
            <div className="flex justify-between items-center text-[10px] pt-1 text-slate-600 border-t border-slate-200">
              <div className="min-w-0 pr-1">
                <div className="truncate">Packer: {order.packerName || 'Station Timbangan'}</div>
                <div className="truncate">Tgl: {new Date().toLocaleDateString('id-ID')}</div>
              </div>
              <div className="w-10 h-10 border border-slate-900 p-0.5 flex items-center justify-center bg-white shrink-0">
                <QRCodeDisplay value={`JAJANBUAH:${order.id}:${order.customerName}`} size={36} />
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 text-center sm:text-left">
            Label: 79mm x 100mm (Zebra ZD220)
          </span>
          <div className="flex items-center space-x-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer text-center"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-5 py-2 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 shadow cursor-pointer text-center"
            >
              {printSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Printer className="w-3.5 h-3.5" />}
              <span>{printSuccess ? 'Terkirim ke Printer!' : 'Cetak Label'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
