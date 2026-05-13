import { ok, fail } from "@/lib/api";
import { getDailyPuzzle } from "@/lib/lyric-service";
import { todayKey } from "@/lib/date";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? todayKey();
  const result = await getDailyPuzzle(date);

  if ("errorCode" in result) {
    const code = result.errorCode ?? "unknown_error";
    const message = result.errorMessage ?? "请求失败";
    return fail(code, message, 404);
  }

  return ok(result.puzzle);
}
