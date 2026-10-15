import React, { useState } from 'react';
import { X, Copy, Check, Share2, ExternalLink, MessageCircle, ShieldCheck } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay.tsx';

interface ShareOrderLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewForm: () => void;
}

export const ShareOrderLinkModal: React.FC<ShareOrderLinkModalProps> = ({
  isOpen,
  onClose,
  onPreviewForm,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const shareableUrl = `${origin}${pathname}?mode=customer_order`;

  const handleCopyLink = () => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(shareableUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareableUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch {
      // Fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `Halo! Silakan pesan buah segar langsung melalui formulir pesanan online resmi JajanBuah di tautan berikut:\n${shareableUrl}\n\nPesanan Anda akan langsung diproses dan ditimbang oleh tim gudang kami. Terima kasih!`;
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-heading truncate">
                Bagikan Link Form Pesanan Pelanggan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Pelanggan dapat mengisi pesanan sendiri secara mandiri.
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

        {/* Security badge */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-start space-x-2.5 sm:space-x-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-emerald-900 dark:text-emerald-200 min-w-0">
            <span className="font-bold">Akses Khusus Pelanggan Terisolasi</span>
            <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300 leading-relaxed">
              Pelanggan yang membuka link ini <strong>hanya dapat melihat dan mengisi formulir pemesanan</strong>. Data keuangan, harga master, activity log, dan dashboard internal gudang otomatis terkunci.
            </p>
          </div>
        </div>

        {/* URL Box & Copy */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 block">
            Tautan Link Publik Formulir Pesanan:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] truncate select-all">
              {shareableUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 flex items-center justify-center space-x-1.5 shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer text-center"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
            </button>
          </div>
        </div>

        {/* QR Code & Share Options */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4">
          <div className="p-2 sm:p-2.5 bg-white rounded-2xl border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
            <QRCodeDisplay value={shareableUrl} size={88} />
          </div>
          <div className="space-y-2 text-xs w-full text-center sm:text-left min-w-0">
            <div className="font-bold text-slate-800 dark:text-white">
              Scan Barcode / QR di Lokasi atau Kirim Chat
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Pelanggan restoran, hotel, atau toko dapat langsung memindai QR code ini di ponsel mereka untuk langsung memesan.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start gap-2 pt-1">
              <a
                href={waShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 sm:py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer text-center"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Kirim via WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPreviewForm();
                }}
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 sm:py-1.5 rounded-full text-xs font-bold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                <span>Lihat Tampilan Form</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer text-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
