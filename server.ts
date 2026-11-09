import express, { Request, Response } from 'express';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { db, hashPassword, verifyPassword } from './server/db.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Helper: Authenticate session token
function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.authorization || (req.headers['x-session-token'] as string);
  if (!authHeader) return null;
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return null;

  const sessionStmt = db.prepare(`
    SELECT s.user_id, u.id, u.username, u.name, u.email, u.role, u.shift, u.status, u.avatar, u.phone
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > ?
  `);

  const user = sessionStmt.get(token, new Date().toISOString()) as any;
  return user || null;
}

// Log real activity
function recordActivity(actor: string, actorRole: string, action: string, details: string, category: string, ip: string = '127.0.0.1') {
  try {
    const id = `LOG-${Date.now().toString().slice(-4)}`;
    const timestamp = `${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB`;
    db.prepare(`
      INSERT INTO activity_logs (id, actor, actor_role, action, details, timestamp, ip_address, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, actor, actorRole, action, details, timestamp, ip, category);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// Create Notification helper
function createNotification(title: string, message: string, type: 'order' | 'payment' | 'packer' | 'price' | 'system' | 'user', orderId?: string, roleTarget: string = 'all') {
  try {
    const id = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = `${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
    db.prepare(`
      INSERT INTO notifications (id, title, message, timestamp, type, is_read, order_id, role_target, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, message, timestamp, type, 0, orderId || null, roleTarget, new Date().toISOString());
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

/* ==========================================================================
   AUTHENTICATION ENDPOINTS
   ========================================================================== */

// POST /api/auth/login (Universal Login for all users)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'ID Pengguna/Email dan kata sandi wajib diisi.' });
  }

  const cleanIdent = String(username).trim().toLowerCase();
  const userStmt = db.prepare(`
    SELECT * FROM users
    WHERE LOWER(username) = ? OR LOWER(email) = ?
  `);
  const user = userStmt.get(cleanIdent, cleanIdent) as any;

  if (!user) {
    return res.status(401).json({ error: 'ID Pengguna atau email tidak ditemukan dalam sistem.' });
  }

  // Validate password
  const isValid = verifyPassword(password, user.password_hash, user.salt);
  if (!isValid) {
    return res.status(401).json({ error: 'Kata sandi / Password yang Anda masukkan salah.' });
  }

  // Validate status
  if (user.status === 'menunggu_persetujuan' || user.status === 'pending') {
    return res.status(403).json({
      error: 'Akun Anda sedang dalam proses peninjauan oleh Super Admin. Mohon tunggu persetujuan hak akses operasional.',
      status: 'menunggu_persetujuan',
      user: {
        name: user.name,
        email: user.email,
        requestedRole: user.requested_role || user.role,
        createdAt: user.created_at,
      },
    });
  }

  if (user.status === 'nonaktif') {
    return res.status(403).json({
      error: 'Akses akun Anda telah dinonaktifkan oleh administrator. Silakan hubungi Super Admin untuk mengaktifkan kembali.',
      status: 'nonaktif',
    });
  }

  if (user.status === 'ditolak') {
    return res.status(403).json({
      error: 'Pengajuan akun Anda telah ditolak oleh administrator.',
      status: 'ditolak',
    });
  }

  // Create session token
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  db.prepare(`
    INSERT INTO sessions (token, user_id, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(token, user.id, now.toISOString(), expiresAt);

  // Update last login
  db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run('Baru saja', user.id);

  recordActivity(
    user.name,
    user.role,
    'Login Akun',
    `${user.name} (${user.role.toUpperCase()}) berhasil masuk ke sistem`,
    'user',
    req.ip || '127.0.0.1'
  );

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      shift: user.shift,
      status: user.status,
      avatar: user.avatar,
      phone: user.phone,
    },
  });
});

// POST /api/auth/register-google (Employee Registration via Google Identity)
app.post('/api/auth/register-google', (req: Request, res: Response) => {
  const { name, email, phone, requestedRole, shift, password, avatar } = req.body;
if (
  typeof name !== 'string' ||
  !name.trim() ||
  name.trim().length > 100 ||
  typeof email !== 'string' ||
  !email.trim()
) {
  return res.status(400).json({
    error: 'Nama lengkap dan email wajib diisi dengan benar.',
  });
}

const allowedRoles = ['admin_order', 'packer', 'tv'];
const cleanRequestedRole =
  typeof requestedRole === 'string'
    ? requestedRole.trim().toLowerCase()
    : 'admin_order';

if (!allowedRoles.includes(cleanRequestedRole)) {
  return res.status(400).json({
    error: 'Role pendaftaran tidak valid.',
  });
}

  const cleanEmail = String(email).trim().toLowerCase();
  const baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '');
  const cleanUsername = baseUsername || `user_${Date.now()}`;

  // Check if email already registered
  const existing = db.prepare('SELECT id, status, name, requested_role, created_at FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?').get(cleanEmail, cleanUsername) as any;
  if (existing) {
    if (existing.status === 'menunggu_persetujuan' || existing.status === 'pending') {
      return res.status(400).json({
        error: 'Email Google ini telah didaftarkan dan saat ini sedang menunggu persetujuan dari Super Admin.',
        status: 'menunggu_persetujuan',
        user: {
          name: existing.name,
          email: cleanEmail,
          requestedRole: existing.requested_role,
          createdAt: existing.created_at,
        },
      });
    }
    return res.status(400).json({ error: 'Email atau username ini sudah terdaftar sebagai pengguna aktif. Silakan masuk menggunakan formulir login.' });
  }

  if (typeof password !== 'string' || password.trim().length < 12) {
    return res.status(400).json({
      error: 'Kata sandi wajib diisi dan minimal 12 karakter.',
    });
  }

  const passToHash = password;
  const creds = hashPassword(passToHash);
  const id = `usr-reg-${Date.now()}`;
  const now = new Date().toISOString();
  const defaultAvatar = avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`;

  db.prepare(`
    INSERT INTO users (id, username, name, email, password_hash, salt, role, shift, status, avatar, phone, requested_role, created_at, last_login)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    cleanUsername,
    String(name).trim(),
    cleanEmail,
    creds.hash,
    creds.salt,
    cleanRequestedRole,
    shift || 'Shift Pagi (06:00 - 15:00 WIB)',
    'menunggu_persetujuan',
    defaultAvatar,
    phone || '',
    cleanRequestedRole,
    now,
    'Belum pernah login'
  );

  recordActivity(
    String(name).trim(),
    'Calon Karyawan',
    'Pendaftaran Akun Baru',
    `Pengajuan akun baru oleh ${name} (${cleanEmail}) untuk posisi ${cleanRequestedRole.toUpperCase()}`,    'user',
    req.ip || '127.0.0.1'
  );

  createNotification(
    'Pengajuan Akun Baru',
    `${name} mengajukan akun baru sebagai ${cleanRequestedRole.toUpperCase()}. Butuh persetujuan Super Admin.`,
    'user',
    undefined,
    'super_admin'
  );

  return res.json({
    success: true,
    message: 'Pengajuan pendaftaran akun berhasil dikirim! Akun Anda sedang menunggu persetujuan dari Super Admin.',
    registration: {
      id,
      name,
      email: cleanEmail,
      phone,
      requestedRole: cleanRequestedRole,
      shift: shift || 'Shift Pagi (06:00 - 15:00 WIB)',
      createdAt: now,
      status: 'menunggu_persetujuan',
    },
  });
});

