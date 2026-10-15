import test from 'node:test';
import assert from 'node:assert/strict';
import type { FruitProduct, BundleItem } from '../types.ts';

function calculateBundleTotalWeight(items?: BundleItem[]): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((acc, it) => acc + (Number(it.weightKg) || 0), 0);
}

function formatBundleSummary(items?: BundleItem[]): string {
  if (!items || items.length === 0) return 'Tidak ada komoditas';
  return items.map((it) => `${it.fruitName} (${it.weightKg}kg)`).join(' + ');
}

test('Bundle calculation: calculates total weight of multiple fruit commodities', () => {
  const bundleItems: BundleItem[] = [
    { fruitName: 'Apel Fuji Super', weightKg: 1.5, variety: 'Super' },
    { fruitName: 'Jeruk Medan Manis', weightKg: 1.0, variety: 'Grade A' },
    { fruitName: 'Pisang Cavendish', weightKg: 1.2, variety: 'Sunpride' },
  ];

  const total = calculateBundleTotalWeight(bundleItems);
  assert.equal(Number(total.toFixed(1)), 3.7);

  const summary = formatBundleSummary(bundleItems);
  assert.equal(summary, 'Apel Fuji Super (1.5kg) + Jeruk Medan Manis (1kg) + Pisang Cavendish (1.2kg)');
});

test('Bundle validation: recognizes single fruit vs bundle product', () => {
  const singleFruit: FruitProduct = {
    id: 'prod-1',
    name: 'Mangga Harum Manis',
    category: 'Mangga Tropis',
    variety: 'Super 143',
    grade: 'Grade A',
    brix: 15,
    pricePerKg: 28000,
    unitType: 'kg',
    stockKg: 450,
    toleransiPct: 2.5,
    storageTemp: '10°C - 14°C',
    origin: 'Probolinggo',
    isActive: true,
    image: 'https://example.com/mangga.jpg',
    isBundle: false,
  };

  const bundleFruit: FruitProduct = {
    id: 'bundle-1',
    name: 'Paket Buah Sehat Keluarga 5KG',
    category: 'Paket Bundling',
    variety: 'Aneka Buah Pilihan',
    grade: 'Grade A Pilihan',
    brix: 14,
    pricePerKg: 120000,
    unitType: 'pack',
    stockKg: 20,
    toleransiPct: 2.5,
    storageTemp: '8°C - 12°C',
    origin: 'Lokal Segar',
    isActive: true,
    image: 'https://example.com/parcel.jpg',
    isBundle: true,
    bundleItems: [
      { fruitName: 'Apel Fuji', weightKg: 2.0 },
      { fruitName: 'Jeruk Medan', weightKg: 2.0 },
      { fruitName: 'Pir Century', weightKg: 1.0 },
    ],
    description: 'Paket kombinasi 3 macam buah segar kaya nutrisi',
  };

  assert.equal(singleFruit.isBundle, false);
  assert.equal(bundleFruit.isBundle, true);
  assert.equal(bundleFruit.bundleItems?.length, 3);
  assert.equal(calculateBundleTotalWeight(bundleFruit.bundleItems), 5.0);
});
