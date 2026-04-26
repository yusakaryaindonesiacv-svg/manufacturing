/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../AppContext';
import { Settings, Shield, Bell, Database, Save, User as UserIcon, Building } from 'lucide-react';

export default function SettingsPage() {
  const { data, user } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Company Info */}
      <div className="bg-bg-card border border-border-dim overflow-hidden">
        <div className="p-8 border-b border-border-dim bg-bg-side">
          <h3 className="text-sm font-bold text-text-stark flex items-center gap-3 uppercase tracking-[0.2em]">
            <Building className="w-5 h-5 text-brand-500" />
            Corporate Profile
          </h3>
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Enterprise Legal Name</label>
                <input className="input-field" defaultValue={data.settings.companyName} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Registry Address</label>
                <textarea className="input-field min-h-[100px]" defaultValue="JL. INDUSTRI MANDIRI NO. 12, SURABAYA" />
              </div>
           </div>
           <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Functional Currency</label>
                <select className="input-field">
                  <option>IDR (RUPIAH)</option>
                  <option>USD (US DOLLAR)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-3">Default Target Margin (%)</label>
                <input type="number" className="input-field border-brand-500/30 text-brand-500" defaultValue={data.settings.defaultMargin} />
              </div>
           </div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-bg-card border border-border-dim overflow-hidden">
        <div className="p-8 border-b border-border-dim flex items-center justify-between bg-bg-side">
          <h3 className="text-sm font-bold text-text-stark flex items-center gap-3 uppercase tracking-[0.2em]">
            <Shield className="w-5 h-5 text-brand-500" />
            Security & Access Management
          </h3>
          <button className="text-[10px] font-bold text-brand-500 hover:text-text-stark border border-brand-500/30 px-4 py-1.5 uppercase tracking-widest transition-all">New User</button>
        </div>
        <div className="p-10">
          <div className="space-y-4">
            {data.users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-5 bg-bg-deep border border-border-dim group hover:border-brand-500 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-bg-side border border-border-dim flex items-center justify-center font-mono font-bold text-brand-500 uppercase">
                     {u.fullName.charAt(0)}
                   </div>
                   <div>
                     <p className="text-[13px] font-bold text-text-stark uppercase tracking-wider">{u.fullName}</p>
                     <p className="text-[9px] text-[#555] font-bold uppercase tracking-[0.2em] mt-1">{u.role}</p>
                   </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-text-muted">ID: {u.username.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-bg-card border border-border-dim p-10 group hover:border-brand-500 transition-all">
            <h4 className="text-sm font-bold text-text-stark mb-4 flex items-center gap-3 uppercase tracking-widest">
              <Database className="w-5 h-5 text-brand-500" />
              Cloud Synchronization
            </h4>
            <p className="text-[11px] text-text-muted mb-8 leading-relaxed tracking-wide uppercase">Connect with Google Sheets to persist your database across devices. Ensure VITE_GAS_URL is configured.</p>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={async () => {
                  const { fetchFromCloud } = await import('../lib/storage');
                  const result = await fetchFromCloud();
                  if (result) {
                    alert('Data fetched from Cloud successfully! Page will reload.');
                    window.location.reload();
                  } else {
                    alert('Failed to fetch from Cloud. Check console or VITE_GAS_URL.');
                  }
                }}
                className="w-full py-4 bg-bg-side border border-border-dim text-brand-500 hover:border-brand-500 text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
              >
                Pull From Google Sheets
              </button>
              <button 
                onClick={async () => {
                  const { syncToCloud, getStorageData } = await import('../lib/storage');
                  const success = await syncToCloud(getStorageData());
                  if (success) {
                    alert('Data successfully pushed to Cloud (Google Sheets).');
                  } else {
                    alert('Push failed. Check console.');
                  }
                }}
                className="w-full py-4 bg-bg-side border border-border-dim text-text-muted hover:text-brand-500 hover:border-brand-500 text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
              >
                Push to Google Sheets
              </button>
            </div>
         </div>

         <div className="bg-bg-card border border-border-dim p-10 group hover:border-[#8e3e3e] transition-all">
            <h4 className="text-sm font-bold text-text-stark mb-4 flex items-center gap-3 uppercase tracking-widest">
              <Database className="w-5 h-5 text-[#8e3e3e]" />
              System Factory Reset
            </h4>
            <p className="text-[11px] text-text-muted mb-8 leading-relaxed tracking-wide uppercase text-[#8e3e3e]/70">IRREVERSIBLY WIPE ALL TRANSACTIONAL RECORDS, STOCK DATA, AND FORMULAS. PROCEED WITH EXTREME CAUTION.</p>
            <button className="w-full py-4 border border-[#8e3e3e]/30 text-[#8e3e3e] hover:bg-[#8e3e3e] hover:text-text-stark text-[10px] font-bold uppercase tracking-[0.2em] transition-all">
              Initiate Hard Reset
            </button>
         </div>
      </div>

      <div className="flex justify-end pt-10 border-t border-border-dim">
        <button className="btn-primary flex items-center gap-3 px-10 py-4 text-[12px]">
          <Save className="w-5 h-5" />
          Synchronize All Settings
        </button>
      </div>
    </div>
  );
}
