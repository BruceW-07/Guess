"use client";

import type { LyricEntry, LyricPuzzle } from "@/lib/types";
import seedLyrics from "@/data/seed/lyrics.json";

const lyrics: LyricEntry[] = seedLyrics as LyricEntry[];

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

export function listAuthors(): string[] {
  return [...new Set(lyrics.map((item) => item.author))].sort((a, b) =>
    a.localeCompare(b, "zh-CN")
  );
}

export function getDailyPuzzle(date: string) {
  // Simple deterministic daily: use date's numeric value to pick
  const today = Number(date);
  const entry = lyrics[today % lyrics.length];

  return toPuzzle(entry);
}

export function getInfinityPuzzle(authorFilter: string, excludeId?: string) {
  const authors = authorFilter
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const pool =
    authors.length === 0
      ? lyrics
      : lyrics.filter((item) => authors.includes(item.author));

  if (pool.length === 0) {
    throw new Error("没有符合条件的歌曲");
  }

  const filteredPool =
    excludeId && pool.length > 1
      ? pool.filter((item) => item.id !== excludeId)
      : pool;

  const pick = filteredPool[Math.floor(Math.random() * filteredPool.length)];
  return toPuzzle(pick);
}

export function checkGuessTitle(title: string): boolean {
  return lyrics.some(
    (item) => item.title.trim().toLowerCase() === title.trim().toLowerCase()
  );
}
