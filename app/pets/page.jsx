'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const SPECIES_FILTER = ['all', 'dog', 'cat', 'bird', 'rabbit', 'other'];
const speciesConfig = {
  dog: { emoji: '🐕', color: '#F97316', bg: '#FFF7ED' },
  cat: { emoji: '🐈', color: '#8B5CF6', bg: '#F5F3FF' },
  bird: { emoji: '🦜', color: '#10B981', bg: '#ECFDF5' },
  rabbit: { emoji: '🐇', color: '#EC4899', bg: '#FDF2F8' },
  other: { emoji: '🐾', color: '#6B7280', bg: '#F3F4F6' },
};

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');

  useEffect(() => {
    supabase.from('pg_pets').select('*').eq('organization_id', 'default').order('name')
      .then(({ data }) => { setPets(data || []); setLoading(false); });
  }, []);

  const filtered = pets.filter(p => {
    const matchSearch = !search
      || p.name?.toLowerCase().includes(search.toLowerCase())
      || p.owner_phone?.includes(search)
      || p.breed?.toLowerCase().includes(search.toLowerCase());
    const matchSpecies = speciesFilter === 'all' || p.species === speciesFilter;
    return matchSearch && matchSpecies;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: '#0D2B1E' }}>🐾 Pet Profiles</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pets.length} pets registered</p>
        </div>
        <Link href="/pets/new"
          className="px-4 py-2 rounded-2xl text-white font-bold text-sm shadow-md"
          style={{ background: '#10B981' }}>
          + Register Pet
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input type="text"
          placeholder="Search by name, phone or breed..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white" />
        <div className="flex gap-2 flex-wrap">
          {SPECIES_FILTER.map(s => {
            const cfg = speciesConfig[s] || { emoji: '🐾', color: '#10B981', bg: '#ECFDF5' };
            return (
              <button key={s} onClick={() => setSpeciesFilter(s)}
                className="px-3 py-1.5 rounded-full text-sm font-bold transition-all"
                style={{
                  background: speciesFilter === s ? cfg.color : '#fff',
                  color: speciesFilter === s ? '#fff' : '#6B7280',
                  border: `1px solid ${speciesFilter === s ? cfg.color : '#E5E7EB'}`,
                }}>
                {s === 'all' ? 'All' : `${cfg.emoji} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" style={{ border: '1px solid #E0F2E9' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
          <p className="text-5xl mb-3">🐾</p>
          <p className="font-bold text-gray-500 text-lg">No pets found</p>
          <p className="text-sm text-gray-400 mt-1">
            {search || speciesFilter !== 'all' ? 'Try adjusting your filters' : 'Start by registering the first pet'}
          </p>
          <Link href="/pets/new"
            className="inline-block mt-4 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-md"
            style={{ background: '#10B981' }}>
            Register First Pet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(pet => {
            const cfg = speciesConfig[pet.species] || speciesConfig.other;
            return (
              <div key={pet.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                style={{ border: '1px solid #E0F2E9' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                    style={{ background: cfg.bg }}>
                    {cfg.emoji}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-xl text-gray-900 truncate">{pet.name}</h3>
                    <p className="font-semibold text-sm" style={{ color: cfg.color }}>
                      {pet.species?.charAt(0).toUpperCase() + pet.species?.slice(1)}
                      {pet.breed ? ` · ${pet.breed}` : ''}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-gray-500 mb-4">
                  <p className="flex items-center gap-1.5">
                    <span>📞</span>
                    <span className="font-medium">{pet.owner_phone}</span>
                  </p>
                  {pet.notes && (
                    <p className="text-xs bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
                      📝 {pet.notes}
                    </p>
                  )}
                </div>
                <Link href={`/bookings?phone=${pet.owner_phone}`}
                  className="block w-full text-center py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  View Bookings →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
