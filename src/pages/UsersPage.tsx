import React, { useState, useEffect } from 'react';
import { UserPlus, UserCog, Trash2, Shield, User, Search, Save, X } from 'lucide-react';
import { getStorageData, saveStorageData, logActivity, syncToCloud } from '../lib/storage';
import { User as UserType } from '../types';
import { generateId } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../AppContext';

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Partial<UserType>>({});

  const { data, updateData } = useApp();

  useEffect(() => {
    setUsers(data.users);
    const loggedInId = localStorage.getItem('umkm_user_id');
    const loggedInUser = data.users.find(u => u.id === loggedInId);
    setCurrentUser(loggedInUser || null);
  }, [data.users]);

  const handleSaveUser = async () => {
    if (!selectedUser.username || !selectedUser.role) {
      alert('Username dan Role wajib diisi!');
      return;
    }

    let updatedUsers = [...data.users];

    if (isEditing && selectedUser.id) {
      updatedUsers = updatedUsers.map(u => u.id === selectedUser.id ? { ...u, ...selectedUser } as UserType : u);
      logActivity(currentUser?.id || 'sys', currentUser?.username || 'System', 'UPDATE_USER', 'USERS', `Updated user: ${selectedUser.username}`);
    } else {
      const newUser: UserType = {
        id: generateId(),
        username: (selectedUser.username as string).toLowerCase(),
        password: selectedUser.password || '123456', // default password
        role: selectedUser.role as any,
        fullName: selectedUser.fullName || selectedUser.username || ''
      };
      updatedUsers.push(newUser);
      logActivity(currentUser?.id || 'sys', currentUser?.username || 'System', 'ADD_USER', 'USERS', `Added new user: ${newUser.username}`);
    }

    updateData({ users: updatedUsers });
    setIsEditing(false);
    setSelectedUser({});
    
    // Auto sync to cloud
    const { syncToCloud } = await import('../lib/storage');
    await syncToCloud({ ...data, users: updatedUsers });
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (id === currentUser?.id) {
      alert('Anda tidak bisa menghapus akun Anda sendiri!');
      return;
    }

    if (!confirm(`Hapus user ${username}?`)) return;

    const updatedUsers = data.users.filter(u => u.id !== id);
    updateData({ users: updatedUsers });
    logActivity(currentUser?.id || 'sys', currentUser?.username || 'System', 'DELETE_USER', 'USERS', `Deleted user: ${username}`);
    
    const { syncToCloud } = await import('../lib/storage');
    await syncToCloud({ ...data, users: updatedUsers });
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold text-text-stark tracking-tighter uppercase mb-2">Manajemen User</h2>
          <p className="text-text-muted text-xs uppercase tracking-widest">Atur akses personel dan keamanan sistem</p>
        </div>
        <button 
          onClick={() => { setIsEditing(true); setSelectedUser({ role: 'operator' }); }}
          className="px-6 py-3 bg-brand-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-600 transition-all flex items-center gap-3"
        >
          <UserPlus className="w-4 h-4" />
          Tambah User Baru
        </button>
      </div>

      <div className="mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
        <input
          type="text"
          placeholder="CARI USER BERDASARKAN NAMA ATAU ROLE..."
          className="w-full bg-bg-card border border-border-dim py-4 pl-12 pr-4 text-[10px] text-text-stark focus:outline-none focus:border-brand-500 uppercase tracking-widest transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredUsers.map((user) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={user.id}
              className="bg-bg-card border border-border-dim p-6 relative group hover:border-brand-500 transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-bg-side border border-border-dim rounded-full">
                  <User className="w-6 h-6 text-brand-500" />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setIsEditing(true); setSelectedUser(user); }}
                    className="p-2 text-text-muted hover:text-brand-500 transition-colors"
                  >
                    <UserCog className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id, user.username)}
                    className="p-2 text-text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-text-stark mb-1">{user.fullName || user.username}</h3>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-3 h-3 text-brand-500" />
                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">{user.role}</span>
              </div>
              
              <div className="pt-4 border-t border-border-dim">
                <p className="text-[9px] text-text-dim uppercase tracking-widest">Username: {user.username}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal Edit/Add */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-card border border-border-dim w-full max-w-md p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-text-stark uppercase tracking-tighter">
                {selectedUser.id ? 'Edit User' : 'Tambah User'}
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-text-muted hover:text-text-stark">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Username</label>
                <input
                  type="text"
                  className="w-full bg-bg-side border border-border-dim p-3 text-text-stark focus:outline-none focus:border-brand-500 uppercase tracking-widest text-[11px]"
                  value={selectedUser.username || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                  disabled={!!selectedUser.id}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  className="w-full bg-bg-side border border-border-dim p-3 text-text-stark focus:outline-none focus:border-brand-500 text-[11px]"
                  value={selectedUser.fullName || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Password {selectedUser.id ? '(Kosongkan jika tidak ganti)' : '(Default: 123456)'}</label>
                <input
                  type="password"
                  className="w-full bg-bg-side border border-border-dim p-3 text-text-stark focus:outline-none focus:border-brand-500 text-[11px]"
                  value={selectedUser.password || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Role</label>
                <select
                  className="w-full bg-bg-side border border-border-dim p-3 text-text-stark focus:outline-none focus:border-brand-500 uppercase tracking-widest text-[11px]"
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as any })}
                >
                  <option value="Admin">ADMIN</option>
                  <option value="Owner">OWNER</option>
                  <option value="Operator Produksi">OPERATOR PRODUKSI</option>
                  <option value="Gudang">GUDANG</option>
                </select>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-4 border border-border-dim text-text-muted text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-bg-side transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveUser}
                  className="flex-1 py-4 bg-brand-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-600 transition-all flex items-center justify-center gap-3"
                >
                  <Save className="w-4 h-4" />
                  Simpan Data
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
