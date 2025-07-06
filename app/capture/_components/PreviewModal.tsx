"use client";

import { useState } from "react";
import { RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { createCapture } from "../actions";
import { Decimal } from "@prisma/client/runtime/library";

type Spot = {
  id: string;
  name: string;
  lat: Decimal | null;
  lng: Decimal | null;
  user_id: string;
  reference_image_url: string | null;
  created_at: Date | null;
};

type PreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  capturedImage: string | null;
  uploadedImage: File | null;
  imageSource: "camera" | "upload";
  userSpots: Spot[];
  onSuccess: () => void;
};

export default function PreviewModal({
  isOpen,
  onClose,
  capturedImage,
  uploadedImage,
  imageSource,
  userSpots,
  onSuccess,
}: PreviewModalProps) {
  const [selectedSpotId, setSelectedSpotId] = useState<string>(
    userSpots.length > 0 ? userSpots[0].id : ""
  );
  const [caption, setCaption] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if ((!capturedImage && !uploadedImage) || !selectedSpotId) {
      alert("画像とスポットの選択が必要です");
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
              onClick={handleRetake}
              disabled={isSubmitting}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              撮り直し
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={isSubmitting || !selectedSpotId}
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
