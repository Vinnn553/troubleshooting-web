import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./home/HeroSection";
import CategorySection from "./home/CategorySection";
import TutorialDb from "./home/TutorialDB";
import { Suspense } from "react";
import Loading from "./home/Loading";

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
