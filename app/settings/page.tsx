import { cookies } from "next/headers";
import {
  MapPin,
  Trash2,
  Info,
  MessageSquare,
  ArrowRight,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FloatingActionButton from "@/components/floating-action-button";
import BottomNavigation from "@/components/bottom-navigation";
import Link from "next/link";
import React from "react";
import { resetLocation, clearCache, signOutAction } from "./actions";

// 型定義を明示

type RegisteredLocation = {
  name: string;
  lat: number;
  lng: number;
} | null;

function RegisteredLocationInfo({
  registeredLocation,
}: {
  registeredLocation: RegisteredLocation;
}) {
  if (!registeredLocation) {
    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">地点が登録されていません</p>
      </div>
    );
  }
  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
      <p className="font-medium text-green-800">{registeredLocation.name}</p>
      <p className="text-sm text-green-600">
        {registeredLocation.lat.toFixed(6)}, {registeredLocation.lng.toFixed(6)}
      </p>
    </div>
  );
}

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const registeredLocationRaw = cookieStore.get("registeredLocation")?.value;
  let registeredLocation: RegisteredLocation = null;
  try {
    registeredLocation = registeredLocationRaw
      ? JSON.parse(registeredLocationRaw)
      : null;
  } catch {
    registeredLocation = null;
  }

  return (
    <div className="min-h-screen pb-20">
      {/* ヘッダー */}
      <div className="bg-white border-b p-4 flex items-center gap-3">
        <Link href="/profile">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">設定</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* 撮影地点設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              撮影地点
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <RegisteredLocationInfo registeredLocation={registeredLocation} />
            <div className="flex gap-2">
              <form action="/register-location" method="get" className="flex-1">
                <Button variant="outline" className="w-full">
                  {registeredLocation ? "地点を変更" : "地点を登録"}
                </Button>
              </form>
              {registeredLocation && (
                <form action={resetLocation}>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    type="submit"
                  >
                    リセット
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        {/* データ管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              データ管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={clearCache}>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                type="submit"
              >
                すべてのデータを削除
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* アプリ情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-5 h-5" />
              アプリ情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span>アプリ名</span>
              <span className="text-gray-600">Daily Capture</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>バージョン</span>
              <span className="text-gray-600">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>開発者</span>
              <span className="text-gray-600">定点撮影SNS Team</span>
            </div>
          </CardContent>
        </Card>

        {/* フィードバック */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              フィードバック
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full justify-between">
              ご意見・ご要望
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* ログアウト */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              アカウント
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={signOutAction}>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                type="submit"
              >
                ログアウト
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="profile" />

      <FloatingActionButton />
    </div>
  );
}
