import BottomNavigation from "@/components/bottom-navigation";
import HeroSection from "./_components/HeroSection";
import MainCTASection from "./_components/MainCTASection";
import LatestTimelineSection from "./_components/LatestTimelineSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      <HeroSection />
      <MainCTASection />
      <LatestTimelineSection />
      <BottomNavigation currentPage="home" />
    </div>
  );
}
