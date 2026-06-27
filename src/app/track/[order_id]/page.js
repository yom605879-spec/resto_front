'use client';

import { useState, useEffect, use } from 'react';
import { api } from '@/lib/api';
import { io } from 'socket.io-client';
import Link from 'next/link';

export default function TrackOrderPage({ params }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.order_id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/public/track/${orderId}`);
      setOrder(res.order);
      setupSocket(res.order.restaurant_id);
    } catch (err) {
      console.error('Track order fetch error:', err);
      setError('Buyurtma topilmadi yoki xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = (restaurantId) => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';
    const newSocket = io(socketUrl);

    newSocket.on('connect', () => {
      console.log('Tracking socket connected');
    });

    newSocket.on(`order_item_updated_${restaurantId}`, (updatedItem) => {
      if (updatedItem.order_id === parseInt(orderId)) {
        setOrder(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map(item => item.id === updatedItem.id ? { ...item, status: updatedItem.status } : item)
          };
        });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Voy!</h1>
        <p className="text-gray-600">{error}</p>
        <Link href="/" className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-lg font-medium">Bosh sahifaga qaytish</Link>
      </div>
    );
  }

  const allReady = order.items && order.items.length > 0 && order.items.every(i => i.status === 'ready');
  const anyCooking = order.items && order.items.some(i => i.status === 'cooking');
  const statusColor = allReady ? 'bg-green-500' : (anyCooking ? 'bg-yellow-500' : 'bg-blue-500');
  const statusText = allReady ? 'Buyurtmangiz tayyor! Yoqimli ishtaha!' : (anyCooking ? 'Oshxonada pishirilmoqda...' : 'Oshpazlar qabul qilishi kutilmoqda');

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm sticky top-0 z-10 text-center py-4">
        <h1 className="text-xl font-bold text-gray-900">Kuzatuv Ekrami</h1>
        <p className="text-sm text-gray-500">Buyurtma #{order.id}</p>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center mb-6 relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${statusColor} animate-pulse`}></div>
          <div className="text-5xl mb-4 mt-2">
            {allReady ? '🎉' : (anyCooking ? '🍳' : '⏳')}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{statusText}</h2>
          <p className="text-sm text-gray-500">
            {order.table_number ? `Sizning stolingiz: ${order.table_number}` : (order.order_type === 'takeaway' ? 'Olib ketish' : 'Yetkazish')}
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Buyurtma tafsiloti</h3>
            <span className="text-sm font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
              {new Intl.NumberFormat('uz-UZ').format(order.total_amount)} UZS
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items.map(item => {
              const itemStatus = item.status || 'pending';
              const statusColors = {
                pending: 'text-blue-500 bg-blue-50',
                cooking: 'text-yellow-600 bg-yellow-50',
                ready: 'text-green-600 bg-green-50'
              };
              const statusLabels = {
                pending: 'Kutilmoqda',
                cooking: 'Pishmoqda',
                ready: 'Tayyor'
              };

              return (
                <div key={item.id} className="p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.item_name}</p>
                    <p className="text-sm text-gray-500">{item.quantity} x {new Intl.NumberFormat('uz-UZ').format(item.price)} UZS</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[itemStatus]}`}>
                    {statusLabels[itemStatus]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Link 
            href={`/menu/${order.restaurant_id}${order.table_number ? `?table=${order.table_number}` : ''}`}
            className="flex-1 text-center py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            Yana nimadir qo'shish
          </Link>
        </div>
      </main>
    </div>
  );
}