// GET /api/auth/registration-status
app.get('/api/auth/registration-status', (req: Request, res: Response) => {
  const email = req.query.email;

  if (typeof email !== 'string' || !email.trim() || email.length > 254) {
    return res.status(400).json({ error: 'Email tidak valid.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  const user = db.prepare(`
    SELECT status, requested_role, role
    FROM users
    WHERE LOWER(email) = ? OR LOWER(username) = ?
  `).get(cleanEmail, cleanEmail) as {
    status: string;
    requested_role: string | null;
    role: string;
  } | undefined;

  if (!user) {
    return res.json({ exists: false });
  }

  return res.json({
    exists: true,
    user: {
      status: user.status,
      requestedRole: user.requested_role || user.role,
    },
  });
});

// GET /api/auth/me
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Sesi tidak valid atau telah berakhir.' });
  }
  return res.json({ user });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || (req.headers['x-session-token'] as string);
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  return res.json({ success: true });
});

// PUT /api/auth/change-credentials
app.put('/api/auth/change-credentials', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Tidak diotorisasi.' });
  }

  const { newUsername, newPassword, newName } = req.body;
  if (!newUsername && !newPassword && !newName) {
    return res.status(400).json({ error: 'Tidak ada data perubahan yang dikirim.' });
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (newName && String(newName).trim()) {
    updates.push('name = ?');
    params.push(String(newName).trim());
  }
  if (newUsername && String(newUsername).trim()) {
    const trimmed = String(newUsername).trim().toLowerCase();
    updates.push('username = ?');
    params.push(trimmed);
  }
  if (newPassword && String(newPassword).trim()) {
    const pass = String(newPassword).trim();
    if (pass.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
    }
    const creds = hashPassword(pass);
    updates.push('password_hash = ?', 'salt = ?');
    params.push(creds.hash, creds.salt);
  }

  params.push(user.id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  recordActivity(
    user.name,
    user.role,
    'Ubah Kredensial',
    `Pengguna memperbarui data profil/kredensial akun`,
    'user',
    req.ip || '127.0.0.1'
  );

  const updated = db.prepare('SELECT id, username, name, email, role, shift, status, avatar, phone FROM users WHERE id = ?').get(user.id);
  return res.json({ success: true, user: updated });
});

// GET /api/users (Kelola Pengguna - STRICTLY SUPER ADMIN ONLY)
app.get('/api/users', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);
  if (!actor || actor.role !== 'super_admin') {
    return res.status(403).json({ error: 'Akses ditolak: Kelola Pengguna hanya dapat diakses oleh Super Admin.', users: [] });
  }

  const rows = db.prepare(`
    SELECT id, username, name, email, role, shift, status, avatar, phone, requested_role, created_at, last_login
    FROM users
    ORDER BY
      CASE WHEN status = 'menunggu_persetujuan' THEN 0 ELSE 1 END,
      CASE WHEN role = 'super_admin' THEN 0 ELSE 1 END,
      rowid ASC
  `).all() as any[];

  const users = rows.map((u) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    email: u.email,
    role: u.role,
    shift: u.shift,
    status: u.status,
    avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    phone: u.phone,
    requestedRole: u.requested_role,
    lastLogin: u.last_login || 'Belum pernah login',
    createdAt: u.created_at,
  }));

  return res.json({ users });
});

// --- MULAI TAMBAHAN KODE KEAMANAN ---
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth')) return next();

  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Akses Ditolak: Anda belum login.' });
  }
  next();
});
/* ==========================================================================
   NOTIFICATIONS ENDPOINTS (ALL ROLES)
   ========================================================================== */
app.get('/api/notifications', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const rows = db.prepare(`
    SELECT id, title, message, timestamp, type, is_read, order_id,
           role_target, created_at
    FROM notifications
    WHERE role_target = 'all' OR role_target = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).all(user.role) as any[];

  const notifications = rows.map((r) => ({
    id: r.id,
    title: r.title,
    message: r.message,
    timestamp: r.timestamp,
    type: r.type,
    isRead: Boolean(r.is_read),
    orderId: r.order_id || undefined,
    roleTarget: r.role_target,
  }));

  return res.json({ notifications });
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  const result = db.prepare(`
    UPDATE notifications
    SET is_read = 1
    WHERE id = ?
      AND (role_target = 'all' OR role_target = ?)
  `).run(id, user.role);

  if (!result.changes) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  return res.json({ success: true });
});

app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.prepare(`
    UPDATE notifications
    SET is_read = 1
    WHERE role_target = 'all' OR role_target = ?
  `).run(user.role);

  return res.json({ success: true });
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
  return res.json({ success: true });
});

