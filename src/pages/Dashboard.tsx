/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Calculator,
  Layers
} from 'lucide-react';
import { useApp } from '../AppContext';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

export default function Dashboard() {
  const { data } = useApp();

  // Stats calculation
  const totalMaterials = data.materials.length;
  const totalProducts = data.products.length;
  const lowStockMaterials = data.materials.filter(m => m.stock <= m.minStock).length;
  const lowStockPackaging = data.packaging.filter(p => p.stock <= p.minStock).length;
  
  const totalProductionThisMonth = 1250; // Mocked for visuals
  const productionGrowth = 12.5;

  const chartData = [
    { name: 'Sen', production: 400, cost: 2400 },
    { name: 'Sel', production: 300, cost: 1398 },
    { name: 'Rab', production: 200, cost: 9800 },
    { name: 'Kam', production: 278, cost: 3908 },
    { name: 'Jum', production: 189, cost: 4800 },
    { name: 'Sab', production: 239, cost: 3800 },
    { name: 'Min', production: 349, cost: 4300 },
  ];

  const hppComposition = [
    { name: 'Bahan Baku', value: 65, color: '#d4af37' },
    { name: 'Kemasan', value: 15, color: '#B4B4B4' },
    { name: 'Biaya Lain', value: 20, color: '#555555' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total SKU Produk" 
          value={totalProducts} 
          icon={Package} 
          trend="+3% vs bln lalu" 
          color="brand"
        />
        <StatCard 
          title="Produksi Bulan Ini" 
          value={formatNumber(totalProductionThisMonth)} 
          unit="pcs" 
          icon={Activity} 
          trend={`${productionGrowth}% target`} 
          color="brand"
        />
        <StatCard 
          title="Bahan Baku Kritis" 
          value={lowStockMaterials + lowStockPackaging} 
          icon={AlertTriangle} 
          trend="Perlu restock" 
          color="red"
          isWarning={lowStockMaterials + lowStockPackaging > 0}
        />
        <StatCard 
          title="Nilai Produksi" 
          value={formatCurrency(15420000)} 
          icon={TrendingUp} 
          trend="+5.2% target" 
          color="brand"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Chart */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs uppercase tracking-[0.2em] text-brand-500 font-semibold flex items-center gap-3">
              <TrendingUp className="w-3 h-3" />
              Volume Produksi Harian
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted uppercase">Filter:</span>
              <select className="bg-bg-deep border border-border-dim text-[10px] uppercase tracking-widest px-2 py-1 outline-none text-text-dim">
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
              </select>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#555' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#555' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #333', color: '#fff', borderRadius: '0' }}
                  itemStyle={{ color: '#d4af37', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="production" stroke="#d4af37" strokeWidth={1} fillOpacity={1} fill="url(#colorProd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HPP Breakdown */}
        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-xs uppercase tracking-[0.2em] text-brand-500 font-semibold mb-8 flex items-center gap-3">
            <Calculator className="w-3 h-3" />
            Analisis Komposisi HPP
          </h3>
          <div className="flex-1 space-y-6">
            {hppComposition.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-text-dim uppercase tracking-widest">{item.name}</span>
                  <span className="text-[11px] text-text-stark font-mono">{item.value}%</span>
                </div>
                <div className="w-full h-1 bg-border-dim overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000" 
                    style={{ 
                      width: `${item.value}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
            
            <div className="mt-12 pt-6 border-t border-border-dim">
              <p className="text-[10px] text-text-muted italic leading-relaxed">
                Kalkulasi otomatis berdasarkan metode FIFO atas siklus bisnis 30 hari terakhir.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="glass-panel">
          <div className="p-4 border-b border-border-dim flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-[0.2em] text-brand-500 font-semibold">Log Operasional</h3>
            <button className="text-[9px] text-text-muted uppercase border border-border-muted px-2 py-1 hover:bg-[#1A1A1A] transition-colors">
              Detail Log
            </button>
          </div>
          <div className="p-6 space-y-5">
            {data.activityLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[11px] font-bold text-text-stark uppercase tracking-wider truncate">{log.action}</p>
                    <span className="text-[9px] text-[#555] font-mono whitespace-nowrap ml-2">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-dim leading-relaxed">{log.details}</p>
                  <p className="text-[9px] text-[#444] uppercase tracking-tighter mt-1">
                    Operator: {log.username}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Alert */}
        <div className="glass-panel">
          <div className="p-4 border-b border-border-dim flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-[0.2em] text-brand-500 font-semibold">Peringatan Stok Kritis</h3>
          </div>
          <div className="p-6 space-y-4">
            {data.materials.filter(m => m.stock <= m.minStock).slice(0, 4).map(m => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-[#1A1515] border border-[#3e2222]">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-text-stark uppercase tracking-wider">{m.name}</p>
                  <p className="text-[9px] text-text-dim uppercase tracking-widest">
                    Sisa: {formatNumber(m.stock)} {m.unit} <span className="text-[#8e3e3e]"> (Min: {m.minStock})</span>
                  </p>
                </div>
                <button className="text-[9px] bg-[#3e2222] text-[#e0a0a0] px-3 py-1.5 uppercase tracking-widest font-bold hover:bg-[#4e2c2c] transition-colors rounded-none">
                  RESTOCK
                </button>
              </div>
            ))}
            {data.materials.filter(m => m.stock <= m.minStock).length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-8 h-8 text-border-muted mx-auto mb-3 opacity-20" />
                <p className="text-[10px] text-text-muted uppercase tracking-[0.2em]">Semua status inventori aman</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color, unit, isWarning }: any) {
  return (
    <div className={cn(
      "bg-bg-card border border-border-dim p-6 transition-all group",
      isWarning && "border-[#3e2222] bg-[#1A1515]"
    )}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={cn(
          "w-5 h-5",
          color === 'red' ? 'text-[#8e3e3e]' : 'text-brand-500'
        )} />
        <span className={cn(
          "text-[9px] uppercase tracking-widest font-bold",
          color === 'red' ? 'text-[#8e3e3e]' : 'text-brand-600'
        )}>
          {trend}
        </span>
      </div>
      <div>
        <h4 className="text-text-muted text-[10px] uppercase tracking-widest mb-1 group-hover:text-text-dim transition-colors">{title}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-serif text-text-stark tracking-tight leading-none">{value}</span>
          {unit && <span className="text-text-dim text-xs font-sans italic">{unit}</span>}
        </div>
      </div>
    </div>
  );
}


