import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner' | 'floating';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed PWA / standalone app, hide the button
  if (isInstalled) {
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          onClick={handleAction}
          className="inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-transform active:scale-95 shrink-0 cursor-pointer"
          title="Pasang Pintasan Aplikasi di Ponsel / Chrome"
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Pintasan App</span>
          <span className="sm:hidden text-[10px]">App</span>
        </button>
      )}

      {variant === 'sidebar' && (
        <button
          type="button"
          onClick={handleAction}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Install Pintasan Chrome</span>
          </div>
          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-extrabold">
            PWA
          </span>
        </button>
      )}

      {variant === 'banner' && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-3 sm:px-4 sm:py-2.5 rounded-2xl flex items-center justify-between gap-2.5 sm:gap-3 shadow-md border border-emerald-500/40 w-full">
          <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 text-left">
              <div className="font-extrabold text-xs truncate">Pasang Pintasan JajanBuah</div>
              <div className="text-[10px] text-emerald-100 truncate">Akses cepat layar utama via Chrome/Browser</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAction}
            className="px-3 sm:px-3.5 py-1.5 rounded-full bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-xs shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            Pasang
          </button>
        </div>
      )}

      {/* Guided Modal for Chrome / iOS install */}
      {showGuide && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm font-heading">
                    Pasang Pintasan JajanBuah
                  </h3>
                  <span className="text-[10px] text-slate-400">PWA Chrome & Mobile</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Panduan untuk Safari / iOS (iPhone/iPad):
                </p>
                <ol className="list-decimal list-inside space-y-2 bg-slate-100/80 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <li>Ketuk tombol <strong>Share / Bagikan</strong> di bilah bawah browser.</li>
                  <li>Gulir ke bawah dan pilih <strong>"Add to Home Screen" (Tambah ke Layar Utama)</strong>.</li>
                  <li>Ketuk <strong>Add / Tambah</strong> di pojok kanan atas.</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Cara pasang di Google Chrome (Android / PC / Mac):
                </p>
                <div className="space-y-2 bg-slate-100/80 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-emerald-600">1.</span>
                    <span>Ketuk ikon <strong>Titik Tiga</strong> di sudut kanan atas browser Chrome.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-emerald-600">2.</span>
                    <span>
                      Pilih <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install aplikasi"</strong>.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-emerald-600">3.</span>
                    <span>Konfirmasi <strong>"Install"</strong>. JajanBuah akan muncul di layar HP Anda seperti aplikasi native tanpa bilah URL!</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl font-extrabold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 shadow transition-colors cursor-pointer"
            >
              Mengerti & Siap Pasang
            </button>
          </div>
        </div>
      )}
    </>
  );
};
