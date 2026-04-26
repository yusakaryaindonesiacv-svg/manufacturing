/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Search, Filter, Edit2, Trash2, ChevronDown, Package, Beaker } from 'lucide-react';
import { formatCurrency, formatNumber, generateId, cn } from '../lib/utils';
import { Material } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function MaterialsPage() {
  const { data, updateData, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const filteredMaterials = data.materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const buyPrice = Number(formData.get('buyPrice'));
    const conversionRate = Number(formData.get('conversionRate'));
    
    const newMaterial: Material = {
      id: editingMaterial?.id || generateId('MAT'),
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      unit: formData.get('unit') as string,
      buyUnit: formData.get('buyUnit') as string,
      conversionRate: conversionRate,
      buyPrice: buyPrice,
      pricePerUnit: buyPrice / conversionRate,
      stock: Number(formData.get('stock')) || 0,
      minStock: Number(formData.get('minStock')) || 0,
      supplierId: formData.get('supplierId') as string,
      location: formData.get('location') as string,
      lastUpdate: new Date().toISOString()
    };

    if (editingMaterial) {
      updateData({
        materials: data.materials.map(m => m.id === editingMaterial.id ? newMaterial : m)
      });
    } else {
      updateData({
        materials: [newMaterial, ...data.materials]
      });
    }
    
    setIsModalOpen(false);
    setEditingMaterial(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus bahan baku ini?')) {
      updateData({
        materials: data.materials.filter(m => m.id !== id)
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input 
            type="text" 
            placeholder="Cari bahan baku..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-bg-deep border border-border-dim rounded-none text-xs outline-none w-full sm:w-72 focus:border-brand-500 transition-all text-text-main placeholder:text-text-muted uppercase tracking-widest"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2 px-6">
            <Filter className="w-3 h-3" />
            Filter
          </button>
          <button 
            onClick={() => {
              setEditingMaterial(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <Plus className="w-3 h-3" />
            Tambah Bahan
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0F0F0F] text-[9px] text-[#555] uppercase tracking-widest border-b border-border-dim">
              <tr>
                <th className="px-6 py-4 font-normal">Nama Bahan</th>
                <th className="px-6 py-4 font-normal">Kategori</th>
                <th className="px-6 py-4 font-normal">Stok Saat Ini</th>
                <th className="px-6 py-4 font-normal">Harga Beli</th>
                <th className="px-6 py-4 font-normal">Unit Cost</th>
                <th className="px-6 py-4 font-normal text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dim">
              {filteredMaterials.map((m) => (
                <tr key={m.id} className="hover:bg-[#1A1A1A] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-[#1A1A1A] border border-border-muted text-brand-500 flex items-center justify-center">
                        <Beaker className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-text-stark uppercase tracking-wider">{m.name}</p>
                        <p className="text-[9px] text-[#555] font-mono tracking-tighter uppercase">{m.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] text-text-dim uppercase tracking-[0.1em] border border-border-muted px-2 py-0.5">
                      {m.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-[11px] font-mono",
                        m.stock <= m.minStock ? "text-[#8e3e3e]" : "text-text-main"
                      )}>
                        {formatNumber(m.stock)} {m.unit}
                      </span>
                      <span className="text-[9px] text-[#555] uppercase tracking-tighter">Min: {m.minStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px]">
                      <p className="font-medium text-text-stark font-serif italic">{formatCurrency(m.buyPrice)}</p>
                      <p className="text-[9px] text-[#555] uppercase tracking-tighter">PER {m.buyUnit}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px]">
                      <p className="font-medium text-text-stark font-serif italic">{formatCurrency(m.pricePerUnit)}</p>
                      <p className="text-[9px] text-[#555] uppercase tracking-tighter">PER {m.unit}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingMaterial(m);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-text-muted hover:text-brand-500 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 text-text-muted hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMaterials.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Beaker className="w-8 h-8" />
              </div>
              <p className="text-slate-500 text-sm">Tidak ada bahan baku yang ditemukan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tool - Simple Implementation */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-bg-card shadow-2xl overflow-hidden border border-border-dim"
            >
              <div className="p-6 border-b border-border-dim flex items-center justify-between bg-bg-side">
                <h3 className="text-xs uppercase tracking-[0.2em] text-brand-500 font-semibold">
                  {editingMaterial ? 'Edit Parameter Bahan' : 'Registrasi Bahan Baku Baru'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-stark transition-colors">&times;</button>
              </div>
              
              <form onSubmit={handleSave} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Nama Bahan</label>
                      <input name="name" defaultValue={editingMaterial?.name} placeholder="Contoh: Sodium Lauryl Sulfate" className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Kategori</label>
                      <input name="category" defaultValue={editingMaterial?.category} placeholder="Contoh: Kimia Utama" className="input-field" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Unit Beli</label>
                        <input name="buyUnit" defaultValue={editingMaterial?.buyUnit} placeholder="Contoh: kg" className="input-field" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Unit Pakai</label>
                        <input name="unit" defaultValue={editingMaterial?.unit} placeholder="Contoh: gram" className="input-field" required />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Harga Beli (Per Unit Beli)</label>
                      <input name="buyPrice" type="number" defaultValue={editingMaterial?.buyPrice} placeholder="50000" className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Isi (Beli ke Pakai)</label>
                      <input name="conversionRate" type="number" defaultValue={editingMaterial?.conversionRate || 1} placeholder="1000" className="input-field" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Stok Awal</label>
                        <input name="stock" type="number" defaultValue={editingMaterial?.stock} placeholder="0" className="input-field" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Min. Stok</label>
                        <input name="minStock" type="number" defaultValue={editingMaterial?.minStock} placeholder="100" className="input-field" required />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border-dim flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary px-8">Batal</button>
                  <button type="submit" className="btn-primary px-8">Simpan Parameter</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


