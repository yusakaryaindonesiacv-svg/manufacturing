/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Material, Packaging, Product, Formula, Production, 
  Purchase, Supplier, User, ActivityLog, AppData
} from '../types';
import { generateId } from './utils';

const STORAGE_KEY = 'umkm_manufacturing_v2';
const GAS_URL = import.meta.env.VITE_GAS_URL;

const DEFAULT_DATA: AppData = {
  users: [
    { id: 'u1', username: 'admin', password: 'admin123', role: 'Admin', fullName: 'Administrator Utama' },
    { id: 'u2', username: 'operator', password: 'operator123', role: 'Operator Produksi', fullName: 'Budi Santoso' },
    { id: 'u3', username: 'gudang', password: 'gudang123', role: 'Gudang', fullName: 'Siti Aminah' },
    { id: 'u4', username: 'owner', password: 'owner123', role: 'Owner', fullName: 'Bapak Pemilik' },
  ],
  materials: [
    { 
      id: 'm1', name: 'Sodium Lauryl Sulfate', category: 'Kimia Utama', 
      unit: 'gram', buyUnit: 'kg', conversionRate: 1000, 
      buyPrice: 50000, pricePerUnit: 50, stock: 50000, minStock: 5000, 
      supplierId: 's1', location: 'Rak A1', lastUpdate: new Date().toISOString() 
    },
    { 
      id: 'm2', name: 'Garam Industri', category: 'Kimia Penunjang', 
      unit: 'gram', buyUnit: 'kg', conversionRate: 1000, 
      buyPrice: 15000, pricePerUnit: 15, stock: 25000, minStock: 2000, 
      supplierId: 's1', location: 'Rak A2', lastUpdate: new Date().toISOString() 
    },
    { 
      id: 'm3', name: 'Pewangi Strawberry', category: 'Aroma', 
      unit: 'ml', buyUnit: 'liter', conversionRate: 1000, 
      buyPrice: 350000, pricePerUnit: 350, stock: 5000, minStock: 500, 
      supplierId: 's2', location: 'Rak B1', lastUpdate: new Date().toISOString() 
    },
  ],
  packaging: [
    { 
      id: 'k1', name: 'Botol 500 ml', type: 'Botol', 
      pricePerPcs: 1500, stock: 1000, minStock: 100, 
      supplierId: 's2', description: 'Botol bening PET' 
    },
    { 
      id: 'k2', name: 'Tutup Botol Putih', type: 'Tutup', 
      pricePerPcs: 300, stock: 1500, minStock: 100, 
      supplierId: 's2', description: 'Tutup ulir standar' 
    },
    { 
      id: 'k3', name: 'Label Stiker Strawberry', type: 'Label', 
      pricePerPcs: 200, stock: 2000, minStock: 200, 
      supplierId: 's2', description: 'Stiker vinyl anti air' 
    },
  ],
  products: [
    { 
      id: 'p1', sku: 'HS-STB-500', name: 'Handsoap Strawberry 500 ml', 
      category: 'Sabun Cuci Tangan', unit: 'pcs', netto: 500, 
      stock: 50, baseHpp: 4500, sellingPrice: 12500, 
      marginPercent: 150, marginNominal: 8000, status: 'Aktif' 
    },
  ],
  formulas: [
    {
      id: 'f1', productId: 'p1', version: '1.0',
      items: [
        { type: 'Material', id: 'm1', name: 'Sodium Lauryl Sulfate', quantity: 50, unit: 'gram', cost: 2500 },
        { type: 'Material', id: 'm2', name: 'Garam Industri', quantity: 20, unit: 'gram', cost: 300 },
        { type: 'Material', id: 'm3', name: 'Pewangi Strawberry', quantity: 5, unit: 'ml', cost: 1750 },
        { type: 'Packaging', id: 'k1', name: 'Botol 500 ml', quantity: 1, unit: 'pcs', cost: 1500 },
        { type: 'Packaging', id: 'k2', name: 'Tutup Botol Putih', quantity: 1, unit: 'pcs', cost: 300 },
        { type: 'Packaging', id: 'k3', name: 'Label Stiker Strawberry', quantity: 1, unit: 'pcs', cost: 200 },
      ],
      laborCost: 1500, overheadCost: 1000, otherCost: 500,
      totalCost: 9550, status: 'Aktif', note: 'Formula standar',
      updatedAt: new Date().toISOString()
    }
  ],
  productions: [],
  purchases: [],
  suppliers: [
    { id: 's1', name: 'PT Kimia Berjaya', contact: 'Bpk. Anto', phone: '0812345678', address: 'Surabaya' },
    { id: 's2', name: 'CV Plastik Mandiri', contact: 'Ibu Ani', phone: '0898765432', address: 'Sidoarjo' },
  ],
  activityLogs: [],
  settings: {
    companyName: 'UMKM Mandiri Jaya',
    defaultMargin: 30,
    lowStockThreshold: 10
  }
};

export function getStorageData(): AppData {
  try {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (!dataStr || dataStr === 'undefined' || dataStr === 'null') {
      saveStorageData(DEFAULT_DATA);
      return DEFAULT_DATA;
    }
    
    const data = JSON.parse(dataStr) as AppData;
    
    // Ensure we always have the minimum required structure
    if (!data || typeof data !== 'object') {
      saveStorageData(DEFAULT_DATA);
      return DEFAULT_DATA;
    }

    // Ensure we always have at least the default admin if users is missing or empty
    if (!data.users || !Array.isArray(data.users) || data.users.length === 0) {
      data.users = DEFAULT_DATA.users;
      saveStorageData(data);
    }
    
    return data;
  } catch (error) {
    console.error('Corruption in LocalStorage detected, resetting...', error);
    saveStorageData(DEFAULT_DATA);
    return DEFAULT_DATA;
  }
}

export function saveStorageData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Sinkronisasi data ke Google Apps Script (Cloud)
 */
export async function syncToCloud(data: AppData): Promise<boolean> {
  if (!GAS_URL) {
    console.warn('VITE_GAS_URL tidak dikonfigurasi. Lewati sinkronisasi awan.');
    return false;
  }

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors', // Penting untuk GAS jika tidak menggunakan library khusus
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'saveAll',
        data: data
      })
    });
    
    // Karena mode: 'no-cors', kita tidak bisa membaca response body, 
    // tapi fetch akan berhasil terkirim ke GAS redirect server.
    return true;
  } catch (error) {
    console.error('Gagal sinkronisasi ke Cloud:', error);
    return false;
  }
}

/**
 * Ambil data dari Google Sheets (Cloud)
 */
export async function fetchFromCloud(): Promise<AppData | null> {
  if (!GAS_URL) return null;

  try {
    const response = await fetch(`${GAS_URL}?action=getAll`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const cloudData = await response.json();
    if (cloudData.error) {
      console.error('GAS Error:', cloudData.error);
      return null;
    }
    
    // Merge or Overwrite local with cloud
    // Di sini kita overwrite untuk konsistensi database tunggal
    saveStorageData(cloudData);
    return cloudData;
  } catch (error) {
    console.error('Gagal mengambil data dari Cloud:', error);
    return null;
  }
}

export function logActivity(userId: string, username: string, action: string, module: string, details: string) {
  const data = getStorageData();
  const newLog: ActivityLog = {
    id: generateId('LOG'),
    timestamp: new Date().toISOString(),
    userId,
    username,
    action,
    module,
    details
  };
  data.activityLogs.unshift(newLog);
  // Keep only last 100 logs
  data.activityLogs = data.activityLogs.slice(0, 100);
  saveStorageData(data);
}
