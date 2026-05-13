import { ok, fail } from "@/lib/api";
import { getShareDetail } from "@/lib/lyric-service";

type Context = {
  params: Promise<{
    shareId: string;
  }>;
};

export async function GET(_: Request, context: Context) {
  const params = await context.params;
  const shareId = Number(params.shareId);

  if (!Number.isFinite(shareId)) {
    return fail("invalid_share_id", "分享 ID 不合法");
  }

  const detail = await getShareDetail(shareId);
  if (!detail) {
    return fail("not_found", "分享不存在", 404);
  }

  return ok(detail);
}
