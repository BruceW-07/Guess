"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import { todayKey } from "@/lib/date";
import { flattenParagraphs, isChineseChar, uniqueChineseChars } from "@/lib/normalize";
import type { DailyProgress, LyricPuzzle } from "@/lib/types";

type Mode = "daily" | "random" | "author";

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

function isAsciiLetter(char: string) {
  return /^[a-z]$/i.test(char);
}

function renderChars(
  text: string,
  revealed: Set<string>,
  answerChars: Set<string>,
  showAll: boolean,
) {
  const nodes: React.ReactNode[] = [];
  let plainBuffer = "";
  let wordBuffer = "";

  const flushWordBuffer = (index: number) => {
    if (!wordBuffer) {
      return;
    }

    nodes.push(
      <span
        key={`word-${index}-${wordBuffer.toLowerCase()}`}
        className={showAll ? styles.plainChar : styles.hiddenWord}
        style={showAll ? undefined : { width: `${Math.max(wordBuffer.length, 2) * 0.8}em` }}
      >
        {showAll ? wordBuffer : ""}
      </span>,
    );
    wordBuffer = "";
  };

  const flushPlainBuffer = (index: number) => {
    if (!plainBuffer) {
      return;
    }

    nodes.push(
      <span key={`plain-${index}-${plainBuffer}`} className={styles.plainChar}>
        {plainBuffer}
      </span>,
    );
    plainBuffer = "";
  };

  [...text].forEach((char, index) => {
    if (isAsciiLetter(char)) {
      flushPlainBuffer(index);
      wordBuffer += char;
      return;
    }

    flushWordBuffer(index);

    if (!isChineseChar(char)) {
      plainBuffer += char;
      return;
    }

    flushPlainBuffer(index);

    const isRevealed = revealed.has(char);
    const isTarget = answerChars.has(char);
    const className = isRevealed
      ? styles.revealedChar
      : showAll
        ? styles.completedChar
        : styles.hiddenChar;

    nodes.push(
      <span
        key={`${char}-${index}`}
        className={className}
        data-target={isTarget ? "true" : "false"}
      >
        {isRevealed || showAll ? char : ""}
      </span>,
    );
  });

  flushWordBuffer(text.length);
  flushPlainBuffer(text.length);

  return nodes;
}

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const data = (await response.json()) as {
    success: boolean;
    data: T | null;
    errorMessage?: string;
  };

  if (!data.success || data.data === null) {
    throw new Error(data.errorMessage ?? "请求失败");
  }

  return data.data;
}

