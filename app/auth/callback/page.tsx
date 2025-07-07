import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createServerClient } from "@supabase/ssr";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const { code, error } = await searchParams;

  if (error) {
    redirect(
      "/signin?error=" + encodeURIComponent("認証中にエラーが発生しました")
    );
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(
            name: string,
            value: string,
            options: Parameters<typeof cookieStore.set>[2]
          ) {
            cookieStore.set(name, value, options);
          },
          remove(name: string) {
            cookieStore.delete(name);
          },
        },
      }
    );

    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      redirect(
        "/signin?error=" + encodeURIComponent("認証コードの処理に失敗しました")
      );
    }

    if (data.user) {
      // ユーザープロファイルが存在するかチェック
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      // プロファイルが存在しない場合は作成
      if (!existingProfile) {
        const username = data.user.user_metadata.username;

        if (!username) {
          redirect(
            "/signin?error=" +
              encodeURIComponent("ユーザー名が設定されていません")
          );
        }

        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          username: username,
          avatar_url: null,
          bio: null,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          redirect(
            "/signin?error=" +
              encodeURIComponent("プロファイルの作成に失敗しました")
          );
        }
      }

      // 認証成功、ホームページにリダイレクト
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Daily Capture
          </h1>
          <p className="text-gray-600">認証処理中...</p>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
