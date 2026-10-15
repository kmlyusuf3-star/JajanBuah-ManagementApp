import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { UserRole } from '../types.ts';

interface RestrictedAccessViewProps {
  currentRole: UserRole;
  attemptedFeature: string;
  onReturnToDashboard: () => void;
}

export const RestrictedAccessView: React.FC<RestrictedAccessViewProps> = ({
  currentRole,
  attemptedFeature,
  onReturnToDashboard,
}) => {
  const getRoleTitle = () => {
    switch (currentRole) {
      case 'admin_order':
        return 'Order Admin (Operasional & Fulfillment)';
      case 'packer':
        return 'Packer Lantai Gudang & Penimbangan';
      case 'tv':
        return 'Display TV Gudang (Read-Only)';
      default:
        return 'Pengguna Terbatas';
    }
  };

  const getRoleResponsibilities = () => {
    switch (currentRole) {
      case 'admin_order':
        return [
          'Membuat pesanan baru & membagikan link formulir pemesanan',
          'Katalog produk buah: tambah item, edit spesifikasi & kelola stok',
          'Penetapan harga komoditas buah (Per Kg, Gram, Pack)',
          'Kanban alur fulfillment (Order Baru -> Ditimbang -> Bayar -> Siap Kirim -> Delivered -> Selesai)',
          'Cetak thermal label barcode resi 79mm (Zebra ZD220)',
          'Kirim nota rincian timbangan & invoice via WhatsApp ke customer',
          'Review gramatur aktual vs estimasi, verifikasi transfer & rilis pesanan',
          'Laporan bisnis, closing omzet & analitik tonase gudang',
        ];
      case 'packer':
        return [
          'Melakukan penimbangan digital buah riil di station penimbangan',
          'Mengambil foto bukti fisik timbangan & timbangan QC',
          'Cetak label barcode berat aktual',
          'Scan QR / Barcode pesanan untuk verifikasi',
        ];
      case 'tv':
        return [
          'Menampilkan antrean real-time gudang di layar TV wall monitor',
          'Memantau status penimbangan tiap station dan packer aktif',
        ];
      default:
        return [];
    }
  };

  const getRestrictedItemsForOrderAdmin = () => [
    'Kelola Pengguna (Akun, hak akses & persetujuan karyawan)',
    'Activity Log & Jejak Audit Operasional',
    'Ubah Logo & Branding Aplikasi',
  ];

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-3.5 sm:px-4">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 sm:space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center">
        {/* Shield Icon Badge */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-8 h-8 sm:w-9 sm:h-9" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <Lock className="w-3.5 h-3.5" />
            <span>HAK AKSES TERBATAS • KHUSUS SUPER ADMIN</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-800 dark:text-white">
            Fitur Memerlukan Otoritas Super Admin
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Anda mencoba mengakses <strong>{attemptedFeature}</strong>. Sesuai kebijakan tata kelola hak akses sistem, modul ini diproteksi khusus untuk <strong>Super Admin</strong>.
          </p>
        </div>

        {/* Role Information Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
              <span className="font-extrabold text-[11px] sm:text-xs text-slate-900 dark:text-white uppercase tracking-wider truncate">
                Peran Anda: {getRoleTitle()}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shrink-0">
              {currentRole.toUpperCase()}
            </span>
          </div>

          {currentRole === 'admin_order' && (
            <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                Fitur Yang Tidak Dapat Diakses Order Admin:
              </span>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {getRestrictedItemsForOrderAdmin().map((item, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Hak Akses Operasional Order Admin yang Tersedia:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {getRoleResponsibilities().map((resp, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-center pt-2">
          <button
            type="button"
            onClick={onReturnToDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-full text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-transform active:scale-95 shadow cursor-pointer text-center"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Kerja</span>
          </button>
        </div>
      </div>
    </div>
  );
};
