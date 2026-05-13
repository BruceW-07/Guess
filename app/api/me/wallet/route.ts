import { ok } from "@/lib/api";
import { getWalletState } from "@/lib/lyric-service";

export async function GET() {
  return ok(await getWalletState());
}
