"use client";

import { usePathname } from "next/navigation";
import BottomNavigation from "./bottom-navigation";
import FloatingActionButton from "./floating-action-button";

export default function LayoutNavigation() {
  const pathname = usePathname();

  // currentPageを決定する関数
  const getCurrentPage = (): "timeline" | "search" | "profile" => {
    if (pathname.startsWith("/search")) return "search";
    if (pathname.startsWith("/profile") || pathname.startsWith("/settings"))
      return "profile";
    return "timeline"; // デフォルトはtimeline
  };

  // 特定のページではナビゲーションを表示しない
  const hideNavigation =
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/register-location" ||
    pathname === "/capture" ||
    pathname.startsWith("/auth/");

  if (hideNavigation) {
    return null;
  }

  return (
    <>
      <BottomNavigation currentPage={getCurrentPage()} />
      <FloatingActionButton />
    </>
  );
}
