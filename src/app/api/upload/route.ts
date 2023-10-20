import { errorResponse } from "@/utils/errorResponse";
import { saveFile } from "@/utils/saveFile";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;
    const field = formData.get("field")?.toString() || "posts";

    if (!file) {
      throw new Error("No file provided");
    }
    if (!field.includes("posts") && !field.includes("tags")) {
      throw new Error("Invalid field");
    }
    if (!file.type.startsWith("image/")) {
      throw new Error("Invalid file type");
    }

    const { fileURL } = await saveFile(file, {
      folder: `${field}`,
    });

    return new Response(JSON.stringify({ image: fileURL }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return errorResponse(e, [
      "No file provided",
      "Invalid file type",
      "Invalid field",
    ]);
  }
}
