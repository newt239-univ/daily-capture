"use client"

import { useState, useEffect } from "react"
import { Camera, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BottomNavigation from "@/components/bottom-navigation"
import { useRouter } from "next/navigation"

interface Shot {
  id: string
  timestamp: number
  imageUrl: string
  location: {
    lat: number
    lng: number
    name: string
  }
}

export default function HomePage() {
  const [shots, setShots] = useState<Shot[]>([])
  const [registeredLocation, setRegisteredLocation] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // ローカルストレージから撮影データを読み込み
    const savedShots = localStorage.getItem("fixedPointShots")
    if (savedShots) {
      setShots(JSON.parse(savedShots))
    }

    const savedLocation = localStorage.getItem("registeredLocation")
    if (savedLocation) {
      setRegisteredLocation(JSON.parse(savedLocation))
    }
  }, [])

  const handleRegisterLocation = () => {
    router.push("/register-location")
  }

  const handleStartCapture = () => {
    if (!registeredLocation) {
      handleRegisterLocation()
      return
    }
    router.push("/capture")
  }

  const latestShots = shots.slice(-3).reverse()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* ヒーローエリア */}
      <div className="px-4 pt-8 pb-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">定点撮影SNS</h1>
          <p className="text-gray-600">同じ場所から時の流れを記録しよう</p>
        </div>

        {/* メインCTA */}
        <div className="space-y-3">
          {!registeredLocation ? (
            <Button onClick={handleRegisterLocation} className="w-full h-14 text-lg" size="lg">
              <MapPin className="w-5 h-5 mr-2" />
              撮影地点を登録
            </Button>
          ) : (
            <div className="space-y-3">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{registeredLocation.name}</span>
                  </div>
                </CardContent>
              </Card>
              <Button onClick={handleStartCapture} className="w-full h-14 text-lg" size="lg">
                <Camera className="w-5 h-5 mr-2" />
                撮影開始
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 最新タイムライン */}
      {latestShots.length > 0 && (
        <div className="px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                最新の撮影
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestShots.map((shot) => (
                <div key={shot.id} className="flex items-center gap-3">
                  <img
                    src={shot.imageUrl || "/placeholder.svg"}
                    alt="撮影画像"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{new Date(shot.timestamp).toLocaleDateString("ja-JP")}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(shot.timestamp).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => router.push("/timeline")}>
                すべて見る
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <BottomNavigation currentPage="home" />
    </div>
  )
}
