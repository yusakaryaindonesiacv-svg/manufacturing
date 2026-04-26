/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../AppContext';
import { Users, Phone, Mail, MapPin, Plus, Search, ExternalLink } from 'lucide-react';

export default function SuppliersPage() {
  const { data } = useApp();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Cari supplier..."
            className="pl-9 pr-4 py-2 bg-bg-deep border border-border-dim rounded-none text-xs outline-none w-full sm:w-72 focus:border-brand-500 transition-all text-text-main placeholder:text-text-muted uppercase tracking-widest"
          />
        </div>
        <button className="btn-primary flex items-center gap-2 px-6">
          <Plus className="w-4 h-4" />
          Register New Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.suppliers.map(s => (
          <div key={s.id} className="bg-bg-card border border-border-dim p-8 hover:border-brand-500 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-brand-500/10 transition-colors" />

             <div className="flex items-center gap-5 mb-8">
               <div className="w-14 h-14 bg-bg-side border border-border-dim text-brand-500 flex items-center justify-center group-hover:border-brand-500 transition-all">
                 <Users className="w-7 h-7" />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-text-stark uppercase tracking-wider group-hover:text-brand-500 transition-colors">{s.name}</h4>
                 <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Verified Vendor Account</p>
               </div>
             </div>

             <div className="space-y-5 mb-8">
               <div className="flex items-center gap-4 text-[11px] text-text-muted font-mono tracking-tighter">
                  <Phone className="w-4 h-4 text-[#444]" />
                  {s.phone}
               </div>
               <div className="flex items-center gap-4 text-[11px] text-text-muted font-mono tracking-tighter">
                  <Mail className="w-4 h-4 text-[#444]" />
                  KONTAK@{s.name.toUpperCase().replace(/ /g, '')}.COM
               </div>
               <div className="flex items-center gap-4 text-[11px] text-text-muted font-mono tracking-tighter line-clamp-1">
                  <MapPin className="w-4 h-4 text-[#444]" />
                  {s.address.toUpperCase()}
               </div>
             </div>

             <button className="w-full py-3 bg-bg-deep border border-border-dim hover:border-brand-500 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted hover:text-text-stark flex items-center justify-center gap-3 transition-all">
                Audit Transaction Logs
                <ExternalLink className="w-3 h-3" />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}
