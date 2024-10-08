import type { Metadata } from "next";

import { UserProfile } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import NextLink from "next/link";
import { redirect } from "next/navigation";
import { Link } from "@/components/ui/Link";
import { getUser } from "@/utils/data/users";
import { UpdateUserData } from "./UpdateUserData";

export const fetchCache = "force-no-store";

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
          <Link asChild className="text-3xl" href={`/${user.username}`}>
            <NextLink href={`/${user.username}`}>@{user.username}</NextLink>
          </Link>
        </h1>
        <UserProfile path="/settings" />
        {dbUser ? (
          <UpdateUserData
            userId={user.id}
            initialBio={dbUser.bio || undefined}
            initialBrandColor={dbUser.brandColor}
          />
        ) : null}
      </div>
    </div>
  );
}
