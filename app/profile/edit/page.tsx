import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, User } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateProfile } from "../actions";

async function getUserProfile(userId: string) {
  const profile = await prisma.profiles.findUnique({
    where: { id: userId },
  });

  return profile;
}

type ProfileEditPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function ProfileEditPage({
  searchParams,
}: ProfileEditPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const userProfile = await getUserProfile(session.user.id);

  if (!userProfile) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              プロフィール編集
            </h1>
          </div>
        </div>

        {/* Error/Success Messages */}
        {resolvedSearchParams.error && (
          <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{resolvedSearchParams.error}</p>
          </div>
        )}
        {resolvedSearchParams.success && (
          <div className="mx-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">
              {resolvedSearchParams.success}
            </p>
          </div>
        )}

        {/* Edit Form */}
        <div className="p-4">
          <form action={updateProfile} className="space-y-6">
            {/* Profile Picture Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={userProfile.avatar_url || "/placeholder-user.jpg"}
                      alt="プロフィール画像"
                    />
                    <AvatarFallback>
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="w-full space-y-2">
                    <Label htmlFor="avatar_url">プロフィール画像URL</Label>
                    <Input
                      id="avatar_url"
                      name="avatar_url"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      defaultValue={userProfile.avatar_url || ""}
                    />
                    <p className="text-xs text-gray-500">
                      画像URLを入力してください（任意）
                    </p>
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
              <Button type="submit" className="w-full h-12">
                <Save className="w-5 h-5 mr-2" />
                変更を保存
              </Button>

              <Link href="/profile">
                <Button variant="outline" className="w-full h-12">
                  キャンセル
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
