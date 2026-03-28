import './globals.css';
import Sidebar from '@/components/Sidebar';
import { Toaster } from 'react-hot-toast';
export const metadata = { title: 'Paws & Groom Pro', description: 'Professional Pet Grooming Management' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen" style={{ background: '#F7FDF9' }}>
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6 min-h-screen overflow-x-hidden">{children}</main>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: '16px', background: '#0D2B1E', color: '#fff' } }} />
      </body>
    </html>
  );
}
