import type { Metadata, ResolvingMetadata } from "next";

import { currentUser } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { CalendarDays, Hash, ScrollText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { getUser, getUsers } from "@/utils/data/users";

export const revalidate = 300; // 5 minutes

type Props = {
  readonly params: Promise<{ user: string }>;
};

export async function generateStaticParams() {
  const users = await getUsers({});

  return users.map((u) => ({
    user: u.username,
  }));
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { user: username } = await params;

  const user = await getUser({ where: { username } });
  if (!user) {
    return notFound();
  }

  const userUrl = `${(await parent).metadataBase}${user.username}`;

  return {
    title: user.username,
    alternates: {
      canonical: userUrl,
    },
    openGraph: {
      title: user.username,
      url: userUrl,
      type: "profile",
      images: user.image ? { url: user.image, alt: user.username } : undefined,
    },
    twitter: {
      card: user.image ? "summary_large_image" : "summary",
      title: user.username,
      images: user.image ? { url: user.image, alt: user.username } : undefined,
    },
  };
}

export default async function UserPage({ params }: Props) {
  const clerkCurrentUser = await currentUser();
  const user = await getUser({ where: { username: (await params).user } });

  if (!user) {
    notFound();
  }

  const isOwner = clerkCurrentUser?.username === user.username;
  const joinedOn = format(new Date(user.createdAt), "dd MMM. yyyy");
  const postsP = user.posts.filter((p) => p.status === "PUBLISHED");
  const postsD = user.posts.filter((p) => p.status === "DRAFTED");
  const postsPublished = user.posts
    .map((p) => (p.status === "PUBLISHED" ? 1 : (0 as number)))
    .reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto mb-10 max-w-5xl">
      <div
        className="absolute inset-x-0 top-0 z-[-1] mt-16 h-40 w-full"
        style={{ backgroundColor: user.brandColor }}
      />
      <div
        className="mt-28 flex flex-col items-center justify-center border-2 bg-secondary sm:mx-2 sm:rounded-md"
        style={{ borderColor: user.brandColor }}
      >
        <div className="relative mb-3 flex w-full items-center px-6 sm:justify-center sm:px-0">
          <span
            className="-mt-14 rounded-full p-2 sm:-mt-20"
            style={{ backgroundColor: user.brandColor }}
          >
            {/* eslint-disable-next-line nextjs/no-img-element */}
            <img
              src={user.image}
              alt={user.username}
              className="size-24 rounded-full bg-black sm:size-32"
            />
          </span>
          <div className="absolute inset-x-0 top-0 flex justify-end pr-6 pt-6">
            {isOwner ? (
              <Button asChild>
                <Link href="/settings">Edit profile</Link>
              </Button>
            ) : (
              <Button>Follow</Button>
            )}
          </div>
        </div>
        <div className="flex w-full flex-col p-6 sm:items-center sm:justify-center sm:text-center">
          <h1 className="mb-4 text-3xl font-bold">{user.username}</h1>
          {user.bio ? (
            <p className="mb-8 max-w-[75%] sm:mx-auto">{user.bio}</p>
          ) : null}
          <div className="flex">
            <CalendarDays className="mr-2 size-4 opacity-70" />{" "}
            <span className="text-xs text-muted-foreground">
              Joined on{" "}
              <time dateTime={new Date(user.createdAt).toISOString()}>
                {joinedOn}
              </time>
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex grid-cols-3 flex-col gap-4 sm:mx-2 sm:grid">
        <div className="flex h-fit flex-col gap-4 bg-secondary p-4 sm:rounded-md">
          <div className="flex items-center gap-3 font-normal">
            <ScrollText size={24} /> {postsPublished} posts published
          </div>
          <div className="flex items-center gap-3">
            <Hash size={24} /> 0 tags followed
          </div>
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          {isOwner ? (
            <Tabs defaultValue="published">
              <TabsList className="grid w-full grid-cols-2 rounded-none sm:rounded-md">
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="drafted">Drafted</TabsTrigger>
              </TabsList>
              <TabsContent value="published">
                {postsP.length > 0 ? (
                  postsP.map((post) => (
                    <PostCard
                      key={post.id}
                      {...post}
                      className="mt-2 w-full p-5"
                    />
                  ))
                ) : (
                  <p className="text-center">No posts published</p>
                )}
              </TabsContent>
              <TabsContent value="drafted">
                {postsD.length > 0 ? (
                  postsD.map((post) => (
                    <PostCard
                      key={post.id}
                      {...post}
                      className="mt-2 w-full p-5"
                    />
                  ))
                ) : (
                  <p className="text-center">No posts drafted</p>
                )}
              </TabsContent>
            </Tabs>
          ) : postsP.length > 0 ? (
            postsP.map((post) => (
              <PostCard key={post.id} {...post} className="w-full p-5" />
            ))
          ) : (
            <p className="text-center">No posts published</p>
          )}
        </div>
      </div>
    </div>
  );
}
