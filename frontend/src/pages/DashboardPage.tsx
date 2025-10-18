import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTrip } from '../contexts/TripContext';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MapPinIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { trips, loading, fetchTrips } = useTrip();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateTrip = () => {
    navigate('/create-trip');
  };

  const handleTripClick = (tripId: number) => {
    navigate(`/trips/${tripId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">智能旅行规划</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">欢迎，{user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎区域 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            欢迎回来，{user?.username}！
          </h2>
          <p className="text-gray-600">
            管理您的旅行计划，让AI为您规划完美的旅程
          </p>
        </div>

        {/* 创建新旅行按钮 */}
        <div className="mb-8">
          <button
            onClick={handleCreateTrip}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            创建新旅行
          </button>
        </div>

        {/* 旅行列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">还没有旅行计划</h3>
              <p className="text-gray-600 mb-4">创建您的第一个AI旅行规划</p>
              <button
                onClick={handleCreateTrip}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                开始规划
              </button>
            </div>
          ) : (
            trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => handleTripClick(trip.id)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {trip.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    trip.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                    trip.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {trip.status === 'planning' ? '规划中' :
                     trip.status === 'active' ? '进行中' : '已完成'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {trip.destination}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(new Date(trip.start_date), 'yyyy-MM-dd')} - {format(new Date(trip.end_date), 'yyyy-MM-dd')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    预算: ¥{trip.budget.toLocaleString()}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    创建于 {format(new Date(trip.created_at), 'yyyy-MM-dd')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
