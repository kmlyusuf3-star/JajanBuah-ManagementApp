import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  TrendingUp,
  Scale,
  Award,
  Users,
  DollarSign,
} from 'lucide-react';
import { Order, Packer, FruitProduct } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';

interface AnalyticsReportsViewProps {
  orders: Order[];
  packers: Packer[];
  products: FruitProduct[];
  onDownloadCSV: () => void;
}

export const AnalyticsReportsView: React.FC<AnalyticsReportsViewProps> = ({
  orders,
  packers,
  products: _products,
  onDownloadCSV,
}) => {
  const [timeRange, setTimeRange] = useState<'hari_ini' | '7_hari' | 'bulan_ini'>('hari_ini');

  // Compute analytics metrics strictly from real orders
  const totalKgActual = orders.reduce(
    (sum, o) =>
      sum + o.items.reduce((s, it) => s + (it.actualWeightKg ?? it.estimatedWeightKg), 0),
    0
  );

  const totalOmzet = orders.reduce(
    (sum, o) =>
      sum +
      o.items.reduce(
        (s, it) => s + (it.actualWeightKg ?? it.estimatedWeightKg) * it.unitPriceKg,
        0
      ),
    0
  );

  const completedOrdersCount = orders.filter(
    (o) => o.status === 'selesai' || o.status === 'delivered' || o.status === 'siap_dikirim'
  ).length;

  // Real product aggregates from orders
  const productMap: { [name: string]: { kg: number; omzet: number } } = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      const wt = it.actualWeightKg ?? it.estimatedWeightKg;
      const amount = wt * it.unitPriceKg;
      if (!productMap[it.fruitName]) {
        productMap[it.fruitName] = { kg: 0, omzet: 0 };
      }
      productMap[it.fruitName].kg += wt;
      productMap[it.fruitName].omzet += amount;
    });
  });

  const topProducts = Object.entries(productMap)
    .map(([name, data]) => ({ name, kg: Number(data.kg.toFixed(1)), omzet: data.omzet }))
    .sort((a, b) => b.omzet - a.omzet)
    .slice(0, 5);

  const maxProductKg = topProducts[0]?.kg || 1;

  const handlePrintPDF = () => {
    try {
      window.print();
    } catch {
      // safe in iframe
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 font-sans w-full max-w-full overflow-hidden">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            EXECUTIVE INTELLIGENCE DASHBOARD
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading mt-0.5">
            Laporan Bisnis, Omzet & Analitik Kinerja
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Evaluasi closing omzet, komoditas terlaris, akurasi timbangan, dan rekapitulasi performa pemenuhan gudang.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Timeframe selector */}
          <div className="inline-flex items-center bg-white dark:bg-slate-800 p-1 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTimeRange('hari_ini')}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                timeRange === 'hari_ini'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('7_hari')}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                timeRange === '7_hari'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('bulan_ini')}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                timeRange === 'bulan_ini'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Bulan Ini
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrintPDF}
            className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-rose-500" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={onDownloadCSV}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow transition-transform active:scale-[0.98] cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Belum Ada Transaksi & Analitik"
          description="Sistem belum mencatat transaksi pesanan aktif. Metrik omzet, tonase penimbangan fisik, dan grafik produk terlaris akan otomatis terhitung begitu order mulai masuk ke database."
        />
      ) : (
        <>
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Total Omzet */}
            <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>TOTAL OMZET RIIL</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2.5 sm:mt-3 flex items-baseline space-x-1">
                <span className="text-xs sm:text-sm font-bold text-slate-400">Rp</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading tnum truncate">
                  {totalOmzet.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="mt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium">
                Dari total {orders.length} pesanan tercatat
              </div>
            </div>

            {/* Total Volume Timbang */}
            <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>TOTAL TONASE TIMBANGAN</span>
                <Scale className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-2.5 sm:mt-3 flex items-baseline space-x-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading tnum">
                  {totalKgActual.toFixed(1)}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-400">KG</span>
              </div>
              <div className="mt-1 text-[11px] sm:text-xs text-blue-600 dark:text-blue-400 font-bold">
                Toleransi QC Presisi Digital
              </div>
            </div>

            {/* Order Selesai */}
            <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>FULFILLMENT SELESAI</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2.5 sm:mt-3 flex items-baseline space-x-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading tnum">
                  {completedOrdersCount}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-400">/ {orders.length} Order</span>
              </div>
              <div className="mt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                Tervalidasi dan siap/telah terkirim
              </div>
            </div>
          </div>

          {/* Visual Chart & Top Selling Fruits */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
            {/* Left: Top Selling Products (7 cols) */}
            <div className="lg:col-span-7 bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-heading">
                    Komoditas Buah Terlaris (Top Selling)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Total Tonase</span>
              </div>

              {topProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  Belum ada item komoditas yang selesai ditimbang.
                </div>
              ) : (
                <div className="space-y-2.5 sm:space-y-3">
                  {topProducts.map((p, idx) => {
                    const barPct = Math.round((p.kg / maxProductKg) * 100);
                    return (
                      <div key={idx} className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white truncate">{p.name}</span>
                          </div>
                          <div className="flex items-center space-x-2.5 shrink-0 text-right">
                            <span className="font-extrabold text-slate-900 dark:text-white">
                              {p.kg} KG
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px] sm:text-xs">
                              Rp {p.omzet.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-slate-900 dark:bg-white h-2 rounded-full"
                            style={{ width: `${barPct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Station Packer Table (5 cols) */}
            <div className="lg:col-span-5 bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-heading">
                    Stasiun Timbangan & Packer
                  </h3>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Gudang Utama</span>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {packers.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    Belum ada data stasiun timbang / packer tercatat.
                  </div>
                ) : (
                  packers.map((packer) => (
                    <div
                      key={packer.id}
                      className="p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                        <img
                          src={packer.avatar}
                          alt={packer.name}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {packer.name}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">{packer.station}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {packer.stats.totalWeighedKg} KG
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                          {packer.stats.ordersCompletedToday} Order
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
