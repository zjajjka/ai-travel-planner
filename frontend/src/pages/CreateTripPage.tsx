import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTrip } from '../contexts/TripContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import VoiceInput from '../components/VoiceInput';
import toast from 'react-hot-toast';

const CreateTripPage: React.FC = () => {
  const { user } = useAuth();
  const { createTrip, generateAIPlan, loading } = useTrip();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget: '',
    travelers_count: '1',
    preferences: {
      food: false,
      culture: false,
      nature: false,
      adventure: false,
      shopping: false,
      relaxation: false
    }
  });

  const [aiPlan, setAiPlan] = useState<any>(null);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [name]: checkbox.checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleVoiceTranscript = (text: string) => {
    // 简单的语音解析逻辑
    const lowerText = text.toLowerCase();
    
    // 提取目的地
    const destinationMatch = text.match(/去(.+?)(?:旅行|旅游|玩)/);
    if (destinationMatch) {
      setFormData(prev => ({ ...prev, destination: destinationMatch[1].trim() }));
    }
    
    // 提取预算
    const budgetMatch = text.match(/(\d+)(?:万|千|元)/);
    if (budgetMatch) {
      let budget = parseInt(budgetMatch[1]);
      if (text.includes('万')) budget *= 10000;
      else if (text.includes('千')) budget *= 1000;
      setFormData(prev => ({ ...prev, budget: budget.toString() }));
    }
    
    // 提取天数
    const daysMatch = text.match(/(\d+)天/);
    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + days - 1);
      
      setFormData(prev => ({
        ...prev,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      }));
    }
    
    // 提取偏好
    if (lowerText.includes('美食') || lowerText.includes('吃')) {
      setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, food: true } }));
    }
    if (lowerText.includes('文化') || lowerText.includes('历史')) {
      setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, culture: true } }));
    }
    if (lowerText.includes('自然') || lowerText.includes('风景')) {
      setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, nature: true } }));
    }
    
    toast.success('语音信息已解析并填入表单');
  };

  const handleGenerateAIPlan = async () => {
    if (!formData.destination || !formData.start_date || !formData.end_date || !formData.budget) {
      toast.error('请填写完整的基本信息');
      return;
    }

    const planData = {
      destination: formData.destination,
      start_date: formData.start_date,
      end_date: formData.end_date,
      budget: parseFloat(formData.budget),
      travelers_count: parseInt(formData.travelers_count),
      preferences: formData.preferences
    };

    const plan = await generateAIPlan(planData);
    if (plan) {
      setAiPlan(plan);
    }
  };

  const handleCreateTrip = async () => {
    if (!formData.title || !formData.destination || !formData.start_date || !formData.end_date || !formData.budget) {
      toast.error('请填写所有必填字段');
      return;
    }

    const tripData = {
      title: formData.title || `${formData.destination}之旅`,
      destination: formData.destination,
      start_date: formData.start_date,
      end_date: formData.end_date,
      budget: parseFloat(formData.budget),
      travelers_count: parseInt(formData.travelers_count),
      preferences: JSON.stringify(formData.preferences)
    };

    const trip = await createTrip(tripData);
    if (trip) {
      navigate(`/trips/${trip.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-indigo-600 hover:text-indigo-500 mr-4"
              >
                ← 返回
              </button>
              <h1 className="text-xl font-semibold text-gray-900">创建新旅行</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：表单 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">旅行基本信息</h2>
            
            {/* 语音输入 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-gray-900">语音输入</h3>
                <button
                  onClick={() => setShowVoiceInput(!showVoiceInput)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  {showVoiceInput ? '隐藏' : '显示'}语音输入
                </button>
              </div>
              
              {showVoiceInput && (
                <VoiceInput onTranscript={handleVoiceTranscript} disabled={loading} />
              )}
            </div>

            <form className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  旅行标题
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="例如：日本东京5日游"
                />
              </div>

              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                  目的地 *
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="例如：日本东京"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                    出发日期 *
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                    返回日期 *
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                    预算 (元) *
                  </label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                    min="0"
                    step="100"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label htmlFor="travelers_count" className="block text-sm font-medium text-gray-700">
                    同行人数
                  </label>
                  <input
                    type="number"
                    id="travelers_count"
                    name="travelers_count"
                    value={formData.travelers_count}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  旅行偏好
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(formData.preferences).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        name={key}
                        checked={value}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {key === 'food' ? '美食' :
                         key === 'culture' ? '文化' :
                         key === 'nature' ? '自然' :
                         key === 'adventure' ? '冒险' :
                         key === 'shopping' ? '购物' :
                         '休闲'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleGenerateAIPlan}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? '生成中...' : 'AI生成行程规划'}
                </button>
                <button
                  type="button"
                  onClick={handleCreateTrip}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? '创建中...' : '创建旅行'}
                </button>
              </div>
            </form>
          </div>

          {/* 右侧：AI规划结果 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">AI行程规划</h2>
            
            {aiPlan ? (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">规划概览</h3>
                  <p className="text-sm text-blue-800">
                    目的地：{aiPlan.destination}<br/>
                    天数：{aiPlan.total_days}天<br/>
                    预算：¥{aiPlan.total_budget?.toLocaleString()}<br/>
                    平均每日：¥{aiPlan.summary?.average_daily_cost?.toFixed(0)}
                  </p>
                </div>

                {aiPlan.day_plans?.map((day: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">第{day.day_number}天 - {day.date}</h4>
                    <div className="space-y-2">
                      {day.activities?.map((activity: any, actIndex: number) => (
                        <div key={actIndex} className="text-sm text-gray-600">
                          <span className="font-medium">{activity.time}</span> - {activity.title}
                          {activity.cost > 0 && (
                            <span className="text-green-600 ml-2">¥{activity.cost}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      预估费用：¥{day.estimated_cost?.toFixed(0)}
                    </div>
                  </div>
                ))}

                {aiPlan.summary?.recommendations && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">建议</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {aiPlan.summary.recommendations.map((rec: string, index: number) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI行程规划</h3>
                <p className="text-gray-600">填写基本信息后，点击"AI生成行程规划"按钮</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTripPage;
