/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Search, Package, Edit2, Trash2, Box, Archive } from 'lucide-react';
import { formatCurrency, formatNumber, generateId } from '../lib/utils';
import { Packaging } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function PackagingPage() {
  const { data, updateData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Packaging | null>(null);

  const filtered = data.packaging.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const item: Packaging = {
      id: editingItem?.id || generateId('PACK'),
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      pricePerPcs: Number(formData.get('pricePerPcs')),
      stock: Number(formData.get('stock')),
      minStock: Number(formData.get('minStock')),
      supplierId: formData.get('supplierId') as string,
      description: formData.get('description') as string
    };

    if (editingItem) {
      updateData({ packaging: data.packaging.map(p => p.id === editingItem.id ? item : p) });
    } else {
      updateData({ packaging: [item, ...data.packaging] });
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Cari kemasan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-bg-deep border border-border-dim rounded-none text-xs outline-none w-full sm:w-72 focus:border-brand-500 transition-all text-text-main placeholder:text-text-muted uppercase tracking-widest"
          />
        </div>
        <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2 px-6">
          <Plus className="w-4 h-4" />
          Tambah Kemasan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.map(p => (
          <div key={p.id} className="bg-bg-card border border-border-dim p-8 flex flex-col hover:border-brand-500 transition-all group">
            <div className="w-10 h-10 bg-bg-side border border-border-muted text-brand-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Archive className="w-5 h-5" />
            </div>
            <h4 className="text-[13px] font-bold text-text-stark mb-1 uppercase tracking-wider">{p.name}</h4>
            <p className="text-[10px] text-text-muted mb-6 uppercase tracking-widest">{p.type}</p>
            
            <div className="space-y-6 mb-8">
              <div>
                <p className="text-[9px] text-[#555] uppercase font-bold tracking-widest mb-2">Inventory Stock</p>
                <p className={`text-xl font-mono ${p.stock <= p.minStock ? 'text-[#8e3e3e]' : 'text-text-stark'}`}>
                  {formatNumber(p.stock)} <span className="text-[9px] font-normal uppercase">PCS</span>
                </p>
              </div>
              <div>
                <p className="text-[9px] text-[#555] uppercase font-bold tracking-widest mb-2">Cost Rate</p>
                <p className="text-sm font-serif italic text-brand-500">{formatCurrency(p.pricePerPcs)}</p>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-border-dim flex justify-between">
              <button 
                onClick={() => { setEditingItem(p); setIsModalOpen(true); }}
                className="text-[10px] font-bold text-text-muted hover:text-brand-500 uppercase tracking-widest transition-colors"
              >
                Configure
              </button>
              <button className="text-[10px] font-bold text-text-muted hover:text-[#8e3e3e] uppercase tracking-widest transition-colors">
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-bg-card shadow-2xl overflow-hidden border border-border-dim">
               <form onSubmit={handleSave} className="p-8 space-y-8">
                 <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] text-brand-500 font-semibold mb-1">{editingItem ? 'Edit Lifecycle Packaging' : 'New Packaging Admission'}</h3>
                    <p className="text-[9px] text-[#555] uppercase tracking-widest font-bold">LENGKAPI PARAMETER KOMPONEN KEMASAN</p>
                 </div>

                 <div className="space-y-6">
                   <div>
                     <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Item Name</label>
                     <input name="name" defaultValue={editingItem?.name} className="input-field" required placeholder="CONTOH: BOTOL PET 500ML TRANSPARAN" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Categorization</label>
                     <input name="type" defaultValue={editingItem?.type} className="input-field" required placeholder="BOTOL / TUTUP / LABEL / BOX" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-2">Unit Price</label>
                        <input name="pricePerPcs" type="number" defaultValue={editingItem?.pricePerPcs} className="input-field border-brand-500/20" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Safety Stock</label>
                        <input name="minStock" type="number" defaultValue={editingItem?.minStock} className="input-field" required />
                      </div>
                   </div>
                 </div>

                 <div className="flex justify-end gap-3 pt-8 border-t border-border-dim">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary px-8">Batal</button>
                   <button type="submit" className="btn-primary px-8">Finalize & Simpan</button>
                 </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
