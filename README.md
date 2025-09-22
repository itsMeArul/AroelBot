# Aroel Bot

Aroel Bot 是一个基于 Discord.js v14 的多功能 Discord 机器人，专注于用户管理和许可证密钥生成。

## 功能特点

- 🤖 Discord 机器人管理与控制
- 🔑 许可证密钥生成和管理
- 🛡️ HWID（硬件ID）重置功能
- 📊 用户统计信息查询
- 🎮 游戏脚本集成支持
- 👑 管理员权限控制

## 开发命令

- `npm start` 或 `npm run dev` - 启动 Discord 机器人
- `npm run register-commands` - 注册斜杠命令到 Discord（需要 .env 配置）
- `node slashcmd.js` - 替代的命令注册方法

## 系统架构

这是一个基于 Discord.js v14 的机器人，用于 API 用户管理和许可证密钥生成。机器人遵循标准的 Discord.js 命令处理模式，具有模块化组织结构。

### 核心结构

- `index.js` - 主要的机器人入口点，加载命令和事件
- `slashcmd.js` - 用于向 Discord 部署斜杠命令的命令注册工具
- `commands/` - 按功能组织的模块化命令结构：
  - `dev/` - 开发和调试命令
  - `whitelist/` - 用户白名单和许可证管理
  - `purchase/` - 购买相关功能
- `events/` - Discord 事件处理器（interactionCreate, ready）
- `utils/` - 共享工具，主要是 API 客户端

### 命令系统

命令遵循标准的 Discord.js v14 格式：
- `data` 属性包含 SlashCommandBuilder
- `execute(interaction)` 异步函数
- 可选的 `cooldown` 属性（默认 3 秒）

机器人在 `events/interactionCreate.js` 中实现了内置的冷却系统，防止命令垃圾信息。所有命令必须在顶部包含 `require('dotenv').config()` 语句以访问环境变量。

### API 集成

机器人与外部 API（pandadevelopment.net）集成，用于：
- 用户身份验证和密钥管理
- 使用 PelindaJS 库生成许可证密钥
- HWID 重置功能
- 密钥验证和信息检索

关键 API 操作由 `utils/apiClient.js` 处理，它提供用户 CRUD 操作、密钥管理和 API 错误处理方法。许可证密钥生成在 `commands/whitelist/whitelist.js` 中使用 PelindaJS 库实现，具有过期日期和自定义注释。

### 环境配置

需要 `.env` 文件，包含：
- Discord 机器人凭证（TOKEN, CLIENT_ID, GUILD_ID）
- 所有者和客户角色 ID，用于权限管理
- 外部服务集成的 API 密钥

### 安全考虑

- 仅限所有者的命令通过 Discord ID 比较进行保护
- API 密钥和敏感数据存储在环境变量中
- 错误处理包括 API 请求的 try-catch 块
- 敏感操作使用临时响应

### 依赖项

- `discord.js` v14 - 核心 Discord 机器人框架
- `pelindajs` - 许可证密钥生成和管理
- `dotenv` - 环境变量管理
- `node-fetch` - API 请求的 HTTP 客户端

### 命令类别

- **dev/**：开发工具（ping, 重载命令）
- **whitelist/**：用户管理和许可证密钥操作
- **purchase/**：支付信息和购买流程

### 权限系统

- 仅限所有者的命令使用 `interaction.user.id !== process.env.DISCORD_OWNER_ID` 进行授权
- 命令支持临时响应（flags: 64）用于敏感操作
- 某些命令可能需要特定的角色 ID（例如 DISCORD_CUSTOMER_ROLE_ID）
