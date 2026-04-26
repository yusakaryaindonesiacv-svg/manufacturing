/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { 
  Plus, 
  Search, 
  Trash2, 
  Beaker, 
  Package, 
  ClipboardList, 
  Printer, 
  ChevronRight,
  Calculator,
  ArrowRight,
  Save
} from 'lucide-react';
import { formatCurrency, formatNumber, generateId, cn } from '../lib/utils';
import { Formula, FormulaItem, Product, Material, Packaging } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function FormulaPage() {
  const { data, updateData } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFormula, setActiveFormula] = useState<Formula | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFormulas = data.formulas.filter(f => {
    const product = data.products.find(p => p.id === f.productId);
    return product?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getProductName = (productId: string) => {
    return data.products.find(p => p.id === productId)?.name || 'Produk Tidak Ditemukan';
  };

  const handleCreateNew = () => {
    const newFormula: Formula = {
      id: generateId('FRM'),
      productId: '',
      version: '1.0',
      items: [],
      laborCost: 0,
      overheadCost: 0,
      otherCost: 0,
      totalCost: 0,
      status: 'Draft',
      note: '',
      updatedAt: new Date().toISOString()
    };
    setActiveFormula(newFormula);
    setIsModalOpen(true);
  };

  const saveFormula = (formula: Formula) => {
    const exists = data.formulas.find(f => f.id === formula.id);
    let updatedFormulas;
    if (exists) {
      updatedFormulas = data.formulas.map(f => f.id === formula.id ? formula : f);
    } else {
      updatedFormulas = [formula, ...data.formulas];
    }
    
    // Update product baseHpp automatically
    const updatedProducts = data.products.map(p => {
      if (p.id === formula.productId) {
        return { ...p, baseHpp: formula.totalCost };
      }
      return p;
    });

    updateData({ formulas: updatedFormulas, products: updatedProducts });
    setIsModalOpen(false);
    setActiveFormula(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-bg-deep border border-border-dim rounded-none text-xs outline-none w-full sm:w-72 focus:border-brand-500 transition-all text-text-main placeholder:text-text-muted uppercase tracking-widest"
          />
        </div>
        <button onClick={handleCreateNew} className="btn-primary flex items-center gap-2 px-6">
          <Plus className="w-3 h-3" />
          Buat Formula Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredFormulas.map(formula => (
          <motion.div 
            key={formula.id}
            layoutId={formula.id}
            className="bg-bg-card border border-border-dim p-8 flex flex-col hover:border-brand-500 transition-all cursor-pointer group"
            onClick={() => {
              setActiveFormula(formula);
              setIsModalOpen(true);
            }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 bg-bg-side border border-border-muted flex items-center justify-center text-brand-500 group-hover:bg-[#1A1A1A] transition-colors">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-widest ${
                formula.status === 'Aktif' ? 'border-[#3e8e41] text-[#3e8e41]' : 'border-text-muted text-text-muted'
              }`}>
                {formula.status}
              </span>
            </div>
            
            <h3 className="text-sm font-bold text-text-stark mb-1 uppercase tracking-wider">{getProductName(formula.productId)}</h3>
            <p className="text-[10px] text-text-muted mb-6 uppercase tracking-widest leading-relaxed">Versi {formula.version} • {formula.items.length} Komponen</p>
            
            <div className="mt-auto pt-6 border-t border-border-dim flex items-center justify-between">
              <div>
                <p className="text-[9px] text-[#555] uppercase font-bold tracking-widest mb-1">Estimasi HPP/Unit</p>
                <p className="text-xl font-serif italic text-brand-500">{formatCurrency(formula.totalCost)}</p>
              </div>
              <div className="p-2 border border-border-muted group-hover:border-brand-500 transition-colors">
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand-500" />
              </div>
            </div>
          </motion.div>
        ))}

        {filteredFormulas.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-500">Belum ada formula produk.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && activeFormula && (
          <FormulaEditor 
            formula={activeFormula} 
            onClose={() => setIsModalOpen(false)} 
            onSave={saveFormula}
            data={data}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FormulaEditor({ formula, onClose, onSave, data }: any) {
  const [currentFormula, setCurrentFormula] = useState<Formula>({...formula});
  const [activeTab, setActiveTab] = useState<'items' | 'costs'>('items');

  const totalItemCost = useMemo(() => {
    return currentFormula.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
  }, [currentFormula.items]);

  const totalHpp = useMemo(() => {
    return totalItemCost + currentFormula.laborCost + currentFormula.overheadCost + currentFormula.otherCost;
  }, [totalItemCost, currentFormula.laborCost, currentFormula.overheadCost, currentFormula.otherCost]);

  const addItem = (type: 'Material' | 'Packaging', id: string) => {
    let baseItem: any;
    let cost = 0;
    
    if (type === 'Material') {
      baseItem = data.materials.find((m: any) => m.id === id);
      cost = baseItem.pricePerUnit;
    } else {
      baseItem = data.packaging.find((k: any) => k.id === id);
      cost = baseItem.pricePerPcs;
    }

    const newItem: FormulaItem = {
      type,
      id,
      name: baseItem.name,
      quantity: 1,
      unit: baseItem.unit || 'pcs',
      cost
    };

    setCurrentFormula({
      ...currentFormula,
      items: [...currentFormula.items, newItem]
    });
  };

  const removeItem = (index: number) => {
    setCurrentFormula({
      ...currentFormula,
      items: currentFormula.items.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    onSave({
      ...currentFormula,
      totalCost: totalHpp,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-bg-card shadow-2xl flex flex-col overflow-hidden border border-border-dim"
      >
        <div className="p-6 border-b border-border-dim flex items-center justify-between bg-bg-side">
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-brand-500 font-semibold">Bill of Materials Laboratory</h3>
            <p className="text-[9px] text-[#555] uppercase tracking-widest mt-1">Sistem Kalkulator HPP & Formulasi Presisi</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="btn-secondary px-6">Batal</button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2 px-6">
              <Save className="w-3.5 h-3.5" />
              Simpan Formula
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex">
          {/* Main Form */}
          <div className="flex-1 p-8 space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Target Produk SKU</label>
                <select 
                  value={currentFormula.productId}
                  onChange={(e) => setCurrentFormula({...currentFormula, productId: e.target.value})}
                  className="input-field"
                >
                  <option value="">-- PILIH PRODUK --</option>
                  {data.products.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name.toUpperCase()} ({p.sku})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Versi Kontrol</label>
                <input 
                  type="text" 
                  value={currentFormula.version}
                  onChange={(e) => setCurrentFormula({...currentFormula, version: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-8 border-b border-border-dim">
              <button 
                onClick={() => setActiveTab('items')}
                className={`pb-3 px-1 text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === 'items' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-text-muted'}`}
              >
                Komponen Formulasi
              </button>
              <button 
                onClick={() => setActiveTab('costs')}
                className={`pb-3 px-1 text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === 'costs' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-text-muted'}`}
              >
                OPEX & Biaya Tak Langsung
              </button>
            </div>

            {activeTab === 'items' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-bg-side p-3 border border-border-dim">
                  <h4 className="text-[10px] font-bold text-text-stark uppercase tracking-widest">Inventory Mixer</h4>
                  <div className="flex gap-4">
                    <select 
                      onChange={(e) => {
                        if (e.target.value) addItem('Material', e.target.value);
                        e.target.value = '';
                      }}
                      className="text-[9px] bg-bg-deep border border-border-muted text-brand-500 uppercase tracking-tighter px-2 py-1 outline-none"
                    >
                      <option value="">+ Tambah Bahan Baku</option>
                      {data.materials.map((m: any) => <option key={m.id} value={m.id}>{m.name.toUpperCase()}</option>)}
                    </select>
                    <select 
                       onChange={(e) => {
                        if (e.target.value) addItem('Packaging', e.target.value);
                        e.target.value = '';
                      }}
                      className="text-[9px] bg-bg-deep border border-border-muted text-[#8b5cf6] uppercase tracking-tighter px-2 py-1 outline-none"
                    >
                      <option value="">+ Tambah Kemasan</option>
                      {data.packaging.map((k: any) => <option key={k.id} value={k.id}>{k.name.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {currentFormula.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-6 p-4 bg-[#141414] border border-border-dim group">
                      <div className={`w-8 h-8 flex items-center justify-center shrink-0 border ${item.type === 'Material' ? 'border-brand-500/20 text-brand-500' : 'border-purple-500/20 text-purple-500'}`}>
                        {item.type === 'Material' ? <Beaker className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-text-stark uppercase tracking-wider">{item.name}</p>
                        <p className="text-[9px] text-[#555] font-mono uppercase tracking-tighter">{item.type} • {formatCurrency(item.cost)} / {item.unit}</p>
                      </div>
                      <div className="w-24">
                        <input 
                          type="number" 
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...currentFormula.items];
                            newItems[index].quantity = Number(e.target.value);
                            setCurrentFormula({...currentFormula, items: newItems});
                          }}
                          className="w-full bg-bg-deep border border-border-muted px-2 py-1 text-right text-[11px] font-mono outline-none focus:border-brand-500 text-text-stark"
                        />
                      </div>
                      <div className="w-32 text-right">
                        <p className="text-[11px] font-serif italic text-text-stark">{formatCurrency(item.cost * item.quantity)}</p>
                      </div>
                      <button onClick={() => removeItem(index)} className="p-1 text-[#555] hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {currentFormula.items.length === 0 && (
                    <div className="text-center py-16 border border-dashed border-border-dim">
                      <p className="text-[10px] text-[#444] uppercase tracking-[0.2em] italic">Mixer Kosong - Tambahkan Komponen</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'costs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-text-stark uppercase tracking-widest mb-6 border-l-2 border-brand-500 pl-4">OpEx Parameters</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Direct Labor / Unit</label>
                    <input 
                      type="number" 
                      value={currentFormula.laborCost}
                      onChange={(e) => setCurrentFormula({...currentFormula, laborCost: Number(e.target.value)})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Utility Overhead / Unit</label>
                    <input 
                      type="number" 
                      value={currentFormula.overheadCost}
                      onChange={(e) => setCurrentFormula({...currentFormula, overheadCost: Number(e.target.value)})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Other Factory Costs / Unit</label>
                    <input 
                      type="number" 
                      value={currentFormula.otherCost}
                      onChange={(e) => setCurrentFormula({...currentFormula, otherCost: Number(e.target.value)})}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="bg-[#1A1A1A] border border-border-dim p-8 flex flex-col justify-center text-center">
                   <Calculator className="w-10 h-10 text-brand-500 mx-auto mb-6 opacity-20" />
                   <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2">Total Indirect Cost</p>
                   <p className="text-3xl font-serif italic text-brand-500">
                    {formatCurrency(currentFormula.laborCost + currentFormula.overheadCost + currentFormula.otherCost)}
                   </p>
                </div>
              </div>
            )}
          </div>

          {/* HPP Summary Sidebar */}
          <div className="w-80 bg-bg-side p-8 border-l border-border-dim flex flex-col shrink-0">
            <h4 className="text-[10px] font-bold text-[#555] uppercase mb-8 flex items-center justify-between tracking-widest">
              Financial Summary
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
            </h4>
            
            <div className="space-y-6 flex-1">
              <SummaryRow label="Raw Material HPP" value={totalItemCost} />
              <SummaryRow label="OpEx / Overhead" value={currentFormula.laborCost + currentFormula.overheadCost + currentFormula.otherCost} />
              
              <div className="pt-8 border-t border-border-dim">
                <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2">Consolidated HPP</p>
                <p className="text-4xl font-serif italic text-text-stark tracking-tight leading-tight">
                  {formatCurrency(totalHpp)}
                </p>
                <div className="inline-block mt-2 px-2 py-0.5 bg-[#1A1A1A] text-[9px] text-brand-500 font-mono italic">
                  per {data.products.find((p: any) => p.id === currentFormula.productId)?.unit || 'unit'}
                </div>
              </div>

              <div className="mt-12 p-6 bg-bg-deep border border-border-dim">
                 <p className="text-[9px] text-[#555] uppercase font-black mb-6 tracking-[0.2em]">Sale Simulation (WAC)</p>
                 <div className="space-y-5">
                   <div className="flex justify-between items-center text-[11px]">
                     <span className="text-[#666] uppercase tracking-tighter">Margin 30%</span>
                     <span className="font-serif italic text-[#3e8e41]">{formatCurrency(totalHpp * 1.3)}</span>
                   </div>
                   <div className="flex justify-between items-center text-[11px]">
                     <span className="text-[#666] uppercase tracking-tighter">Margin 50%</span>
                     <span className="font-serif italic text-[#3e8e41]">{formatCurrency(totalHpp * 1.5)}</span>
                   </div>
                   <div className="flex justify-between items-center text-[11px]">
                     <span className="text-[#666] uppercase tracking-tighter">Margin 100%</span>
                     <span className="font-serif italic text-[#3e8e41]">{formatCurrency(totalHpp * 2)}</span>
                   </div>
                 </div>
              </div>
            </div>

            <div className="mt-10">
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Formula State</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setCurrentFormula({...currentFormula, status: 'Draft'})}
                  className={`py-2 text-[9px] uppercase tracking-widest font-bold transition-all border ${currentFormula.status === 'Draft' ? 'bg-[#1A1A1A] text-text-stark border-brand-500' : 'bg-transparent text-text-muted border-border-muted'}`}
                >
                  Draft
                </button>
                <button 
                  onClick={() => setCurrentFormula({...currentFormula, status: 'Aktif'})}
                  className={`py-2 text-[9px] uppercase tracking-widest font-bold transition-all border ${currentFormula.status === 'Aktif' ? 'bg-[#3e8e41] text-white border-[#3e8e41]' : 'bg-transparent text-text-muted border-border-muted'}`}
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex justify-between items-center text-[11px]">
      <span className="text-[#888] uppercase tracking-tighter">{label}</span>
      <span className="font-serif italic text-text-main">{formatNumber(value)}</span>
    </div>
  );
}


