/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AppData } from './types';
import { getStorageData, saveStorageData, logActivity } from './lib/storage';

interface AppContextType {
  user: User | null;
  data: AppData;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateData: (newData: Partial<AppData>) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<AppData>(getStorageData());

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('umkm_auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username: string, password: string) => {
    const lowerUsername = username.toLowerCase();
    const foundUser = data.users.find(u => u.username.toLowerCase() === lowerUsername && u.password === password);
    if (foundUser) {
      const { password, ...userWithoutPass } = foundUser;
      setUser(userWithoutPass as User);
      localStorage.setItem('umkm_auth_user', JSON.stringify(userWithoutPass));
      logActivity(foundUser.id, foundUser.username, 'Login', 'Auth', 'User logged in');
      return true;
    }
    return false;
  };

  const logout = () => {
    if (user) {
      logActivity(user.id, user.username, 'Logout', 'Auth', 'User logged out');
    }
    setUser(null);
    localStorage.removeItem('umkm_auth_user');
  };

  const updateData = (newData: Partial<AppData>) => {
    const updated = { ...data, ...newData };
    setData(updated);
    saveStorageData(updated);
  };

  const refreshData = () => {
    setData(getStorageData());
  };

  return (
    <AppContext.Provider value={{ user, data, login, logout, updateData, refreshData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
