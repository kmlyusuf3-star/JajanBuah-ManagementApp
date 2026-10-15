import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, Send } from 'lucide-react';
import { Order } from '../types.ts';

interface WhatsAppModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkSent?: (orderId: string) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  order,
  isOpen,
  onClose,
  onMarkSent,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const totalActualKg = order.items.reduce(
    (s, it) => s + (it.actualWeightKg ?? it.estimatedWeightKg),
    0
  );

  const totalAmount = order.items.reduce(
    (s, it) => s + (it.actualWeightKg ?? it.estimatedWeightKg) * it.unitPriceKg,
    0
  );

  const uploadLink = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?mode=payment_upload&orderId=${encodeURIComponent(order.id)}`
    : `https://jajanbuah.app/?mode=payment_upload&orderId=${encodeURIComponent(order.id)}`;

  const messageText = `Halo *${order.customerName}*,

Berikut kami kirimkan rincian tagihan resmi pesanan Anda di JajanBuah (*${order.id}*):

*Detail Customer:*
Nama: ${order.customerName}
Kontak: ${order.customerPhone}
Wilayah: ${order.customerArea} (${order.customerSegment})

*Rincian Pesanan & Hasil Penimbangan Fisik:*
${order.items
  .map(
    (it, idx) => {
      const wt = it.actualWeightKg ?? it.estimatedWeightKg;
      const sub = wt * it.unitPriceKg;
      return `${idx + 1}. *${it.fruitName}* (${it.grade || 'Grade A'}):
   - Berat Riil Timbangan: *${wt.toFixed(1)} kg* (Est: ${it.estimatedWeightKg.toFixed(1)} kg)
   - Harga: Rp ${it.unitPriceKg.toLocaleString('id-ID')} / kg
   - Subtotal: Rp ${sub.toLocaleString('id-ID')}`;
    }
  )
  .join('\n\n')}

*Total Berat Riil:* ${totalActualKg.toFixed(2)} KG
*TOTAL TAGIHAN:* *Rp ${totalAmount.toLocaleString('id-ID')}*

*Unggah Bukti Pembayaran:*
Silakan lakukan pembayaran lalu unggah foto bukti transfer Anda melalui link resmi berikut:
${uploadLink}

Setelah bukti diunggah, tim admin akan memverifikasi dan menyiapkan pesanan Anda untuk pengiriman (Siap Kirim).

Terima kasih atas kerja samanya!
_JajanBuah Warehouse Fulfillment Center_`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanPhone = (order.customerPhone || '081234567890').replace(/[^0-9]/g, '');
  const intlPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
  const waUrl = `https://wa.me/${intlPhone}?text=${encodeURIComponent(messageText)}`;

  const handleSendAction = () => {
    if (onMarkSent) onMarkSent(order.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base font-heading truncate">
                Kirim Tagihan & Penyesuaian via WhatsApp
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {order.customerName} ({order.customerPhone})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Preview Box */}
        <div className="bg-[#e8ecef] dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-300 dark:border-slate-700 space-y-2">
          <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-xs p-3 sm:p-3.5 shadow-sm text-xs font-sans leading-relaxed whitespace-pre-line border border-slate-200 dark:border-slate-700 max-h-56 sm:max-h-60 overflow-y-auto break-words">
            {messageText}
          </div>
          <div className="flex justify-end text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
            Format Resmi Otomatis B2B JajanBuah
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer text-center"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks Invoice'}</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer text-center"
            >
              Tutup
            </button>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleSendAction}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors text-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Buka Chat WA</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
