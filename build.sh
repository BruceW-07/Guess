#!/usr/bin/env bash
set -euo pipefail

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

PASS="${GREEN}✓${RESET}"
FAIL="${RED}✗${RESET}"
MISSING=0

check() {
    local name="$1"; shift
    if "$@" &>/dev/null; then
        echo -e "  ${PASS} ${name}"
    else
        echo -e "  ${FAIL} ${name}"
        MISSING=1
    fi
}

detect_os() {
    case "$(uname -s)" in
        Darwin) echo "macos" ;;
        Linux)  echo "linux" ;;
        *)      echo "unknown" ;;
    esac
}

OS=$(detect_os)
BUILD_BUNDLE=""

case "$OS" in
    macos) BUILD_BUNDLE="dmg" ;;
    linux) BUILD_BUNDLE="deb,appimage" ;;
esac

echo ""
echo "=========================================="
echo "  🎵 歌词猜谜 - 环境检查"
echo "=========================================="

# ---- Node.js ----
echo -e "\n${BOLD}Node.js${RESET}"
if command -v node &>/dev/null; then
    NODE_VER=$(node -v)
    NODE_MAJOR=$(echo "$NODE_VER" | sed 's/v//' | cut -d. -f1)
    check "node $NODE_VER" true
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "    ${YELLOW}⚠ Node.js >= 18 推荐，当前 $NODE_VER${RESET}"
    fi
else
    echo -e "  ${FAIL} 未安装"
    echo -e "    安装: ${YELLOW}https://nodejs.org${RESET}"
    MISSING=1
fi

# ---- Rust ----
echo -e "\n${BOLD}Rust${RESET}"
if command -v rustc &>/dev/null; then
    check "rustc $(rustc --version | awk '{print $2}')" true
    check "cargo $(cargo --version | awk '{print $2}')" true
else
    echo -e "  ${FAIL} 未安装"
    echo -e "    安装: ${YELLOW}curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh${RESET}"
    MISSING=1
fi

# ---- Platform-specific ----
if [ "$OS" = "macos" ]; then
    echo -e "\n${BOLD}macOS 工具链${RESET}"
    check "Xcode CLI tools" xcode-select -p
    if [ $? -ne 0 ]; then
        echo -e "    安装: ${YELLOW}xcode-select --install${RESET}"
    fi
elif [ "$OS" = "linux" ]; then
    echo -e "\n${BOLD}Linux 系统库${RESET}"
    check "webkit2gtk" pkg-config --exists webkit2gtk-4.1 2>/dev/null
    check "gtk3" pkg-config --exists gtk+-3.0 2>/dev/null
    check "libsoup3" pkg-config --exists libsoup-3.0 2>/dev/null
    if [ "$MISSING" -ne 0 ]; then
        echo -e "    安装 (Ubuntu/Debian): ${YELLOW}sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev${RESET}"
    fi
fi

# ---- 结果 ----
echo ""
echo "=========================================="
if [ "$MISSING" -eq 0 ]; then
    echo -e "  ${GREEN}✅ 环境就绪，开始编译...${RESET}"
    echo "=========================================="
    echo ""
    echo "📦 安装 npm 依赖..."
    npm install
    echo ""
    echo "🔨 编译桌面应用..."
    if [ -n "$BUILD_BUNDLE" ]; then
        npx tauri build --bundles "$BUILD_BUNDLE"
    else
        npx tauri build
    fi
    echo ""
    echo "=========================================="
    echo -e "  ${GREEN}✅ 编译成功！${RESET}"
    case "$OS" in
        macos)
            echo "  macOS: src-tauri/target/release/bundle/dmg/LyricQuiz.dmg"
            echo "         src-tauri/target/release/bundle/macos/LyricQuiz.app"
            ;;
        linux)
            echo "  Linux: src-tauri/target/release/bundle/deb/LyricQuiz.deb"
            echo "         src-tauri/target/release/bundle/appimage/LyricQuiz.AppImage"
            ;;
        *)
            echo "  输出目录: src-tauri/target/release/bundle/"
            ;;
    esac
    echo "=========================================="
else
    echo -e "  ${RED}❌ 缺少依赖，请先安装上述组件${RESET}"
    echo "=========================================="
    exit 1
fi
