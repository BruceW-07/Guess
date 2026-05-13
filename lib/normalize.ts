const HAN_RE = /[\u4e00-\u9fff]/;

export function isChineseChar(char: string): boolean {
  return HAN_RE.test(char);
}

export function uniqueChineseChars(input: string): string[] {
  return [...new Set(Array.from(input).filter(isChineseChar))];
}

export function flattenParagraphs(paragraphs: string[][]): string {
  return paragraphs.flat().join("");
}

export function matchesKeyword(value: string, keyword: string): boolean {
  return value.toLowerCase().includes(keyword.trim().toLowerCase());
}
