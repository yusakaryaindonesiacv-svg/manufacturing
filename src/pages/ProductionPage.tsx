/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  Plus, 
  Search, 
  Trash2, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  User as UserIcon,
  X,
  PlusCircle,
  PlayCircle
} from 'lucide-react';
import { formatCurrency, formatNumber, generateId, formatDate, cn } from '../lib/utils';
import { Production, Product, Formula, Material, Packaging } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function ProductionPage() {
  const { data, updateData, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProduction, setActiveProduction] = useState<Production | null>(null);

  const filteredProductions = data.productions.filter(p => 
    p.productionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai': return 'border-[#3e8e41] text-[#3e8e41]';
      case 'Proses': return 'border-brand-500 text-brand-500';
      case 'Batal': return 'border-[#8e3e3e] text-[#8e3e3e]';
      default: return 'border-text-muted text-text-muted';
    }
  };

  const handleCreateNew = () => {
    const newProduction: Production = {
      id: generateId('PRD'),
      productionNumber: `PRD-${new Date().getTime().toString().slice(-6)}`,
      date: new Date().toISOString(),
      productId: '',
      productName: '',
      formulaId: '',
      plannedQty: 0,
      actualQty: 0,
      goodQty: 0,
      rejectQty: 0,
      operatorId: user?.id || '',
      status: 'Draft',
      totalHpp: 0,
      unitHpp: 0,
      notes: ''
    };
    setActiveProduction(newProduction);
    setIsModalOpen(true);
  };

  const handleSave = (production: Production) => {
    let updatedProductions;
    const exists = data.productions.find(p => p.id === production.id);
    
    // If status changed to Selesai, reduce stocks
    if (production.status === 'Selesai' && (!exists || exists.status !== 'Selesai')) {
      const formula = data.formulas.find(f => f.id === production.formulaId);
      if (formula) {
        // 1. Update Materials and Packaging stock
        const updatedMaterials = [...data.materials];
        const updatedPackaging = [...data.packaging];
        
        formula.items.forEach(item => {
          if (item.type === 'Material') {
            const matIndex = updatedMaterials.findIndex(m => m.id === item.id);
            if (matIndex !== -1) {
              updatedMaterials[matIndex].stock -= (item.quantity * production.plannedQty);
            }
          } else {
            const packIndex = updatedPackaging.findIndex(k => k.id === item.id);
            if (packIndex !== -1) {
              updatedPackaging[packIndex].stock -= (item.quantity * production.plannedQty);
            }
          }
        });

        // 2. Update Product stock
        const updatedProducts = data.products.map(p => {
          if (p.id === production.productId) {
            return { ...p, stock: p.stock + production.goodQty };
          }
          return p;
        });

        updateData({
          materials: updatedMaterials,
          packaging: updatedPackaging,
          products: updatedProducts
        });
      }
    }

    if (exists) {
      updatedProductions = data.productions.map(p => p.id === production.id ? production : p);
    } else {
      updatedProductions = [production, ...data.productions];
    }

    updateData({ productions: updatedProductions });
    setIsModalOpen(false);
    setActiveProduction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Cari nomor produksi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-bg-deep border border-border-dim rounded-none text-xs outline-none w-full sm:w-72 focus:border-brand-500 transition-all text-text-main placeholder:text-text-muted uppercase tracking-widest"
          />
        </div>
        <button onClick={handleCreateNew} className="btn-primary flex items-center gap-2 px-6">
          <PlayCircle className="w-4 h-4" />
          Mulai Produksi Baru
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0F0F0F] text-[9px] text-[#555] uppercase tracking-widest border-b border-border-dim">
              <tr>
                <th className="px-6 py-4 font-normal">No / Tgl Produksi</th>
                <th className="px-6 py-4 font-normal">Produk Jadi</th>
                <th className="px-6 py-4 font-normal text-center">Hasil (OK)</th>
                <th className="px-6 py-4 font-normal text-center">Reject</th>
                <th className="px-6 py-4 font-normal text-center">Status</th>
                <th className="px-6 py-4 font-normal text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dim">
              {filteredProductions.map((p) => (
                <tr key={p.id} className="hover:bg-[#1A1A1A] transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-[11px] font-mono text-brand-500">{p.productionNumber}</p>
                      <p className="text-[9px] text-[#555] font-bold uppercase tracking-tighter">{formatDate(p.date)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-[11px] font-bold text-text-stark uppercase tracking-wider">{p.productName}</p>
                      <p className="text-[9px] text-[#444] uppercase tracking-tighter">Manufacturing Batch</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[11px] font-mono text-text-stark">{p.goodQty}</span>
                    <span className="text-[9px] text-[#555] ml-1 uppercase">PCS</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[11px] font-mono ${p.rejectQty > 0 ? 'text-[#8e3e3e]' : 'text-[#444]'}`}>{p.rejectQty}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 border ${getStatusColor(p.status)}`}>
                      {p.status === 'Selesai' && <CheckCircle2 className="w-3 h-3" />}
                      {p.status === 'Proses' && <Clock className="w-3 h-3 animate-pulse" />}
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setActiveProduction(p);
                          setIsModalOpen(true);
                        }}
                        className="text-[9px] text-text-muted hover:text-brand-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all font-bold"
                      >
                        Detail Produksi
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && activeProduction && (
          <ProductionEditor 
            production={activeProduction}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            data={data}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductionEditor({ production, onClose, onSave, data }: any) {
  const [current, setCurrent] = useState<Production>({...production});

  const selectedFormula = data.formulas.find((f: Formula) => f.id === current.formulaId);
  const selectedProduct = data.products.find((p: Product) => p.id === current.productId);

  const calculateUnitHpp = () => {
    if (!selectedFormula || current.goodQty === 0) return 0;
    // Total cost = (formula hpp * planned qty)
    // Unit hpp = total cost / good qty
    return (selectedFormula.totalCost * current.plannedQty) / current.goodQty;
  };

  const handleProductChange = (productId: string) => {
    const product = data.products.find((p: Product) => p.id === productId);
    const formula = data.formulas.find((f: Formula) => f.productId === productId && f.status === 'Aktif');
    
    setCurrent({
      ...current,
      productId,
      productName: product?.name || '',
      formulaId: formula?.id || '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border-dim"
      >
        <div className="p-6 border-b border-border-dim flex items-center justify-between bg-bg-side">
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-brand-500 font-semibold">Batch Produksi #{current.productionNumber}</h3>
            <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest mt-1">{formatDate(current.date)}</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-stark transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Pilih Produk Jadi</label>
              <select 
                value={current.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                disabled={current.status === 'Selesai'}
                className="input-field disabled:bg-bg-side disabled:text-text-muted"
              >
                <option value="">-- PILIH PRODUK --</option>
                {data.products.map((p: Product) => (
                  <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Referansi Formula</label>
              <div className="p-3 bg-bg-deep border border-border-dim text-[11px] font-medium text-text-dim">
                {selectedFormula ? `VERSI ${selectedFormula.version} (STD: ${formatCurrency(selectedFormula.totalCost)})` : 'Pilih produk untuk melihat formula'}
              </div>
            </div>
          </div>

          <div className="bg-[#141414] border border-border-dim p-4">
            <h4 className="text-[9px] font-bold text-[#555] uppercase mb-4 tracking-widest">Parameter Output Produksi</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div>
                  <label className="block text-[9px] font-bold text-text-muted uppercase tracking-tighter mb-1">Target Qty</label>
                  <input 
                    type="number" 
                    value={current.plannedQty}
                    onChange={(e) => setCurrent({...current, plannedQty: Number(e.target.value)})}
                    disabled={current.status === 'Selesai'}
                    className="input-field py-1 h-8"
                  />
               </div>
               <div>
                  <label className="block text-[9px] font-bold text-brand-500 uppercase tracking-tighter mb-1">Hasil OK</label>
                  <input 
                    type="number" 
                    value={current.goodQty}
                    onChange={(e) => setCurrent({...current, goodQty: Number(e.target.value)})}
                    disabled={current.status === 'Selesai' && production.status === 'Selesai'}
                    className="input-field py-1 h-8 border-brand-500/50"
                  />
               </div>
               <div>
                  <label className="block text-[9px] font-bold text-[#8e3e3e] uppercase tracking-tighter mb-1">Reject</label>
                  <input 
                    type="number" 
                    value={current.rejectQty}
                    onChange={(e) => setCurrent({...current, rejectQty: Number(e.target.value)})}
                    disabled={current.status === 'Selesai'}
                    className="input-field py-1 h-8 text-[#8e3e3e] border-[#3e2222]"
                  />
               </div>
               <div>
                  <label className="block text-[9px] font-bold text-[#555] uppercase tracking-tighter mb-1">Total Unit</label>
                  <div className="h-8 flex items-center px-4 bg-bg-deep border border-border-dim font-bold text-[11px] font-mono text-text-stark">
                    {current.goodQty + current.rejectQty}
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Update Status</label>
              <div className="grid grid-cols-3 gap-2">
                {['Draft', 'Proses', 'Selesai'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setCurrent({...current, status: s as any})}
                    disabled={current.status === 'Selesai' && production.status === 'Selesai'}
                    className={cn(
                      "py-2 text-[9px] font-black uppercase transition-all disabled:opacity-50 border",
                      current.status === s 
                        ? (s === 'Selesai' ? 'bg-[#3e8e41] text-white border-[#3e8e41]' : 'bg-brand-500 text-bg-deep border-brand-500')
                        : 'bg-transparent text-text-muted border-border-muted hover:border-brand-500/50 hover:text-text-dim'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[#141414] border border-border-dim relative overflow-hidden group">
               <TrendingUp className="absolute -right-2 -bottom-2 w-16 h-16 text-brand-500/5 rotate-12" />
               <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest mb-1">Aktual HPP / Unit</p>
               <p className="text-2xl font-serif italic text-brand-500 leading-none">
                 {formatCurrency(calculateUnitHpp())}
               </p>
            </div>
          </div>

          <div>
             <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Internal Manufacturing Notes</label>
             <textarea 
               value={current.notes}
               onChange={(e) => setCurrent({...current, notes: e.target.value})}
               className="input-field min-h-[100px] text-xs py-3"
               placeholder="Detail kendala atau instruksi khusus produksi..."
             />
          </div>
        </div>

        <div className="p-8 border-t border-border-dim flex justify-end gap-3 bg-bg-side">
          <button onClick={onClose} className="btn-secondary px-8">Batal</button>
          <button 
            onClick={() => onSave(current)} 
            className="btn-primary px-8"
          >
            {current.status === 'Selesai' && production.status !== 'Selesai' ? 'Audit & Selesaikan' : 'Simpan Parameter'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}


