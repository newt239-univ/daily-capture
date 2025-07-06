"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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

    redirect(
      "/profile?success=" + encodeURIComponent("プロフィールを更新しました")
    );
  } catch (error) {
    console.error("Profile update error:", error);
    redirect(
      "/profile/edit?error=" +
        encodeURIComponent("プロフィールの更新に失敗しました")
    );
  }
}
