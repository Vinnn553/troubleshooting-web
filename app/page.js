import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./home/HeroSection";
import CategorySection from "./home/CategorySection";
import TutorialList from "./home/TutorialList";
import { Suspense } from "react";
import Loading from "./home/Loading";
import { supabase } from "@/lib/supabase";

export const instant = false;
// app/page.tsx
export const dynamic = 'force-dynamic'

export default async function Home() {
  // Ambil data tutorial dari Supabase
  const { data: tutorials, error } = await supabase
    .from('tutorial_list')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error("Gagal mengambil data dari Supabase:", error);
  }

  return (
    <div>
      <Header />
      <HeroSection />
      <CategorySection />
      <Suspense fallback={<Loading />}>
        <TutorialList initialTutorials={tutorials || []} />
      </Suspense>
      
      <Footer />
    </div>
  );
}
