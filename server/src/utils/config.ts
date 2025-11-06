import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

interface ApiKeys {
  xfyun?: {
    appId?: string;
    apiKey?: string;
    apiSecret?: string;
  };
  amap?: {
    key?: string;
  };
  aliyun?: {
    apiKey?: string;
    apiSecret?: string;
    endpoint?: string;
  };
  supabase?: {
    url?: string;
    anonKey?: string;
  };
}

const CONFIG_DIR = process.env.CONFIG_DIR || '/app/config';
const CONFIG_FILE = path.join(CONFIG_DIR, 'api-keys.json');

let cachedConfig: ApiKeys | null = null;

export function getApiKeys(): ApiKeys {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      cachedConfig = JSON.parse(data);
      return cachedConfig || {};
    }
  } catch (error) {
    console.error('Error reading config file:', error);
  }

  // 从环境变量读取（备用方案）
  return {
    xfyun: {
      appId: process.env.XFYUN_APP_ID,
      apiKey: process.env.XFYUN_API_KEY,
      apiSecret: process.env.XFYUN_API_SECRET,
    },
    amap: {
      key: process.env.AMAP_KEY,
    },
    aliyun: {
      apiKey: process.env.ALIYUN_API_KEY,
      apiSecret: process.env.ALIYUN_API_SECRET,
      endpoint: process.env.ALIYUN_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    },
    supabase: {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
    },
  };
}

export function saveApiKeys(keys: ApiKeys): void {
  try {
    // 确保配置目录存在
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    // 读取现有配置
    let existingConfig: ApiKeys = {};
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      existingConfig = JSON.parse(data);
    }

    // 合并配置（只更新提供的键）
    const mergedConfig = { ...existingConfig };
    if (keys.xfyun) {
      mergedConfig.xfyun = { ...mergedConfig.xfyun, ...keys.xfyun };
    }
    if (keys.amap) {
      mergedConfig.amap = { ...mergedConfig.amap, ...keys.amap };
    }
    if (keys.aliyun) {
      mergedConfig.aliyun = { ...mergedConfig.aliyun, ...keys.aliyun };
    }
    if (keys.supabase) {
      mergedConfig.supabase = { ...mergedConfig.supabase, ...keys.supabase };
    }

    // 保存到文件
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(mergedConfig, null, 2), 'utf-8');
    cachedConfig = mergedConfig;
  } catch (error) {
    console.error('Error saving config file:', error);
    throw error;
  }
}

export function getSupabaseClient() {
  const keys = getApiKeys();
  if (!keys.supabase?.url || !keys.supabase?.anonKey) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(keys.supabase.url, keys.supabase.anonKey);
}

