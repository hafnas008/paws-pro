'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

const DEMO_STAFF = [
  {
    id: 1,
    name: 'Nour Al-Rashid',
    role: 'Lead Groomer',
    specialty: 'Dog Specialist',
    shift: 'Morning',
    rating: 4.9,
    bookings: 142,
    avatar_color: '#10B981',
    active: true,
    skills: ['Full Grooming', 'Spa Day', 'Nail Clip'],
  },
  {
    id: 2,
    name: 'Priya Menon',
    role: 'Senior Groomer',
    specialty: 'Cat & Small Breeds',
    shift: 'Afternoon',
    rating: 4.8,
    bookings: 98,
    avatar_color: '#8B5CF6',
    active: true,
    skills: ['Bath', 'Full Grooming', 'Teeth Cleaning'],
  },
  {
    id: 3,
    name: 'Khalid Al-Mansoori',
    role: 'Groomer',
    specialty: 'All Breeds',
    shift: 'Morning',
    rating: 4.7,
    bookings: 67,
    avatar_color: '#F97316',
    active: true,
    skills: ['Basic Bath', 'Nail Clip', 'Trim'],
  },
  {
    id: 4,
    name: 'Sara Al-Farsi',
    role: 'Junior Groomer',
    specialty: 'Exotic Pets',
    shift: 'Afternoon',
    rating: 4.6,
    bookings: 34,
    avatar_color: '#EC4899',
    active: false,
    skills: ['Basic Bath', 'Nail Clip'],
  },
];

const SHIFT_COLORS = {
  Morning: { bg: '#FFF7ED', color: '#F97316' },
  Afternoon: { bg: '#EDE9FE', color: '#8B5CF6' },
};

export default function StaffPage() {
  const [staff, setStaff] = useState(DEMO_STAFF);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: '', specialty: '', shift: 'Morning' });

  function toggleActive(id) {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    toast.success('Staff status updated');
  }

  function handleAddStaff(e) {
    e.preventDefault();
    toast('Staff management requires pg_staff table setup in Supabase.\n\nThis is a demo view.', {
      icon: '💼',
      duration: 5000,
    });
    setShowAddModal(false);
  }

  const activeCount = staff.filter(s => s.active).length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: '#0D2B1E' }}>💼 Groomers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activeCount} of {staff.length} groomers on duty</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-2xl text-white font-bold text-sm shadow-md"
          style={{ background: '#10B981' }}>
          + Add Groomer
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Staff', value: staff.length, icon: '👥', color: '#10B981' },
          { label: 'Active Today', value: activeCount, icon: '✅', color: '#F97316' },
          { label: 'Total Bookings', value: staff.reduce((s, g) => s + g.bookings, 0), icon: '📅', color: '#8B5CF6' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
            style={{ border: '1px solid #E0F2E9' }}>
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className="text-xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-gray-500 font-semibold">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {staff.map(member => {
          const shiftStyle = SHIFT_COLORS[member.shift] || SHIFT_COLORS.Morning;
          return (
            <div key={member.id}
              className="bg-white rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-md"
              style={{
                border: '1px solid #E0F2E9',
                opacity: member.active ? 1 : 0.65,
              }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0"
                    style={{ background: member.avatar_color }}>
                    {member.name[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900">{member.name}</h3>
                    <p className="text-sm font-semibold text-gray-500">{member.role}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: member.avatar_color }}>
                      {member.specialty}
                    </p>
                  </div>
                </div>
                {/* Active toggle */}
                <button onClick={() => toggleActive(member.id)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                  style={{ background: member.active ? '#10B981' : '#D1D5DB' }}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${member.active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Details */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: shiftStyle.bg, color: shiftStyle.color }}>
                  {member.shift} Shift
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  ⭐ {member.rating} rating
                </span>
                <span className="text-xs font-semibold text-gray-500 ml-auto">
                  {member.bookings} bookings
                </span>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5">
                {member.skills.map(skill => (
                  <span key={skill} className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: '#F7FDF9', color: '#10B981', border: '1px solid #D1FAE5' }}>
                    {skill}
                  </span>
                ))}
              </div>

              {!member.active && (
                <div className="mt-3 text-xs font-semibold text-center py-1.5 rounded-xl"
                  style={{ background: '#FEF2F2', color: '#EF4444' }}>
                  Off Duty
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note about pg_staff */}
      <div className="mt-6 rounded-2xl p-4" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
        <p className="text-sm font-semibold" style={{ color: '#92400E' }}>
          Staff data is currently demo-only.
          To persist staff records, create a <code className="bg-orange-100 px-1 rounded">pg_staff</code> table in Supabase with columns:
          <span className="font-mono text-xs ml-1">id, organization_id, name, role, specialty, shift, is_active, created_at</span>
        </p>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <h2 className="font-extrabold text-xl text-gray-900 mb-1">Add New Groomer</h2>
            <p className="text-sm text-gray-400 mb-5">Staff data will require pg_staff table in Supabase</p>
            <form onSubmit={handleAddStaff} className="space-y-3">
              {[
                { label: 'Full Name', key: 'name', placeholder: 'e.g. Ahmed Al-Sayed' },
                { label: 'Role', key: 'role', placeholder: 'e.g. Senior Groomer' },
                { label: 'Specialty', key: 'specialty', placeholder: 'e.g. Dog Specialist' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">{f.label}</label>
                  <input type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    placeholder={f.placeholder}
                    value={newStaff[f.key]}
                    onChange={e => setNewStaff(s => ({ ...s, [f.key]: e.target.value }))}
                    required />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Shift</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white"
                  value={newStaff.shift}
                  onChange={e => setNewStaff(s => ({ ...s, shift: e.target.value }))}>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: '#10B981' }}>
                  Add Groomer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
