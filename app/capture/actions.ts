"use server";

import { createServerSupabaseClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type CaptureData = {
  imageFile: File;
  lat?: number;
  lng?: number;
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
    const latStr = formData.get("lat") as string | null;
    const lngStr = formData.get("lng") as string | null;
    const caption = formData.get("caption") as string;

    if (!imageFile) {
      throw new Error("画像ファイルは必須です");
    }

    // 位置情報を数値に変換
    let lat: number | null = null;
    let lng: number | null = null;

    if (latStr && lngStr) {
      lat = parseFloat(latStr);
      lng = parseFloat(lngStr);

      // 有効な位置情報かチェック
      if (
        isNaN(lat) ||
        isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        console.error("無効な位置情報:", { lat, lng });
        lat = null;
        lng = null;
      }
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

    // 新しいスポットを作成
    const now = new Date();
    let spotName: string;
    let spotLat: number;
    let spotLng: number;

    if (lat !== null && lng !== null) {
      // 位置情報がある場合：日時と簡易的な地名で命名
      const timeString = `${now.getFullYear()}/${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${now.getDate().toString().padStart(2, "0")} ${now
        .getHours()
        .toString()
        .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      spotName = `撮影地点 ${timeString}`;
      spotLat = lat;
      spotLng = lng;
    } else {
      // 位置情報がない場合：デフォルトの位置情報（東京駅）を使用
      const dateString = `${now.getFullYear()}/${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${now.getDate().toString().padStart(2, "0")}`;

      spotName = `撮影地点 ${dateString}`;
      spotLat = 35.6812; // 東京駅
      spotLng = 139.7671; // 東京駅
    }

    const newSpot = await prisma.spots.create({
      data: {
        user_id: user.id,
        name: spotName,
        lat: spotLat,
        lng: spotLng,
        reference_image_url: publicUrl, // 撮影した画像をリファレンス画像として使用
      },
    });

    // DBにcaptureデータを挿入
    const capture = await prisma.captures.create({
      data: {
        user_id: user.id,
        spot_id: newSpot.id,
        media_url: publicUrl,
        media_type: "photo",
        caption: caption || null,
      },
    });

    revalidatePath("/");
    return { success: true, captureId: capture.id, spotId: newSpot.id };
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