app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const userRole = user?.role || 'all';
  db.prepare('UPDATE notifications SET is_read = 1 WHERE role_target = "all" OR role_target = ?').run(userRole);
  return res.json({ success: true });
});

/* ==========================================================================
   PRODUCTS ENDPOINTS (Super Admin & Order Admin)
   ========================================================================== */

// GET /api/products
app.get('/api/products', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all() as any[];
  const products = rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    variety: r.variety,
    grade: r.grade,
    brix: r.brix,
    pricePerKg: r.price_per_kg,
    pricePerGram: r.price_per_gram,
    pricePerPack: r.price_per_pack,
    unitType: r.unit_type,
    stockKg: r.stock_kg,
    toleransiPct: r.toleransi_pct,
    storageTemp: r.storage_temp,
    origin: r.origin,
    isActive: Boolean(r.is_active),
    image: r.image,
    isBundle: Boolean(r.is_bundle),
    bundleItems: r.bundle_items_json ? JSON.parse(r.bundle_items_json) : [],
    description: r.description || '',
  }));
  return res.json({ products });
});

// POST /api/products
app.post('/api/products', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);

  if (!actor || !['super_admin', 'admin_order'].includes(actor.role)) {
    return res.status(403).json({
      error: 'Akses ditolak: Anda tidak memiliki izin untuk menambahkan produk.',
    });
  }

  const p = req.body;
  if (!p.name || !p.pricePerKg) {
    return res.status(400).json({ error: 'Nama produk dan harga wajib diisi.' });
  }

  const id = p.id || `prod-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const isBundleVal = p.isBundle ? 1 : 0;
  const bundleItemsJson = p.bundleItems && p.bundleItems.length > 0 ? JSON.stringify(p.bundleItems) : null;
  const descriptionVal = p.description || '';

  db.prepare(`
    INSERT INTO products (
      id, name, category, variety, grade, brix, price_per_kg, price_per_gram, price_per_pack,
      unit_type, stock_kg, toleransi_pct, storage_temp, origin, is_active, image,
      is_bundle, bundle_items_json, description, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    p.name,
    p.category || (p.isBundle ? 'Paket Bundling' : 'Buah Segar'),
    p.variety || (p.isBundle ? 'Bundling Campuran' : 'Super'),
    p.grade || 'Grade A',
    p.brix || 14,
    p.pricePerKg,
    p.pricePerGram || p.pricePerKg / 1000,
    p.pricePerPack || p.pricePerKg,
    p.unitType || (p.isBundle ? 'pack' : 'kg'),
    p.stockKg || 0,
    p.toleransiPct || 2.5,
    p.storageTemp || '10°C - 14°C',
    p.origin || 'Jawa Timur',
    p.isActive !== false ? 1 : 0,
    p.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=500&q=80',
    isBundleVal,
    bundleItemsJson,
    descriptionVal,
    createdAt
  );

  const isBundle = Boolean(p.isBundle);
  recordActivity(
    actor ? actor.name : 'Admin',
    actor ? actor.role : 'admin_order',
    isBundle ? 'Tambah Paket Bundling' : 'Tambah Produk Baru',
    isBundle
      ? `Menambahkan paket bundling: ${p.name} (${(p.bundleItems || []).length} komoditas buah, Stok: ${p.stockKg || 0} paket)`
      : `Menambahkan komoditas buah: ${p.name} (Grade: ${p.grade || 'Grade A'}, Stok: ${p.stockKg || 0}kg)`,
    'system',
    req.ip || '127.0.0.1'
  );

  createNotification(
    isBundle ? 'Paket Bundling Baru Ditambahkan' : 'Produk Baru Ditambahkan',
    isBundle
      ? `Paket bundling "${p.name}" (${(p.bundleItems || []).length} komoditas) ditambahkan ke katalog @ Rp ${Number(p.pricePerKg).toLocaleString('id-ID')}/paket.`
      : `Komoditas ${p.name} (${p.grade || 'Grade A'}) ditambahkan ke katalog @ Rp ${Number(p.pricePerKg).toLocaleString('id-ID')}/kg.`,
    'system'
  );

  return res.json({
    success: true,
    product: { ...p, id, isActive: p.isActive !== false, isBundle, bundleItems: p.bundleItems || [], description: descriptionVal },
  });
});

