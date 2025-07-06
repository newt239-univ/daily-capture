"use client";

import { useRef } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (file: File) => void;
};

export default function UploadModal({
  isOpen,
  onClose,
  onFileUpload,
}: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onFileUpload(file);
      onClose();
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* 隠しファイルインプット */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      {/* アップロードモーダル */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm p-6 bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-black text-center">
              画像を選択
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button className="w-full" onClick={handleButtonClick}>
              <ImageIcon className="w-4 h-4 mr-2" />
              端末から画像を選択
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
