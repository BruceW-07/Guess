import { ok } from "@/lib/api";
import { searchLyrics } from "@/lib/lyric-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  return ok(await searchLyrics(q));
}
