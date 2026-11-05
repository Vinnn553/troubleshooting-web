import { getSupabase } from '@/lib/supabase';

export default async function Statistik() {
  const { count, error } = await getSupabase()
    .from('tutorial_list')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error("Gagal mengambil data statistik:", error);
    throw error;
  }

  const totalTutorial = count ?? 0;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Tutorial</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalTutorial}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Buka</p>
          <h3 className="text-3xl font-semibold text-slate-800 mt-2">90</h3>
        </div>
      </div>
    </div>
  );
}
