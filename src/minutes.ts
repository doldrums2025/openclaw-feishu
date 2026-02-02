import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { createFeishuClient } from "./client.js";
import type { FeishuConfig } from "./types.js";
import type * as Lark from "@larksuiteoapi/node-sdk";
import { FeishuMinutesSchema, type FeishuMinutesParams } from "./minutes-schema.js";
import { resolveToolsConfig } from "./tools-config.js";

// ============ 辅助函数 ============

/**
 * 统一 JSON 响应格式
 */
function json(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    details: data,
  };
}

// ============ 查询功能 ============

/**
 * 获取妙记基本信息
 */
async function getMinute(client: Lark.Client, token: string) {
  try {
    const res = await client.request({
      method: "GET",
      url: `/open-apis/minutes/v1/minutes/${token}`,
    });

    if (res.code !== 0) {
      throw new Error(`获取妙记失败: ${res.msg} (code: ${res.code})`);
    }

    return json({
      minute: res.data,
    });
  } catch (error) {
    // 如果是 404 或 API 不存在的错误，提供友好提示
    if (error instanceof Error && error.message.includes("404")) {
      throw new Error(
        "获取妙记失败: API 不可用或 token 无效。请确认:\n" +
        "1. Token 格式正确（从妙记 URL 中提取）\n" +
        "2. 应用有 minutes:minutes:readonly 权限\n" +
        "3. 妙记存在且可访问"
      );
    }
    throw error;
  }
}

/**
 * 获取妙记统计数据
 */
async function getMinuteStatistics(client: Lark.Client, token: string) {
  try {
    const res = await client.request({
      method: "GET",
      url: `/open-apis/minutes/v1/minutes/${token}/statistics`,
    });

    if (res.code !== 0) {
      throw new Error(`获取统计数据失败: ${res.msg} (code: ${res.code})`);
    }

    return json({
      statistics: res.data,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      throw new Error(
        "获取统计数据失败: API 不可用或 token 无效。\n" +
        "注意: 妙记统计功能可能需要特定权限或企业版功能。"
      );
    }
    throw error;
  }
}

// ============ 主处理函数 ============

async function handleMinutesAction(cfg: FeishuConfig, params: FeishuMinutesParams) {
  const client = createFeishuClient(cfg);

  switch (params.action) {
    case "get":
      return await getMinute(client, params.token);

    case "statistics":
      return await getMinuteStatistics(client, params.token);

    default:
      // @ts-expect-error - exhaustive check
      throw new Error(`Unknown action: ${params.action}`);
  }
}

// ============ 工具注册 ============

export function registerFeishuMinutesTools(api: OpenClawPluginApi) {
  api.registerTool({
    name: "feishu_minutes",
    description: `飞书妙记 (Minutes) 工具 - 查看会议妙记信息

支持操作:
- 获取妙记: 基本信息、元数据
- 统计数据: 参会人员、时长等统计

Token 提取方法:
- 妙记 URL 格式: https://example.feishu.cn/minutes/[token]
- 从 URL 中提取 token 部分即可

注意事项:
- 仅支持只读操作（API 限制）
- 需要 minutes:minutes:readonly 权限
- 某些统计功能可能需要企业版

如需查看妙记内容，建议使用 feishu_doc 工具（妙记内容通常以文档形式存储）`,
    inputSchema: FeishuMinutesSchema,
    isReadOnly: true, // 只读工具
    async call(params: FeishuMinutesParams, context) {
      const channel = context.channel;
      if (channel?.type !== "feishu") {
        throw new Error("此工具仅在飞书渠道中可用");
      }

      const cfg = channel.config as FeishuConfig;
      const toolsConfig = resolveToolsConfig(cfg.tools);

      if (!toolsConfig.minutes) {
        throw new Error("Minutes 工具已被禁用。请在配置中启用 channels.feishu.tools.minutes");
      }

      return await handleMinutesAction(cfg, params);
    },
  });
}
