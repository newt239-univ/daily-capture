import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Clock, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { getCaptureById } from "../../actions";

type PostDetailPageProps = {
  params: Promise<{ capture_id: string }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { capture_id } = await params;

  const capture = await getCaptureById(capture_id);

  if (!capture) {
    notFound();
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (date: Date | null) => {
    if (!date) return "";
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - past.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "たった今";
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}時間前`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}日前`;

    return formatDate(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-semibold text-lg">投稿詳細</h1>
      </div>

      <div className="max-w-lg mx-auto">
        {/* ユーザー情報 */}
        <Card className="rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={capture.profiles.avatar_url || undefined}
                  alt={capture.profiles.username}
                />
                <AvatarFallback>
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">
                  {capture.profiles.username}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{getTimeAgo(capture.created_at)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 画像 */}
        <div className="relative aspect-square bg-white">
          <Image
            src={capture.media_url}
            alt={capture.caption || "投稿画像"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 640px"
            priority
          />
          <div className="absolute top-4 right-4">
            <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {capture.media_type === "photo" ? "写真" : "動画"}
            </span>
          </div>
        </div>

        {/* 投稿詳細情報 */}
        <Card className="rounded-none">
          <CardContent className="p-4 space-y-4">
            {/* キャプション */}
            {capture.caption && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">キャプション</h3>
                <p className="text-gray-700 leading-relaxed">
                  {capture.caption}
                </p>
              </div>
            )}

            <Separator />

            {/* 撮影場所 */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">撮影場所</h3>
                <p className="text-gray-700">{capture.spots.name}</p>
                {capture.spots.lat && capture.spots.lng && (
                  <p className="text-sm text-gray-500 mt-1">
                    緯度: {capture.spots.lat.toFixed(6)}, 経度:{" "}
                    {capture.spots.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* 投稿日時 */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">投稿日時</h3>
                <p className="text-gray-700">
                  {formatDate(capture.created_at)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatTime(capture.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* アクションボタン */}
        <Card className="rounded-none">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Link href={`/profile/${capture.profiles.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <User className="w-4 h-4 mr-2" />
                  プロフィールを見る
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  タイムラインに戻る
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
