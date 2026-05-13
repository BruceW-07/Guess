import { z } from "zod";
import { ok, fail } from "@/lib/api";
import { recordShareSuccess } from "@/lib/lyric-service";

type Context = {
  params: Promise<{
    shareId: string;
  }>;
};

const bodySchema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(request: Request, context: Context) {
  const params = await context.params;
  const shareId = Number(params.shareId);
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!Number.isFinite(shareId)) {
    return fail("invalid_share_id", "分享 ID 不合法");
  }

  if (!parsed.success) {
    return fail("invalid_payload", "参数不合法");
  }

  const result = await recordShareSuccess(shareId, parsed.data.sessionId);
  if ("errorCode" in result) {
    const code = result.errorCode ?? "unknown_error";
    const message = result.errorMessage ?? "请求失败";
    return fail(code, message, 404);
  }

  return ok(result);
}
