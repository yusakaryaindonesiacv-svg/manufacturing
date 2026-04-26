/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { motion } from 'motion/react';
import { Package, Lock, User as UserIcon, Factory } from 'lucide-react';

export default function LoginPage() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const success = login(username.trim(), password.trim());
      if (!success) {
        setError('Username atau password salah.');
        setLoading(false);
      }
    }, 800);
  };

  const handleReset = () => {
    if (confirm('Reset semua data ke pengaturan awal? Semua data lokal akan terhapus.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep px-4 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-brand-500/5 rounded-full blur-[120px] -mr-[10vw] -mt-[10vw]" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-brand-500/5 rounded-full blur-[120px] -ml-[10vw] -mb-[10vw]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full bg-bg-card p-12 border border-border-dim relative z-10"
      >
        <div className="text-center mb-12">
          <div 
            className="w-16 h-16 bg-bg-side border border-border-dim text-brand-500 flex items-center justify-center mx-auto mb-6 cursor-pointer"
            onClick={(e) => {
              if (e.detail === 3) handleReset();
            }}
            title="Klik 3x untuk reset data"
          >
            <Factory className="w-8 h-8" />
          </div>
          <h1 className="text-[20px] font-bold text-text-stark mb-2 uppercase tracking-[0.3em]">PRX MANUFACTURING</h1>
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">COST PERFORMANCE & PRODUCTION LOGISTICS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Operator Access ID</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500/50 w-4 h-4" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-bg-deep border border-border-dim rounded-none text-text-main text-xs outline-none focus:border-brand-500 transition-all uppercase tracking-widest placeholder:text-[#333]"
                placeholder="USERNAME"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Secure Pin / Passcode</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500/50 w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-bg-deep border border-border-dim rounded-none text-text-main text-xs outline-none focus:border-brand-500 transition-all uppercase tracking-[0.5em] placeholder:text-[#333]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-[#8e3e3e]/10 border border-[#8e3e3e]/20 text-[#8e3e3e] text-[10px] text-center font-bold tracking-widest uppercase"
              >
                {error}
              </motion.div>
              <button 
                type="button"
                onClick={handleReset}
                className="w-full text-[9px] text-[#444] uppercase font-bold hover:text-brand-500 transition-colors"
              >
                Lupa Password atau Data Eror? Reset Data Sistem
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-[11px]"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'INITIALIZE SESSION'
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-border-dim text-center">
          <p className="text-[9px] text-[#444] uppercase tracking-widest mb-4 font-bold">Demo Verification Keys</p>
          <div className="grid grid-cols-2 gap-4 text-[9px] font-mono">
            <div className="bg-bg-deep p-3 border border-border-dim">
              <span className="block text-[#555] mb-1">LVL: ADMIN</span>
              <code className="text-brand-500">admin / admin123</code>
            </div>
            <div className="bg-bg-deep p-3 border border-border-dim">
              <span className="block text-[#555] mb-1">LVL: OPERATOR</span>
              <code className="text-brand-400">operator / operator123</code>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
