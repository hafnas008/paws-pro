'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', icon: '🏠', label: 'Dashboard' },
  { href: '/bookings', icon: '📅', label: 'Bookings' },
  { href: '/bookings/new', icon: '➕', label: 'New Booking' },
  { href: '/pets', icon: '🐾', label: 'Pet Profiles' },
  { href: '/clients', icon: '👥', label: 'Clients' },
  { href: '/packages', icon: '✨', label: 'Packages' },
  { href: '/staff', icon: '💼', label: 'Groomers' },
  { href: '/billing', icon: '💳', label: 'Billing' },
  { href: '/notifications', icon: '📲', label: 'WhatsApp' },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed top-0 left-0 h-full w-64 hidden md:flex flex-col z-50" style={{ background: '#0D2B1E' }}>
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐾</span>
          <div>
            <h1 className="font-extrabold text-white text-lg leading-tight">Paws &amp; Groom</h1>
            <p className="text-xs" style={{ color: '#6EE7B7' }}>Pro Edition</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = path === item.href;
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all"
              style={{ background: active ? '#10B981' : 'transparent', color: active ? '#fff' : '#A7F3D0' }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <p className="text-xs font-semibold" style={{ color: '#A7F3D0' }}>Qatar · UAE</p>
          <p className="text-xs text-white/30 mt-0.5">v2.0 Pro</p>
        </div>
      </div>
    </aside>
  );
}