// PUT /api/products/:id
app.put('/api/products/:id', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);

  if (!actor || !['super_admin', 'admin_order'].includes(actor.role)) {
    return res.status(403).json({
      error: 'Akses ditolak: Anda tidak memiliki izin untuk mengubah produk.',
    });
  }

  const { id } = req.params;
  const p = req.body;
  const isBundleVal = p.isBundle ? 1 : 0;
  const bundleItemsJson = p.bundleItems && p.bundleItems.length > 0 ? JSON.stringify(p.bundleItems) : null;
  const descriptionVal = p.description || '';

  db.prepare(`
    UPDATE products SET
      name = ?, category = ?, variety = ?, grade = ?, brix = ?,
      price_per_kg = ?, price_per_gram = ?, price_per_pack = ?,
      unit_type = ?, stock_kg = ?, storage_temp = ?, origin = ?, image = ?,
      is_bundle = ?, bundle_items_json = ?, description = ?
    WHERE id = ?
  `).run(
    p.name,
    p.category,
    p.variety,
    p.grade,
    p.brix,
    p.pricePerKg,
    p.pricePerGram || p.pricePerKg / 1000,
    p.pricePerPack || p.pricePerKg,
    p.unitType || (p.isBundle ? 'pack' : 'kg'),
    p.stockKg || 0,
    p.storageTemp,
    p.origin,
    p.image,
    isBundleVal,
    bundleItemsJson,
    descriptionVal,
    id
  );


  recordActivity(
    actor ? actor.name : 'Admin',
    actor ? actor.role : 'admin_order',
    p.isBundle ? 'Edit Paket Bundling' : 'Edit Produk Buah',
    `Memperbarui data ${p.name} (Stok: ${p.stockKg})`,
    'system',
    req.ip || '127.0.0.1'
  );

  return res.json({ success: true, product: p });
});

// PATCH /api/products/:id/toggle
app.patch('/api/products/:id/toggle', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);

  if (!actor || !['super_admin', 'admin_order'].includes(actor.role)) {
    return res.status(403).json({
      error: 'Akses ditolak: Anda tidak memiliki izin untuk mengubah status produk.',
    });
  }

  const { id } = req.params;
  const current = db.prepare('SELECT is_active, name FROM products WHERE id = ?').get(id) as any;
  if (!current) return res.status(404).json({ error: 'Produk tidak ditemukan.' });

  const nextState = current.is_active ? 0 : 1;
  db.prepare('UPDATE products SET is_active = ? WHERE id = ?').run(nextState, id);

  recordActivity(
    actor ? actor.name : 'Admin',
    actor ? actor.role : 'admin_order',
    'Ubah Ketersediaan Produk',
    `Mengubah status produk ${current.name} ke ${nextState ? 'AKTIF' : 'NON-AKTIF'}`,
    'system',
    req.ip || '127.0.0.1'
  );

  return res.json({ success: true, isActive: Boolean(nextState) });
});

// DELETE /api/products/:id
app.delete('/api/products/:id', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);

  if (!actor || !['super_admin', 'admin_order'].includes(actor.role)) {
    return res.status(403).json({
      error: 'Akses ditolak: Anda tidak memiliki izin untuk menghapus produk.',
    });
  }

  const { id } = req.params;
  const current = db.prepare('SELECT name FROM products WHERE id = ?').get(id) as any;
  db.prepare('DELETE FROM products WHERE id = ?').run(id);

  recordActivity(
    actor ? actor.name : 'Admin',
    actor ? actor.role : 'admin_order',
    'Hapus Produk Buah',
    `Menghapus produk ${current?.name || id} dari katalog`,
    'system',
    req.ip || '127.0.0.1'
  );

  return res.json({ success: true });
});

/* ==========================================================================
   ORDERS ENDPOINTS (Super Admin & Order Admin)
   ========================================================================== */

function parseOrderRow(r: any) {
  return {
    id: r.id,
    customerName: r.customer_name,
    customerSegment: r.customer_segment,
    customerArea: r.customer_area,
    customerPhone: r.customer_phone,
    items: JSON.parse(r.items_json || '[]'),
    waktuMasuk: r.waktu_masuk,
    waktuMasukMinutesAgo: r.waktu_masuk_minutes_ago,
    createdAt: r.created_at,
    packerId: r.packer_id || undefined,
    packerName: r.packer_name || undefined,
    packerStation: r.packer_station || undefined,
    status: r.status,
    priorityLabel: r.priority_label || undefined,
    binLocation: r.bin_location || undefined,
    scalePhotos: r.scale_photos_json ? JSON.parse(r.scale_photos_json) : [],
    waStatus: r.wa_status || undefined,
    notes: r.notes || undefined,
    paymentProofPhoto: r.payment_proof_photo || undefined,
    paymentProofUploadedAt: r.payment_proof_uploaded_at || undefined,
    paymentStatus: r.payment_status || undefined,
    isPaid: Boolean(r.is_paid),
    paidAt: r.paid_at || undefined,
    deliveredAt: r.delivered_at || undefined,
    completedAt: r.completed_at || undefined,
    statusHistory: r.status_history_json ? JSON.parse(r.status_history_json) : [],
    paymentAdjustment: r.payment_adjustment_json ? JSON.parse(r.payment_adjustment_json) : undefined,
  };
}

// GET /api/orders
app.get('/api/orders', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);

  if (!actor || !['super_admin', 'admin_order'].includes(actor.role)) {
    return res.status(403).json({
      error: 'Akses ditolak: Anda tidak memiliki izin untuk melihat daftar pesanan.',
    });
  }

  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  const orders = rows.map(parseOrderRow);

  return res.json({ orders });
});

