import React, { useState } from 'react';
import {
  KeyRound,
  Shield,
  Search,
  CheckCircle2,
  Mail,
  Phone,
  Clock,
  UserCheck,
  Trash2,
  Tv,
  Scale,
  Package,
  Check,
  X,
} from 'lucide-react';
import { UserAccount, UserRole } from '../types.ts';
import { api } from '../services/api.ts';
import { EmptyState } from './EmptyState.tsx';

interface UserManagementViewProps {
  users: UserAccount[];
  onOpenChangeCredentials?: () => void;
  onRefreshUsers?: () => void;
  showToast?: (text: string, type?: 'success' | 'warn' | 'info') => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onOpenChangeCredentials,
  onRefreshUsers,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [search, setSearch] = useState('');

  // Approval modal state
  const [approvingUser, setApprovingUser] = useState<UserAccount | null>(null);
  const [assignedRole, setAssignedRole] = useState<UserRole>('admin_order');
  const [assignedShift, setAssignedShift] = useState('Shift Pagi (06:00 - 15:00 WIB)');
  const [isProcessing, setIsProcessing] = useState(false);

  // Edit role modal state
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('admin_order');
  const [editShift, setEditShift] = useState('');

  const pendingUsers = users.filter((u) => u.status === 'menunggu_persetujuan');
  const activeUsers = users.filter((u) => u.status !== 'menunggu_persetujuan');

