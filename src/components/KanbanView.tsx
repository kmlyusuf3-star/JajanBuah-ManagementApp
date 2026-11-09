import React, { useState } from 'react';
import {
  Search,
  RotateCw,
  Plus,
  Eye,
  Camera,
  Printer,
  MessageCircle,
  Clock,
  ArrowRight,
  Download,
  Share2,
  XCircle,
  Edit2,
  AlertTriangle,
  Lock,
  Truck,
  CheckCircle2,
  PackageOpen,
} from 'lucide-react';
import { Order, Packer, UserRole, OrderStatus } from '../types.ts';

interface KanbanViewProps {
  orders: Order[];
  packers: Packer[];
  currentRole: UserRole;
  onOpenCreateOrder: () => void;
  onOpenShareLink?: () => void;
  onOpenReviewModal: (orderId: string) => void;
  onOpenPrintModal: (order: Order) => void;
  onOpenWhatsAppModal: (order: Order) => void;
  onMoveOrderStage: (orderId: string, newStage: OrderStatus) => void;
  onDownloadManifest: () => void;
  onEditOrder?: (order: Order) => void;
  onCancelOrder?: (order: Order) => void;
  onRefresh?: () => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  orders,
  packers,
  currentRole,
  onOpenCreateOrder,
  onOpenShareLink,
  onOpenReviewModal,
  onOpenPrintModal,
  onOpenWhatsAppModal,
  onMoveOrderStage,
  onDownloadManifest,
  onEditOrder,
  onCancelOrder,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackerFilter, setSelectedPackerFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'all' | 'order_baru' | 'sedang_ditimbang' | 'menunggu_pembayaran' | 'siap_dikirim' | 'delivered' | 'selesai'
  >('all');
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const isSuperAdminOrAdminOrder = currentRole === 'super_admin' || currentRole === 'admin_order';
  const canCreateOrder = isSuperAdminOrAdminOrder;

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filterOrdersByStage = (stage: 'order_baru' | 'sedang_ditimbang' | 'menunggu_pembayaran' | 'siap_dikirim' | 'delivered' | 'selesai') => {
    return orders.filter((o) => {
      let matches = false;
      if (stage === 'order_baru') {
        matches = o.status === 'order_baru';
      } else if (stage === 'sedang_ditimbang') {
        matches = o.status === 'sedang_ditimbang' || o.status === 'proses_kemas';
      } else if (stage === 'menunggu_pembayaran') {
        matches = o.status === 'menunggu_pembayaran' || o.status === 'selesai_ditimbang';
      } else if (stage === 'siap_dikirim') {
        matches = o.status === 'siap_dikirim' || o.status === 'following_up';
      } else if (stage === 'delivered') {
        matches = o.status === 'delivered';
      } else if (stage === 'selesai') {
        matches = o.status === 'selesai' || o.status === 'done';
      }
      if (!matches) return false;

      if (selectedPackerFilter !== 'all' && o.packerId !== selectedPackerFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = o.id.toLowerCase().includes(q);
        const matchCust = o.customerName.toLowerCase().includes(q);
        const matchPhone = o.customerPhone?.toLowerCase().includes(q);
        const matchPacker = o.packerName?.toLowerCase().includes(q);
        return matchId || matchCust || matchPhone || matchPacker;
      }
      return true;
    });
  };

  const orderBaruList = filterOrdersByStage('order_baru');
  const onWeighedList = filterOrdersByStage('sedang_ditimbang');
  const paymentList = filterOrdersByStage('menunggu_pembayaran');
  const readyList = filterOrdersByStage('siap_dikirim');
  const deliveredList = filterOrdersByStage('delivered');
  const completedList = filterOrdersByStage('selesai');

  const handleConfirmCancel = () => {
    if (orderToCancel && onCancelOrder) {
      onCancelOrder(orderToCancel);
    }
    setOrderToCancel(null);
  };

