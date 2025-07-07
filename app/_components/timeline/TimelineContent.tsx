"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import { Filter, Camera, MapPin, User, Clock } from "lucide-react";

import { getAllCaptures } from "../../actions";

import type { CaptureWithDetails } from "../../actions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatTime, getTimeAgo } from "@/lib/utils";

export default function TimelineContent() {
  const [captures, setCaptures] = useState<CaptureWithDetails[]>([]);
  const [filteredCaptures, setFilteredCaptures] = useState<
    CaptureWithDetails[]
  >([]);
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadCaptures = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllCaptures();
      setCaptures(data);
      setFilteredCaptures(data);
    } catch (error) {
      console.error("投稿の取得に失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCaptures();
  }, [loadCaptures]);

  const filterCaptures = useCallback(() => {
    const now = Date.now();
    let filtered = captures;

    switch (filterPeriod) {
      case "week":
        filtered = captures.filter((capture) => {
          if (!capture.created_at) return false;
          return (
            now - new Date(capture.created_at).getTime() <=
            7 * 24 * 60 * 60 * 1000
          );
        });
        break;
      case "month":
        filtered = captures.filter((capture) => {
          if (!capture.created_at) return false;
          return (
            now - new Date(capture.created_at).getTime() <=
            30 * 24 * 60 * 60 * 1000
          );
        });
        break;
      default:
        filtered = captures;
    }

    setFilteredCaptures(filtered);
  }, [captures, filterPeriod]);

  useEffect(() => {
    filterCaptures();
  }, [captures, filterPeriod, filterCaptures]);

  const handlePostClick = (captureId: string) => {
    router.push(`/posts/${captureId}`);
  };

  const handleUserClick = (e: React.MouseEvent, username: string) => {
    e.stopPropagation(); // 投稿クリックイベントを防ぐ
    router.push(`/users/${username}`);
  };

  return (
    <>
      {/* フィルターヘッダー */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="week">1週間</SelectItem>
              <SelectItem value="month">1ヶ月</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500 ml-2">
            {filteredCaptures.length}件の投稿
          </span>
        </div>
      </div>

      {/* タイムライン */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          // ローディング状態
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                    </div>
                  </div>
                  <div className="aspect-square bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCaptures.length === 0 ? (
          // 投稿がない場合
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Camera className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600 mb-4">まだ投稿がありません</p>
              <Button onClick={() => router.push("/capture")}>
                投稿を開始
              </Button>
            </CardContent>
          </Card>
        ) : (
          // 投稿一覧
          filteredCaptures.map((capture) => (
            <Card
              key={capture.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handlePostClick(capture.id)}
            >
              <CardContent className="p-0">
                {/* ユーザー情報ヘッダー */}
                <div className="p-4 pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) =>
                        handleUserClick(e, capture.profiles.username)
                      }
                    >
                      <AvatarImage
                        src={capture.profiles.avatar_url || undefined}
                        alt={capture.profiles.username}
                      />
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className="font-semibold text-sm cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={(e) =>
                            handleUserClick(e, capture.profiles.username)
                          }
                        >
                          {capture.profiles.username}
                        </p>
                        <span className="text-gray-400">•</span>
                        <p className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeAgo(capture.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{capture.spots.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 画像 */}
                <div className="relative aspect-square">
                  <Image
                    src={capture.media_url}
                    alt={capture.caption || "投稿画像"}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    onLoad={() => {
                      console.log(
                        "画像の読み込みが完了しました:",
                        capture.media_url
                      );
                    }}
                  />
                </div>

                {/* キャプション */}
                {capture.caption && (
                  <div className="p-4 pt-3">
                    <p className="text-sm text-gray-800">{capture.caption}</p>
                  </div>
                )}

                {/* 投稿詳細 */}
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {formatDate(capture.created_at)}{" "}
                      {formatTime(capture.created_at)}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {capture.media_type === "photo" ? "写真" : "動画"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
