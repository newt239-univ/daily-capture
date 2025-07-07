import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createServerClient } from "@supabase/ssr";

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
         
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
         
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

// セキュリティ上の理由により、getSession()の代わりにgetAuthenticatedUser()を使用
export async function getAuthenticatedUser() {
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

// 後方互換性のため残しているが、getAuthenticatedUser()の使用を推奨
export async function getSession() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  // セッション風のオブジェクトを返すが、実際にはユーザー情報のみを含む
  return {
    user,
    access_token: null,
    refresh_token: null,
    expires_at: null,
    expires_in: null,
    token_type: "bearer" as const,
  };
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
