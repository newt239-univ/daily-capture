"use server";

import { prisma } from "@/lib/prisma";

export type CaptureWithDetails = {
  id: string;
  user_id: string;
  spot_id: string;
  media_url: string;
  media_type: "photo" | "video";
  caption: string | null;
  created_at: Date | null;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  spots: {
    id: string;
    name: string;
    lat: number | null;
    lng: number | null;
  };
};

export async function getAllCaptures(): Promise<CaptureWithDetails[]> {
  try {
    const captures = await prisma.captures.findMany({
      include: {
        profiles: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
        spots: {
          select: {
            id: true,
            name: true,
            lat: true,
            lng: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Prismaの型をCaptureWithDetailsに変換
    return captures.map((capture) => ({
      id: capture.id,
      user_id: capture.user_id,
      spot_id: capture.spot_id,
      media_url: capture.media_url,
      media_type: capture.media_type as "photo" | "video",
      caption: capture.caption,
      created_at: capture.created_at,
      profiles: {
        id: capture.profiles.id,
        username: capture.profiles.username,
        avatar_url: capture.profiles.avatar_url,
      },
      spots: {
        id: capture.spots.id,
        name: capture.spots.name,
        lat: capture.spots.lat ? Number(capture.spots.lat) : null,
        lng: capture.spots.lng ? Number(capture.spots.lng) : null,
      },
    }));
  } catch (error) {
    console.error("Failed to fetch captures:", error);
    throw new Error("投稿の取得に失敗しました");
  }
}

export async function getCaptureById(
  captureId: string
): Promise<CaptureWithDetails | null> {
  try {
    const capture = await prisma.captures.findUnique({
      where: {
        id: captureId,
      },
      include: {
        profiles: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
        spots: {
          select: {
            id: true,
            name: true,
            lat: true,
            lng: true,
          },
        },
      },
    });

    if (!capture) {
      return null;
    }

    // Prismaの型をCaptureWithDetailsに変換
    return {
      id: capture.id,
      user_id: capture.user_id,
      spot_id: capture.spot_id,
      media_url: capture.media_url,
      media_type: capture.media_type as "photo" | "video",
      caption: capture.caption,
      created_at: capture.created_at,
      profiles: {
        id: capture.profiles.id,
        username: capture.profiles.username,
        avatar_url: capture.profiles.avatar_url,
      },
      spots: {
        id: capture.spots.id,
        name: capture.spots.name,
        lat: capture.spots.lat ? Number(capture.spots.lat) : null,
        lng: capture.spots.lng ? Number(capture.spots.lng) : null,
      },
    };
  } catch (error) {
    console.error("Failed to fetch capture:", error);
    throw new Error("投稿の取得に失敗しました");
  }
}
