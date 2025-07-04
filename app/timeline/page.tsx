import BottomNavigation from "@/components/bottom-navigation";
import TimelineHeader from "./_components/TimelineHeader";
import TimelineContent from "./_components/TimelineContent";

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TimelineHeader />
      <TimelineContent />
      <BottomNavigation currentPage="timeline" />
    </div>
  );
}
