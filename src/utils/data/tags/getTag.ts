import type { Prisma } from "@prisma/client";
import type { TagWithPosts } from "@/utils/types";

import { cache } from "react";
import { type GetTagsOptionsWithExclude, getTags } from "./getTags";

interface GetTagProps extends GetTagsOptionsWithExclude {
  where: Prisma.TagWhereUniqueInput;
}

export const getTag = cache(
  async ({ where, ...opts }: GetTagProps): Promise<TagWithPosts | null> => {
    const tags = await getTags({ where, ...opts });
    return tags[0] ?? null;
  },
);