export function LyricPageClient() {
  const [mode, setMode] = useState<Mode>("daily");
  const [date, setDate] = useState(todayKey());
  const [authorFilter, setAuthorFilter] = useState("");
  const [authorInput, setAuthorInput] = useState("");
  const [round, setRound] = useState(0);
  const [excludeId, setExcludeId] = useState<string | null>(null);
  const [authors, setAuthors] = useState<string[]>([]);
  const [puzzle, setPuzzle] = useState<LyricPuzzle | null>(null);
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [revealedSet, setRevealedSet] = useState<Set<string>>(new Set());
  const [wrongSet, setWrongSet] = useState<Set<string>>(new Set());
  const [guessCount, setGuessCount] = useState(0);
  const [correct, setCorrect] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [restorePrompt, setRestorePrompt] = useState<DailyProgress | null>(null);

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
  }, []);

  useEffect(() => {
    const fetchPuzzle = async () => {
      setLoading(true);
      setMessage(null);
      setLoadedStorageKey(null);

      try {
        const url = (() => {
          if (mode === "daily") {
            return `/api/lyric/daily?date=${date}`;
          }

          const params = new URLSearchParams({
            author: mode === "author" ? authorFilter : "",
          });

          if (excludeId) {
            params.set("excludeId", excludeId);
          }

          return `/api/lyric/infinity?${params.toString()}`;
        })();
        const nextPuzzle = await fetchJson<LyricPuzzle>(url);
        setPuzzle(nextPuzzle);
        setLoadedStorageKey(mode === "daily" ? activeStorageKey : null);
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
            } else {
              setRestorePrompt(null);
            }
          } else {
            setRestorePrompt(null);
          }
        } else {
          setRestorePrompt(null);
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "题目加载失败");
        setPuzzle(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchPuzzle();
  }, [mode, date, authorFilter, activeStorageKey, excludeId, round]);

  useEffect(() => {
    if (mode !== "daily" || !puzzle || loadedStorageKey !== activeStorageKey) {
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
  }, [mode, date, puzzle, activeStorageKey, loadedStorageKey, guessCount, revealedSet, wrongSet, correct]);

  const revealSuccess = (nextRevealed: Set<string>, addedGuessCount: number) => {
    if (!puzzle) {
      return;
    }

    const done = [...answerCharacters].every((char) => nextRevealed.has(char));
    if (!done) {
      return;
    }

    setCorrect(true);
    setMessage(`恭喜猜对，当前共猜了 ${addedGuessCount} 次。`);
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

    const nextGuessCount = guessCount + freshChars.length;

    setGuessCount(nextGuessCount);
    setRevealedSet(nextRevealed);
    setWrongSet(nextWrong);
    setInputValue("");
    setMessage(nextWrong.size > wrongSet.size ? "猜测的字不在歌词中。" : null);
    revealSuccess(nextRevealed, nextGuessCount);
  };

  const shareResult = async () => {
    const resultText = `「歌词猜谜」${date}\n猜测 ${guessCount} 次\n${window.location.origin}/lyric`;
    await navigator.clipboard.writeText(resultText);
    setMessage("成绩文案已复制。");
  };

  const loadRandomPuzzle = () => {
    setExcludeId(puzzle?.id ?? null);
    setMode("random");
    setAuthorFilter("");
    setRound((value) => value + 1);
  };

  const loadAuthorPuzzle = () => {
    setExcludeId(puzzle?.id ?? null);
    setMode("author");
    setAuthorFilter(authorInput.trim());
    setRound((value) => value + 1);
  };

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>每日歌词挑战</p>
            <h1 className={styles.title}>歌词猜谜</h1>
            <p className={styles.desc}>
              每天北京时间 0 点更新；也可以切到无限模式随机抽题。每次可提交 1 到 10 个汉字，猜出歌名即可通关。
            </p>
          </div>
        </header>

        <section className={styles.toolbar}>
          <div className={styles.segment}>
            <button
              className={mode === "daily" ? styles.segmentActive : styles.segmentButton}
              onClick={() => {
                setMode("daily");
                setAuthorFilter("");
                setExcludeId(null);
              }}
              type="button"
            >
              每日
            </button>
            <button
              className={mode === "random" ? styles.segmentActive : styles.segmentButton}
              onClick={loadRandomPuzzle}
              type="button"
            >
              随机
            </button>
            <button
              className={mode === "author" ? styles.segmentActive : styles.segmentButton}
              onClick={() => setMode("author")}
              type="button"
            >
              歌手
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
          ) : mode === "random" ? (
            <div className={styles.randomControls}>
              <span>随机出题</span>
              <button type="button" className={styles.primaryButton} onClick={loadRandomPuzzle}>
                下一首
              </button>
            </div>
          ) : (
            <div className={styles.infinityControls}>
              <input
                value={authorInput}
                onChange={(event) => setAuthorInput(event.target.value)}
                placeholder="输入歌手名，多个用逗号分隔"
              />
              <button type="button" className={styles.primaryButton} onClick={loadAuthorPuzzle}>
                下一首
              </button>
            </div>
          )}
        </section>

        {mode === "author" && authors.length > 0 ? (
          <section className={styles.authorList}>
            <span>常用歌手</span>
            <div className={styles.chips}>
              {authors.map((author) => (
                <button
                  key={author}
                  className={styles.chip}
                  type="button"
                  onClick={() => {
                    setAuthorInput(author);
                    setExcludeId(puzzle?.id ?? null);
                    setAuthorFilter(author);
                    setMode("author");
                    setRound((value) => value + 1);
                  }}
                >
                  {author}
                </button>
              ))}
            </div>
          </section>
        ) : null}

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
                  {renderChars(puzzle.title, revealedSet, answerCharacters, correct)}
                </div>
                <div className={styles.line}>
                  {renderChars(puzzle.author, revealedSet, answerCharacters, correct)}
                </div>
                {puzzle.content.paragraphs.map((group, index) => (
                  <div className={styles.paragraph} key={`${puzzle.id}-${index}`}>
                    {group.map((line, lineIndex) => (
                      <div className={styles.line} key={`${line}-${lineIndex}`}>
                        {renderChars(line, revealedSet, answerCharacters, correct)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {wrongSet.size > 0 ? (
                <div className={styles.wrongGuesses}>猜错的字：{[...wrongSet].join("、")}</div>
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
                  <button type="button" className={styles.primaryButton} onClick={submitGuess}>
                    猜
                  </button>
                </div>
              ) : (
                <div className={styles.successBar}>
                  <strong>恭喜，你猜出了歌名。</strong>
                  <button type="button" className={styles.primaryButton} onClick={shareResult}>
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
                className={styles.primaryButton}
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
    </main>
  );
}
