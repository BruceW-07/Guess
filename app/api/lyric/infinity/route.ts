import { ok, fail } from "@/lib/api";
import { getInfinityPuzzle } from "@/lib/lyric-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const author = searchParams.get("author") ?? "";
  const excludeId = searchParams.get("excludeId") ?? undefined;
  const result = await getInfinityPuzzle(author, excludeId);

  if ("errorCode" in result) {
    const code = result.errorCode ?? "unknown_error";
    const message = result.errorMessage ?? "请求失败";
    return fail(code, message, 404);
  }

  return ok(result.puzzle);
}
