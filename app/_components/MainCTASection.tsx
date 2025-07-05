"use client";

import { useState, useEffect } from "react";
import { Camera, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type RegisteredLocation = { name: string; lat: number; lng: number } | null;

export default function MainCTASection() {
  const [registeredLocation, setRegisteredLocation] =
    useState<RegisteredLocation>(null);
  const router = useRouter();

  useEffect(() => {
    const savedLocation = localStorage.getItem("registeredLocation");
    if (savedLocation) {
      setRegisteredLocation(JSON.parse(savedLocation));
    }
  }, []);

  const handleRegisterLocation = () => {
    router.push("/register-location");
  };

  const handleStartCapture = () => {
    if (!registeredLocation) {
      handleRegisterLocation();
      return;
    }
    router.push("/capture");
  };

  return (
    <div className="px-4 space-y-3">
      {!registeredLocation ? (
        <Button
          onClick={handleRegisterLocation}
          className="w-full h-14 text-lg"
          size="lg"
        >
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
          <Button
            onClick={handleStartCapture}
            className="w-full h-14 text-lg"
            size="lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            撮影開始
          </Button>
        </div>
      )}
    </div>
  );
}