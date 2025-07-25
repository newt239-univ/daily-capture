import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Settings, Camera, Users, UserPlus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserProfile(userId: string) {
  const profile = await prisma.profiles.findUnique({
    where: { id: userId },
    include: {
      spots: {
        orderBy: { created_at: "asc" },
        take: 1,
      },
      captures: {
        orderBy: { created_at: "desc" },
        take: 6,
      },
      follows_follows_follower_idToprofiles: true,
      follows_follows_following_idToprofiles: true,
    },
  });

  if (!profile) {
    return null;
  }

  // フォロワー数とフォロー中数を計算
  const followerCount = profile.follows_follows_following_idToprofiles.length;
  const followingCount = profile.follows_follows_follower_idToprofiles.length;

  // 投稿数を取得
  const captureCount = await prisma.captures.count({
    where: { user_id: userId },
  });

  return {
    ...profile,
    followerCount,
    followingCount,
    captureCount,
    registeredLocation: profile.spots[0]?.name || null,
  };
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const userProfile = await getUserProfile(session.user.id);

  if (!userProfile) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen">
      <div className="min-h-screen">
        {/* Header with Settings */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">プロフィール</h1>
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Success/Error Messages */}
        {resolvedSearchParams?.success && (
          <div className="mx-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">
              {resolvedSearchParams.success}
            </p>
          </div>
        )}
        {resolvedSearchParams?.error && (
          <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{resolvedSearchParams.error}</p>
          </div>
        )}

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage
                src={userProfile.avatar_url || "/placeholder-user.jpg"}
                alt="プロフィール画像"
              />
              <AvatarFallback>
                {userProfile.username
                  ? userProfile.username.slice(0, 2).toUpperCase()
                  : "UN"}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {userProfile.username}
            </h2>
            <p className="text-gray-500 text-sm mb-2">
              @{userProfile.username}
            </p>
            {userProfile.bio && (
              <p className="text-gray-600 text-sm text-center mb-2">
                {userProfile.bio}
              </p>
            )}

            {/* Edit Profile Button */}
            <Link href="/profile/edit">
              <Button variant="outline" size="sm" className="mt-2">
                プロフィールを編集
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {userProfile.captureCount}
              </div>
              <div className="text-sm text-gray-500">投稿</div>
            </div>
          </div>
        </div>

        {/* Recent Posts Grid */}
        <div className="px-4 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            最近の投稿
          </h3>
          <div className="grid grid-cols-3 gap-1">
            {userProfile.captures.length > 0
              ? userProfile.captures.map((capture) => (
                  <Link
                    key={capture.id}
                    href={`/posts/${capture.id}`}
                    className="aspect-square bg-gray-200 rounded overflow-hidden relative hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={capture.media_url}
                      alt="投稿画像"
                      className="w-full h-full object-cover"
                      fill
                      sizes="(max-width: 768px) 33vw, 25vw"
                    />
                  </Link>
                ))
              : // 投稿がない場合のプレースホルダー
                [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-200 rounded flex items-center justify-center"
                  >
                    <Camera className="w-6 h-6 text-gray-400" />
                  </div>
                ))}
            {/* 6個未満の場合は残りをプレースホルダーで埋める */}
            {userProfile.captures.length < 6 &&
              [...Array(6 - userProfile.captures.length)].map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className="aspect-square bg-gray-200 rounded flex items-center justify-center"
                >
                  <Camera className="w-6 h-6 text-gray-400" />
                </div>
              ))}
          </div>
        </div>

        {/* Interaction Section */}
        <div className="px-4 pb-20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">交流</h3>
          <div className="space-y-2">
            <Link
              href="/profile/followers"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900 font-medium">フォロワー</span>
              </div>
              <div className="text-gray-400">→</div>
            </Link>
            <Link
              href="/profile/follows"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900 font-medium">フォロー中</span>
              </div>
              <div className="text-gray-400">→</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
