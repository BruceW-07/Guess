# 🎵 歌词猜谜 (Lyric Quiz)

猜歌词桌面应用 —— 每次显示一首歌的歌词片段，猜出歌名即可通关。

- 🎯 **每日挑战** — 每天一道题
- ♾️ **无限模式** — 按歌手筛选，无限刷题
- 💻 **桌面应用** — 基于 Tauri，Windows exe

---

## 🚀 安装

### 方式一：下载安装包（推荐）

去 [Releases](https://github.com/BruceW-07/Guess/releases) 下载最新 `LyricQuiz_Setup.exe`，双击安装。

### 方式二：自行编译

**前置：**
- [Node.js](https://nodejs.org) (v18+)
- [Rust](https://rustup.rs) (stable-x86_64-pc-windows-msvc)
- [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)（Win10/11 通常已自带）

```bash
git clone https://github.com/BruceW-07/Guess.git
cd Guess
npm install
npx tauri build
```

编译完成后，安装包在 `src-tauri\target\release\bundle\nsis\LyricQuiz_Setup.exe`。

---

## 🛠️ 开发

```bash
npm install
npm run dev          # 浏览器打开 http://localhost:3000/lyric
npx tauri dev        # 桌面应用 + 热重载
```

---

## 📁 项目结构

```
Guess/
├── app/lyric/              # 前端页面 (Next.js)
├── lib/lyric-client.ts     # 客户端数据加载
├── data/seed/lyrics.json   # 歌词数据 (7,900+ 首)
├── src-tauri/              # Tauri 桌面应用
└── package.json
```

## 📦 技术栈

- **前端**: Next.js 15 + React 19
- **桌面**: Tauri 2
- **数据**: 静态 JSON（客户端直接加载，无需服务器）

## 👥 贡献者

- [BruceW-07](https://github.com/BruceW-07) — 项目发起人
- [fbz321](https://github.com/fbz321) — 歌词数据 & Tauri 桌面化
