'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { sendWhatsApp } from '@/lib/notify';
import toast from 'react-hot-toast';
import Link from 'next/link';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];
const statusStyle = {
  pending: { bg: '#FFF7ED', color: '#F97316' },
  confirmed: { bg: '#ECFDF5', color: '#10B981' },
  completed: { bg: '#F3F4F6', color: '#6B7280' },
  cancelled: { bg: '#FEF2F2', color: '#EF4444' },
};
const svcEmoji = { grooming: '✂️', bath: '🛁', trim: '✂️', nail_clip: '💅', full_service: '⭐' };

function fmt(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

export default function BookingsPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  async function load() {
    setLoading(true);
    let q = supabase.from('pg_bookings').select('*').eq('organization_id', 'default').order('booking_time');
    if (date) q = q.eq('booking_date', date);
    if (status !== 'all') q = q.eq('status', status);
    const { data } = await q;
    setBookings(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [date, status]);

  function changeDate(days) {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  }

  async function updateStatus(b, newStatus) {
    setUpdating(b.id);
    await supabase.from('pg_bookings').update({ status: newStatus }).eq('id', b.id);
    if (newStatus === 'confirmed') {
      await sendWhatsApp(
        b.client_phone,
        `Your grooming appointment for *${b.pet_name || 'your pet'}* is confirmed for ${b.booking_date} at ${(b.booking_time || '').slice(0, 5)} 🐾\n\nService: ${b.service_type}\n\nSee you soon! — Paws & Groom`
      );
    }
    if (newStatus === 'completed') {
      await sendWhatsApp(
        b.client_phone,
        `*Grooming Complete!* 🎉\n\n${b.pet_name || 'Your pet'} is looking absolutely fabulous! ✨\n\nService: ${b.service_type}\nTotal: QAR ${b.price || 0}\n\nThank you for choosing Paws & Groom! 🐾`
      );
    }
    toast.success(`Status updated to ${newStatus}`);
    setUpdating(null);
    load();
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: '#0D2B1E' }}>📅 Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">{bookings.length} appointment{bookings.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link href="/bookings/new"
          className="px-4 py-2 rounded-2xl text-white font-bold text-sm shadow-md"
          style={{ background: '#10B981' }}>
          + New Booking
        </Link>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-2xl p-4 mb-4 flex items-center justify-between shadow-sm"
        style={{ border: '1px solid #E0F2E9' }}>
        <button onClick={() => changeDate(-1)}
          className="px-3 py-2 rounded-xl hover:bg-gray-100 font-bold text-gray-600 text-sm transition-colors">
          ◀ Prev
        </button>
        <div className="text-center">
          <p className="font-extrabold text-gray-900 text-base">{fmt(date)}</p>
          {date === todayStr && (
            <p className="text-xs font-medium mt-0.5" style={{ color: '#10B981' }}>— Today —</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDate(todayStr)}
            className="px-3 py-1.5 rounded-xl text-sm font-bold transition-colors"
            style={{ background: '#ECFDF5', color: '#10B981' }}>
            Today
          </button>
          <button onClick={() => changeDate(1)}
            className="px-3 py-2 rounded-xl hover:bg-gray-100 font-bold text-gray-600 text-sm transition-colors">
            Next ▶
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className="px-4 py-1.5 rounded-full text-sm font-bold transition-all"
            style={{
              background: status === s ? '#10B981' : '#fff',
              color: status === s ? '#fff' : '#6B7280',
              border: `1px solid ${status === s ? '#10B981' : '#E0F2E9'}`,
            }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl h-44 animate-pulse" style={{ border: '1px solid #E0F2E9' }} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
          <p className="text-6xl mb-4">🌿</p>
          <p className="text-xl font-bold text-gray-700">No bookings for this day</p>
          <p className="text-gray-400 mt-1 text-sm">
            Select another date or{' '}
            <Link href="/bookings/new" className="underline font-semibold" style={{ color: '#10B981' }}>
              create a booking
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map(b => {
            const s = statusStyle[b.status] || statusStyle.pending;
            const isUpdating = updating === b.id;
            return (
              <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-md"
                style={{ border: '1px solid #E0F2E9' }}>
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: '#D1FAE5' }}>
                      {svcEmoji[b.service_type] || '✂️'}
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-900 text-base">{b.pet_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{b.client_phone}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full capitalize"
                    style={{ background: s.bg, color: s.color }}>
                    {b.status}
                  </span>
                </div>

                {/* Details row */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 px-1">
                  <span className="flex items-center gap-1">⏰ <span className="font-semibold">{b.booking_time ? b.booking_time.slice(0, 5) : '--:--'}</span></span>
                  <span className="flex items-center gap-1">✂️ <span>{b.service_type}</span></span>
                  <span className="ml-auto font-extrabold text-base" style={{ color: '#10B981' }}>
                    QAR {b.price || 0}
                  </span>
                </div>

                {b.notes && (
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2 mb-3">
                    📝 {b.notes}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  {b.status === 'pending' && (
                    <button onClick={() => updateStatus(b, 'confirmed')} disabled={isUpdating}
                      className="flex-1 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity"
                      style={{ background: '#10B981' }}>
                      {isUpdating ? '...' : '✅ Confirm & Notify'}
                    </button>
                  )}
                  {b.status === 'confirmed' && (
                    <button onClick={() => updateStatus(b, 'completed')} disabled={isUpdating}
                      className="flex-1 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity"
                      style={{ background: '#6B7280' }}>
                      {isUpdating ? '...' : '🎉 Mark Complete'}
                    </button>
                  )}
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <button onClick={() => updateStatus(b, 'cancelled')} disabled={isUpdating}
                      className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 transition-opacity"
                      style={{ background: '#FEF2F2', color: '#EF4444' }}>
                      Cancel
                    </button>
                  )}
                  {(b.status === 'completed' || b.status === 'cancelled') && (
                    <div className="flex-1 py-2 rounded-xl text-sm font-semibold text-center"
                      style={{ background: '#F9FAFB', color: '#9CA3AF' }}>
                      {b.status === 'completed' ? '✓ Done' : '✕ Cancelled'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
