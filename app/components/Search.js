// app/components/Search.js
'use server';
import pool, { supabase } from "@/lib/supabase";

export async function searchItem(query) {
  try {
    if (!query || !query.trim()) {
      const [rows] = await supabase.from('tutorial_list').select();
      return rows;
    }

    const [rows] = await supabase.from(
      "SELECT * FROM `tutorial-list` WHERE title LIKE ? ORDER BY title ASC",
      [`%${query.trim()}%`]
    );
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Gagal melakukan pencarian.');
  }

  return data;
}
