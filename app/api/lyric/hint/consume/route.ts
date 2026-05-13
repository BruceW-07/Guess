import { ok, fail } from "@/lib/api";
import { consumeHint } from "@/lib/lyric-service";

export async function POST() {
  const result = await consumeHint();
  if ("errorCode" in result) {
    const code = result.errorCode ?? "unknown_error";
    const message = result.errorMessage ?? "请求失败";
    return fail(code, message, 402);
  }

  return ok(result.wallet);
}
