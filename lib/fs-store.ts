import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DAILY_SCHEDULE_FILE, RUNTIME_DIR } from "@/lib/constants";
import { todayKey } from "@/lib/date";
import { LyricEntry } from "@/lib/types";
import seedLyrics from "@/data/seed/lyrics.json";

async function ensureRuntimeDir() {
  await mkdir(path.resolve(RUNTIME_DIR), { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path.resolve(filePath), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    await writeJsonFile(filePath, fallback);
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, value: T) {
  await ensureRuntimeDir();
  await writeFile(path.resolve(filePath), JSON.stringify(value, null, 2), "utf8");
}

function buildDefaultSchedule(lyrics: LyricEntry[]) {
  const today = Number(todayKey());
  const schedule: Record<string, string> = {};

  for (let offset = -30; offset <= 30; offset += 1) {
    const date = String(today + offset);
    const lyric = lyrics[Math.abs(offset) % lyrics.length];
    schedule[date] = lyric.id;
  }

  return schedule;
}

export async function getLyrics(): Promise<LyricEntry[]> {
  return seedLyrics as LyricEntry[];
}

export async function getDailySchedule(): Promise<Record<string, string>> {
  const lyrics = await getLyrics();
  return readJsonFile<Record<string, string>>(DAILY_SCHEDULE_FILE, buildDefaultSchedule(lyrics));
}
