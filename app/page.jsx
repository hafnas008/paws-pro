'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const statusStyle = {
  pending: { bg: '#FFF7ED', color: '#F97316', label: 'Pending' },
  confirmed: { bg: '#ECFDF5', color: '#10B981', label: 'Confirmed' },
  completed: { bg: '#F3F4F6', color: '#6B7280', label: 'Completed' },
  cancelled: { bg: '#FEF2F2', color: '#EF4444', label: 'Cancelled' },
};

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 flex items-center gap-4"
      style={{ borderLeftColor: color, borderTop: '1px solid #E0F2E9', borderRight: '1px solid #E0F2E9', borderBottom: '1px solid #E0F2E9' }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: color + '18' }}>{icon}</div>
      <div>
        <p className="text-2xl font-extrabold" style={{ color: color }}>{value}</p>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const today = new Date().toISOString().split('T')[0];
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ todayAppts: 0, totalPets: 0, totalClients: 0, revenue: 0 });
  const [todayBookings, setTodayBookings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    async function load() {
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthStr = monthStart.toISOString().split('T')[0];
      const [appts, pets, clients, revenue, todayB, recent] = await Promise.all([
        supabase.from('pg_bookings').select('id', { count: 'exact', head: true }).eq('organization_id', 'default').eq('booking_date', today),
        supabase.from('pg_pets').select('id', { count: 'exact', head: true }).eq('organization_id', 'default'),
        supabase.from('pg_clients').select('id', { count: 'exact', head: true }).eq('organization_id', 'default'),
        supabase.from('pg_bookings').select('price').eq('organization_id', 'default').eq('status', 'completed').gte('booking_date', monthStr),
        supabase.from('pg_bookings').select('*').eq('organization_id', 'default').eq('booking_date', today).order('booking_time'),
        supabase.from('pg_bookings').select('*').eq('organization_id', 'default').order('created_at', { ascending: false }).limit(5),
      ]);
      const rev = (revenue.data || []).reduce((s, r) => s + (parseFloat(r.price) || 0), 0);
      setStats({ todayAppts: appts.count || 0, totalPets: pets.count || 0, totalClients: clients.count || 0, revenue: rev });
      setTodayBookings(todayB.data || []);
      setRecentActivity(recent.data || []);
      setLoading(false);
    }
    load();
  }, [today]);

  const serviceEmoji = {
    grooming: '✂️', bath: '🛁', trim: '✂️', nail_clip: '💅',
    full_service: '⭐', 'Full Grooming': '✂️', 'Bath & Dry': '🛁',
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: '#0D2B1E' }}>Good morning! 🌿</h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link href="/bookings/new"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold shadow-lg text-sm"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
          <span>➕</span> New Booking
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📅" label="Today's Appointments" value={stats.todayAppts} sub="Scheduled" color="#10B981" />
          <StatCard icon="🐾" label="Total Pets" value={stats.totalPets} sub="Registered" color="#F97316" />
          <StatCard icon="👥" label="Active Clients" value={stats.totalClients} sub="Pet owners" color="#8B5CF6" />
          <StatCard icon="💰" label="Monthly Revenue" value={`QAR ${stats.revenue.toLocaleString()}`} sub="Completed bookings" color="#EC4899" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6" style={{ border: '1px solid #E0F2E9' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-gray-900 text-lg">📅 Today&apos;s Schedule</h2>
            <Link href="/bookings" className="text-sm font-semibold" style={{ color: '#10B981' }}>View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : todayBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-3">🌿</p>
              <p className="font-semibold text-gray-500">No appointments today</p>
              <p className="text-sm text-gray-400 mt-1">
                Enjoy the quiet! Or{' '}
                <Link href="/bookings/new" className="underline" style={{ color: '#10B981' }}>add a booking</Link>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBookings.map(b => {
                const s = statusStyle[b.status] || statusStyle.pending;
                return (
                  <div key={b.id} className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: '#F7FDF9', border: '1px solid #E0F2E9' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: '#D1FAE5' }}>
                      {serviceEmoji[b.service_type] || '✂️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">{b.pet_name || 'Unknown Pet'}</p>
                      <p className="text-sm text-gray-500">{b.service_type} · {b.client_phone}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-800">{b.booking_time ? b.booking_time.slice(0, 5) : '--:--'}</p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: '1px solid #E0F2E9' }}>
            <h2 className="font-extrabold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { icon: '🐾', label: 'Register New Pet', sub: 'Add to profiles', href: '/pets/new', color: '#F97316' },
                { icon: '📅', label: 'New Booking', sub: 'Schedule appointment', href: '/bookings/new', color: '#10B981' },
                { icon: '💬', label: 'Send WhatsApp Promo', sub: 'Notify clients', href: '/notifications', color: '#8B5CF6' },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:opacity-80 transition-opacity"
                  style={{ background: a.color + '12', border: `1px solid ${a.color}22` }}>
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{a.label}</p>
                    <p className="text-xs text-gray-400">{a.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: '1px solid #E0F2E9' }}>
            <h2 className="font-extrabold text-gray-900 mb-4">Recent Activity</h2>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map(b => {
                  const s = statusStyle[b.status] || statusStyle.pending;
                  return (
                    <div key={b.id} className="flex items-center gap-2">
                      <span className="text-sm">{serviceEmoji[b.service_type] || '✂️'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{b.pet_name || '?'}</p>
                        <p className="text-xs text-gray-400">{b.booking_date}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
