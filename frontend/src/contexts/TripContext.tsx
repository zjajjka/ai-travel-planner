import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Trip {
  id: number;
  user_id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  travelers_count: number;
  preferences: string;
  status: string;
  created_at: string;
  updated_at: string;
  days?: TripDay[];
  expenses?: Expense[];
}

interface TripDay {
  id: number;
  trip_id: number;
  day_number: number;
  date: string;
  notes: string;
  activities: Activity[];
}

interface Activity {
  id: number;
  trip_day_id: number;
  title: string;
  description: string;
  activity_type: string;
  start_time: string;
  end_time: string;
  location: string;
  cost: number;
  notes: string;
}

interface Expense {
  id: number;
  trip_id: number;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  notes: string;
}

interface TripContextType {
  trips: Trip[];
  currentTrip: Trip | null;
  loading: boolean;
  fetchTrips: () => Promise<void>;
  createTrip: (tripData: Partial<Trip>) => Promise<Trip | null>;
  updateTrip: (id: number, tripData: Partial<Trip>) => Promise<boolean>;
  deleteTrip: (id: number) => Promise<boolean>;
  getTrip: (id: number) => Promise<Trip | null>;
  addExpense: (tripId: number, expenseData: Partial<Expense>) => Promise<boolean>;
  generateAIPlan: (tripData: any) => Promise<any>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const useTrip = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};

interface TripProviderProps {
  children: ReactNode;
}

export const TripProvider: React.FC<TripProviderProps> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTrips = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get('/api/trips/');
      setTrips(response.data.trips);
    } catch (error: any) {
      const message = error.response?.data?.error || '获取旅行列表失败';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: Partial<Trip>): Promise<Trip | null> => {
    try {
      setLoading(true);
      const response = await axios.post('/api/trips/', tripData);
      const newTrip = response.data.trip;
      setTrips(prev => [newTrip, ...prev]);
      toast.success('旅行创建成功！');
      return newTrip;
    } catch (error: any) {
      const message = error.response?.data?.error || '创建旅行失败';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTrip = async (id: number, tripData: Partial<Trip>): Promise<boolean> => {
    try {
      setLoading(true);
      await axios.put(`/api/trips/${id}`, tripData);
      setTrips(prev => prev.map(trip => 
        trip.id === id ? { ...trip, ...tripData } : trip
      ));
      if (currentTrip?.id === id) {
        setCurrentTrip(prev => prev ? { ...prev, ...tripData } : null);
      }
      toast.success('旅行更新成功！');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || '更新旅行失败';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await axios.delete(`/api/trips/${id}`);
      setTrips(prev => prev.filter(trip => trip.id !== id));
      if (currentTrip?.id === id) {
        setCurrentTrip(null);
      }
      toast.success('旅行删除成功！');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || '删除旅行失败';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTrip = async (id: number): Promise<Trip | null> => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/trips/${id}`);
      const trip = response.data.trip;
      setCurrentTrip(trip);
      return trip;
    } catch (error: any) {
      const message = error.response?.data?.error || '获取旅行详情失败';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (tripId: number, expenseData: Partial<Expense>): Promise<boolean> => {
    try {
      setLoading(true);
      await axios.post(`/api/trips/${tripId}/expenses`, expenseData);
      toast.success('支出记录成功！');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || '记录支出失败';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateAIPlan = async (tripData: any): Promise<any> => {
    try {
      setLoading(true);
      const response = await axios.post('/api/ai/plan', tripData);
      toast.success('AI行程规划生成成功！');
      return response.data.plan;
    } catch (error: any) {
      const message = error.response?.data?.error || 'AI行程规划失败';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value: TripContextType = {
    trips,
    currentTrip,
    loading,
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    getTrip,
    addExpense,
    generateAIPlan
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};
