'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { io } from 'socket.io-client';

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 1. Dastlabki buyurtmalarni yuklash
    fetchActiveOrders();

    // 2. Socket.io ulanish
    const userStr = localStorage.getItem('user');
    let restaurantId = null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        restaurantId = user.restaurant_id;
      } catch (e) {}
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';
    const newSocket = io(socketUrl);
    
    newSocket.on('connect', () => {
      console.log('KDS Socket connected');
    });

    if (restaurantId) {
      // Yangi buyurtma kelganda
      newSocket.on(`new_order_${restaurantId}`, (newOrder) => {
        setOrders(prev => {
          const exists = prev.find(o => o.id === newOrder.id);
          if (exists) return prev;
          return [...prev, newOrder];
        });
      });

      // Bitta taom holati o'zgarganda
      newSocket.on(`order_item_updated_${restaurantId}`, (updatedItem) => {
        setOrders(prev => prev.map(order => {
          if (order.id === updatedItem.order_id) {
            return {
              ...order,
              items: order.items.map(item => item.id === updatedItem.id ? updatedItem : item)
            };
          }
          return order;
        }));
      });
    }

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchActiveOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders?limit=50');
      const active = res.orders?.filter(o => o.status !== 'completed' && o.status !== 'cancelled') || [];
      
      const detailedOrders = await Promise.all(active.map(async (o) => {
        try {
          const detail = await api.get(`/orders/public/track/${o.id}`);
          return detail.order;
        } catch(e) { return o; }
      }));

      const pendingOrders = detailedOrders.filter(o => o.items && o.items.some(i => i.status !== 'ready'));
      
      setOrders(pendingOrders);
    } catch (error) {
      console.error('Failed to load active orders for KDS', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = async (itemId, newStatus) => {
    try {
      await api.put(`/orders/items/${itemId}/status`, { status: newStatus });
    } catch (error) {
      console.error('Update status failed', error);
      alert('Xatolik yuz berdi');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-white">Yuklanmoqda...</div>;
  }

  return (
    <div className="p-6 bg-gray-900 min-h-[80vh] text-white rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🍳 Oshxona Ekrami (Jonli)</h1>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm text-gray-400">Tizim ulanishi faol</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500 text-xl">
            Hozircha yangi buyurtmalar yo'q
          </div>
        ) : (
          orders.map(order => {
            if (!order.items || order.items.every(i => i.status === 'ready')) return null;

            return (
              <div key={order.id} className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden flex flex-col">
                <div className="bg-gray-700 p-4 border-b border-gray-600 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">Buyurtma #{order.id}</h2>
                    <p className="text-sm text-gray-400">
                      {order.table_number ? `Stol: ${order.table_number}` : (order.order_type === 'takeaway' ? 'Olib ketish' : 'Yetkazish')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded-md">
                      {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col gap-3">
                  {order.notes && (
                    <div className="bg-yellow-900/30 text-yellow-500 p-2 rounded text-sm mb-2 border border-yellow-700/50">
                      📝 Izoh: {order.notes}
                    </div>
                  )}

                  {order.items.map(item => {
                    if (item.status === 'ready') return null;
                    
                    return (
                      <div key={item.id} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-700">
                        <div>
                          <p className="font-semibold text-lg">{item.quantity}x {item.item_name}</p>
                        </div>
                        <div className="flex gap-2">
                          {item.status === 'pending' || !item.status ? (
                            <button 
                              onClick={() => updateItemStatus(item.id, 'cooking')}
                              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors font-medium text-sm"
                            >
                              🔥 Boshlash
                            </button>
                          ) : item.status === 'cooking' ? (
                            <button 
                              onClick={() => updateItemStatus(item.id, 'ready')}
                              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium text-sm shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                            >
                              ✅ Tayyor
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
