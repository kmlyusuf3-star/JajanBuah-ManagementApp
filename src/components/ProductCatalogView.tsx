import React, { useState, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Gift,
  Apple,
  Scale,
  Sparkles,
  Info,
} from 'lucide-react';
import { FruitProduct, UserRole, BundleItem } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';

const DEFAULT_FRUIT_IMAGE =
  'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=500&q=80';

const DEFAULT_BUNDLE_IMAGE =
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80';

interface ProductCatalogViewProps {
  products: FruitProduct[];
  onAddProduct: (prod: FruitProduct) => void;
  onUpdateProduct: (prod: FruitProduct) => void;
  onDeleteProductRequest: (prod: FruitProduct) => void;
  onToggleStatus: (prodId: string) => void;
  currentRole?: UserRole;
}

export const ProductCatalogView: React.FC<ProductCatalogViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProductRequest,
  onToggleStatus,
  currentRole = 'super_admin',
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'single' | 'bundle'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const isSuperAdmin = currentRole === 'super_admin';
  const isOrderAdmin = currentRole === 'admin_order';
  const canManageProducts = isSuperAdmin || isOrderAdmin;

  // Modal create/edit product state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FruitProduct | null>(null);

  // Form states
  const [productType, setProductType] = useState<'single' | 'bundle'>('single');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Melon & Semangka');
  const [variety, setVariety] = useState('');
  const [grade, setGrade] = useState('Grade A Super');
  const [brix, setBrix] = useState<number>(14);
  const [pricePerKg, setPricePerKg] = useState<number>(25000);
  const [stockKg, setStockKg] = useState<number>(100);
  const [storageTemp, setStorageTemp] = useState('10°C - 14°C');
  const [origin, setOrigin] = useState('Jawa Timur');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bundling commodities state
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([
    { fruitName: '', weightKg: 1.0, variety: '' },
    { fruitName: '', weightKg: 1.0, variety: '' },
  ]);

  // List of existing single fruit products to pick from
  const singleFruitProducts = products.filter((p) => !p.isBundle);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const singleCount = products.filter((p) => !p.isBundle).length;
  const bundleCount = products.filter((p) => p.isBundle).length;

  const filtered = products.filter((p) => {
    if (typeFilter === 'single' && p.isBundle) return false;
    if (typeFilter === 'bundle' && !p.isBundle) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (statusFilter === 'active' && !p.isActive) return false;
    if (statusFilter === 'inactive' && p.isActive) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchVariety = (p.variety || '').toLowerCase().includes(q);
      const matchOrigin = (p.origin || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchBundleItem = p.bundleItems?.some(
        (b) => b.fruitName.toLowerCase().includes(q) || (b.variety || '').toLowerCase().includes(q)
      );
      return matchName || matchVariety || matchOrigin || matchDesc || Boolean(matchBundleItem);
    }
    return true;
  });

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar yang valid (JPG, PNG, WebP).');
      return;
    }
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleOpenAdd = (type: 'single' | 'bundle' = 'single') => {
    setEditingProduct(null);
    setProductType(type);
    if (type === 'bundle') {
      setName('');
      setCategory('Paket Bundling');
      setVariety('Aneka Buah Pilihan');
      setGrade('Grade A Pilihan');
      setBrix(14);
      setPricePerKg(95000);
      setStockKg(25);
      setStorageTemp('8°C - 12°C');
      setOrigin('Lokal & Impor Segar');
      setDescription('');
      setBundleItems([
        { fruitName: singleFruitProducts[0]?.name || 'Apel Fuji Super', weightKg: 1.5, variety: 'Super' },
        { fruitName: singleFruitProducts[1]?.name || 'Jeruk Keprok Manis', weightKg: 1.0, variety: 'Manis' },
      ]);
      setImage('');
      setImageFileName('');
    } else {
      setName('');
      setCategory('Melon & Semangka');
      setVariety('Super Premium');
      setGrade('Grade A Super');
      setBrix(14);
      setPricePerKg(25000);
      setStockKg(100);
      setStorageTemp('10°C - 14°C');
      setOrigin('Jawa Timur');
      setDescription('');
      setBundleItems([]);
      setImage('');
      setImageFileName('');
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: FruitProduct) => {
    setEditingProduct(p);
    const isBundle = Boolean(p.isBundle);
    setProductType(isBundle ? 'bundle' : 'single');
    setName(p.name);
    setCategory(p.category);
    setVariety(p.variety);
    setGrade(p.grade);
    setBrix(p.brix);
    setPricePerKg(p.pricePerKg);
    setStockKg(p.stockKg);
    setStorageTemp(p.storageTemp);
    setOrigin(p.origin);
    setDescription(p.description || '');
    if (isBundle) {
      setBundleItems(
        p.bundleItems && p.bundleItems.length > 0
          ? [...p.bundleItems]
          : [{ fruitName: '', weightKg: 1.0, variety: '' }]
      );
    } else {
      setBundleItems([]);
    }
    setImage(p.image);
    setImageFileName('');
    setIsModalOpen(true);
  };

  const handleAddBundleRow = () => {
    setBundleItems((prev) => [
      ...prev,
      {
        fruitName: '',
        weightKg: 1.0,
        variety: '',
      },
    ]);
  };

  const handleRemoveBundleRow = (idx: number) => {
    if (bundleItems.length > 1) {
      setBundleItems((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleBundleItemChange = (idx: number, field: keyof BundleItem, val: any) => {
    setBundleItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const totalBundleWeight = bundleItems.reduce((acc, it) => acc + (Number(it.weightKg) || 0), 0);

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const isBundle = productType === 'bundle';
    const fallbackImg = isBundle ? DEFAULT_BUNDLE_IMAGE : DEFAULT_FRUIT_IMAGE;
    const finalImage = image.trim() || fallbackImg;

    const validBundleItems = isBundle
      ? bundleItems.filter((it) => it.fruitName.trim() !== '' && it.weightKg > 0)
      : [];

    if (isBundle && validBundleItems.length === 0) {
      alert('Silakan tambahkan minimal 1 komoditas buah ke dalam paket bundling!');
      return;
    }

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name,
        category: isBundle ? (category.trim() || 'Paket Bundling') : category,
        variety: isBundle ? (variety.trim() || 'Aneka Buah') : variety,
        grade,
        brix,
        pricePerKg,
        unitType: isBundle ? 'pack' : 'kg',
        stockKg,
        storageTemp,
        origin,
        image: finalImage,
        isBundle,
        bundleItems: validBundleItems,
        description: description.trim(),
      });
    } else {
      onAddProduct({
        id: isBundle ? `bundle-${Date.now()}` : `prod-${Date.now()}`,
        name,
        category: isBundle ? (category.trim() || 'Paket Bundling') : category,
        variety: isBundle ? (variety.trim() || 'Aneka Buah Pilihan') : variety,
        grade,
        brix,
        pricePerKg,
        unitType: isBundle ? 'pack' : 'kg',
        stockKg,
        toleransiPct: 2.5,
        storageTemp,
        origin,
        isActive: true,
        image: finalImage,
        isBundle,
        bundleItems: validBundleItems,
        description: description.trim(),
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 w-full max-w-full overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              MASTER DATA INVENTORY
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {isSuperAdmin ? 'SUPER ADMIN ACCESS' : 'ORDER ADMIN ACCESS'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading mt-0.5">
            Katalog Produk & Paket Bundling Buah
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Manajemen produk komoditas buah tunggal dan paket bundling aneka buah untuk pemenuhan pesanan pelanggan.
          </p>
        </div>

        {canManageProducts && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
            {/* Tambah Komoditas Buah */}
            <button
              type="button"
              onClick={() => handleOpenAdd('single')}
              className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-all cursor-pointer border border-slate-300 dark:border-slate-700"
              title="Tambah Komoditas Buah Satuan"
            >
              <Apple className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>+ Buah Tunggal</span>
            </button>

            {/* Tambah Paket Bundling */}
            <button
              type="button"
              onClick={() => handleOpenAdd('bundle')}
              className="inline-flex items-center space-x-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              title="Tambah Produk Paket Bundling Aneka Buah"
            >
              <Gift className="w-4 h-4 shrink-0" />
              <span>+ Paket Bundling</span>
            </button>
          </div>
        )}
      </div>

      {/* Type Tabs & Filter toolbar */}
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3 w-full max-w-full overflow-hidden">
        {/* Quick Type Selection Pills */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Semua Produk ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter('single')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer ${
              typeFilter === 'single'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Apple className="w-3.5 h-3.5 text-emerald-400" />
            <span>Buah Tunggal ({singleCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter('bundle')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer ${
              typeFilter === 'bundle'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span>Paket Bundling ({bundleCount})</span>
          </button>
        </div>

        {/* Search & Categories Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-2.5 sm:gap-3 w-full max-w-full overflow-hidden">
          <div className="relative flex-1 w-full min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama komoditas, varietas, paket bundling, isi buah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl sm:rounded-2xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 w-full md:w-auto shrink-0">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl sm:rounded-2xl text-xs font-semibold px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none truncate cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'Semua Kategori' : c}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl sm:rounded-2xl text-xs font-semibold px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none truncate cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Status: Aktif</option>
              <option value="inactive">Status: Non-Aktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Produk yang Sesuai"
          description="Katalog produk saat ini belum memiliki data yang sesuai dengan pencarian atau filter yang dipilih."
          actionButton={
            canManageProducts
              ? {
                  text: 'Tambah Produk Sekarang',
                  onClick: () => handleOpenAdd('single'),
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {filtered.map((prod) => {
            const isBundle = Boolean(prod.isBundle);
            const bundleTotalWeight = isBundle && prod.bundleItems
              ? prod.bundleItems.reduce((acc, it) => acc + (Number(it.weightKg) || 0), 0)
              : 0;

            return (
              <div
                key={prod.id}
                className={`bg-[#f8fafc] dark:bg-slate-900 rounded-3xl border transition-all overflow-hidden flex flex-col justify-between hover:shadow-md ${
                  prod.isActive
                    ? isBundle
                      ? 'border-purple-200/90 dark:border-purple-900/60 ring-1 ring-purple-400/20'
                      : 'border-slate-200/90 dark:border-slate-800'
                    : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-100/50'
                }`}
              >
                <div>
                  {/* Image Banner */}
                  <div className="relative h-36 sm:h-44 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Type & Category Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {isBundle ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-600/90 backdrop-blur-xs text-white text-[10px] font-extrabold flex items-center space-x-1 shadow-sm">
                          <Gift className="w-3 h-3 text-amber-300" />
                          <span>Paket Bundling</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                          {prod.category}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                          prod.isActive
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {prod.isActive ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className="p-3.5 sm:p-4 space-y-2.5 text-xs">
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-heading truncate">
                        {prod.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {isBundle ? prod.category : `${prod.variety} • ${prod.origin}`}
                      </div>
                    </div>

                    {/* If Bundling: Show included fruit commodities */}
                    {isBundle ? (
                      <div className="space-y-2">
                        {prod.description && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed italic">
                            "{prod.description}"
                          </p>
                        )}

                        <div className="bg-purple-50/60 dark:bg-purple-950/30 p-2.5 rounded-2xl border border-purple-200/70 dark:border-purple-900/50 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                            <span className="flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span>Komposisi Buah ({prod.bundleItems?.length || 0})</span>
                            </span>
                            <span className="text-purple-700 dark:text-purple-300 font-extrabold">
                              Est. {bundleTotalWeight.toFixed(1)} KG
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {(prod.bundleItems || []).map((it, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-[10px] font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
                              >
                                <Apple className="w-2.5 h-2.5 text-emerald-500" />
                                <span>{it.fruitName}</span>
                                <span className="text-purple-600 dark:text-purple-400 font-bold">
                                  {it.weightKg}kg
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bundle Stock Info */}
                        <div className="flex items-center justify-between text-[11px] px-1 text-slate-600 dark:text-slate-400">
                          <span>Stok Siap:</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {prod.stockKg} Paket
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Single Fruit Specs Grid */
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-2xl text-[11px]">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Grade QC:</span>
                          <div className="font-bold text-emerald-600 dark:text-emerald-400 truncate">
                            {prod.grade}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Asal Daerah:</span>
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {prod.origin}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Suhu Simpan:</span>
                          <div className="font-bold text-blue-600 dark:text-blue-400 truncate">
                            {prod.storageTemp}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Stok Ready:</span>
                          <div className="font-extrabold text-slate-900 dark:text-white truncate">
                            {prod.stockKg} KG
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price & Actions Footer */}
                <div className="p-3.5 sm:p-4 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">
                      {isBundle ? 'Harga Paket' : 'Harga Jual'}
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-heading truncate">
                      Rp {prod.pricePerKg.toLocaleString('id-ID')}
                      <span className="text-xs font-normal text-slate-400">
                        {isBundle ? ' /paket' : '/kg'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {/* Toggle Active status */}
                    {canManageProducts && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(prod.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={prod.isActive ? 'Nonaktifkan Produk' : 'Aktifkan Produk'}
                      >
                        {prod.isActive ? (
                          <ToggleRight className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    )}

                    {/* Edit Product */}
                    {canManageProducts && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors cursor-pointer"
                        title={isBundle ? 'Edit Paket Bundling' : 'Edit Spesifikasi Produk'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete Product */}
                    {canManageProducts && (
                      <button
                        type="button"
                        onClick={() => onDeleteProductRequest(prod)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                        title="Hapus dari Katalog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product / Bundle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${productType === 'bundle' ? 'bg-purple-600' : 'bg-emerald-600'}`}>
                  {productType === 'bundle' ? <Gift className="w-4 h-4 text-white" /> : <Apple className="w-4 h-4 text-white" />}
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-heading truncate">
                  {editingProduct
                    ? productType === 'bundle'
                      ? 'Edit Paket Bundling Buah'
                      : 'Edit Spesifikasi Produk Buah'
                    : productType === 'bundle'
                    ? 'Tambah Paket Bundling Baru'
                    : 'Tambah Komoditas Buah Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Switch Type Tabs (Single Fruit vs Paket Bundling) */}
            {!editingProduct && (
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setProductType('single');
                    setCategory('Melon & Semangka');
                    setPricePerKg(25000);
                  }}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    productType === 'single'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Apple className="w-4 h-4 text-emerald-500" />
                  <span>Komoditas Buah Tunggal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProductType('bundle');
                    setCategory('Paket Bundling');
                    setPricePerKg(95000);
                    if (bundleItems.length === 0) {
                      setBundleItems([
                        { fruitName: singleFruitProducts[0]?.name || 'Apel Fuji Super', weightKg: 1.5, variety: 'Super' },
                        { fruitName: singleFruitProducts[1]?.name || 'Jeruk Keprok Manis', weightKg: 1.0, variety: 'Manis' },
                      ]);
                    }
                  }}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    productType === 'bundle'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Gift className="w-4 h-4 text-amber-300" />
                  <span>Paket Bundling (Multi Buah)</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {/* Product / Bundle Name */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {productType === 'bundle' ? 'Nama Paket Bundling:' : 'Nama Buah / Komoditas:'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    productType === 'bundle'
                      ? 'Contoh: Paket Sehat Keluarga 5KG (Apel, Jeruk, Pisang)'
                      : 'Contoh: Semangka Non Biji Inul'
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-800"
                />
              </div>

              {/* BUNDLE ITEMS CONFIGURATION */}
              {productType === 'bundle' && (
                <div className="space-y-2.5 bg-purple-50/70 dark:bg-purple-950/40 p-3.5 rounded-2xl border border-purple-200 dark:border-purple-900/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-xs text-purple-950 dark:text-purple-200 uppercase tracking-wider flex items-center space-x-1.5">
                        <Gift className="w-3.5 h-3.5 text-purple-600" />
                        <span>Daftar Buah dalam Paket Ini</span>
                      </span>
                      <p className="text-[10px] text-purple-700/80 dark:text-purple-400">
                        Tentukan komoditas buah segar & estimasi gramatur per jenis buah.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddBundleRow}
                      className="px-2.5 py-1 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center space-x-1 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Buah</span>
                    </button>
                  </div>

                  {/* Dynamic Rows */}
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {bundleItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-purple-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-2"
                      >
                        {/* Fruit Selector / Input */}
                        <div className="flex-1 min-w-0">
                          <label className="text-[10px] font-bold text-slate-500 uppercase sm:hidden block mb-0.5">
                            Komoditas #{idx + 1}
                          </label>
                          {singleFruitProducts.length > 0 ? (
                            <select
                              value={item.fruitName}
                              onChange={(e) => handleBundleItemChange(idx, 'fruitName', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-700 p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-semibold cursor-pointer text-xs"
                            >
                              <option value="">-- Pilih Komoditas Buah --</option>
                              {singleFruitProducts.map((p) => (
                                <option key={p.id} value={p.name}>
                                  {p.name}
                                </option>
                              ))}
                              {item.fruitName && !singleFruitProducts.some((p) => p.name === item.fruitName) && (
                                <option value={item.fruitName}>{item.fruitName} (Kustom)</option>
                              )}
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder="Nama komoditas buah..."
                              value={item.fruitName}
                              onChange={(e) => handleBundleItemChange(idx, 'fruitName', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-700 p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-semibold text-xs"
                            />
                          )}
                        </div>

                        {/* Weight Input */}
                        <div className="w-full sm:w-28 flex items-center space-x-1 shrink-0">
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={item.weightKg}
                            onChange={(e) =>
                              handleBundleItemChange(idx, 'weightKg', parseFloat(e.target.value) || 0)
                            }
                            className="w-full bg-slate-50 dark:bg-slate-700 p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold text-center text-xs"
                          />
                          <span className="font-bold text-slate-500 text-xs">KG</span>
                        </div>

                        {/* Delete row */}
                        <button
                          type="button"
                          onClick={() => handleRemoveBundleRow(idx)}
                          disabled={bundleItems.length <= 1}
                          className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors shrink-0 cursor-pointer ${
                            bundleItems.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title="Hapus Buah Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Summary bar */}
                  <div className="flex items-center justify-between pt-1 px-1 text-xs">
                    <span className="text-purple-900 dark:text-purple-300 font-bold">
                      Total Berat Buah dalam Paket:
                    </span>
                    <span className="font-extrabold text-sm text-purple-700 dark:text-purple-300 font-heading tnum">
                      {totalBundleWeight.toFixed(1)} KG
                    </span>
                  </div>
                </div>
              )}

              {/* Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {productType === 'bundle' ? 'Harga Paket (Rp):' : 'Harga / Kg (Rp):'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {productType === 'bundle' ? 'Stok Paket Siap Kirim:' : 'Stok Gudang (Kg):'}
                  </label>
                  <input
                    type="number"
                    value={stockKg}
                    onChange={(e) => setStockKg(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              {/* Category & Variety */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Kategori:
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {productType === 'bundle' ? 'Label Kemasan / Parcel:' : 'Varietas:'}
                  </label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder={productType === 'bundle' ? 'Contoh: Keranjang Anyam Bambu / Box' : 'Contoh: Super Harum Manis'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Description (especially useful for bundle) */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Deskripsi Produk / Paket:
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    productType === 'bundle'
                      ? 'Contoh: Paket hemat buah segar pilihan keluarga untuk kebutuhan vitamin C mingguan, berisi kombinasi apel, jeruk, dan pisang segar siap saji.'
                      : 'Keterangan tambahan spesifikasi buah, kesegaran, atau masa simpan...'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* Temperature & Origin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Suhu Penyimpanan:
                  </label>
                  <input
                    type="text"
                    value={storageTemp}
                    onChange={(e) => setStorageTemp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Asal Daerah / Kebun:
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Product Photo Upload */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Foto Produk:
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {image ? (
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={image}
                        alt="Preview Foto"
                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Foto Siap Disimpan</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                          {imageFileName || 'Gambar Produk'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-2xs flex items-center space-x-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Ganti</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImage('');
                          setImageFileName('');
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-2 shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Klik untuk Upload Foto {productType === 'bundle' ? 'Paket Bundling' : 'Buah'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pilih file langsung dari galeri atau kamera HP / laptop (JPG, PNG, WebP)
                    </p>
                    <button
                      type="button"
                      className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[11px] shadow-2xs cursor-pointer"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Pilih Foto dari Galeri</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-full text-white font-bold shadow transition-all cursor-pointer text-center ${
                    productType === 'bundle' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-900 dark:bg-white dark:text-slate-900'
                  }`}
                >
                  {productType === 'bundle' ? 'Simpan Paket Bundling' : 'Simpan Produk Buah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
