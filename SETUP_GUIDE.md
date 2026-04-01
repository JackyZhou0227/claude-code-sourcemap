# Claude Code 自定义 API 配置指南

基于还原的 Claude Code v2.1.88 源码，配置使用第三方 API 端点。

---

## 代码修改记录

本次修改仅涉及**登录校验**和**配置扩展**，不涉及任何功能逻辑修改。

### 源码修改 (restored-src/src/)

| 文件 | 行号 | 原代码 | 修改后 | 说明 |
|------|------|--------|--------|------|
| `interactiveHelpers.tsx` | 105 | `process.env.IS_DEMO` | `true` | 跳过主 onboarding |
| `projectOnboardingState.ts` | 70 | `process.env.IS_DEMO` | `true` | 跳过项目 onboarding |
| `preflightChecks.tsx` | 18-69 | 连接检查逻辑 | `return { success: true }` | 跳过 preflight 检查 |
| `model/modelOptions.ts` | 479-485 | - | 新增代码块 | 从 settings 读取模型列表 |
| `settings/types.ts` | 379-390 | - | 新增 schema | `additionalModelOptions` 字段定义 |

### 打包文件修改 (package/cli.js)

#### 1. 跳过 preflight 检查

**位置**: 函数 `InY()` (原 `checkEndpoints`)

**修改前**:
```javascript
async function InY(){try{let q=u7(),K=new URL(q.TOKEN_URL),...
// 省略约 800 字符的连接检查代码
```

**修改后**:
```javascript
async function InY(){return{success:!0}}
```

#### 2. 环境变量优先于配置文件

**位置**: 函数 `jUK()` 和 `xd()` 中的 `Object.assign(process.env, ...)`

**修改前**:
```javascript
Object.assign(process.env,rS6(j8().env))
```

**修改后**:
```javascript
Object.assign(process.env,Object.fromEntries(Object.entries(rS6(j8().env)).filter(([k])=>process.env[k]===undefined)))
```

**效果**: 只有当环境变量未定义时，才从配置文件读取值。

### package.json 修改

**文件**: `package/package.json`

**修改前**:
```json
"scripts": {
  "prepare": "node -e \"if (!process.env.AUTHORIZED) { console.error('ERROR: Direct publishing is not allowed.\\nPlease see the release workflow documentation to publish this package.'); process.exit(1); }\""
}
```

**修改后**:
```json
"scripts": {
  "prepare": "echo 'Ready'"
}
```

**效果**: 允许通过 `npm link` 进行本地全局安装。

### 补丁脚本

| 文件 | 用途 |
|------|------|
| `package/patch.cjs` | 对 `cli.js` 应用 preflight 跳过补丁 |
| `package/patch-env.cjs` | 对 `cli.js` 应用环境变量优先补丁 |

---

## 快速开始

### 1. 应用补丁

```powershell
cd package
node patch.cjs
node patch-env.cjs
```

### 2. 全局安装

```powershell
cd package
npm link
```

验证安装：

```powershell
claude --version
# 输出: 2.1.88 (Claude Code)
```

### 3. 配置环境变量

**方式一：系统环境变量（推荐）**

```powershell
# PowerShell 运行（无需管理员）
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "你的API密钥", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "https://你的API端点", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_MODEL", "glm-5", "User")
[Environment]::SetEnvironmentVariable("CLAUDE_CODE_GIT_BASH_PATH", "D:\develop\Git\bin\bash.exe", "User")
```

**方式二：配置文件**

编辑 `%USERPROFILE%\.claude.json`：

```json
{
  "hasCompletedOnboarding": true,
  "env": {
    "ANTHROPIC_API_KEY": "你的API密钥",
    "ANTHROPIC_BASE_URL": "https://你的API端点",
    "ANTHROPIC_MODEL": "glm-5"
  },
  "additionalModelOptionsCache": [
    { "value": "glm-5", "label": "GLM-5", "description": "智谱 GLM-5 模型" }
  ]
}
```

### 4. 运行

```powershell
claude
```

非交互模式：

```powershell
claude -p "你的问题"
```

---

## 配置详解

### 配置优先级

```
环境变量 > 配置文件
```

这意味着：
- 如果环境变量已设置，配置文件中的值会被忽略
- 如果环境变量未设置，配置文件中的值会生效

### 配置方式一：环境变量

**优点**: 适合临时切换、多环境部署

**设置方式**:

```batch
:: Windows (cmd/bat)
set ANTHROPIC_API_KEY=sk-xxx
set ANTHROPIC_BASE_URL=https://api.example.com
set ANTHROPIC_MODEL=glm-5

:: PowerShell
$env:ANTHROPIC_API_KEY="sk-xxx"
$env:ANTHROPIC_BASE_URL="https://api.example.com"
$env:ANTHROPIC_MODEL="glm-5"

:: Linux/macOS
export ANTHROPIC_API_KEY=sk-xxx
export ANTHROPIC_BASE_URL=https://api.example.com
export ANTHROPIC_MODEL=glm-5
```

