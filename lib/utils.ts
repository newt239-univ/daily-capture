import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 日付を日本語フォーマットで表示する
 */
export function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 時刻を日本語フォーマットで表示する
 */
export function formatTime(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 相対時間を表示する（何分前、何時間前など）
 */
export function getTimeAgo(date: Date | null): string {
  if (!date) return "";
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor(
    (now.getTime() - past.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "たった今";
  if (diffInMinutes < 60) return `${diffInMinutes}分前`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}時間前`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}日前`;

  return formatDate(date);
}
