"use server";

import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfile(formData: FormData) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const username = formData.get("username") as string;
  const bio = formData.get("bio") as string;
  const avatarUrl = formData.get("avatar_url") as string;

  if (!username || username.trim().length === 0) {
    redirect(
      "/profile/edit?error=" + encodeURIComponent("ユーザー名は必須です")
    );
  }

  // ユーザー名の重複チェック（自分以外）
  const existingUser = await prisma.profiles.findUnique({
    where: { username: username.trim() },
  });

  if (existingUser && existingUser.id !== session.user.id) {
    redirect(
      "/profile/edit?error=" +
        encodeURIComponent("このユーザー名は既に使用されています")
    );
  }

  try {
    await prisma.profiles.update({
      where: { id: session.user.id },
      data: {
        username: username.trim(),
        bio: bio?.trim() || null,
        avatar_url: avatarUrl?.trim() || null,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    redirect(
      "/profile/edit?error=" +
        encodeURIComponent("プロフィールの更新に失敗しました")
    );
  }

  // プロフィール更新が成功した場合のリダイレクト
  redirect(
    "/profile?success=" + encodeURIComponent("プロフィールを更新しました")
  );
}

export async function getFollowers(userId: string) {
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

export async function getFollowing(userId: string) {
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
