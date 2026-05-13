import { z } from "zod";
import { ok, fail } from "@/lib/api";
import { recordGuessTitle } from "@/lib/lyric-service";

const bodySchema = z.object({
  title: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return fail("invalid_payload", "参数不合法");
  }

  return ok({ matched: await recordGuessTitle(parsed.data.title) });
}
