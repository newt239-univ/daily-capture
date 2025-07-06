import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import CameraInterface from "./_components/CameraInterface";

export default async function CapturePage() {
  const user = await getUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-black relative w-screen -mx-auto">
      <CameraInterface />
    </div>
  );
}
