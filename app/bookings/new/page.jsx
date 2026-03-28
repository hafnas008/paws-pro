'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { sendWhatsApp } from '@/lib/notify';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const SERVICES = [
  { id: 'bath', label: '🛁 Basic Bath', desc: 'Shampoo, blow dry & ear cleaning', price: 50 },
  { id: 'grooming', label: '✂️ Full Grooming', desc: 'Bath + haircut + nail clip + accessories', price: 120 },
  { id: 'nail_clip', label: '💅 Nail Clip', desc: 'Professional nail trimming', price: 25 },
  { id: 'full_service', label: '⭐ Spa Day', desc: 'Full grooming + massage + premium products', price: 180 },
  { id: 'trim', label: '🦷 Teeth Cleaning', desc: 'Safe dental hygiene treatment', price: 60 },
];
const TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
const SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'other'];

export default function NewBookingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [pets, setPets] = useState([]);
  const [lookingUp, setLookingUp] = useState(false);
  const [form, setForm] = useState({
    phone: '', petId: '', petName: '', petSpecies: 'dog', isNewPet: false,
    service: '', date: new Date().toISOString().split('T')[0], time: '', notes: '',
  });

  async function lookupPets(phone) {
    if (phone.length < 8) { setPets([]); return; }
    setLookingUp(true);
    const { data } = await supabase.from('pg_pets').select('*')
      .eq('organization_id', 'default').eq('owner_phone', phone);
    setPets(data || []);
    setLookingUp(false);
  }

  const selectedService = SERVICES.find(s => s.id === form.service);

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.phone || !form.service || !form.date || !form.time) {
      toast.error('Please fill phone, service, date and time'); return;
    }

    const chosenPet = pets.find(p => p.id === form.petId);
    const petName = form.isNewPet || pets.length === 0
      ? form.petName
      : (chosenPet?.name || form.petName);

    if (!petName) { toast.error('Please enter or select a pet name'); return; }
    setSubmitting(true);

    // Upsert client
    await supabase.from('pg_clients').upsert(
      { organization_id: 'default', phone: form.phone },
      { onConflict: 'organization_id,phone', ignoreDuplicates: true }
    );

    // Create new pet if needed
    let petId = (!form.isNewPet && form.petId && form.petId !== 'new') ? form.petId : null;
    if ((form.isNewPet || form.petId === 'new' || pets.length === 0) && form.petName) {
      const { data: newPet } = await supabase.from('pg_pets').insert({
        organization_id: 'default',
        owner_phone: form.phone,
        name: form.petName,
        species: form.petSpecies,
      }).select().single();
      petId = newPet?.id || null;
    }

    const { error } = await supabase.from('pg_bookings').insert({
      organization_id: 'default',
      client_phone: form.phone,
      pet_id: petId,
      pet_name: petName,
      service_type: form.service,
      booking_date: form.date,
      booking_time: form.time + ':00',
      status: 'pending',
      price: selectedService?.price || 0,
      currency: 'QAR',
      notes: form.notes || null,
    });

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }

    await sendWhatsApp(
      form.phone,
      `🐾 *Paws & Groom — Booking Received!*\n\nThank you! Your booking is confirmed:\n\n🐕 Pet: *${petName}*\n✂️ Service: *${selectedService?.label}*\n📅 Date: *${form.date}*\n⏰ Time: *${form.time}*\n💰 Price: *QAR ${selectedService?.price}*\n\nWe'll send a reminder before your appointment! 🌿`
    );
    toast.success('Booking created! WhatsApp sent 🐾');
    router.push('/bookings');
  }

  const showNewPetFields = pets.length === 0 || form.isNewPet || form.petId === 'new';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: '#0D2B1E' }}>📅 New Booking</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details to schedule an appointment</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* Step 1 — Owner Phone */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0"
              style={{ background: '#10B981' }}>1</span>
            Owner Details
          </h2>
          <label className="block text-sm font-semibold text-gray-600 mb-1">WhatsApp Phone *</label>
          <input type="tel"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="+974 XXXX XXXX"
            value={form.phone}
            onChange={e => setField('phone', e.target.value)}
            onBlur={e => lookupPets(e.target.value)}
            required />
          {lookingUp && <p className="text-xs mt-1 text-gray-400">Looking up pets...</p>}
          {!lookingUp && pets.length > 0 && (
            <p className="text-xs mt-1 font-semibold" style={{ color: '#10B981' }}>
              Found {pets.length} registered pet{pets.length > 1 ? 's' : ''} for this number
            </p>
          )}
          {!lookingUp && form.phone.length >= 8 && pets.length === 0 && (
            <p className="text-xs mt-1 text-gray-400">No existing pets — a new profile will be created</p>
          )}
        </div>

        {/* Step 2 — Pet */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0"
              style={{ background: '#10B981' }}>2</span>
            Pet Details
          </h2>
          {pets.length > 0 && (
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Select Pet</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white"
                value={form.petId}
                onChange={e => setForm(f => ({
                  ...f,
                  petId: e.target.value,
                  isNewPet: e.target.value === 'new',
                }))}>
                <option value="">-- Select existing pet --</option>
                {pets.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                ))}
                <option value="new">➕ Add new pet</option>
              </select>
            </div>
          )}
          {showNewPetFields && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Pet Name *</label>
                <input type="text"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  placeholder="e.g. Buddy"
                  value={form.petName}
                  onChange={e => setField('petName', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Species</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white"
                  value={form.petSpecies}
                  onChange={e => setField('petSpecies', e.target.value)}>
                  {SPECIES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Step 3 — Service */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0"
              style={{ background: '#10B981' }}>3</span>
            Choose Service
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {SERVICES.map(s => (
              <button key={s.id} type="button" onClick={() => setField('service', s.id)}
                className="flex items-center justify-between p-3 rounded-xl text-left transition-all"
                style={{
                  background: form.service === s.id ? '#ECFDF5' : '#F9FAFB',
                  border: `2px solid ${form.service === s.id ? '#10B981' : '#E5E7EB'}`,
                }}>
                <div>
                  <p className="font-bold text-sm text-gray-800">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
                <p className="font-extrabold text-sm ml-4 flex-shrink-0"
                  style={{ color: form.service === s.id ? '#10B981' : '#9CA3AF' }}>
                  QAR {s.price}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 4 — Date & Time */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0"
              style={{ background: '#10B981' }}>4</span>
            Date &amp; Time Slot
          </h2>
          <input type="date"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none mb-4"
            value={form.date}
            onChange={e => setField('date', e.target.value)}
            required />
          <p className="text-xs font-semibold text-gray-500 mb-2">Select a time slot</p>
          <div className="grid grid-cols-4 gap-2">
            {TIMES.map(t => (
              <button key={t} type="button" onClick={() => setField('time', t)}
                className="py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: form.time === t ? '#10B981' : '#F3F4F6',
                  color: form.time === t ? '#fff' : '#6B7280',
                  border: form.time === t ? '2px solid #10B981' : '2px solid transparent',
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Notes <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
            rows={2}
            placeholder="Any special instructions, allergies, or temperament notes..."
            value={form.notes}
            onChange={e => setField('notes', e.target.value)} />
        </div>

        {/* Booking Summary */}
        {selectedService && form.time && (
          <div className="rounded-2xl p-4" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
            <p className="font-bold text-gray-800 text-sm mb-1">Booking Summary</p>
            <div className="text-sm text-gray-700 space-y-0.5">
              <p>{selectedService.label}</p>
              <p>📅 {form.date} at ⏰ {form.time}</p>
              <p className="font-extrabold text-base" style={{ color: '#10B981' }}>QAR {selectedService.price}</p>
            </div>
          </div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full py-4 rounded-2xl text-white font-extrabold text-base disabled:opacity-60 transition-all shadow-lg"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
          {submitting ? '🐾 Creating booking...' : '🐾 Confirm Booking & Send WhatsApp'}
        </button>
      </form>
    </div>
  );
}
