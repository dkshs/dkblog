import type { Metadata } from "next";

import { currentUser, UserProfile } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getUser } from "@/utils/data/users";

import { Link } from "@/components/ui/Link";
import NextLink from "next/link";
import { InputColor } from "./InputColor";
import { UpdateUserBioTextarea } from "./UpdateUserBioTextarea";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function UserSettingsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in?redirect_url=/settings");
  }
  const dbUser = await getUser({ where: { externalId: user.id } });

  return (
    <div className="mx-auto my-10 flex justify-center sm:container">
      <div className="flex flex-col items-start space-y-6">
        <h1 className="px-2">
          <Link asChild className="text-3xl">
            <NextLink href={`/${user.username}`}>@{user.username}</NextLink>
          </Link>
        </h1>
        <UserProfile
          path="/settings"
          routing="path"
          appearance={{
            elements: {
              navbar: "hidden",
              navbarMobileMenuRow: "hidden",
              card: "mx-0 shadow-none",
              pageScrollBox: "px-4 sm:px-8 py-9",
              rootBox: "w-full flex justify-center",
            },
          }}
        />
        <div className="flex w-full flex-col gap-4 rounded-2xl border border-primary/50 px-8 py-9">
          <h2 className="text-3xl font-bold">Basic</h2>
          <div className="flex flex-col gap-1">
            <label htmlFor="user-bio">Bio</label>
            <UpdateUserBioTextarea userId={user.id} userBio={dbUser?.bio} />
          </div>
        </div>
        <div className="flex w-full flex-col gap-4 rounded-2xl border border-primary/50 px-8 py-9">
          <h2 className="text-3xl font-bold">Branding</h2>
          <div className="flex flex-col gap-1">
            <label htmlFor="brand-color">Brand color</label>
            <p className="text-sm">Used for backgrounds, borders etc.</p>
            <InputColor userId={user.id} userColor={dbUser?.brandColor} />
          </div>
        </div>
      </div>
    </div>
  );
}
