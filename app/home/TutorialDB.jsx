import { getSupabase } from "@/lib/supabase";
import TutorialList from "./TutorialList";

export default async function TutorialDb() {
  const { data, error } = await getSupabase()
    .from("tutorial_list")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Gagal mengambil tutorial dari Supabase:", error);
    return <TutorialList initialTutorials={[]} />;
  }

  return <TutorialList initialTutorials={data ?? []} />;
}