import { Type, type Static } from "@sinclair/typebox";

/**
 * Feishu Calendar (日历/会议) Tool Schema
 *
 * 支持的操作:
 * 1. list_calendars - 列出日历
 * 2. list_events - 列出日程
 * 3. get_event - 获取日程详情
 * 4. create_event - 创建日程
 * 5. update_event - 更新日程
 * 6. delete_event - 删除日程
 * 7. search_events - 搜索日程
 * 8. get_freebusy - 查询忙闲
 */

export const FeishuCalendarSchema = Type.Union([
  // 1. 列出日历
  Type.Object({
    action: Type.Literal("list_calendars"),
  }),

  // 2. 列出日程
  Type.Object({
    action: Type.Literal("list_events"),
    calendar_id: Type.Optional(
      Type.String({
        description: "日历 ID (可选, 默认使用主日历)",
      })
    ),
    start_time: Type.Optional(
      Type.String({
        description: "开始时间 (格式: YYYY-MM-DD 或 YYYY-MM-DD HH:mm, 默认今天)",
      })
    ),
    end_time: Type.Optional(
      Type.String({
        description: "结束时间 (格式: YYYY-MM-DD 或 YYYY-MM-DD HH:mm, 默认明天)",
      })
    ),
    page_size: Type.Optional(
      Type.Number({
        description: "每页数量 (最小 50, 默认 50, 最大 500)",
      })
    ),
  }),

  // 3. 获取日程详情
  Type.Object({
    action: Type.Literal("get_event"),
    calendar_id: Type.String({ description: "日历 ID" }),
    event_id: Type.String({ description: "日程 ID" }),
  }),

  // 4. 创建日程
  Type.Object({
    action: Type.Literal("create_event"),
    calendar_id: Type.Optional(
      Type.String({
        description: "日历 ID (可选, 默认使用主日历)",
      })
    ),
    summary: Type.String({ description: "日程标题" }),
    description: Type.Optional(Type.String({ description: "日程描述" })),
    start_time: Type.String({
      description: "开始时间 (格式: YYYY-MM-DD HH:mm 或 YYYY-MM-DD 表示全天)",
    }),
    end_time: Type.String({
      description: "结束时间 (格式: YYYY-MM-DD HH:mm 或 YYYY-MM-DD 表示全天)",
    }),
    attendees: Type.Optional(
      Type.String({
        description: "参会人列表 JSON 字符串 (格式: [{\"user_id\":\"ou_xxx\"}])",
      })
    ),
    reminders: Type.Optional(
      Type.String({
        description: "提醒设置 JSON 字符串 (格式: [{\"minutes\":15}])",
      })
    ),
    location: Type.Optional(Type.String({ description: "会议地点" })),
  }),

  // 5. 更新日程
  Type.Object({
    action: Type.Literal("update_event"),
    calendar_id: Type.String({ description: "日历 ID" }),
    event_id: Type.String({ description: "日程 ID" }),
    summary: Type.Optional(Type.String({ description: "日程标题" })),
    description: Type.Optional(Type.String({ description: "日程描述" })),
    start_time: Type.Optional(
      Type.String({
        description: "开始时间 (格式: YYYY-MM-DD HH:mm 或 YYYY-MM-DD)",
      })
    ),
    end_time: Type.Optional(
      Type.String({
        description: "结束时间 (格式: YYYY-MM-DD HH:mm 或 YYYY-MM-DD)",
      })
    ),
    attendees: Type.Optional(
      Type.String({
        description: "参会人列表 JSON 字符串",
      })
    ),
    location: Type.Optional(Type.String({ description: "会议地点" })),
  }),

  // 6. 删除日程
  Type.Object({
    action: Type.Literal("delete_event"),
    calendar_id: Type.String({ description: "日历 ID" }),
    event_id: Type.String({ description: "日程 ID" }),
  }),

  // 7. 搜索日程
  Type.Object({
    action: Type.Literal("search_events"),
    calendar_id: Type.Optional(
      Type.String({
        description: "日历 ID (可选, 默认使用主日历)",
      })
    ),
    query: Type.String({ description: "搜索关键词" }),
    start_time: Type.Optional(
      Type.String({
        description: "开始时间 (格式: YYYY-MM-DD 或 YYYY-MM-DD HH:mm)",
      })
    ),
    end_time: Type.Optional(
      Type.String({
        description: "结束时间 (格式: YYYY-MM-DD 或 YYYY-MM-DD HH:mm)",
      })
    ),
  }),

  // 8. 查询忙闲
  Type.Object({
    action: Type.Literal("get_freebusy"),
    user_id: Type.String({
      description: "用户 open_id (必须, 格式: ou_xxx)",
    }),
    start_time: Type.String({
      description: "开始时间 (格式: YYYY-MM-DD 或 YYYY-MM-DD HH:mm)",
    }),
    end_time: Type.String({
      description: "结束时间 (格式: YYYY-MM-DD 或 YYYY-MM-DD HH:mm)",
    }),
  }),
]);

export type FeishuCalendarParams = Static<typeof FeishuCalendarSchema>;
