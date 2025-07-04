"use client"

import { Home, Camera, Clock, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface BottomNavigationProps {
  currentPage: "home" | "capture" | "timeline" | "settings"
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const router = useRouter()

  const navItems = [
    { id: "home", icon: Home, label: "ホーム", path: "/" },
    { id: "capture", icon: Camera, label: "撮影", path: "/capture" },
    { id: "timeline", icon: Clock, label: "タイムライン", path: "/timeline" },
    { id: "settings", icon: Settings, label: "設定", path: "/settings" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex-1 flex flex-col items-center gap-1 h-auto py-2 ${
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => router.push(item.path)}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
