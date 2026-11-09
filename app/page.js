import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./home/HeroSection";
import CategorySection from "./home/CategorySection";
import TutorialList from "./home/TutorialList";
import { Suspense } from "react";
import Loading from "./home/Loading";

export const instant = false;
// app/page.tsx
export const dynamic = 'force-dynamic'

export default function Home() {
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
