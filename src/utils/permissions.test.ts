import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasFeatureAccess,
  canManageUsers,
  canViewActivityLogs,
  canChangeBranding,
  canManageOrders,
  canManageProducts,
  canManagePrices,
} from './permissions.ts';

test('Super Admin has access to all features', () => {
  assert.equal(canManageUsers('super_admin'), true);
  assert.equal(canViewActivityLogs('super_admin'), true);
  assert.equal(canChangeBranding('super_admin'), true);
  assert.equal(canManageOrders('super_admin'), true);
  assert.equal(canManageProducts('super_admin'), true);
  assert.equal(canManagePrices('super_admin'), true);
  assert.equal(hasFeatureAccess('super_admin', 'analytics_reports'), true);
  assert.equal(hasFeatureAccess('super_admin', 'packer_workspace'), true);
  assert.equal(hasFeatureAccess('super_admin', 'tv_monitor'), true);
});

test('Order Admin is STRICTLY DENIED access to User Management', () => {
  assert.equal(canManageUsers('admin_order'), false);
  assert.equal(hasFeatureAccess('admin_order', 'user_management'), false);
});

test('Order Admin is STRICTLY DENIED access to Activity Log & Audit', () => {
  assert.equal(canViewActivityLogs('admin_order'), false);
  assert.equal(hasFeatureAccess('admin_order', 'activity_logs'), false);
});

test('Order Admin is STRICTLY DENIED access to Ubah Logo & Branding', () => {
  assert.equal(canChangeBranding('admin_order'), false);
  assert.equal(hasFeatureAccess('admin_order', 'brand_settings'), false);
});

test('Order Admin HAS FULL ACCESS to regular operational features', () => {
  assert.equal(canManageOrders('admin_order'), true);
  assert.equal(canManageProducts('admin_order'), true);
  assert.equal(canManagePrices('admin_order'), true);
  assert.equal(hasFeatureAccess('admin_order', 'dashboard_kanban'), true);
  assert.equal(hasFeatureAccess('admin_order', 'orders_list'), true);
  assert.equal(hasFeatureAccess('admin_order', 'product_catalog'), true);
  assert.equal(hasFeatureAccess('admin_order', 'analytics_reports'), true);
});

test('Packer ONLY has access to packer_workspace and NO access to other screens', () => {
  assert.equal(hasFeatureAccess('packer', 'packer_workspace'), true);
  assert.equal(hasFeatureAccess('packer', 'dashboard_kanban'), false);
  assert.equal(hasFeatureAccess('packer', 'orders_list'), false);
  assert.equal(hasFeatureAccess('packer', 'tv_monitor'), false);
  assert.equal(canManageUsers('packer'), false);
  assert.equal(canViewActivityLogs('packer'), false);
  assert.equal(canChangeBranding('packer'), false);
});

test('TV monitor has strictly limited read-only access', () => {
  assert.equal(hasFeatureAccess('tv', 'tv_monitor'), true);
  assert.equal(hasFeatureAccess('tv', 'packer_workspace'), false);
  assert.equal(canManageUsers('tv'), false);
  assert.equal(canViewActivityLogs('tv'), false);
  assert.equal(canChangeBranding('tv'), false);
});
