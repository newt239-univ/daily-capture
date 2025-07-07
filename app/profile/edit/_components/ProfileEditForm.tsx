"use client";

import { useState, useRef } from "react";

import { Save, User, Camera, Loader2 } from "lucide-react";

import { updateProfile } from "../../actions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";


type ProfileEditFormProps = {
  userProfile: {
    id: string;
    username: string;
    bio: string | null;
    avatar_url: string | null;
  };
};

export default function ProfileEditForm({ userProfile }: ProfileEditFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(userProfile.avatar_url);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // プレビューを表示
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToSupabase = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);

      // セキュリティのため、現在のユーザー認証状態を確認
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("認証が必要です");
      }

      // ファイル名を生成（認証済みユーザーIDと現在時刻を使用）
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Supabase Storageにアップロード
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // ファイルがアップロードされている場合は、Supabaseにアップロード
    if (selectedFile) {
      const uploadedUrl = await uploadToSupabase(selectedFile);
      if (uploadedUrl) {
        // アップロードされたURLをフォームデータに設定
        formData.set("avatar_url", uploadedUrl);
      } else {
        alert("画像のアップロードに失敗しました。もう一度お試しください。");
        return;
      }
    }

    // サーバーアクションを実行
    await updateProfile(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={avatarPreview || "/placeholder-user.jpg"}
                alt="プロフィール画像"
              />
              <AvatarFallback>
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>

            {/* File Upload Option */}
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatar_file">
                  プロフィール画像をアップロード
                </Label>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    id="avatar_file"
                    name="avatar_file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        アップロード中...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        画像を選択
                      </>
                    )}
                  </Button>
                  {selectedFile && (
                    <p className="text-xs text-green-600">
                      選択された画像: {selectedFile.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    または下のURLフィールドに画像URLを入力してください
                  </p>
                </div>
              </div>

              {/* URL Option */}
              <div className="space-y-2">
                <Label htmlFor="avatar_url">画像URL（オプション）</Label>
                <Input
                  id="avatar_url"
                  name="avatar_url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  defaultValue={userProfile.avatar_url || ""}
                />
                <p className="text-xs text-gray-500">
                  画像URLを直接入力することも可能です
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">ユーザー名 *</Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              placeholder="ユーザー名を入力"
              defaultValue={userProfile.username}
              maxLength={50}
            />
            <p className="text-xs text-gray-500">
              英数字とアンダースコアのみ使用可能
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">自己紹介</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="自己紹介を入力してください"
              defaultValue={userProfile.bio || ""}
              maxLength={160}
              rows={4}
            />
            <p className="text-xs text-gray-500">
              {userProfile.bio?.length || 0}/160文字
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex flex-col space-y-3 pb-8">
        <Button type="submit" className="w-full h-12" disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              処理中...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              変更を保存
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
