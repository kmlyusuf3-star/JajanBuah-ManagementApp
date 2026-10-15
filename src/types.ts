export type UserRole = 'super_admin' | 'admin_order' | 'packer' | 'tv';

export type OrderStatus =
  | 'order_baru'            // 1. Order Baru / New Order
  | 'sedang_ditimbang'      // 2. Ditimbang / On Weighed
  | 'menunggu_pembayaran'   // 3. Pembayaran / Waiting for Payment
  | 'siap_dikirim'          // 4. Siap Kirim / Ready for Delivery
  | 'delivered'             // 5. Terkirim / Delivered
  | 'selesai'               // 6. Selesai / Completed
  // Legacy aliases
  | 'selesai_ditimbang'
  | 'following_up'
  | 'done'
  | 'proses_kemas';

export interface OrderItem {
  id: string;
  fruitName: string;
  variety?: string;
  grade?: string;
  brix?: number;
  estimatedWeightKg: number;
  actualWeightKg?: number;
  unitPriceKg: number;
  isWeighed?: boolean;
}

export interface StatusHistoryEntry {
  status: string;
  statusLabel: string;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface Order {
  id: string; // e.g. '#ORD-2026-0891'
  customerName: string;
  customerSegment: string;
  customerArea: string;
  customerPhone: string;
  items: OrderItem[];
  waktuMasuk: string;
  waktuMasukMinutesAgo: number;
  createdAt: string;
  packerId?: string;
  packerName?: string;
  packerStation?: string;
  status: OrderStatus;
  priorityLabel?: string;
  targetDeadline?: string;
  binLocation?: string;
  scalePhotos?: string[];
  waStatus?: 'Belum Dikirim' | 'WA Dikirim' | 'ACC';
  notes?: string;
  paymentProofPhoto?: string;
  paymentProofUploadedAt?: string;
  paymentStatus?: 'belum_dibayar' | 'menunggu_verifikasi' | 'terbayar';
  isPaid?: boolean;
  paidAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  statusHistory?: StatusHistoryEntry[];
  paymentAdjustment?: {
    originalTotal: number;
    adjustedTotal: number;
    difference: number;
    status: 'Menunggu Bukti Transfer / ACC' | 'Lunas' | 'Belum Ditagih';
  };
}

export interface Packer {
  id: string;
  code: string;
  name: string;
  station: string;
  stationCode: string;
  avatar: string;
  initials: string;
  status: 'Penuh' | 'Sisa 1 Slot' | 'Sisa 2 Slot' | 'Siap Ditugaskan';
  capacityMax: number;
  activeOrderIds: string[];
  shift: string;
  certification: string;
  stats: {
    totalWeighedKg: number;
    toleranceAccuracy: number;
    avgMinutesPerOrder: number;
    scaleIncidents: number;
    ordersCompletedToday: number;
  };
}

export interface BundleItem {
  fruitId?: string;
  fruitName: string;
  weightKg: number;
  variety?: string;
  grade?: string;
  note?: string;
}

export interface FruitProduct {
  id: string;
  name: string;
  category: string;
  variety: string;
  grade: string;
  brix: number;
  pricePerKg: number;
  pricePerGram?: number;
  pricePerPack?: number;
  unitType: 'kg' | 'gram' | 'pack';
  stockKg: number;
  toleransiPct: number;
  storageTemp: string;
  origin: string;
  isActive: boolean;
  image: string;
  isBundle?: boolean;
  bundleItems?: BundleItem[];
  description?: string;
}

export interface PriceHistoryItem {
  id: string;
  productId: string;
  productName: string;
  unit: 'kg' | 'gram' | 'pack';
  oldPrice: number;
  newPrice: number;
  reason: string;
  changedBy: string;
  timestamp: string;
  dateStr: string;
}

export interface UserAccount {
  id: string;
  username?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  station?: string;
  shift: string;
  status: 'aktif' | 'nonaktif' | 'menunggu_persetujuan' | 'ditolak';
  requestedRole?: string;
  lastLogin: string;
  avatar: string;
  createdAt?: string;
}

export interface ActivityLogItem {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  category: 'order' | 'price' | 'user' | 'system';
}

export interface AppBranding {
  logoUrl?: string;
  appName: string;
  tagline: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'order' | 'payment' | 'packer' | 'price' | 'system' | 'user';
  isRead: boolean;
  orderId?: string;
  roleTarget?: UserRole | 'all';
}
