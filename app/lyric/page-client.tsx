"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { todayKey } from "@/lib/date";
import { flattenParagraphs, isChineseChar, uniqueChineseChars } from "@/lib/normalize";
import type { DailyProgress, LyricPuzzle, WalletState } from "@/lib/types";

type ShareDetail = {
  id: number;
  lyric: LyricPuzzle;
  description?: string;
  successCount: number;
  user: {
    userId: string;
    userName: string;
  };
};

type SearchItem = {
  id: string;
  title: string;
  author: string;
};

type Mode = "daily" | "infinity";

const STORAGE_PREFIX = "lyricHistory1_";

function toDateInputValue(value: string) {
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function fromDateInputValue(value: string) {
  return value.replaceAll("-", "");
}

function buildStorageKey(date: string, author: string) {
  return `${STORAGE_PREFIX}${date}_${author}`;
}

function renderChars(text: string, revealed: Set<string>, answerChars: Set<string>) {
  return [...text].map((char, index) => {
    if (!isChineseChar(char)) {
      return (
        <span key={`${char}-${index}`} className={styles.revealedChar}>
          {char}
        </span>
      );
    }

    const isRevealed = revealed.has(char);
    const isTarget = answerChars.has(char);

    return (
      <span
        key={`${char}-${index}`}
        className={isRevealed ? styles.revealedChar : styles.hiddenChar}
        data-target={isTarget ? "true" : "false"}
      >
        {isRevealed ? char : ""}
      </span>
    );
  });
}

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const data = (await response.json()) as {
    success: boolean;
    data: T | null;
    errorCode?: string;
    errorMessage?: string;
  };

  if (!data.success || data.data === null) {
    throw new Error(data.errorMessage ?? "请求失败");
  }

  return data.data;
}

