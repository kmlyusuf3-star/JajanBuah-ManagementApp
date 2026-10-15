import React, { useState } from 'react';
import { X, Plus, Trash2, ShoppingBag, UserCheck, AlertCircle } from 'lucide-react';
import { Order, Packer, FruitProduct, OrderItem } from '../types.ts';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  packers: Packer[];
  products: FruitProduct[];
  onCreateOrder: (order: Partial<Order>) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  packers,
  products,
  onCreateOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerArea, setCustomerArea] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedPackerId, setSelectedPackerId] = useState('');
  const [priority, setPriority] = useState('Reguler Pagi');
  const [errorMsg, setErrorMsg] = useState('');

  // Sesuai revisi-fitur: Hilangkan mock buah yang sudah terisi agar bisa dipilih dan diisi sendiri
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: `it-${Date.now()}`,
      fruitName: '',
      variety: '',
      grade: '',
      estimatedWeightKg: 0,
      unitPriceKg: 0,
    },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `it-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        fruitName: '',
        variety: '',
        grade: '',
        estimatedWeightKg: 0,
        unitPriceKg: 0,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== idx));
    } else {
      // Reset the single item to empty
      setItems([
        {
          id: `it-${Date.now()}`,
          fruitName: '',
          variety: '',
          grade: '',
          estimatedWeightKg: 0,
          unitPriceKg: 0,
        },
      ]);
    }
  };

  const handleItemChange = (idx: number, field: keyof OrderItem, val: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleProductSelect = (idx: number, prodId: string) => {
    if (!prodId) {
      setItems((prev) => {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          fruitName: '',
          variety: '',
          grade: '',
          unitPriceKg: 0,
        };
        return copy;
      });
      return;
    }

    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      if (prod.isBundle && prod.bundleItems && prod.bundleItems.length > 0) {
        const totalBundleKg = prod.bundleItems.reduce((acc, b) => acc + (b.weightKg || 0), 0);
        const compositionSummary = prod.bundleItems.map((b) => `${b.fruitName} (${b.weightKg}kg)`).join(' + ');
        setItems((prev) => {
          const copy = [...prev];
          copy[idx] = {
            ...copy[idx],
            fruitName: prod.name,
            variety: `Paket Bundling: ${compositionSummary}`,
            grade: prod.grade || 'Grade A',
            estimatedWeightKg: totalBundleKg > 0 ? totalBundleKg : 1,
            unitPriceKg: prod.pricePerKg,
          };
          return copy;
        });
      } else {
        setItems((prev) => {
          const copy = [...prev];
          copy[idx] = {
            ...copy[idx],
            fruitName: prod.name,
            variety: prod.variety,
            grade: prod.grade,
            unitPriceKg: prod.pricePerKg,
          };
          return copy;
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('Silakan masukkan nama customer atau outlet!');
      return;
    }
    if (!customerArea.trim()) {
      setErrorMsg('Silakan masukkan alamat lengkap pengiriman!');
      return;
    }

    // Validate fruit items: must have fruitName and weight > 0
    const validItems = items.filter((it) => it.fruitName.trim() !== '' && it.estimatedWeightKg > 0);
    if (validItems.length === 0) {
      setErrorMsg('Silakan pilih minimal 1 komoditas buah dan isi estimasi Kg pesanan!');
      return;
    }

    setErrorMsg('');
    const assignedPacker = packers.find((p) => p.id === selectedPackerId);
    const newId = `#ORD-2026-08${Math.floor(100 + Math.random() * 900)}`;

    onCreateOrder({
      id: newId,
      customerName,
      customerArea,
      customerSegment: 'Pelanggan',
      customerPhone: customerPhone || '0812-0000-0000',
      items: validItems,
      waktuMasuk: 'Baru saja',
      waktuMasukMinutesAgo: 1,
      createdAt: new Date().toISOString(),
      packerId: assignedPacker?.id,
      packerName: assignedPacker?.name,
      packerStation: assignedPacker?.station,
      status: assignedPacker ? 'sedang_ditimbang' : 'order_baru',
      priorityLabel: priority,
      binLocation: 'Aisle 02 - Palet B-01',
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg font-heading truncate">
                Buat Order Buah Baru
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Input pesanan masuk fulfillment & plot ke antrean stasiun timbangan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer info */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Nama Customer / Outlet <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Resto Nelayan Segar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  No. WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="0812-3456-7890"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Alamat Lengkap Pengiriman <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Contoh: Jl. Raya Gubeng No. 88, Kota Surabaya"
                value={customerArea}
                onChange={(e) => setCustomerArea(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white resize-none"
              />
            </div>
          </div>

          {/* Fruit Commodities list: KOSONG MOCK-NYA AGAR BISA DIISI SENDIRI */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Komoditas Buah & Estimasi Kg
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Item Buah</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const selectedProd = products.find((p) => p.name === item.fruitName);
                const subtotal = (item.estimatedWeightKg || 0) * (item.unitPriceKg || 0);

                return (
                  <div
                    key={item.id || idx}
                    className="bg-slate-100/80 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center text-xs"
                  >
                    {/* Buah Selector */}
                    <div className="sm:col-span-5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase sm:hidden block mb-0.5">
                        Komoditas #{idx + 1}
                      </label>
                      {products.length > 0 ? (
                        <select
                          value={selectedProd?.id || ''}
                          onChange={(e) => handleProductSelect(idx, e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold cursor-pointer truncate"
                        >
                          <option value="">-- Pilih Komoditas / Paket Buah --</option>
                          {products.some((p) => !p.isBundle) && (
                            <optgroup label="🍏 Komoditas Buah Tunggal">
                              {products
                                .filter((p) => !p.isBundle)
                                .map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} (Rp {p.pricePerKg.toLocaleString('id-ID')}/kg)
                                  </option>
                                ))}
                            </optgroup>
                          )}
                          {products.some((p) => p.isBundle) && (
                            <optgroup label="🎁 Paket Bundling Buah">
                              {products
                                .filter((p) => p.isBundle)
                                .map((p) => (
                                  <option key={p.id} value={p.id}>
                                    🎁 {p.name} (Rp {p.pricePerKg.toLocaleString('id-ID')}/paket)
                                  </option>
                                ))}
                            </optgroup>
                          )}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Ketik nama komoditas buah..."
                          value={item.fruitName}
                          onChange={(e) => handleItemChange(idx, 'fruitName', e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                        />
                      )}
                    </div>

                    {/* Estimasi KG Input - Bebas diisi sendiri */}
                    <div className="flex items-center justify-between sm:contents gap-2">
                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase sm:hidden block mb-0.5">
                          Estimasi Kg
                        </label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            step="0.5"
                            min="0.1"
                            placeholder="0"
                            value={item.estimatedWeightKg === 0 ? '' : item.estimatedWeightKg}
                            onChange={(e) =>
                              handleItemChange(idx, 'estimatedWeightKg', parseFloat(e.target.value) || 0)
                            }
                            className="w-20 sm:w-full bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-center font-bold"
                          />
                          <span className="text-slate-500 font-bold text-xs">KG</span>
                        </div>
                      </div>

                      {/* Harga / Subtotal */}
                      <div className="sm:col-span-3 text-right">
                        <div className="text-[10px] text-slate-500">Harga / Subtotal:</div>
                        <div className="font-bold text-slate-800 dark:text-white tnum">
                          {item.unitPriceKg > 0 ? (
                            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                          ) : (
                            <span className="text-slate-400 italic">Pilih buah</span>
                          )}
                        </div>
                      </div>

                      {/* Delete item button */}
                      <div className="sm:col-span-1 text-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Hapus Buah"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assign Packer */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Plot ke Packer (Opsional, atau biarkan Auto-Balance)</span>
            </label>
            <select
              value={selectedPackerId}
              onChange={(e) => setSelectedPackerId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white font-medium cursor-pointer"
            >
              <option value="">Belum Diplot (Masuk Antrean Baru)</option>
              {packers.map((p) => {
                const isFull = p.activeOrderIds.length >= p.capacityMax;
                return (
                  <option key={p.id} value={p.id} disabled={isFull}>
                    {p.name} ({p.station}) - {p.activeOrderIds.length}/{p.capacityMax} Order{' '}
                    {isFull ? '[PENUH]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              Prioritas Waktu Pengiriman:
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
            >
              <option value="Reguler Pagi">Reguler Pagi (06:00 - 10:00 WIB)</option>
              <option value="Priority VIP">Priority VIP (Sebelum Jam Makan Siang)</option>
              <option value="Horeca Express">Horeca Express (Pengiriman Langsung)</option>
              <option value="Sore Hari">Sore Hari (15:00 - 18:00 WIB)</option>
            </select>
          </div>

          {/* Submit */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 shadow transition-all hover:scale-[1.02] cursor-pointer text-center"
            >
              Simpan & Terbitkan Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
