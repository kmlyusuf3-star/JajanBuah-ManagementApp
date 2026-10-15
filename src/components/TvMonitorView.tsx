import React, { useState, useEffect } from 'react';
import {
  Warehouse,
  Package,
  Hourglass,
  CheckCircle2,
  Truck,
  Users,
  Maximize2,
  Minimize2,
  Tv,
  Scale,
  LogOut,
} from 'lucide-react';
import { Order, Packer } from '../types.ts';

interface TvMonitorViewProps {
  orders: Order[];
  packers: Packer[];
  onExitToDashboard?: () => void;
  onLogout?: () => void;
}

export const TvMonitorView: React.FC<TvMonitorViewProps> = ({
  orders,
  packers,
  onExitToDashboard,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');
  const dayNames = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  const monthNames = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ];
  const dayStr = dayNames[currentTime.getDay()];
  const dateStr = `${dayStr}, ${currentTime.getDate()} ${monthNames[currentTime.getMonth()]} ${currentTime.getFullYear()}`;

  const totalMasuk = orders.length;
  const antreanTimbang = orders.filter((o) => o.status === 'order_baru').length;
  const sedangTimbang = orders.filter((o) => o.status === 'sedang_ditimbang' || o.status === 'proses_kemas').length;
  const selesaiTimbang = orders.filter((o) => o.status === 'menunggu_pembayaran' || o.status === 'selesai_ditimbang').length;
  const siapDikirim = orders.filter((o) => o.status === 'siap_dikirim' || o.status === 'following_up' || o.status === 'delivered' || o.status === 'selesai').length;

  return (
    <div className="bg-[#070d19] text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-2xl border border-slate-800 space-y-4 sm:space-y-6 font-sans w-full max-w-full overflow-hidden">
      {/* 1. Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Warehouse className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white font-heading truncate">
              Warehouse & Order Status
            </h1>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
              SISTEM MONITOR OPERASIONAL DISPATCH & TIMBANG REALTIME
            </div>
          </div>
        </div>

        {/* Live sync badge & Big Digital Clock */}
        <div className="flex items-center justify-between lg:justify-end space-x-4 sm:space-x-6">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-emerald-400">DATABASE LIVE</span>
          </div>

          <div className="text-right">
            <div className="text-xl sm:text-3xl font-black font-heading text-white tracking-wider tnum">
              <span>{hours}</span>
              <span className="text-emerald-400 animate-pulse"> : </span>
              <span>{minutes}</span>
              <span className="text-emerald-400 animate-pulse"> : </span>
              <span className="text-emerald-400">{seconds}</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 ml-1.5">WIB</span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider">
              {dateStr}
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Toggle Layar Penuh"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {(onExitToDashboard || onLogout) && (
              <button
                type="button"
                onClick={onExitToDashboard || onLogout}
                className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors cursor-pointer flex items-center space-x-1.5 text-xs font-bold"
                title="Keluar dari Layar TV"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top 5 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        <div className="bg-[#0d1627] p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
            <span>TOTAL MASUK</span>
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          </div>
          <div className="mt-1.5 sm:mt-2 text-2xl sm:text-4xl font-black text-white font-heading tnum">
            {String(totalMasuk).padStart(2, '0')}
          </div>
          <div className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-400 self-start border border-blue-900/50">
            Volume Order
          </div>
        </div>

        <div className="bg-[#0d1627] p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
            <span>ANTREAN</span>
            <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          </div>
          <div className="mt-1.5 sm:mt-2 text-2xl sm:text-4xl font-black text-white font-heading tnum">
            {String(antreanTimbang).padStart(2, '0')}
          </div>
          <div className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-400 self-start border border-rose-900/50">
            Tahap 1
          </div>
        </div>

        <div className="bg-[#0d1627] p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
            <span>SEDANG TIMBANG</span>
            <Hourglass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          </div>
          <div className="mt-1.5 sm:mt-2 text-2xl sm:text-4xl font-black text-white font-heading tnum">
            {String(sedangTimbang).padStart(2, '0')}
          </div>
          <div className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white self-start">
            Aktif di Meja
          </div>
        </div>

        <div className="bg-[#0d1627] p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
            <span>PEMBAYARAN</span>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          </div>
          <div className="mt-1.5 sm:mt-2 text-2xl sm:text-4xl font-black text-emerald-400 font-heading tnum">
            {String(selesaiTimbang).padStart(2, '0')}
          </div>
          <div className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 self-start border border-emerald-900/50">
            Verifikasi WA
          </div>
        </div>

        <div className="bg-[#0d1627] p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex justify-between items-center text-slate-400 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
            <span>SIAP KIRIM</span>
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          </div>
          <div className="mt-1.5 sm:mt-2 text-2xl sm:text-4xl font-black text-white font-heading tnum">
            {String(siapDikirim).padStart(2, '0')}
          </div>
          <div className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 self-start border border-slate-700">
            Dispatch Armada
          </div>
        </div>
      </div>

      {/* 3. Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* LEFT PANEL */}
        <div className="lg:col-span-7 bg-[#0d1627] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              <h2 className="text-sm sm:text-base font-bold text-white font-heading">
                Papan Antrean & Penimbangan Berjalan
              </h2>
            </div>
            <span className="text-[11px] text-blue-400 font-medium">Realtime Display</span>
          </div>

          {orders.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              Belum ada pesanan aktif di papan antrean gudang.
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-2.5">
              {orders.slice(0, 6).map((order) => {
                const isFinished = order.status === 'selesai' || order.status === 'siap_dikirim' || order.status === 'delivered';
                const isOnWeighed = order.status === 'sedang_ditimbang' || order.status === 'proses_kemas';
                const itemsDesc = order.items.map((it) => `${(it.actualWeightKg ?? it.estimatedWeightKg).toFixed(0)}kg ${it.fruitName}`).join(', ');
                const totalKg = order.items.reduce((s, it) => s + (it.actualWeightKg ?? it.estimatedWeightKg), 0);

                return (
                  <div
                    key={order.id}
                    className="bg-[#121c32] hover:bg-[#16233f] p-3 sm:p-3.5 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-2.5 sm:gap-3 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                      <div
                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black font-heading shrink-0 ${
                          isFinished
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : isOnWeighed
                            ? 'bg-blue-950 text-blue-400 border border-blue-800/60'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {order.id}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs sm:text-sm truncate">
                          {order.customerName}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                          {itemsDesc || 'Komoditas Buah Segar'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 sm:space-x-4 shrink-0 text-right">
                      <div className="hidden sm:block">
                        <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          PACKER
                        </div>
                        <div className="text-xs font-bold text-slate-300 truncate max-w-[100px]">{order.packerName || 'Belum diplot'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          {isFinished ? 'HASIL' : 'ESTIMASI'}
                        </div>
                        <div
                          className={`text-xs font-black tnum ${
                            isFinished ? 'text-emerald-400 text-xs sm:text-sm' : 'text-white'
                          }`}
                        >
                          {totalKg.toFixed(1)} KG
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Monitor Beban Packer */}
        <div className="lg:col-span-5 bg-[#0d1627] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Users className="w-5 h-5 text-blue-400 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-white font-heading">
                Monitor Beban Packer
              </h2>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {packers.length} STASIUN AKTIF
            </span>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {packers.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Belum ada stasiun packer yang aktif bertugas.
              </div>
            ) : (
              packers.map((packer) => {
                const activeCount = packer.activeOrderIds.length;
                const isFull = activeCount >= packer.capacityMax;
                const isAvailable = activeCount === 0;

                return (
                  <div key={packer.id} className="bg-[#121c32] p-3 sm:p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full font-black flex items-center justify-center text-xs shrink-0 ${
                            isFull
                              ? 'bg-rose-600 text-white'
                              : isAvailable
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {packer.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs sm:text-sm truncate">{packer.name}</div>
                          <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                            {packer.station}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shrink-0 ${
                          isFull
                            ? 'bg-rose-600 text-white'
                            : isAvailable
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {isFull
                          ? '3/3 PENUH'
                          : isAvailable
                          ? '0/3 STANDBY'
                          : `${activeCount}/3 AKTIF`}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs pt-1 border-t border-slate-800/80 overflow-x-auto">
                      <span className="text-slate-400 text-[11px] shrink-0">Pesanan:</span>
                      {packer.activeOrderIds.length > 0 ? (
                        packer.activeOrderIds.map((id, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono font-bold text-[10px] sm:text-[11px] shrink-0"
                          >
                            {id}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-400 text-[11px] italic">Siap mengambil order baru</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Ticker Marquee */}
      <div className="bg-[#0d1627] p-2.5 sm:p-3 px-3.5 sm:px-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden min-w-0">
          <span className="inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] sm:text-[11px] shrink-0 tracking-wider">
            STATUS
          </span>
          <div className="whitespace-nowrap overflow-hidden text-slate-300 font-medium text-[11px] sm:text-xs truncate">
            Maksimal 3 order berjalan per packer. Pastikan foto fisik timbangan dan label barcode tertempel rapi.
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-500 shrink-0 text-[10px] sm:text-[11px] font-mono">
          <Tv className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">TERMINAL-TV-01</span>
        </div>
      </div>
    </div>
  );
};
