import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./home/HeroSection";
import CategorySection from "./home/CategorySection";
import TutorialList from "./home/TutorialList";
import { Suspense } from "react";
import Loading from "./home/Loading";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  // Ambil data tutorial dari Supabase dengan aman
  let tutorials = [];
  try {
    const { data, error } = await supabase
      .from('tutorial_list')
      .select('*')
      .order('id', { ascending: false });

    if (!error && data) {
      tutorials = data;
    }
  } catch (err) {
    console.error("Gagal terhubung ke Supabase:", err);
  }

  return (
    <div>
      <Header />
      <HeroSection />
      <CategorySection />
      <Suspense fallback={<Loading />}>
        <TutorialList initialTutorials={tutorials} />
      </Suspense>
      <Footer />
    </div>
  );
}
