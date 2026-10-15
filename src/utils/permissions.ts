import type { UserRole } from '../types.ts';

export type AppFeature =
  | 'user_management'      // Kelola Pengguna
  | 'activity_logs'        // Activity Log & Audit
  | 'brand_settings'       // Ubah Logo & Branding Aplikasi
  | 'dashboard_kanban'     // Kanban Board
  | 'orders_list'          // Manajemen Order List
  | 'product_catalog'      // Katalog Produk Buah
  | 'price_management'     // Manajemen Harga Komoditas
  | 'analytics_reports'    // Laporan & Analitik
  | 'packer_workspace'     // Workspace Packer Gudang
  | 'tv_monitor';          // TV Display Monitor

/**
 * Returns true if the role is allowed to access the specified feature.
 * Strict rules:
 * - Super Admin has unrestricted access to everything.
 * - Order Admin has same operational access as admin, EXCEPT:
 *   1. Kelola Pengguna (user_management) -> false
 *   2. Activity Log & Audit (activity_logs) -> false
 *   3. Ubah Logo & Branding Aplikasi (brand_settings) -> false
 * - Packer: Hanya bisa mengakses Workspace Stasiun Packer (packer_workspace) saja.
 * - TV Display: Hanya bisa mengakses TV Display Monitor (tv_monitor).
 */
export function hasFeatureAccess(role: UserRole | string | undefined, feature: AppFeature): boolean {
  if (!role) return false;

  // 1. Super Admin has unrestricted access to everything
  if (role === 'super_admin') {
    return true;
  }

  // 2. Order Admin: Same access as admin/operations, BUT STRICTLY NO ACCESS TO:
  //    - Kelola Pengguna (user_management)
  //    - Activity Log & Audit (activity_logs)
  //    - Ubah Logo & Branding Aplikasi (brand_settings)
  if (role === 'admin_order') {
    switch (feature) {
      case 'user_management':
        return false;
      case 'activity_logs':
        return false;
      case 'brand_settings':
        return false;
      case 'dashboard_kanban':
      case 'orders_list':
      case 'product_catalog':
      case 'price_management':
      case 'analytics_reports':
      case 'packer_workspace':
      case 'tv_monitor':
        return true;
      default:
        return false;
    }
  }

  // 3. Packer Gudang: HANYA BISA Menampilkan Workspace Stasiun Packer saja
  if (role === 'packer') {
    return feature === 'packer_workspace';
  }

  // 4. TV Display: read-only monitoring
  if (role === 'tv') {
    return feature === 'tv_monitor';
  }

  return false;
}

/**
 * Specifically checks if the role can manage user accounts.
 */
export function canManageUsers(role: UserRole | string | undefined): boolean {
  return hasFeatureAccess(role, 'user_management');
}

/**
 * Specifically checks if the role can view activity & audit logs.
 */
export function canViewActivityLogs(role: UserRole | string | undefined): boolean {
  return hasFeatureAccess(role, 'activity_logs');
}

/**
 * Specifically checks if the role can customize app branding and logo.
 */
export function canChangeBranding(role: UserRole | string | undefined): boolean {
  return hasFeatureAccess(role, 'brand_settings');
}

/**
 * Specifically checks if the role can manage orders.
 */
export function canManageOrders(role: UserRole | string | undefined): boolean {
  return hasFeatureAccess(role, 'orders_list') && hasFeatureAccess(role, 'dashboard_kanban');
}

/**
 * Specifically checks if the role can manage commodity products.
 */
export function canManageProducts(role: UserRole | string | undefined): boolean {
  return hasFeatureAccess(role, 'product_catalog');
}

/**
 * Specifically checks if the role can manage product pricing.
 */
export function canManagePrices(role: UserRole | string | undefined): boolean {
  return hasFeatureAccess(role, 'price_management');
}
