import Link from "next/link";
import { redirect, notFound } from "next/navigation";

import { ArrowLeft, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserByUsername(username: string) {
  const user = await prisma.profiles.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
    },
  });

  return user;
}

async function getFollowers(userId: string) {
  const followers = await prisma.follows.findMany({
    where: { following_id: userId },
    include: {
      profiles_follows_follower_idToprofiles: {
        select: {
          id: true,
          username: true,
          avatar_url: true,
          bio: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return followers.map(
    (follow) => follow.profiles_follows_follower_idToprofiles
  );
}

export default async function UserFollowersPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  const followers = await getFollowers(user.id);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <Link href={`/users/${username}`}>
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          {username} のフォロワー
        </h1>
      </div>

      {/* Followers List */}
      <div className="px-4 py-4">
        {followers.length > 0 ? (
          <div className="space-y-3">
            {followers.map((follower) => (
              <Link
                key={follower.id}
                href={`/users/${follower.username}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={follower.avatar_url || "/placeholder-user.jpg"}
                    alt={follower.username}
                  />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {follower.username}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    @{follower.username}
                  </p>
                  {follower.bio && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {follower.bio}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-500 mb-2">
              フォロワーがいません
            </h2>
            <p className="text-gray-400">
              {username} にはまだフォロワーがいません
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
