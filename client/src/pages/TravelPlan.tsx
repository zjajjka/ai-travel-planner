import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Mic, MapPin, DollarSign, Clock, Utensils, Hotel, Car, Camera } from 'lucide-react';
import axios from 'axios';

declare global {
  interface Window {
    AMap: any;
    AMapLoader: {
      load: (config: {
        key: string;
        version: string;
        plugins?: string[];
      }) => Promise<void>;
    };
  }
}

interface Activity {
  time: string;
  type: string;
  name: string;
  description: string;
  location: string;
  cost: number;
  duration: string;
}

interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
  totalCost: number;
}

interface TravelPlanData {
  destination: string;
  days: number;
  budget: number;
  itinerary: DayPlan[];
  summary: {
    totalCost: number;
    breakdown: {
      transportation?: number;
      accommodation?: number;
      food?: number;
      attractions?: number;
      other?: number;
    };
    tips: string[];
  };
}

export default function TravelPlan() {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [isCreating, setIsCreating] = useState(!planId);
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState<TravelPlanData | null>(null);
  const [voiceInput, setVoiceInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const [formData, setFormData] = useState({
    destination: '',
    days: 5,
    budget: 10000,
    travelers: 2,
    preferences: '',
  });

  useEffect(() => {
    if (planId) {
      fetchPlan(planId);
    }
    initMap();
  }, [planId]);

  useEffect(() => {
    if (planData && mapInstanceRef.current) {
      updateMapMarkers();
    }
  }, [planData]);

  const initMap = async () => {
    if (!mapRef.current) return;

    try {
      // 从后端获取高德地图key
      const response = await axios.get('/api/config/keys');
      const amapKey = response.data.amap?.key;
      
      if (!amapKey) {
        console.warn('高德地图API Key未配置，地图功能将不可用');
        return;
      }
      
      if (!window.AMapLoader) {
        console.error('高德地图加载器未找到');
        return;
      }

      window.AMapLoader.load({
        key: amapKey,
        version: '2.0',
        plugins: ['AMap.Geocoder', 'AMap.PlaceSearch'],
      }).then(() => {
        mapInstanceRef.current = new window.AMap.Map(mapRef.current, {
          zoom: 10,
          center: [116.397428, 39.90923], // 默认北京
        });
      }).catch((error: any) => {
        console.error('高德地图加载失败:', error);
      });
    } catch (error) {
      console.error('获取地图配置失败:', error);
    }
  };

  const updateMapMarkers = () => {
    if (!planData || !mapInstanceRef.current) return;

    // 清除旧标记
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 添加新标记
    planData.itinerary.forEach((day) => {
      day.activities.forEach((activity) => {
        if (activity.location) {
          // 地理编码获取坐标
          const geocoder = new window.AMap.Geocoder();
          geocoder.getLocation(activity.location, (status: string, result: any) => {
            if (status === 'complete' && result.geocodes.length > 0) {
              const location = result.geocodes[0].location;
              const marker = new window.AMap.Marker({
                position: location,
                title: activity.name,
              });
              marker.setMap(mapInstanceRef.current);
              markersRef.current.push(marker);
            }
          });
        }
      });
    });
  };

  const fetchPlan = async (id: string) => {
    try {
      const response = await axios.get(`/api/travel/plan/${id}`);
      if (response.data.success) {
        setPlanData(response.data.plan.plan_data);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Failed to fetch plan:', error);
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      setIsRecording(false);
      // 这里应该调用语音识别API
      // 暂时使用模拟数据
      setVoiceInput('我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子');
    } else {
      setIsRecording(true);
      // 开始录音
    }
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const input = voiceInput || `${formData.destination}，${formData.days}天，预算${formData.budget}元，${formData.travelers}人，${formData.preferences}`;

      const response = await axios.post('/api/travel/plan', {
        destination: formData.destination,
        days: formData.days,
        budget: formData.budget,
        travelers: formData.travelers,
        preferences: formData.preferences || input,
        userId: user?.id,
      });

      if (response.data.success) {
        setPlanData(response.data.plan);
        setIsCreating(false);
        if (response.data.planId) {
          navigate(`/plan/${response.data.planId}`);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.error || '生成计划失败');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    if (type.includes('餐厅') || type.includes('美食')) return <Utensils className="w-4 h-4" />;
    if (type.includes('住宿') || type.includes('酒店')) return <Hotel className="w-4 h-4" />;
    if (type.includes('交通')) return <Car className="w-4 h-4" />;
    return <Camera className="w-4 h-4" />;
  };

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
            <h1 className="text-xl font-semibold text-gray-800">
              {isCreating ? '创建旅行计划' : planData?.destination || '旅行计划'}
            </h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isCreating ? (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6">告诉我您的旅行需求</h2>

            <div className="mb-4">
              <button
                onClick={handleVoiceInput}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  isRecording
                    ? 'bg-red-500 text-white'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                <Mic className="w-5 h-5" />
                <span>{isRecording ? '停止录音' : '语音输入'}</span>
              </button>
              {voiceInput && (
                <div className="mt-2 p-3 bg-gray-50 rounded border">
                  <p className="text-sm text-gray-700">{voiceInput}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">目的地</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="例如：日本东京"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">天数</label>
                <input
                  type="number"
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">预算（元）</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">同行人数</label>
                <input
                  type="number"
                  value={formData.travelers}
                  onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">旅行偏好</label>
              <textarea
                value={formData.preferences}
                onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="例如：喜欢美食、动漫、带孩子、购物等"
              />
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={loading || !formData.destination}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'AI正在规划中...' : '生成旅行计划'}
            </button>
          </div>
        ) : planData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">行程概览</h2>
                <div className="space-y-4">
                  {planData.itinerary.map((day) => (
                    <div key={day.day} className="border-l-4 border-primary-500 pl-4">
                      <h3 className="font-semibold text-lg mb-2">
                        第 {day.day} 天 - {day.date}
                      </h3>
                      <div className="space-y-3">
                        {day.activities.map((activity, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded">
                            <div className="flex items-start space-x-3">
                              <div className="mt-1">{getActivityIcon(activity.type)}</div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{activity.name}</span>
                                  <span className="text-sm text-gray-500">{activity.time}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{activity.location}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{activity.duration}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <DollarSign className="w-3 h-3" />
                                    <span>¥{activity.cost}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        当天总费用: ¥{day.totalCost}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">费用预算</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>总预算</span>
                    <span className="font-semibold">¥{planData.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>预计总费用</span>
                    <span className="font-semibold">¥{planData.summary.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    {Object.entries(planData.summary.breakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="capitalize">{key}</span>
                        <span>¥{value?.toLocaleString() || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {planData.summary.tips && planData.summary.tips.length > 0 && (
                <div className="bg-blue-50 rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">实用建议</h2>
                  <ul className="list-disc list-inside space-y-1">
                    {planData.summary.tips.map((tip, idx) => (
                      <li key={idx} className="text-gray-700">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div ref={mapRef} className="w-full h-[800px]" />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">加载中...</div>
          </div>
        )}
      </div>
    </div>
  );
}

