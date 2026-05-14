# 🎵 歌词猜谜 (Lyric Quiz)

猜歌词桌面应用 —— 每次显示一首歌的歌词片段，猜出歌名即可通关。

- 🎯 **每日挑战** — 每天一道题
- ♾️ **无限模式** — 按歌手筛选，无限刷题
- 🖥️ **跨平台** — Windows / macOS（基于 Tauri，同一份代码）

---

## 🚀 安装

### 方式一：下载安装包

去 [Releases](https://github.com/BruceW-07/Guess/releases) 下载：
- **Windows**: `LyricQuiz_Setup.exe`
- **macOS**: `LyricQuiz.dmg`（拖到 Applications）

仓库现在自带自动发布工作流：
- 推送 `v*` 标签会自动构建并上传这两个安装包
- 也可以在 GitHub Actions 里手动触发 `Release` 工作流发版
- macOS 发布需要先在 GitHub Actions secrets 中配置 `APPLE_ID`、`APPLE_PASSWORD`（App-Specific Password）、`APPLE_TEAM_ID`、`APPLE_CERTIFICATE`、`APPLE_CERTIFICATE_PASSWORD`、`KEYCHAIN_PASSWORD`，否则工作流会拒绝发布未签名的 `dmg`

### 方式二：自行编译

#### 🪟 Windows

需要 [Node.js](https://nodejs.org) + [Rust](https://rustup.rs)（MSVC 工具链）+ [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/)（Win10/11 已自带）

```bash
git clone https://github.com/BruceW-07/Guess.git
cd Guess
build.bat
```

安装包输出目录 → `src-tauri\target\release\bundle\nsis\`

#### 🍎 macOS

需要 [Node.js](https://nodejs.org) + [Rust](https://rustup.rs) + Xcode Command Line Tools

```bash
git clone https://github.com/BruceW-07/Guess.git
cd Guess
./build.sh
```

输出目录 → `src-tauri/target/release/bundle/dmg/`

---

## 🛠️ 开发

```bash
npm install
npm run dev          # 浏览器 → http://localhost:3000/lyric
npm run lint         # ESLint
npm run build        # 构建静态前端到 out/
npx tauri dev        # 桌面应用 + 热重载
npx tauri build      # 桌面打包
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
