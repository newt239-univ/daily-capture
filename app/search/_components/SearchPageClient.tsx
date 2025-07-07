"use client";

import { useCallback, useState } from "react";

import { Search } from "lucide-react";

import { searchContent, SearchResult } from "../actions";

import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";

export default function SearchPageClient() {
  const [results, setResults] = useState<SearchResult>({
    users: [],
    spots: [],
    posts: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");

  const handleSearch = useCallback(async (query: string) => {
    setCurrentQuery(query);

    if (!query.trim()) {
      setResults({ users: [], spots: [], posts: [] });
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await searchContent(query);
      setResults(searchResults);
    } catch (error) {
      console.error("検索エラー:", error);
      setResults({ users: [], spots: [], posts: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasQuery = currentQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">検索</h1>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <SearchInput onSearch={handleSearch} />
        </div>

        {/* Content */}
        <div className="px-4 pb-20">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 text-sm mt-2">検索中...</p>
            </div>
          ) : hasQuery ? (
            <SearchResults results={results} query={currentQuery} />
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                ユーザーや場所を検索してみましょう
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
