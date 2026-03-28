export async function sendWhatsApp(phone, message) {
  if (!phone) return false;
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_NOTIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message }),
    });
    return res.ok;
  } catch { return false; }
}
