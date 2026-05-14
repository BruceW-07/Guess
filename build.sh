#!/bin/bash
set -e

echo "========================================"
echo "  🎵 歌词猜谜 - 编译打包 (macOS/Linux)"
echo "========================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装: https://nodejs.org"
    exit 1
fi

# 检查 Rust
if ! command -v cargo &> /dev/null; then
    echo "❌ 未找到 Rust，请先安装: https://rustup.rs"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ Rust: $(rustc --version)"
echo ""

# 安装依赖
echo "📦 安装 npm 依赖..."
npm install

# 编译 Tauri
echo "🔨 编译桌面应用..."
npx tauri build

echo ""
echo "========================================"
echo "  ✅ 编译成功！"
echo ""
echo "  macOS: src-tauri/target/release/bundle/dmg/LyricQuiz.dmg"
echo "         src-tauri/target/release/bundle/macos/LyricQuiz.app"
echo "  Linux: src-tauri/target/release/bundle/deb/LyricQuiz.deb"
echo "         src-tauri/target/release/bundle/appimage/LyricQuiz.AppImage"
echo "========================================"
