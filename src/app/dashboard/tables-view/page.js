'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function TablesViewPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const res = await api.getTables();
      setTables(res.tables || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Stollar Xaritasi (Ofitsiant)</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}></div>
            <span style={{ fontSize: '12px' }}>Bo'sh</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: 'rgba(225, 112, 85, 0.2)', border: '1px solid var(--accent-red)' }}></div>
            <span style={{ fontSize: '12px' }}>Band</span>
          </div>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
        gap: '20px',
        padding: '20px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '15px',
        border: '1px dashed rgba(255,255,255,0.1)'
      }}>
        {tables.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>Stollar mavjud emas</p>
        ) : (
          tables.map(table => {
            const isOccupied = table.status === 'occupied';
            return (
              <div 
                key={table.id}
                style={{
                  height: '120px',
                  borderRadius: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: '0.3s',
                  background: isOccupied ? 'rgba(225, 112, 85, 0.1)' : 'var(--bg-secondary)',
                  border: `2px solid ${isOccupied ? 'var(--accent-red)' : 'var(--border-color)'}`,
                  boxShadow: isOccupied ? '0 0 15px rgba(225, 112, 85, 0.2)' : 'none'
                }}
                onClick={() => {
                  if(!isOccupied) {
                    window.location.href = `/dashboard/order-take?table=${table.table_number}`;
                  } else {
                    alert('Bu stol band! Boshqa stol tanlang yoki buyurtmalar menyusidan qarab chiqing.');
                  }
                }}
              >
                <div style={{ fontSize: '30px', marginBottom: '5px' }}>🪑</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>#{table.table_number}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {table.capacity} kishilik
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
