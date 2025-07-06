"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import CameraHeader from "./CameraHeader";
import PreviewModal from "./PreviewModal";
import UploadModal from "./UploadModal";
import { useRouter } from "next/navigation";

type GeolocationData = {
  lat: number;
  lng: number;
  timestamp: number;
};

export default function CameraInterface() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showUploadOption, setShowUploadOption] = useState(false);

  const [imageSource, setImageSource] = useState<"camera" | "upload">("camera");
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<GeolocationData | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  // 位置情報を取得する関数
  const getCurrentLocation = useCallback((): Promise<GeolocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("位置情報がサポートされていません"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now(),
          });
        },
        (error) => {
          console.error("位置情報の取得に失敗しました:", error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5分間のキャッシュを許可
        }
      );
    });
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (stream) return; // 既にストリームがある場合は何もしない

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
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  useEffect(() => {
    // 位置情報を取得
    const loadLocationAndSpots = async () => {
      try {
        // 位置情報を取得
        const location = await getCurrentLocation();
        setCurrentLocation(location);
      } catch (error) {
        console.error("位置情報の取得に失敗しました:", error);
        // 位置情報が取得できない場合はnullのまま
      }
    };

    loadLocationAndSpots();

    // カメラストリームを開始
    startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera, getCurrentLocation]);

  // プレビューまたはアップロードモーダルの状態に応じてカメラを制御
  useEffect(() => {
    if (showPreview || showUploadOption) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [showPreview, showUploadOption, startCamera, stopCamera]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        setIsLoading(false);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(imageDataUrl);
      setUploadedImage(null);
      setImageSource("camera");

      // 撮影時に最新の位置情報を取得
      try {
        const location = await getCurrentLocation();
        setCurrentLocation(location);
      } catch (error) {
        console.error("撮影時の位置情報取得に失敗しました:", error);
        // 既存の位置情報を使用するか、位置情報なしで続行
      }

      setShowPreview(true);
    } catch (error) {
      console.error("撮影に失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
      setCapturedImage(e.target?.result as string);
      setImageSource("upload");

      // アップロード時にも位置情報を取得
      try {
        const location = await getCurrentLocation();
        setCurrentLocation(location);
      } catch (error) {
        console.error("アップロード時の位置情報取得に失敗しました:", error);
        // 既存の位置情報を使用するか、位置情報なしで続行
      }

      setShowPreview(true);
      setShowUploadOption(false); // アップロードモーダルを閉じる
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
    setCurrentLocation(null);
    router.push("/");
  };

  const handleUploadModalClose = () => {
    setShowUploadOption(false);
  };

  return (
    <>
      <CameraHeader onUploadClick={() => setShowUploadOption(true)} />

      {/* メインカメラビュー */}
      <div className="relative w-full h-screen bg-black overflow-hidden">
        {/* カメラプレビュー */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* カメラが停止中の背景 */}
        {(!stream || showPreview || showUploadOption) && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="text-white text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg opacity-75">カメラを準備中...</p>
            </div>
          </div>
        )}

        {/* 位置情報取得状況の表示 */}
        {!showPreview && !showUploadOption && (
          <div className="absolute top-6 left-4 right-4 z-10">
            {currentLocation ? (
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90">
                <p className="text-sm font-medium text-center">
                  📍 位置情報を取得済み
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90">
                <p className="text-sm font-medium text-center">
                  📍 位置情報を取得中...
                </p>
              </div>
            )}
          </div>
        )}

        {/* 撮影コントロール */}
        {!showPreview && !showUploadOption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-12">
            <div className="flex items-center justify-center space-x-8">
              {/* アップロードボタン */}
              <Button
                variant="outline"
                size="lg"
                className="w-14 h-14 rounded-full bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => setShowUploadOption(true)}
              >
                <Upload className="w-6 h-6" />
              </Button>

              {/* 撮影ボタン */}
              <Button
                size="lg"
                className={`w-20 h-20 rounded-full bg-white hover:bg-gray-100 text-black shadow-2xl transition-all duration-200 ${
                  isLoading ? "scale-95 opacity-80" : "hover:scale-105"
                }`}
                onClick={capturePhoto}
                disabled={isLoading || !stream}
              >
                <Camera className="w-8 h-8" />
              </Button>

              {/* プレースホルダー（対称性のため） */}
              <div className="w-14 h-14" />
            </div>

            {/* 撮影ヒント */}
            <div className="mt-4 text-center">
              <p className="text-white/80 text-sm">画面をタップして撮影</p>
              {!currentLocation && (
                <p className="text-yellow-400/80 text-xs mt-1">
                  より正確なスポット作成のため位置情報を許可してください
                </p>
              )}
            </div>
          </div>
        )}

        {/* 全画面タップで撮影 */}
        {!showPreview && !showUploadOption && stream && (
          <button
            className="absolute inset-0 w-full h-full focus:outline-none"
            onClick={capturePhoto}
            disabled={isLoading}
            aria-label="撮影する"
          />
        )}
      </div>

      {/* 隠しcanvas */}
      <canvas ref={canvasRef} className="hidden" />

      <UploadModal
        isOpen={showUploadOption}
        onClose={handleUploadModalClose}
        onFileUpload={handleFileUpload}
      />

      <PreviewModal
        isOpen={showPreview}
        onClose={handlePreviewClose}
        capturedImage={capturedImage}
        uploadedImage={uploadedImage}
        imageSource={imageSource}
        currentLocation={currentLocation}
        onSuccess={handlePreviewSuccess}
      />
    </>
  );
}
