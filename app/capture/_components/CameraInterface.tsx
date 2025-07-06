"use client";

import { useState, useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserSpots } from "../actions";
import { Decimal } from "@prisma/client/runtime/library";
import CameraHeader from "./CameraHeader";
import PreviewModal from "./PreviewModal";
import UploadModal from "./UploadModal";
import { useRouter } from "next/navigation";

type Spot = {
  id: string;
  name: string;
  lat: Decimal | null;
  lng: Decimal | null;
  user_id: string;
  reference_image_url: string | null;
  created_at: Date | null;
};

export default function CameraInterface() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [userSpots, setUserSpots] = useState<Spot[]>([]);
  const [imageSource, setImageSource] = useState<"camera" | "upload">("camera");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    // ユーザーのスポット一覧を取得
    const loadUserSpots = async () => {
      try {
        const spots = await getUserSpots();
        setUserSpots(spots);
      } catch (error) {
        console.error("スポットの取得に失敗しました:", error);
      }
    };

    loadUserSpots();

    // カメラストリームを開始
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

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
    setUploadedImage(null);
    setImageSource("camera");
    setShowPreview(true);
  };

  const handleFileUpload = (file: File) => {
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string);
      setImageSource("upload");
      setShowPreview(true);
    };
    reader.readAsDataURL(file);
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
    setCapturedImage(null);
    setUploadedImage(null);
  };

  const handlePreviewSuccess = () => {
    setShowPreview(false);
    setCapturedImage(null);
    setUploadedImage(null);
    router.push("/");
  };

  return (
    <>
      <CameraHeader onUploadClick={() => setShowUploadOption(true)} />

      {/* カメラプレビュー */}
      <div className="relative w-full h-screen">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

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

        {/* スポット名表示 */}
        {userSpots.length > 0 && (
          <div className="absolute top-20 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {userSpots[0].name}
          </div>
        )}
      </div>

      {/* 隠しcanvas */}
      <canvas ref={canvasRef} className="hidden" />

      <UploadModal
        isOpen={showUploadOption}
        onClose={() => setShowUploadOption(false)}
        onFileUpload={handleFileUpload}
      />

      <PreviewModal
        isOpen={showPreview}
        onClose={handlePreviewClose}
        capturedImage={capturedImage}
        uploadedImage={uploadedImage}
        imageSource={imageSource}
        userSpots={userSpots}
        onSuccess={handlePreviewSuccess}
      />
    </>
  );
}
