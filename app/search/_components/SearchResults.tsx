import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, User, Camera } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SearchResult } from "../actions";

type SearchResultsProps = {
  results: SearchResult;
  query: string;
};

export default function SearchResults({ results, query }: SearchResultsProps) {
  const { users, spots, posts } = results;
  const hasResults = users.length > 0 || spots.length > 0 || posts.length > 0;

  if (!hasResults) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <User className="w-12 h-12 mx-auto mb-2" />
          <MapPin className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-gray-500 text-sm">
          「{query}」の検索結果が見つかりませんでした
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ユーザーの検索結果 */}
      {users.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="w-5 h-5" />
            ユーザー ({users.length})
          </h2>
          <div className="space-y-2">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/users/${user.username}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-sm text-gray-500 truncate">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 場所の検索結果 */}
      {spots.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            場所 ({spots.length})
          </h2>
          <div className="space-y-2">
            {spots.map((spot) => (
              <Link
                key={spot.id}
                href={`/users/${spot.profiles.username}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {spot.reference_image_url ? (
                          <Image
                            src={spot.reference_image_url}
                            alt={spot.name}
                            width={48}
                            height={48}
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          <MapPin className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {spot.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="w-4 h-4">
                            <AvatarImage
                              src={spot.profiles.avatar_url || undefined}
                            />
                            <AvatarFallback className="text-xs">
                              {spot.profiles.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm text-gray-500 truncate">
                            @{spot.profiles.username}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 投稿の検索結果 */}
      {posts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            投稿 ({posts.length})
          </h2>
          <div className="space-y-2">
            {posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="block">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <Image
                          src={post.media_url}
                          alt={post.caption || "投稿画像"}
                          width={48}
                          height={48}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        {post.caption && (
                          <p className="font-medium text-gray-900 line-clamp-2 mb-2">
                            {post.caption}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="w-4 h-4">
                            <AvatarImage
                              src={post.profiles.avatar_url || undefined}
                            />
                            <AvatarFallback className="text-xs">
                              {post.profiles.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm text-gray-500">
                            @{post.profiles.username}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin className="w-3 h-3" />
                          <span>{post.spots.name}</span>
                          <span>•</span>
                          <span>
                            {new Date(post.created_at).toLocaleDateString(
                              "ja-JP",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
