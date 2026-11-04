import { supabase } from '@/lib/supabase';

export default async function Statistik() {
  let totalTutorial = 0;

  try {
    const { count } = await supabase.from('tutorial_list').select('*', { count: 'exact', head: true });
    // const [rows] = await supabase.from("SELECT COUNT(*) AS total FROM `tutorial-list`");
    totalTutorial = count || 0;
  } catch (error) {
    console.error("Gagal mengambil data statistik:", error);
  }

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
