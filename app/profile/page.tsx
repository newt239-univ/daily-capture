import BottomNavigation from "@/components/bottom-navigation";
import FloatingActionButton from "@/components/floating-action-button";
import { Settings, Camera, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header with Settings */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">プロフィール</h1>
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src="/placeholder-user.jpg" alt="プロフィール画像" />
              <AvatarFallback>YU</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-gray-900 mb-1">ユーザー名</h2>
            <p className="text-gray-500 text-sm mb-2">@username</p>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>登録場所: 東京駅</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">42</div>
              <div className="text-sm text-gray-500">投稿</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">128</div>
              <div className="text-sm text-gray-500">フォロワー</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">89</div>
              <div className="text-sm text-gray-500">フォロー中</div>
            </div>
          </div>
        </div>

        {/* Recent Posts Grid Placeholder */}
        <div className="px-4 pb-20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            最近の投稿
          </h3>
          <div className="grid grid-cols-3 gap-1">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 rounded flex items-center justify-center"
              >
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation currentPage="profile" />

        {/* Floating Action Button */}
        <FloatingActionButton />
      </div>
    </div>
  );
}
