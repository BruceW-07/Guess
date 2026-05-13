import { DEFAULT_USER } from "@/lib/constants";
import { getDailySchedule, getLyrics, getShareSuccessMap, getShares, getWallet, saveShareSuccessMap, saveShares, saveWallet } from "@/lib/fs-store";
import { todayKey, isoNow } from "@/lib/date";
import { flattenParagraphs, matchesKeyword } from "@/lib/normalize";
import { LyricEntry, LyricPuzzle, ShareRecord, WalletState } from "@/lib/types";

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
  return [...new Set(lyrics.map((item) => item.author))].sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  );
}

export async function getDailyPuzzle(date: string, wallet?: WalletState) {
  const today = todayKey();

  if (date < today && (wallet ?? (await getWallet())).subscriptionStatus !== "vip") {
    return {
      errorCode: "need_vip",
      errorMessage: "回溯历史挑战需要开通会员",
    };
  }

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

  const pool =
    authors.length === 0
      ? lyrics
      : lyrics.filter((item) => authors.includes(item.author));

  if (pool.length === 0) {
    return {
      errorCode: "not_found",
      errorMessage: "没有符合条件的歌曲",
    };
  }

  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { puzzle: toPuzzle(pick) };
}

export async function searchLyrics(keyword: string) {
  const normalized = keyword.trim();
  if (!normalized) {
    return [];
  }

  const lyrics = await getLyrics();
  return lyrics
    .filter(
      (item) =>
        matchesKeyword(item.title, normalized) || matchesKeyword(item.author, normalized),
    )
    .map((item) => ({
      id: item.id,
      title: item.title,
      author: item.author,
    }))
    .slice(0, 20);
}

export async function createShare(lyricId: string, description?: string) {
  const [lyrics, shares] = await Promise.all([getLyrics(), getShares()]);
  const lyric = lyrics.find((item) => item.id === lyricId);

  if (!lyric) {
    return {
      errorCode: "not_found",
      errorMessage: "歌曲不存在",
    };
  }

  const nextId = shares.length === 0 ? 1 : Math.max(...shares.map((item) => item.id)) + 1;
  const share: ShareRecord = {
    id: nextId,
    lyricId,
    description,
    successCount: 0,
    creator: DEFAULT_USER,
    createdAt: isoNow(),
  };

  shares.push(share);
  await saveShares(shares);

  return { shareId: nextId };
}

export async function getShareDetail(shareId: number) {
  const [lyrics, shares] = await Promise.all([getLyrics(), getShares()]);
  const share = shares.find((item) => item.id === shareId);

  if (!share) {
    return null;
  }

  const lyric = lyrics.find((item) => item.id === share.lyricId);
  if (!lyric) {
    return null;
  }

  return {
    id: share.id,
    lyric: toPuzzle(lyric),
    description: share.description,
    successCount: share.successCount,
    user: share.creator,
  };
}

export async function recordShareSuccess(shareId: number, sessionId: string) {
  const [shares, successMap] = await Promise.all([getShares(), getShareSuccessMap()]);
  const share = shares.find((item) => item.id === shareId);

  if (!share) {
    return {
      errorCode: "not_found",
      errorMessage: "分享不存在",
    };
  }

  const key = String(shareId);
  const sessions = new Set(successMap[key] ?? []);

  if (sessions.has(sessionId)) {
    return { successCount: share.successCount, alreadyRecorded: true };
  }

  sessions.add(sessionId);
  successMap[key] = [...sessions];
  share.successCount += 1;

  await Promise.all([saveShares(shares), saveShareSuccessMap(successMap)]);

  return { successCount: share.successCount, alreadyRecorded: false };
}

export async function consumeHint() {
  const wallet = await getWallet();
  if (wallet.gems <= 0) {
    return {
      errorCode: "insufficient_gems",
      errorMessage: "您的宝石余额不足",
    };
  }

  wallet.gems -= 1;
  await saveWallet(wallet);
  return { wallet };
}

export async function getWalletState() {
  return getWallet();
}

export async function recordGuessTitle(title: string) {
  const lyrics = await getLyrics();
  return lyrics.some(
    (item) => item.title.trim().toLowerCase() === title.trim().toLowerCase(),
  );
}

export async function listRecommendations(excludeId?: string) {
  const lyrics = await getLyrics();
  return lyrics
    .filter((item) => item.id !== excludeId)
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      title: item.title,
      author: item.author,
      preview: flattenParagraphs(item.paragraphs).slice(0, 18),
    }));
}
