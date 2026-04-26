/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Beaker, 
  Package, 
  Box, 
  Settings, 
  LogOut, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  FileText,
  Warehouse,
  ClipboardList
} from 'lucide-react';
import { useApp } from '../../AppContext';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types';

import { AnimatePresence, motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  roles: UserRole[];
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Owner', 'Operator Produksi', 'Gudang'] },
  { id: 'materials', label: 'Bahan Baku', icon: Beaker, roles: ['Admin', 'Owner', 'Gudang', 'Operator Produksi'] },
  { id: 'packaging', label: 'Kemasan', icon: Package, roles: ['Admin', 'Owner', 'Gudang'] },
  { id: 'products', label: 'Produk Jadi', icon: Box, roles: ['Admin', 'Owner', 'Gudang'] },
  { id: 'formula', label: 'Formula / BOM', icon: ClipboardList, roles: ['Admin', 'Owner', 'Operator Produksi'] },
  { id: 'production', label: 'Produksi', icon: TrendingUp, roles: ['Admin', 'Owner', 'Operator Produksi'] },
  { id: 'purchase', label: 'Pembelian', icon: ShoppingCart, roles: ['Admin', 'Owner', 'Gudang'] },
  { id: 'suppliers', label: 'Supplier', icon: Users, roles: ['Admin', 'Owner', 'Gudang'] },
  { id: 'reports', label: 'Laporan', icon: FileText, roles: ['Admin', 'Owner'] },
  { id: 'users', label: 'User', icon: Users, roles: ['Admin', 'Owner'] },
  { id: 'settings', label: 'Pengaturan', icon: Settings, roles: ['Admin', 'Owner'] },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
  const { logout, user } = useApp();

  const filteredMenu = MENU_ITEMS.filter(item => item.roles.includes(user?.role as UserRole));

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={onClose}
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 bg-bg-side h-full flex flex-col border-r border-border-dim shrink-0 z-50 w-64 md:hidden"
            >
              <SidebarContent 
                filteredMenu={filteredMenu} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                user={user} 
                logout={logout} 
                onClose={onClose} 
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden md:flex bg-bg-side h-full flex-col border-r border-border-dim shrink-0 w-64 relative">
        <SidebarContent 
          filteredMenu={filteredMenu} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user} 
          logout={logout} 
        />
      </aside>
    </>
  );
}

function SidebarContent({ filteredMenu, activeTab, setActiveTab, user, logout, onClose }: any) {
  return (
    <>
      <div className="py-8 px-6 flex-1 overflow-y-auto">
        <div className="mb-10 px-2 flex items-center justify-between">
          <div>
            <h1 className="text-brand-500 text-2xl font-serif italic tracking-tight">MANUFACTURING</h1>
            <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] mt-1">Premium Manufacturing</p>
          </div>
        </div>

        <nav className="space-y-1">
          {filteredMenu.map((item: any) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-medium transition-all group text-left",
                activeTab === item.id 
                  ? "bg-[#1A1A1A] text-text-stark border-l-2 border-brand-500" 
                  : "text-text-dim hover:text-text-stark hover:bg-[#151515]"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4",
                activeTab === item.id ? "text-brand-500" : "text-text-muted group-hover:text-text-dim"
              )} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-border-dim bg-[#0D0D0D]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-[#1A1A1A] border border-border-muted rounded-full flex items-center justify-center text-brand-500 font-bold text-[10px]">
            {user?.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-text-stark uppercase tracking-wider truncate">{user?.fullName}</p>
            <p className="text-[9px] text-text-muted uppercase tracking-tight">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border-muted text-[10px] uppercase tracking-widest font-medium text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </>
  );
}
