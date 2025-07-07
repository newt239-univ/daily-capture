import Link from "next/link";
import React from "react";

import {
  Info,
  MessageSquare,
  ArrowRight,
  LogOut,
  ArrowLeft,
} from "lucide-react";

import { signOutAction } from "./actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";



export default async function SettingsPage() {
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
              <Link
                href="https://github.com/newt239"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                newt239
              </Link>
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
    </div>
  );
}
