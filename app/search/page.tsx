import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">検索</h1>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="ユーザーや場所を検索..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Search Results Placeholder */}
        <div className="px-4 pb-20">
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              ユーザーや場所を検索してみましょう
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
