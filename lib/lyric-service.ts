import { getDailySchedule, getLyrics } from "@/lib/fs-store";
import { LyricEntry, LyricPuzzle } from "@/lib/types";

function toPuzzle(entry: LyricEntry): LyricPuzzle {
  return {
    id: entry.id,
    title: entry.title,
    author: entry.author,
    content: {
      paragraphs: entry.paragraphs,
    },
  };
}

export async function listAuthors(): Promise<string[]> {
  const lyrics = await getLyrics();
  return [...new Set(lyrics.map((item) => item.author))].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

export async function getDailyPuzzle(date: string) {
  const [lyrics, schedule] = await Promise.all([getLyrics(), getDailySchedule()]);
  const lyricId = schedule[date];
  const entry = lyrics.find((item) => item.id === lyricId);

  if (!entry) {
    return {
      errorCode: "not_found",
      errorMessage: "当天题目不存在",
    };
  }

  return { puzzle: toPuzzle(entry) };
}

export async function getInfinityPuzzle(authorFilter: string) {
  const lyrics = await getLyrics();
  const authors = authorFilter
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const pool = authors.length === 0 ? lyrics : lyrics.filter((item) => authors.includes(item.author));

  if (pool.length === 0) {
    return {
      errorCode: "not_found",
      errorMessage: "没有符合条件的歌曲",
    };
  }

  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { puzzle: toPuzzle(pick) };
}

export async function recordGuessTitle(title: string) {
  const lyrics = await getLyrics();
  return lyrics.some((item) => item.title.trim().toLowerCase() === title.trim().toLowerCase());
}
