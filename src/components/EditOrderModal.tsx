import React, { useState, useEffect } from 'react';
import { X, Edit2 } from 'lucide-react';
import { Order, Packer, FruitProduct, OrderItem } from '../types.ts';

interface EditOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  packers: Packer[];
  products: FruitProduct[];
  onSaveOrder: (updatedOrder: Order) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  packers,
  products: _products,
  onSaveOrder,
}) => {
  const [customerName, setCustomerName] = useState(order?.customerName || '');
  const [customerArea, setCustomerArea] = useState(order?.customerArea || '');
  const [customerPhone, setCustomerPhone] = useState(order?.customerPhone || '');
  const [selectedPackerId, setSelectedPackerId] = useState(order?.packerId || '');
  const [items, setItems] = useState<OrderItem[]>(order?.items || []);

  useEffect(() => {
    if (order) {
      setCustomerName(order.customerName);
      setCustomerArea(order.customerArea);
      setCustomerPhone(order.customerPhone);
      setSelectedPackerId(order.packerId || '');
      setItems(order.items);
    }
  }, [order]);

  const handleWeightChange = (idx: number, newWeight: number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], estimatedWeightKg: newWeight };
      return copy;
    });
  };

  const handleActualWeightChange = (idx: number, newActual: number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], actualWeightKg: newActual, isWeighed: true };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    const assignedPacker = packers.find((p) => p.id === selectedPackerId);

    onSaveOrder({
      ...order,
      customerName,
      customerArea,
      customerPhone,
      items,
      packerId: assignedPacker?.id,
      packerName: assignedPacker?.name,
      packerStation: assignedPacker?.station,
    });
    onClose();
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 min-w-0">
            <Edit2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base font-heading truncate">
              Edit Data Order: {order.id}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nama Customer:
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                No. WhatsApp:
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Alamat Lengkap Pengiriman:
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Jl. Raya Darmo Permai II No. 18, Surabaya"
              value={customerArea}
              onChange={(e) => setCustomerArea(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Items & Weights */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Rincian Berat Komoditas (Est & Riil Aktual):
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="bg-slate-100/80 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="font-bold text-slate-800 dark:text-white truncate">{it.fruitName}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Estimasi Order (Kg):</span>
                      <input
                        type="number"
                        step="0.1"
                        value={it.estimatedWeightKg}
                        onChange={(e) => handleWeightChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Aktual Timbang (Kg):</span>
                      <input
                        type="number"
                        step="0.1"
                        value={it.actualWeightKg ?? ''}
                        placeholder="Belum timbang"
                        onChange={(e) =>
                          handleActualWeightChange(idx, parseFloat(e.target.value) || 0)
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-extrabold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Packer */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Tugaskan ke Packer:
            </label>
            <select
              value={selectedPackerId}
              onChange={(e) => setSelectedPackerId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
            >
              <option value="">Belum Diplot (Antrean Bebas)</option>
              {packers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.station})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow cursor-pointer text-center"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