// POST /api/orders
app.post('/api/orders', (req: Request, res: Response) => {
  const o = req.body;
  if (!o.customerName || !o.customerArea) {
    return res.status(400).json({ error: 'Nama customer dan alamat lengkap wajib diisi.' });
  }

  const id = o.id || `#ORD-2026-08${Math.floor(100 + Math.random() * 900)}`;
  const createdAt = o.createdAt || new Date().toISOString();
  const status = o.status || (o.packerId ? 'sedang_ditimbang' : 'order_baru');

  db.prepare(`
    INSERT INTO orders (
      id, customer_name, customer_segment, customer_area, customer_phone, items_json,
      waktu_masuk, waktu_masuk_minutes_ago, created_at, packer_id, packer_name, packer_station,
      status, priority_label, bin_location, scale_photos_json, wa_status, notes,
      payment_proof_photo, payment_proof_uploaded_at, payment_status, is_paid,
      status_history_json, payment_adjustment_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    o.customerName,
    o.customerSegment || 'Pelanggan',
    o.customerArea,
    o.customerPhone || '0812-0000-0000',
    JSON.stringify(o.items || []),
    o.waktuMasuk || 'Baru saja',
    o.waktuMasukMinutesAgo || 1,
    createdAt,
    o.packerId || null,
    o.packerName || null,
    o.packerStation || null,
    status,
    o.priorityLabel || 'Reguler Pagi',
    o.binLocation || 'Aisle 02 - Palet B-01',
    JSON.stringify(o.scalePhotos || []),
    o.waStatus || 'Belum Dikirim',
    o.notes || null,
    o.paymentProofPhoto || null,
    o.paymentProofUploadedAt || null,
    o.paymentStatus || 'belum_dibayar',
    o.isPaid ? 1 : 0,
    JSON.stringify(o.statusHistory || [
      {
        status,
        statusLabel: 'Order Dibuat',
        timestamp: `${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
        actor: 'Sistem',
      },
    ]),
    JSON.stringify(o.paymentAdjustment || null)
  );

  const actor = getAuthenticatedUser(req);
  recordActivity(
    actor ? actor.name : `Customer (${o.customerName})`,
    actor ? actor.role : 'customer',
    'Buat Order Baru',
    `Membuat order ${id} untuk ${o.customerName} (${(o.items || []).length} komoditas)`,
    'order',
    req.ip || '127.0.0.1'
  );

  createNotification(
    'Pesanan Baru Masuk!',
    `Order ${id} dari ${o.customerName} (${(o.items || []).length} komoditas) masuk ke antrean gudang.`,
    'order',
    id,
    'all'
  );

  const inserted = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  return res.json({ success: true, order: parseOrderRow(inserted) });
});


// PUT /api/orders/:id
app.put('/api/orders/:id', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);

  if (!actor || !['super_admin', 'admin_order'].includes(actor.role)) {
    return res.status(403).json({
      error: 'Akses ditolak: Anda tidak memiliki izin untuk mengubah pesanan.',
    });
  }

  const { id } = req.params;
  const o = req.body;


  db.prepare(`
    UPDATE orders SET
      customer_name = ?, customer_area = ?, customer_phone = ?,
      items_json = ?, packer_id = ?, packer_name = ?, packer_station = ?
    WHERE id = ?
  `).run(
    o.customerName,
    o.customerArea,
    o.customerPhone,
    JSON.stringify(o.items || []),
    o.packerId || null,
    o.packerName || null,
    o.packerStation || null,
    id
  );


  recordActivity(
    actor ? actor.name : 'Admin',
    actor ? actor.role : 'admin_order',
    'Edit Data Order',
    `Memperbarui data pelanggan/item pada order ${id}`,
    'order',
    req.ip || '127.0.0.1'
  );

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  return res.json({ success: true, order: parseOrderRow(updated) });
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);

  if (!actor || !['super_admin', 'admin_order'].includes(actor.role)) {
    return res.status(403).json({
      error: 'Akses ditolak: Anda tidak memiliki izin untuk mengubah status pesanan.',
    });
  }

  const { id } = req.params;
  const { status, note } = req.body;
  if (!status) return res.status(400).json({ error: 'Status baru wajib disertakan.' });

  const current = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!current) return res.status(404).json({ error: 'Order tidak ditemukan.' });

  const timestamp = `${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
  const actorName = actor ? actor.name : 'Admin';

  const history = JSON.parse(current.status_history_json || '[]');
  history.push({
    status,
    statusLabel: `Beralih ke ${status.replace('_', ' ').toUpperCase()}`,
    timestamp,
    actor: actorName,
    note: note || undefined,
  });

  const isPaid = status === 'siap_dikirim' || status === 'delivered' || status === 'selesai' ? 1 : current.is_paid;
  const paidAt = status === 'siap_dikirim' && !current.paid_at ? timestamp : current.paid_at;
  const deliveredAt = status === 'delivered' && !current.delivered_at ? timestamp : current.delivered_at;
  const completedAt = status === 'selesai' && !current.completed_at ? timestamp : current.completed_at;

  db.prepare(`
    UPDATE orders SET
      status = ?, status_history_json = ?, is_paid = ?,
      paid_at = ?, delivered_at = ?, completed_at = ?
    WHERE id = ?
  `).run(status, JSON.stringify(history), isPaid, paidAt, deliveredAt, completedAt, id);

  recordActivity(
    actorName,
    actor ? actor.role : 'admin_order',
    'Ubah Status Order',
    `Mengubah status order ${id} menjadi "${status.toUpperCase()}"`,
    'order',
    req.ip || '127.0.0.1'
  );

  createNotification(
    `Order ${id}: ${status.replace('_', ' ').toUpperCase()}`,
    `Status order ${current.customer_name} beralih ke ${status.replace('_', ' ').toUpperCase()} oleh ${actorName}.`,
    'order',
    id,
    'all'
  );

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  return res.json({ success: true, order: parseOrderRow(updated) });
});

// PATCH /api/orders/:id/payment-proof
app.patch('/api/orders/:id/payment-proof', (req: Request, res: Response) => {
  const { id } = req.params;
  const { photoUrl } = req.body;
  if (!photoUrl) return res.status(400).json({ error: 'Foto bukti pembayaran wajib dilampirkan.' });

  const current = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!current) return res.status(404).json({ error: 'Order tidak ditemukan.' });

  const uploadTimestamp = `${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
  const history = JSON.parse(current.status_history_json || '[]');
  history.push({
    status: current.status,
    statusLabel: 'Bukti Pembayaran Diunggah Customer',
    timestamp: uploadTimestamp,
    actor: `Customer (${current.customer_name})`,
    note: 'Bukti transfer diunggah via portal resmi',
  });

  db.prepare(`
    UPDATE orders SET
      payment_proof_photo = ?, payment_proof_uploaded_at = ?,
      payment_status = 'menunggu_verifikasi', status_history_json = ?
    WHERE id = ?
  `).run(photoUrl, uploadTimestamp, JSON.stringify(history), id);

  recordActivity(
    `Customer (${current.customer_name})`,
    'customer',
    'Upload Bukti Pembayaran',
    `Customer mengunggah foto bukti pembayaran untuk order ${id}`,
    'order',
    req.ip || '127.0.0.1'
  );

  createNotification(
    'Bukti Pembayaran Diunggah',
    `Customer ${current.customer_name} telah mengunggah bukti transfer untuk order ${id}. Siap diverifikasi Admin.`,
    'payment',
    id,
    'all'
  );

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  return res.json({ success: true, order: parseOrderRow(updated) });
});

