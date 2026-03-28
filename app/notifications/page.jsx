'use client';
import { useState } from 'react';
import { sendWhatsApp } from '@/lib/notify';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const TEMPLATES = [
  {
    id: 'reminder',
    icon: '📅',
    name: 'Appointment Reminder',
    color: '#3B82F6',
    bg: '#EFF6FF',
    defaultMessage: "Don't forget! Your pet has a grooming appointment tomorrow at [time] 🐾 See you at Paws & Groom!",
    placeholder: 'Replace [time] with the actual appointment time',
  },
  {
    id: 'complete',
    icon: '🎉',
    name: 'Grooming Complete',
    color: '#10B981',
    bg: '#ECFDF5',
    defaultMessage: "[Pet name] is ready for pickup! Looking absolutely fabulous ✨ Thank you for choosing Paws & Groom! 🐾",
    placeholder: 'Replace [Pet name] with the pet\'s name',
  },
  {
    id: 'promo',
    icon: '🌟',
    name: 'Special Offer',
    color: '#F97316',
    bg: '#FFF7ED',
    defaultMessage: "🌟 SPECIAL OFFER! Get 20% off Full Grooming this week only! Book now and treat your pet to a fabulous experience. Reply YES to book! 🐾",
    placeholder: 'Customize the offer details',
  },
  {
    id: 'review',
    icon: '⭐',
    name: 'Review Request',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    defaultMessage: "Hi! We hope your pet enjoyed their grooming session at Paws & Groom 🐾 Your feedback means the world to us! Please leave us a review — it helps other pet owners find us. Thank you! 🙏",
    placeholder: 'You can personalize with the pet owner\'s name',
  },
];

function TemplateCard({ tpl }) {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(tpl.defaultMessage);
  const [sending, setSending] = useState(false);

  async function send() {
    if (!phone) { toast.error('Enter a phone number'); return; }
    if (!message) { toast.error('Message cannot be empty'); return; }
    setSending(true);
    const ok = await sendWhatsApp(phone, message);
    if (ok) {
      toast.success(`${tpl.name} sent! 📲`);
    } else {
      toast.error('Failed to send — check the notify webhook');
    }
    setSending(false);
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: tpl.bg }}>
          {tpl.icon}
        </div>
        <div>
          <h3 className="font-extrabold text-gray-900">{tpl.name}</h3>
          <p className="text-xs text-gray-400">WhatsApp Template</p>
        </div>
        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: tpl.bg, color: tpl.color }}>
          Ready
        </span>
      </div>

      {/* Message editor */}
      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Message</label>
        <textarea
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
          rows={3}
          value={message}
          onChange={e => setMessage(e.target.value)}
          style={{ fontSize: '13px', lineHeight: '1.5' }} />
        <p className="text-xs text-gray-300 mt-1">{tpl.placeholder}</p>
      </div>

      {/* Phone + Send */}
      <div className="flex gap-2">
        <input type="tel"
          placeholder="+974 or +971..."
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
        <button onClick={send} disabled={sending}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity"
          style={{ background: tpl.color }}>
          {sending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [bulkMessage, setBulkMessage] = useState('');
  const [clientCount, setClientCount] = useState(null);
  const [loadingCount, setLoadingCount] = useState(false);

  async function loadClientCount() {
    setLoadingCount(true);
    const { count } = await supabase
      .from('pg_clients')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', 'default');
    setClientCount(count || 0);
    setLoadingCount(false);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: '#0D2B1E' }}>📲 WhatsApp Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">
          Send instant WhatsApp messages to your clients using pre-built templates
        </p>
      </div>

      {/* Stats bar */}
      <div className="rounded-2xl p-4 mb-6 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #0D2B1E, #1A4A35)' }}>
        <span className="text-3xl">📲</span>
        <div>
          <p className="text-white font-bold">WhatsApp Notifications Active</p>
          <p className="text-xs mt-0.5" style={{ color: '#A7F3D0' }}>
            Powered by n8n webhook · Messages delivered instantly via Unipile
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-green-400">Connected</span>
        </div>
      </div>

      {/* Template Cards */}
      <h2 className="font-extrabold text-gray-800 mb-3">Quick Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {TEMPLATES.map(tpl => <TemplateCard key={tpl.id} tpl={tpl} />)}
      </div>

      {/* Bulk Announce */}
      <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E0F2E9' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: '#F7FDF9' }}>
            📢
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900">Bulk Announcement</h3>
            <p className="text-xs text-gray-400">Send a message to all registered clients</p>
          </div>
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#FFF7ED', color: '#F97316' }}>
            Coming Soon
          </span>
        </div>

        <textarea
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none mb-3"
          rows={3}
          placeholder="e.g. We're open on Eid holidays! Book your pet's grooming session now 🐾"
          value={bulkMessage}
          onChange={e => setBulkMessage(e.target.value)} />

        <div className="flex items-center gap-3">
          <button onClick={loadClientCount} disabled={loadingCount}
            className="px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ background: '#F3F4F6', color: '#6B7280' }}>
            {loadingCount ? 'Loading...' : 'Check audience size'}
          </button>
          {clientCount !== null && (
            <p className="text-sm font-semibold text-gray-600">
              This will send to <span className="font-extrabold" style={{ color: '#10B981' }}>{clientCount}</span> clients
            </p>
          )}
          <button
            className="ml-auto px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: '#E5E7EB', color: '#9CA3AF', cursor: 'not-allowed' }}
            disabled>
            Send Bulk — Coming Soon
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 rounded-2xl p-5" style={{ background: '#F7FDF9', border: '1px solid #E0F2E9' }}>
        <h3 className="font-bold text-gray-800 mb-3">Tips for Better WhatsApp Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: '⏰', tip: 'Send reminders 24 hours before the appointment for best results' },
            { icon: '🎯', tip: 'Personalize messages with pet names for higher response rates' },
            { icon: '📏', tip: 'Keep promotional messages under 160 characters' },
            { icon: '🕐', tip: 'Send promotional messages between 10am–6pm Qatar time' },
          ].map(t => (
            <div key={t.tip} className="flex items-start gap-2">
              <span className="text-lg flex-shrink-0">{t.icon}</span>
              <p className="text-sm text-gray-600">{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
