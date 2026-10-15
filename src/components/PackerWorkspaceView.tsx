import React, { useState, useRef } from 'react';
import {
  Camera,
  Scale,
  Minus,
  Plus,
  CheckCircle2,
  Send,
  HelpCircle,
  Clock,
  Scan,
  Info,
  LogOut,
  Upload,
} from 'lucide-react';
import { Order, Packer, UserRole } from '../types.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import { EmptyState } from './EmptyState.tsx';

interface PackerWorkspaceViewProps {
  packers: Packer[];
  orders: Order[];
  currentPackerId: string;
  onSwitchPacker: (id: string) => void;
  onUpdateItemWeight: (orderId: string, itemId: string, newWeight: number) => void;
  onCompleteWeighing: (orderId: string) => void;
  onStartWeighingOrder: (orderId: string) => void;
  onOpenScanModal: () => void;
  onRequestHelp: (orderId: string) => void;
  onExitToDashboard?: () => void;
  onLogout?: () => void;
  currentRole?: UserRole;
}

export const PackerWorkspaceView: React.FC<PackerWorkspaceViewProps> = ({
  packers,
  orders,
  currentPackerId,
  onSwitchPacker,
  onUpdateItemWeight,
  onCompleteWeighing,
  onStartWeighingOrder,
  onOpenScanModal,
  onRequestHelp,
  onExitToDashboard: _onExitToDashboard, // Sesuai revisi: Tombol "Kembali ke Dashboard" dihapus untuk Packer
  onLogout,
  currentRole = 'packer',
}) => {
  const currentPacker =
    packers.find((p) => p.id === currentPackerId) || packers[0];

  const activeOrders = orders.filter(
    (o) =>
      o.packerId === currentPacker?.id &&
      (o.status === 'sedang_ditimbang' || o.status === 'proses_kemas' || o.status === 'order_baru')
  );

  const [manualCode, setManualCode] = useState('');
  const [manualFeedback, setManualFeedback] = useState<string | null>(null);
  const [photoList, setPhotoList] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoList((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualFetch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const formatted = manualCode.startsWith('#') ? manualCode : `#${manualCode}`;
    const found = orders.find((o) => o.id.toLowerCase() === formatted.toLowerCase());
    if (found) {
      onStartWeighingOrder(found.id);
      setManualCode('');
      setManualFeedback(`Order ${formatted} berhasil dibuka di meja timbang.`);
    } else {
      setManualFeedback(`Order ${formatted} tidak ditemukan di sistem.`);
    }
    setTimeout(() => setManualFeedback(null), 3000);
  };

  const primaryWeighingOrder = activeOrders[0] || orders.find((o) => o.status === 'sedang_ditimbang');
  const queuedOrder = activeOrders[1] || orders.find((o) => o.status === 'order_baru');

  if (!currentPacker) {
    return (
      <div className="space-y-3.5 sm:space-y-4 pb-12 font-sans w-full max-w-full overflow-hidden">
        <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 sm:p-4 rounded-2xl flex items-center justify-between shadow-md border border-slate-800 dark:border-slate-700 gap-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500 text-slate-900 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight font-heading truncate">Packer Workspace</span>
                <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0"></span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">Station Floor • Meja Timbang</div>
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-bold bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 transition-colors flex items-center space-x-1 cursor-pointer"
              title="Logout / Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
        <EmptyState
          title="Belum Ada Karyawan Packer"
          description="Saat ini belum ada karyawan packer yang terdaftar di sistem. Anda dapat mendaftarkan karyawan baru atau menyetujui akun packer di menu Manajemen Pengguna."
          icon={Scale}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3.5 sm:space-y-4 pb-12 font-sans w-full max-w-full overflow-hidden">
      {/* Mobile-First PWA Floor Banner - HAPUS TOMBOL KEMBALI KE DASHBOARD */}
      <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 sm:p-4 rounded-2xl flex items-center justify-between shadow-md border border-slate-800 dark:border-slate-700 gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500 text-slate-900 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
            <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight font-heading truncate">
                Packer Workspace
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {currentPacker.name} • {currentPacker.station}
            </div>
          </div>
        </div>

        {/* Right tools in banner: Logout (Tanpa tombol Kembali ke Dashboard) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-bold bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 transition-colors flex items-center space-x-1 cursor-pointer"
              title="Logout / Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* PWA Install Shortcut Banner */}
      <PWAInstallButton variant="banner" />

      {/* 1. Header Card with Packer Profile & Capacity */}
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3.5 sm:gap-4">
        <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={currentPacker?.avatar}
              alt={currentPacker?.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-sm"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 tracking-wider">
                ID: {currentPacker?.code}
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                {currentPacker?.stationCode || 'Stasiun Timbang'}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white font-heading truncate">
                {currentPacker?.name}
              </h2>
              {/* Packer switcher dropdown (Super admin or floor supervisor) */}
              {currentRole !== 'packer' && (
                <select
                  value={currentPacker?.id}
                  onChange={(e) => onSwitchPacker(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 font-medium cursor-pointer max-w-[130px] truncate"
                >
                  {packers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="truncate">{currentPacker?.certification}</span>
            </div>
          </div>
        </div>

        {/* Workload Gauge */}
        <div className="w-full md:w-72 bg-slate-100/80 dark:bg-slate-800/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              BEBAN KERJA AKTIF
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white font-heading tnum">
              {currentPacker?.activeOrderIds.length || 0} <span className="text-slate-500 font-normal">/ 3 Order</span>
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden my-1.5">
            <div
              className="bg-slate-900 dark:bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round(((currentPacker?.activeOrderIds.length || 0) / 3) * 100))}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-semibold">
              <Info className="w-3 h-3" />
              <span>Maks 3 order</span>
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {Math.max(0, 3 - (currentPacker?.activeOrderIds.length || 0))} Slot Siap
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* LEFT COLUMN: Camera Scanner & Manual input */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scan className="w-5 h-5 text-slate-800 dark:text-white" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm font-heading">
                  Pindai Resi Gudang
                </h3>
              </div>
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span>Siap</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenScanModal}
              className="w-full py-3 px-4 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 flex items-center justify-center space-x-2 shadow transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>Buka Pemindai Barcode / QR Resi</span>
            </button>

            {/* Manual input */}
            <div className="pt-1">
              <div className="text-[10px] text-center text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
                ATAU KETIK ID RESI
              </div>
              <form onSubmit={handleManualFetch} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="# Contoh: ORD-2026-0891"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full text-xs font-bold bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-colors cursor-pointer shrink-0"
                >
                  Ambil
                </button>
              </form>
              {manualFeedback && (
                <div className="mt-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {manualFeedback}
                </div>
              )}
            </div>
          </div>

          <div className="bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl p-3.5 sm:p-4.5 space-y-1.5">
            <div className="flex items-center space-x-2 text-sky-900 dark:text-sky-300 font-bold text-xs">
              <Scale className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0" />
              <span>Ketentuan Toleransi Timbangan</span>
            </div>
            <p className="text-xs text-sky-900/80 dark:text-sky-300/80 leading-relaxed">
              Toleransi buah basah adalah <strong className="text-sky-950 dark:text-sky-100">± 2.5%</strong> dari estimasi awal.
              Jika terjadi selisih melebihi 1.5 kg, sertakan foto angka timbangan digital sebelum rilis ke tahap pembayaran.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Weighed Orders */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base font-heading">
                Order di Meja Timbang
              </h3>
            </div>
            <span className="text-xs text-slate-400">Lantai Gudang Aktif</span>
          </div>

          {primaryWeighingOrder ? (
            <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2.5 sm:space-x-3">
                  <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                    {primaryWeighingOrder.id}
                  </span>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                    <span>Ditimbang</span>
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-800 px-3 py-1 rounded-full self-start sm:self-auto">
                  Prioritas: {primaryWeighingOrder.priorityLabel || 'Reguler Pagi'}
                </span>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-1.5 flex-wrap">
                <span>Customer:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {primaryWeighingOrder.customerName}
                </span>
                <span className="text-slate-400">({primaryWeighingOrder.customerArea})</span>
              </div>

              {/* Weighing Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <span>
                    ITEM TIMBANG ({primaryWeighingOrder.items.length})
                  </span>
                  <span>
                    Target: {primaryWeighingOrder.items.reduce((s, it) => s + it.estimatedWeightKg, 0).toFixed(1)} KG
                  </span>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  {primaryWeighingOrder.items.map((item) => {
                    const currentWeight = item.actualWeightKg !== undefined ? item.actualWeightKg : item.estimatedWeightKg;
                    return (
                      <div
                        key={item.id}
                        className="p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3"
                      >
                        <div className="flex items-start space-x-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-200 font-black text-xs">
                            {item.fruitName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                              {item.fruitName}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span>Est: {item.estimatedWeightKg.toFixed(1)} kg</span>
                              <span>•</span>
                              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                {item.grade || 'Grade A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stepper with Large Tap Targets for Touch */}
                        <div className="flex items-center space-x-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateItemWeight(
                                primaryWeighingOrder.id,
                                item.id,
                                Math.max(0.1, Number((currentWeight - 0.1).toFixed(1)))
                              )
                            }
                            className="w-9 h-9 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer active:scale-95"
                            title="Kurang 0.1 kg"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg min-w-22 text-center">
                            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-heading tnum">
                              {currentWeight.toFixed(1)}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 ml-1">
                              KG
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              onUpdateItemWeight(
                                primaryWeighingOrder.id,
                                item.id,
                                Number((currentWeight + 0.1).toFixed(1))
                              )
                            }
                            className="w-9 h-9 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer active:scale-95"
                            title="Tambah 0.1 kg"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center ml-1 shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Photo Evidence Section */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Dokumentasi Foto Timbangan Digital</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{photoList.length} Foto</span>
                </div>

                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/*"
                  onChange={handleFileCapture}
                  className="hidden"
                />

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {photoList.map((photo, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                      <img
                        src={photo}
                        alt={`Scale ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] font-semibold p-1 text-center truncate">
                        Bukti #{i + 1}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex flex-col items-center justify-center p-2 text-center transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold leading-tight">
                      + Foto Timbangan
                    </span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => onCompleteWeighing(primaryWeighingOrder.id)}
                  className="w-full sm:flex-1 py-3 px-5 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 flex items-center justify-center space-x-2 shadow-sm transition-transform active:scale-[0.98] cursor-pointer text-center"
                >
                  <Send className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Selesai Menimbang (Kirim ke Pembayaran)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRequestHelp(primaryWeighingOrder.id)}
                  className="w-full sm:w-auto py-3 px-5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-center"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Bantuan</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#f8fafc] dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
              Tidak ada pesanan yang sedang aktif ditimbang di stasiun ini. Silakan plot pesanan dari antrean atau scan QR resi.
            </div>
          )}

          {queuedOrder && (
            <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 sm:pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                    {queuedOrder.id}
                  </span>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Antrean Berikutnya</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Masuk: {queuedOrder.waktuMasuk}</span>
                </div>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-1.5 flex-wrap">
                <span>Customer:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {queuedOrder.customerName}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onStartWeighingOrder(queuedOrder.id)}
                className="w-full py-3 px-5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2 shadow-xs transition-colors cursor-pointer text-center"
              >
                <Scale className="w-4 h-4" />
                <span>Mulai Menimbang Order Ini</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Section: Statistik Penimbangan Packer Hari Ini */}
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm font-heading">
                Statistik Penimbangan Packer Hari Ini
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Total Hari Ini: {currentPacker?.stats?.ordersCompletedToday ?? 0} order selesai
              </p>
            </div>
          </div>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-200/70 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 self-start sm:self-auto">
            <span>Performa Timbangan Riil</span>
          </span>
        </div>

        {/* 4 Stat Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
          <div className="bg-slate-100/80 dark:bg-slate-800/60 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center sm:text-left">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              TOTAL MUATAN
            </div>
            <div className="mt-1 flex items-baseline justify-center sm:justify-start space-x-1">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading tnum">
                {currentPacker?.stats?.totalWeighedKg ?? 0}
              </span>
              <span className="text-xs font-bold text-slate-500">KG</span>
            </div>
          </div>

          <div className="bg-slate-100/80 dark:bg-slate-800/60 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center sm:text-left">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              AKURASI TOLERANSI
            </div>
            <div className="mt-1 flex items-baseline justify-center sm:justify-start space-x-1">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-heading tnum">
                {currentPacker?.stats?.toleranceAccuracy ?? 99.2}%
              </span>
            </div>
          </div>

          <div className="bg-slate-100/80 dark:bg-slate-800/60 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center sm:text-left">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              RATA-RATA WAKTU
            </div>
            <div className="mt-1 flex items-baseline justify-center sm:justify-start space-x-1">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading tnum">
                {currentPacker?.stats?.avgMinutesPerOrder ?? 6.0}
              </span>
              <span className="text-xs font-bold text-slate-500">Menit</span>
            </div>
          </div>

          <div className="bg-slate-100/80 dark:bg-slate-800/60 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center sm:text-left">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              KENDALA RETUR
            </div>
            <div className="mt-1 flex items-baseline justify-center sm:justify-start space-x-1">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading tnum">
                {currentPacker?.stats?.scaleIncidents ?? 0}
              </span>
              <span className="text-xs font-bold text-slate-500">Insiden</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
