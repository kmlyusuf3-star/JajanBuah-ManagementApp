import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  User,
  Camera,
  Mail,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  Shield,
  Clock,
  RefreshCw,
  Scale,
  UserCheck,
} from 'lucide-react';
import { UserAccount, UserRole } from '../types.ts';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  currentRole: UserRole;
  onSaveProfile: (updatedUser: UserAccount) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
];

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [shift, setShift] = useState(currentUser.shift || 'Shift Full Day');
  const [station, setStation] = useState(currentUser.station || 'Station Timbangan A1');
  const [avatar, setAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0]);

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setUsername(currentUser.username || '');
      setPhone(currentUser.phone || '');
      setShift(currentUser.shift || 'Shift Full Day');
      setStation(currentUser.station || 'Station Timbangan A1');
      setAvatar(currentUser.avatar || PRESET_AVATARS[0]);
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, currentUser]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Silakan pilih file gambar yang valid (JPG, PNG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Nama lengkap tidak boleh kosong.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Email tidak boleh kosong.');
      return;
    }

    if (newPassword.trim()) {
      if (newPassword.length < 6) {
        setErrorMsg('Kata sandi baru minimal harus 6 karakter.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi baru tidak sama.');
        return;
      }
    }

    const updatedUser: UserAccount = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      username: username.trim() || undefined,
      phone: phone.trim() || undefined,
      shift,
      station: currentRole === 'packer' ? station : currentUser.station,
      avatar,
    };

    onSaveProfile(updatedUser);
    setSuccessMsg('Pengaturan akun berhasil disimpan!');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const getRoleBadge = () => {
    if (currentRole === 'super_admin') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center space-x-1">
          <Shield className="w-3.5 h-3.5" />
          <span>Super Admin</span>
        </span>
      );
    }
    if (currentRole === 'admin_order') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center space-x-1">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Order Admin</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
        <Scale className="w-3.5 h-3.5" />
        <span>Packer Timbangan</span>
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs shrink-0">
              <User className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base font-heading truncate">
                Pengaturan Akun & Profil Pribadi
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Ubah foto profil, kontak, kata sandi, dan preferensi kerja
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

        {/* Status / Role Info Box */}
        <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="font-bold text-slate-700 dark:text-slate-200 truncate">Peran Akun:</span>
          </div>
          <div className="shrink-0">{getRoleBadge()}</div>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profil & Data Diri</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Keamanan & Sandi</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-1.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {activeTab === 'profile' ? (
            <>
              {/* Photo Profile Section */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Foto Profil Pengguna:
                </label>
                <div className="flex items-center space-x-3.5">
                  <div className="relative group shrink-0">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-500 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer"
                      title="Ganti Foto"
                    >
                      <Camera className="w-4 h-4 mb-0.5" />
                      <span className="text-[8px] font-bold">Ubah</span>
                    </button>
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer hover:opacity-90"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatar(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)])}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center space-x-1 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Pilih avatar acak"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Acak</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Lengkap Anda"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    No. Handphone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812-3456-7890"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Email Pengguna <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email.anda@jajanbuah.id"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    ID / Username Login
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: admin.dina"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white"
                  />
                </div>
              </div>

              {/* Shift */}
              <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>Jadwal Shift Kerja:</span>
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium cursor-pointer"
                >
                  <option value="Shift Pagi (06:00 - 15:00 WIB)">Shift Pagi (06:00 - 15:00 WIB)</option>
                  <option value="Shift Siang (13:00 - 21:00 WIB)">Shift Siang (13:00 - 21:00 WIB)</option>
                  <option value="Shift Malam (21:00 - 06:00 WIB)">Shift Malam (21:00 - 06:00 WIB)</option>
                  <option value="Shift Full Day">Shift Full Day (All Operational)</option>
                </select>
              </div>
            </>
          ) : (
            /* SECURITY & PASSWORD CHANGE TAB */
            <div className="space-y-3 pt-1">
              <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <KeyRound className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Perbarui Kata Sandi Akun</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Kosongkan kolom password di bawah jika Anda tidak bermaksud mengubah kata sandi.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Kata Sandi Baru:
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="w-full px-3 pr-9 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
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

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Ulangi Kata Sandi Baru:
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Konfirmasi sandi"
                      className="w-full px-3 pr-9 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
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
          )}

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 font-bold cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-transform cursor-pointer text-center"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
