"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MapPin, Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export default function RegisterLocationPage() {
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [locationName, setLocationName] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // 現在地を取得
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setCurrentLocation(pos)
          setSelectedPosition(pos)
        },
        (error) => {
          console.error("位置情報の取得に失敗しました:", error)
          // デフォルト位置（東京駅）
          const defaultPos = { lat: 35.6812, lng: 139.7671 }
          setCurrentLocation(defaultPos)
          setSelectedPosition(defaultPos)
        },
      )
    }
  }, [])

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // 簡易的な座標変換（実際の地図APIでは不要）
    const lat = currentLocation?.lat || 35.6812
    const lng = currentLocation?.lng || 139.7671

    setSelectedPosition({
      lat: lat + (y - rect.height / 2) * 0.001,
      lng: lng + (x - rect.width / 2) * 0.001,
    })
  }

  const handleRegister = () => {
    if (!selectedPosition || !locationName.trim()) return

    const locationData = {
      ...selectedPosition,
      name: locationName.trim(),
    }

    localStorage.setItem("registeredLocation", JSON.stringify(locationData))
    setShowSuccessModal(true)
  }

  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">撮影地点を登録</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* 地図エリア */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">地図から選択</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={mapRef}
              className="w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg relative cursor-crosshair border-2 border-dashed border-gray-300"
              onClick={handleMapClick}
            >
              {/* 簡易地図表示（実際の実装ではMapbox GL JSやLeafletを使用） */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">タップして地点を選択</p>
                </div>
              </div>

              {/* 現在地マーカー */}
              {currentLocation && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                </div>
              )}

              {/* 選択位置マーカー */}
              {selectedPosition && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <MapPin className="w-8 h-8 text-red-500 drop-shadow-lg" />
                </div>
              )}
            </div>

            {selectedPosition && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  選択位置: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 地点名入力 */}
        <div className="space-y-2">
          <Label htmlFor="locationName">地点名</Label>
          <Input
            id="locationName"
            placeholder="例: 自宅のベランダ、公園の展望台"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />
        </div>

        {/* 現在地ボタン */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            if (currentLocation) {
              setSelectedPosition(currentLocation)
            }
          }}
        >
          <MapPin className="w-4 h-4 mr-2" />
          現在地を使用
        </Button>

        {/* 登録ボタン */}
        <Button className="w-full h-12" onClick={handleRegister} disabled={!selectedPosition || !locationName.trim()}>
          <Check className="w-5 h-5 mr-2" />
          地点を登録
        </Button>
      </div>

      {/* 成功モーダル */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              地点を登録しました
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-gray-600">「{locationName}」での撮影を開始できます</p>
            <Button onClick={handleSuccessClose} className="w-full">
              撮影を開始
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
