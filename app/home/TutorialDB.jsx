<<<<<<< HEAD
<<<<<<< HEAD
import { getSupabase } from "@/lib/supabase";
import TutorialList from "./TutorialList";

export default async function TutorialDb() {
  const { data, error } = await getSupabase()
=======
=======
>>>>>>> development
import { supabase } from "@/lib/supabase";
import TutorialList from "./TutorialList";

export default async function TutorialDB() {
  const { data: tutorials, error } = await supabase
<<<<<<< HEAD
>>>>>>> development
=======
>>>>>>> development
    .from("tutorial_list")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Gagal mengambil tutorial dari Supabase:", error);
    return <TutorialList initialTutorials={[]} />;
  }

<<<<<<< HEAD
<<<<<<< HEAD
  return <TutorialList initialTutorials={data ?? []} />;
}
=======
  return <TutorialList initialTutorials={tutorials || []} />;
}
>>>>>>> development
=======
  return <TutorialList initialTutorials={tutorials || []} />;
}
>>>>>>> development
