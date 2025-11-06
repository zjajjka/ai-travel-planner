import { Router } from 'express';
import { getApiKeys, saveApiKeys } from '../utils/config';

export const configRoutes = Router();

// 获取API密钥配置（不返回敏感信息）
configRoutes.get('/keys', (req, res) => {
  try {
    const keys = getApiKeys();
    // 只返回是否已配置，不返回实际密钥
    res.json({
      xfyun: {
        configured: !!(keys.xfyun?.appId && keys.xfyun?.apiKey && keys.xfyun?.apiSecret),
      },
      amap: {
        configured: !!keys.amap?.key,
        key: keys.amap?.key || null, // 高德地图key可以在前端使用
      },
      aliyun: {
        configured: !!(keys.aliyun?.apiKey && keys.aliyun?.apiSecret),
      },
      supabase: {
        configured: !!(keys.supabase?.url && keys.supabase?.anonKey),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 保存API密钥配置
configRoutes.post('/keys', (req, res) => {
  try {
    const { xfyun, amap, aliyun, supabase } = req.body;
    saveApiKeys({ xfyun, amap, aliyun, supabase });
    res.json({ success: true, message: 'API keys saved successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

