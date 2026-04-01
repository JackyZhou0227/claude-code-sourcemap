@echo off
REM ============================================
REM Claude Code 自定义 API 启动脚本
REM ============================================

REM API 配置 - 修改为你的真实值
set ANTHROPIC_API_KEY=your-api-key-here
set ANTHROPIC_BASE_URL=https://your-api-endpoint.com
set ANTHROPIC_MODEL=glm-5

REM Windows Git Bash 路径
set CLAUDE_CODE_GIT_BASH_PATH=D:\develop\Git\bin\bash.exe

REM 运行 CLI
node "%~dp0cli.js" %*
