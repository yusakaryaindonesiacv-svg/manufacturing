/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Search, ShoppingCart, Calendar, User, Tag, Trash2, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatNumber, generateId, formatDate, cn } from '../lib/utils';
import { Purchase, Material, Packaging } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function PurchasePage() {
  const { data, updateData } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateNew = () => {
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Simple implementation for demo
    const type = formData.get('type') as 'Bahan' | 'Kemasan';
    const itemId = formData.get('itemId') as string;
    const qty = Number(formData.get('qty'));
    const price = Number(formData.get('price'));
    
    const newPurchase: Purchase = {
      id: generateId('PUR'),
      purchaseNumber: `PUR-${new Date().getTime().toString().slice(-6)}`,
      date: new Date().toISOString(),
      supplierId: formData.get('supplierId') as string,
      type,
      items: [{
        itemId,
        name: type === 'Bahan' 
          ? data.materials.find(m => m.id === itemId)?.name || 'Bahan' 
          : data.packaging.find(k => k.id === itemId)?.name || 'Kemasan',
        qty,
        price,
        total: qty * price
      }],
      discount: 0,
      tax: 0,
      shipping: 0,
      grandTotal: qty * price,
      paymentStatus: 'Lunas',
      status: 'Diterima'
    };

    // Update stock and price
    if (type === 'Bahan') {
      const updatedMaterials = data.materials.map(m => {
        if (m.id === itemId) {
          return { 
            ...m, 
            stock: m.stock + (qty * m.conversionRate), 
            buyPrice: price, 
            pricePerUnit: price / m.conversionRate 
          };
        }
        return m;
      });
      updateData({ purchases: [newPurchase, ...data.purchases], materials: updatedMaterials });
    } else {
      const updatedPackaging = data.packaging.map(k => {
        if (k.id === itemId) {
          return { ...k, stock: k.stock + qty, pricePerPcs: price };
        }
        return k;
      });
      updateData({ purchases: [newPurchase, ...data.purchases], packaging: updatedPackaging });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Cari transaksi..."
            className="pl-9 pr-4 py-2 bg-bg-deep border border-border-dim rounded-none text-xs outline-none w-full sm:w-72 focus:border-brand-500 transition-all text-text-main placeholder:text-text-muted uppercase tracking-widest"
          />
        </div>
        <button onClick={handleCreateNew} className="btn-primary flex items-center gap-2 px-6">
          <Plus className="w-4 h-4" />
          Log Purchase Entry
        </button>
      </div>

      <div className="bg-bg-card border border-border-dim overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-bg-side border-b border-border-dim">
              <th className="px-6 py-5 text-[10px] font-bold text-[#555] uppercase tracking-[0.2em]">Manifest / Date</th>
              <th className="px-6 py-5 text-[10px] font-bold text-[#555] uppercase tracking-[0.2em]">Source / Category</th>
              <th className="px-6 py-5 text-[10px] font-bold text-[#555] uppercase tracking-[0.2em]">Procurement Detail</th>
              <th className="px-6 py-5 text-[10px] font-bold text-[#555] uppercase tracking-[0.2em]">Valuation</th>
              <th className="px-6 py-5 text-[10px] font-bold text-[#555] uppercase tracking-[0.2em] text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dim/50">
            {data.purchases.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-24 text-center text-text-muted text-[11px] uppercase tracking-widest font-mono">End of Records. No active procurement found.</td>
              </tr>
            ) : (
              data.purchases.map(p => (
                <tr key={p.id} className="hover:bg-bg-side/30 transition-colors group">
                  <td className="px-6 py-6">
                    <p className="text-[13px] font-bold text-text-stark tracking-wider uppercase group-hover:text-brand-500 transition-colors">{p.purchaseNumber}</p>
                    <p className="text-[10px] text-[#555] font-mono mt-1">{formatDate(p.date)}</p>
                  </td>
                  <td className="px-6 py-6">
                     <p className="text-[12px] font-medium text-text-stark uppercase tracking-wide">
                       {data.suppliers.find(s => s.id === p.supplierId)?.name || 'GENERAL VENDOR'}
                     </p>
                     <p className={`text-[9px] font-bold uppercase mt-1 tracking-widest ${p.type === 'Bahan' ? 'text-brand-500/70' : 'text-purple-500/70'}`}>
                       LOG: {p.type.toUpperCase()}
                     </p>
                  </td>
                  <td className="px-6 py-6 font-mono text-[11px]">
                     <div className="space-y-1.5 text-text-muted">
                        {p.items.map((item, idx) => (
                           <div key={idx} className="flex items-center gap-2">
                             <div className="w-1 h-1 bg-brand-500/50"></div>
                             <span>{item.name.toUpperCase()} <span className="text-[#444]">({item.qty} UNITS)</span></span>
                           </div>
                        ))}
                     </div>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-sm font-serif italic text-text-stark">{formatCurrency(p.grandTotal)}</p>
                    <p className="text-[9px] text-[#3e8e41] font-bold uppercase tracking-widest mt-1 opacity-70">CREDIT: {p.paymentStatus.toUpperCase()}</p>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <span className="px-3 py-1 border border-[#3e8e41]/30 text-[#3e8e41] text-[9px] font-bold uppercase tracking-[0.15em]">
                      Settled
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-bg-card shadow-2xl overflow-hidden border border-border-dim">
              <div className="p-8 border-b border-border-dim bg-bg-side">
                <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-brand-500 font-semibold mb-1 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    PROCUREMENT PROTOCOL
                  </h3>
                  <p className="text-[9px] text-[#555] uppercase tracking-widest font-bold">LENGKAPI DATA EVALUASI PEMBELIAN MATERIAL</p>
                </div>
              </div>
              <form onSubmit={handleSave} className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                   <div>
                     <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Certified Vendor</label>
                     <select name="supplierId" className="input-field" required>
                        {data.suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Inventory Class</label>
                     <select name="type" className="input-field" required>
                        <option value="Bahan">BAHAN BAKU</option>
                        <option value="Kemasan">KEMASAN JADI</option>
                     </select>
                   </div>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Asset Designation</label>
                   <select name="itemId" className="input-field" required>
                      <optgroup label="RAW MATERIALS">
                        {data.materials.map((m: any) => <option key={m.id} value={m.id}>{m.name.toUpperCase()}</option>)}
                      </optgroup>
                      <optgroup label="PACKAGING UNITS">
                        {data.packaging.map((k: any) => <option key={k.id} value={k.id}>{k.name.toUpperCase()}</option>)}
                      </optgroup>
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div>
                     <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Entry Unit Count</label>
                     <input name="qty" type="number" className="input-field border-brand-500/20" required placeholder="0" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-3">Acquisition Cost</label>
                     <input name="price" type="number" className="input-field border-brand-500/20 text-brand-500" required placeholder="0" />
                   </div>
                </div>

                <div className="pt-8 border-t border-border-dim flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary px-8">Discard</button>
                  <button type="submit" className="btn-primary px-8">Execute Entry</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


