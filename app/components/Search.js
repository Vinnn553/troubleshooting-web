// app/components/Search.js
'use server';
import { getSupabase } from "@/lib/supabase";

export async function searchItem(query) {
  const normalizedQuery = typeof query === "string" ? query.trim() : "";
  let request = getSupabase()
    .from("tutorial_list")
    .select("*")
    .order("title", { ascending: true });

  if (normalizedQuery) {
    request = request.ilike("title", `%${normalizedQuery}%`);
  }

  const { data, error } = await request;
  if (error) {
    console.error("Gagal mencari tutorial:", error);
    throw new Error("Gagal melakukan pencarian.");
  }

  return data;
}
