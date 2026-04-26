/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Search, Box, Edit2, Trash2, Tag, TrendingUp, Calculator, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatNumber, generateId, cn } from '../lib/utils';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function ProductsPage() {
  const { data, updateData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = data.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const hpp = Number(formData.get('baseHpp')) || 0;
    const sellingPrice = Number(formData.get('sellingPrice')) || 0;
    const marginNominal = sellingPrice - hpp;
    const marginPercent = hpp > 0 ? (marginNominal / hpp) * 100 : 0;
    
    const product: Product = {
      id: editingProduct?.id || generateId('PRD'),
      sku: formData.get('sku') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      unit: formData.get('unit') as string,
      netto: Number(formData.get('netto')) || 0,
      stock: Number(formData.get('stock')) || 0,
      baseHpp: hpp,
      sellingPrice: sellingPrice,
      marginPercent: marginPercent,
      marginNominal: marginNominal,
      status: (formData.get('status') as any) || 'Aktif'
    };

    if (editingProduct) {
      updateData({ products: data.products.map(p => p.id === editingProduct.id ? product : p) });
    } else {
      updateData({ products: [product, ...data.products] });
    }
    
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Cari SKU atau nama produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-bg-deep border border-border-dim rounded-none text-xs outline-none w-full sm:w-72 focus:border-brand-500 transition-all text-text-main placeholder:text-text-muted uppercase tracking-widest"
          />
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2 px-6"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk Jadi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredProducts.map(p => (
           <motion.div 
            layoutId={p.id}
            key={p.id} 
            className="bg-bg-card border border-border-dim p-8 flex flex-col hover:border-brand-500 transition-all group relative overflow-hidden"
           >
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-brand-500/10 transition-colors" />
             
             <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 bg-bg-side border border-border-dim text-brand-500 flex items-center justify-center">
                 <Box className="w-6 h-6" />
               </div>
               <div className="flex flex-col items-end">
                  <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-widest ${p.status === 'Aktif' ? 'border-[#3e8e41] text-[#3e8e41]' : 'border-text-muted text-text-muted'}`}>
                    {p.status}
                  </span>
                  <p className="text-[10px] font-mono text-[#555] mt-2 tracking-widest">{p.sku}</p>
               </div>
             </div>

             <h3 className="text-[15px] font-bold text-text-stark mb-1 uppercase tracking-wider line-clamp-1">{p.name}</h3>
             <p className="text-[10px] text-text-muted mb-8 uppercase tracking-widest">{p.category} • {p.netto} ml NT.</p>
             
             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-bg-side border border-border-dim">
                  <p className="text-[9px] text-[#555] uppercase font-bold mb-2 tracking-widest">Stok Inventory</p>
                  <p className="text-xl font-mono text-text-stark">{formatNumber(p.stock)} <span className="text-[9px] font-normal text-[#444]">{p.unit.toUpperCase()}</span></p>
                </div>
                <div className="p-4 bg-[#141414] border border-border-dim">
                  <p className="text-[9px] text-brand-500/60 uppercase font-bold mb-2 tracking-widest">Base HPP</p>
                  <p className="text-xl font-serif italic text-brand-500">{formatCurrency(p.baseHpp)}</p>
                </div>
             </div>

             <div className="flex items-center justify-between p-5 bg-bg-deep border border-border-dim mb-8">
                <div>
                   <p className="text-[9px] text-[#555] uppercase font-bold tracking-widest mb-1">MSRP / Price</p>
                   <p className="text-2xl font-serif italic text-text-stark">{formatCurrency(p.sellingPrice)}</p>
                </div>
                <div className="text-right">
                   <div className="flex items-center gap-1 text-[#3e8e41] justify-end">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-[11px] font-mono">{p.marginPercent.toFixed(1)}%</span>
                   </div>
                   <p className="text-[9px] text-[#444] uppercase mt-1 tracking-tighter">Gain: {formatCurrency(p.marginNominal)}</p>
                </div>
             </div>

             <div className="flex items-center justify-between mt-auto">
                <button 
                  onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}
                  className="text-[10px] font-bold text-text-muted hover:text-brand-500 uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Konfigurasi
                </button>
                <div className="flex gap-4">
                   <button className="text-text-muted hover:text-brand-500 transition-all">
                      <Calculator className="w-4 h-4" />
                   </button>
                   <button className="text-text-muted hover:text-[#8e3e3e] transition-all">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             </div>
           </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-bg-card shadow-2xl overflow-hidden border border-border-dim">
             <div className="p-6 border-b border-border-dim flex items-center justify-between bg-bg-side">
               <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-brand-500 font-semibold">
                  {editingProduct ? 'Update Product Profile' : 'Catalog New Master Product'}
                </h3>
                <p className="text-[9px] text-[#555] uppercase tracking-widest mt-1">LENGKAPI PARAMETER PRODUK JADI</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-stark transition-colors">&times;</button>
             </div>
             
             <form onSubmit={handleSave} className="p-8">
                <div className="grid grid-cols-2 gap-8 mb-8">
                   <div className="col-span-2">
                     <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Primary Product Name</label>
                     <input name="name" defaultValue={editingProduct?.name} className="input-field" required placeholder="CONTOH: HANDSOAP STRAWBERRY 500ML" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Unique SKU Code</label>
                     <input name="sku" defaultValue={editingProduct?.sku} className="input-field" required placeholder="HS-STB-500" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Category</label>
                     <input name="category" defaultValue={editingProduct?.category} className="input-field" required placeholder="SABUN CUCI" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Netto (ML/GR)</label>
                     <input name="netto" type="number" defaultValue={editingProduct?.netto} className="input-field" required />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Trading Unit</label>
                     <input name="unit" defaultValue={editingProduct?.unit} className="input-field" required placeholder="PCS / BOX" />
                   </div>
                </div>

                <div className="p-5 bg-bg-deep border border-border-dim mb-8 grid grid-cols-2 gap-6">
                   <div>
                      <label className="block text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-2">Calculated HPP</label>
                      <input name="baseHpp" type="number" defaultValue={editingProduct?.baseHpp} className="input-field border-brand-500/30" required />
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-2">Market Price (MSRP)</label>
                      <input name="sellingPrice" type="number" defaultValue={editingProduct?.sellingPrice} className="input-field border-brand-500/30" required />
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


