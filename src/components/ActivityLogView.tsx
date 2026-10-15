import React, { useState } from 'react';
import {
  Search,
  Shield,
  Layers,
  Users,
} from 'lucide-react';
import { ActivityLogItem } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';

interface ActivityLogViewProps {
  logs: ActivityLogItem[];
  onDownloadEmployeeLogs?: () => void;
  onDownloadOrderLogs?: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  logs,
  onDownloadEmployeeLogs,
  onDownloadOrderLogs,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.actor.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.ipAddress.includes(q)
      );
    }
    return true;
  });

  const getCategoryBadge = (cat: ActivityLogItem['category']) => {
    switch (cat) {
      case 'price':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            Harga Buah
          </span>
        );
      case 'order':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
            Transaksi Order
          </span>
        );
      case 'user':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
            Akun & Pengguna
          </span>
        );
      case 'system':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Sistem & Gudang
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 font-sans w-full max-w-full overflow-hidden">
      {/* Header & Super Admin Log Downloads */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              KEAMANAN SISTEM & KEPATUHAN
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>SUPER ADMIN EXCLUSIVE</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading mt-0.5">
            Activity Log & Jejak Audit Operasional
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Rekam jejak setiap aksi, intervensi, perubahan harga, dan penugasan packer disertai identitas aktor & IP address.
          </p>
        </div>

        {/* Super Admin Download Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onDownloadEmployeeLogs && (
            <button
              type="button"
              onClick={onDownloadEmployeeLogs}
              className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
              title="Unduh rekap log aktivitas seluruh pengguna format CSV"
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Log User (.CSV)</span>
            </button>
          )}

          {onDownloadOrderLogs && (
            <button
              type="button"
              onClick={onDownloadOrderLogs}
              className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
              title="Unduh rekap log seluruh transaksi order & fulfillment"
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 dark:text-emerald-600" />
              <span>Log Order (.CSV)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari aktor, detail aksi, atau IP address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl sm:rounded-2xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl sm:rounded-2xl text-xs font-semibold px-3.5 py-2 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer truncate"
        >
          <option value="all">Semua Kategori Aksi</option>
          <option value="order">Aksi Transaksi Order</option>
          <option value="price">Perubahan Harga</option>
          <option value="user">Manajemen Akun</option>
          <option value="system">Sistem & Gudang</option>
        </select>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          title="Belum Ada Catatan Aktivitas"
          description="Log jejak audit operasional masih bersih. Setiap login, pembuatan pesanan, perubahan harga, dan aktivitas sistem akan terekam secara otomatis di sini."
        />
      ) : (
        <>
          {/* Mobile Activity Log Cards */}
          <div className="lg:hidden space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] text-slate-400 block">{log.id}</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm truncate block">
                      {log.action}
                    </span>
                  </div>
                  <div className="shrink-0">{getCategoryBadge(log.category)}</div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px] bg-slate-100 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 break-words">
                  {log.details}
                </p>

                <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                    {log.actor} ({log.actorRole})
                  </span>
                  <span className="shrink-0">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Log Table Desktop */}
          <div className="hidden lg:block bg-[#f8fafc] dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-800 tracking-wider">
                    <th className="py-3.5 px-5">ID LOG</th>
                    <th className="py-3.5 px-4">KATEGORI</th>
                    <th className="py-3.5 px-4">PENGGUNA / AKTOR</th>
                    <th className="py-3.5 px-4">TINDAKAN (ACTION)</th>
                    <th className="py-3.5 px-4">RINCIAN PERUBAHAN</th>
                    <th className="py-3.5 px-4">WAKTU (WIB)</th>
                    <th className="py-3.5 px-4">IP ADDRESS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-400">{log.id}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{getCategoryBadge(log.category)}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{log.actor}</div>
                        <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                          {log.actorRole}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {log.action}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {log.details}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {log.ipAddress}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 px-6 bg-slate-100/90 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-500">
              <span>
                Total <strong>{filteredLogs.length}</strong> catatan aktivitas tercatat
              </span>
              <span className="font-mono text-[11px] text-slate-400">Security Audit Log: Validated</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
