export function todayKey(now = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now).replaceAll("-", "");
}

export function isoNow(now = new Date()): string {
  return now.toISOString();
}