// PATCH /api/orders/:id/item-weight
app.patch('/api/orders/:id/item-weight', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);

  if (!actor || !['super_admin', 'admin_order', 'packer'].includes(actor.role)) {
    return res.status(403).json({
      error: 'Akses ditolak: Anda tidak memiliki izin untuk memperbarui berat buah.',
    });
  }

  const { id } = req.params;
  const { itemId, actualWeightKg } = req.body;

  const current = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!current) return res.status(404).json({ error: 'Order tidak ditemukan.' });

  const items = JSON.parse(current.items_json || '[]');
  const updatedItems = items.map((it: any) => {
    if (it.id === itemId) {
      return { ...it, actualWeightKg, isWeighed: true };
    }
    return it;
  });

  db.prepare('UPDATE orders SET items_json = ? WHERE id = ?').run(JSON.stringify(updatedItems), id);
  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  return res.json({ success: true, order: parseOrderRow(updated) });
});

// DELETE /api/orders/:id
app.delete('/api/orders/:id', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);

  if (!actor || !['super_admin', 'admin_order'].includes(actor.role)) {
    return res.status(403).json({
      error: 'Akses ditolak: Anda tidak memiliki izin untuk menghapus pesanan.',
    });
  }

  const { id } = req.params;
  const current = db.prepare('SELECT customer_name FROM orders WHERE id = ?').get(id) as any;
  db.prepare('DELETE FROM orders WHERE id = ?').run(id);

  recordActivity(
    actor ? actor.name : 'Admin',
    actor ? actor.role : 'admin_order',
    'Hapus Order Permanen',
    `Menghapus data order ${id} (${current?.customer_name || 'Customer'})`,
    'order',
    req.ip || '127.0.0.1'
  );

  return res.json({ success: true });
});

/* ==========================================================================
   PACKERS ENDPOINTS
   ========================================================================== */

// GET /api/packers
app.get('/api/packers', (_req: Request, res: Response) => {
  const packers = db.prepare('SELECT * FROM packers').all() as any[];

  const result = packers.map((p) => {
    const activeOrders = db.prepare(`
      SELECT id FROM orders
      WHERE packer_id = ? AND status IN ('order_baru', 'sedang_ditimbang', 'proses_kemas')
    `).all(p.id) as { id: string }[];

    const activeOrderIds = activeOrders.map((o) => o.id);
    const count = activeOrderIds.length;

    let statusText: 'Penuh' | 'Sisa 1 Slot' | 'Sisa 2 Slot' | 'Siap Ditugaskan' = 'Siap Ditugaskan';
    if (count >= p.capacity_max) {
      statusText = 'Penuh';
    } else if (p.capacity_max - count === 1) {
      statusText = 'Sisa 1 Slot';
    } else if (p.capacity_max - count === 2) {
      statusText = 'Sisa 2 Slot';
    }

    const completedOrders = db.prepare(`
      SELECT items_json FROM orders
      WHERE packer_id = ? AND status IN ('siap_dikirim', 'delivered', 'selesai', 'done')
    `).all(p.id) as { items_json: string }[];

    let totalWeighedKg = 0;
    completedOrders.forEach((o) => {
      try {
        const items = JSON.parse(o.items_json);
        items.forEach((it: any) => {
          totalWeighedKg += it.actualWeightKg ?? it.estimatedWeightKg ?? 0;
        });
      } catch {
        // ignore
      }
    });

    return {
      id: p.id,
      code: p.code,
      name: p.name,
      station: p.station,
      stationCode: p.station_code,
      avatar: p.avatar,
      initials: p.initials,
      status: statusText,
      capacityMax: p.capacity_max,
      activeOrderIds,
      shift: p.shift,
      certification: p.certification,
      stats: {
        totalWeighedKg: Number(totalWeighedKg.toFixed(1)),
        toleranceAccuracy: 99.2,
        avgMinutesPerOrder: 6.0,
        scaleIncidents: 0,
        ordersCompletedToday: completedOrders.length,
      },
    };
  });

  return res.json({ packers: result });
});

/* ==========================================================================
   PRICE HISTORY & PRICING ENDPOINTS
   ========================================================================== */

// GET /api/price-history
app.get('/api/price-history', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM price_history ORDER BY rowid DESC').all() as any[];
  const history = rows.map((r) => ({
    id: r.id,
    productId: r.product_id,
    productName: r.product_name,
    unit: r.unit,
    oldPrice: r.old_price,
    newPrice: r.new_price,
    reason: r.reason,
    changedBy: r.changed_by,
    timestamp: r.timestamp,
    dateStr: r.date_str,
  }));
  return res.json({ history });
});

