---
name: meow-notifier
description: 用于给 Meow 发送通知的 Skill。当用户要求发送通知到 Meow、手机、或者使用类似"通知我"、"发送消息"等表述时使用此 Skill。
---

# Meow Notifier

## 概述

本 Skill 提供给 Meow 发送推送通知的能力。适用于：
- 用户要求发送通知到手机
- 用户要求发送消息给 Meow
- 用户要求发送提醒或通知

## 核心流程

### 1. 获取 Nickname

按以下优先级获取接收者 nickname：

1. **从上下文/记忆获取**：检查对话历史中是否已提及或确定过 meow_nickname
2. **从环境变量获取**：检查 `MEOW_NICKNAME` 环境变量
3. **提示用户输入**：如果以上都没有，使用 question 工具询问用户

### 2. 发送通知

使用 curl 命令发送 HTTP POST 请求到 API。

#### API 信息

- **URL**: `https://api.chuckfang.com/${nickname}`
- **Method**: POST
- **Content-Type**: application/json

#### 请求参数

| 参数 | 必填 | 说明 |
|------|------|------|
| title | 是 | 通知标题，默认为 "meow-notifier" |
| msg | 是 | 通知消息内容，支持纯文本或 HTML |
| url | 否 | 要包含在通知中的 URL 链接 |
| msgType | 否 | 消息类型：`text`（默认）或 `html` |
| htmlHeight | 否 | HTML 消息高度（像素），仅 msgType="html" 时有效，默认 200 |

#### curl 命令示例

```bash
# 发送简单文本通知
curl -X POST "https://api.chuckfang.com/${nickname}" \
  -H "Content-Type: application/json" \
  -d '{"title": "meow-notifier", "msg": "消息内容"}'

# 发送带 URL 的通知
curl -X POST "https://api.chuckfang.com/${nickname}?url=https://example.com" \
  -H "Content-Type: application/json" \
  -d '{"title": "系统通知", "msg": "查看详情"}'

# 发送 HTML 通知
curl -X POST "https://api.chuckfang.com/${nickname}?msgType=html&htmlHeight=150" \
  -H "Content-Type: application/json" \
  -d '{"title": "HTML 通知", "msg": "<h1>标题</h1><p>内容</p>"}'
```

### 3. 处理结果

- 成功：告知用户通知已发送
- 失败：告知用户错误信息并建议重试

## 使用示例

**场景 1：用户说 "给我手机发通知"**
```
获取 nickname → 构建 curl 命令 → 执行 → 返回结果
```

**场景 2：用户说 "发送 Meow 通知"**
```
从上下文获取 nickname → 构建 curl 命令 → 执行 → 返回结果
```

**场景 3：用户说 "发送 Meow 消息"**
```
检查环境变量 MEOW_NICKNAME → 如有则使用 → 构建 curl 命令 → 执行
```

## 重要提醒

- 使用 curl 命令直接发送 HTTP 请求
- 请求体为 JSON 格式
- msgType 和 htmlHeight 通过 URL query 参数传递
