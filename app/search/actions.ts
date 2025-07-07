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
  posts: {
    id: string;
    caption: string | null;
    media_url: string;
    media_type: string;
    created_at: string;
    user_id: string;
    spot_id: string;
    profiles: {
      username: string;
      avatar_url: string | null;
    };
    spots: {
      name: string;
    };
  }[];
};

export async function searchContent(query: string): Promise<SearchResult> {
  if (!query || query.trim().length === 0) {
    return {
      users: [],
      spots: [],
      posts: [],
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

    // 投稿を検索（キャプションで検索）
    const posts = await prisma.captures.findMany({
      where: {
        caption: {
          contains: searchQuery,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        caption: true,
        media_url: true,
        media_type: true,
        created_at: true,
        user_id: true,
        spot_id: true,
        profiles: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
        spots: {
          select: {
            name: true,
          },
        },
      },
      take: 10,
      orderBy: {
        created_at: "desc",
      },
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
      posts: posts.map((post) => ({
        id: post.id,
        caption: post.caption,
        media_url: post.media_url,
        media_type: post.media_type,
        created_at: post.created_at?.toISOString() || "",
        user_id: post.user_id,
        spot_id: post.spot_id,
        profiles: post.profiles,
        spots: post.spots,
      })),
    };
  } catch (error) {
    console.error("検索エラー:", error);
    return {
      users: [],
      spots: [],
      posts: [],
    };
  }
}
