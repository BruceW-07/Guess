@echo off
setlocal enabledelayedexpansion

echo ===========================================
echo   🎵 歌词猜谜 - 环境检查
echo ===========================================

set MISSING=0

:: ---- Node.js ----
echo.
echo Node.js
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
    echo   [√] node !NODE_VER!
) else (
    echo   [×] 未安装
    echo     安装: https://nodejs.org
    set MISSING=1
)

:: ---- Rust ----
echo.
echo Rust
where rustc >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%i in ('rustc --version') do set RUST_VER=%%i
    echo   [√] rustc !RUST_VER!
    where cargo >nul 2>&1
    if %errorlevel% equ 0 (
        for /f "tokens=2" %%i in ('cargo --version') do set CARGO_VER=%%i
        echo   [√] cargo !CARGO_VER!
    )
) else (
    echo   [×] 未安装
    echo     安装: https://rustup.rs
    echo     推荐选 MSVC 工具链（需要 Visual Studio Build Tools）
    set MISSING=1
)

:: ---- WebView2 ----
echo.
echo WebView2
reg query "HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" >nul 2>&1
if %errorlevel% equ 0 (
    echo   [√] WebView2 Evergreen 已安装
) else (
    reg query "HKLM\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [√] WebView2 Evergreen 已安装
    ) else (
        echo   [!] 建议安装 WebView2
        echo     下载: https://developer.microsoft.com/microsoft-edge/webview2/
    )
)

:: ---- git ----
echo.
echo Git
where git >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=3" %%i in ('git --version') do echo   [√] git %%i
) else (
    echo   [!] 建议安装: https://git-scm.com
)

:: ---- 结果 ----
echo.
echo ===========================================
if %MISSING% equ 0 (
    echo   √ 环境就绪，开始编译...
    echo ===========================================
    echo.
    echo 安装 npm 依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo   × 依赖安装失败
        pause
        exit /b 1
    )
    echo.
    echo 编译桌面应用...
    call npx tauri build
    if %errorlevel% neq 0 (
        echo.
        echo ===========================================
        echo   × 编译失败
        echo   常见问题:
        echo   1. 缺少 Visual Studio Build Tools
        echo      下载: https://visualstudio.microsoft.com/visual-cpp-build-tools/
        echo      安装时选 "MSVC v143" + "Windows 11 SDK"
        echo   2. 如果用的 GNU 工具链，检查 MinGW 版本
        echo      下载: https://github.com/niXman/mingw-builds-binaries/releases
        echo ===========================================
        pause
        exit /b 1
    )
    echo.
    echo ===========================================
    echo   √ 编译成功！
    echo.
    echo   安装包: src-tauri\target\release\bundle\nsis\LyricQuiz_Setup.exe
    echo ===========================================
) else (
    echo   × 缺少依赖，请先安装上述组件
    echo ===========================================
)
pause
