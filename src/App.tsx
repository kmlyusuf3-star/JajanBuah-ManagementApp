import { useState, useEffect, useCallback } from 'react';
import { GlobalHeader } from './components/GlobalHeader.tsx';
import { Sidebar, SuperAdminNavMenu } from './components/Sidebar.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { GlobalFooterBar } from './components/GlobalFooterBar.tsx';
import { KanbanView } from './components/KanbanView.tsx';
import { OrderManagementView } from './components/OrderManagementView.tsx';
import { ProductCatalogView } from './components/ProductCatalogView.tsx';
import { PriceManagementView } from './components/PriceManagementView.tsx';
import { UserManagementView } from './components/UserManagementView.tsx';
import { AnalyticsReportsView } from './components/AnalyticsReportsView.tsx';
import { ActivityLogView } from './components/ActivityLogView.tsx';
import { TvMonitorView } from './components/TvMonitorView.tsx';
import { PackerWorkspaceView } from './components/PackerWorkspaceView.tsx';
import { ConfirmDangerModal } from './components/ConfirmDangerModal.tsx';
import { CreateOrderModal } from './components/CreateOrderModal.tsx';
import { EditOrderModal } from './components/EditOrderModal.tsx';
import { ReviewReleaseModal } from './components/ReviewReleaseModal.tsx';
import { PrintLabelModal } from './components/PrintLabelModal.tsx';
import { WhatsAppModal } from './components/WhatsAppModal.tsx';
import { ScanModal } from './components/ScanModal.tsx';
import { ShareOrderLinkModal } from './components/ShareOrderLinkModal.tsx';
import { CustomerOrderPortal } from './components/CustomerOrderPortal.tsx';
import { CustomerPaymentUploadPortal } from './components/CustomerPaymentUploadPortal.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { ChangeCredentialsModal } from './components/ChangeCredentialsModal.tsx';
import { BrandSettingsModal } from './components/BrandSettingsModal.tsx';
import { AccountSettingsModal } from './components/AccountSettingsModal.tsx';
import { RestrictedAccessView } from './components/RestrictedAccessView.tsx';
import { api } from './services/api.ts';
import {
  canManageUsers,
  canViewActivityLogs,
  canChangeBranding,
  canManagePrices,
} from './utils/permissions.ts';
import {
  Order,
  Packer,
  FruitProduct,
  PriceHistoryItem,
  UserAccount,
  ActivityLogItem,
  UserRole,
  OrderStatus,
  AppBranding,
  AppNotification,
} from './types.ts';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  // Authentication state (Strictly via server session token)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // App Branding
  const [branding, setBranding] = useState<AppBranding>({
    appName: 'JajanBuah',
    tagline: 'Fruit Operations & Fulfillment Management',
    logoUrl: '',
  });

  // Active Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Modals
  const [isChangeCredentialsOpen, setIsChangeCredentialsOpen] = useState(false);
  const [isBrandSettingsOpen, setIsBrandSettingsOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);

  // Navigation & Theme
  const [activeMenu, setActiveMenu] = useState<SuperAdminNavMenu>('dashboard_kanban');
  const [currentRole, setCurrentRole] = useState<UserRole>('super_admin');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jajanbuah_theme');
      if (saved === 'light') return false;
      return true; // Default dark mode
    }
    return true;
  });
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Customer Portal links
  const [isCustomerMode, setIsCustomerMode] = useState<boolean>(false);
  const [isGuestCustomer, setIsGuestCustomer] = useState<boolean>(false);
  const [isShareLinkOpen, setIsShareLinkOpen] = useState<boolean>(false);
  const [paymentUploadOrderId, setPaymentUploadOrderId] = useState<string | null>(null);
  const [isPaymentUploadMode, setIsPaymentUploadMode] = useState<boolean>(false);

  // Real Database Collections
  const [orders, setOrders] = useState<Order[]>([]);
  const [packers, setPackers] = useState<Packer[]>([]);
  const [products, setProducts] = useState<FruitProduct[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [currentPackerId, setCurrentPackerId] = useState<string>('packer-1');

  // Operation Modals
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [whatsAppOrder, setWhatsAppOrder] = useState<Order | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);

  // Destructive Confirmation Modal
  const [dangerModalConfig, setDangerModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    itemName?: string;
    confirmButtonText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'warn';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Fetch all primary collections from backend
  const refreshAllData = useCallback(async (roleOverride?: UserRole) => {
    try {
      const activeRole = roleOverride !== undefined ? roleOverride : currentRole;
      const [
        ordersRes,
        packersRes,
        productsRes,
        priceHistoryRes,
        brandingRes,
        notifsRes,
      ] = await Promise.all([
        api.getOrders().catch(() => []),
        api.getPackers().catch(() => []),
        api.getProducts().catch(() => []),
        api.getPriceHistory().catch(() => []),
        api.getBranding().catch(() => ({ appName: 'JajanBuah', tagline: 'Fruit Operations & Fulfillment Management', logoUrl: '' })),
        api.getNotifications().catch(() => []),
      ]);

      setOrders(ordersRes);
      setPackers(packersRes);
      setProducts(productsRes);
      setPriceHistory(priceHistoryRes);
      setBranding(brandingRes);
      setNotifications(notifsRes);

      // Only fetch users and activity logs if user has verified permission
      if (canManageUsers(activeRole)) {
        const usersRes = await api.getUsers().catch(() => []);
        setUsers(usersRes);
      } else {
        setUsers([]);
      }

      if (canViewActivityLogs(activeRole)) {
        const activityLogsRes = await api.getActivityLogs().catch(() => []);
        setActivityLogs(activityLogsRes);
      } else {
        setActivityLogs([]);
      }

      if (packersRes.length > 0 && !currentPackerId) {
        setCurrentPackerId(packersRes[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load application data:', err);
    }
  }, [currentPackerId, currentRole]);

  // Initial authentication check & URL parameter detection
  useEffect(() => {
    const initApp = async () => {
      setIsAuthChecking(true);
      let resolvedRole: UserRole | undefined = undefined;
      try {
        const user = await api.getCurrentUser();
        if (user) {
          resolvedRole = user.role;
          setCurrentUser(user);
          setCurrentRole(user.role);
          if (user.role === 'tv') {
            setActiveMenu('tv_monitor');
          } else if (user.role === 'packer') {
            setActiveMenu('packer_pwa');
          }
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setIsAuthChecking(false);
      }

      await refreshAllData(resolvedRole);

      // Check URL search parameters
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash;
        if (
          params.get('mode') === 'payment_upload' ||
          params.get('mode') === 'upload_payment' ||
          params.get('portal') === 'payment'
        ) {
          const ordId = params.get('orderId');
          if (ordId) {
            setPaymentUploadOrderId(decodeURIComponent(ordId));
            setIsPaymentUploadMode(true);
          }
        } else if (
          params.get('mode') === 'customer_order' ||
          params.get('mode') === 'order' ||
          params.get('orderForm') === 'true' ||
          params.get('portal') === 'order' ||
          hash === '#customer_order' ||
          hash === '#order'
        ) {
          setIsCustomerMode(true);
          setIsGuestCustomer(true);
        }
      }
    };

    initApp();
  }, [refreshAllData]);

  // Dark mode class toggle & persistence
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('jajanbuah_theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('jajanbuah_theme', 'light');
      } catch {}
    }
  }, [isDarkMode]);

  // Periodic polling for active notifications and orders (every 8 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser) {
        api.getNotifications().then((res) => {
          setNotifications(res);
        }).catch(() => {});
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Notification action handlers
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('Semua notifikasi telah ditandai dibaca.');
    } catch {
      // ignore
    }
  };

  // Authentication Handlers
  const handleLogin = async (identifier: string, pass: string) => {
    const res = await api.login(identifier, pass);
    setCurrentUser(res.user);
    setCurrentRole(res.user.role);
    if (res.user.role === 'tv') {
      setActiveMenu('tv_monitor');
    } else if (res.user.role === 'packer') {
      setActiveMenu('packer_pwa');
    } else {
      setActiveMenu('dashboard_kanban');
    }
    showToast(`Selamat datang kembali, ${res.user.name}!`, 'success');
    await refreshAllData(res.user.role);
  };

  const handleLogout = () => {
    setDangerModalConfig({
      isOpen: true,
      title: 'Konfirmasi Keluar Akun',
      description: 'Apakah Anda yakin ingin keluar dari sesi akun ini dan kembali ke halaman login?',
      itemName: currentUser ? `${currentUser.name} (${currentUser.role.toUpperCase()})` : 'Akun Pengguna',
      confirmButtonText: 'Ya, Keluar Akun',
      onConfirm: async () => {
        await api.logout();
        setCurrentUser(null);
        showToast('Anda telah berhasil keluar dari akun.', 'info');
      },
    });
  };

  // Order Handlers
  const handleCreateOrder = async (newOrderData: Partial<Order>) => {
    try {
      const created = await api.createOrder(newOrderData);
      setOrders((prev) => [created, ...prev]);
      showToast(`Order ${created.id} untuk ${created.customerName} berhasil dibuat!`);
      await refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal membuat order.', 'warn');
    }
  };

  const handleCustomerSubmitOrder = (newOrderData: Partial<Order>): string => {
    const tempId = `#ORD-2026-08${Math.floor(100 + Math.random() * 900)}`;
    api.createOrder({ ...newOrderData, id: tempId }).then((created) => {
      setOrders((prev) => [created, ...prev]);
      refreshAllData();
    }).catch((err) => {
      console.error('Failed to submit customer order:', err);
    });
    return tempId;
  };

  const handleSaveEditedOrder = async (updated: Order) => {
    try {
      const saved = await api.updateOrder(updated.id, updated);
      setOrders((prev) => prev.map((o) => (o.id === saved.id ? saved : o)));
      showToast(`Order ${saved.id} berhasil diperbarui!`);
      await refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan perubahan order.', 'warn');
    }
  };

  const handleDeleteOrderPrompt = (order: Order) => {
    setDangerModalConfig({
      isOpen: true,
      title: 'Hapus Data Order dari Database?',
      description: `Anda akan menghapus permanen order ${order.id} (${order.customerName}). Seluruh data gramatur dan riwayat penimbangan akan terhapus.`,
      itemName: `${order.id} - ${order.customerName}`,
      confirmButtonText: 'Hapus Order',
      onConfirm: async () => {
        try {
          await api.deleteOrder(order.id);
          setOrders((prev) => prev.filter((o) => o.id !== order.id));
          showToast(`Order ${order.id} berhasil dihapus permanen!`, 'warn');
          await refreshAllData();
        } catch (err: any) {
          showToast(err.message || 'Gagal menghapus order.', 'warn');
        }
      },
    });
  };

  const handleForceChangeStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast(`Status order ${orderId} diubah ke ${newStatus.toUpperCase()}`);
      await refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui status order.', 'warn');
    }
  };

  // Product Handlers
  const handleAddProduct = async (newProd: FruitProduct) => {
    try {
      const created = await api.createProduct(newProd);
      setProducts((prev) => [created, ...prev]);
      showToast(`Produk ${created.name} berhasil ditambahkan!`);
      await refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menambahkan produk.', 'warn');
    }
  };

  const handleUpdateProduct = async (updated: FruitProduct) => {
    try {
      const saved = await api.updateProduct(updated.id, updated);
      setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      showToast(`Data produk ${saved.name} berhasil disimpan!`);
      await refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui produk.', 'warn');
    }
  };

  const handleDeleteProductPrompt = (prod: FruitProduct) => {
    setDangerModalConfig({
      isOpen: true,
      title: 'Hapus Produk dari Master Data?',
      description: `Produk ${prod.name} akan dihapus dari katalog master database.`,
      itemName: prod.name,
      confirmButtonText: 'Hapus Produk',
      onConfirm: async () => {
        try {
          await api.deleteProduct(prod.id);
          setProducts((prev) => prev.filter((p) => p.id !== prod.id));
          showToast(`Produk ${prod.name} berhasil dihapus!`, 'warn');
          await refreshAllData();
        } catch (err: any) {
          showToast(err.message || 'Gagal menghapus produk.', 'warn');
        }
      },
    });
  };

  const handleToggleProductStatus = async (prodId: string) => {
    try {
      const nextActive = await api.toggleProductStatus(prodId);
      setProducts((prev) =>
        prev.map((p) => (p.id === prodId ? { ...p, isActive: nextActive } : p))
      );
      showToast('Status ketersediaan produk berhasil diperbarui!');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status produk.', 'warn');
    }
  };

  // Price Update Handler
  const handleUpdateProductPrice = async (
    productId: string,
    newPrice: number,
    unit: 'kg' | 'gram' | 'pack',
    reason: string
  ) => {
    try {
      const item = await api.updateProductPrice(productId, newPrice, unit, reason);
      setPriceHistory((prev) => [item, ...prev]);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, pricePerKg: newPrice, unitType: unit } : p))
      );
      showToast('Harga berhasil diubah dan dicatat ke jejak audit!', 'success');
      await refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui harga.', 'warn');
    }
  };

  // Credentials & Branding Handlers
  const handleUpdateCredentials = async (
    _userId: string,
    newUsername: string,
    newPassword?: string,
    newName?: string
  ) => {
    const updated = await api.changeCredentials({ newUsername, newPassword, newName });
    setCurrentUser(updated);
    showToast('Kredensial akun berhasil diperbarui!', 'success');
    await refreshAllData();
  };

  const handleSaveBranding = async (newBranding: AppBranding) => {
    if (!canChangeBranding(currentRole)) {
      showToast('Akses ditolak: Hanya Super Admin yang berwenang mengubah logo & branding.', 'warn');
      return;
    }
    try {
      const saved = await api.updateBranding(newBranding);
      setBranding(saved);
      if (saved.appName) {
        document.title = `${saved.appName} - Fruit Operations & Fulfillment Management`;
      }
      showToast('Logo dan branding aplikasi berhasil diperbarui!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan branding.', 'warn');
    }
  };

  const handleSaveProfile = async (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    showToast('Profil akun berhasil disimpan!', 'success');
  };

  // Customer Payment Proof Upload
  const handleUploadPaymentProof = async (orderId: string, photoUrl: string) => {
    try {
      const updated = await api.uploadPaymentProof(orderId, photoUrl);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (reviewOrder && reviewOrder.id === orderId) {
        setReviewOrder(updated);
      }
      showToast(`Bukti pembayaran untuk order ${orderId} berhasil diunggah! Status: Menunggu Verifikasi.`, 'success');
      await refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal mengunggah bukti pembayaran.', 'warn');
    }
  };

  // Status transitions
  const handleMarkPaid = async (orderId: string) => {
    try {
      const updated = await api.updateOrderStatus(orderId, 'siap_dikirim', 'Pembayaran diverifikasi oleh admin');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (reviewOrder && reviewOrder.id === orderId) {
        setReviewOrder(updated);
      }
      showToast(`Order ${orderId} ditandai terbayar! Status kini Siap Kirim.`, 'success');
      await refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status order.', 'warn');
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      const updated = await api.updateOrderStatus(orderId, 'delivered', 'Order dikirim oleh armada kurir');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (reviewOrder && reviewOrder.id === orderId) {
        setReviewOrder(updated);
      }
      showToast(`Order ${orderId} dialihkan ke status Delivered!`, 'success');
      await refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status order.', 'warn');
    }
  };

  const handleMarkDone = async (orderId: string) => {
    try {
      const updated = await api.updateOrderStatus(orderId, 'selesai', 'Order diselesaikan secara permanen (Completed)');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (reviewOrder && reviewOrder.id === orderId) {
        setReviewOrder(updated);
      }
      showToast(`Order ${orderId} berhasil diselesaikan (Completed)!`, 'success');
      await refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyelesaikan order.', 'warn');
    }
  };

  const handleReturnOrder = async (orderId: string) => {
    try {
      const updated = await api.updateOrderStatus(orderId, 'order_baru', 'Order diretur ke Order Baru');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (reviewOrder && reviewOrder.id === orderId) {
        setReviewOrder(updated);
      }
      showToast(`Order ${orderId} berhasil di-retur ke Order Baru!`, 'warn');
      await refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal me-retur order.', 'warn');
    }
  };

  // Export CSV
  const handleDownloadCSV = () => {
    const headers = [
      'ID Order',
      'Customer',
      'Wilayah',
      'Segmen',
      'Komoditas Buah',
      'Est Kg',
      'Aktual Kg',
      'Total Nilai (Rp)',
      'Status',
      'Packer Assigned',
      'Waktu Masuk',
    ];

    const rows = orders.map((o) => {
      const itemsStr = o.items.map((i) => i.fruitName).join('; ');
      const estTotal = o.items.reduce((s, i) => s + i.estimatedWeightKg, 0);
      const actTotal = o.items.reduce((s, i) => s + (i.actualWeightKg ?? i.estimatedWeightKg), 0);
      const amount = o.items.reduce((s, i) => s + (i.actualWeightKg ?? i.estimatedWeightKg) * i.unitPriceKg, 0);
      return [
        o.id,
        `"${o.customerName}"`,
        `"${o.customerArea}"`,
        o.customerSegment,
        `"${itemsStr}"`,
        estTotal.toFixed(1),
        actTotal.toFixed(1),
        amount,
        o.status,
        `"${o.packerName || '-'}"`,
        `"${o.waktuMasuk}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${branding.appName || 'JajanBuah'}_Fulfillment_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Manifest harian fulfillment (.csv) berhasil diunduh!');
  };

  const handleDownloadUserLogs = () => {
    if (!canViewActivityLogs(currentRole)) {
      showToast('Akses ditolak: Activity Log & Audit hanya untuk Super Admin.', 'warn');
      return;
    }
    const headers = ['ID Log', 'Waktu (WIB)', 'Aktor', 'Role', 'Kategori', 'Aksi', 'IP Address', 'Detail Perubahan'];
    const rows = activityLogs
      .filter((l) => l.category === 'user')
      .map((log) => [
        log.id,
        `"${log.timestamp}"`,
        `"${log.actor}"`,
        `"${log.actorRole}"`,
        `"${log.category.toUpperCase()}"`,
        `"${log.action.replace(/"/g, '""')}"`,
        `"${log.ipAddress}"`,
        `"${log.details.replace(/"/g, '""')}"`,
      ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${branding.appName || 'JajanBuah'}_User_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Log aktivitas pengguna (.csv) berhasil diunduh!', 'success');
  };

  const handleDownloadOrderLogs = () => {
    if (!canViewActivityLogs(currentRole)) {
      showToast('Akses ditolak: Log transaksi order audit hanya untuk Super Admin.', 'warn');
      return;
    }
    const headers = [
      'ID Order',
      'Waktu Masuk',
      'Tanggal Dibuat',
      'Nama Customer',
      'Wilayah',
      'Segmen',
      'Nomor WhatsApp',
      'Status Order',
      'Packer Bertugas',
      'Station',
      'Daftar Komoditas Buah',
      'Total Est (KG)',
      'Total Riil (KG)',
      'Selisih (KG)',
      'Nilai Total Tagihan (Rp)',
      'Status Pembayaran',
      'Catatan',
    ];

    const rows = orders.map((o) => {
      const itemsDetail = o.items
        .map((i) => `${i.fruitName} (${(i.actualWeightKg ?? i.estimatedWeightKg).toFixed(1)}kg @ Rp${i.unitPriceKg.toLocaleString('id-ID')})`)
        .join('; ');
      const estTotal = o.items.reduce((s, i) => s + i.estimatedWeightKg, 0);
      const actTotal = o.items.reduce((s, i) => s + (i.actualWeightKg ?? i.estimatedWeightKg), 0);
      const diffKg = actTotal - estTotal;
      const totalAmount = o.items.reduce((s, i) => s + (i.actualWeightKg ?? i.estimatedWeightKg) * i.unitPriceKg, 0);

      return [
        o.id,
        `"${o.waktuMasuk}"`,
        `"${o.createdAt}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.customerArea.replace(/"/g, '""')}"`,
        `"${o.customerSegment}"`,
        `"${o.customerPhone}"`,
        `"${o.status}"`,
        `"${o.packerName || 'Belum Diplot'}"`,
        `"${o.packerStation || '-'}"`,
        `"${itemsDetail.replace(/"/g, '""')}"`,
        estTotal.toFixed(2),
        actTotal.toFixed(2),
        diffKg.toFixed(2),
        totalAmount,
        `"${o.paymentStatus || 'belum_dibayar'}"`,
        `"${(o.notes || '-').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${branding.appName || 'JajanBuah'}_Order_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Log transaksi pesanan (.csv) berhasil diunduh!', 'success');
  };

  // Dedicated Customer Payment Upload Portal
  if (isPaymentUploadMode) {
    const targetOrder = orders.find((o) => o.id === paymentUploadOrderId) || null;
    return (
      <CustomerPaymentUploadPortal
        order={targetOrder}
        onUploadProof={handleUploadPaymentProof}
        onExit={() => {
          setIsPaymentUploadMode(false);
          setPaymentUploadOrderId(null);
        }}
        branding={branding}
      />
    );
  }

  // Dedicated Customer Order Portal
  if (isCustomerMode) {
    return (
      <CustomerOrderPortal
        products={products}
        onSubmitOrder={handleCustomerSubmitOrder}
        onExitToDashboard={() => {
          setIsCustomerMode(false);
          setIsGuestCustomer(false);
        }}
        isStandaloneGuest={isGuestCustomer}
        branding={branding}
      />
    );
  }

  // Auth checking loading state
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium">Memverifikasi sesi aman...</span>
        </div>
      </div>
    );
  }

  // Not logged in: Show Login Page
  if (!currentUser) {
    return (
      <>
        <LoginPage
          onLogin={handleLogin}
          onContinueAsGuestCustomer={() => {
            setIsCustomerMode(true);
            setIsGuestCustomer(true);
          }}
          branding={branding}
        />
        {toastMessage && (
          <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-[95] flex items-center justify-between sm:justify-start space-x-2 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl border border-slate-800 dark:border-slate-200 text-xs animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center space-x-2 min-w-0">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
              ) : toastMessage.type === 'warn' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-blue-400 dark:text-blue-600 shrink-0" />
              )}
              <span className="font-semibold truncate">{toastMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white dark:hover:text-slate-900 ml-2 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </>
    );
  }

  // Dedicated TV Monitor Gudang view (isolated from administrative dashboard)
  if (currentUser.role === 'tv') {
    return (
      <div className="min-h-screen bg-[#070d19] text-white p-2.5 sm:p-6 flex flex-col font-sans select-none">
        <TvMonitorView
          orders={orders}
          packers={packers}
          onLogout={handleLogout}
        />
        {dangerModalConfig.isOpen && (
          <ConfirmDangerModal
            isOpen={dangerModalConfig.isOpen}
            title={dangerModalConfig.title}
            description={dangerModalConfig.description}
            itemName={dangerModalConfig.itemName}
            confirmButtonText={dangerModalConfig.confirmButtonText}
            onConfirm={dangerModalConfig.onConfirm}
            onClose={() => setDangerModalConfig((prev) => ({ ...prev, isOpen: false }))}
          />
        )}
      </div>
    );
  }

  const isPacker = currentRole === 'packer';

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#0b1222] text-slate-100' : 'bg-[#eceff3] text-slate-900'} flex flex-col font-sans selection:bg-slate-900 selection:text-white transition-colors duration-200 w-full relative`}>
      {/* Header */}
      <GlobalHeader
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
        onQuickAddOrder={() => setIsCreateOrderOpen(true)}
        onOpenShareLink={() => setIsShareLinkOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        currentRole={currentRole}
        onOpenSettings={() => {
          if (canManageUsers(currentRole)) {
            setActiveMenu('user_management');
          } else {
            showToast('Akses ditolak: Kelola Pengguna hanya untuk Super Admin.', 'warn');
          }
        }}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenChangeCredentials={() => setIsChangeCredentialsOpen(true)}
        branding={branding}
        onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
        onOpenBrandSettings={canChangeBranding(currentRole) ? () => setIsBrandSettingsOpen(true) : undefined}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      />

      {/* Main Layout */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto flex min-w-0 pt-14 sm:pt-18">
        {/* Sidebar: Sesuai revisi, menu Side-bar DIHAPUS untuk Role packer */}
        {!isPacker && currentRole !== 'tv' && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            activeMenu={activeMenu}
            onSelectMenu={(menu) => {
              setActiveMenu(menu);
              setIsSidebarOpen(false);
            }}
            orderCount={orders.length}
            productCount={products.length}
            currentRole={currentRole}
            onLogout={handleLogout}
            branding={branding}
            onOpenBrandSettings={canChangeBranding(currentRole) ? () => setIsBrandSettingsOpen(true) : undefined}
            onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 p-2.5 sm:p-5 lg:p-6 min-w-0 max-w-full overflow-x-hidden ${isPacker ? 'pb-8 sm:pb-12' : 'pb-24 sm:pb-28 lg:pb-16'} relative z-10`}>
          {/* JIKA ROLE PACKER: HANYA MENAMPILKAN WORKSPACE STASIUN PACKER SAJA */}
          {isPacker ? (
            <PackerWorkspaceView
              packers={packers}
              orders={orders}
              currentPackerId={currentPackerId}
              onSwitchPacker={setCurrentPackerId}
              onUpdateItemWeight={async (orderId, itemId, weight) => {
                try {
                  const updated = await api.updateItemWeight(orderId, itemId, weight);
                  setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
                } catch (err: any) {
                  showToast(err.message || 'Gagal memperbarui berat.', 'warn');
                }
              }}
              onCompleteWeighing={async (orderId) => {
                await handleForceChangeStatus(orderId, 'menunggu_pembayaran');
                showToast(`Order ${orderId} selesai ditimbang! Dialihkan ke tahap Pembayaran.`, 'success');
              }}
              onStartWeighingOrder={async (orderId) => {
                await handleForceChangeStatus(orderId, 'sedang_ditimbang');
              }}
              onOpenScanModal={() => setIsScanOpen(true)}
              onRequestHelp={(orderId) => {
                showToast(`Panggilan bantuan dari Packer untuk order ${orderId} diterima!`, 'info');
              }}
              onLogout={handleLogout}
              currentRole={currentRole}
            />
          ) : (
            <>
              {/* 1. Dashboard (Kanban) */}
              {activeMenu === 'dashboard_kanban' && (
                <KanbanView
                  orders={orders}
                  packers={packers}
                  currentRole={currentRole}
                  onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
                  onOpenShareLink={() => setIsShareLinkOpen(true)}
                  onOpenReviewModal={(orderId) => {
                    const found = orders.find((o) => o.id === orderId);
                    if (found) {
                      setReviewOrder(found);
                      setIsReviewOpen(true);
                    }
                  }}
                  onOpenPrintModal={(order) => {
                    setPrintOrder(order);
                    setIsPrintOpen(true);
                  }}
                  onOpenWhatsAppModal={(order) => {
                    setWhatsAppOrder(order);
                    setIsWhatsAppOpen(true);
                  }}
                  onMoveOrderStage={handleForceChangeStatus}
                  onDownloadManifest={handleDownloadCSV}
                  onEditOrder={(order) => {
                    setEditOrder(order);
                    setIsEditOrderOpen(true);
                  }}
                  onCancelOrder={handleDeleteOrderPrompt}
                  onRefresh={refreshAllData}
                />
              )}

              {/* 2. Manajemen Order */}
              {activeMenu === 'orders_list' && (
                <OrderManagementView
                  orders={orders}
                  packers={packers}
                  searchQuery={globalSearch}
                  onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
                  onOpenShareLink={() => setIsShareLinkOpen(true)}
                  onOpenReviewModal={(orderId) => {
                    const found = orders.find((o) => o.id === orderId);
                    if (found) {
                      setReviewOrder(found);
                      setIsReviewOpen(true);
                    }
                  }}
                  onOpenPrintModal={(order) => {
                    setPrintOrder(order);
                    setIsPrintOpen(true);
                  }}
                  onEditOrder={(order) => {
                    setEditOrder(order);
                    setIsEditOrderOpen(true);
                  }}
                  onDeleteOrderRequest={handleDeleteOrderPrompt}
                  onForceChangeStatus={handleForceChangeStatus}
                  currentRole={currentRole}
                  onDownloadOrderLogs={handleDownloadOrderLogs}
                />
              )}

              {/* 3. Katalog Produk */}
              {activeMenu === 'product_catalog' && (
                <ProductCatalogView
                  products={products}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProductRequest={handleDeleteProductPrompt}
                  onToggleStatus={handleToggleProductStatus}
                  currentRole={currentRole}
                />
              )}

              {/* 4. Manajemen Harga (Super Admin & Order Admin) */}
              {activeMenu === 'price_management' && (
                canManagePrices(currentRole) ? (
                  <PriceManagementView
                    products={products}
                    priceHistory={priceHistory}
                    onUpdatePrice={handleUpdateProductPrice}
                  />
                ) : (
                  <RestrictedAccessView
                    currentRole={currentRole}
                    attemptedFeature="Manajemen & Perubahan Harga Master Komoditas"
                    onReturnToDashboard={() => setActiveMenu('dashboard_kanban')}
                  />
                )
              )}

              {/* 5. Kelola Pengguna (STRICTLY Super Admin Only) */}
              {activeMenu === 'user_management' && (
                canManageUsers(currentRole) ? (
                  <UserManagementView
                    users={users}
                    onOpenChangeCredentials={() => setIsChangeCredentialsOpen(true)}
                    onRefreshUsers={refreshAllData}
                    showToast={showToast}
                  />
                ) : (
                  <RestrictedAccessView
                    currentRole={currentRole}
                    attemptedFeature="Kelola Pengguna (Akun & Otorisasi Karyawan)"
                    onReturnToDashboard={() => setActiveMenu('dashboard_kanban')}
                  />
                )
              )}

              {/* 6. Laporan & Analitik */}
              {activeMenu === 'analytics_reports' && (
                <AnalyticsReportsView
                  orders={orders}
                  packers={packers}
                  products={products}
                  onDownloadCSV={handleDownloadCSV}
                />
              )}

              {/* 7. Activity Log (STRICTLY Super Admin Only) */}
              {activeMenu === 'activity_logs' && (
                canViewActivityLogs(currentRole) ? (
                  <ActivityLogView
                    logs={activityLogs}
                    onDownloadEmployeeLogs={handleDownloadUserLogs}
                    onDownloadOrderLogs={handleDownloadOrderLogs}
                  />
                ) : (
                  <RestrictedAccessView
                    currentRole={currentRole}
                    attemptedFeature="Activity Log & Jejak Audit Operasional"
                    onReturnToDashboard={() => setActiveMenu('dashboard_kanban')}
                  />
                )
              )}

              {/* Device views */}
              {activeMenu === 'tv_monitor' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Layar Display TV Monitor Gudang</span>
                    <button
                      type="button"
                      onClick={() => setActiveMenu('dashboard_kanban')}
                      className="px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 cursor-pointer"
                    >
                      Kembali ke Dashboard
                    </button>
                  </div>
                  <TvMonitorView
                    orders={orders}
                    packers={packers}
                    onExitToDashboard={currentRole !== 'tv' ? () => setActiveMenu('dashboard_kanban') : undefined}
                    onLogout={handleLogout}
                  />
                </div>
              )}

              {activeMenu === 'packer_pwa' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Workspace Stasiun Packer (Lantai Gudang)</span>
                    <button
                      type="button"
                      onClick={() => setActiveMenu('dashboard_kanban')}
                      className="px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 cursor-pointer"
                    >
                      Kembali ke Dashboard
                    </button>
                  </div>
                  <PackerWorkspaceView
                    packers={packers}
                    orders={orders}
                    currentPackerId={currentPackerId}
                    onSwitchPacker={setCurrentPackerId}
                    onUpdateItemWeight={async (orderId, itemId, weight) => {
                      try {
                        const updated = await api.updateItemWeight(orderId, itemId, weight);
                        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
                      } catch (err: any) {
                        showToast(err.message || 'Gagal memperbarui berat.', 'warn');
                      }
                    }}
                    onCompleteWeighing={async (orderId) => {
                      await handleForceChangeStatus(orderId, 'menunggu_pembayaran');
                      showToast(`Order ${orderId} selesai ditimbang! Dialihkan ke tahap Pembayaran.`, 'success');
                    }}
                    onStartWeighingOrder={async (orderId) => {
                      await handleForceChangeStatus(orderId, 'sedang_ditimbang');
                    }}
                    onOpenScanModal={() => setIsScanOpen(true)}
                    onRequestHelp={(orderId) => {
                      showToast(`Panggilan bantuan dari Packer untuk order ${orderId} diterima!`, 'info');
                    }}
                    onExitToDashboard={() => setActiveMenu('dashboard_kanban')}
                    onLogout={handleLogout}
                    currentRole={currentRole}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Confirm Danger Modal */}
      <ConfirmDangerModal
        isOpen={dangerModalConfig.isOpen}
        onClose={() => setDangerModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={dangerModalConfig.onConfirm}
        title={dangerModalConfig.title}
        description={dangerModalConfig.description}
        itemName={dangerModalConfig.itemName}
        confirmButtonText={dangerModalConfig.confirmButtonText}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-[95] flex items-center justify-between sm:justify-start space-x-2 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl border border-slate-800 dark:border-slate-200 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center space-x-2 min-w-0">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            ) : toastMessage.type === 'warn' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 dark:text-blue-600 shrink-0" />
            )}
            <span className="font-semibold truncate">{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 ml-2 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modal Overlays */}
      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        packers={packers}
        products={products}
        onCreateOrder={handleCreateOrder}
      />

      <EditOrderModal
        order={editOrder}
        isOpen={isEditOrderOpen}
        onClose={() => setIsEditOrderOpen(false)}
        packers={packers}
        products={products}
        onSaveOrder={handleSaveEditedOrder}
      />

      <ReviewReleaseModal
        order={orders.find((o) => o.id === reviewOrder?.id) || reviewOrder}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        currentRole={currentRole}
        onMarkPaid={handleMarkPaid}
        onMarkDelivered={handleMarkDelivered}
        onMarkDone={handleMarkDone}
        onReturnOrder={handleReturnOrder}
        onOpenPrintLabel={(ord) => {
          setPrintOrder(ord);
          setIsPrintOpen(true);
        }}
        onOpenWhatsApp={(ord) => {
          setWhatsAppOrder(ord);
          setIsWhatsAppOpen(true);
        }}
        onOpenCustomerUploadPortal={(ord) => {
          setPaymentUploadOrderId(ord.id);
          setIsPaymentUploadMode(true);
        }}
      />

      <PrintLabelModal
        order={printOrder}
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
      />

      <WhatsAppModal
        order={whatsAppOrder}
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        onMarkSent={async (orderId) => {
          await api.updateOrderStatus(orderId, 'menunggu_pembayaran', 'Tagihan WhatsApp dikirim');
          showToast(`Tagihan WhatsApp untuk order ${orderId} terkirim!`);
          await refreshAllData();
        }}
      />

      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        orders={orders}
        onSelectScannedOrder={async (orderId) => {
          await handleForceChangeStatus(orderId, 'sedang_ditimbang');
          setActiveMenu('packer_pwa');
        }}
      />

      <ShareOrderLinkModal
        isOpen={isShareLinkOpen}
        onClose={() => setIsShareLinkOpen(false)}
        onPreviewForm={() => {
          setIsGuestCustomer(false);
          setIsCustomerMode(true);
        }}
      />

      {currentUser && (
        <ChangeCredentialsModal
          isOpen={isChangeCredentialsOpen && currentRole === 'super_admin'}
          onClose={() => setIsChangeCredentialsOpen(false)}
          currentUser={currentUser}
          onSaveCredentials={handleUpdateCredentials}
        />
      )}

      {/* Brand Settings Modal - STRICTLY SUPER ADMIN ONLY */}
      {canChangeBranding(currentRole) && (
        <BrandSettingsModal
          isOpen={isBrandSettingsOpen}
          onClose={() => setIsBrandSettingsOpen(false)}
          currentBranding={branding}
          onSaveBranding={handleSaveBranding}
        />
      )}

      {currentUser && (
        <AccountSettingsModal
          isOpen={isAccountSettingsOpen}
          onClose={() => setIsAccountSettingsOpen(false)}
          currentUser={currentUser}
          currentRole={currentRole}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {/* Global Footer Bar: Sesuai revisi, DIHAPUS untuk Role packer */}
      {!isPacker && (
        <GlobalFooterBar
          ordersCount={orders.length}
          currentUser={currentUser}
          currentRole={currentRole}
          activeMenu={activeMenu}
          onSelectMenu={(menu) => {
            setActiveMenu(menu);
            setIsSidebarOpen(false);
          }}
          onQuickAddOrder={() => setIsCreateOrderOpen(true)}
        />
      )}

      {/* Mobile Bottom Navigation: Sesuai revisi, DIHAPUS untuk Role packer */}
      {!isPacker && (
        <MobileBottomNav
          activeMenu={activeMenu}
          onSelectMenu={(menu) => {
            setActiveMenu(menu);
            setIsSidebarOpen(false);
          }}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          currentRole={currentRole}
        />
      )}
    </div>
  );
}
