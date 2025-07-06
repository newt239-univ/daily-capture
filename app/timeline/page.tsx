import BottomNavigation from "@/components/bottom-navigation";
import FloatingActionButton from "@/components/floating-action-button";
import TimelineHeader from "./_components/TimelineHeader";
import TimelineContent from "./_components/TimelineContent";

export default function TimelinePage() {
  return (
    <div className="min-h-screen pb-20">
      <TimelineHeader />
      <TimelineContent />
      <BottomNavigation currentPage="timeline" />
      <FloatingActionButton />
    </div>
  );
}
