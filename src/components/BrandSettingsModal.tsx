import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Check,
  RotateCcw,
  Sparkles,
  Apple,
} from 'lucide-react';
import { AppBranding } from '../types.ts';

interface BrandSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBranding: AppBranding;
  onSaveBranding: (newBranding: AppBranding) => void;
}

const DEFAULT_BRANDING: AppBranding = {
  logoUrl: '',
  appName: 'JajanBuah',
  tagline: 'Fruit Operations & Fulfillment Management',
};

export const BrandSettingsModal: React.FC<BrandSettingsModalProps> = ({
  isOpen,
  onClose,
  currentBranding,
  onSaveBranding,
}) => {
  const [appName, setAppName] = useState(currentBranding.appName || 'JajanBuah');
  const [tagline, setTagline] = useState(currentBranding.tagline || 'Fruit Operations & Fulfillment Management');
  const [logoUrl, setLogoUrl] = useState(currentBranding.logoUrl || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAppName(currentBranding.appName || 'JajanBuah');
      setTagline(currentBranding.tagline || 'Fruit Operations & Fulfillment Management');
      setLogoUrl(currentBranding.logoUrl || '');
    }
  }, [isOpen, currentBranding]);

  const handleProcessLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar yang valid (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setLogoUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessLogoFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppBranding = {
      appName: appName.trim() || 'JajanBuah',
      tagline: tagline.trim() || 'Fruit Operations & Fulfillment Management',
      logoUrl: logoUrl.trim() || undefined,
    };
    onSaveBranding(updated);
    onClose();
  };

  const handleResetDefault = () => {
    setAppName(DEFAULT_BRANDING.appName);
    setTagline(DEFAULT_BRANDING.tagline);
    setLogoUrl('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base font-heading truncate">
                  Pengaturan Logo & Branding
                </h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 shrink-0">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Ubah logo header, nama brand usaha, dan tagline sistem
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Header Brand Preview Box */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pratinjau Tampilan Header:
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt={appName} className="w-full h-full object-cover" />
                ) : (
                  <Apple className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white font-heading leading-tight truncate">
                    {appName || 'JajanBuah'}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 shrink-0">
                    Super
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-500 truncate block">
                  {tagline || 'Fruit Operations & Fulfillment Management'}
                </span>
              </div>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
              Preview
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Logo Upload / URL */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              Logo Aplikasi (Gambar):
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleProcessLogoFile(f);
              }}
              className="hidden"
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                  : 'border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800'
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center mb-2 overflow-hidden border border-slate-200 dark:border-slate-600">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                {logoUrl ? 'Klik atau Seret Gambar untuk Mengganti' : 'Klik untuk Upload Logo dari Perangkat'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mendukung PNG transparan, JPG, SVG, atau WebP
              </p>
            </div>
            {logoUrl && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Logo kustom aktif</span>
                </span>
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Hapus Logo
                </button>
              </div>
            )}
          </div>

          {/* Brand Name Input */}
          <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              Nama Brand / Usaha:
            </label>
            <input
              type="text"
              required
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Contoh: JajanBuah"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Tagline / Subtitle */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              Tagline / Subjudul Operasional:
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Contoh: Fruit Operations & Fulfillment Management"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetDefault}
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer text-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
            <div className="flex items-center space-x-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 font-bold cursor-pointer text-center"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-transform cursor-pointer text-center"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Brand</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
