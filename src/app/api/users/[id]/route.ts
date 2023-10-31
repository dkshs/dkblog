import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/utils/errorResponse";
import { z } from "zod";

const updateUserSchema = z.object({
  brandColor: z.string().optional(),
  bio: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { userId: clerkUserId } = auth();
    if (!clerkUserId) {
      throw new Error("Unauthorized");
    }

    const { brandColor, bio } = updateUserSchema.parse(await request.json());

    let user = await prisma.user.findUnique({
      where: { externalId: params.id },
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (user.externalId !== clerkUserId) {
      throw new Error("Unauthorized");
    }

    user = await prisma.user.update({
      where: { externalId: params.id },
      data: {
        brandColor: brandColor || user.brandColor,
        bio: bio || user.bio,
      },
    });
    return new Response(JSON.stringify(user), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    return errorResponse(error, ["User not found"]);
  }
}