  const displayedList = (activeTab === 'pending' ? pendingUsers : activeUsers).filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q))
      );
    }
    return true;
  });

  const handleOpenApproveModal = (u: UserAccount) => {
    setApprovingUser(u);
    setAssignedRole((u.requestedRole as UserRole) || 'admin_order');
    setAssignedShift(u.shift || 'Shift Pagi (06:00 - 15:00 WIB)');
  };

  const handleConfirmApproval = async () => {
    if (!approvingUser) return;
    try {
      setIsProcessing(true);
      await api.approveUser(approvingUser.id, {
        role: assignedRole,
        shift: assignedShift,
      });
      showToast?.(`Akun ${approvingUser.name} berhasil disetujui sebagai ${assignedRole.toUpperCase()}!`, 'success');
      setApprovingUser(null);
      onRefreshUsers?.();
    } catch (err: any) {
      showToast?.(err.message || 'Gagal menyetujui akun.', 'warn');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (u: UserAccount) => {
    if (confirm(`Apakah Anda yakin ingin menolak pengajuan akun dari ${u.name} (${u.email})?`)) {
      try {
        await api.rejectUser(u.id);
        showToast?.(`Pengajuan ${u.name} telah ditolak.`, 'info');
        onRefreshUsers?.();
      } catch (err: any) {
        showToast?.(err.message || 'Gagal menolak akun.', 'warn');
      }
    }
  };

  const handleToggleStatus = async (u: UserAccount) => {
    if (u.username === 'admin.bambang' || u.username === 'admin.rahma') {
      showToast?.('Akun Root Super Admin terproteksi dan tidak dapat dinonaktifkan.', 'warn');
      return;
    }
    const nextStatus = u.status === 'aktif' ? 'nonaktif' : 'aktif';
    try {
      await api.updateUserStatus(u.id, nextStatus as any);
      showToast?.(`Status ${u.name} berhasil diubah menjadi ${nextStatus.toUpperCase()}.`, 'success');
      onRefreshUsers?.();
    } catch (err: any) {
      showToast?.(err.message || 'Gagal mengubah status pengguna.', 'warn');
    }
  };

  const handleOpenEditUser = (u: UserAccount) => {
    if (u.username === 'admin.bambang' || u.username === 'admin.rahma') {
      showToast?.('Akun Root Super Admin terproteksi dan tidak dapat diubah dari menu ini.', 'warn');
      return;
    }
    setEditingUser(u);
    setEditRole(u.role);
    setEditShift(u.shift || 'Shift Pagi (06:00 - 15:00 WIB)');
  };

  const handleSaveEditUser = async () => {
    if (!editingUser) return;
    try {
      setIsProcessing(true);
      await api.updateUserRole(editingUser.id, editRole, editShift);
      showToast?.(`Hak akses dan shift ${editingUser.name} berhasil diperbarui.`, 'success');
      setEditingUser(null);
      onRefreshUsers?.();
    } catch (err: any) {
      showToast?.(err.message || 'Gagal menyimpan perubahan pengguna.', 'warn');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (u: UserAccount) => {
    if (u.username === 'admin.bambang' || u.username === 'admin.rahma') {
      showToast?.('Akun Root Super Admin terproteksi dan tidak dapat dihapus.', 'warn');
      return;
    }
    if (confirm(`Hapus permanen akun ${u.name} (${u.email}) dari database?`)) {
      try {
        await api.deleteUser(u.id);
        showToast?.(`Akun ${u.name} berhasil dihapus permanen.`, 'success');
        onRefreshUsers?.();
      } catch (err: any) {
        showToast?.(err.message || 'Gagal menghapus pengguna.', 'warn');
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return {
          label: 'SUPER ADMIN (ROOT)',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800',
          icon: Shield,
        };
      case 'admin_order':
        return {
          label: 'ORDER ADMIN',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
          icon: Package,
        };
      case 'packer':
        return {
          label: 'PACKER GUDANG',
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          icon: Scale,
        };
      case 'tv':
        return {
          label: 'TV MONITOR',
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          icon: Tv,
        };
      default:
        return {
          label: role.toUpperCase(),
          color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
          icon: Shield,
        };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 font-sans w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              KEAMANAN SISTEM & OTORISASI
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
              DUAL SUPER ADMIN
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading mt-0.5">
            Manajemen Akun & Otorisasi Karyawan
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Kelola izin hak akses Super Admin, verifikasi pendaftaran karyawan via Google, dan assign stasiun kerja.
          </p>
        </div>

        {onOpenChangeCredentials && (
          <button
            type="button"
            onClick={onOpenChangeCredentials}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-transform active:scale-[0.98] cursor-pointer self-start sm:self-auto shrink-0"
            title="Ubah ID & Password Akun Super Admin Saya"
          >
            <KeyRound className="w-4 h-4" />
            <span>Ubah Kredensial Saya</span>
          </button>
        )}
      </div>

      {/* Security Status Box */}
      <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-emerald-500/10 border border-purple-200 dark:border-purple-900/60 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-1.5 sm:space-y-2">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
          <h2 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white font-heading">
            Sistem Autorisasi & Penugasan Karyawan
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
          Akun Super Admin resmi (<code className="font-mono font-bold text-purple-700 dark:text-purple-300">admin.bambang</code> & <code className="font-mono font-bold text-purple-700 dark:text-purple-300">admin.rahma</code>) memiliki wewenang penuh untuk meninjau dan menyetujui calon karyawan baru (Order Admin, Packer Gudang, dan TV Display).
        </p>
      </div>

      {/* Tabs with Horizontal Scroll on Mobile */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'active'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Daftar Akun Karyawan</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono">
            {activeUsers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Pengajuan Baru</span>
          {pendingUsers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black animate-pulse">
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={
              activeTab === 'pending'
                ? 'Cari nama atau email pendaftar baru...'
                : 'Cari nama, email, atau username akun...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl sm:rounded-2xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white"
          />
        </div>
      </div>

      {/* Content for Tabs */}
      {displayedList.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'pending'
              ? 'Tidak Ada Pengajuan Menunggu Persetujuan'
              : 'Tidak Ada Akun yang Ditemukan'
          }
          description={
            activeTab === 'pending'
              ? 'Seluruh pengajuan pendaftaran akun via Google telah diverifikasi dan diproses oleh Super Admin.'
              : 'Tidak ada data akun pengguna yang cocok dengan kriteria pencarian.'
          }
          icon={UserCheck}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {displayedList.map((u) => {
            const badge = getRoleBadge(u.role);
            const BadgeIcon = badge.icon;
            const isRootSuper = u.username === 'admin.bambang' || u.username === 'admin.rahma';
            const isPending = u.status === 'menunggu_persetujuan';

            return (
              <div
                key={u.id}
                className={`bg-[#f8fafc] dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border shadow-xs space-y-3.5 sm:space-y-4 transition-colors ${
                  isRootSuper
                    ? 'border-purple-300 dark:border-purple-800/80 ring-1 ring-purple-500/20'
                    : isPending
                    ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/20 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                          {u.name}
                        </h3>
                        {isRootSuper && (
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-200 uppercase shrink-0">
                            ROOT
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        @{u.username || u.email.split('@')[0]}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider border ${badge.color}`}
                        >
                          <BadgeIcon className="w-3 h-3 shrink-0" />
                          <span>{badge.label}</span>
                        </span>
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase animate-pulse">
                            PENDING
                          </span>
                        )}
                        {!isPending && u.status === 'aktif' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Aktif
                          </span>
                        )}
                        {!isPending && u.status === 'nonaktif' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Email:</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">WhatsApp:</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{u.phone || '-'}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Shift:</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{u.shift || 'Shift Pagi'}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                      {isPending ? 'Pengajuan:' : 'Terakhir:'}
                    </span>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{isPending ? u.createdAt?.slice(0, 10) || 'Hari Ini' : u.lastLogin}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  {isPending ? (
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleReject(u)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                      >
                        Tolak
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenApproveModal(u)}
                        className="inline-flex items-center space-x-1 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Setujui Akun</span>
                      </button>
                    </div>
                  ) : isRootSuper ? (
                    <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold flex items-center space-x-1">
                      <Shield className="w-3.5 h-3.5 shrink-0" />
                      <span>Otoritas Root Permanen (Terlindungi)</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        className={`text-xs font-bold px-3 py-1 rounded-full cursor-pointer transition-colors ${
                          u.status === 'aktif'
                            ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                        }`}
                      >
                        {u.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditUser(u)}
                          className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
                        >
                          Ubah Peran / Shift
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full cursor-pointer"
                          title="Hapus Akun Karyawan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Approve Pending User */}
      {approvingUser && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-heading truncate">
                    Setujui Akun Karyawan
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {approvingUser.name} ({approvingUser.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApprovingUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tetapkan Peran Otorisasi (Role):
                </label>
                <select
                  value={assignedRole}
                  onChange={(e) => setAssignedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                >
                  <option value="admin_order">Order Admin (Katalog Produk & Pesanan)</option>
                  <option value="packer">Packer Gudang (Stasiun Timbangan Digital)</option>
                  <option value="tv">Operator TV Monitor Gudang</option>
                  <option value="super_admin">Super Admin Tambahan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tetapkan Shift Kerja:
                </label>
                <select
                  value={assignedShift}
                  onChange={(e) => setAssignedShift(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                >
                  <option value="Shift Pagi (06:00 - 15:00 WIB)">Shift Pagi (06:00 - 15:00 WIB)</option>
                  <option value="Shift Siang (14:00 - 22:00 WIB)">Shift Siang (14:00 - 22:00 WIB)</option>
                  <option value="Shift Full Day">Shift Full Day</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                Setelah disetujui, akun akan langsung berstatus <strong>Aktif</strong> dan karyawan dapat masuk ke dashboard operasional.
              </div>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setApprovingUser(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer text-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow transition-transform active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5 text-center"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Menyetujui...' : 'Setujui & Aktifkan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Role & Shift */}
      {editingUser && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-heading truncate">
                Ubah Peran: {editingUser.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Peran (Role):
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                >
                  <option value="admin_order">Order Admin</option>
                  <option value="packer">Packer Gudang</option>
                  <option value="tv">Operator TV Monitor Gudang</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Shift Kerja:
                </label>
                <select
                  value={editShift}
                  onChange={(e) => setEditShift(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                >
                  <option value="Shift Pagi (06:00 - 15:00 WIB)">Shift Pagi (06:00 - 15:00 WIB)</option>
                  <option value="Shift Siang (14:00 - 22:00 WIB)">Shift Siang (14:00 - 22:00 WIB)</option>
                  <option value="Shift Full Day">Shift Full Day</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer text-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditUser}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow transition-transform active:scale-95 cursor-pointer text-center"
              >
                {isProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
