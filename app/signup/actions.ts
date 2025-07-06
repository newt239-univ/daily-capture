"use server";

import { signUp } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData): Promise<void> {
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // バリデーション
  if (!email || !username || !password || !confirmPassword) {
    redirect(
      "/signup?error=" + encodeURIComponent("すべての項目を入力してください")
    );
  }

  // メールアドレスの形式チェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    redirect(
      "/signup?error=" +
        encodeURIComponent("正しいメールアドレスを入力してください")
    );
  }

  // ユーザー名の形式チェック
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  if (!usernameRegex.test(username)) {
    redirect(
      "/signup?error=" +
        encodeURIComponent(
          "ユーザー名は3-20文字で、英数字・アンダースコア・ハイフンのみ使用できます"
        )
    );
  }

  // パスワードの長さチェック
  if (password.length < 8) {
    redirect(
      "/signup?error=" +
        encodeURIComponent("パスワードは8文字以上で入力してください")
    );
  }

  // パスワード確認
  if (password !== confirmPassword) {
    redirect("/signup?error=" + encodeURIComponent("パスワードが一致しません"));
  }

  try {
    await signUp(email, password, username);
  } catch (error) {
    let errorMessage = "アカウント作成に失敗しました";

    if (error instanceof Error) {
      switch (error.message) {
        case "User already registered":
          errorMessage = "このメールアドレスは既に登録されています";
          break;
        case "Username already taken":
          errorMessage = "このユーザー名は既に使用されています";
          break;
        case "Password should be at least 6 characters":
          errorMessage = "パスワードは6文字以上で入力してください";
          break;
        case "Invalid email":
          errorMessage = "正しいメールアドレスを入力してください";
          break;
        case "Signup requires a valid password":
          errorMessage = "有効なパスワードを入力してください";
          break;
        default:
          console.error("SignUp error:", error.message);
          errorMessage = error.message || "アカウント作成に失敗しました";
      }
    }

    redirect("/signup?error=" + encodeURIComponent(errorMessage));
  }

  // signUpが成功した場合のリダイレクト
  redirect(
    "/signup?message=" +
      encodeURIComponent(
        "確認メールを送信しました。メールをご確認の上、リンクをクリックしてアカウントを有効化してください。"
      )
  );
}
