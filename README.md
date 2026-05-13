# Lyric Quiz

本地可运行的歌词猜谜 MVP，覆盖：

- `/lyric` 每日挑战
- `/lyric` 无限模式
- 本地进度恢复

## Run

```bash
npm install
npm run dev
```

打开 `http://localhost:3000/lyric`。

## Repository

- Local path: `/home/ttt/Projects`
- Remote: `git@github.com:BruceW-07/Guess.git`

## Notes

- 数据源使用 `data/seed/lyrics.json` 示例歌词，不包含真实版权接入。
- 运行时状态保存在 `data/runtime/`。
- 每日进度保存在浏览器 `localStorage`。
- 当前实现是单体 Next.js 应用，后端通过 App Router API routes 提供基础取题接口。
