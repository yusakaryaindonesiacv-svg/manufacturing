/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, Moon, Sun, Search, User, Menu } from 'lucide-react';
import { useApp } from '../../AppContext';

interface NavbarProps {
  activeTab: string;
  onToggleSidebar?: () => void;
}

export default function Navbar({ activeTab, onToggleSidebar }: NavbarProps) {
  const { user } = useApp();
  
  const getTabLabel = () => {
    const labels: Record<string, string> = {
      dashboard: 'Beranda Analitik',
      materials: 'Manajemen Bahan Baku',
      packaging: 'Manajemen Kemasan',
      products: 'Daftar Produk Jadi',
      formula: 'Resep & Bill of Materials',
      production: 'Operasi Produksi',
      purchase: 'Pembelian Stok',
      suppliers: 'Daftar Supplier',
      reports: 'Laporan Keuangan & Stok',
      settings: 'Pengaturan Sistem'
    };
    return labels[activeTab] || 'Dashboard';
  };

  return (
    <header className="h-16 border-b border-border-dim bg-bg-nav flex items-center justify-between px-4 md:px-10 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-4 md:gap-8">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-text-dim hover:text-text-stark md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-[10px] md:text-xs font-semibold text-brand-500 uppercase tracking-[0.2em] truncate max-w-[150px] md:max-w-none">
          {getTabLabel()}
        </h2>
        
        <div className="hidden lg:flex items-center space-x-4 border-l border-border-muted pl-8">
          <span className="text-[10px] text-[#555] uppercase tracking-[0.3em]">System Status:</span>
          <span className="flex items-center text-[10px] text-brand-500">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mr-2 animate-pulse"></span>
            SYNCHRONIZED
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button className="hidden sm:block text-[10px] text-text-dim uppercase tracking-widest hover:text-text-stark transition-colors cursor-pointer">
          Search Database
        </button>
        <button className="hidden sm:block text-[10px] text-text-dim uppercase tracking-widest hover:text-text-stark transition-colors cursor-pointer">
          System Logs
        </button>
      </div>
    </header>
  );
}
