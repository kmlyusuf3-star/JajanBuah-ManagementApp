import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Apple,
  BadgeDollarSign,
  Users,
  LineChart,
  History,
  Tv,
  Scale,
  X,
  LogOut,
  Sparkles,
  User,
} from 'lucide-react';
import { UserRole, AppBranding } from '../types.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import { canChangeBranding } from '../utils/permissions.ts';

export type SuperAdminNavMenu =
  | 'dashboard_kanban'
  | 'orders_list'
  | 'product_catalog'
  | 'price_management'
  | 'user_management'
  | 'analytics_reports'
  | 'activity_logs'
  | 'tv_monitor'
  | 'packer_pwa';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeMenu: SuperAdminNavMenu;
  onSelectMenu: (menu: SuperAdminNavMenu) => void;
  orderCount: number;
  productCount: number;
  currentRole: UserRole;
  onLogout?: () => void;
  branding?: AppBranding;
  onOpenBrandSettings?: () => void;
  onOpenAccountSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeMenu,
  onSelectMenu,
  orderCount,
  productCount,
  currentRole,
  onLogout,
  branding,
  onOpenBrandSettings,
  onOpenAccountSettings,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sesuai revisi: Menu Side-bar DIHAPUS untuk Role packer
  if (currentRole === 'packer' || currentRole === 'tv') {
    return null;
  }

  const isSuperAdmin = currentRole === 'super_admin';
  const isOrderAdmin = currentRole === 'admin_order';
  const hasBrandAccess = canChangeBranding(currentRole);

  const menuItems = [
    {
      id: 'dashboard_kanban' as SuperAdminNavMenu,
      label: 'Dashboard (Kanban)',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-emerald-500 text-white',
      roles: ['super_admin', 'admin_order'],
    },
    {
      id: 'orders_list' as SuperAdminNavMenu,
      label: 'Manajemen Order',
      icon: Package,
      badge: String(orderCount),
      badgeColor: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200',
      roles: ['super_admin', 'admin_order'],
    },
    {
      id: 'product_catalog' as SuperAdminNavMenu,
      label: 'Katalog Produk',
      icon: Apple,
      badge: String(productCount),
      badgeColor: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200',
      roles: ['super_admin', 'admin_order'],
    },
    {
      id: 'price_management' as SuperAdminNavMenu,
      label: 'Manajemen Harga',
      icon: BadgeDollarSign,
      exclusive: false,
      roles: ['super_admin', 'admin_order'],
    },
    {
      id: 'user_management' as SuperAdminNavMenu,
      label: 'Kelola Pengguna',
      icon: Users,
      exclusive: true,
      roles: ['super_admin'],
    },
    {
      id: 'analytics_reports' as SuperAdminNavMenu,
      label: 'Laporan & Analitik',
      icon: LineChart,
      roles: ['super_admin', 'admin_order'],
    },
    {
      id: 'activity_logs' as SuperAdminNavMenu,
      label: 'Activity Log & Audit',
      icon: History,
      exclusive: true,
      roles: ['super_admin'],
    },
  ];

  const handleItemClick = (id: SuperAdminNavMenu) => {
    onSelectMenu(id);
    onClose();
  };

  const appTitle = branding?.appName || 'JajanBuah';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-[65] bg-slate-950/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-18 left-0 z-[70] lg:z-30 w-72 max-w-[85vw] shrink-0 h-full lg:h-[calc(100vh-4.5rem)] bg-[#f8fafc] dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none overflow-y-auto overscroll-contain pb-[calc(1rem+env(safe-area-inset-bottom,0px))] ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-4">
          {/* Top header on mobile */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 lg:hidden">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shadow-xs shrink-0 overflow-hidden">
                {branding?.logoUrl ? (
                  <img src={branding.logoUrl} alt={appTitle} className="w-full h-full object-cover" />
                ) : (
                  <Apple className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-slate-900 dark:text-white text-sm font-heading truncate">
                  {appTitle} Menu
                </div>
                <div
                  className={`text-[10px] font-bold truncate ${
                    isSuperAdmin
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {isSuperAdmin ? 'SUPER ADMIN' : isOrderAdmin ? 'ORDER ADMIN' : String(currentRole).toUpperCase()}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-bold text-xs cursor-pointer"
              title="Tutup Menu"
            >
              <X className="w-4 h-4" />
              <span>Tutup</span>
            </button>
          </div>

          {/* Heading label for desktop */}
          <div className="hidden lg:block px-2 pt-1">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              PUSAT KENDALI
            </div>
            <div className="flex items-center space-x-1.5 mt-1">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isSuperAdmin ? 'bg-purple-500' : 'bg-blue-500'
                }`}
              ></span>
              <span
                className={`text-xs font-bold ${
                  isSuperAdmin
                    ? 'text-purple-700 dark:text-purple-300'
                    : 'text-blue-700 dark:text-blue-300'
                }`}
              >
                {isSuperAdmin
                  ? 'Super Admin (Full Access)'
                  : isOrderAdmin
                  ? 'Order Admin (Operasional)'
                  : currentRole}
              </span>
            </div>
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-1">
            {menuItems
              .filter((it) => it.roles.includes(currentRole))
              .map((item) => {
                const isActive = activeMenu === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive
                            ? 'text-emerald-400 dark:text-emerald-600'
                            : item.exclusive
                            ? 'text-amber-500'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                      {item.exclusive && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                            isActive
                              ? 'bg-amber-400 text-slate-900'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          Super
                        </span>
                      )}
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1 ${
                          isActive
                            ? 'bg-white/20 text-white dark:bg-slate-800 dark:text-slate-100'
                            : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>

          {/* Quick Account Settings link in sidebar */}
          {onOpenAccountSettings && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAccountSettings();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">Pengaturan Akun Saya</span>
              </button>
            </div>
          )}

          {/* Ubah Logo & Brand shortcut - STRICTLY SUPER ADMIN ONLY */}
          {hasBrandAccess && onOpenBrandSettings && (
            <div className="px-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBrandSettings();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="truncate">Ubah Logo Brand</span>
                </div>
                <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.2 rounded-md shrink-0">
                  Super
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Floor Device Shortcuts & Mobile Close Button Bottom Panel */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 mt-4">
          {/* PWA Install Button for Chrome */}
          <div className="px-1">
            <PWAInstallButton variant="sidebar" />
          </div>

          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 pt-1">
            PINTASAN PERANGKAT
          </div>

          <button
            type="button"
            onClick={() => handleItemClick('packer_pwa')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeMenu === 'packer_pwa'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Scale className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="truncate">Packer Workspace</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
              PWA
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('tv_monitor')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeMenu === 'tv_monitor'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Tv className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="truncate">TV Monitor Gudang</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">Dark</span>
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate">Keluar / Logout</span>
              </div>
              <span className="text-[10px] font-bold text-rose-500 shrink-0">Keluar</span>
            </button>
          )}

          {/* Explicit Mobile Bottom Close Button */}
          <div className="lg:hidden pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Tutup Navigasi</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
