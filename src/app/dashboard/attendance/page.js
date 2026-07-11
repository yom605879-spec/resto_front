'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

const STATUS_MAP = {
  present: { label: 'Keldi',    color: '#10b981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.35)',  icon: '✅' },
  absent:  { label: 'Kelmadi',  color: '#f0705a', bg: 'rgba(240,112,90,0.15)',  border: 'rgba(240,112,90,0.35)',  icon: '❌' },
  late:    { label: 'Kech keldi',color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', icon: '⏰' },
  leave:   { label: 'Ta\'tilga', color: '#3b9ddd', bg: 'rgba(59,157,221,0.15)', border: 'rgba(59,157,221,0.35)',  icon: '🏖️' },
};

const ROLES_UZ = {
  boss: 'Boss', admin: 'Admin', kassir: 'Kassir',
  oshpaz: 'Oshpaz', ofitsiant: 'Ofitsiant',
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}
function formatTime(t) {
  if (!t) return '—';
  return t.slice(0, 5);
}

export default function AttendancePage() {
  const [tab, setTab] = useState('today'); // 'today' | 'month'
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());

  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  const [editModal, setEditModal] = useState(null); // { record, staff }
  const [editForm, setEditForm] = useState({ status: 'present', check_in: '', check_out: '', notes: '' });

  const loadToday = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, attRes] = await Promise.all([
        api.getStaff(),
        api.getAttendance(`date=${selectedDate}`),
      ]);
      setStaff(Array.isArray(staffRes) ? staffRes : staffRes.staff || []);
      setAttendance(attRes.attendance || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAttendanceSummary(selectedMonth);
      setSummary(res.summary || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (tab === 'today') loadToday();
    else loadSummary();
  }, [tab, loadToday, loadSummary]);

  // Quick mark status (no modal)
  const quickMark = async (staffMember, status) => {
    const key = staffMember.id;
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      const existing = attendance.find(a => a.staff_id === staffMember.id);
      if (existing) {
        await api.updateAttendance(existing.id, { status });
      } else {
        await api.markAttendance({
          staff_id: staffMember.id,
          status,
          work_date: selectedDate,
        });
      }
      await loadToday();
    } catch (e) {
      alert('Xatolik: ' + e.message);
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const openEditModal = (staffMember) => {
    const existing = attendance.find(a => a.staff_id === staffMember.id);
    setEditForm({
      status: existing?.status || 'present',
      check_in: existing?.check_in ? existing.check_in.slice(0, 5) : '',
      check_out: existing?.check_out ? existing.check_out.slice(0, 5) : '',
      notes: existing?.notes || '',
    });
    setEditModal({ record: existing, staff: staffMember });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    const { record, staff: s } = editModal;
    try {
      if (record) {
        await api.updateAttendance(record.id, editForm);
      } else {
        await api.markAttendance({
          staff_id: s.id,
          work_date: selectedDate,
          ...editForm,
        });
      }
      setEditModal(null);
      await loadToday();
    } catch (e) {
      alert('Xatolik: ' + e.message);
    }
  };

  // Bulk mark all present
  const markAllPresent = async () => {
    setLoading(true);
    try {
      for (const s of staff) {
        const existing = attendance.find(a => a.staff_id === s.id);
        if (!existing || existing.status !== 'present') {
          await api.markAttendance({ staff_id: s.id, status: 'present', work_date: selectedDate });
        }
      }
      await loadToday();
    } catch (e) {
      alert('Xatolik: ' + e.message);
      setLoading(false);
    }
  };

  // Stats for today header
  const statsToday = {
    present: attendance.filter(a => a.status === 'present').length,
    absent:  attendance.filter(a => a.status === 'absent').length,
    late:    attendance.filter(a => a.status === 'late').length,
    leave:   attendance.filter(a => a.status === 'leave').length,
    total:   staff.length,
    unmarked: staff.length - attendance.length,
  };

  if (loading && staff.length === 0 && summary.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
        <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 15 }}>Davomat ma&apos;lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* ── Edit Modal ──────────────────────────────────────────── */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0 }}>
                {editModal.staff.first_name} {editModal.staff.last_name || ''} — Davomat
              </h3>
              <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
            </div>

            <form onSubmit={saveEdit}>
              {/* Status chips */}
              <div className="auth-form-group">
                <label>Holat</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {Object.entries(STATUS_MAP).map(([key, s]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEditForm(f => ({ ...f, status: key }))}
                      style={{
                        padding: '12px 10px',
                        borderRadius: 12,
                        border: editForm.status === key ? `2px solid ${s.color}` : '1px solid rgba(255,255,255,0.08)',
                        background: editForm.status === key ? s.bg : 'rgba(255,255,255,0.03)',
                        color: editForm.status === key ? s.color : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="auth-form-group">
                  <label>Kelish vaqti</label>
                  <input type="time" className="auth-input" value={editForm.check_in}
                    onChange={e => setEditForm(f => ({ ...f, check_in: e.target.value }))} />
                </div>
                <div className="auth-form-group">
                  <label>Ketish vaqti</label>
                  <input type="time" className="auth-input" value={editForm.check_out}
                    onChange={e => setEditForm(f => ({ ...f, check_out: e.target.value }))} />
                </div>
              </div>

              <div className="auth-form-group">
                <label>Izoh (ixtiyoriy)</label>
                <textarea className="auth-input" rows={2} placeholder="Masalan: Kasallik sababli..."
                  value={editForm.notes}
                  onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditModal(null)}>
                  Bekor
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  💾 Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,157,221,0.14) 0%, rgba(15,23,42,0.8) 100%)',
        border: '1px solid rgba(59,157,221,0.25)',
        borderRadius: 22,
        padding: '24px 28px',
        marginBottom: 24,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        backdropFilter: 'blur(10px)',
      }}>
        <div>
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: 'rgba(59,157,221,0.15)', border: '1px solid rgba(59,157,221,0.4)',
            color: '#3b9ddd', display: 'inline-block', marginBottom: 8,
          }}>📋 HR Davomat Tizimi</span>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>
            Xodimlar Davomati
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '4px 0 0' }}>
            Kunlik belgilash, kirish/chiqish vaqtlari va oylik hisobot
          </p>
        </div>
        {tab === 'today' && (
          <button
            onClick={markAllPresent}
            style={{
              padding: '12px 22px', borderRadius: 12, fontWeight: 700, fontSize: 14,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none', color: '#fff', cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(16,185,129,0.3)',
            }}
          >
            ✅ Hammasini Keldi deb belgilash
          </button>
        )}
      </div>

      {/* ── Stats strip (today only) ──────────────────────────────── */}
      {tab === 'today' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 22 }}>
          {[
            { label: 'Keldi',       val: statsToday.present,  color: '#10b981', icon: '✅' },
            { label: 'Kech keldi',  val: statsToday.late,     color: '#f59e0b', icon: '⏰' },
            { label: 'Kelmadi',     val: statsToday.absent,   color: '#f0705a', icon: '❌' },
            { label: "Ta'tilga",    val: statsToday.leave,    color: '#3b9ddd', icon: '🏖️' },
            { label: 'Belgilanmagan', val: statsToday.unmarked, color: '#64748b', icon: '❓' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(30,41,59,0.6)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14,
              padding: '14px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setTab('today')}
          style={{
            padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
            background: tab === 'today' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
            color: '#fff', border: 'none',
          }}
        >
          📅 Kunlik Davomat
        </button>
        <button
          onClick={() => setTab('month')}
          style={{
            padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
            background: tab === 'month' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
            color: '#fff', border: 'none',
          }}
        >
          📊 Oylik Hisobot
        </button>

        {/* Date / Month picker */}
        {tab === 'today' ? (
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{
              marginLeft: 'auto', padding: '10px 14px', borderRadius: 12,
              border: '1px solid rgba(124,107,239,0.3)',
              background: 'rgba(15,23,42,0.8)', color: '#fff', fontSize: 14,
              outline: 'none', fontFamily: 'inherit',
            }}
          />
        ) : (
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{
              marginLeft: 'auto', padding: '10px 14px', borderRadius: 12,
              border: '1px solid rgba(124,107,239,0.3)',
              background: 'rgba(15,23,42,0.8)', color: '#fff', fontSize: 14,
              outline: 'none', fontFamily: 'inherit',
            }}
          />
        )}
      </div>

      {/* ── TAB 1: Today's attendance ───────────────────────────────── */}
      {tab === 'today' && (
        staff.length === 0 ? (
          <div style={{
            border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 18,
            padding: '50px 20px', textAlign: 'center', color: 'var(--text-secondary)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <p>Hozircha aktiv xodimlar yo&apos;q. Avval xodimlar qo&apos;shing.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {staff.map(s => {
              const rec = attendance.find(a => a.staff_id === s.id);
              const st = rec ? STATUS_MAP[rec.status] : null;
              const isSaving = saving[s.id];

              return (
                <div
                  key={s.id}
                  style={{
                    background: 'linear-gradient(145deg, rgba(22,20,52,0.7) 0%, rgba(14,13,30,0.85) 100%)',
                    border: rec
                      ? `1px solid ${STATUS_MAP[rec.status].border}`
                      : '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16,
                    padding: '16px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 14,
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c6bef, #a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, color: '#fff', fontSize: 16, flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(124,107,239,0.35)',
                  }}>
                    {(s.first_name?.[0] || '?').toUpperCase()}
                  </div>

                  {/* Name & role */}
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>
                      {s.first_name} {s.last_name || ''}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {ROLES_UZ[s.role] || s.role}
                      {rec?.check_in && (
                        <span style={{ marginLeft: 10, color: '#10b981' }}>
                          ↑ {formatTime(rec.check_in)}
                        </span>
                      )}
                      {rec?.check_out && (
                        <span style={{ marginLeft: 8, color: '#f59e0b' }}>
                          ↓ {formatTime(rec.check_out)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Current status badge */}
                  {st && (
                    <span style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: st.bg, border: `1px solid ${st.border}`, color: st.color,
                    }}>
                      {st.icon} {st.label}
                    </span>
                  )}

                  {/* Quick action buttons */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {Object.entries(STATUS_MAP).map(([key, s2]) => (
                      <button
                        key={key}
                        disabled={isSaving || rec?.status === key}
                        onClick={() => quickMark(s, key)}
                        title={s2.label}
                        style={{
                          width: 36, height: 36, borderRadius: 10, border: 'none',
                          background: rec?.status === key ? s2.bg : 'rgba(255,255,255,0.06)',
                          color: rec?.status === key ? s2.color : 'var(--text-secondary)',
                          fontSize: 16, cursor: rec?.status === key ? 'default' : 'pointer',
                          transition: 'all 0.18s',
                          opacity: isSaving ? 0.5 : 1,
                        }}
                      >
                        {isSaving && rec?.status !== key ? '…' : s2.icon}
                      </button>
                    ))}

                    {/* Edit details */}
                    <button
                      onClick={() => openEditModal(s)}
                      title="Vaqt va izoh qo'shish"
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        border: '1px solid rgba(124,107,239,0.3)',
                        background: 'rgba(124,107,239,0.1)', color: '#a78bfa',
                        fontSize: 16, cursor: 'pointer', transition: 'all 0.18s',
                      }}
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── TAB 2: Monthly summary ──────────────────────────────────── */}
      {tab === 'month' && (
        <div>
          {summary.length === 0 ? (
            <div style={{
              border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 18,
              padding: '50px 20px', textAlign: 'center', color: 'var(--text-secondary)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
              <p>Ushbu oy uchun davomat ma&apos;lumotlari mavjud emas.</p>
            </div>
          ) : (
            <>
              {/* Summary table */}
              <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(22,20,52,0.9)' }}>
                      {['Xodim', 'Lavozim', '✅ Keldi', '⏰ Kech', '❌ Kelmadi', '🏖️ Ta\'til', 'Davomat %'].map(h => (
                        <th key={h} style={{
                          padding: '14px 16px', fontSize: 12, fontWeight: 700,
                          color: 'var(--text-secondary)', textAlign: 'left',
                          textTransform: 'uppercase', letterSpacing: 0.5,
                          borderBottom: '1px solid rgba(255,255,255,0.07)',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map((row, i) => {
                      const total = Number(row.total_marked) || 0;
                      const present = Number(row.present_days) || 0;
                      const late = Number(row.late_days) || 0;
                      const pct = total > 0
                        ? Math.round(((present + late) / total) * 100)
                        : 0;
                      const pctColor = pct >= 90 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#f0705a';

                      return (
                        <tr key={row.staff_id} style={{
                          background: i % 2 === 0 ? 'rgba(22,20,52,0.4)' : 'rgba(14,13,30,0.4)',
                          transition: 'background 0.2s',
                        }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #7c6bef, #a78bfa)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, color: '#fff', fontSize: 13,
                              }}>
                                {(row.first_name?.[0] || '?').toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>
                                  {row.first_name} {row.last_name || ''}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                  {total} kun belgilangan
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                            {ROLES_UZ[row.role] || row.role}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981', fontSize: 15 }}>
                            {row.present_days}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f59e0b', fontSize: 15 }}>
                            {row.late_days}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f0705a', fontSize: 15 }}>
                            {row.absent_days}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#3b9ddd', fontSize: 15 }}>
                            {row.leave_days}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                height: 6, flex: 1, borderRadius: 3,
                                background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
                              }}>
                                <div style={{
                                  width: `${pct}%`, height: '100%', borderRadius: 3,
                                  background: pctColor, transition: 'width 0.6s ease',
                                }} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 800, color: pctColor, minWidth: 38 }}>
                                {pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom legend */}
              <div style={{
                marginTop: 16, padding: '12px 18px', borderRadius: 12,
                background: 'rgba(22,20,52,0.5)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 12, color: 'var(--text-secondary)',
              }}>
                <span>✅ Keldi — to&apos;liq ish kuni</span>
                <span>⏰ Kech keldi — kech kirib, hisoblangan</span>
                <span>❌ Kelmadi — yo&apos;q</span>
                <span>🏖️ Ta&apos;til — ruxsatli</span>
                <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#fff' }}>
                  Davomat % = (Keldi + Kech) ÷ Belgilangan kunlar
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
