import { z } from "zod";
import { ok, fail } from "@/lib/api";
import { createShare } from "@/lib/lyric-service";

const createShareSchema = z.object({
  lyricId: z.string().min(1),
  description: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createShareSchema.safeParse(body);

  if (!parsed.success) {
    return fail("invalid_payload", "参数不合法");
  }

  const result = await createShare(parsed.data.lyricId, parsed.data.description);
  if ("errorCode" in result) {
    const code = result.errorCode ?? "unknown_error";
    const message = result.errorMessage ?? "请求失败";
    return fail(code, message, 404);
  }

  return ok({ shareId: result.shareId });
}
