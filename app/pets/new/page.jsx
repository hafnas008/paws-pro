'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SPECIES_OPTIONS = [
  { id: 'dog', emoji: '🐕', label: 'Dog', color: '#F97316', bg: '#FFF7ED' },
  { id: 'cat', emoji: '🐈', label: 'Cat', color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'bird', emoji: '🦜', label: 'Bird', color: '#10B981', bg: '#ECFDF5' },
  { id: 'rabbit', emoji: '🐇', label: 'Rabbit', color: '#EC4899', bg: '#FDF2F8' },
  { id: 'other', emoji: '🐾', label: 'Other', color: '#6B7280', bg: '#F3F4F6' },
];

export default function NewPetPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    ownerPhone: '',
    ownerName: '',
    petName: '',
    species: 'dog',
    breed: '',
    notes: '',
  });

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  const selectedSpecies = SPECIES_OPTIONS.find(s => s.id === form.species) || SPECIES_OPTIONS[0];

  async function submit(e) {
    e.preventDefault();
    if (!form.ownerPhone || !form.petName) {
      toast.error('Phone and pet name are required');
      return;
    }
    setSubmitting(true);

    // Upsert client record
    await supabase.from('pg_clients').upsert(
      {
        organization_id: 'default',
        phone: form.ownerPhone,
        ...(form.ownerName ? { name: form.ownerName } : {}),
      },
      { onConflict: 'organization_id,phone', ignoreDuplicates: false }
    );

    // Insert pet
    const { error } = await supabase.from('pg_pets').insert({
      organization_id: 'default',
      owner_phone: form.ownerPhone,
      name: form.petName,
      species: form.species,
      breed: form.breed || null,
      notes: form.notes || null,
    });

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }

    toast.success(`${form.petName} has been registered! 🐾`);
    router.push('/pets');
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/pets" className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          style={{ border: '1px solid #E0F2E9' }}>
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: '#0D2B1E' }}>Register New Pet</h1>
          <p className="text-sm text-gray-500">Add a new pet to the grooming profiles</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* Owner Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full text-white text-xs font-extrabold flex items-center justify-center"
              style={{ background: '#10B981' }}>1</span>
            Owner Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">WhatsApp Phone *</label>
              <input type="tel"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="+974 XXXX XXXX or +971 XXXX XXXX"
                value={form.ownerPhone}
                onChange={e => setField('ownerPhone', e.target.value)}
                required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Owner Name <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input type="text"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g. Ahmed Al-Rashid"
                value={form.ownerName}
                onChange={e => setField('ownerName', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Pet Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full text-white text-xs font-extrabold flex items-center justify-center"
              style={{ background: '#10B981' }}>2</span>
            Pet Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Pet Name *</label>
              <input type="text"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g. Buddy, Luna, Max"
                value={form.petName}
                onChange={e => setField('petName', e.target.value)}
                required />
            </div>

            {/* Species selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Species *</label>
              <div className="grid grid-cols-5 gap-2">
                {SPECIES_OPTIONS.map(s => (
                  <button key={s.id} type="button" onClick={() => setField('species', s.id)}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all"
                    style={{
                      background: form.species === s.id ? s.bg : '#F9FAFB',
                      border: `2px solid ${form.species === s.id ? s.color : '#E5E7EB'}`,
                    }}>
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-xs font-bold" style={{ color: form.species === s.id ? s.color : '#9CA3AF' }}>
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Breed <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input type="text"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g. Golden Retriever, Persian, Labrador"
                value={form.breed}
                onChange={e => setField('breed', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full text-white text-xs font-extrabold flex items-center justify-center"
              style={{ background: '#10B981' }}>3</span>
            Special Notes
          </h2>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
            rows={3}
            placeholder="Allergies, temperament, special handling instructions, medical conditions..."
            value={form.notes}
            onChange={e => setField('notes', e.target.value)} />
        </div>

        {/* Preview card */}
        {form.petName && (
          <div className="rounded-2xl p-4" style={{ background: selectedSpecies.bg, border: `1px solid ${selectedSpecies.color}33` }}>
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Preview</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedSpecies.emoji}</span>
              <div>
                <p className="font-extrabold text-gray-900">{form.petName}</p>
                <p className="text-sm font-semibold" style={{ color: selectedSpecies.color }}>
                  {selectedSpecies.label}{form.breed ? ` · ${form.breed}` : ''}
                </p>
                {form.ownerPhone && <p className="text-xs text-gray-500 mt-0.5">Owner: {form.ownerPhone}</p>}
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full py-4 rounded-2xl text-white font-extrabold text-base disabled:opacity-60 transition-all shadow-lg"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
          {submitting ? '🐾 Registering...' : '🐾 Register Pet'}
        </button>
      </form>
    </div>
  );
}
