import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import LayoutNavigation from "@/components/layout-navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "定点撮影SNS",
  description: "同じ場所から時の流れを記録するSNSアプリ",
  generator: "v0.dev",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

// 横幅制限を適用するレイアウトコンポーネント
function ConstrainedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto min-h-screen bg-white relative">
        {children}
        <LayoutNavigation />
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          <ConstrainedLayout>{children}</ConstrainedLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
