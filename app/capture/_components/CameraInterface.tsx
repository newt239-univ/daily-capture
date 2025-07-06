"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  ArrowLeft,
  RotateCcw,
  Check,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Image from "next/image";
import { createCapture, getUserSpots } from "../actions";
import { Decimal } from "@prisma/client/runtime/library";

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
  const [previousShots, setPreviousShots] = useState<Shot[]>([]);
  const [registeredLocation, setRegisteredLocation] =
    useState<RegisteredLocation>(null);
  const [userSpots, setUserSpots] = useState<Spot[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageSource, setImageSource] = useState<"camera" | "upload">("camera");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  const loadUserSpots = useCallback(async () => {
    try {
      const spots = await getUserSpots();
      setUserSpots(spots);
      if (spots.length > 0 && !selectedSpotId) {
        setSelectedSpotId(spots[0].id);
      }
    } catch (error) {
      console.error("スポットの取得に失敗しました:", error);
    }
  }, [selectedSpotId]);

  useEffect(() => {
    if (!user) {
      router.push("/signin");
      return;
    }

    // ユーザーのスポット一覧を取得
    loadUserSpots();

    // 登録地点の確認（下位互換性のため）
    const savedLocation = localStorage.getItem("registeredLocation");
    if (savedLocation) {
      setRegisteredLocation(JSON.parse(savedLocation));
    }

    // 過去の撮影データを読み込み（下位互換性のため）
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
  }, [router, user, stream, loadUserSpots]);

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
    setImageSource("camera");
    setShowPreview(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        setImageSource("upload");
        setShowPreview(true);
        setShowUploadOption(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const savePhoto = async () => {
    if (!user || (!capturedImage && !uploadedImage) || !selectedSpotId) {
      alert("ユーザー認証、画像、スポットの選択が必要です");
      return;
    }

    setIsSubmitting(true);

    try {
      let fileToUpload: File;

      if (imageSource === "camera" && capturedImage) {
        // Canvas から Blob を作成して File に変換
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        fileToUpload = new File([blob], `capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
      } else if (imageSource === "upload" && uploadedImage) {
        fileToUpload = uploadedImage;
      } else {
        throw new Error("画像の処理に失敗しました");
      }

      // FormData を作成
      const formData = new FormData();
      formData.append("imageFile", fileToUpload);
      formData.append("spotId", selectedSpotId);
      if (caption) {
        formData.append("caption", caption);
      }

      // Server Action を実行
      const result = await createCapture(formData);

      if (result.success) {
        // 成功時の処理
        setShowPreview(false);
        setCapturedImage(null);
        setUploadedImage(null);
        setCaption("");
        router.push("/timeline");
      }
    } catch (error) {
      console.error("保存エラー:", error);
      alert(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const retakePhoto = () => {
    setShowPreview(false);
    setCapturedImage(null);
    setUploadedImage(null);
    setCaption("");
    setImageSource("camera");
  };

  const latestShot = previousShots[previousShots.length - 1];

  // スポットが存在しない場合はスポット登録ページにリダイレクト
  if (userSpots.length === 0 && !registeredLocation) {
    router.push("/register-location");
    return null;
  }

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

      {/* アップロードボタン */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => setShowUploadOption(true)}
        >
          <Upload className="w-5 h-5" />
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

      {/* 隠しファイルインプット */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />

      {/* アップロードオプションモーダル */}
      <Dialog open={showUploadOption} onOpenChange={setShowUploadOption}>
        <DialogContent className="max-w-sm p-6 bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-black text-center">
              画像を選択
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              端末から画像を選択
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* プレビューモーダル */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-sm p-0 bg-black border-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-white text-center">
              投稿内容の確認
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

            <div className="space-y-4 mt-4">
              {/* スポット選択 */}
              {userSpots.length > 0 && (
                <div>
                  <Label htmlFor="spot-select" className="text-white text-sm">
                    撮影スポット
                  </Label>
                  <select
                    id="spot-select"
                    value={selectedSpotId}
                    onChange={(e) => setSelectedSpotId(e.target.value)}
                    className="w-full mt-1 p-2 rounded border bg-white text-black"
                  >
                    {userSpots.map((spot) => (
                      <option key={spot.id} value={spot.id}>
                        {spot.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* キャプション入力 */}
              <div>
                <Label htmlFor="caption" className="text-white text-sm">
                  キャプション（任意）
                </Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="キャプションを入力してください..."
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder-gray-400"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={retakePhoto}
                disabled={isSubmitting}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                撮り直し
              </Button>
              <Button
                className="flex-1"
                onClick={savePhoto}
                disabled={isSubmitting || !selectedSpotId}
              >
                <Check className="w-4 h-4 mr-2" />
                {isSubmitting ? "保存中..." : "投稿"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
