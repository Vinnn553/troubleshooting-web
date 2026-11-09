// app/components/Search.js
'use server';

import { getServiceSupabase, supabase } from "@/lib/supabase";

const KATEGORI_OPTIONS = [
  'Sistem Operasi',
  'Hardware & Software',
  'Jaringan',
  'Storage & Driver',
];

export async function searchItem(query) {
  try {
    if (!query || !query.trim()) {
      return [];
    }

    // Bersihkan karakter koma/kurung agar tidak merusak parser filter PostgREST
    const cleanQuery = query.replace(/[,()]/g, ' ').trim();
    if (!cleanQuery) return [];

    // Prioritaskan service role client untuk memastikan bypass RLS di server, atau fallback ke client publik
    const db = getServiceSupabase ? getServiceSupabase() : supabase;

    // Cek apakah query cocok dengan salah satu nama ENUM kategori
    const matchedKategori = KATEGORI_OPTIONS.find((k) =>
      k.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      cleanQuery.toLowerCase().includes(k.toLowerCase())
    );

    // Di PostgreSQL, kolom ENUM (kategori) tidak mendukung operator ILIKE (~~*).
    // Oleh karena itu, ILIKE digunakan untuk kolom teks (title & langkah),
    // sedangkan kategori dicocokkan menggunakan operator kesetaraan (.eq).
    let orConditions = `title.ilike.%${cleanQuery}%,langkah.ilike.%${cleanQuery}%`;
    if (matchedKategori) {
      orConditions += `,kategori.eq.${matchedKategori}`;
    }

    const { data, error } = await db
      .from('tutorial_list')
      .select('*')
      .or(orConditions)
      .order('id', { ascending: false })
      .limit(8);

    if (error) {
      console.error('Supabase search error:', error);
      // Fallback: coba pencarian hanya pada judul jika filter gabungan bermasalah
      const { data: fallbackData } = await db
        .from('tutorial_list')
        .select('*')
        .ilike('title', `%${cleanQuery}%`)
        .order('id', { ascending: false })
        .limit(8);

      return fallbackData || [];
    }

    return data || [];
  } catch (error) {
    console.error('Database Error in searchItem:', error);
    return [];
  }

  return data;
}
