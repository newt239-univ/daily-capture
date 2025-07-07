"use server";

import { prisma } from "@/lib/prisma";

export type SearchResult = {
  users: {
    id: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
  }[];
  spots: {
    id: string;
    name: string;
    user_id: string;
    lat: number | null;
    lng: number | null;
    reference_image_url: string | null;
    profiles: {
      username: string;
      avatar_url: string | null;
    };
  }[];
};

export async function searchContent(query: string): Promise<SearchResult> {
  if (!query || query.trim().length === 0) {
    return {
      users: [],
      spots: [],
    };
  }

  const searchQuery = query.trim();

  try {
    // ユーザーを検索（ユーザー名と自己紹介文で検索）
    const users = await prisma.profiles.findMany({
      where: {
        OR: [
          {
            username: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            bio: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        avatar_url: true,
        bio: true,
      },
      take: 10,
    });

    // 場所を検索（場所名で検索）
    const spots = await prisma.spots.findMany({
      where: {
        name: {
          contains: searchQuery,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        user_id: true,
        lat: true,
        lng: true,
        reference_image_url: true,
        profiles: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
      },
      take: 10,
    });

    return {
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        bio: user.bio,
      })),
      spots: spots.map((spot) => ({
        id: spot.id,
        name: spot.name,
        user_id: spot.user_id,
        lat: spot.lat ? parseFloat(spot.lat.toString()) : null,
        lng: spot.lng ? parseFloat(spot.lng.toString()) : null,
        reference_image_url: spot.reference_image_url,
        profiles: spot.profiles,
      })),
    };
  } catch (error) {
    console.error("検索エラー:", error);
    return {
      users: [],
      spots: [],
    };
  }
}
