import React, { useState } from 'react';
import {
  Apple,
  Plus,
  Trash2,
  CheckCircle2,
  Scale,
  MessageCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { FruitProduct, Order, OrderItem, AppBranding } from '../types.ts';

interface CustomerOrderPortalProps {
  products: FruitProduct[];
  onSubmitOrder: (newOrder: Partial<Order>) => string; // returns generated order ID
  onExitToDashboard?: () => void;
  isStandaloneGuest?: boolean;
  branding?: AppBranding;
}

export const CustomerOrderPortal: React.FC<CustomerOrderPortalProps> = ({
  products,
  onSubmitOrder,
  onExitToDashboard,
  isStandaloneGuest = false,
  branding,
}) => {
  const activeProducts = products.filter((p) => p.isActive);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [priorityLabel, setPriorityLabel] = useState('Reguler Pagi');
  const [notes, setNotes] = useState('');

  // Sesuai revisi: Mulai dari kosong tanpa mock buah prefilled agar bisa dipilih sendiri
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: `item-cust-${Date.now()}`,
      fruitName: '',
      variety: '',
      grade: '',
      brix: 14,
      estimatedWeightKg: 0,
      unitPriceKg: 0,
    },
  ]);

  // Submission result state
  const [submittedOrder, setSubmittedOrder] = useState<{
    orderId: string;
    customerName: string;
    totalEstKg: number;
    totalEstAmount: number;
    phone: string;
    items: OrderItem[];
  } | null>(null);

  const [formError, setFormError] = useState('');

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        fruitName: '',
        variety: '',
        grade: '',
        brix: 14,
        estimatedWeightKg: 0,
        unitPriceKg: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    } else {
      setItems([
        {
          id: `item-cust-${Date.now()}`,
          fruitName: '',
          variety: '',
          grade: '',
          brix: 14,
          estimatedWeightKg: 0,
          unitPriceKg: 0,
        },
      ]);
    }
  };

  const handleFruitSelect = (index: number, productId: string) => {
    if (!productId) {
      setItems((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          fruitName: '',
          variety: '',
          grade: '',
          brix: 14,
          unitPriceKg: 0,
        };
        return copy;
      });
      return;
    }

    const prod = activeProducts.find((p) => p.id === productId);
    if (!prod) return;

    if (prod.isBundle && prod.bundleItems && prod.bundleItems.length > 0) {
      const totalBundleKg = prod.bundleItems.reduce((acc, b) => acc + (b.weightKg || 0), 0);
      const compositionSummary = prod.bundleItems.map((b) => `${b.fruitName} (${b.weightKg}kg)`).join(' + ');
      setItems((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          fruitName: prod.name,
          variety: `Paket Bundling: ${compositionSummary}`,
          grade: prod.grade || 'Grade A',
          brix: prod.brix,
          estimatedWeightKg: totalBundleKg > 0 ? totalBundleKg : 1,
          unitPriceKg: prod.pricePerKg,
        };
        return copy;
      });
    } else {
      setItems((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          fruitName: prod.name,
          variety: prod.variety,
          grade: prod.grade,
          brix: prod.brix,
          unitPriceKg: prod.pricePerKg,
        };
        return copy;
      });
    }
  };

  const handleWeightChange = (index: number, newWeight: number) => {
    const val = Math.max(0, Math.round(newWeight * 10) / 10);
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        estimatedWeightKg: val,
      };
      return copy;
    });
  };

  const validItems = items.filter((it) => it.fruitName.trim() !== '' && it.estimatedWeightKg > 0);
  const totalEstKg = validItems.reduce((sum, it) => sum + (it.estimatedWeightKg || 0), 0);
  const totalEstAmount = validItems.reduce(
    (sum, it) => sum + (it.estimatedWeightKg || 0) * (it.unitPriceKg || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('Mohon isi Nama Lengkap / Usaha Anda.');
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('Mohon isi Nomor WhatsApp untuk konfirmasi hasil penimbangan.');
      return;
    }
    if (!customerAddress.trim()) {
      setFormError('Mohon isi Alamat Lengkap Pengiriman pesanan Anda.');
      return;
    }
    if (validItems.length === 0) {
      setFormError('Mohon pilih jenis buah dan masukkan estimasi Kg yang ingin dipesan.');
      return;
    }

    setFormError('');
    const newOrderId = onSubmitOrder({
      customerName,
      customerPhone,
      customerArea: customerAddress,
      customerSegment: 'Pelanggan',
      notes,
      priorityLabel,
      items: validItems,
      status: 'order_baru',
    });

    setSubmittedOrder({
      orderId: newOrderId,
      customerName,
      totalEstKg,
      totalEstAmount,
      phone: customerPhone,
      items: validItems,
    });
  };

  const handleResetForNewOrder = () => {
    setSubmittedOrder(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setNotes('');
    setItems([
      {
        id: `item-cust-${Date.now()}`,
        fruitName: '',
        variety: '',
        grade: '',
        brix: 14,
        estimatedWeightKg: 0,
        unitPriceKg: 0,
      },
    ]);
  };

  if (submittedOrder) {
    const waText = `Halo Admin Gudang JajanBuah, saya telah mengirim pesanan baru melalui form online dengan ID: *${submittedOrder.orderId}* atas nama *${submittedOrder.customerName}* (Total Estimasi: ${submittedOrder.totalEstKg.toFixed(1)} kg). Mohon diproses dan diinformasikan hasil penimbangan fisiknya. Terima kasih!`;
    const waLink = `https://wa.me/6281288991001?text=${encodeURIComponent(waText)}`;

    return (
      <div className="min-h-screen bg-[#eceff3] dark:bg-[#0b1222] text-slate-800 dark:text-white flex flex-col font-sans py-6 sm:py-8 px-3.5 sm:px-6">
        <div className="max-w-2xl w-full mx-auto space-y-5 sm:space-y-6">
          {/* Top Brand Banner */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                {branding?.logoUrl ? (
                  <img src={branding.logoUrl} alt={branding.appName || 'Logo'} className="w-full h-full object-cover" />
                ) : (
                  <Apple className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-base sm:text-lg font-black tracking-tight font-heading truncate block">
                  {branding?.appName || 'JajanBuah'}
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate">
                  {branding?.tagline || 'Fresh Fruit Fulfillment'}
                </span>
              </div>
            </div>
            {onExitToDashboard && !isStandaloneGuest && (
              <button
                onClick={onExitToDashboard}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 font-bold transition-colors cursor-pointer shrink-0"
              >
                Dashboard Admin
              </button>
            )}
          </div>

          {/* Success Card */}
          <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 sm:space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-800 dark:text-white">
                Pesanan Berhasil Dikirim!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Terima kasih, <strong>{submittedOrder.customerName}</strong>. Pesanan Anda telah masuk ke sistem antrean penimbangan gudang JajanBuah.
              </p>
            </div>

            {/* Order ID Badge */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-sm mx-auto space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                KODE PESANAN ANDA
              </span>
              <span className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white font-mono">
                {submittedOrder.orderId}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                Status: Menunggu Penimbangan Fisik Packer
              </span>
            </div>

            {/* Summary List */}
            <div className="text-left bg-slate-100 dark:bg-slate-800/40 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 sm:space-y-3 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[11px]">
                Rincian Buah Yang Dipesan:
              </span>
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {submittedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 dark:text-white truncate">{it.fruitName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {it.grade} • {it.estimatedWeightKg} kg @ Rp {it.unitPriceKg.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="font-extrabold text-slate-800 dark:text-white tnum shrink-0 text-right">
                      Rp {(it.estimatedWeightKg * it.unitPriceKg).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-extrabold text-xs sm:text-sm">
                <span>Perkiraan Total ({submittedOrder.totalEstKg.toFixed(1)} kg):</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  Rp {submittedOrder.totalEstAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Information note about actual weighing */}
            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-900 dark:text-sky-300 text-left space-y-1">
              <span className="font-bold block">Informasi Penimbangan Segar:</span>
              <p className="leading-relaxed">
                Karena komoditas buah segar memiliki susut timbang dan variasi ukuran alami (toleransi ± 2.5%), tim packer gudang kami akan menimbang gramatur riil dengan timbangan digital terkalibrasi. Rincian foto timbangan & invoice penyesuaian akan dikirimkan otomatis ke WhatsApp Anda.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-transform active:scale-95 cursor-pointer text-center"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim Konfirmasi via WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={handleResetForNewOrder}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-5 py-3 rounded-full text-xs font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer text-center"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Buat Pesanan Lainnya</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD FORM VIEW
  return (
    <div className="min-h-screen bg-[#eceff3] dark:bg-[#0b1222] text-slate-800 dark:text-white font-sans py-5 sm:py-10 px-3 sm:px-6">
      <div className="max-w-3xl w-full mx-auto space-y-5 sm:space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-300 dark:border-slate-800 gap-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.appName || 'Logo'} className="w-full h-full object-cover" />
              ) : (
                <Apple className="w-6 h-6 text-emerald-400 dark:text-emerald-600" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-2xl font-black font-heading text-slate-900 dark:text-white truncate">
                  {branding?.appName || 'JajanBuah'}
                </h1>
                <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                  Formulir Online
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                {branding?.tagline || 'Pemesanan Buah Segar Kualitas Grade A Langsung Dari Warehouse'}
              </p>
            </div>
          </div>
          {onExitToDashboard && (
            <button
              type="button"
              onClick={onExitToDashboard}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 font-bold transition-colors shrink-0 cursor-pointer"
              title="Kembali ke portal atau login staf"
            >
              {isStandaloneGuest ? 'Login Staf' : 'Dashboard'}
            </button>
          )}
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-2.5 shadow-2xs">
            <Scale className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Timbang Digital Presisi</span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-2.5 shadow-2xs">
            <Truck className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Armada Dispatch Cepat</span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-2.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Garansi Buah Segar Premium</span>
          </div>
        </div>

        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* SECTION 1: Informasi Pemesan */}
          <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 sm:space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <h2 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base font-heading">
                Informasi Pelanggan & Pengiriman
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Nama Anda / Usaha / Outlet <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Resto Nelayan Segar / Ibu Dewi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0812-3456-7890"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white"
                />
                <span className="text-[10px] text-slate-500 block">
                  Foto bukti timbangan & nota invoice riil dikirim ke nomor ini.
                </span>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Alamat Lengkap Pengiriman <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Jl. Raya Darmo Permai II No. 18, Surabaya Barat (Patokan depan apotek)"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Pemilihan Komoditas Buah - KOSONG MOCK-NYA AGAR BISA DIISI SENDIRI */}
          <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <h2 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base font-heading truncate">
                  Pilihan Buah & Estimasi Berat (KG)
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Buah</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => {
                const currentProd = activeProducts.find((p) => p.name === item.fruitName);
                const subtotal = (item.estimatedWeightKg || 0) * (item.unitPriceKg || 0);

                return (
                  <div
                    key={item.id || idx}
                    className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Fruit selector */}
                      <div className="flex-1 min-w-[180px]">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          PILIH BUAH #{idx + 1}
                        </label>
                        {activeProducts.length > 0 ? (
                          <select
                            value={currentProd?.id || ''}
                            onChange={(e) => handleFruitSelect(idx, e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs cursor-pointer truncate"
                          >
                            <option value="">-- Pilih Komoditas / Paket Buah --</option>
                            {activeProducts.some((p) => !p.isBundle) && (
                              <optgroup label="🍏 Komoditas Buah Tunggal">
                                {activeProducts
                                  .filter((p) => !p.isBundle)
                                  .map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} ({p.grade} - Rp {p.pricePerKg.toLocaleString('id-ID')}/kg)
                                    </option>
                                  ))}
                              </optgroup>
                            )}
                            {activeProducts.some((p) => p.isBundle) && (
                              <optgroup label="🎁 Paket Bundling Buah">
                                {activeProducts
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
                            placeholder="Ketik jenis buah yang diinginkan..."
                            value={item.fruitName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setItems((prev) => {
                                const c = [...prev];
                                c[idx].fruitName = val;
                                return c;
                              });
                            }}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs"
                          />
                        )}
                      </div>

                      {/* Weight stepper */}
                      <div className="w-full sm:w-auto">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 sm:text-center">
                          ESTIMASI KEBUTUHAN (KG)
                        </label>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleWeightChange(idx, Math.max(0, item.estimatedWeightKg - 5))}
                            className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer shadow-2xs"
                          >
                            -5
                          </button>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            value={item.estimatedWeightKg === 0 ? '' : item.estimatedWeightKg}
                            onChange={(e) => handleWeightChange(idx, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-center font-black text-sm text-slate-900 dark:text-white"
                          />
                          <span className="font-bold text-xs text-slate-500">KG</span>
                          <button
                            type="button"
                            onClick={() => handleWeightChange(idx, item.estimatedWeightKg + 5)}
                            className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer shadow-2xs"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                      {/* Subtotal & Delete */}
                      <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-500 block">Perkiraan Subtotal</span>
                          <span className="font-extrabold text-slate-800 dark:text-white text-xs sm:text-sm tnum">
                            Rp {subtotal.toLocaleString('id-ID')}
                          </span>
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Buah Ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Waktu Kirim & Catatan */}
          <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 sm:space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <h2 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base font-heading">
                Waktu Kirim & Instruksi Khusus
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Preferensi Waktu Pengiriman
                </label>
                <select
                  value={priorityLabel}
                  onChange={(e) => setPriorityLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 cursor-pointer"
                >
                  <option value="Reguler Pagi">Reguler Pagi (06:00 - 10:00 WIB)</option>
                  <option value="Priority VIP">Priority VIP (Sebelum Jam Makan Siang)</option>
                  <option value="Horeca Express">Horeca Express (Pengiriman Langsung)</option>
                  <option value="Event Siang">Sore Hari (15:00 - 18:00 WIB)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Catatan / Permintaan Khusus
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pilih buah yang matang pas untuk langsung saji"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>
            </div>
          </div>

          {/* TOTAL & SUBMIT BAR */}
          <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                RINGKASAN ESTIMASI PESANAN
              </span>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-xl sm:text-3xl font-black font-heading text-white tnum">
                  Rp {totalEstAmount.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  ({totalEstKg.toFixed(1)} KG total)
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block mt-0.5">
                Tagihan riil final akan disesuaikan dengan hasil timbangan digital packer.
              </span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-extrabold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2 shrink-0 cursor-pointer text-center"
            >
              <span>Kirim Pesanan Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
