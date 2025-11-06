import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface ApiKeysStatus {
  xfyun: { configured: boolean };
  amap: { configured: boolean };
  aliyun: { configured: boolean };
  supabase: { configured: boolean };
}

interface ConfigContextType {
  keysStatus: ApiKeysStatus | null;
  loading: boolean;
  refreshStatus: () => Promise<void>;
  saveKeys: (keys: any) => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [keysStatus, setKeysStatus] = useState<ApiKeysStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStatus = async () => {
    try {
      const response = await axios.get('/api/config/keys');
      setKeysStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch config status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const saveKeys = async (keys: any) => {
    try {
      await axios.post('/api/config/keys', keys);
      await refreshStatus();
    } catch (error) {
      console.error('Failed to save keys:', error);
      throw error;
    }
  };

  return (
    <ConfigContext.Provider value={{ keysStatus, loading, refreshStatus, saveKeys }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

