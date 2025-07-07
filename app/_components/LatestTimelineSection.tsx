"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Shot {
  id: string;
  timestamp: number;
  imageUrl: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

export default function LatestTimelineSection() {
  const [shots, setShots] = useState<Shot[]>([]);
  const router = useRouter();

  useEffect(() => {
    // ローカルストレージから撮影データを読み込み
    const savedShots = localStorage.getItem("fixedPointShots");
    if (savedShots) {
      setShots(JSON.parse(savedShots));
    }
  }, []);

  const latestShots = shots.slice(-3).reverse();

  if (latestShots.length === 0) {
    return null;
  }

  return (
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
              <Image
                src={shot.imageUrl || "/placeholder.svg"}
                alt="撮影画像"
                width={64}
                height={64}
                className="w-16 h-16 rounded-lg object-cover"
                style={{ objectFit: "cover" }}
              />
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {new Date(shot.timestamp).toLocaleDateString("ja-JP")}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(shot.timestamp).toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/")}
          >
            すべて見る
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
