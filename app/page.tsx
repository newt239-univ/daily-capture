import TimelineHeader from "./_components/timeline/TimelineHeader";
import TimelineContent from "./_components/timeline/TimelineContent";

export default function HomePage() {
  return (
    <div className="min-h-screen pb-20">
      <TimelineHeader />
      <TimelineContent />
    </div>
  );
}
