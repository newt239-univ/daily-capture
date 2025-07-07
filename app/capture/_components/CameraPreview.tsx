"use client";

import Image from "next/image";
import { forwardRef } from "react";

import { Camera } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Shot {
  id: string;
  timestamp: number;
  imageUrl: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

type CameraPreviewProps = {
  latestShot: Shot | undefined;
  previousShotsCount: number;
  onCapture: () => void;
};

const CameraPreview = forwardRef<HTMLVideoElement, CameraPreviewProps>(
  ({ latestShot, previousShotsCount, onCapture }, ref) => {
    return (
      <div className="relative w-full h-screen">
        <video
          ref={ref}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* 過去フレームオーバーレイ */}
        {latestShot && (
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src={latestShot.imageUrl || "/placeholder.svg"}
              alt="前回の撮影"
              fill
              className="object-cover opacity-30"
              style={{ zIndex: 0 }}
              sizes="100vw"
              priority={true}
            />
          </div>
        )}

        {/* 撮影フレーム枠線 */}
        <div className="absolute inset-4 border-2 border-white/50 rounded-lg pointer-events-none">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
        </div>

        {/* 撮影ボタン */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <Button
            size="lg"
            className="w-20 h-20 rounded-full bg-white hover:bg-gray-100 text-black border-4 border-gray-300"
            onClick={onCapture}
          >
            <Camera className="w-8 h-8" />
          </Button>
        </div>

        {/* 撮影回数表示 */}
        {previousShotsCount > 0 && (
          <div className="absolute top-20 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {previousShotsCount}回目
          </div>
        )}
      </div>
    );
  }
);

CameraPreview.displayName = "CameraPreview";

export default CameraPreview;
