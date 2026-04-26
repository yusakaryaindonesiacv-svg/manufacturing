/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Operator Produksi' | 'Gudang' | 'Owner';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  fullName: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string; // The base unit (e.g., 'gram')
  buyUnit: string; // The purchase unit (e.g., 'kg')
  conversionRate: number; // e.g., 1000 if 1kg = 1000g
  buyPrice: number; // Price per buyUnit
  pricePerUnit: number; // Calculated: buyPrice / conversionRate
  stock: number;
  minStock: number;
  supplierId: string;
  location: string;
  lastUpdate: string;
}

export interface Packaging {
  id: string;
  name: string;
  type: string;
  pricePerPcs: number;
  stock: number;
  minStock: number;
  supplierId: string;
  description: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  netto: number;
  stock: number;
  baseHpp: number; // Calculated from formula
  sellingPrice: number;
  marginPercent: number;
  marginNominal: number;
  status: 'Aktif' | 'Nonaktif';
}

export interface FormulaItem {
  type: 'Material' | 'Packaging';
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface Formula {
  id: string;
  productId: string;
  version: string;
  items: FormulaItem[];
  laborCost: number;
  overheadCost: number;
  otherCost: number;
  totalCost: number; // HPP for one batch or one unit? Usually per unit/package
  status: 'Aktif' | 'Draft';
  note: string;
  updatedAt: string;
}

export interface Production {
  id: string;
  productionNumber: string;
  date: string;
  productId: string;
  productName: string;
  formulaId: string;
  plannedQty: number;
  actualQty: number;
  goodQty: number;
  rejectQty: number;
  operatorId: string;
  status: 'Draft' | 'Proses' | 'Selesai' | 'Batal';
  totalHpp: number;
  unitHpp: number;
  notes: string;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  date: string;
  supplierId: string;
  type: 'Bahan' | 'Kemasan';
  items: {
    itemId: string;
    name: string;
    qty: number;
    price: number;
    total: number;
  }[];
  discount: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  paymentStatus: 'Lunas' | 'Hutang';
  status: 'Diterima' | 'Proses';
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
}

export interface LaborExpense {
  id: string;
  name: string;
  type: 'Hourly' | 'Daily' | 'Batch' | 'Pcs';
  rate: number;
}

export interface OverheadExpense {
  id: string;
  name: string;
  amount: number;
  period: 'Monthly' | 'Production';
  allocationMethod: 'Unit' | 'Batch' | 'Percentage';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string;
  module: string;
  details: string;
}

export interface AppData {
  users: User[];
  materials: Material[];
  packaging: Packaging[];
  products: Product[];
  formulas: Formula[];
  productions: Production[];
  purchases: Purchase[];
  suppliers: Supplier[];
  activityLogs: ActivityLog[];
  settings: any;
}
