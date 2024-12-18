import { PostCard } from "@/components/PostCard";
import { getPosts } from "@/utils/data/posts";

export const revalidate = 300; // 5 minutes

export default async function HomePage() {
  const posts = await getPosts({
    exclude: ["userId", "content", "image"],
    where: { status: "PUBLISHED" },
    orderBy: { postedOn: "desc" },
  });

  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:container">
      {posts.map((post) => (
        <PostCard key={post.slug} className="w-full lg:w-1/2" {...post} />
      ))}
    </div>
  );
}