### 配置方式二：配置文件

**优点**: 持久化、可配置模型列表

**文件位置**: `%USERPROFILE%\.claude.json` (Windows) 或 `~/.claude.json` (Linux/macOS)

**完整配置示例**:

```json
{
  "hasCompletedOnboarding": true,
  "env": {
    "ANTHROPIC_API_KEY": "你的API密钥",
    "ANTHROPIC_BASE_URL": "https://你的API端点",
    "ANTHROPIC_MODEL": "glm-5"
  },
  "additionalModelOptionsCache": [
    { "value": "glm-5", "label": "GLM-5", "description": "智谱 GLM-5 模型" },
    { "value": "glm-4.7", "label": "GLM-4.7", "description": "智谱 GLM-4.7 模型" },
    { "value": "deepseek-v3.2", "label": "DeepSeek V3.2", "description": "DeepSeek V3.2 模型" }
  ]
}
```

**注意**: 由于环境变量优先，如果已在环境变量中设置，配置文件中的 `env` 字段会被忽略。

### 环境变量完整列表

| 变量名 | 必填 | 说明 | 示例值 |
|--------|------|------|--------|
| `ANTHROPIC_API_KEY` | 是 | API 密钥 | `sk-xxx` 或自定义格式 |
| `ANTHROPIC_BASE_URL` | 是 | API 端点地址 | `https://api.example.com` |
| `ANTHROPIC_MODEL` | 否 | 默认模型 | `glm-5` |
| `CLAUDE_CODE_GIT_BASH_PATH` | Windows 必填 | Git Bash 路径 | `D:\develop\Git\bin\bash.exe` |

### 模型列表配置

模型列表只能在配置文件中设置，用于 `/model` 命令显示可选项。

```json
{
  "additionalModelOptionsCache": [
    {
      "value": "模型ID",
      "label": "显示名称",
      "description": "模型描述（可选）"
    }
  ]
}
```

**示例**:

```json
{
  "additionalModelOptionsCache": [
    { "value": "glm-5", "label": "GLM-5", "description": "智谱 GLM-5 模型" },
    { "value": "glm-4.7", "label": "GLM-4.7", "description": "智谱 GLM-4.7 模型" },
    { "value": "deepseek-v3.2", "label": "DeepSeek V3.2", "description": "DeepSeek V3.2 模型" },
    { "value": "deepseek-v3.2-thinking", "label": "DeepSeek V3.2 Thinking", "description": "DeepSeek V3.2 思维链模型" },
    { "value": "kimi-k2.5", "label": "Kimi K2.5", "description": "月之暗面 Kimi K2.5 模型" },
    { "value": "minimax-m2.7", "label": "MiniMax M2.7", "description": "MiniMax M2.7 模型" }
  ]
}
```

---

## 问题排查

### 问题 1: "Unable to connect to Anthropic services"

**原因**: 原版会检查 `api.anthropic.com` 连接。

**解决**: 确保已运行 `node patch.cjs` 应用补丁。

### 问题 2: "requires git-bash"

**原因**: Windows 上需要 Git Bash 执行 shell 命令。

**解决**: 设置 `CLAUDE_CODE_GIT_BASH_PATH` 指向 `bash.exe` 完整路径。

### 问题 3: "Invalid URL"

**原因**: `ANTHROPIC_BASE_URL` 未设置或格式错误。

**解决**: 确保设置了正确的 API 端点地址，包含 `https://` 前缀。

### 问题 4: 模型列表未显示

**原因**: 配置文件位置错误或格式错误。

**解决**: 
1. 确认配置文件位于 `%USERPROFILE%\.claude.json`
2. 确认 JSON 格式正确
3. 确认 `additionalModelOptionsCache` 字段存在

### 问题 5: API Error: 模型不可用

**原因**: 使用的模型在 API 端点不存在。

**解决**: 使用 `--model` 参数或 `/model` 命令切换到可用模型。

---

## 文件结构

```
claude-code-sourcemap/
├── SETUP_GUIDE.md           # 本文档
├── AGENTS.md                # AI 编码代理指南
├── package/
│   ├── cli.js               # 打包后的 CLI (已打补丁)
│   ├── claude.bat           # Windows 启动脚本
│   ├── patch.cjs            # preflight 补丁脚本
│   └── patch-env.cjs        # 环境变量优先补丁脚本
└── restored-src/src/        # 还原的源码
    ├── interactiveHelpers.tsx
    ├── projectOnboardingState.ts
    └── utils/
        ├── preflightChecks.tsx
        └── model/
            └── modelOptions.ts
```
