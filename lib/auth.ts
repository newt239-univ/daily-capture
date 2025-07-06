import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        remove(name: string, _options: any) {
          cookieStore.delete(name);
        },
      },
    }
  );
}

export async function signIn(email: string, password: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signUp(
  email: string,
  password: string,
  username: string
) {
  const supabase = await createServerSupabaseClient();

  // ユーザー名の重複チェック
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .single();

  if (existingProfile) {
    throw new Error("Username already taken");
  }

  // ユーザー登録
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  // ユーザー作成成功後、プロファイルを作成
  if (data.user) {
    try {
      // プロファイル作成を試行（通常のクライアント権限で）
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username: username,
        avatar_url: null,
        bio: null,
      });

      if (profileError) {
        console.warn("Profile creation during signup failed:", profileError);
        // プロファイル作成に失敗してもユーザー登録は継続
        // コールバック時にフォールバック処理で再試行される
      }
    } catch (profileCreationError) {
      console.warn("Profile creation error:", profileCreationError);
      // エラーが発生してもユーザー登録は継続
    }
  }

  return data;
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  redirect("/signin");
}

export async function getSession() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // ユーザーが認証されている場合のみセッション情報を返す
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export async function getUser() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
