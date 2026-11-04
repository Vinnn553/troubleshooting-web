import Sidebar from "@/app/components/Sidebar";

// Halaman di dalam (admin) bersifat dinamis karena ada sesi user
export const instant = false;

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar tetap di sebelah kiri (sticky / fixed height) */}
      <Sidebar />

      {/* Konten Body Halaman di sebelah kanan */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
