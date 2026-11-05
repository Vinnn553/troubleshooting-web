import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./home/HeroSection";
import CategorySection from "./home/CategorySection";
import TutorialList from "./home/TutorialList";
import { Suspense } from "react";
import Loading from "./home/Loading";
import { supabase } from "@/lib/supabase";

async function TutorialDb() {
  const { data, error } = await supabase
      .from('tutorial_list')
      .select('*')
      .order('id', { ascending: false });

  if (error) {
    console.error("Data tidak tersedia");
    return <TutorialList initialTutorials={[]} />;
  }
  return <TutorialList initialTutorials={data ?? []} />;
}

export default function Home() {
  return (
    <div>
      <Header />
      <HeroSection />
      <CategorySection />
      <Suspense fallback={<Loading />}>
        <TutorialDb />
      </Suspense>
      <Footer />
    </div>
  );
}
