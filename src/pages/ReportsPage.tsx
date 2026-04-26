/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../AppContext';
import { FileText, Download, Printer, Filter, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '../lib/utils';

export default function ReportsPage() {
  const { data } = useApp();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ReportCard 
          title="Analisis HPP Unit" 
          desc="Detail komprehensif struktur biaya produksi per SKU."
          icon={FileText}
          color="brand"
        />
        <ReportCard 
          title="Historikal Produksi" 
          desc="Rekapitulasi batch manufacturing cycle & yield rate."
          icon={TrendingUp}
          color="brand"
        />
        <ReportCard 
          title="Valuasi Inventory" 
          desc="Audit nilai stok bahan baku & produk finish good."
          icon={BarChart3}
          color="brand"
        />
      </div>

      <div className="bg-bg-card border border-border-dim p-10">
        <div className="flex items-center justify-between mb-10 pb-10 border-b border-border-dim">
          <div>
            <h3 className="text-lg font-bold text-text-stark tracking-widest uppercase">Margin & Profitability Matrix</h3>
            <p className="text-[10px] text-text-muted mt-2 tracking-widest font-mono">*REAL-TIME VALUATION BASED ON ACTIVE FORMULAS</p>
          </div>
          <button className="text-[10px] font-bold text-text-muted hover:text-brand-500 uppercase tracking-widest flex items-center gap-2 px-6 py-2 border border-border-dim hover:border-brand-500 transition-all">
            <Download className="w-4 h-4" />
            Generate PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] border-b border-border-dim">
                <th className="py-4 px-2">Catalog Product</th>
                <th className="py-4 px-2 text-right">Production Cost</th>
                <th className="py-4 px-2 text-right">Market Price</th>
                <th className="py-4 px-2 text-right">Net Margin</th>
                <th className="py-4 px-2 text-right">Ratio</th>
                <th className="py-4 px-2 text-right">Inventory</th>
                <th className="py-4 px-2 text-right">Total Equity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dim/50">
              {data.products.map(p => (
                <tr key={p.id} className="text-[12px] group hover:bg-bg-side/30 transition-colors">
                  <td className="py-6 px-2">
                    <p className="font-bold text-text-stark uppercase tracking-wider">{p.name}</p>
                    <p className="text-[10px] text-[#555] font-mono mt-1">{p.sku}</p>
                  </td>
                  <td className="py-6 px-2 text-right font-serif italic text-text-muted">{formatCurrency(p.baseHpp)}</td>
                  <td className="py-6 px-2 text-right font-serif italic text-text-stark">{formatCurrency(p.sellingPrice)}</td>
                  <td className="py-6 px-2 text-right font-bold text-[#3e8e41]">{formatCurrency(p.sellingPrice - p.baseHpp)}</td>
                  <td className="py-6 px-2 text-right">
                    <span className="text-[10px] font-mono border border-[#3e8e41]/30 px-2 py-0.5 text-[#3e8e41]">
                      {((p.sellingPrice - p.baseHpp) / p.baseHpp * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-6 px-2 text-right font-mono text-text-muted">{formatNumber(p.stock)}</td>
                  <td className="py-6 px-2 text-right font-bold text-brand-500">{formatCurrency(p.sellingPrice * p.stock)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, desc, icon: Icon, color }: any) {
  return (
    <div className="bg-bg-card border border-border-dim p-8 group hover:border-brand-500 transition-all cursor-pointer relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-colors" />
      
      <div className={`w-12 h-12 bg-bg-side border border-border-dim text-brand-500 rounded-none flex items-center justify-center mb-6`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-text-stark mb-2 group-hover:text-brand-500 transition-colors uppercase tracking-widest">{title}</h3>
      <p className="text-[11px] text-text-muted leading-relaxed mb-8 tracking-wide">{desc}</p>
      
      <div className="flex items-center justify-between text-[9px] font-bold uppercase text-text-muted tracking-[0.2em] pt-6 border-t border-border-dim">
        <span>Cycle: Daily Digest</span>
        <div className="flex items-center gap-4 text-[#555]">
          <Printer className="w-3.5 h-3.5 cursor-pointer hover:text-brand-500 transition-colors" />
          <Download className="w-3.5 h-3.5 cursor-pointer hover:text-brand-500 transition-colors" />
        </div>
      </div>
    </div>
  );
}
