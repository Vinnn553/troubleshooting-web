import { Suspense } from 'react';
import Statistik from './Statistik';
import UserGreeting from './UserGreeting';

export const instant = false;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm">
          Selamat datang kembali, <UserGreeting />!
        </p>
      </div>

      {/* Komponen Statistik Database dengan Suspense Streaming */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-28 shadow-sm"></div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-28 shadow-sm"></div>
          </div>
        }
      >
        <Statistik />
      </Suspense>

      {/* Bagian Konten Utama */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Aktivitas Terkini</h2>
        <p className="text-slate-600">Konten atau tabel data lainnya bisa ditaruh di sini...</p>
      </div>
    </div>
  );
}
