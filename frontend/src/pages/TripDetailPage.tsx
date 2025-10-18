import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { MapPinIcon, CalendarIcon, CurrencyDollarIcon, PlusIcon } from '@heroicons/react/24/outline';

const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTrip, loading, getTrip, addExpense } = useTrip();
  const { user } = useAuth();
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (id) {
      getTrip(parseInt(id));
    }
  }, [id]);

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const success = await addExpense(parseInt(id), {
      ...expenseForm,
      amount: parseFloat(expenseForm.amount)
    });

    if (success) {
      setExpenseForm({
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowAddExpense(false);
      // 重新获取旅行详情
      getTrip(parseInt(id));
    }
  };

  const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setExpenseForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">旅行不存在</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-500"
          >
            返回仪表板
          </button>
        </div>
      </div>
    );
  }

  const totalSpent = currentTrip.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const budgetRemaining = currentTrip.budget - totalSpent;

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
              <h1 className="text-xl font-semibold text-gray-900">{currentTrip.title}</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 旅行概览 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center">
              <MapPinIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">目的地</p>
                <p className="text-lg font-semibold text-gray-900">{currentTrip.destination}</p>
              </div>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">日期</p>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(currentTrip.start_date), 'MM-dd')} - {format(new Date(currentTrip.end_date), 'MM-dd')}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">预算</p>
                <p className="text-lg font-semibold text-gray-900">¥{currentTrip.budget.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-semibold">{currentTrip.travelers_count}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">人数</p>
                <p className="text-lg font-semibold text-gray-900">{currentTrip.travelers_count}人</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：行程安排 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">行程安排</h2>
              
              {currentTrip.days && currentTrip.days.length > 0 ? (
                <div className="space-y-6">
                  {currentTrip.days.map((day) => (
                    <div key={day.id} className="border-l-4 border-indigo-500 pl-4">
                      <h3 className="text-md font-semibold text-gray-900 mb-2">
                        第{day.day_number}天 - {format(new Date(day.date), 'yyyy-MM-dd')}
                      </h3>
                      {day.notes && (
                        <p className="text-sm text-gray-600 mb-3">{day.notes}</p>
                      )}
                      {day.activities && day.activities.length > 0 ? (
                        <div className="space-y-2">
                          {day.activities.map((activity) => (
                            <div key={activity.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-900">{activity.title}</h4>
                                  {activity.description && (
                                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                  )}
                                  {activity.location && (
                                    <p className="text-xs text-gray-500 mt-1">📍 {activity.location}</p>
                                  )}
                                </div>
                                {activity.cost > 0 && (
                                  <span className="text-sm font-medium text-green-600">¥{activity.cost}</span>
                                )}
                              </div>
                              {activity.start_time && activity.end_time && (
                                <p className="text-xs text-gray-500 mt-2">
                                  🕐 {activity.start_time} - {activity.end_time}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">暂无活动安排</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无行程安排</p>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：费用管理 */}
          <div className="space-y-6">
            {/* 费用概览 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">费用概览</h2>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  添加
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">总预算</span>
                  <span className="text-sm font-medium text-gray-900">¥{currentTrip.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">已花费</span>
                  <span className="text-sm font-medium text-red-600">¥{totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">剩余预算</span>
                  <span className={`text-sm font-medium ${budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ¥{budgetRemaining.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${budgetRemaining >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, (totalSpent / currentTrip.budget) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 费用列表 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">费用记录</h3>
              
              {currentTrip.expenses && currentTrip.expenses.length > 0 ? (
                <div className="space-y-3">
                  {currentTrip.expenses.map((expense) => (
                    <div key={expense.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{expense.description}</h4>
                          <p className="text-sm text-gray-600">{expense.category}</p>
                          <p className="text-xs text-gray-500">{expense.date}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-900">¥{expense.amount}</span>
                      </div>
                      {expense.notes && (
                        <p className="text-xs text-gray-500 mt-2">{expense.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">暂无费用记录</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 添加费用模态框 */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">添加费用</h3>
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">类别</label>
                  <select
                    name="category"
                    value={expenseForm.category}
                    onChange={handleExpenseChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">选择类别</option>
                    <option value="accommodation">住宿</option>
                    <option value="food">餐饮</option>
                    <option value="transport">交通</option>
                    <option value="attraction">景点</option>
                    <option value="shopping">购物</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">描述</label>
                  <input
                    type="text"
                    name="description"
                    value={expenseForm.description}
                    onChange={handleExpenseChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="费用描述"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">金额</label>
                  <input
                    type="number"
                    name="amount"
                    value={expenseForm.amount}
                    onChange={handleExpenseChange}
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">日期</label>
                  <input
                    type="date"
                    name="date"
                    value={expenseForm.date}
                    onChange={handleExpenseChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">备注</label>
                  <textarea
                    name="notes"
                    value={expenseForm.notes}
                    onChange={handleExpenseChange}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="备注信息"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    添加
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetailPage;
