#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

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
    version: "1.0.0",
});

// 添加发送 Meow 通知的工具
server.tool(
    "send_notification",
    {
        message: z.string().describe("Notification message content"),
    },
    async (params: { message: string }) => {
        const results: string[] = [];
        const errors: string[] = [];

        // 对所有nickname并发发送通知
        const promises = nicknames.map(async (nickname) => {
            try {
                const response = await axios.post(
                    `https://api.chuckfang.com/${nickname}`,
                    {
                        title: "LLM",
                        msg: params.message,
                    }
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

// 启动 stdio 传输
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Meow Notifier MCP server running on stdio");