@echo off
echo ========================================
echo   🎵 歌词猜谜 - 编译打包
echo ========================================
echo.

:: 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 Node.js，请先安装: https://nodejs.org
    pause
    exit /b 1
)

:: 检查 Rust
where cargo >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 Rust，请先安装: https://rustup.rs
    pause
    exit /b 1
)

echo ✅ Node.js: 已就绪
echo ✅ Rust: 已就绪
echo.

:: 安装依赖
echo 📦 安装 npm 依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

:: 编译 Tauri
echo 🔨 编译桌面应用...
call npx tauri build
if %errorlevel% neq 0 (
    echo ❌ 编译失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ 编译成功！
echo.
echo   安装包: src-tauri\target\release\bundle\nsis\LyricQuiz_Setup.exe
echo ========================================
pause
