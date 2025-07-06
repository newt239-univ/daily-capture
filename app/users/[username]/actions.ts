"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function followUser(formData: FormData) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const userId = formData.get("userId") as string;

  if (!userId) {
    throw new Error("ユーザーIDが指定されていません");
  }

  // 自分自身をフォローしようとしていないかチェック
  if (session.user.id === userId) {
    throw new Error("自分自身をフォローすることはできません");
  }

  try {
    // すでにフォローしているかチェック
    const existingFollow = await prisma.follows.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: session.user.id,
          following_id: userId,
        },
      },
    });

    if (existingFollow) {
      // すでにフォローしている場合は何もしない
      return;
    }

    // フォロー関係を作成
    await prisma.follows.create({
      data: {
        follower_id: session.user.id,
        following_id: userId,
      },
    });

    // ページを再検証
    revalidatePath(`/users/[username]`);
  } catch (error) {
    console.error("Follow user error:", error);
    throw new Error("フォローに失敗しました");
  }
}

export async function unfollowUser(formData: FormData) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const userId = formData.get("userId") as string;

  if (!userId) {
    throw new Error("ユーザーIDが指定されていません");
  }

  try {
    // フォロー関係を削除
    await prisma.follows.delete({
      where: {
        follower_id_following_id: {
          follower_id: session.user.id,
          following_id: userId,
        },
      },
    });

    // ページを再検証
    revalidatePath(`/users/[username]`);
  } catch (error) {
    console.error("Unfollow user error:", error);
    // フォロー関係が存在しない場合は無視
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return;
    }
    throw new Error("フォロー解除に失敗しました");
  }
}
