import React, { useState } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  Building,
  Image as ImageIcon,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { Order, AppBranding } from '../types.ts';

interface CustomerPaymentUploadPortalProps {
  order: Order | null;
  onUploadProof: (orderId: string, photoUrl: string) => void;
  onExit?: () => void;
  branding?: AppBranding;
}

export const CustomerPaymentUploadPortal: React.FC<CustomerPaymentUploadPortalProps> = ({
  order,
  onUploadProof,
  onExit,
  branding,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(order?.paymentProofPhoto || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(Boolean(order?.paymentProofPhoto));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#eceff3] dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#f8fafc] dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
            Pesanan Tidak Ditemukan
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Tautan formulir pembayaran ini tidak valid atau pesanan yang Anda tuju tidak ditemukan di sistem.
            Pastikan Anda menggunakan link resmi yang dikirimkan melalui WhatsApp.
          </p>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Utama</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const totalActualKg = order.items.reduce(
    (s, it) => s + (it.actualWeightKg ?? it.estimatedWeightKg),
    0
  );

  const totalAmount = order.items.reduce(
    (s, it) => s + (it.actualWeightKg ?? it.estimatedWeightKg) * it.unitPriceKg,
    0
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Format file harus berupa gambar (JPG, PNG, WebP).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal 10MB.');
        return;
      }
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      setErrorMsg('Silakan pilih atau unggah foto bukti transfer terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onUploadProof(order.id, selectedImage);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#eceff3] dark:bg-slate-950 py-6 sm:py-8 px-3.5 sm:px-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-xl w-full space-y-5 sm:space-y-6">
        {/* Brand Banner */}
        <div className="flex items-center justify-between bg-[#f8fafc] dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm gap-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-sm font-bold text-sm">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.appName} className="w-full h-full object-cover" />
              ) : (
                'JB'
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-heading truncate">
                {branding?.appName || 'JajanBuah'} Fulfillment
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Portal Resmi Konfirmasi Pembayaran B2B
              </p>
            </div>
          </div>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              Tutup
            </button>
          )}
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {order.id}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {order.waktuMasuk || 'Hari ini'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-1 truncate">
                {order.customerName}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                {order.customerPhone} • {order.customerArea} ({order.customerSegment})
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Tagihan
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tnum">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Rincian Hasil Timbangan Fisik:</span>
            </span>
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-200 dark:divide-slate-800 text-xs overflow-hidden">
              {order.items.map((it, idx) => {
                const wt = it.actualWeightKg ?? it.estimatedWeightKg;
                const sub = wt * it.unitPriceKg;
                return (
                  <div key={idx} className="p-2.5 sm:p-3 flex items-center justify-between bg-white dark:bg-slate-800/30 gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 dark:text-white truncate">{it.fruitName}</div>
                      <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {it.grade || 'Grade A'} • Rp {it.unitPriceKg.toLocaleString('id-ID')} / kg
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-slate-800 dark:text-white">{wt.toFixed(1)} kg</div>
                      <div className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Rp {sub.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-xs font-bold px-1 pt-1 text-slate-700 dark:text-slate-300">
              <span>Total Riil Timbangan:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{totalActualKg.toFixed(2)} KG</span>
            </div>
          </div>

          {/* Bank Destination Info Box */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 rounded-2xl p-3.5 sm:p-4 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-blue-900 dark:text-blue-300 font-bold">
              <Building className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Rekening Pembayaran Resmi JajanBuah:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 pt-1">
              <div className="bg-white/90 dark:bg-slate-900/80 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900">
                <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold">Bank Central Asia (BCA)</div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">088-291-8841</div>
                <div className="text-[10px] text-slate-500">a.n. PT JAJAN BUAH INDONESIA</div>
              </div>
              <div className="bg-white/90 dark:bg-slate-900/80 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900">
                <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold">Bank Mandiri</div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">142-00-1928374-1</div>
                <div className="text-[10px] text-slate-500">a.n. PT JAJAN BUAH INDONESIA</div>
              </div>
            </div>
          </div>

          {/* Upload Proof Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Upload Bukti Transfer:</span>
              </label>
              {order.paymentProofPhoto && (
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Sudah Terunggah
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center space-x-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/60 p-3 rounded-xl border border-rose-200 dark:border-rose-900">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Dropzone / Upload Box */}
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 sm:p-5 text-center hover:border-slate-400 transition-colors bg-white/70 dark:bg-slate-800/40">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Pilih gambar struk transfer"
              />
              <div className="space-y-1.5 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Klik untuk pilih file struk / screenshot transfer bank
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                  Format PNG, JPG, JPEG atau screenshot m-Banking (maks. 10MB)
                </div>
              </div>
            </div>

            {/* Preview Selected Image */}
            {selectedImage && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Pratinjau Bukti Transfer:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="text-rose-500 hover:underline font-semibold cursor-pointer"
                  >
                    Hapus Foto
                  </button>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-44 sm:h-48 bg-slate-900 flex items-center justify-center">
                  <img src={selectedImage} alt="Bukti Transfer" className="w-full h-full object-contain" />
                </div>
              </div>
            )}

            {/* Status notice after submission */}
            {isSuccess && (
              <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-2xl p-3.5 sm:p-4 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Bukti Berhasil Diunggah • Menunggu Verifikasi Admin</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                  Terima kasih! Bukti pembayaran Anda telah tersimpan.
                  Admin operasional akan segera memverifikasi dan menandai terbayar agar pesanan siap diberangkatkan.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !selectedImage}
              className="w-full py-3.5 px-6 rounded-2xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 disabled:opacity-50 shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Menyimpan Bukti Pembayaran...</span>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Perbarui Bukti Pembayaran</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Kirim Bukti Pembayaran</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Authenticity Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tautan ini terlindungi dan khusus diterbitkan untuk order {order.id}</span>
          </p>
          <p className="text-[11px]">© {new Date().getFullYear()} {branding?.appName || 'JajanBuah'} Fulfillment Services</p>
        </div>
      </div>
    </div>
  );
};
