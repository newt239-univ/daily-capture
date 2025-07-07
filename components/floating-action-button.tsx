"use client";

import { useRouter } from "next/navigation";

import { Camera } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function FloatingActionButton() {
  const router = useRouter();

  return (
    <Button
      className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-50"
      onClick={() => router.push("/capture")}
    >
      <Camera className="w-6 h-6" />
      <span className="sr-only">投稿</span>
    </Button>
  );
}
