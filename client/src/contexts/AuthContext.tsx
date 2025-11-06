import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储的token
    const token = localStorage.getItem('supabase_token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await axios.get('/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('supabase_token');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/signin', { email, password });
    if (response.data.success && response.data.session) {
      localStorage.setItem('supabase_token', response.data.session.access_token);
      setUser(response.data.user);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const response = await axios.post('/api/auth/signup', { email, password, name });
    if (response.data.success && response.data.user) {
      // 注册后自动登录
      await signIn(email, password);
    }
  };

  const signOut = async () => {
    try {
      await axios.post('/api/auth/signout');
    } catch (error) {
      console.error('Sign out error:', error);
    }
    localStorage.removeItem('supabase_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

