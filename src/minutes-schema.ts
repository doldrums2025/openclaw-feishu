import { Type, type Static } from "@sinclair/typebox";

/**
 * Feishu Minutes (飞书妙记) Tool Schema
 *
 * 支持的操作:
 * 1. get - 获取妙记基本信息
 * 2. statistics - 获取妙记统计数据
 *
 * 注意: 飞书妙记 API 功能有限，仅支持只读操作
 */

export const FeishuMinutesSchema = Type.Union([
  // 1. 获取妙记信息
  Type.Object({
    action: Type.Literal("get"),
    token: Type.String({
      description: "妙记 token (从妙记 URL 中提取)",
    }),
  }),

  // 2. 获取统计数据
  Type.Object({
    action: Type.Literal("statistics"),
    token: Type.String({
      description: "妙记 token",
    }),
  }),
]);

export type FeishuMinutesParams = Static<typeof FeishuMinutesSchema>;
