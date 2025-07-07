"use client";

import Image from "next/image";
import { useState } from "react";

import { RotateCcw, Check, MapPin } from "lucide-react";

import { createCapture } from "../actions";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type GeolocationData = {
  lat: number;
  lng: number;
  timestamp: number;
};

type PreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  capturedImage: string | null;
  uploadedImage: File | null;
  imageSource: "camera" | "upload";
  currentLocation: GeolocationData | null;
  onSuccess: () => void;
};

export default function PreviewModal({
  isOpen,
  onClose,
  capturedImage,
  uploadedImage,
  imageSource,
  currentLocation,
  onSuccess,
}: PreviewModalProps) {
  const [caption, setCaption] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!capturedImage && !uploadedImage) {
      alert("画像の処理に失敗しました");
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

      // 位置情報がある場合は追加
      if (currentLocation) {
        formData.append("lat", currentLocation.lat.toString());
        formData.append("lng", currentLocation.lng.toString());
      }

      // キャプションがある場合は追加
      if (caption) {
        formData.append("caption", caption);
      }

      // Server Action を実行
      const result = await createCapture(formData);

      if (result.success) {
        // 成功時の処理
        setCaption("");
        onSuccess();
      }
    } catch (error) {
      console.error("保存エラー:", error);
      alert(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setCaption("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            {/* 位置情報の表示 */}
            <div>
              <Label className="text-white text-sm">撮影位置</Label>
              <div className="mt-1">
                {currentLocation ? (
                  <div className="p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-400" />
                      <div className="text-sm text-green-100">
                        <p className="font-medium">位置情報を取得済み</p>
                        <p className="text-xs text-green-300 mt-1">
                          新しいスポットが自動作成されます
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <MapPin className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      位置情報が利用できません。デフォルトの位置でスポットが作成されます。
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

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
              onClick={handleRetake}
              disabled={isSubmitting}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              撮り直し
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              <Check className="w-4 h-4 mr-2" />
              {isSubmitting ? "保存中..." : "投稿"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
