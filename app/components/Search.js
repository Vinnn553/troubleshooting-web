// app/components/Search.js
'use server';
import { supabase } from "@/lib/supabase";

export async function searchItem(query) {
  try {
    if (!query || !query.trim()) {
      const { data, error } = await supabase
        .from('tutorial_list')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    const { data, error } = await supabase
      .from('tutorial_list')
      .select('*')
      .ilike('title', `%${query.trim()}%`)
      .order('title', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Gagal melakukan pencarian.');
  }
}