// POST /api/price-history
app.post('/api/price-history', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);

  if (!user || !['super_admin', 'admin_order'].includes(user.role)) {
    return res.status(403).json({
      error: 'Akses ditolak: Anda tidak memiliki izin untuk mengubah harga produk.',
    });
  }

  const { productId, newPrice, unit, reason } = req.body;
  if (!productId || !newPrice || !reason) {
    return res.status(400).json({ error: 'Produk, harga baru, dan alasan perubahan wajib diisi.' });
  }

  const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as any;
  if (!prod) return res.status(404).json({ error: 'Produk tidak ditemukan.' });

  const oldPrice = prod.price_per_kg;
  const userRoleLabel = user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin_order' ? 'Order Admin' : 'Admin';
  const changedBy = user ? `${user.name} (${userRoleLabel})` : 'Admin';
  const timestamp = `${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const id = `PH-${Date.now().toString().slice(-4)}`;

  db.prepare('UPDATE products SET price_per_kg = ?, unit_type = ? WHERE id = ?').run(newPrice, unit || 'kg', productId);
  db.prepare(`
    INSERT INTO price_history (id, product_id, product_name, unit, old_price, new_price, reason, changed_by, timestamp, date_str)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, productId, prod.name, unit || 'kg', oldPrice, newPrice, reason, changedBy, timestamp, dateStr);

  recordActivity(
    user ? user.name : 'Admin',
    user ? user.role : 'admin_order',
    'Update Harga Produk',
    `Mengubah harga ${prod.name} dari Rp ${oldPrice.toLocaleString('id-ID')} menjadi Rp ${newPrice.toLocaleString('id-ID')} / ${unit || 'Kg'} (Alasan: ${reason})`,
    'price',
    req.ip || '127.0.0.1'
  );

  createNotification(
    'Perubahan Harga Komoditas',
    `${prod.name} diperbarui menjadi Rp ${Number(newPrice).toLocaleString('id-ID')}/${unit || 'Kg'} (${reason}).`,
    'price',
    undefined,
    'all'
  );

  return res.json({
    success: true,
    item: {
      id,
      productId,
      productName: prod.name,
      unit: unit || 'kg',
      oldPrice,
      newPrice,
      reason,
      changedBy,
      timestamp,
      dateStr,
    },
  });
});

/* ==========================================================================
   ACTIVITY LOGS ENDPOINT (STRICTLY SUPER ADMIN ONLY)
   ========================================================================== */
app.get('/api/activity-logs', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);
  if (!actor || actor.role !== 'super_admin') {
    return res.status(403).json({ error: 'Akses ditolak: Activity Log & Audit hanya dapat diakses oleh Super Admin.', logs: [] });
  }

  const rows = db.prepare('SELECT * FROM activity_logs ORDER BY rowid DESC LIMIT 100').all() as any[];
  const logs = rows.map((r) => ({
    id: r.id,
    actor: r.actor,
    actorRole: r.actor_role,
    action: r.action,
    details: r.details,
    timestamp: r.timestamp,
    ipAddress: r.ip_address,
    category: r.category,
  }));
  return res.json({ logs });
});

/* ==========================================================================
   USER MANAGEMENT ACTION ENDPOINTS (STRICTLY SUPER ADMIN ONLY)
   ========================================================================== */
