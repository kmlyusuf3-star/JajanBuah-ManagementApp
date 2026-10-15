import React from 'react';
import {
  LayoutDashboard,
  Package,
  Apple,
  BadgeDollarSign,
  Menu,
  LineChart,
} from 'lucide-react';
import { SuperAdminNavMenu } from './Sidebar.tsx';
import { UserRole } from '../types.ts';

interface MobileBottomNavProps {
  activeMenu: SuperAdminNavMenu;
  onSelectMenu: (menu: SuperAdminNavMenu) => void;
  onToggleSidebar: () => void;
  currentRole: UserRole;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeMenu,
  onSelectMenu,
  onToggleSidebar,
  currentRole,
}) => {
  // Sesuai revisi: Bottom Navbar dan tombol-tombolnya DIHAPUS untuk Role packer
  if (currentRole === 'tv' || currentRole === 'packer' || activeMenu === 'tv_monitor' || activeMenu === 'packer_pwa') {
    return null;
  }

  const canAccessPrices = currentRole === 'super_admin' || currentRole === 'admin_order';

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#f4f6f9]/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-300/80 dark:border-slate-800/90 lg:hidden px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)] transition-all">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Tab 1: Kanban / Dashboard */}
        <button
          type="button"
          onClick={() => onSelectMenu('dashboard_kanban')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl min-w-14 transition-colors cursor-pointer ${
            activeMenu === 'dashboard_kanban'
              ? 'text-slate-900 dark:text-white font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {activeMenu === 'dashboard_kanban' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-tight">Kanban</span>
        </button>

        {/* Tab 2: Orders List */}
        <button
          type="button"
          onClick={() => onSelectMenu('orders_list')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl min-w-14 transition-colors cursor-pointer ${
            activeMenu === 'orders_list'
              ? 'text-slate-900 dark:text-white font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Package className="w-5 h-5" />
            {activeMenu === 'orders_list' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-tight">Order</span>
        </button>

        {/* Tab 3: Produk */}
        <button
          type="button"
          onClick={() => onSelectMenu('product_catalog')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl min-w-14 transition-colors cursor-pointer ${
            activeMenu === 'product_catalog'
              ? 'text-slate-900 dark:text-white font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Apple className="w-5 h-5" />
            {activeMenu === 'product_catalog' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-tight">Produk</span>
        </button>

        {/* Tab 4: Manajemen Harga (Accessible for Super Admin & Order Admin) */}
        {canAccessPrices ? (
          <button
            type="button"
            onClick={() => onSelectMenu('price_management')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl min-w-14 transition-colors cursor-pointer ${
              activeMenu === 'price_management'
                ? 'text-amber-600 dark:text-amber-400 font-black'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <BadgeDollarSign className="w-5 h-5" />
              {activeMenu === 'price_management' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-tight">Harga</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectMenu('analytics_reports')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl min-w-14 transition-colors cursor-pointer ${
              activeMenu === 'analytics_reports'
                ? 'text-slate-900 dark:text-white font-black'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <LineChart className="w-5 h-5" />
              {activeMenu === 'analytics_reports' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-tight">Laporan</span>
          </button>
        )}

        {/* Tab 5: Menu Drawer Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl min-w-14 text-slate-700 dark:text-slate-300 active:scale-95 transition-transform cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-bold tracking-tight leading-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
};
