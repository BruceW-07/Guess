import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "歌词猜谜",
  description: "每日歌词挑战、无限模式与分享出题",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