app.patch('/api/users/:id/approve', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);
  if (!actor || actor.role !== 'super_admin') {
    return res.status(403).json({ error: 'Hanya Super Admin yang berwenang menyetujui akun.' });
  }

  const { id } = req.params;
  const { role, shift } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });

  const finalRole = role || user.requested_role || user.role || 'admin_order';
  const finalShift = shift || user.shift || 'Shift Pagi (06:00 - 15:00 WIB)';

  db.prepare(`
    UPDATE users SET
      status = 'aktif',
      role = ?,
      shift = ?
    WHERE id = ?
  `).run(finalRole, finalShift, id);

  if (finalRole === 'packer') {
    const existingPacker = db.prepare('SELECT id FROM packers WHERE id = ?').get(id);
    const initials = (user.name || 'PK').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'PK';
    const packerCount = ((db.prepare('SELECT COUNT(*) as count FROM packers').get() as any)?.count || 0) + 1;
    const pckCode = `PCK-${String(packerCount).padStart(2, '0')}`;

    if (!existingPacker) {
      db.prepare(`
        INSERT INTO packers (id, code, name, station, station_code, avatar, initials, shift, certification, capacity_max)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        pckCode,
        user.name,
        `Station Timbangan ${pckCode}`,
        `Meja Timbang ${packerCount} (Station ${String.fromCharCode(64 + packerCount)})`,
        user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        initials,
        finalShift,
        'Sertifikasi QC Fresh Fruits & Timbang Digital',
        3
      );
    }
  }

  recordActivity(
    actor.name,
    'super_admin',
    'Persetujuan Akun Karyawan',
    `Menyetujui pendaftaran ${user.name} (${user.email}) dengan peran ${finalRole.toUpperCase()} (Shift: ${finalShift})`,
    'user',
    req.ip || '127.0.0.1'
  );

  return res.json({
    success: true,
    message: `Akun ${user.name} berhasil disetujui dan telah aktif.`,
  });
});

app.patch('/api/users/:id/reject', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);
  if (!actor || actor.role !== 'super_admin') {
    return res.status(403).json({ error: 'Hanya Super Admin yang berwenang menolak pengajuan akun.' });
  }

  const { id } = req.params;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });

  if (user.username === 'admin.bambang' || user.username === 'admin.rahma') {
    return res.status(403).json({ error: 'Akun Super Admin resmi tidak dapat ditolak.' });
  }

  db.prepare("UPDATE users SET status = 'ditolak' WHERE id = ?").run(id);

  recordActivity(
    actor.name,
    'super_admin',
    'Tolak Pendaftaran Akun',
    `Menolak pengajuan akun ${user.name} (${user.email})`,
    'user',
    req.ip || '127.0.0.1'
  );

  return res.json({ success: true, message: `Pengajuan akun ${user.name} telah ditolak.` });
});

app.patch('/api/users/:id/status', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);
  if (!actor || actor.role !== 'super_admin') {
    return res.status(403).json({ error: 'Hanya Super Admin yang berwenang mengubah status akun.' });
  }

  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status baru wajib diisi.' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });

  if (user.username === 'admin.bambang' || user.username === 'admin.rahma') {
    return res.status(403).json({ error: 'Status akun Super Admin resmi terproteksi dan tidak dapat dinonaktifkan.' });
  }

  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);

  recordActivity(
    actor.name,
    'super_admin',
    'Ubah Status Akun',
    `Mengubah status akun ${user.name} (${user.username}) menjadi ${status.toUpperCase()}`,
    'user',
    req.ip || '127.0.0.1'
  );

  return res.json({ success: true, status });
});

app.patch('/api/users/:id/role', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);
  if (!actor || actor.role !== 'super_admin') {
    return res.status(403).json({ error: 'Hanya Super Admin yang berwenang mengubah peran akun.' });
  }

  const { id } = req.params;
  const { role, shift } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });

  if (user.username === 'admin.bambang' || user.username === 'admin.rahma') {
    return res.status(403).json({ error: 'Peran Super Admin resmi terproteksi dan tidak dapat diubah.' });
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (role) {
    updates.push('role = ?');
    params.push(role);
  }
  if (shift) {
    updates.push('shift = ?');
    params.push(shift);
  }

  if (updates.length > 0) {
    params.push(id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }

  if (role === 'packer') {
    const existingPacker = db.prepare('SELECT id FROM packers WHERE id = ?').get(id);
    const initials = (user.name || 'PK').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'PK';
    const packerCount = ((db.prepare('SELECT COUNT(*) as count FROM packers').get() as any)?.count || 0) + 1;
    const pckCode = `PCK-${String(packerCount).padStart(2, '0')}`;

    if (!existingPacker) {
      db.prepare(`
        INSERT INTO packers (id, code, name, station, station_code, avatar, initials, shift, certification, capacity_max)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        pckCode,
        user.name,
        `Station Timbangan ${pckCode}`,
        `Meja Timbang ${packerCount} (Station ${String.fromCharCode(64 + packerCount)})`,
        user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        initials,
        shift || user.shift || 'Shift Pagi (06:00 - 15:00 WIB)',
        'Sertifikasi QC Fresh Fruits & Timbang Digital',
        3
      );
    }
  }

  recordActivity(
    actor.name,
    'super_admin',
    'Ubah Peran Karyawan',
    `Memperbarui peran ${user.name} menjadi ${role ? role.toUpperCase() : user.role}`,
    'user',
    req.ip || '127.0.0.1'
  );

  return res.json({ success: true });
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);
  if (!actor || actor.role !== 'super_admin') {
    return res.status(403).json({ error: 'Hanya Super Admin yang berwenang menghapus akun.' });
  }

  const { id } = req.params;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });

  if (user.username === 'admin.bambang' || user.username === 'admin.rahma') {
    return res.status(403).json({ error: 'Akun Super Admin resmi terproteksi dan tidak dapat dihapus.' });
  }

  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  try {
    db.prepare('DELETE FROM packers WHERE id = ?').run(id);
  } catch {
    // ignore
  }

  recordActivity(
    actor.name,
    'super_admin',
    'Hapus Akun Pengguna',
    `Menghapus akun ${user.name} (${user.email}) dari sistem`,
    'user',
    req.ip || '127.0.0.1'
  );

  return res.json({ success: true });
});

/* ==========================================================================
   BRANDING SETTINGS ENDPOINTS (STRICTLY SUPER ADMIN ONLY FOR MUTATION)
   ========================================================================== */

app.get('/api/branding', (_req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM branding WHERE id = ?').get('main_branding') as any;
  if (!row) {
    return res.json({
      branding: {
        appName: 'JajanBuah',
        tagline: 'Fruit Operations & Fulfillment Management',
        logoUrl: '',
      },
    });
  }
  return res.json({
    branding: {
      appName: row.app_name,
      tagline: row.tagline,
      logoUrl: row.logo_url || '',
    },
  });
});

app.put('/api/branding', (req: Request, res: Response) => {
  const actor = getAuthenticatedUser(req);
  if (!actor || actor.role !== 'super_admin') {
    return res.status(403).json({ error: 'Akses ditolak: Hanya Super Admin yang berwenang mengubah logo dan branding aplikasi.' });
  }

  const { appName, tagline, logoUrl } = req.body;
  db.prepare(`
    INSERT OR REPLACE INTO branding (id, app_name, tagline, logo_url)
    VALUES (?, ?, ?, ?)
  `).run('main_branding', appName || 'JajanBuah', tagline || 'Fruit Operations & Fulfillment Management', logoUrl || '');

  recordActivity(
    actor.name,
    'super_admin',
    'Ubah Logo & Branding',
    `Super Admin memperbarui branding aplikasi: "${appName}"`,
    'system',
    req.ip || '127.0.0.1'
  );

  return res.json({
    success: true,
    branding: { appName, tagline, logoUrl },
  });
});

/* ==========================================================================
   DEV SERVER & SPA FALLBACK
   ========================================================================== */

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: {
          ignored: [
            '**/data/**',
            '**/*.db',
            '**/*.db-*',
            '**/*.sqlite*',
            '**/node_modules/**',
            '**/.git/**',
            '**/*.log',
            '**/*.tmp',
          ],
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JajanBuah Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
