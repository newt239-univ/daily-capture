"use client"

import { useState } from "react"
import { MapPin, Trash2, Info, MessageSquare, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import BottomNavigation from "@/components/bottom-navigation"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [registeredLocation, setRegisteredLocation] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  useState(() => {
    const savedLocation = localStorage.getItem("registeredLocation")
    if (savedLocation) {
      setRegisteredLocation(JSON.parse(savedLocation))
    }
  })

  const handleResetLocation = () => {
    localStorage.removeItem("registeredLocation")
    setRegisteredLocation(null)
    toast({
      title: "地点をリセット",
      description: "撮影地点の登録を解除しました",
    })
    router.push("/register-location")
  }

  const handleClearCache = () => {
    localStorage.removeItem("fixedPointShots")
    localStorage.removeItem("registeredLocation")
    setShowClearDialog(false)
    toast({
      title: "データを削除",
      description: "すべてのデータを削除しました",
    })
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <div className="bg-white border-b p-4">
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
            {registeredLocation ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-800">{registeredLocation.name}</p>
                <p className="text-sm text-green-600">
                  {registeredLocation.lat.toFixed(6)}, {registeredLocation.lng.toFixed(6)}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-600">地点が登録されていません</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => router.push("/register-location")}>
                {registeredLocation ? "地点を変更" : "地点を登録"}
              </Button>
              {registeredLocation && (
                <Button
                  variant="outline"
                  onClick={handleResetLocation}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  リセット
                </Button>
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
            <Button
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowClearDialog(true)}
            >
              すべてのデータを削除
            </Button>
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
      </div>

      {/* データ削除確認ダイアログ */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>データを削除しますか？</DialogTitle>
            <DialogDescription>すべての撮影データと設定が削除されます。この操作は取り消せません。</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowClearDialog(false)}>
              キャンセル
            </Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleClearCache}>
              削除
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation currentPage="settings" />
    </div>
  )
}
