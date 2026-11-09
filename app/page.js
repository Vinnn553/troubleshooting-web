import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./home/HeroSection";
import CategorySection from "./home/CategorySection";
<<<<<<< HEAD
import TutorialDb from "./home/TutorialDB";
import { Suspense } from "react";
import Loading from "./home/Loading";
=======
import TutorialDB from "./home/TutorialDB";
import { Suspense } from "react";
import Loading from "./home/Loading";

export const instant = false;
>>>>>>> development

export default function Home() {
  return (
    <div>
      <Header />
      <HeroSection />
      <CategorySection />
      <Suspense fallback={<Loading />}>
<<<<<<< HEAD
        <TutorialDb />
=======
        <TutorialDB />
>>>>>>> development
      </Suspense>
      <Footer />
    </div>
  );
}
