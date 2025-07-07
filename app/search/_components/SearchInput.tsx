"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type SearchInputProps = {
  onSearch: (query: string) => void;
};

export default function SearchInput({ onSearch }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  // URLクエリパラメータから初期値を取得
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    if (q) {
      onSearch(q);
    }
  }, [searchParams, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // URLクエリパラメータを更新
    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set("q", newQuery);
    } else {
      params.delete("q");
    }

    router.push(`/search?${params.toString()}`, { scroll: false });

    // 検索を実行
    onSearch(newQuery);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        placeholder="ユーザーや場所を検索..."
        value={query}
        onChange={handleInputChange}
        className="pl-10"
      />
    </div>
  );
}
