import React, { useState, useEffect } from 'react';
import {
  Apple,
  Clock,
  ArrowUp,
  Shield,
  Layers,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { UserAccount, UserRole } from '../types.ts';
import { SuperAdminNavMenu } from './Sidebar.tsx';

interface GlobalFooterBarProps {
  ordersCount?: number;
  currentUser?: UserAccount | null;
  currentRole: UserRole;
  activeMenu?: SuperAdminNavMenu;
  onSelectMenu?: (menu: SuperAdminNavMenu) => void;
  onQuickAddOrder?: () => void;
}

export const GlobalFooterBar: React.FC<GlobalFooterBarProps> = ({
  ordersCount = 0,
  currentUser,
  currentRole,
  activeMenu,
}) => {
  const [timeString, setTimeString] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentRole === 'tv' || currentRole === 'packer' || activeMenu === 'tv_monitor' || activeMenu === 'packer_pwa') return null;

  const isSuperAdmin = currentRole === 'super_admin';
  const isOrderAdmin = currentRole === 'admin_order';

  return (
    <footer className="hidden lg:block fixed bottom-0 inset-x-0 z-35 bg-[#f4f6f9]/85 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-300/80 dark:border-slate-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] transition-all">
      <div className="max-w-[1700px] mx-auto px-6 h-10 flex items-center justify-between text-xs min-w-0">
        {/* Left: Hub, System Status & Sync */}
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
              <Apple className="w-3.5 h-3.5 text-emerald-500 inline-block mr-0.5" />
              <span>JajanBuah Fulfillment Hub</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
              Production
            </span>
          </div>

          <div className="h-3 w-px bg-slate-300 dark:bg-slate-800 hidden md:block"></div>

          {/* Shift & Time */}
          <div className="hidden md:flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 text-[11px] font-mono">
            <Clock className="w-3 h-3 text-purple-500 shrink-0" />
            <span>Shift: {currentUser?.shift || 'Shift Full Day'}</span>
            <span className="text-slate-400">•</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{timeString} WIB</span>
          </div>
        </div>

        {/* Center: Live summary metrics */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
            <Layers className="w-3 h-3 text-purple-500" />
            <span>Order Aktif:</span>
            <span className="font-black font-mono text-purple-600 dark:text-purple-400">{ordersCount}</span>
          </div>
          <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Database Connected</span>
          </div>
        </div>

        {/* Right: Active User session & Scroll-to-Top Button */}
        <div className="flex items-center space-x-3 shrink-0">
          {currentUser && (
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-600 dark:text-slate-300">
              {isSuperAdmin ? (
                <Shield className="w-3 h-3 text-purple-500 shrink-0" />
              ) : (
                <Package className="w-3 h-3 text-blue-500 shrink-0" />
              )}
              <span className="font-medium truncate max-w-[140px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {isSuperAdmin ? 'Super Admin' : isOrderAdmin ? 'Order Admin' : String(currentRole).toUpperCase()}
              </span>
            </div>
          )}

          {/* Quick Scroll To Top */}
          <button
            type="button"
            onClick={scrollToTop}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              showScrollTop
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-xs'
                : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Kembali ke atas halaman"
          >
            <ArrowUp className="w-3 h-3" />
            <span className="hidden xl:inline">Ke Atas</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
