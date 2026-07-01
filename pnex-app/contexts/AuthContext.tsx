import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { apiService } from '../services/api';

interface User {
  _id: string;
  phone: string;
  name: string;
  handle: string;
  memberNo: number;
  tier: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, code: string) => Promise<void>;
  registerWithInvite: (inviteCode: string, name: string, handle?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          storage.getAccessToken(),
          storage.getUser(),
        ]);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (phone: string, code: string) => {
    const result = await apiService.auth.verifyOtp(phone, code);
    const userData: User = {
      _id: result._id,
      phone: result.phone,
      name: result.name,
      handle: result.handle,
      memberNo: result.memberNo,
      tier: result.tier,
    };
    await Promise.all([
      storage.setTokens(result.accessToken, result.refreshToken),
      storage.setUser(userData),
    ]);
    setToken(result.accessToken);
    setUser(userData);
  }, []);

  const registerWithInvite = useCallback(async (inviteCode: string, name: string, handle?: string) => {
    const result = await apiService.auth.registerWithInvite(inviteCode, name, handle);
    const userData: User = {
      _id: result._id,
      phone: result.phone,
      name: result.name,
      handle: result.handle,
      memberNo: result.memberNo,
      tier: result.tier,
    };
    await Promise.all([
      storage.setTokens(result.accessToken, result.refreshToken),
      storage.setUser(userData),
    ]);
    setToken(result.accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await storage.clear();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, registerWithInvite, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
