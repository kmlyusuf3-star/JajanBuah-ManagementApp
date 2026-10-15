import React, { useState } from 'react';
import { Shield, KeyRound, Eye, EyeOff, Check, X, User } from 'lucide-react';
import { UserAccount } from '../types.ts';

interface ChangeCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onSaveCredentials: (
    userId: string,
    newUsername: string,
    newPassword?: string,
    newName?: string
  ) => Promise<void>;
}

export const ChangeCredentialsModal: React.FC<ChangeCredentialsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveCredentials,
}) => {
  const [username, setUsername] = useState(currentUser.username || '');
  const [name, setName] = useState(currentUser.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim()) {
      setErrorMsg('ID / Username tidak boleh kosong.');
      return;
    }

    if (newPassword.trim()) {
      if (newPassword.length < 6) {
        setErrorMsg('Password baru minimal harus 6 karakter.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Konfirmasi password baru tidak cocok.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSaveCredentials(
        currentUser.id,
        username.trim(),
        newPassword.trim() ? newPassword.trim() : undefined,
        name.trim() ? name.trim() : undefined
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui kredensial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base font-heading truncate">
                Ubah ID & Password Super Admin
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Ubah ID login dan kata sandi akun Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* User Display Info */}
          <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex items-center space-x-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 dark:text-white truncate">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</div>
              <span className="inline-block mt-0.5 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                SUPER ADMIN
              </span>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nama Lengkap:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Pengguna"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              ID / Username Login:
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: admin.bambang"
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
              ID ini digunakan untuk login ke portal sistem.
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-1.5 mb-2">
              <KeyRound className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Ganti Kata Sandi (Opsional)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Password Baru:
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 karakter"
                    className="w-full px-3 pr-9 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Ulangi Password Baru:
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full px-3 pr-9 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 font-bold cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-transform cursor-pointer disabled:opacity-60 text-center"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
