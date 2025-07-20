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

async function getFollowing(userId: string) {
  const following = await prisma.follows.findMany({
    where: { follower_id: userId },
    include: {
      profiles_follows_following_idToprofiles: {
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

  return following.map(
    (follow) => follow.profiles_follows_following_idToprofiles
  );
}

export default async function UserFollowsPage({
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

  const following = await getFollowing(user.id);

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
          {username} のフォロー中
        </h1>
      </div>

      {/* Following List */}
      <div className="px-4 py-4">
        {following.length > 0 ? (
          <div className="space-y-3">
            {following.map((user) => (
              <Link
                key={user.id}
                href={`/users/${user.username}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={user.avatar_url || "/placeholder-user.jpg"}
                    alt={user.username}
                  />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {user.username}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    @{user.username}
                  </p>
                  {user.bio && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {user.bio}
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
              フォローしていません
            </h2>
            <p className="text-gray-400">
              {username} はまだ誰もフォローしていません
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
