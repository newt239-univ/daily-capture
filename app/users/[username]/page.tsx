import Image from "next/image";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

import {
  ArrowLeft,
  Camera,
  MapPin,
  UserPlus,
  UserMinus,
  Users,
} from "lucide-react";

import { followUser, unfollowUser } from "./actions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type UserProfileData = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  captureCount: number;
  followerCount: number;
  followingCount: number;
  registeredLocation: string | null;
  captures: Array<{
    id: string;
    media_url: string;
  }>;
  isFollowing: boolean;
  isOwnProfile: boolean;
};

async function getUserByUsername(
  username: string,
  currentUserId?: string
): Promise<UserProfileData | null> {
  const profile = await prisma.profiles.findUnique({
    where: { username },
    include: {
      spots: {
        orderBy: { created_at: "asc" },
        take: 1,
      },
      captures: {
        orderBy: { created_at: "desc" },
        take: 6,
        select: {
          id: true,
          media_url: true,
        },
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
    where: { user_id: profile.id },
  });

  // 現在のユーザーがこのユーザーをフォローしているかチェック
  let isFollowing = false;
  if (currentUserId && currentUserId !== profile.id) {
    const followRecord = await prisma.follows.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: currentUserId,
          following_id: profile.id,
        },
      },
    });
    isFollowing = !!followRecord;
  }

  return {
    id: profile.id,
    username: profile.username,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    captureCount,
    followerCount,
    followingCount,
    registeredLocation: profile.spots[0]?.name || null,
    captures: profile.captures,
    isFollowing,
    isOwnProfile: currentUserId === profile.id,
  };
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const userProfile = await getUserByUsername(username, session.user.id);

  if (!userProfile) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          {userProfile.username}
        </h1>
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage
              src={userProfile.avatar_url || "/placeholder-user.jpg"}
              alt="プロフィール画像"
            />
            <AvatarFallback>
              {userProfile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {userProfile.username}
          </h2>
          <p className="text-gray-500 text-sm mb-2">@{userProfile.username}</p>
          {userProfile.bio && (
            <p className="text-gray-600 text-sm text-center mb-2">
              {userProfile.bio}
            </p>
          )}
          {userProfile.registeredLocation && (
            <div className="flex items-center text-gray-500 text-sm mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span>登録場所: {userProfile.registeredLocation}</span>
            </div>
          )}

          {/* Follow/Edit Profile Button */}
          {userProfile.isOwnProfile ? (
            <Link href="/profile/edit">
              <Button variant="outline" size="sm" className="mt-2">
                プロフィールを編集
              </Button>
            </Link>
          ) : (
            <form
              action={userProfile.isFollowing ? unfollowUser : followUser}
              className="mt-2"
            >
              <input type="hidden" name="userId" value={userProfile.id} />
              <Button
                type="submit"
                variant={userProfile.isFollowing ? "outline" : "default"}
                size="sm"
                className={
                  userProfile.isFollowing ? "" : "bg-blue-600 hover:bg-blue-700"
                }
              >
                {userProfile.isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    フォロー解除
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    フォロー
                  </>
                )}
              </Button>
            </form>
          )}
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の投稿</h3>
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
            href={`/users/${userProfile.username}/followers`}
            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900 font-medium">フォロワー</span>
            </div>
            <div className="text-gray-400">→</div>
          </Link>
          <Link
            href={`/users/${userProfile.username}/follows`}
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
  );
}
