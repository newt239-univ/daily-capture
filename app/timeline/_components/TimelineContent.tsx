"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Share, Trash2, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

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

export default function TimelineContent() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [filteredShots, setFilteredShots] = useState<Shot[]>([]);
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [showTimelapseModal, setShowTimelapseModal] = useState(false);
  const [timelapseProgress, setTimelapseProgress] = useState(0);
  const [timelapseUrl, setTimelapseUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedShots = localStorage.getItem("fixedPointShots");
    if (savedShots) {
      const parsedShots = JSON.parse(savedShots);
      setShots(parsedShots);
      setFilteredShots(parsedShots);
    }
  }, []);

  const filterShots = useCallback(() => {
    const now = Date.now();
    let filtered = shots;

    switch (filterPeriod) {
      case "week":
        filtered = shots.filter(
          (shot) => now - shot.timestamp <= 7 * 24 * 60 * 60 * 1000
        );
        break;
      case "month":
        filtered = shots.filter(
          (shot) => now - shot.timestamp <= 30 * 24 * 60 * 60 * 1000
        );
        break;
      default:
        filtered = shots;
    }

    setFilteredShots(filtered.sort((a, b) => b.timestamp - a.timestamp));
  }, [shots, filterPeriod]);

  useEffect(() => {
    filterShots();
  }, [shots, filterPeriod, filterShots]);

  const generateTimelapse = async () => {
    if (shots.length < 2) {
      toast({
        title: "エラー",
        description: "タイムラプス生成には2枚以上の写真が必要です",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setTimelapseProgress(0);
    setShowTimelapseModal(true);

    // 擬似的なタイムラプス生成プロセス
    const interval = setInterval(() => {
      setTimelapseProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          // 擬似的なタイムラプスURL（実際の実装では生成されたBlobURLを使用）
          setTimelapseUrl("/placeholder.svg?height=400&width=600");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const shareTimelapse = async () => {
    if (!timelapseUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "定点撮影タイムラプス",
          text: "定点撮影で作成したタイムラプスです",
          url: window.location.href,
        });
      } catch (error) {
        console.error("共有に失敗しました:", error);
      }
    } else {
      // Web Share API非対応の場合
      toast({
        title: "共有",
        description: "タイムラプスのURLをクリップボードにコピーしました",
      });
    }
  };

  const deleteShot = (shotId: string) => {
    const updatedShots = shots.filter((shot) => shot.id !== shotId);
    setShots(updatedShots);
    localStorage.setItem("fixedPointShots", JSON.stringify(updatedShots));
    toast({
      title: "削除完了",
      description: "写真を削除しました",
    });
  };

  return (
    <>
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div />
          <Button
            onClick={generateTimelapse}
            disabled={shots.length < 2}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Play className="w-4 h-4 mr-2" />
            タイムラプス生成
          </Button>
        </div>

        {/* フィルター */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="week">1週間</SelectItem>
              <SelectItem value="month">1ヶ月</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500 ml-2">
            {filteredShots.length}件
          </span>
        </div>
      </div>

      {/* タイムラインカード */}
      <div className="p-4 space-y-4">
        {filteredShots.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Play className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600 mb-4">まだ撮影がありません</p>
              <Button onClick={() => (window.location.href = "/capture")}>
                撮影を開始
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredShots.map((shot, index) => (
            <Card key={shot.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={shot.imageUrl || "/placeholder.svg"}
                    alt={`撮影 ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    style={{ objectFit: "cover" }}
                    priority={index === 0}
                  />
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    #{filteredShots.length - index}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {new Date(shot.timestamp).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(shot.timestamp).toLocaleTimeString("ja-JP", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteShot(shot.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* タイムラプス生成モーダル */}
      <Dialog open={showTimelapseModal} onOpenChange={setShowTimelapseModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">
              {isGenerating ? "タイムラプス生成中..." : "タイムラプス完成！"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isGenerating ? (
              <div className="space-y-3">
                <Progress value={timelapseProgress} className="w-full" />
                <p className="text-center text-sm text-gray-600">
                  {timelapseProgress}% 完了
                </p>
              </div>
            ) : timelapseUrl ? (
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <Play className="w-12 h-12 text-gray-400" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={shareTimelapse} className="flex-1">
                    <Share className="w-4 h-4 mr-2" />
                    共有
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}