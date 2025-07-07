import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import ProfileEditForm from "./_components/ProfileEditForm";

import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



async function getUserProfile(userId: string) {
  const profile = await prisma.profiles.findUnique({
    where: { id: userId },
  });

  return profile;
}

type ProfileEditPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function ProfileEditPage({
  searchParams,
}: ProfileEditPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const userProfile = await getUserProfile(session.user.id);

  if (!userProfile) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              プロフィール編集
            </h1>
          </div>
        </div>

        {/* Error/Success Messages */}
        {resolvedSearchParams.error && (
          <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{resolvedSearchParams.error}</p>
          </div>
        )}
        {resolvedSearchParams.success && (
          <div className="mx-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">
              {resolvedSearchParams.success}
            </p>
          </div>
        )}

        {/* Edit Form */}
        <div className="p-4">
          <ProfileEditForm userProfile={userProfile} />

          <Link href="/profile">
            <Button variant="outline" className="w-full h-12 mt-3">
              キャンセル
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
