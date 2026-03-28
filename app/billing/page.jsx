'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { sendWhatsApp } from '@/lib/notify';
import toast from 'react-hot-toast';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid' },
  { id: 'unpaid', label: 'Unpaid' },
  { id: 'cancelled', label: 'Cancelled' },
];

const statusStyle = {
  pending: { bg: '#FFF7ED', color: '#F97316', label: 'Unpaid' },
  confirmed: { bg: '#EFF6FF', color: '#3B82F6', label: 'Confirmed' },
  completed: { bg: '#ECFDF5', color: '#10B981', label: 'Paid' },
  cancelled: { bg: '#FEF2F2', color: '#EF4444', label: 'Cancelled' },
};

const svcEmoji = { grooming: '✂️', bath: '🛁', trim: '✂️', nail_clip: '💅', full_service: '⭐' };

export default function BillingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [marking, setMarking] = useState(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('pg_bookings')
      .select('*')
      .eq('organization_id', 'default')
      .order('booking_date', { ascending: false });
    setBookings(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markPaid(b) {
    setMarking(b.id);
    await supabase.from('pg_bookings').update({ status: 'completed' }).eq('id', b.id);
    await sendWhatsApp(
      b.client_phone,
      `🧾 *Paws & Groom — Payment Received*\n\nThank you for your payment!\n\n🐾 Pet: ${b.pet_name || 'your pet'}\n✂️ Service: ${b.service_type}\n💰 Amount: QAR ${b.price || 0}\n📅 Date: ${b.booking_date}\n\nWe hope to see you again soon! 🌿`
    );
    toast.success('Marked as paid! Receipt sent via WhatsApp');
    setMarking(null);
    load();
  }

  const filtered = bookings.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'paid') return b.status === 'completed';
    if (filter === 'unpaid') return b.status === 'pending' || b.status === 'confirmed';
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  // Summary stats
  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (parseFloat(b.price) || 0), 0);
  const outstandingCount = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
  const outstandingAmount = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').reduce((s, b) => s + (parseFloat(b.price) || 0), 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStr = weekStart.toISOString().split('T')[0];
  const weekRevenue = bookings
    .filter(b => b.status === 'completed' && b.booking_date >= weekStr)
    .reduce((s, b) => s + (parseFloat(b.price) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: '#0D2B1E' }}>💳 Billing &amp; Payments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track revenue and manage payments</p>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" style={{ border: '1px solid #E0F2E9' }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4"
            style={{ borderLeftColor: '#10B981', borderTop: '1px solid #E0F2E9', borderRight: '1px solid #E0F2E9', borderBottom: '1px solid #E0F2E9' }}>
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-1">Total Revenue</p>
            <p className="text-3xl font-extrabold" style={{ color: '#10B981' }}>QAR {totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">All completed payments</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4"
            style={{ borderLeftColor: '#F97316', borderTop: '1px solid #E0F2E9', borderRight: '1px solid #E0F2E9', borderBottom: '1px solid #E0F2E9' }}>
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-1">Outstanding</p>
            <p className="text-3xl font-extrabold" style={{ color: '#F97316' }}>{outstandingCount}</p>
            <p className="text-xs text-gray-400 mt-1">QAR {outstandingAmount.toLocaleString()} pending</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4"
            style={{ borderLeftColor: '#8B5CF6', borderTop: '1px solid #E0F2E9', borderRight: '1px solid #E0F2E9', borderBottom: '1px solid #E0F2E9' }}>
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-1">This Week</p>
            <p className="text-3xl font-extrabold" style={{ color: '#8B5CF6' }}>QAR {weekRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">From {weekStr}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5">
        {FILTER_TABS.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className="px-4 py-1.5 rounded-full text-sm font-bold transition-all"
            style={{
              background: filter === t.id ? '#10B981' : '#fff',
              color: filter === t.id ? '#fff' : '#6B7280',
              border: `1px solid ${filter === t.id ? '#10B981' : '#E0F2E9'}`,
            }}>
            {t.label}
            {t.id === 'unpaid' && outstandingCount > 0 && (
              <span className="ml-1.5 text-xs font-extrabold px-1.5 py-0.5 rounded-full"
                style={{ background: filter === 'unpaid' ? 'rgba(255,255,255,0.3)' : '#FFF7ED', color: filter === 'unpaid' ? '#fff' : '#F97316' }}>
                {outstandingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
          <p className="text-5xl mb-3">💳</p>
          <p className="font-bold text-gray-500 text-lg">No records found</p>
          <p className="text-sm text-gray-400 mt-1">Try a different filter</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E0F2E9' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F7FDF9', borderBottom: '1px solid #E0F2E9' }}>
                  <th className="text-left px-5 py-3 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Pet</th>
                  <th className="text-left px-5 py-3 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="text-left px-5 py-3 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-center px-5 py-3 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, idx) => {
                  const s = statusStyle[b.status] || statusStyle.pending;
                  return (
                    <tr key={b.id}
                      style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F7FDF9' : 'none' }}
                      className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span>{svcEmoji[b.service_type] || '✂️'}</span>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{b.pet_name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400">{b.client_phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{b.service_type}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{b.booking_date}</td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-extrabold text-gray-900">QAR {b.price || 0}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-xs font-bold px-3 py-1 rounded-full"
                          style={{ background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {(b.status === 'pending' || b.status === 'confirmed') && (
                          <button onClick={() => markPaid(b)} disabled={marking === b.id}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 transition-opacity"
                            style={{ background: '#10B981' }}>
                            {marking === b.id ? '...' : 'Mark Paid'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(b => {
              const s = statusStyle[b.status] || statusStyle.pending;
              return (
                <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{svcEmoji[b.service_type] || '✂️'}</span>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{b.pet_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{b.service_type}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">{b.booking_date}</p>
                      <p className="font-extrabold" style={{ color: '#10B981' }}>QAR {b.price || 0}</p>
                    </div>
                    {(b.status === 'pending' || b.status === 'confirmed') && (
                      <button onClick={() => markPaid(b)} disabled={marking === b.id}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                        style={{ background: '#10B981' }}>
                        {marking === b.id ? '...' : 'Mark Paid'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Revenue summary footer */}
      {!loading && filtered.length > 0 && (
        <div className="mt-4 rounded-2xl p-4 flex items-center justify-between"
          style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
          <p className="text-sm font-semibold text-gray-700">
            Showing {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </p>
          <p className="text-sm font-extrabold" style={{ color: '#10B981' }}>
            Total: QAR {filtered.reduce((s, b) => s + (parseFloat(b.price) || 0), 0).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
