import React, { useState } from 'react';
import {
  Search,
  Trash2,
  Edit2,
  Printer,
  Eye,
  ChevronDown,
  Share2,
  Download,
} from 'lucide-react';
import { Order, Packer, OrderStatus, UserRole } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';

interface OrderManagementViewProps {
  orders: Order[];
  packers: Packer[];
  searchQuery: string;
  onOpenCreateOrder: () => void;
  onOpenShareLink?: () => void;
  onOpenReviewModal: (orderId: string) => void;
  onOpenPrintModal: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrderRequest: (order: Order) => void;
  onForceChangeStatus: (orderId: string, newStatus: OrderStatus) => void;
  currentRole?: UserRole;
  onDownloadOrderLogs?: () => void;
}

export const OrderManagementView: React.FC<OrderManagementViewProps> = ({
  orders,
  packers,
  searchQuery,
  onOpenCreateOrder,
  onOpenShareLink,
  onOpenReviewModal,
  onOpenPrintModal,
  onEditOrder,
  onDeleteOrderRequest,
  onForceChangeStatus,
  currentRole = 'super_admin',
  onDownloadOrderLogs,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPacker, setSelectedPacker] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState('');

  const isSuperAdmin = currentRole === 'super_admin';
  const isOrderAdmin = currentRole === 'admin_order';
  const canManageOrders = isSuperAdmin || isOrderAdmin;

  const activeSearch = (searchQuery || localSearch).toLowerCase();

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'sedang_ditimbang' && (o.status === 'sedang_ditimbang' || o.status === 'proses_kemas')) {
        // match
      } else if (selectedStatus === 'menunggu_pembayaran' && (o.status === 'menunggu_pembayaran' || o.status === 'selesai_ditimbang')) {
        // match
      } else if (selectedStatus === 'siap_dikirim' && (o.status === 'siap_dikirim' || o.status === 'following_up')) {
        // match
      } else if (selectedStatus === 'selesai' && (o.status === 'selesai' || o.status === 'done')) {
        // match
      } else if (o.status !== selectedStatus) {
        return false;
      }
    }
    if (selectedPacker !== 'all' && o.packerId !== selectedPacker) return false;
    if (activeSearch) {
      const matchId = o.id.toLowerCase().includes(activeSearch);
      const matchCust = o.customerName.toLowerCase().includes(activeSearch);
      const matchPhone = o.customerPhone.toLowerCase().includes(activeSearch);
      const matchItems = o.items.some((i) => i.fruitName.toLowerCase().includes(activeSearch));
      const matchPacker = o.packerName?.toLowerCase().includes(activeSearch);
      return matchId || matchCust || matchPhone || matchItems || matchPacker;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
      case 'order_baru':
        return (
          <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            1. Order Baru
          </span>
        );
      case 'sedang_ditimbang':
      case 'proses_kemas':
        return (
          <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            2. Ditimbang
          </span>
        );
      case 'menunggu_pembayaran':
      case 'selesai_ditimbang':
        return (
          <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            3. Pembayaran
          </span>
        );
      case 'siap_dikirim':
      case 'following_up':
        return (
          <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
            4. Siap Kirim
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
            5. Delivered
          </span>
        );
      case 'selesai':
      case 'done':
        return (
          <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            6. Selesai
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 font-sans w-full max-w-full overflow-hidden">
      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              TABEL SENTRAL TRANSAKSI
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {isSuperAdmin ? 'SUPER ADMIN ACCESS' : 'ORDER ADMIN ACCESS'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading mt-0.5">
            Manajemen Order (List View)
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Kelola, filter pesanan, cetak resi pengiriman, dan kontrol alur status operasional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onDownloadOrderLogs && isSuperAdmin && (
            <button
              type="button"
              onClick={onDownloadOrderLogs}
              className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Unduh file CSV riwayat transaksi pesanan (Khusus Super Admin)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Download Log Order (.CSV)</span>
              <span className="sm:hidden text-[11px]">Log CSV</span>
            </button>
          )}

          {onOpenShareLink && (
            <button
              type="button"
              onClick={onOpenShareLink}
              className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
              title="Bagikan link form pesanan ke pelanggan"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Bagi Link Form</span>
            </button>
          )}

          {canManageOrders && (
            <button
              type="button"
              onClick={onOpenCreateOrder}
              className="inline-flex items-center space-x-1 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow transition-transform active:scale-[0.98] cursor-pointer"
            >
              <span>+ Buat Order Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2.5 sm:space-y-3">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari ID, customer, atau buah..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl sm:rounded-2xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl sm:rounded-2xl text-xs font-semibold pl-3 pr-7 py-2 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer truncate"
              >
                <option value="all">Semua Status</option>
                <option value="order_baru">1. Order Baru</option>
                <option value="sedang_ditimbang">2. Ditimbang</option>
                <option value="menunggu_pembayaran">3. Pembayaran</option>
                <option value="siap_dikirim">4. Siap Kirim</option>
                <option value="delivered">5. Delivered</option>
                <option value="selesai">6. Selesai</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedPacker}
                onChange={(e) => setSelectedPacker(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl sm:rounded-2xl text-xs font-semibold pl-3 pr-7 py-2 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer truncate"
              >
                <option value="all">Semua Packer</option>
                {packers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {(selectedStatus !== 'all' || selectedPacker !== 'all' || localSearch) && (
            <button
              type="button"
              onClick={() => {
                setSelectedStatus('all');
                setSelectedPacker('all');
                setLocalSearch('');
              }}
              className="px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer self-start sm:self-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Orders Container */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="Tidak Ada Order di Database"
          description="Saat ini belum ada pesanan aktif. Anda dapat membuat pesanan baru atau membagikan link formulir pesanan ke pelanggan."
          actionButton={
            canManageOrders
              ? {
                  text: 'Buat Order Pertama Sekarang',
                  onClick: onOpenCreateOrder,
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Mobile Card List */}
          <div className="lg:hidden space-y-3">
            {filteredOrders.map((order) => {
              const estKg = order.items.reduce((s, i) => s + i.estimatedWeightKg, 0);
              const actKg = order.items.reduce(
                (s, i) => s + (i.actualWeightKg ?? i.estimatedWeightKg),
                0
              );
              const isWeighedDone = order.items.some((i) => i.actualWeightKg !== undefined);

              return (
                <div
                  key={order.id}
                  className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white font-heading text-sm">
                        {order.id}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{order.waktuMasuk}</span>
                    </div>
                    <div className="shrink-0">{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {order.customerName}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug break-words">
                      {order.customerPhone} • {order.customerArea} ({order.customerSegment})
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Komoditas Buah:
                    </div>
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300 text-[11px]">
                        <span className="truncate pr-1">• {it.fruitName}</span>
                        <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                          Est: {it.estimatedWeightKg} kg {it.actualWeightKg !== undefined ? `| Riil: ${it.actualWeightKg} kg` : ''}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px] font-bold">
                      <span className="text-slate-500">Total Berat:</span>
                      <span className={isWeighedDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}>
                        Est {estKg.toFixed(1)} kg {isWeighedDone ? `| Riil ${actKg.toFixed(1)} kg` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] min-w-0">
                      <span className="text-slate-500">Packer: </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {order.packerName || 'Belum diplot'}
                      </span>
                    </div>

                    {canManageOrders && (
                      <select
                        value={order.status}
                        onChange={(e) => onForceChangeStatus(order.id, e.target.value as OrderStatus)}
                        className="bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-lg px-2 py-1 text-[10px] font-bold cursor-pointer max-w-[170px] truncate"
                        title="Ubah Status Order"
                      >
                        <option value="order_baru">1. Order Baru</option>
                        <option value="sedang_ditimbang">2. Ditimbang</option>
                        <option value="menunggu_pembayaran">3. Pembayaran</option>
                        <option value="siap_dikirim">4. Siap Kirim</option>
                        <option value="delivered">5. Delivered</option>
                        <option value="selesai">6. Selesai</option>
                      </select>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenReviewModal(order.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                      {canManageOrders && (
                        <button
                          type="button"
                          onClick={() => onEditOrder(order)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenPrintModal(order)}
                        className="p-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Cetak Resi"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>

                    {canManageOrders && (
                      <button
                        type="button"
                        onClick={() => onDeleteOrderRequest(order)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                        title="Hapus Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-[#f8fafc] dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-800 tracking-wider">
                    <th className="py-3.5 px-5">NO. ORDER</th>
                    <th className="py-3.5 px-4">CUSTOMER & ALAMAT</th>
                    <th className="py-3.5 px-4">RINCIAN BUAH</th>
                    <th className="py-3.5 px-4">EST VS AKTUAL</th>
                    <th className="py-3.5 px-4">PACKER ASSIGNED</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-4">KONTROL STATUS</th>
                    <th className="py-3.5 px-4 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {filteredOrders.map((order) => {
                    const estKg = order.items.reduce((s, i) => s + i.estimatedWeightKg, 0);
                    const actKg = order.items.reduce(
                      (s, i) => s + (i.actualWeightKg ?? i.estimatedWeightKg),
                      0
                    );
                    const isWeighedDone = order.items.some((i) => i.actualWeightKg !== undefined);

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-4 px-5">
                          <div className="font-extrabold text-slate-900 dark:text-white font-heading text-sm">
                            {order.id}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{order.waktuMasuk}</div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {order.customerName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {order.customerArea} • <span className="font-semibold">{order.customerSegment}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 max-w-xs">
                          <div className="space-y-0.5 text-slate-700 dark:text-slate-300">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="truncate">
                                • <span className="font-semibold">{it.fruitName}</span>{' '}
                                <span className="text-slate-400 text-[11px]">({it.estimatedWeightKg}kg)</span>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-slate-900 dark:text-white font-bold">
                            Est: {estKg.toFixed(1)} KG
                          </div>
                          {isWeighedDone ? (
                            <div className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">
                              Riil: {actKg.toFixed(1)} KG
                            </div>
                          ) : (
                            <div className="text-slate-400 text-[11px] italic">Belum ditimbang</div>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          {order.packerName ? (
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {order.packerName.slice(0, 2).toUpperCase()}
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {order.packerName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Belum Diplot</span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>

                        <td className="py-4 px-4">
                          {canManageOrders && (
                            <div className="relative">
                              <select
                                value={order.status}
                                onChange={(e) => onForceChangeStatus(order.id, e.target.value as OrderStatus)}
                                className="bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-xl px-2.5 py-1 text-[11px] font-bold focus:outline-none cursor-pointer"
                                title="Ubah Status Order"
                              >
                                <option value="order_baru">1. Order Baru</option>
                                <option value="sedang_ditimbang">2. Ditimbang</option>
                                <option value="menunggu_pembayaran">3. Pembayaran</option>
                                <option value="siap_dikirim">4. Siap Kirim</option>
                                <option value="delivered">5. Delivered</option>
                                <option value="selesai">6. Selesai</option>
                              </select>
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenReviewModal(order.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Lihat Detail & Review"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canManageOrders && (
                              <button
                                type="button"
                                onClick={() => onEditOrder(order)}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors cursor-pointer"
                                title="Edit Data Order"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onOpenPrintModal(order)}
                              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Cetak Resi Thermal 79mm"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            {canManageOrders && (
                              <button
                                type="button"
                                onClick={() => onDeleteOrderRequest(order)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                                title="Hapus Order dari Sistem"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 px-6 bg-slate-100/90 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-500">
              <span>
                Menampilkan <strong>{filteredOrders.length}</strong> dari <strong>{orders.length}</strong> total order
              </span>
              <span className="font-semibold text-purple-700 dark:text-purple-400">
                Database Production Connected
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