  const renderEmptyColumn = (stageLabel: string) => (
    <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-[#f8fafc]/60 dark:bg-slate-900/40 text-slate-400 min-h-[140px] sm:min-h-[160px]">
      <PackageOpen className="w-6 h-6 mb-1 text-slate-400 dark:text-slate-600" />
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tidak ada order</span>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">di tahap {stageLabel}</span>
    </div>
  );

  return (
    <div className="space-y-3.5 sm:space-y-4 pb-12 font-sans w-full max-w-full overflow-hidden">
      {/* Sub-bar Top Controls */}
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 sm:gap-4">
        {/* Left: Indicator and total count */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 flex-wrap">
          <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-300/80 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-900 dark:text-white">KANBAN FULFILLMENT</span>
            <span className="text-slate-400 hidden sm:inline">• 6 Tahap Alur</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span>Total:</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm tnum">
              {orders.length} Order
            </span>
          </div>
        </div>

        {/* Right: Search, Filter, Date, Add Order */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-60 flex-1 sm:flex-initial min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari order, customer, WA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white bg-white dark:bg-slate-800"
            />
          </div>

          <div className="relative">
            <select
              value={selectedPackerFilter}
              onChange={(e) => setSelectedPackerFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-semibold pl-3 pr-7 py-2 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-none truncate"
            >
              <option value="all">Semua Packer</option>
              {packers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
            title="Refresh Data"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onDownloadManifest}
            className="p-2 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
            title="Download CSV Manifest"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
          </button>

          {onOpenShareLink && (
            <button
              type="button"
              onClick={onOpenShareLink}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
              title="Bagikan link form customer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Bagi Link Form</span>
              <span className="sm:hidden text-[10px]">Link</span>
            </button>
          )}

          {canCreateOrder && (
            <button
              type="button"
              onClick={onOpenCreateOrder}
              className="inline-flex items-center space-x-1 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Order Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Stage Navigation Pills with Smooth Scroll */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none w-full max-w-full -mx-1 px-1">
        {/* flex item-center adalah untuk menyelaraskan item di dalam flex container
        space-x-1.5 sm:space-x-2 adalah untuk memberikan jarak antar item pada tampilan kecil dan besar
       overflow-x-auto adalah untuk memungkinkan scroll horizontal jika item melebihi lebar container */}
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
              : 'bg-[#f8fafc] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
          }`}
        >
          Semua ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('order_baru')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
            activeTab === 'order_baru'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-[#f8fafc] dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
          }`}
        >
          1. Baru ({orderBaruList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sedang_ditimbang')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
            activeTab === 'sedang_ditimbang'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-[#f8fafc] dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
          }`}
        >
          2. Ditimbang ({onWeighedList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('menunggu_pembayaran')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
            activeTab === 'menunggu_pembayaran'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-[#f8fafc] dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
          }`}
        >
          3. Bayar ({paymentList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('siap_dikirim')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
            activeTab === 'siap_dikirim'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-[#f8fafc] dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900'
          }`}
        >
          4. Siap Kirim ({readyList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('delivered')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
            activeTab === 'delivered'
              ? 'bg-purple-600 text-white shadow-2xs'
              : 'bg-[#f8fafc] dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
          }`}
        >
          5. Delivered ({deliveredList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('selesai')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
            activeTab === 'selesai'
              ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-2xs'
              : 'bg-[#f8fafc] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
          }`}
        >
          6. Selesai ({completedList.length})
        </button>
      </div>

      {/* 6 Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3.5 sm:gap-4 w-full min-w-0 max-w-full">
        {/* COLUMN 1: Order Baru */}
        <div className={`space-y-3 min-w-0 ${activeTab !== 'all' && activeTab !== 'order_baru' ? 'hidden 2xl:block' : ''}`}>
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm font-heading">
                1. Order Baru
              </h3>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800">
                {orderBaruList.length}
              </span>
            </div>
          </div>
          <div className="space-y-3 min-h-[140px]">
            {orderBaruList.length === 0 ? renderEmptyColumn('Order Baru') : orderBaruList.map((order) => (
              <div
                key={order.id}
                className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow group relative"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-heading">
                    {order.id}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px]">{order.waktuMasuk}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {order.customerName}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                  {order.customerPhone} • {order.customerArea}
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300 text-[11px]">
                      <span className="truncate pr-2">• {it.fruitName}</span>
                      <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                        Est. {it.estimatedWeightKg} kg
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate max-w-[100px] sm:max-w-[120px]">
                    {order.packerName ? order.packerName : 'Belum Diplot'}
                  </span>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenReviewModal(order.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                      title="Review Order"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {isSuperAdminOrAdminOrder && onEditOrder && (
                      <button
                        type="button"
                        onClick={() => onEditOrder(order)}
                        className="p-1.5 text-blue-500 hover:text-blue-700 rounded-lg cursor-pointer"
                        title="Edit Order"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isSuperAdminOrAdminOrder && (
                      <button
                        type="button"
                        onClick={() => setOrderToCancel(order)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg cursor-pointer"
                        title="Batalkan Order"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onMoveOrderStage(order.id, 'sedang_ditimbang')}
                      className="px-2.5 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg text-xs font-semibold flex items-center space-x-0.5 cursor-pointer border border-blue-200 dark:border-blue-900"
                      title="Proses ke Tahap Penimbangan"
                    >
                      <span>Timbang</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: Ditimbang */}
        <div className={`space-y-3 min-w-0 ${activeTab !== 'all' && activeTab !== 'sedang_ditimbang' ? 'hidden 2xl:block' : ''}`}>
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm font-heading">
                2. Ditimbang
              </h3>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800">
                {onWeighedList.length}
              </span>
            </div>
          </div>
          <div className="space-y-3 min-h-[140px]">
            {onWeighedList.length === 0 ? renderEmptyColumn('Ditimbang') : onWeighedList.map((order) => {
              const primaryItem = order.items[0] || { fruitName: 'Buah', estimatedWeightKg: 10, actualWeightKg: 10 };
              const actual = primaryItem.actualWeightKg || primaryItem.estimatedWeightKg;
              const est = primaryItem.estimatedWeightKg;
              const pct = Math.min(100, Math.round((actual / (est || 1)) * 100));

              return (
                <div
                  key={order.id}
                  className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-amber-700 dark:text-amber-400 font-heading">
                      {order.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                      Timbang ({order.items.length})
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {order.customerName}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                    {order.customerPhone} • {order.customerArea}
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-800 dark:text-slate-300 truncate pr-2">{primaryItem.fruitName}</span>
                      <span className="font-bold text-slate-900 dark:text-white shrink-0">
                        {actual} / {est} kg
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate">
                        {order.packerName || 'Meja Timbang'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenReviewModal(order.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                        title="Review Order"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {isSuperAdminOrAdminOrder && onEditOrder && (
                        <button
                          type="button"
                          onClick={() => onEditOrder(order)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 rounded-lg cursor-pointer"
                          title="Edit Order"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isSuperAdminOrAdminOrder && (
                        <button
                          type="button"
                          onClick={() => setOrderToCancel(order)}
                          className="px-2 py-0.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded text-xs font-bold border border-rose-200 dark:border-rose-900 cursor-pointer"
                          title="Batalkan Order"
                        >
                          Batal
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onMoveOrderStage(order.id, 'menunggu_pembayaran')}
                        className="text-[11px] px-2.5 py-0.5 bg-emerald-600 text-white font-bold rounded-md hover:bg-emerald-700 shadow-2xs cursor-pointer"
                        title="Selesai Menimbang -> Ke Tahap Pembayaran"
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 3: Pembayaran */}
        <div className={`space-y-3 min-w-0 ${activeTab !== 'all' && activeTab !== 'menunggu_pembayaran' ? 'hidden 2xl:block' : ''}`}>
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm font-heading">
                3. Pembayaran
              </h3>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800">
                {paymentList.length}
              </span>
            </div>
          </div>
          <div className="space-y-3 min-h-[140px]">
            {paymentList.length === 0 ? renderEmptyColumn('Pembayaran') : paymentList.map((order) => {
              const totalActual = order.items.reduce(
                (sum, it) => sum + (it.actualWeightKg || it.estimatedWeightKg),
                0
              );
              const totalAmount = order.items.reduce(
                (sum, it) => sum + (it.actualWeightKg || it.estimatedWeightKg) * it.unitPriceKg,
                0
              );

              return (
                <div
                  key={order.id}
                  className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 font-heading">
                      {order.id}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <Camera className="w-3 h-3 text-slate-400" />
                      <span>{order.scalePhotos ? order.scalePhotos.length : 0} Foto</span>
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {order.customerName}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                    {order.customerPhone} • {order.customerArea}
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                      <span>Total Riil:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{totalActual.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between items-baseline font-bold text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span>Tagihan:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                        Rp {totalAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {order.paymentProofPhoto ? (
                      <div className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 p-1.5 rounded-md mt-1 border border-emerald-200 dark:border-emerald-900 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Bukti Diunggah</span>
                      </div>
                    ) : (
                      <div className="text-[10px] sm:text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 p-1.5 rounded-md mt-1 border border-amber-200 dark:border-amber-900 truncate">
                        Menunggu Bukti Transfer
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5">
                    {isSuperAdminOrAdminOrder ? (
                      <button
                        type="button"
                        onClick={() => onOpenWhatsAppModal(order)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                        title="Kirim Tagihan & Link Bukti Transfer via WA"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Kirim WA</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>WA Admin</span>
                      </span>
                    )}
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => onOpenPrintModal(order)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                        title="Cetak Label"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenReviewModal(order.id)}
                        className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer"
                        title="Review & Tandai Terbayar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 4: Siap Kirim */}
        <div className={`space-y-3 min-w-0 ${activeTab !== 'all' && activeTab !== 'siap_dikirim' ? 'hidden 2xl:block' : ''}`}>
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm font-heading">
                4. Siap Kirim
              </h3>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800">
                {readyList.length}
              </span>
            </div>
          </div>
          <div className="space-y-3 min-h-[140px]">
            {readyList.length === 0 ? renderEmptyColumn('Siap Kirim') : readyList.map((order) => {
              const totalActual = order.items.reduce(
                (sum, it) => sum + (it.actualWeightKg || it.estimatedWeightKg),
                0
              );
              const totalAmount = order.items.reduce(
                (sum, it) => sum + (it.actualWeightKg || it.estimatedWeightKg) * it.unitPriceKg,
                0
              );

              return (
                <div
                  key={order.id}
                  className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-indigo-700 dark:text-indigo-400 font-heading">
                      {order.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                      Siap Kirim
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {order.customerName}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                    {order.customerPhone} • {order.customerArea}
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                      <span>Total Berat:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{totalActual.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white text-[11px]">
                      <span>Lunas:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">Rp {totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate">
                      Staging Armada
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenReviewModal(order.id)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                      title="Buka Halaman Review Order"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 5: Delivered */}
        <div className={`space-y-3 min-w-0 ${activeTab !== 'all' && activeTab !== 'delivered' ? 'hidden 2xl:block' : ''}`}>
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm font-heading">
                5. Delivered
              </h3>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800">
                {deliveredList.length}
              </span>
            </div>
          </div>
          <div className="space-y-3 min-h-[140px]">
            {deliveredList.length === 0 ? renderEmptyColumn('Delivered') : deliveredList.map((order) => {
              const totalActual = order.items.reduce(
                (sum, it) => sum + (it.actualWeightKg || it.estimatedWeightKg),
                0
              );
              return (
                <div
                  key={order.id}
                  className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-purple-700 dark:text-purple-400 font-heading">
                      {order.id}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100/70 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                      <Truck className="w-3 h-3" />
                      <span>Dikirim</span>
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {order.customerName}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                    {order.customerPhone} • {order.customerArea}
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                      <span>Total Muatan:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{totalActual.toFixed(1)} kg</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onOpenReviewModal(order.id)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                      title="Review Order"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    {isSuperAdminOrAdminOrder && onEditOrder && (
                      <button
                        type="button"
                        onClick={() => onEditOrder(order)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors cursor-pointer"
                        title="Edit Order"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 6: Selesai */}
        <div className={`space-y-3 min-w-0 ${activeTab !== 'all' && activeTab !== 'selesai' ? 'hidden 2xl:block' : ''}`}>
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm font-heading">
                6. Selesai
              </h3>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800">
                {completedList.length}
              </span>
            </div>
          </div>
          <div className="space-y-3 min-h-[140px]">
            {completedList.length === 0 ? renderEmptyColumn('Completed') : completedList.map((order) => {
              const totalActual = order.items.reduce(
                (sum, it) => sum + (it.actualWeightKg || it.estimatedWeightKg),
                0
              );
              return (
                <div
                  key={order.id}
                  className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow group opacity-90"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300 font-heading">
                      {order.id}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Completed</span>
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {order.customerName}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                    {order.customerPhone} • {order.customerArea}
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                      <span>Total Muatan:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{totalActual.toFixed(1)} kg</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                      Arsip Selesai
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenReviewModal(order.id)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                      title="Lihat Arsip Detail (Read-Only)"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading truncate">
                  Konfirmasi Pembatalan Order
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Apakah Anda yakin ingin membatalkan order <strong>{orderToCancel.id}</strong> ({orderToCancel.customerName})?
                </p>
              </div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-2xl text-xs space-y-1 border border-slate-200/80 dark:border-slate-700">
              <div className="text-slate-600 dark:text-slate-400">
                Tahap Saat Ini: <strong className="text-slate-800 dark:text-slate-200">{orderToCancel.status}</strong>
              </div>
              <div className="text-[11px] text-slate-500">
                Jika dibatalkan, pesanan akan ditarik dari alur fulfillment dan tercatat di audit log.
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer text-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer text-center"
              >
                Ya, Batalkan Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
