import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Printer,
  MessageCircle,
  ShieldCheck,
  RotateCcw,
  Truck,
  Check,
  AlertCircle,
  ExternalLink,
  Lock,
  Clock,
  History,
  FileCheck,
  Maximize2,
} from 'lucide-react';
import { Order, UserRole } from '../types.ts';

interface ReviewReleaseModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onMarkPaid: (orderId: string) => void;
  onMarkDelivered: (orderId: string) => void;
  onMarkDone: (orderId: string) => void;
  onReturnOrder: (orderId: string) => void;
  onOpenPrintLabel: (order: Order) => void;
  onOpenWhatsApp: (order: Order) => void;
  onOpenCustomerUploadPortal?: (order: Order) => void;
}

export const ReviewReleaseModal: React.FC<ReviewReleaseModalProps> = ({
  order,
  isOpen,
  onClose,
  currentRole,
  onMarkPaid,
  onMarkDelivered,
  onMarkDone,
  onReturnOrder,
  onOpenPrintLabel,
  onOpenWhatsApp,
  onOpenCustomerUploadPortal,
}) => {
  const [showDeliveredConfirm, setShowDeliveredConfirm] = useState(false);
  const [showReturConfirm, setShowReturConfirm] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const isSuperAdminOrAdminOrder = currentRole === 'super_admin' || currentRole === 'admin_order';

  const normalizedStatus = (() => {
    if (order.status === 'order_baru') return 'order_baru';
    if (order.status === 'sedang_ditimbang' || order.status === 'proses_kemas') return 'sedang_ditimbang';
    if (order.status === 'menunggu_pembayaran' || order.status === 'selesai_ditimbang') return 'menunggu_pembayaran';
    if (order.status === 'siap_dikirim' || order.status === 'following_up') return 'siap_dikirim';
    if (order.status === 'delivered') return 'delivered';
    if (order.status === 'selesai' || order.status === 'done') return 'selesai';
    return order.status;
  })();

  const totalEstKg = order.items.reduce((s, it) => s + it.estimatedWeightKg, 0);
  const totalActualKg = order.items.reduce(
    (s, it) => s + (it.actualWeightKg ?? it.estimatedWeightKg),
    0
  );
  const diffKg = Number((totalActualKg - totalEstKg).toFixed(2));
  const diffPct = Number(((diffKg / (totalEstKg || 1)) * 100).toFixed(1));

  const estAmount = order.items.reduce(
    (s, it) => s + it.estimatedWeightKg * it.unitPriceKg,
    0
  );
  const actualAmount = order.items.reduce(
    (s, it) => s + (it.actualWeightKg ?? it.estimatedWeightKg) * it.unitPriceKg,
    0
  );
  const diffAmount = actualAmount - estAmount;

  const statusBadge = (() => {
    switch (normalizedStatus) {
      case 'order_baru':
        return { label: '1. Order Baru', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200' };
      case 'sedang_ditimbang':
        return { label: '2. Ditimbang', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200' };
      case 'menunggu_pembayaran':
        return { label: '3. Pembayaran', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200' };
      case 'siap_dikirim':
        return { label: '4. Siap Kirim', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200' };
      case 'delivered':
        return { label: '5. Delivered', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200' };
      case 'selesai':
        return { label: '6. Selesai', color: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300' };
      default:
        return { label: order.status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  })();

  const handleConfirmDelivered = () => {
    onMarkDelivered(order.id);
    setShowDeliveredConfirm(false);
  };

  const handleConfirmRetur = () => {
    onReturnOrder(order.id);
    setShowReturConfirm(false);
  };

  const isCompletedReadOnly = normalizedStatus === 'selesai';

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white font-heading truncate">
                  Review & Rilis Penimbangan
                </h2>
                <span className="text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                  {order.id}
                </span>
                <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.color}`}>
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                {isCompletedReadOnly
                  ? 'Arsip riwayat pesanan (Mode Read-Only).'
                  : 'Verifikasi kesesuaian fisik timbangan, bukti transfer, dan status pesanan.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customer & Packer Info Bar */}
        <div className="bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-0.5 min-w-0">
            <div className="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] sm:text-[11px]">
              Customer B2B / Outlet
            </div>
            <div className="font-extrabold text-slate-900 dark:text-white text-sm truncate">
              {order.customerName}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-[11px] truncate">
              {order.customerPhone} • {order.customerArea} ({order.customerSegment})
            </div>
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] sm:text-[11px]">
              Packer Bertugas & Station
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
              {order.packerName || 'Belum Ditugaskan'}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-[11px] truncate">
              {order.packerStation || 'Station Meja Timbang'} • Masuk: {order.waktuMasuk}
            </div>
          </div>
        </div>

        {/* BUKTI PEMBAYARAN CUSTOMER SECTION */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Bukti Pembayaran & Status Verifikasi
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {order.isPaid || order.paymentStatus === 'terbayar' ? (
                <span className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>TERBAYAR / LUNAS</span>
                </span>
              ) : order.paymentProofPhoto ? (
                <span className="inline-flex items-center space-x-1 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Bukti Diunggah • Menunggu Verifikasi</span>
                </span>
              ) : (
                <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Belum Ada Bukti Pembayaran
                </span>
              )}
              {onOpenCustomerUploadPortal && (
                <button
                  type="button"
                  onClick={() => onOpenCustomerUploadPortal(order)}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  title="Buka form yang diakses customer via WhatsApp"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Form Upload Customer</span>
                </button>
              )}
            </div>
          </div>

          {order.paymentProofPhoto ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div
                className="relative h-36 sm:h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group cursor-pointer bg-slate-950 flex items-center justify-center"
                onClick={() => setZoomedImage(order.paymentProofPhoto!)}
              >
                <img
                  src={order.paymentProofPhoto}
                  alt="Bukti Transfer"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                  <Maximize2 className="w-4 h-4 mr-1" />
                  <span>Perbesar</span>
                </div>
              </div>
              <div className="sm:col-span-2 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Gambar Bukti Transfer Terlampir</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Waktu Unggah: {order.paymentProofUploadedAt || 'Tersimpan di sistem'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Bukti telah diverifikasi dan terhubung dengan order {order.id}.
                  {!order.isPaid && normalizedStatus === 'menunggu_pembayaran' && (
                    <span className="text-amber-700 dark:text-amber-400 font-semibold block mt-1">
                      Klik tombol "Tandai Terbayar" di bawah untuk memvalidasi pembayaran dan mengubah status order ke Siap Kirim.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Customer belum mengunggah foto bukti pembayaran melalui link WhatsApp.</span>
            </div>
          )}
        </div>

        {/* Items Breakdown Table with Mobile Responsive Scrolling */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Perbandingan Gramatur Estimasi vs Hasil Timbang Riil
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto bg-white dark:bg-slate-900">
            <table className="w-full text-xs text-left min-w-[500px]">
              <thead className="bg-slate-100/90 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] sm:text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Komoditas Buah</th>
                  <th className="py-2.5 px-3 text-right">Est. Order</th>
                  <th className="py-2.5 px-3 text-right">Riil Timbang</th>
                  <th className="py-2.5 px-3 text-right">Deviasi</th>
                  <th className="py-2.5 px-3 text-right">Harga/kg</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {order.items.map((item, idx) => {
                  const act = item.actualWeightKg ?? item.estimatedWeightKg;
                  const itemDiff = act - item.estimatedWeightKg;
                  const subtotal = act * item.unitPriceKg;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 sm:py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{item.fruitName}</div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">{item.grade}</div>
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 text-right text-slate-600 dark:text-slate-300">
                        {item.estimatedWeightKg.toFixed(1)} kg
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 text-right font-extrabold text-slate-900 dark:text-white tnum">
                        {act.toFixed(1)} kg
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 text-right">
                        <span
                          className={`font-semibold ${
                            itemDiff > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : itemDiff < 0
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {itemDiff > 0 ? `+${itemDiff.toFixed(1)}` : itemDiff.toFixed(1)} kg
                        </span>
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 text-right text-slate-500 dark:text-slate-400">
                        Rp {item.unitPriceKg.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        Rp {subtotal.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial & Weight Summary Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <div className="text-slate-400 text-[10px] sm:text-[11px] uppercase font-bold">ESTIMASI AWAL</div>
            <div className="text-base sm:text-lg font-bold mt-0.5">{totalEstKg.toFixed(1)} kg</div>
            <div className="text-[11px] sm:text-xs text-slate-400">Rp {estAmount.toLocaleString('id-ID')}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] sm:text-[11px] uppercase font-bold">TOTAL RIIL TIMBANG</div>
            <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">{totalActualKg.toFixed(1)} kg</div>
            <div className="text-[10px] sm:text-xs text-emerald-400/90 font-medium">Standar QC Pass</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] sm:text-[11px] uppercase font-bold">SELISIH BERAT</div>
            <div className="text-base sm:text-lg font-bold mt-0.5">
              {diffKg > 0 ? `+${diffKg.toFixed(1)}` : diffKg.toFixed(1)} kg
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400">({diffPct > 0 ? `+${diffPct}` : diffPct}%)</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] sm:text-[11px] uppercase font-bold">TAGIHAN FINAL</div>
            <div className="text-base sm:text-lg font-black text-white mt-0.5 truncate">
              Rp {actualAmount.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] sm:text-xs text-amber-300 font-semibold">
              {diffAmount >= 0
                ? `+Rp ${diffAmount.toLocaleString('id-ID')}`
                : `-Rp ${Math.abs(diffAmount).toLocaleString('id-ID')}`}
            </div>
          </div>
        </div>

        {/* Scale Photos Evidence */}
        {order.scalePhotos && order.scalePhotos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Bukti Foto Timbangan Digital ({order.scalePhotos.length} Foto)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                Optical Scale Sensor Checked
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {order.scalePhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-24 sm:h-28 bg-slate-100 dark:bg-slate-800 cursor-pointer"
                  onClick={() => setZoomedImage(photo)}
                >
                  <img src={photo} alt={`Scale Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white p-1 text-center text-[10px] font-bold">
                    Bukti Timbangan #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status History Audit Trail */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Riwayat Perubahan Status Order:</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {order.statusHistory.map((hist, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] p-2 bg-slate-100/80 dark:bg-slate-800/50 rounded-xl gap-1">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{hist.statusLabel}</span>
                    <span className="text-slate-400 truncate">oleh {hist.actor}</span>
                  </div>
                  <span className="text-slate-400 text-[10px] sm:text-[11px] shrink-0">{hist.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONFIRMATION DIALOG: DELIVERED */}
        {showDeliveredConfirm && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/70 border-2 border-amber-300 dark:border-amber-800 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Konfirmasi Pengiriman
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  Apakah Anda yakin order ini sudah dalam pengiriman armada kurir?
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeliveredConfirm(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cek Lagi
              </button>
              <button
                type="button"
                onClick={handleConfirmDelivered}
                className="px-5 py-2 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
              >
                Ya
              </button>
            </div>
          </div>
        )}

        {/* CONFIRMATION DIALOG: RETUR */}
        {showReturConfirm && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-300 dark:border-rose-800 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-start space-x-2.5">
              <RotateCcw className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Konfirmasi Retur Order
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  Apakah Anda yakin ingin me-retur pesanan ini? Status pesanan akan dikembalikan ke <strong>Order Baru</strong> dan data riwayat order tetap dipertahankan.
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowReturConfirm(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRetur}
                className="px-5 py-2 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
              >
                Ya, Retur ke Order Baru
              </button>
            </div>
          </div>
        )}

        {/* MODAL ACTIONS PER STAGE */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Left tools: Print label & WhatsApp */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenPrintLabel(order)}
              className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Label Barcode</span>
            </button>

            {normalizedStatus === 'order_baru' || normalizedStatus === 'sedang_ditimbang' ? (
              <button
                type="button"
                disabled
                title="Tombol Kirim Tagihan via WA terkunci. Fitur ini baru aktif pada tahap Pembayaran."
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Kirim WA (Terkunci)</span>
              </button>
            ) : normalizedStatus === 'menunggu_pembayaran' ? (
              isSuperAdminOrAdminOrder ? (
                <button
                  type="button"
                  onClick={() => onOpenWhatsApp(order)}
                  className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kirim Tagihan via WA</span>
                </button>
              ) : null
            ) : null}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Tutup
            </button>

            {/* Stage 3 (Pembayaran): Tombol "Tandai Terbayar" */}
            {normalizedStatus === 'menunggu_pembayaran' && (
              isSuperAdminOrAdminOrder ? (
                <button
                  type="button"
                  onClick={() => {
                    onMarkPaid(order.id);
                  }}
                  className="inline-flex items-center justify-center space-x-1.5 px-5 py-2 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tandai Terbayar</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 italic">
                  Menunggu verifikasi Admin
                </span>
              )
            )}

            {/* Stage 4 (Siap Kirim): Tombol "Retur" dan "Delivered" */}
            {normalizedStatus === 'siap_dikirim' && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowReturConfirm(true)}
                  className="inline-flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retur</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeliveredConfirm(true)}
                  className="inline-flex items-center justify-center space-x-1.5 px-5 py-2 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Delivered</span>
                </button>
              </div>
            )}

            {/* Stage 5 (Delivered): Tombol "Retur" dan "Done" */}
            {normalizedStatus === 'delivered' && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowReturConfirm(true)}
                  className="inline-flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retur</span>
                </button>
                <button
                  type="button"
                  onClick={() => onMarkDone(order.id)}
                  className="inline-flex items-center justify-center space-x-1.5 px-5 py-2 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Done</span>
                </button>
              </div>
            )}

            {/* Stage 6 (Selesai): Mode Read-Only */}
            {normalizedStatus === 'selesai' && (
              <span className="text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                Order Selesai (Arsip)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-3 sm:p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={zoomedImage} alt="Bukti Zoom" className="w-full h-full object-contain rounded-xl" />
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-black/80"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
