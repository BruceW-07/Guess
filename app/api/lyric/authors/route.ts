import { ok } from "@/lib/api";
import { listAuthors } from "@/lib/lyric-service";

export async function GET() {
  return ok(await listAuthors());
}
