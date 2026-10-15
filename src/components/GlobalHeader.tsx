import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Sun,
  Moon,
  ChevronDown,
  Apple,
  Settings,
  LogOut,
  Menu,
  X,
  KeyRound,
  Share2,
  Sparkles,
  User,
  CheckCircle2,
  Package,
  CreditCard,
  Scale,
  DollarSign,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { UserRole, UserAccount, AppBranding, AppNotification } from '../types.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import { canChangeBranding, canManageUsers } from '../utils/permissions.ts';

interface GlobalHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onQuickAddOrder: () => void;
  onOpenShareLink?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentRole: UserRole;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  currentUser: UserAccount;
  onLogout: () => void;
  onOpenChangeCredentials?: () => void;
  branding: AppBranding;
  onOpenAccountSettings: () => void;
  onOpenBrandSettings?: () => void;
  notifications?: AppNotification[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onQuickAddOrder,
  onOpenShareLink,
  isDarkMode,
  onToggleDarkMode,
  currentRole,
  onOpenSettings,
  onToggleSidebar,
  currentUser,
  onLogout,
  onOpenChangeCredentials,
  branding,
  onOpenAccountSettings,
  onOpenBrandSettings,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const isSuperAdmin = currentRole === 'super_admin';
  const isOrderAdmin = currentRole === 'admin_order';
  const isPacker = currentRole === 'packer';
  const hasBrandAccess = canChangeBranding(currentRole);
  const hasUserManagementAccess = canManageUsers(currentRole);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Sound chime helper
  const playChime = () => {
    try {
      if (!soundEnabled) return;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext fallback
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setIsScrolled(scrollPos > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order':
        return <Package className="w-3.5 h-3.5 text-blue-500" />;
      case 'payment':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-500" />;
      case 'packer':
        return <Scale className="w-3.5 h-3.5 text-amber-500" />;
      case 'price':
        return <DollarSign className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />;
    }
  };

  const displayedNotifications = notifications.filter((n) => {
    if (notifFilter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 w-full z-50 transition-all duration-300 ease-in-out pointer-events-auto ${
          isScrolled
            ? 'bg-[#eceff3]/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-md border-b border-slate-300/80 dark:border-slate-800/90'
            : 'bg-[#f4f6f9]/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/80 shadow-2xs'
        }`}
      >
        <div className="max-w-[1700px] mx-auto px-2.5 sm:px-6 h-14 sm:h-18 flex items-center justify-between gap-1 sm:gap-4 min-w-0">
          {/* Left: Mobile Hamburger Toggle + Brand */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink min-w-0">
            {/* Sesuai revisi: Menu Side-bar DIHAPUS untuk Role packer */}
            {!isPacker && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Buka Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Sesuai revisi: Logo DIHAPUS pada interface Role packer dengan tampilan Mobile maupun tampilan lain(pada Top Nav bar) */}
            {!isPacker ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2.5 cursor-pointer group min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                  {branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt={branding.appName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Apple className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 dark:text-emerald-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    <span className="text-sm sm:text-xl font-black tracking-tight text-slate-800 dark:text-white font-heading leading-tight truncate">
                      {branding.appName}
                    </span>
                    <span
                      className={`text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        isSuperAdmin
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {isSuperAdmin ? 'Super' : isOrderAdmin ? 'Order' : currentRole}
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden md:block -mt-0.5 truncate">
                    {isSuperAdmin ? 'SUPER ADMIN (FULL ACCESS)' : isOrderAdmin ? 'ORDER ADMIN' : currentRole.toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              /* Untuk Role Packer: Nama stasiun kerja ringkas tanpa logo */
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                <span className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider truncate font-heading">
                  Packer Station Floor
                </span>
              </div>
            )}
          </div>

          {/* Center: Universal Search Bar (Desktop) - PERTAHANKAN */}
          <div className="flex-1 max-w-lg mx-2 hidden sm:flex">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari universal: #ID Order, Customer, Komoditas Buah..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-full text-xs bg-slate-200/60 dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0 relative z-20">
            {/* Sesuai revisi: Tombol dan pintasan "App" DIPERTAHANKAN */}
            <PWAInstallButton variant="header" />

            {/* Mobile Search Toggle Icon - PERTAHANKAN */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="sm:hidden p-1.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cari"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Sesuai revisi: Link Pesanan (Bagi Link Form) DIHAPUS pada interface Packer */}
            {!isPacker && onOpenShareLink && (
              <button
                type="button"
                onClick={onOpenShareLink}
                className="inline-flex items-center space-x-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs shrink-0 cursor-pointer"
                title="Bagikan Link Formulir Pesanan ke Pelanggan"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline">Bagi Link Form</span>
                <span className="md:hidden text-[10px]">Link</span>
              </button>
            )}

            {/* Quick Add (+) Button - Hanya untuk Super Admin & Order Admin */}
            {(isSuperAdmin || isOrderAdmin) && (
              <button
                type="button"
                onClick={onQuickAddOrder}
                className="inline-flex items-center space-x-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
                title="Buat Order Baru"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Order Baru</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300/80 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
              title={isDarkMode ? 'Beralih ke Tema Lembut (Eye-Friendly Light)' : 'Beralih ke Tema Gelap (Dark Mode)'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Sesuai revisi: Tombol View & Notifikasi DIPERTAHANKAN & AKTIF untuk semua role */}
            <div ref={notifRef} className="relative z-30">
              <button
                type="button"
                onClick={() => {
                  setIsNotifOpen((prev) => !prev);
                  setIsProfileOpen(false);
                  if (!isNotifOpen) {
                    playChime();
                  }
                }}
                className="relative p-2 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300/80 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
                title="Pusat Notifikasi Aktif"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION POPOVER CARD */}
              {isNotifOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-300 dark:border-slate-700 p-4 z-[100] animate-in fade-in zoom-in-95 duration-100 text-xs"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-emerald-500" />
                      <span className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-xs font-heading">
                        Notifikasi Operasional
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded cursor-pointer"
                        title={soundEnabled ? 'Matikan Suara Notifikasi' : 'Aktifkan Suara Notifikasi'}
                      >
                        {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-500" /> : <VolumeX className="w-3.5 h-3.5" />}
                      </button>

                      {onMarkAllNotificationsRead && unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => onMarkAllNotificationsRead()}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                        >
                          Tandai Semua
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex space-x-1.5 my-2">
                    <button
                      type="button"
                      onClick={() => setNotifFilter('all')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                        notifFilter === 'all'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Semua ({notifications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifFilter('unread')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                        notifFilter === 'unread'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Belum Dibaca ({unreadCount})
                    </button>
                  </div>

                  {/* Notifications list */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {displayedNotifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                        Tidak ada notifikasi aktif.
                      </div>
                    ) : (
                      displayedNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead?.(n.id)}
                          className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-start space-x-2.5 ${
                            n.isRead
                              ? 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
                              : 'bg-emerald-50/70 dark:bg-slate-800/90 border-emerald-300 dark:border-emerald-800/60 shadow-2xs'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-2xs shrink-0 mt-0.5">
                            {getNotifIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-white truncate text-[11px]">
                                {n.title}
                              </span>
                              {!n.isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug break-words">
                              {n.message}
                            </p>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 block pt-0.5">
                              {n.timestamp}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Dropdown Menu - DIPERTAHANKAN */}
            <div ref={profileRef} className="relative shrink-0 z-30">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen((prev) => !prev);
                  setIsNotifOpen(false);
                }}
                className="relative z-10 flex items-center space-x-1 p-1 sm:pl-1.5 sm:pr-2 rounded-full bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300/80 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer select-none active:scale-95 shadow-2xs"
                title="Menu Pengguna & Pengaturan Akun"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-2 ring-emerald-500 shadow-xs shrink-0 pointer-events-none"
                />
                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 transition-transform duration-150 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 sm:w-84 max-w-[calc(100vw-1.5rem)] bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-300 dark:border-slate-700/90 p-3 z-[100] text-xs max-h-[min(560px,calc(100vh-5rem))] overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95 duration-100"
                >
                  {/* Account Header */}
                  <div className="p-3 border-b border-slate-200 dark:border-slate-800 mb-1.5 bg-slate-100/90 dark:bg-slate-800/40 rounded-2xl">
                    <div className="font-extrabold text-slate-900 dark:text-white text-sm truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{currentUser.email}</div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSuperAdmin
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : isOrderAdmin
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {isSuperAdmin ? 'SUPER ADMIN' : isOrderAdmin ? 'ORDER ADMIN' : currentRole.toUpperCase()}
                      </span>
                      {currentUser.username && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          ID: {currentUser.username}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dark Mode toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      onToggleDarkMode();
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center space-x-2">
                      {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                      <span className="font-semibold">{isDarkMode ? 'Mode Terang (Eye-Friendly)' : 'Mode Gelap'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{isDarkMode ? 'Aktif' : 'Non-aktif'}</span>
                  </button>

                  {/* Pengaturan Akun & Profil Pribadi - Available for all roles including packer */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onOpenAccountSettings();
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-slate-800 dark:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer font-bold"
                  >
                    <User className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div className="text-left min-w-0">
                      <div className="font-bold text-[11px] truncate">Pengaturan Akun & Profil Saya</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate">Ganti foto, nama, no HP & kata sandi</div>
                    </div>
                  </button>

                  {/* Pengaturan Logo & Brand - STRICTLY SUPER ADMIN ONLY */}
                  {hasBrandAccess && onOpenBrandSettings && !isPacker && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenBrandSettings();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors cursor-pointer font-bold"
                    >
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                      <div className="text-left min-w-0">
                        <div className="font-bold text-[11px] truncate">Ubah Logo & Branding Aplikasi</div>
                        <div className="text-[10px] text-purple-500/80 dark:text-purple-400 font-normal truncate">Kustomisasi logo header & nama brand</div>
                      </div>
                    </button>
                  )}

                  {/* Kelola Pengguna - STRICTLY SUPER ADMIN ONLY */}
                  {hasUserManagementAccess && !isPacker && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenSettings();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="text-left min-w-0">
                        <div className="font-semibold text-[11px] truncate">Kelola Akun & Hak Akses</div>
                        <div className="text-[10px] text-slate-400 truncate">Daftar pengguna & persetujuan staf</div>
                      </div>
                    </button>
                  )}

                  {/* Ubah ID & Password Super Admin - STRICTLY SUPER ADMIN ONLY */}
                  {onOpenChangeCredentials && isSuperAdmin && !isPacker && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenChangeCredentials();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors font-bold text-xs cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 shrink-0" />
                      <span className="truncate">Ubah Kredensial Super Admin</span>
                    </button>
                  )}

                  {/* Keluar / Logout */}
                  <div className="pt-2 mt-1 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors font-bold text-xs cursor-pointer border border-rose-200/60 dark:border-rose-900/40"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Keluar / Logout Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Mobile Search Bar */}
        {isMobileSearchOpen && (
          <div className="sm:hidden px-3 pb-3 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-150">
            <div className="relative mt-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Cari ID order, resto, produk..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-9 py-2 rounded-full text-xs bg-slate-200/70 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
