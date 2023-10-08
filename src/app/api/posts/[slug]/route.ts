import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/utils/errorResponse";
import { postsQueryParams } from "@/utils/querySchema";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const include = postsQueryParams.include.parse(searchParams.get("include"));

    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      include,
    });
    if (!post) {
      throw new Error("Post not found");
    }

    return new Response(JSON.stringify(post), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    return errorResponse(error, ["Post not found"]);
  }
}
