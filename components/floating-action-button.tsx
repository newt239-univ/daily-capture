"use client";

import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function FloatingActionButton() {
  const router = useRouter();

  return (
    <Button
      className="absolute bottom-20 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-50"
      onClick={() => router.push("/capture")}
    >
      <Camera className="w-6 h-6" />
      <span className="sr-only">投稿</span>
    </Button>
  );
}
