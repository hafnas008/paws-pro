'use client';
import Link from 'next/link';

const PACKAGES = [
  {
    id: 'bath',
    emoji: '🛁',
    name: 'Basic Bath',
    price: 50,
    desc: 'Shampoo, blow dry, ear cleaning and a fresh scent. Perfect for regular maintenance between grooming sessions.',
    duration: '45 min',
    topColor: '#3B82F6',
    bg: '#EFF6FF',
    features: ['Premium shampoo & conditioner', 'Blow dry & brush out', 'Ear cleaning', 'Fresh cologne spritz'],
  },
  {
    id: 'grooming',
    emoji: '✂️',
    name: 'Full Grooming',
    price: 120,
    desc: 'Complete grooming package including bath, breed-specific haircut, nail trimming and accessories.',
    duration: '90 min',
    topColor: '#10B981',
    bg: '#ECFDF5',
    features: ['Full bath & blow dry', 'Breed-specific cut', 'Nail clip & file', 'Bandana or bow accessory'],
  },
  {
    id: 'nail_clip',
    emoji: '💅',
    name: 'Nail Clip',
    price: 25,
    desc: 'Quick and professional nail trimming by our experienced groomers. Prevents overgrowth and discomfort.',
    duration: '15 min',
    topColor: '#EC4899',
    bg: '#FDF2F8',
    features: ['Precision nail trimming', 'Nail filing & smoothing', 'Quick & stress-free', 'No appointment needed'],
  },
  {
    id: 'full_service',
    emoji: '⭐',
    name: 'Spa Day',
    price: 180,
    desc: 'The ultimate luxury grooming experience. Full grooming, deep conditioning massage and premium products.',
    duration: '2 hrs',
    topColor: '#F97316',
    bg: '#FFF7ED',
    features: ['Full grooming package', 'Deep conditioning mask', 'Relaxation massage', 'Premium cologne & bow', 'Paw butter treatment'],
    badge: 'Most Popular',
  },
  {
    id: 'trim',
    emoji: '🦷',
    name: 'Teeth Cleaning',
    price: 60,
    desc: 'Professional dental hygiene treatment using pet-safe tools and enzymatic toothpaste for a healthy smile.',
    duration: '30 min',
    topColor: '#8B5CF6',
    bg: '#F5F3FF',
    features: ['Enzymatic toothpaste', 'Tartar removal brushing', 'Breath freshener', 'Dental health check'],
  },
];

export default function PackagesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: '#0D2B1E' }}>✨ Grooming Packages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Professional services for your beloved pets — priced in QAR
          </p>
        </div>
        <Link href="/bookings/new"
          className="px-4 py-2 rounded-2xl text-white font-bold text-sm shadow-md"
          style={{ background: '#10B981' }}>
          Book a Service
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="rounded-2xl p-6 mb-8 mt-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #0D2B1E, #1A4A35)', border: '1px solid #0D2B1E' }}>
        <span className="text-5xl">🐾</span>
        <div>
          <h2 className="text-xl font-extrabold text-white">Premium Pet Grooming in Qatar &amp; UAE</h2>
          <p className="text-sm mt-1" style={{ color: '#A7F3D0' }}>
            All services use hypoallergenic, pet-safe products · Trained professional groomers · Walk-in &amp; appointments available
          </p>
        </div>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PACKAGES.map(pkg => (
          <div key={pkg.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow relative"
            style={{ border: '1px solid #E0F2E9' }}>
            {/* Colored top bar */}
            <div className="h-2 w-full" style={{ background: pkg.topColor }} />

            {/* Badge */}
            {pkg.badge && (
              <div className="absolute top-4 right-4">
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full text-white"
                  style={{ background: pkg.topColor }}>
                  {pkg.badge}
                </span>
              </div>
            )}

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: pkg.bg }}>
                  {pkg.emoji}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{pkg.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-extrabold" style={{ color: '#10B981' }}>QAR {pkg.price}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      ⏱ {pkg.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{pkg.desc}</p>

              {/* Features list */}
              <ul className="space-y-1.5 mb-5">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                      style={{ background: pkg.bg, color: pkg.topColor }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Book button */}
              <Link href="/bookings/new"
                className="block w-full text-center py-2.5 rounded-xl text-sm font-extrabold transition-all hover:opacity-90"
                style={{ background: pkg.bg, color: pkg.topColor, border: `1.5px solid ${pkg.topColor}33` }}>
                Book Now →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '🛡️', title: 'Safe & Hypoallergenic', desc: 'All products are vet-approved and pet-safe' },
          { icon: '👨‍🎨', title: 'Certified Groomers', desc: 'Professional, experienced and caring staff' },
          { icon: '📲', title: 'WhatsApp Notifications', desc: 'Instant booking confirmations & reminders' },
        ].map(info => (
          <div key={info.title} className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm"
            style={{ border: '1px solid #E0F2E9' }}>
            <span className="text-2xl">{info.icon}</span>
            <div>
              <p className="font-bold text-gray-800 text-sm">{info.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{info.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
