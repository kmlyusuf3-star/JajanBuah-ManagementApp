import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'jajanbuah.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL,
    shift TEXT,
    status TEXT NOT NULL DEFAULT 'aktif',
    avatar TEXT,
    phone TEXT,
    requested_role TEXT,
    created_at TEXT NOT NULL,
    last_login TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    variety TEXT NOT NULL,
    grade TEXT NOT NULL,
    brix REAL NOT NULL,
    price_per_kg REAL NOT NULL,
    price_per_gram REAL,
    price_per_pack REAL,
    unit_type TEXT NOT NULL DEFAULT 'kg',
    stock_kg REAL NOT NULL DEFAULT 0,
    toleransi_pct REAL NOT NULL DEFAULT 2.5,
    storage_temp TEXT NOT NULL,
    origin TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    image TEXT NOT NULL,
    is_bundle INTEGER NOT NULL DEFAULT 0,
    bundle_items_json TEXT,
    description TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS packers (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    station TEXT NOT NULL,
    station_code TEXT NOT NULL,
    avatar TEXT NOT NULL,
    initials TEXT NOT NULL,
    shift TEXT NOT NULL,
    certification TEXT NOT NULL,
    capacity_max INTEGER NOT NULL DEFAULT 3
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_segment TEXT NOT NULL,
    customer_area TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    items_json TEXT NOT NULL,
    waktu_masuk TEXT NOT NULL,
    waktu_masuk_minutes_ago INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    packer_id TEXT,
    packer_name TEXT,
    packer_station TEXT,
    status TEXT NOT NULL,
    priority_label TEXT,
    bin_location TEXT,
    scale_photos_json TEXT,
    wa_status TEXT,
    notes TEXT,
    payment_proof_photo TEXT,
    payment_proof_uploaded_at TEXT,
    payment_status TEXT,
    is_paid INTEGER DEFAULT 0,
    paid_at TEXT,
    delivered_at TEXT,
    completed_at TEXT,
    status_history_json TEXT,
    payment_adjustment_json TEXT
  );

  CREATE TABLE IF NOT EXISTS price_history (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    old_price REAL NOT NULL,
    new_price REAL NOT NULL,
    reason TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    date_str TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    actor TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    category TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS branding (
    id TEXT PRIMARY KEY,
    app_name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    logo_url TEXT
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    order_id TEXT,
    role_target TEXT DEFAULT 'all',
    created_at TEXT NOT NULL
  );
`);

// Password Hashing Utilities
export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const testHash = crypto.scryptSync(password, salt, 64);
    const storedHash = Buffer.from(hash, 'hex');
    return crypto.timingSafeEqual(storedHash, testHash);
  } catch {
    return false;
  }
}

// Ensure column requested_role exists
try {
  db.exec('ALTER TABLE users ADD COLUMN requested_role TEXT;');
} catch {
  // Column already exists
}

// Ensure bundle columns exist on products table
try {
  db.exec('ALTER TABLE products ADD COLUMN is_bundle INTEGER NOT NULL DEFAULT 0;');
} catch {
  // Already exists
}
try {
  db.exec('ALTER TABLE products ADD COLUMN bundle_items_json TEXT;');
} catch {
  // Already exists
}
try {
  db.exec('ALTER TABLE products ADD COLUMN description TEXT;');
} catch {
  // Already exists
}

// Ensure Super Admin & TV Monitor accounts exist and are provisioned
export function seedInitialData() {
  const countUsersStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const userCount = (countUsersStmt.get() as { count: number }).count;

  if (userCount === 0) {
    const defaultBambangPass = process.env.ADMIN_BAMBANG_PASSWORD || 'SuperAdmin123!';
    const defaultRahmaPass = process.env.ADMIN_RAHMA_PASSWORD || 'FruitFlow2026!';
    const defaultOrderPass = process.env.ADMIN_ORDER_PASSWORD || 'OrderAdmin2026!';
    const defaultTvPass = process.env.TV_GUDANG_PASSWORD || 'MonitorGudang2026!';
    const defaultPackerPass = process.env.PACKER_BUDI_PASSWORD || 'Packer2026!';

    const bambangCreds = hashPassword(defaultBambangPass);
    const rahmaCreds = hashPassword(defaultRahmaPass);
    const orderCreds = hashPassword(defaultOrderPass);
    const tvCreds = hashPassword(defaultTvPass);
    const packerCreds = hashPassword(defaultPackerPass);

    const insertUserStmt = db.prepare(`
      INSERT INTO users (id, username, name, email, password_hash, salt, role, shift, status, avatar, phone, requested_role, created_at, last_login)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUserStmt.run(
      'usr-super-1',
      'admin.bambang',
      'Bambang Wijaya',
      'bambang.superadmin@jajanbuah.id',
      bambangCreds.hash,
      bambangCreds.salt,
      'super_admin',
      'Shift Full Day',
      'aktif',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      '0812-8899-1001',
      'super_admin',
      new Date().toISOString(),
      'Baru saja'
    );

    insertUserStmt.run(
      'usr-super-2',
      'admin.rahma',
      'Siti Rahmawati',
      'rahma.superadmin@jajanbuah.id',
      rahmaCreds.hash,
      rahmaCreds.salt,
      'super_admin',
      'Shift Full Day',
      'aktif',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      '0813-7722-3344',
      'super_admin',
      new Date().toISOString(),
      'Baru saja'
    );

    insertUserStmt.run(
      'usr-order-1',
      'admin.order',
      'Dina Maharani',
      'dina.orderadmin@jajanbuah.id',
      orderCreds.hash,
      orderCreds.salt,
      'admin_order',
      'Shift Pagi (06:00 - 15:00 WIB)',
      'aktif',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      '0812-3344-5566',
      'admin_order',
      new Date().toISOString(),
      'Baru saja'
    );

    insertUserStmt.run(
      'usr-tv-gudang',
      'tv.gudang',
      'TV Monitor Gudang Fresh Fruits',
      'tv.gudang@jajanbuah.id',
      tvCreds.hash,
      tvCreds.salt,
      'tv',
      'Display 24 Jam',
      'aktif',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
      '0812-9900-8800',
      'tv',
      new Date().toISOString(),
      'Baru saja'
    );

    insertUserStmt.run(
      'packer-1',
      'packer.budi',
      'Budi Santoso',
      'budi.packer@jajanbuah.id',
      packerCreds.hash,
      packerCreds.salt,
      'packer',
      'Shift Pagi (06:00 - 15:00 WIB)',
      'aktif',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      '0812-5566-7788',
      'packer',
      new Date().toISOString(),
      'Baru saja'
    );
  } else {
    // Check if packer.budi exists for Packer testing
    const checkPacker = db.prepare('SELECT id FROM users WHERE username = ?').get('packer.budi');
    if (!checkPacker) {
      const defaultPackerPass = process.env.PACKER_BUDI_PASSWORD || 'Packer2026!';
      const packerCreds = hashPassword(defaultPackerPass);
      db.prepare(`
        INSERT INTO users (id, username, name, email, password_hash, salt, role, shift, status, avatar, phone, requested_role, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'packer-1',
        'packer.budi',
        'Budi Santoso',
        'budi.packer@jajanbuah.id',
        packerCreds.hash,
        packerCreds.salt,
        'packer',
        'Shift Pagi (06:00 - 15:00 WIB)',
        'aktif',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        '0812-5566-7788',
        'packer',
        new Date().toISOString(),
        'Baru saja'
      );
    }
  }

  // Seed branding if empty
  const countBrandStmt = db.prepare('SELECT COUNT(*) as count FROM branding');
  const brandCount = (countBrandStmt.get() as { count: number }).count;
  if (brandCount === 0) {
    db.prepare('INSERT INTO branding (id, app_name, tagline, logo_url) VALUES (?, ?, ?, ?)').run(
      'main_branding',
      'JajanBuah',
      'Fruit Operations & Fulfillment Management',
      ''
    );
  }

  // Seed default products if empty
  const countProdStmt = db.prepare('SELECT COUNT(*) as count FROM products');
  const prodCount = (countProdStmt.get() as { count: number }).count;
  if (prodCount === 0) {
    const insertProd = db.prepare(`
      INSERT INTO products (
        id, name, category, variety, grade, brix, price_per_kg, price_per_gram, price_per_pack,
        unit_type, stock_kg, toleransi_pct, storage_temp, origin, is_active, image, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const nowIso = new Date().toISOString();
    insertProd.run(
      'prod-1',
      'Mangga Harum Manis Probolinggo',
      'Mangga Tropis',
      'Super Arumanis 143',
      'Grade A Super',
      15.2,
      28000,
      28,
      70000,
      'kg',
      450,
      2.5,
      '10°C - 14°C',
      'Probolinggo, Jatim',
      1,
      'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
      nowIso
    );

    insertProd.run(
      'prod-2',
      'Melon Golden Aroma Hydro',
      'Melon & Semangka',
      'Golden Crown',
      'Grade A Super',
      14.8,
      32000,
      32,
      80000,
      'kg',
      320,
      2.5,
      '12°C - 15°C',
      'Banyuwangi, Jatim',
      1,
      'https://images.unsplash.com/photo-1571575179703-4bde4ee606b9?auto=format&fit=crop&w=600&q=80',
      nowIso
    );

    insertProd.run(
      'prod-3',
      'Semangka Inul Non Biji',
      'Melon & Semangka',
      'Inul Red Seedless',
      'Grade A',
      13.5,
      14000,
      14,
      35000,
      'kg',
      850,
      2.5,
      '10°C - 14°C',
      'Jember, Jatim',
      1,
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
      nowIso
    );

    insertProd.run(
      'prod-4',
      'Jeruk Keprok Batu 55',
      'Jeruk Segar',
      'Keprok Punten',
      'Grade A Super',
      13.8,
      26000,
      26,
      65000,
      'kg',
      290,
      2.5,
      '8°C - 12°C',
      'Kota Batu, Malang',
      1,
      'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=600&q=80',
      nowIso
    );

    insertProd.run(
      'prod-5',
      'Buah Naga Merah Super',
      'Eksotis Tropis',
      'Red Velvet F1',
      'Grade A',
      14.0,
      22000,
      22,
      55000,
      'kg',
      410,
      2.5,
      '10°C - 14°C',
      'Banyuwangi, Jatim',
      1,
      'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&w=600&q=80',
      nowIso
    );
  }

  // Seed default packers if empty
  const countPackersStmt = db.prepare('SELECT COUNT(*) as count FROM packers');
  const packerCount = (countPackersStmt.get() as { count: number }).count;
  if (packerCount === 0) {
    const insertPacker = db.prepare(`
      INSERT INTO packers (id, code, name, station, station_code, avatar, initials, shift, certification, capacity_max)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPacker.run(
      'packer-1',
      'PCK-01',
      'Budi Santoso',
      'Station Timbangan A1',
      'Meja Timbang 01 (Station A)',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      'BS',
      'Shift Pagi (06:00 - 15:00 WIB)',
      'Sertifikasi QC Fresh Fruits & Timbang Digital',
      3
    );

    insertPacker.run(
      'packer-2',
      'PCK-02',
      'Rian Hidayat',
      'Station Timbangan B1',
      'Meja Timbang 02 (Station B)',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      'RH',
      'Shift Pagi (06:00 - 15:00 WIB)',
      'Sertifikasi Grading Melon & Semangka',
      3
    );

    insertPacker.run(
      'packer-3',
      'PCK-03',
      'Dimas Permana',
      'Station Timbangan C1',
      'Meja Timbang 03 (Station C)',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      'DP',
      'Shift Siang (14:00 - 22:00 WIB)',
      'Sertifikasi Timbang & Packaging Ekspor',
      3
    );
  }

  // Seed initial notification if empty
  const countNotifs = db.prepare('SELECT COUNT(*) as count FROM notifications');
  const notifCount = (countNotifs.get() as { count: number }).count;
  if (notifCount === 0) {
    const nowTime = `${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, title, message, timestamp, type, is_read, order_id, role_target, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertNotif.run(
      'notif-1',
      'Sistem Fulfillment Aktif',
      'Sistem penimbangan digital terkalibrasi dan siap menerima pesanan masuk.',
      nowTime,
      'system',
      0,
      null,
      'all',
      new Date().toISOString()
    );
  }
}

// Run initial seed on load
seedInitialData();
