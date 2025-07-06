"use server";

import { createServerSupabaseClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type CaptureData = {
  imageFile: File;
  spotId: string;
  caption?: string;
};

export async function createCapture(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    // ユーザー認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("認証が必要です");
    }

    // FormDataから値を取得
    const imageFile = formData.get("imageFile") as File;
    const spotId = formData.get("spotId") as string | null;
    const caption = formData.get("caption") as string;

    if (!imageFile) {
      throw new Error("画像ファイルは必須です");
    }

    // ファイル名を生成（timestampとユーザーIDを含む）
    const timestamp = Date.now();
    const fileExtension = imageFile.name.split(".").pop() || "jpg";
    const fileName = `${user.id}/${timestamp}.${fileExtension}`;

    // Supabase Storageに画像をアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("captures")
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(
        `画像のアップロードに失敗しました: ${uploadError.message}`
      );
    }

    // アップロードされた画像のパブリックURLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from("captures").getPublicUrl(uploadData.path);

    // スポットIDがない場合は新しいスポットを作成
    let actualSpotId: string = spotId || "";
    if (!spotId) {
      // デフォルトのスポット名を生成
      const now = new Date();
      const defaultSpotName = `撮影地点 ${now.getFullYear()}/${(
        now.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${now.getDate().toString().padStart(2, "0")}`;

      // デフォルトの位置情報（東京駅）を使用
      const defaultLat = 35.6812;
      const defaultLng = 139.7671;

      const newSpot = await prisma.spots.create({
        data: {
          user_id: user.id,
          name: defaultSpotName,
          lat: defaultLat,
          lng: defaultLng,
          reference_image_url: publicUrl, // 撮影した画像をリファレンス画像として使用
        },
      });

      actualSpotId = newSpot.id;
    }

    // DBにcaptureデータを挿入
    const capture = await prisma.captures.create({
      data: {
        user_id: user.id,
        spot_id: actualSpotId,
        media_url: publicUrl,
        media_type: "photo",
        caption: caption || null,
      },
    });

    revalidatePath("/");
    return { success: true, captureId: capture.id };
  } catch (error) {
    console.error("Capture creation error:", error);
    throw new Error(
      error instanceof Error ? error.message : "キャプチャの作成に失敗しました"
    );
  }
}

export async function createSpot(
  name: string,
  lat: number,
  lng: number,
  referenceImageUrl?: string
) {
  try {
    const supabase = await createServerSupabaseClient();

    // ユーザー認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("認証が必要です");
    }

    // スポットを作成
    const spot = await prisma.spots.create({
      data: {
        user_id: user.id,
        name,
        lat,
        lng,
        reference_image_url: referenceImageUrl,
      },
    });

    return { success: true, spotId: spot.id };
  } catch (error) {
    console.error("Spot creation error:", error);
    throw new Error(
      error instanceof Error ? error.message : "スポットの作成に失敗しました"
    );
  }
}

export async function getUserSpots() {
  try {
    const supabase = await createServerSupabaseClient();

    // ユーザー認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("認証が必要です");
    }

    // ユーザーのスポット一覧を取得
    const spots = await prisma.spots.findMany({
      where: {
        user_id: user.id,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return spots;
  } catch (error) {
    console.error("Get user spots error:", error);
    throw new Error(
      error instanceof Error ? error.message : "スポットの取得に失敗しました"
    );
  }
}
