export type LyricContent = {
  paragraphs: string[][];
};

export type LyricEntry = {
  id: string;
  title: string;
  author: string;
  paragraphs: string[][];
};

export type LyricPuzzle = {
  id: string;
  title: string;
  author: string;
  content: LyricContent;
};

export type DailyProgress = {
  date: string;
  guessCount: number;
  rightSet: string[];
  wrongSet: string[];
  correct: boolean;
  createTime: string;
  updateTime: string;
};

export type ApiResult<T> = {
  success: boolean;
  data: T | null;
  errorCode?: string;
  errorMessage?: string;
};