export function LyricPageClient() {
  const searchParams = useSearchParams();
  const rawShareId = searchParams.get("shareId");
  const shareId = rawShareId ? Number(rawShareId) : null;

  const [mode, setMode] = useState<Mode>("daily");
  const [date, setDate] = useState(todayKey());
  const [authorFilter, setAuthorFilter] = useState("");
  const [authorInput, setAuthorInput] = useState("");
  const [authors, setAuthors] = useState<string[]>([]);
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [puzzle, setPuzzle] = useState<LyricPuzzle | null>(null);
  const [shareDetail, setShareDetail] = useState<ShareDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [revealedSet, setRevealedSet] = useState<Set<string>>(new Set());
  const [wrongSet, setWrongSet] = useState<Set<string>>(new Set());
  const [guessCount, setGuessCount] = useState(0);
  const [correct, setCorrect] = useState(false);
  const [vipError, setVipError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showShareCreate, setShowShareCreate] = useState(false);
  const [shareKeyword, setShareKeyword] = useState("");
  const [shareSearchResults, setShareSearchResults] = useState<SearchItem[]>([]);
  const [shareSelected, setShareSelected] = useState<SearchItem | null>(null);
  const [shareDescription, setShareDescription] = useState("");
  const [shareCreatedUrl, setShareCreatedUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [restorePrompt, setRestorePrompt] = useState<DailyProgress | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const existingSession = window.localStorage.getItem("share-success-session");
    if (existingSession) {
      setSessionId(existingSession);
      return;
    }

    const nextSession = crypto.randomUUID();
    window.localStorage.setItem("share-success-session", nextSession);
    setSessionId(nextSession);
  }, []);

  const bodyCharacters = useMemo(() => {
    if (!puzzle) {
      return [];
    }

    return uniqueChineseChars(flattenParagraphs(puzzle.content.paragraphs));
  }, [puzzle]);

  const answerCharacters = useMemo(() => {
    if (!puzzle) {
      return new Set<string>();
    }

    return new Set(uniqueChineseChars(puzzle.title));
  }, [puzzle]);

  const activeStorageKey = useMemo(() => buildStorageKey(date, authorFilter), [date, authorFilter]);

  useEffect(() => {
    fetchJson<string[]>("/api/lyric/authors")
      .then(setAuthors)
      .catch(() => undefined);

    fetchJson<WalletState>("/api/me/wallet")
      .then(setWallet)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (shareId) {
      setLoading(true);
      fetchJson<ShareDetail>(`/api/lyric/share/${shareId}`)
        .then((detail) => {
          setShareDetail(detail);
          setPuzzle(detail.lyric);
          setCorrect(false);
          setGuessCount(0);
          setRevealedSet(new Set());
          setWrongSet(new Set());
          setVipError(null);
          setMessage(null);
        })
        .catch((error: Error) => {
          setMessage(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    const fetchPuzzle = async () => {
      setLoading(true);
      setVipError(null);
      setMessage(null);

      try {
        const url =
          mode === "daily"
            ? `/api/lyric/daily?date=${date}`
            : `/api/lyric/infinity?author=${encodeURIComponent(authorFilter)}`;
        const nextPuzzle = await fetchJson<LyricPuzzle>(url);
        setPuzzle(nextPuzzle);
        setCorrect(false);
        setGuessCount(0);
        setRevealedSet(new Set());
        setWrongSet(new Set());

        if (mode === "daily") {
          const raw = window.localStorage.getItem(activeStorageKey);
          if (raw) {
            const progress = JSON.parse(raw) as DailyProgress;
            if (progress.guessCount > 0) {
              setRestorePrompt(progress);
            }
          }
        }
      } catch (error) {
        const messageText = error instanceof Error ? error.message : "题目加载失败";
        if (messageText.includes("会员")) {
          setVipError(messageText);
        } else {
          setMessage(messageText);
        }
        setPuzzle(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchPuzzle();
  }, [mode, date, authorFilter, shareId, activeStorageKey]);

  useEffect(() => {
    if (!correct || !shareId || !sessionId) {
      return;
    }

    void fetch(`/api/lyric/share/${shareId}/success`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).then(async (response) => {
      const payload = await response.json();
      if (payload.success && shareDetail) {
        setShareDetail({
          ...shareDetail,
          successCount: payload.data.successCount,
        });
      }
    });
  }, [correct, shareId, sessionId, shareDetail]);

  useEffect(() => {
    if (mode !== "daily" || shareId || !puzzle) {
      return;
    }

    const progress: DailyProgress = {
      date,
      guessCount,
      rightSet: [...revealedSet],
      wrongSet: [...wrongSet],
      correct,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };

    window.localStorage.setItem(activeStorageKey, JSON.stringify(progress));
  }, [mode, date, shareId, puzzle, activeStorageKey, guessCount, revealedSet, wrongSet, correct]);

  const revealSuccess = (nextRevealed: Set<string>) => {
    if (!puzzle) {
      return;
    }

    const done = [...answerCharacters].every((char) => nextRevealed.has(char));
    if (!done) {
      return;
    }

    setCorrect(true);
    setMessage(`恭喜猜对，当前共猜了 ${guessCount + 1} 次。`);
    void fetch("/api/lyric/guess/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: puzzle.title }),
    });
  };

  const submitGuess = () => {
    if (!puzzle || correct) {
      return;
    }

    const chars = uniqueChineseChars(inputValue);
    if (chars.length === 0 || chars.length > 10) {
      setMessage("请输入 1 到 10 个汉字。");
      return;
    }

    const freshChars = chars.filter((char) => !revealedSet.has(char) && !wrongSet.has(char));
    if (freshChars.length === 0) {
      setMessage("这些字你都猜过了。");
      setInputValue("");
      return;
    }

    const nextRevealed = new Set(revealedSet);
    const nextWrong = new Set(wrongSet);

    for (const char of freshChars) {
      if (bodyCharacters.includes(char) || answerCharacters.has(char) || puzzle.author.includes(char)) {
        nextRevealed.add(char);
      } else {
        nextWrong.add(char);
      }
    }

    setGuessCount((value) => value + freshChars.length);
    setRevealedSet(nextRevealed);
    setWrongSet(nextWrong);
    setInputValue("");
    setMessage(nextWrong.size > wrongSet.size ? "猜测的字不在歌词中。" : null);
    revealSuccess(nextRevealed);
  };

  const useHint = async () => {
    if (!puzzle || correct) {
      return;
    }

    const candidates = bodyCharacters.filter(
      (char) => !revealedSet.has(char) && !answerCharacters.has(char) && !puzzle.author.includes(char),
    );

    if (candidates.length === 0) {
      setMessage("已经没有可揭示的正文文字了。");
      return;
    }

    try {
      const nextWallet = await fetchJson<WalletState>("/api/lyric/hint/consume", {
        method: "POST",
      });
      setWallet(nextWallet);
      const nextRevealed = new Set(revealedSet);
      nextRevealed.add(candidates[Math.floor(Math.random() * candidates.length)]);
      setRevealedSet(nextRevealed);
      setMessage("已消耗 1 宝石并揭示一个正文文字。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "提示失败");
    }
  };

  const searchShareLyrics = async () => {
    if (!shareKeyword.trim()) {
      setShareSearchResults([]);
      return;
    }

    try {
      const results = await fetchJson<SearchItem[]>(
        `/api/lyric/share/search?q=${encodeURIComponent(shareKeyword.trim())}`,
      );
      setShareSearchResults(results);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "搜索失败");
    }
  };

  const createShare = async () => {
    if (!shareSelected) {
      setMessage("请先选择一首歌。");
      return;
    }

    try {
      const result = await fetchJson<{ shareId: number }>("/api/lyric/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lyricId: shareSelected.id,
          description: shareDescription.trim() || undefined,
        }),
      });

      const url = `${window.location.origin}/lyric?shareId=${result.shareId}`;
      setShareCreatedUrl(url);
      await navigator.clipboard.writeText(url);
      setMessage("分享链接已生成并复制。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建分享失败");
    }
  };

  const shareResult = async () => {
    if (!puzzle) {
      return;
    }

    const resultText = shareId
      ? `「歌词猜谜」出题挑战\n猜测 ${guessCount} 次\n${window.location.origin}/lyric?shareId=${shareId}`
      : `「歌词猜谜」${date}\n猜测 ${guessCount} 次\n${window.location.origin}/lyric`;

    await navigator.clipboard.writeText(resultText);
    setMessage("成绩文案已复制。");
  };

  const loadNextInfinity = () => {
    setMode("infinity");
    setAuthorFilter(authorInput.trim());
  };

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{shareId ? "分享挑战" : "每日歌词挑战"}</p>
            <h1 className={styles.title}>歌词猜谜</h1>
            <p className={styles.desc}>
              {shareId
                ? "猜出第一行歌名即可通关。"
                : "每天北京时间 0 点更新；每次可提交 1 到 10 个汉字，猜出歌名即可通关。"}
            </p>
          </div>
          <div className={styles.wallet}>
            <span>宝石 {wallet?.gems ?? "-"}</span>
            <span>会员 {wallet?.subscriptionStatus === "vip" ? "已开通" : "未开通"}</span>
          </div>
        </header>

        {!shareId && (
          <section className={styles.toolbar}>
            <div className={styles.segment}>
              <button
                className={mode === "daily" ? styles.segmentActive : styles.segmentButton}
                onClick={() => setMode("daily")}
                type="button"
              >
                每日
              </button>
              <button
                className={mode === "infinity" ? styles.segmentActive : styles.segmentButton}
                onClick={() => setMode("infinity")}
                type="button"
              >
                无限
              </button>
            </div>

            {mode === "daily" ? (
              <label className={styles.datePicker}>
                <span>日期</span>
                <input
                  type="date"
                  value={toDateInputValue(date)}
                  onChange={(event) => setDate(fromDateInputValue(event.target.value))}
                />
              </label>
            ) : (
              <div className={styles.infinityControls}>
                <input
                  value={authorInput}
                  onChange={(event) => setAuthorInput(event.target.value)}
                  placeholder="输入歌手名，多个用逗号分隔"
                />
                <button type="button" onClick={loadNextInfinity}>
                  开始/下一首
                </button>
              </div>
            )}

            <button className={styles.secondaryButton} type="button" onClick={() => setShowShareCreate(true)}>
              出题分享
            </button>
          </section>
        )}

        {mode === "infinity" && !shareId && authors.length > 0 && (
          <section className={styles.authorList}>
            <span>常用歌手</span>
            <div className={styles.chips}>
              {authors.map((author) => (
                <button
                  key={author}
                  className={styles.chip}
                  type="button"
                  onClick={() => setAuthorInput(author)}
                >
                  {author}
                </button>
              ))}
            </div>
          </section>
        )}

        {shareDetail && (
          <section className={styles.shareMeta}>
            <p>创建者：{shareDetail.user.userName}</p>
            {shareDetail.description ? <p>提示：{shareDetail.description}</p> : null}
            <p>已有 {shareDetail.successCount} 人猜对</p>
          </section>
        )}

        {vipError ? <div className={styles.vipNotice}>{vipError}</div> : null}
        {message ? <div className={styles.message}>{message}</div> : null}

        <section className={styles.board}>
          {loading ? <div className={styles.loading}>加载中…</div> : null}

          {!loading && puzzle ? (
            <>
              <div className={styles.scorebar}>
                <span>猜测次数 {guessCount}</span>
                <span>{correct ? "挑战成功" : "未完成"}</span>
              </div>

              <div className={styles.lyricBlock}>
                <div className={styles.line}>
                  {renderChars(puzzle.title, revealedSet, answerCharacters)}
                </div>
                <div className={styles.line}>
                  {renderChars(puzzle.author, revealedSet, answerCharacters)}
                </div>
                {puzzle.content.paragraphs.map((group, index) => (
                  <div className={styles.paragraph} key={`${puzzle.id}-${index}`}>
                    {group.map((line, lineIndex) => (
                      <div className={styles.line} key={`${line}-${lineIndex}`}>
                        {renderChars(line, revealedSet, answerCharacters)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {wrongSet.size > 0 ? (
                <div className={styles.wrongGuesses}>
                  猜错的字：{[...wrongSet].join("、")}
                </div>
              ) : null}

              {!correct ? (
                <div className={styles.inputBar}>
                  <input
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    placeholder="输入 1 到 10 个汉字"
                    maxLength={10}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        submitGuess();
                      }
                    }}
                  />
                  <button type="button" onClick={submitGuess}>
                    猜
                  </button>
                  {mode === "infinity" && !shareId ? (
                    <button type="button" className={styles.secondaryButton} onClick={useHint}>
                      提示(1宝石)
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className={styles.successBar}>
                  <strong>恭喜，你猜出了歌名。</strong>
                  <button type="button" onClick={shareResult}>
                    分享成绩
                  </button>
                </div>
              )}
            </>
          ) : null}
        </section>
      </section>

      {restorePrompt ? (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>恢复进度</h3>
            <p>
              检测到 {restorePrompt.date} 的本地进度，共猜测 {restorePrompt.guessCount} 次。
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  window.localStorage.removeItem(activeStorageKey);
                  setRestorePrompt(null);
                }}
              >
                重新开始
              </button>
              <button
                type="button"
                onClick={() => {
                  setGuessCount(restorePrompt.guessCount);
                  setRevealedSet(new Set(restorePrompt.rightSet));
                  setWrongSet(new Set(restorePrompt.wrongSet));
                  setCorrect(restorePrompt.correct);
                  setRestorePrompt(null);
                }}
              >
                恢复
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showShareCreate ? (
        <div className={styles.overlay}>
          <div className={styles.modalWide}>
            <div className={styles.modalHeader}>
              <h3>出题分享</h3>
              <button type="button" className={styles.closeButton} onClick={() => setShowShareCreate(false)}>
                关闭
              </button>
            </div>
            <p className={styles.modalText}>按歌名或歌手搜索一首歌，生成分享链接给朋友猜。</p>
            <div className={styles.shareSearchRow}>
              <input
                value={shareKeyword}
                onChange={(event) => setShareKeyword(event.target.value)}
                placeholder="例如：稻香 / 周杰伦"
              />
              <button type="button" onClick={searchShareLyrics}>
                搜索
              </button>
            </div>

            <div className={styles.searchList}>
              {shareSearchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    shareSelected?.id === item.id ? styles.searchItemActive : styles.searchItem
                  }
                  onClick={() => setShareSelected(item)}
                >
                  <strong>{item.title}</strong>
                  <span>{item.author}</span>
                </button>
              ))}
            </div>

            <textarea
              value={shareDescription}
              onChange={(event) => setShareDescription(event.target.value)}
              maxLength={100}
              rows={3}
              placeholder="可选提示，最多 100 字"
            />

            {shareCreatedUrl ? (
              <div className={styles.shareCreatedBox}>
                <span>已生成：</span>
                <code>{shareCreatedUrl}</code>
              </div>
            ) : null}

            <div className={styles.modalActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setShowShareCreate(false)}>
                取消
              </button>
              <button type="button" onClick={createShare}>
                创建并复制
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
