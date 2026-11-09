import React, { useState } from 'react';
import {
  Apple,
  KeyRound,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Shield,
  AlertCircle,
  Lock,
  Tv,
  Clock,
  RefreshCw,
  X,
  Mail,
  Phone,
  ChevronRight,
  Scale,
} from 'lucide-react';
import { AppBranding } from '../types.ts';
import { api } from '../services/api.ts';

interface LoginPageProps {
  onLogin: (identifier: string, password: string) => Promise<void>;
  onContinueAsGuestCustomer?: () => void;
  branding?: AppBranding;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onContinueAsGuestCustomer,
  branding,
}) => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pending approval modal/screen state
  const [pendingApprovalInfo, setPendingApprovalInfo] = useState<{
    name: string;
    email: string;
    requestedRole?: string;
    createdAt?: string;
  } | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusCheckMessage, setStatusCheckMessage] = useState<string | null>(null);

  // Google Registration Modal state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'admin_order' | 'packer' | 'tv'>('admin_order');
  const [regShift, setRegShift] = useState('Shift Pagi (06:00 - 15:00 WIB)');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const ident = loginIdentifier.trim();
    if (!ident) {
      setLoginError('ID Pengguna / Email wajib diisi.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Kata sandi / Password wajib diisi.');
      return;
    }

    try {
      setIsLoading(true);
      await onLogin(ident, loginPassword);
    } catch (err: any) {
      if (err.status === 'menunggu_persetujuan' || err.data?.status === 'menunggu_persetujuan') {
        const u = err.data?.user || err.user || {
          name: ident,
          email: ident.includes('@') ? ident : `${ident}@jajanbuah.id`,
        };
        setPendingApprovalInfo(u);
      } else {
        setLoginError(err.message || 'Gagal masuk. Periksa kembali ID dan kata sandi Anda.');
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleOpenGoogleRegister = () => {
    setRegError(null);
    setIsRegisterModalOpen(true);
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regName.trim()) {
      setRegError('Nama lengkap wajib diisi.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Alamat email Google / Gmail yang valid wajib diisi.');
      return;
    }

    try {
      setIsSubmittingReg(true);
      const res = await api.registerWithGoogle({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        requestedRole: regRole,
        shift: regShift,
        password: regPassword,
      });
      setIsRegisterModalOpen(false);
      setPendingApprovalInfo({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        requestedRole: regRole,
        createdAt: res.registration?.createdAt || new Date().toISOString(),
      });
    } catch (err: any) {
      setRegError(err.message || 'Gagal mengirim pendaftaran.');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const handleCheckPendingStatus = async () => {
    if (!pendingApprovalInfo?.email) return;
    setIsCheckingStatus(true);
    setStatusCheckMessage(null);
    try {
      const res = await api.checkRegistrationStatus(pendingApprovalInfo.email);
      if (res.exists && res.user) {
        if (res.user.status === 'aktif') {
          setStatusCheckMessage('Kabar baik! Akun Anda telah disetujui oleh Super Admin. Silakan kembali ke halaman login dan masuk.');
        } else if (res.user.status === 'ditolak') {
          setStatusCheckMessage('Pengajuan akun ini telah ditolak oleh Super Admin.');
        } else {
          setStatusCheckMessage('Status: Akun Anda masih dalam antrean peninjauan oleh Super Admin.');
        }
      } else {
        setStatusCheckMessage('Data pengajuan tidak ditemukan.');
      }
    } catch {
      setStatusCheckMessage('Gagal memeriksa status. Coba beberapa saat lagi.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Screen for Pending Approval
  if (pendingApprovalInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 flex flex-col justify-center py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8 text-white relative overflow-hidden font-sans">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6">
            <div className="text-center space-y-2.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg animate-pulse">
                <Clock className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Menunggu Persetujuan
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white font-heading mt-2">
                  Pengajuan Akun Karyawan
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Akun Anda telah terdaftar dan sedang dalam proses peninjauan otorisasi oleh Super Admin JajanBuah.
                </p>
              </div>
            </div>

            {/* Applicant details card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Nama Pemohon:</span>
                <span className="font-bold text-white truncate max-w-[180px]">{pendingApprovalInfo.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Email Google:</span>
                <span className="font-mono text-purple-300 font-semibold truncate max-w-[180px]">
                  {pendingApprovalInfo.email}
                </span>
              </div>
              {pendingApprovalInfo.requestedRole && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Peran Diajukan:</span>
                  <span className="font-bold text-emerald-400 uppercase">
                    {pendingApprovalInfo.requestedRole === 'admin_order'
                      ? 'Order Admin'
                      : pendingApprovalInfo.requestedRole === 'packer'
                      ? 'Packer Gudang'
                      : 'TV Monitor'}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Otorisator:</span>
                <span className="text-[11px] font-semibold text-slate-300 truncate">
                  Super Admin (Bambang / Rahma)
                </span>
              </div>
            </div>

            {/* Real-time status feedback */}
            {statusCheckMessage && (
              <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-800/80 text-indigo-200 text-xs flex items-start space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{statusCheckMessage}</span>
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleCheckPendingStatus}
                disabled={isCheckingStatus}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                <span>{isCheckingStatus ? 'Memeriksa ke Server...' : 'Periksa Status Persetujuan'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingApprovalInfo(null);
                  setStatusCheckMessage(null);
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors flex items-center justify-center cursor-pointer"
              >
                Kembali ke Halaman Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950 flex flex-col justify-center py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8 text-white relative overflow-hidden font-sans">
      {/* Decorative background glows */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Header */}
        <div className="inline-flex items-center justify-center space-x-3 mb-2.5 sm:mb-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white text-slate-950 flex items-center justify-center shadow-xl ring-4 ring-white/10 overflow-hidden shrink-0">
            {branding?.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.appName || 'Logo Brand'}
                className="w-full h-full object-cover"
              />
            ) : (
              <Apple className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
            )}
          </div>
          <div className="text-left min-w-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-heading leading-none truncate">
              {branding?.appName || 'JajanBuah'}
            </h1>
            <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase block mt-0.5">
              {branding?.tagline || 'Fulfillment & Operations'}
            </span>
          </div>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto leading-relaxed px-2">
          Portal Manajemen Gudang, Penimbangan, dan Dispatch Pesanan
        </p>
      </div>

      <div className="mt-5 sm:mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-5">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800/80">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-extrabold text-white font-heading truncate">
                Login
              </h2>
            </div>
          </div>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  ID Akun / Username / Email:
                </label>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Masukan Username atau Email akun"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">Kata Sandi (Password):</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan password' : 'Cek password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer text-center"
            >
              <span>{isLoading ? 'Memverifikasi Kredensial...' : 'Masuk'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick TV & Packer Login & Register with Google */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <button
              type="button"
              onClick={handleOpenGoogleRegister}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-sm transition-transform active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer text-center"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="truncate">Masuk dengan Google</span>
            </button>



          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Otorisasi Terproteksi:</span>
            </div>
            <p className="leading-relaxed">
              Seluruh akses operasional tunduk pada persetujuan Super Admin resmi. Akun baru melalui Google akan diverifikasi sebelum diberikan akses dashboard.
            </p>
          </div>

          {/* Link to Customer Order Portal (For Guests) */}
          {onContinueAsGuestCustomer && (
            <div className="pt-2 text-center border-t border-slate-800">
              <button
                type="button"
                onClick={onContinueAsGuestCustomer}
                className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors underline cursor-pointer"
              >
                Pelanggan? Buka Formulir Pesanan Buah Online
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Google Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-4 sm:p-7 space-y-4 sm:space-y-5 text-white max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-white text-sm sm:text-base font-heading truncate">
                    Pendaftaran Akun Karyawan
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">Verifikasi identitas via Google / Gmail</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRegistration} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Nama Lengkap Sesuai KTP / Google:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Andi Pratama"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Alamat Email (@gmail.com):
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="andipratama@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Nomor WhatsApp / HP Aktif:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="0812-xxxx-xxxx"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Peran Operasional yang Diajukan:
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="admin_order">Order Admin (Katalog Produk & Pesanan)</option>
                  <option value="packer">Packer Gudang (Stasiun Timbangan Digital)</option>
                  <option value="tv">Operator TV Monitor Gudang</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Shift Kerja yang Diajukan:
                </label>
                <select
                  value={regShift}
                  onChange={(e) => setRegShift(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Shift Pagi (06:00 - 15:00 WIB)">Shift Pagi (06:00 - 15:00 WIB)</option>
                  <option value="Shift Siang (14:00 - 22:00 WIB)">Shift Siang (14:00 - 22:00 WIB)</option>
                  <option value="Shift Full Day">Shift Full Day</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Kata Sandi untuk Login Mandiri:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Buat kata sandi minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {regError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReg}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-transform active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer text-center"
                >
                  <span>{isSubmittingReg ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Akun'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
