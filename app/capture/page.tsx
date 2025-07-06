import BottomNavigation from "@/components/bottom-navigation";
import CaptureHeader from "./_components/CaptureHeader";
import CameraInterface from "./_components/CameraInterface";

export default function CapturePage() {
  return (
    <div className="min-h-screen bg-black relative">
      <CaptureHeader />
      <CameraInterface />
      <BottomNavigation currentPage="timeline" />
    </div>
  );
}
