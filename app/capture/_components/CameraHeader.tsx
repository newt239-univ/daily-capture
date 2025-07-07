"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

type CameraHeaderProps = {
  onUploadClick: () => void;
};

export default function CameraHeader({ onUploadClick }: CameraHeaderProps) {
  const router = useRouter();

  return (
    <>
      {/* 戻るボタン */}
      <div className="absolute top-4 left-4 z-30">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* アップロードボタン */}
      <div className="absolute top-4 right-4 z-30">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onUploadClick}
        >
          <Upload className="w-5 h-5" />
        </Button>
      </div>
    </>
  );
}
