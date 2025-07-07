import { redirect } from "next/navigation";

import CameraInterface from "./_components/CameraInterface";

import { getUser } from "@/lib/auth";

export default async function CapturePage() {
  const user = await getUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-black relative -mx-auto flex flex-col w-full">
      <CameraInterface />
    </div>
  );
}
