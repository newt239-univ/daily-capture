"use server";

import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect(
      "/signin?error=" +
        encodeURIComponent("メールアドレスとパスワードを入力してください")
    );
  }

  try {
    await signIn(email, password);
  } catch (error) {
    let errorMessage = "認証に失敗しました";

    if (error instanceof Error) {
      switch (error.message) {
        case "Invalid login credentials":
          errorMessage = "メールアドレスまたはパスワードが正しくありません";
          break;
        case "Email not confirmed":
          errorMessage = "メールアドレスの確認が完了していません";
          break;
        case "User not found":
          errorMessage = "ユーザーが見つかりません";
          break;
        case "Too many requests":
          errorMessage =
            "リクエストが多すぎます。しばらく時間をおいてから再試行してください";
          break;
        default:
          errorMessage = error.message || "認証に失敗しました";
      }
    }

    redirect("/signin?error=" + encodeURIComponent(errorMessage));
  }

  // signInが成功した場合のリダイレクト
  redirect("/");
}
