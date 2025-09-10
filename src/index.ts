#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// 从环境变量获取配置
const MEOW_NICKNAMES = process.env.MEOW_NICKNAMES;
if (!MEOW_NICKNAMES) {
    throw new Error("MEOW_NICKNAMES environment variable is required");
}

// 解析多个nickname（支持逗号分隔或JSON数组格式）
let nicknames: string[] = [];
try {
    // 尝试解析为JSON数组
    nicknames = JSON.parse(MEOW_NICKNAMES);
    if (!Array.isArray(nicknames)) {
        throw new Error("Invalid format");
    }
} catch {
    // 如果不是JSON格式，按逗号分隔处理
    nicknames = MEOW_NICKNAMES.split(',').map(name => name.trim()).filter(name => name.length > 0);
}

if (nicknames.length === 0) {
    throw new Error("At least one nickname must be provided in MEOW_NICKNAMES");
}

console.error(`Configured nicknames: ${nicknames.join(', ')}`);

// 创建 MCP 服务
const server = new McpServer({
    name: "meow-notifier",
    version: version,
});

// 添加发送 Meow 通知的工具
server.tool(
    "send_notification",
    "Send message to phone via system push notification.",
    {
        message: z.string().describe("Notification message content"),
        url: z.string().optional().describe("Optional URL to include in the notification"),
        title: z.string().optional().describe("Optional title for the notification (defaults to 'meow-notifier')"),
        msgType: z.string().optional().describe("Message display type: text (default, plain text), html (render HTML format in App)"),
        htmlHeight: z.number().optional().describe("HTML message height in pixels (only effective when msgType=html, default 200)"),
    },
    async (params: { message: string; url?: string; title?: string; msgType?: string; htmlHeight?: number }) => {
        const results: string[] = [];
        const errors: string[] = [];

        // 对所有nickname并发发送通知
        const promises = nicknames.map(async (nickname) => {
            try {
                // 构建请求体，只包含 title、msg 和 url
                const requestBody: { title: string; msg: string; url?: string } = {
                    title: params.title || "meow-notifier",
                    msg: params.message,
                };

                if (params.url) {
                    requestBody.url = params.url;
                }

                // 构建查询参数
                const url = new URL(`https://api.chuckfang.com/${nickname}`);
                if (params.msgType) {
                    url.searchParams.set("msgType", params.msgType);
                    if (params.msgType === "html" && params.htmlHeight) {
                        url.searchParams.set("htmlHeight", params.htmlHeight.toString());
                    }
                }

                const response = await axios.post(
                    url.toString(),
                    requestBody
                );
                return { nickname, success: true, data: response.data };
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    return {
                        nickname,
                        success: false,
                        error: error.response?.data?.message || error.message
                    };
                } else {
                    return {
                        nickname,
                        success: false,
                        error: error instanceof Error ? error.message : String(error)
                    };
                }
            }
        });

        // 等待所有请求完成
        const responses = await Promise.allSettled(promises);

        // 处理结果
        for (const response of responses) {
            if (response.status === 'fulfilled') {
                const result = response.value;
                if (result.success) {
                    results.push(`✅ ${result.nickname}: ${result.data}`);
                } else {
                    errors.push(`❌ ${result.nickname}: ${result.error}`);
                }
            } else {
                // Promise.allSettled 不应该到达这里，但为了安全起见
                errors.push(`❌ 未知错误: ${response.reason}`);
            }
        }

        // 构建响应消息
        const allMessages = [...results, ...errors];
        const successCount = results.length;
        const totalCount = nicknames.length;

        const summary = `发送完成: ${successCount}/${totalCount} 成功`;
        const detailMessage = allMessages.length > 0 ? `\n\n详细结果:\n${allMessages.join('\n')}` : '';

        return {
            content: [
                {
                    type: "text",
                    text: `${summary}${detailMessage}`,
                },
            ],
            isError: errors.length > 0 && results.length === 0, // 只有全部失败时才标记为错误
        };
    }
);

// 添加提示词资源，引导 LLM 使用 send_notification 工具
server.prompt(
    "send_notification_guide",
    {
        message: z.string().optional().describe("Optional message to customize the prompt"),
    },
    async (params: { message?: string }) => {
        const customMessage = params.message ? ` ${params.message}` : "";

        const promptText = `你是一个智能助手，可以使用 send_notification 工具来发送通知到手机。

${customMessage}

send_notification 工具功能：
- 发送消息到手机上
- 支持可选标题和URL参数
- 返回详细的发送结果

使用场景示例：
1. 发送重要提醒或通知
2. 分享链接或信息到手机
3. 发送任务完成确认
4. 发送错误或警告信息
5. 发送日常提醒

参数说明：
- message: 必需的消息内容
- title: 可选的标题（默认为 "meow-notifier"）
- url: 可选的URL链接
- msgType: 可选的显示类型：text（默认，纯文本显示），html（在App中渲染HTML格式）
- htmlHeight: 可选的HTML高度（像素，仅在msgType=html时生效，默认200）

使用示例：
- 发送简单消息: {"message": "任务已完成"}
- 发送带标题的消息: {"message": "有新消息", "title": "系统通知"}
- 发送带链接的消息: {"message": "查看详情", "url": "https://example.com"}
- 发送HTML消息: {"message": "<h1>标题</h1><p>内容</p>", "msgType": "html", "htmlHeight": 300}

请根据需要使用 send_notification 工具来发送通知。`;

        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: promptText,
                    },
                },
            ],
        };
    }
);

// 启动 stdio 传输
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Meow Notifier MCP server running on stdio");