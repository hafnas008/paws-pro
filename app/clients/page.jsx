'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [clientDetails, setClientDetails] = useState({});

  useEffect(() => {
    async function load() {
      const { data: clientsData } = await supabase
        .from('pg_clients')
        .select('*')
        .eq('organization_id', 'default')
        .order('created_at', { ascending: false });

      if (!clientsData) { setLoading(false); return; }

      // For each client, get pet count, booking count, and last booking
      const enriched = await Promise.all(clientsData.map(async (c) => {
        const [pets, bookings, lastBooking] = await Promise.all([
          supabase.from('pg_pets').select('id', { count: 'exact', head: true })
            .eq('organization_id', 'default').eq('owner_phone', c.phone),
          supabase.from('pg_bookings').select('id', { count: 'exact', head: true })
            .eq('organization_id', 'default').eq('client_phone', c.phone),
          supabase.from('pg_bookings').select('booking_date, status')
            .eq('organization_id', 'default').eq('client_phone', c.phone)
            .order('booking_date', { ascending: false }).limit(1),
        ]);
        return {
          ...c,
          petCount: pets.count || 0,
          bookingCount: bookings.count || 0,
          lastVisit: lastBooking.data?.[0]?.booking_date || null,
          isVip: (bookings.count || 0) > 5,
        };
      }));

      setClients(enriched);
      setLoading(false);
    }
    load();
  }, []);

  async function loadClientDetails(phone) {
    if (clientDetails[phone]) return;
    const [pets, bookings] = await Promise.all([
      supabase.from('pg_pets').select('*').eq('organization_id', 'default').eq('owner_phone', phone),
      supabase.from('pg_bookings').select('*').eq('organization_id', 'default').eq('client_phone', phone)
        .order('booking_date', { ascending: false }).limit(5),
    ]);
    setClientDetails(d => ({ ...d, [phone]: { pets: pets.data || [], bookings: bookings.data || [] } }));
  }

  function toggleExpand(client) {
    if (expandedId === client.id) {
      setExpandedId(null);
    } else {
      setExpandedId(client.id);
      loadClientDetails(client.phone);
    }
  }

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !search || c.phone?.includes(q) || c.name?.toLowerCase().includes(q);
  });

  const statusColor = { pending: '#F97316', confirmed: '#10B981', completed: '#6B7280', cancelled: '#EF4444' };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: '#0D2B1E' }}>👥 Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} registered clients</p>
        </div>
        <Link href="/pets/new"
          className="px-4 py-2 rounded-2xl text-white font-bold text-sm shadow-md"
          style={{ background: '#10B981' }}>
          + Add Client
        </Link>
      </div>

      <div className="mb-5">
        <input type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-2xl h-16 animate-pulse" style={{ border: '1px solid #E0F2E9' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
          <p className="text-5xl mb-3">👥</p>
          <p className="font-bold text-gray-500 text-lg">No clients found</p>
          <p className="text-sm text-gray-400 mt-1">
            Clients are created automatically when you make a booking
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E0F2E9' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F7FDF9', borderBottom: '1px solid #E0F2E9' }}>
                  <th className="text-left px-5 py-3 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-5 py-3 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="text-center px-5 py-3 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Pets</th>
                  <th className="text-center px-5 py-3 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="text-left px-5 py-3 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Last Visit</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, idx) => (
                  <>
                    <tr key={c.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F0FDF4' : 'none' }}
                      onClick={() => toggleExpand(c)}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
                            style={{ background: c.isVip ? '#F97316' : '#10B981' }}>
                            {(c.name || c.phone || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{c.name || 'Unknown'}</p>
                            {c.isVip && (
                              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                                style={{ background: '#FFF7ED', color: '#F97316' }}>VIP</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-700">{c.phone}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-extrabold"
                          style={{ background: '#D1FAE5', color: '#10B981' }}>
                          {c.petCount}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-extrabold"
                          style={{ background: '#EDE9FE', color: '#8B5CF6' }}>
                          {c.bookingCount}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{c.lastVisit || '—'}</td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-gray-400 text-sm">{expandedId === c.id ? '▲' : '▼'}</span>
                      </td>
                    </tr>
                    {expandedId === c.id && (
                      <tr key={c.id + '-detail'}>
                        <td colSpan={6} className="px-5 py-4" style={{ background: '#F7FDF9', borderBottom: '1px solid #E0F2E9' }}>
                          {clientDetails[c.phone] ? (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-extrabold text-gray-500 uppercase mb-2">Pets</p>
                                {clientDetails[c.phone].pets.length === 0 ? (
                                  <p className="text-sm text-gray-400">No pets registered</p>
                                ) : (
                                  <div className="space-y-1">
                                    {clientDetails[c.phone].pets.map(p => (
                                      <div key={p.id} className="flex items-center gap-2 text-sm">
                                        <span>🐾</span>
                                        <span className="font-semibold text-gray-800">{p.name}</span>
                                        <span className="text-gray-400">{p.species}{p.breed ? ` · ${p.breed}` : ''}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-extrabold text-gray-500 uppercase mb-2">Recent Bookings</p>
                                {clientDetails[c.phone].bookings.length === 0 ? (
                                  <p className="text-sm text-gray-400">No bookings yet</p>
                                ) : (
                                  <div className="space-y-1">
                                    {clientDetails[c.phone].bookings.map(b => (
                                      <div key={b.id} className="flex items-center gap-2 text-sm">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0"
                                          style={{ background: statusColor[b.status] || '#ccc' }} />
                                        <span className="font-semibold text-gray-800">{b.pet_name}</span>
                                        <span className="text-gray-400">{b.service_type} · {b.booking_date}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 text-center py-2">Loading details...</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer"
                style={{ border: '1px solid #E0F2E9' }}
                onClick={() => toggleExpand(c)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
                    style={{ background: c.isVip ? '#F97316' : '#10B981' }}>
                    {(c.name || c.phone || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{c.name || 'Unknown'}</p>
                      {c.isVip && (
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                          style={{ background: '#FFF7ED', color: '#F97316' }}>VIP</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{c.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{c.petCount} pets · {c.bookingCount} visits</p>
                    <p className="text-xs text-gray-300 mt-0.5">{expandedId === c.id ? '▲' : '▼'}</p>
                  </div>
                </div>
                {expandedId === c.id && clientDetails[c.phone] && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid #E0F2E9' }}>
                    <div className="space-y-1">
                      {clientDetails[c.phone].pets.map(p => (
                        <p key={p.id} className="text-sm text-gray-600">🐾 {p.name} ({p.species})</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
