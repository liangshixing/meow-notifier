# Meow Notifier MCP Server

一个支持多个nickname的Meow通知MCP服务器，可以作为 MCP 服务器使用，也可以通过 npx 直接运行。

## 功能特性

- 支持配置多个nickname
- 支持JSON数组和逗号分隔两种配置格式
- 一次发送消息到所有配置的nickname
- 详细的发送结果反馈

## 配置方式

### 方式1：JSON数组格式（推荐）

```json
{
    "mcpServers": {
        "meow-notifier": {
            "command": "node",
            "args": ["/path/to/meow-notifier/build/index.js"],
            "env": {
                "MEOW_NICKNAMES": "[\"nickname1\", \"nickname2\", \"nickname3\"]"
            },
            "timeout": 60,
            "alwaysAllow": ["send_notification"]
        }
    }
}
```

### 方式2：逗号分隔格式

```json
{
    "mcpServers": {
        "meow-notifier": {
            "command": "node",
            "args": ["/path/to/meow-notifier/build/index.js"],
            "env": {
                "MEOW_NICKNAMES": "nickname1,nickname2,nickname3"
            },
            "timeout": 60,
            "alwaysAllow": ["send_notification"]
        }
    }
}
```

### 方式3：单个nickname

```json
{
    "mcpServers": {
        "meow-notifier": {
            "command": "node",
            "args": ["/path/to/meow-notifier/build/index.js"],
            "env": {
                "MEOW_NICKNAMES": "single_nickname"
            },
            "timeout": 60,
            "alwaysAllow": ["send_notification"]
        }
    }
}
```

## 安装和使用

### 方式1：通过 npx 直接使用（推荐）

```bash
# 直接运行（需要设置环境变量）
MEOW_NICKNAMES="nickname1,nickname2" npx meow-notifier

# 或者先设置环境变量
export MEOW_NICKNAMES="nickname1,nickname2,nickname3"
npx meow-notifier
```

### 方式2：全局安装

```bash
# 全局安装
npm install -g meow-notifier

# 运行
MEOW_NICKNAMES="nickname1,nickname2" meow-notifier
```

### 方式3：作为 MCP 服务器使用

#### 使用 npx（推荐）

```json
{
    "mcpServers": {
        "meow-notifier": {
            "command": "npx",
            "args": ["meow-notifier"],
            "env": {
                "MEOW_NICKNAMES": "[\"nickname1\", \"nickname2\", \"nickname3\"]"
            },
            "timeout": 60,
            "alwaysAllow": ["send_notification"]
        }
    }
}
```

#### 本地开发使用

1. 安装依赖：
   ```bash
   npm install
   ```

2. 编译项目：
   ```bash
   npm run build
   ```

3. 配置MCP客户端：
   ```json
   {
       "mcpServers": {
           "meow-notifier": {
               "command": "node",
               "args": ["/path/to/meow-notifier/build/index.js"],
               "env": {
                   "MEOW_NICKNAMES": "[\"nickname1\", \"nickname2\", \"nickname3\"]"
               },
               "timeout": 60,
               "alwaysAllow": ["send_notification"]
           }
       }
   }
   ```

4. 使用`send_notification`工具发送消息，消息将自动发送到所有配置的nickname

## 发送结果

发送消息后，会收到详细的结果反馈：

```
发送完成: 2/3 成功

详细结果:
✅ nickname1: success_response
✅ nickname2: success_response  
❌ nickname3: error_message
```

## 注意事项

- 至少需要配置一个nickname
- JSON格式中的双引号需要转义
- 逗号分隔格式会自动去除空格
- 如果所有nickname都发送失败，工具会返回错误状态