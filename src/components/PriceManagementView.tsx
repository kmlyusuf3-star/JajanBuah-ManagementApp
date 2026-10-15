import React, { useState } from 'react';
import {
  BadgeDollarSign,
  History,
  Edit2,
  X,
  Lock,
} from 'lucide-react';
import { FruitProduct, PriceHistoryItem } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';

interface PriceManagementViewProps {
  products: FruitProduct[];
  priceHistory: PriceHistoryItem[];
  onUpdatePrice: (
    productId: string,
    newPrice: number,
    unit: 'kg' | 'gram' | 'pack',
    reason: string
  ) => void;
}

export const PriceManagementView: React.FC<PriceManagementViewProps> = ({
  products,
  priceHistory,
  onUpdatePrice,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<FruitProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [unit, setUnit] = useState<'kg' | 'gram' | 'pack'>('kg');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenEditPrice = (p: FruitProduct) => {
    setSelectedProduct(p);
    setNewPrice(p.pricePerKg);
    setUnit(p.unitType || 'kg');
    setReason('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmitPriceChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!reason.trim()) {
      setErrorMsg('Alasan perubahan harga wajib diisi untuk catatan jejak audit.');
      return;
    }
    setErrorMsg('');
    onUpdatePrice(selectedProduct.id, newPrice, unit, reason);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 font-sans w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              PENETAPAN HARGA OPERASIONAL
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              AUDIT RECORDED
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading mt-1">
            Manajemen Harga & Fluktuasi Harian
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Pusat penetapan harga harian komoditas buah (Per Kg / Gram / Pack) dengan pencatatan riwayat audit otomatis.
          </p>
        </div>
      </div>

      {/* Grid of Product Prices */}
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5 sm:space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-heading">
            Daftar Penetapan Harga Harian Komoditas
          </h3>
          <span className="text-xs text-slate-500 font-medium">Total {products.length} Buah</span>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="Belum Ada Komoditas di Katalog"
            description="Tambahkan produk buah melalui menu Katalog Produk terlebih dahulu untuk mengatur harga jual dan satuan."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{p.category}</span>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 truncate">
                        {p.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">{p.variety}</span>
                    </div>
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  </div>

                  <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-200 dark:border-slate-700/60 space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-500">Harga Per Kg:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm tnum">
                        Rp {p.pricePerKg.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[11px] text-slate-500">
                      <span>Per Gram:</span>
                      <span className="font-mono">Rp {(p.pricePerKg / 1000).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-[11px] text-slate-500">
                      <span>Estimasi Pack (2.5kg):</span>
                      <span className="font-mono">Rp {(p.pricePerKg * 2.5).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEditPrice(p)}
                  className="mt-3.5 sm:mt-4 w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Ubah Harga Buah</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Price History */}
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-heading truncate">
                Riwayat Perubahan Harga (Audit Trail)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Log audit fluktuasi harga resmi • tidak dapat dihapus
              </p>
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 flex items-center space-x-1 shrink-0">
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Immutable Records</span>
          </span>
        </div>

        {priceHistory.length === 0 ? (
          <div className="p-8 sm:p-10 text-center text-xs text-slate-500">
            Belum ada catatan riwayat perubahan harga. Perubahan harga komoditas akan otomatis tercatat di tabel audit ini.
          </div>
        ) : (
          <>
            {/* Mobile Card List for Price History */}
            <div className="lg:hidden p-3.5 space-y-3">
              {priceHistory.map((h) => {
                const diff = h.newPrice - h.oldPrice;
                return (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-400">{h.id}</span>
                      <span className="text-[10px] text-slate-400">{h.timestamp}</span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {h.productName}
                      </h4>
                      <span
                        className={`font-bold text-xs ${
                          diff > 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : diff < 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {diff > 0 ? `+Rp ${diff.toLocaleString('id-ID')}` : `Rp ${diff.toLocaleString('id-ID')}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span>Rp {h.oldPrice.toLocaleString('id-ID')} ➔ <strong>Rp {h.newPrice.toLocaleString('id-ID')}</strong>/{h.unit}</span>
                      <span className="text-purple-600 dark:text-purple-400 font-semibold truncate max-w-[120px]">{h.changedBy}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      "{h.reason}"
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-800 tracking-wider">
                    <th className="py-3 px-5">ID LOG</th>
                    <th className="py-3 px-4">KOMODITAS</th>
                    <th className="py-3 px-4">HARGA LAMA</th>
                    <th className="py-3 px-4">HARGA BARU</th>
                    <th className="py-3 px-4">SELISIH</th>
                    <th className="py-3 px-4">ALASAN PERUBAHAN</th>
                    <th className="py-3 px-4">OTORISATOR</th>
                    <th className="py-3 px-4">WAKTU PERUBAHAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {priceHistory.map((h) => {
                    const diff = h.newPrice - h.oldPrice;
                    return (
                      <tr key={h.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-400">{h.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {h.productName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 tnum">
                          Rp {h.oldPrice.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white tnum">
                          Rp {h.newPrice.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-bold ${
                              diff > 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : diff < 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {diff > 0 ? `+Rp ${diff.toLocaleString('id-ID')}` : `Rp ${diff.toLocaleString('id-ID')}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs text-slate-600 dark:text-slate-300 italic">
                          "{h.reason}"
                        </td>
                        <td className="py-3.5 px-4 text-purple-700 dark:text-purple-300 font-semibold">
                          {h.changedBy}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{h.timestamp}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Edit Price Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 min-w-0">
                <BadgeDollarSign className="w-5 h-5 text-amber-500 shrink-0" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-heading truncate">
                  Ubah Harga {selectedProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitPriceChange} className="space-y-3.5 text-xs">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl flex justify-between text-slate-700 dark:text-slate-300">
                <span>Harga Saat Ini:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  Rp {selectedProduct.pricePerKg.toLocaleString('id-ID')} / Kg
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Pilih Satuan Penetapan:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['kg', 'gram', 'pack'] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`py-2 rounded-xl border text-center font-bold capitalize transition-colors cursor-pointer text-xs ${
                        unit === u
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                          : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Per {u.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Harga Baru (Rp):
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-sm focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Alasan Perubahan Harga (Wajib untuk Audit):
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Kenaikan harga panen supplier atau promo volume horeca"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-800 resize-none"
                ></textarea>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow cursor-pointer text-center"
                >
                  Simpan & Catat Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
