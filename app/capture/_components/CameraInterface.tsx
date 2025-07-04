"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, ArrowLeft, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

type RegisteredLocation = { name: string; lat: number; lng: number } | null;

export default function CameraInterface() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previousShots, setPreviousShots] = useState<Shot[]>([]);
  const [registeredLocation, setRegisteredLocation] =
    useState<RegisteredLocation>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    // 登録地点の確認
    const savedLocation = localStorage.getItem("registeredLocation");
    if (!savedLocation) {
      router.push("/register-location");
      return;
    }
    setRegisteredLocation(JSON.parse(savedLocation));

    // 過去の撮影データを読み込み
    const savedShots = localStorage.getItem("fixedPointShots");
    if (savedShots) {
      setPreviousShots(JSON.parse(savedShots));
    }

    // カメラストリームを開始
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [router, stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("カメラの起動に失敗しました:", error);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageDataUrl);
    setShowPreview(true);
  };

  const savePhoto = () => {
    if (!capturedImage || !registeredLocation) return;

    const newShot: Shot = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      imageUrl: capturedImage,
      location: registeredLocation,
    };

    const updatedShots = [...previousShots, newShot];
    localStorage.setItem("fixedPointShots", JSON.stringify(updatedShots));

    setShowPreview(false);
    setCapturedImage(null);
    router.push("/timeline");
  };

  const retakePhoto = () => {
    setShowPreview(false);
    setCapturedImage(null);
  };

  const latestShot = previousShots[previousShots.length - 1];

  return (
    <>
      {/* 戻るボタン */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* カメラプレビュー */}
      <div className="relative w-full h-screen">
        <video
          ref={videoRef}
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
            onClick={capturePhoto}
          >
            <Camera className="w-8 h-8" />
          </Button>
        </div>

        {/* 撮影回数表示 */}
        {previousShots.length > 0 && (
          <div className="absolute top-20 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {previousShots.length}回目
          </div>
        )}
      </div>

      {/* 隠しcanvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* プレビューモーダル */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-sm p-0 bg-black border-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-white text-center">
              撮影確認
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {capturedImage && (
              <Image
                src={capturedImage || "/placeholder.svg"}
                alt="撮影画像"
                width={400}
                height={300}
                className="w-full rounded-lg"
                style={{ objectFit: "cover" }}
                sizes="100vw"
                priority={true}
              />
            )}
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={retakePhoto}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                撮り直し
              </Button>
              <Button className="flex-1" onClick={savePhoto}>
                <Check className="w-4 h-4 mr-2" />
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}