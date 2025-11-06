import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';
import { ArrowLeft, Save, CheckCircle, XCircle } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { keysStatus, loading, saveKeys } = useConfig();
  const [formData, setFormData] = useState({
    xfyun: {
      appId: '',
      apiKey: '',
      apiSecret: '',
    },
    amap: {
      key: '',
    },
    aliyun: {
      apiKey: '',
      apiSecret: '',
      endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    },
    supabase: {
      url: '',
      anonKey: '',
    },
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveKeys(formData);
      setMessage({ type: 'success', text: 'API密钥保存成功！' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  const StatusIcon = ({ configured }: { configured: boolean }) => {
    return configured ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">API 密钥配置</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-8">
          {/* 科大讯飞配置 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">科大讯飞语音识别</h2>
              {keysStatus && <StatusIcon configured={keysStatus.xfyun.configured} />}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">App ID</label>
                <input
                  type="text"
                  value={formData.xfyun.appId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      xfyun: { ...formData.xfyun, appId: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="您的科大讯飞 App ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input
                  type="password"
                  value={formData.xfyun.apiKey}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      xfyun: { ...formData.xfyun, apiKey: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="您的科大讯飞 API Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Secret</label>
                <input
                  type="password"
                  value={formData.xfyun.apiSecret}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      xfyun: { ...formData.xfyun, apiSecret: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="您的科大讯飞 API Secret"
                />
              </div>
            </div>
          </div>

          {/* 高德地图配置 */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">高德地图</h2>
              {keysStatus && <StatusIcon configured={keysStatus.amap.configured} />}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input
                type="password"
                value={formData.amap.key}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amap: { ...formData.amap, key: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="您的高德地图 API Key"
              />
            </div>
          </div>

          {/* 阿里云大模型配置 */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">阿里云通义千问</h2>
              {keysStatus && <StatusIcon configured={keysStatus.aliyun.configured} />}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input
                  type="password"
                  value={formData.aliyun.apiKey}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aliyun: { ...formData.aliyun, apiKey: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="您的阿里云 API Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Secret</label>
                <input
                  type="password"
                  value={formData.aliyun.apiSecret}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aliyun: { ...formData.aliyun, apiSecret: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="您的阿里云 API Secret"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint（可选）</label>
                <input
                  type="text"
                  value={formData.aliyun.endpoint}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aliyun: { ...formData.aliyun, endpoint: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="API 端点地址"
                />
              </div>
            </div>
          </div>

          {/* Supabase配置 */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Supabase</h2>
              {keysStatus && <StatusIcon configured={keysStatus.supabase.configured} />}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project URL</label>
                <input
                  type="text"
                  value={formData.supabase.url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supabase: { ...formData.supabase, url: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="https://your-project.supabase.co"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Anon Key</label>
                <input
                  type="password"
                  value={formData.supabase.anonKey}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supabase: { ...formData.supabase, anonKey: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="您的 Supabase Anon Key"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? '保存中...' : '保存配置'}</span>
            </button>
            <p className="mt-4 text-sm text-gray-500">
              提示：所有API密钥将安全存储在服务器配置文件中，不会暴露在前端代码中。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

