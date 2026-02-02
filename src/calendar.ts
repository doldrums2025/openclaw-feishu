import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { createFeishuClient } from "./client.js";
import type { FeishuConfig } from "./types.js";
import type * as Lark from "@larksuiteoapi/node-sdk";
import { FeishuCalendarSchema, type FeishuCalendarParams } from "./calendar-schema.js";
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

/**
 * 解析 JSON 字符串参数
 */
function parseJsonParam(param: string, paramName: string): any {
  try {
    return JSON.parse(param);
  } catch (error) {
    throw new Error(`Invalid ${paramName}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 解析时间字符串为时间戳（秒）
 * 支持格式:
 * - YYYY-MM-DD (全天)
 * - YYYY-MM-DD HH:mm (精确时间)
 */
function parseTime(timeStr: string): { timestamp?: string; date?: string; isAllDay: boolean } {
  // 检查是否是日期格式 (YYYY-MM-DD)
  const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnlyRegex.test(timeStr)) {
    return {
      date: timeStr,
      isAllDay: true,
    };
  }

  // 解析为时间戳 (YYYY-MM-DD HH:mm)
  const dateTimeRegex = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}):(\d{2})$/;
  const match = timeStr.match(dateTimeRegex);
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}. Expected: YYYY-MM-DD or YYYY-MM-DD HH:mm`);
  }

  const [, date, hour, minute] = match;
  const timestamp = new Date(`${date}T${hour}:${minute}:00+08:00`).getTime() / 1000;

  return {
    timestamp: timestamp.toString(),
    isAllDay: false,
  };
}

/**
 * 获取主日历 ID
 */
async function getPrimaryCalendar(client: Lark.Client): Promise<string> {
  const res = await client.calendar.calendar.list();

  if (res.code !== 0) {
    throw new Error(`获取日历列表失败: ${res.msg} (code: ${res.code})`);
  }

  // 查找主日历 (role: owner)
  const primaryCalendar = res.data?.calendar_list?.find((cal: any) => cal.role === "owner");

  if (primaryCalendar) {
    return primaryCalendar.calendar_id;
  }

  // 如果没有主日历，返回第一个
  if (res.data?.calendar_list && res.data.calendar_list.length > 0) {
    return res.data.calendar_list[0].calendar_id;
  }

  throw new Error("未找到可用的日历");
}

// ============ 查询功能 ============

/**
 * 列出日历
 */
async function listCalendars(client: Lark.Client) {
  const res = await client.calendar.calendar.list();

  if (res.code !== 0) {
    throw new Error(`列出日历失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    calendars: res.data?.calendar_list || [],
    total: res.data?.calendar_list?.length || 0,
  });
}

/**
 * 列出日程
 */
async function listEvents(
  client: Lark.Client,
  calendarId?: string,
  startTime?: string,
  endTime?: string,
  pageSize?: number
) {
  // 如果没有提供 calendar_id，使用主日历
  const calendar = calendarId || (await getPrimaryCalendar(client));

  // 解析时间范围 (默认今天到明天)
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const start = startTime
    ? parseTime(startTime)
    : { timestamp: Math.floor(now.getTime() / 1000).toString(), isAllDay: false };
  const end = endTime
    ? parseTime(endTime)
    : { timestamp: Math.floor(tomorrow.getTime() / 1000).toString(), isAllDay: false };

  const res = await client.calendar.calendarEvent.list({
    path: { calendar_id: calendar },
    params: {
      start_time: start.timestamp,
      end_time: end.timestamp,
      page_size: pageSize || 50,
    },
  });

  if (res.code !== 0) {
    throw new Error(`列出日程失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    calendar_id: calendar,
    events: res.data?.items || [],
    has_more: res.data?.has_more || false,
    page_token: res.data?.page_token,
  });
}

/**
 * 获取日程详情
 */
async function getEvent(client: Lark.Client, calendarId: string, eventId: string) {
  const res = await client.calendar.calendarEvent.get({
    path: {
      calendar_id: calendarId,
      event_id: eventId,
    },
  });

  if (res.code !== 0) {
    throw new Error(`获取日程失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    event: res.data?.event,
  });
}

/**
 * 搜索日程
 */
async function searchEvents(
  client: Lark.Client,
  query: string,
  calendarId?: string,
  startTime?: string,
  endTime?: string
) {
  const calendar = calendarId || (await getPrimaryCalendar(client));

  const filter: any = {};
  if (startTime) {
    const start = parseTime(startTime);
    filter.start_time = start.isAllDay
      ? { date: start.date }
      : { timestamp: start.timestamp, timezone: "Asia/Shanghai" };
  }
  if (endTime) {
    const end = parseTime(endTime);
    filter.end_time = end.isAllDay
      ? { date: end.date }
      : { timestamp: end.timestamp, timezone: "Asia/Shanghai" };
  }

  const res = await client.calendar.calendarEvent.search({
    path: { calendar_id: calendar },
    data: {
      query,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    },
  });

  if (res.code !== 0) {
    throw new Error(`搜索日程失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    calendar_id: calendar,
    events: res.data?.items || [],
    total: res.data?.items?.length || 0,
  });
}

/**
 * 查询忙闲
 */
async function getFreebusy(
  client: Lark.Client,
  startTime: string,
  endTime: string,
  userId?: string
) {
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  if (!userId) {
    throw new Error('user_id is required. Please provide a valid open_id (format: ou_xxx)');
  }

  const res = await client.calendar.freebusy.list({
    data: {
      time_min: new Date(parseInt(start.timestamp || "0") * 1000).toISOString(),
      time_max: new Date(parseInt(end.timestamp || "0") * 1000).toISOString(),
      user_id: userId,
    },
  });

  if (res.code !== 0) {
    throw new Error(`查询忙闲失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    freebusy: res.data,
  });
}

// ============ 写入功能 ============

/**
 * 创建日程
 */
async function createEvent(
  client: Lark.Client,
  summary: string,
  startTime: string,
  endTime: string,
  calendarId?: string,
  description?: string,
  attendees?: string,
  reminders?: string,
  location?: string
) {
  const calendar = calendarId || (await getPrimaryCalendar(client));

  const start = parseTime(startTime);
  const end = parseTime(endTime);

  // 构建日程数据
  const eventData: any = {
    summary,
    description: description || "",
  };

  // 设置时间
  if (start.isAllDay && end.isAllDay) {
    // 全天日程
    eventData.start_time = { date: start.date };
    eventData.end_time = { date: end.date };
  } else {
    // 精确时间
    eventData.start_time = {
      timestamp: start.timestamp,
      timezone: "Asia/Shanghai",
    };
    eventData.end_time = {
      timestamp: end.timestamp,
      timezone: "Asia/Shanghai",
    };
  }

  // 添加参会人
  if (attendees) {
    eventData.attendee_ability = "can_see_others";
    eventData.attendees = parseJsonParam(attendees, "attendees");
  }

  // 添加提醒
  if (reminders) {
    eventData.reminders = parseJsonParam(reminders, "reminders");
  }

  // 添加地点
  if (location) {
    eventData.location = { name: location };
  }

  const res = await client.calendar.calendarEvent.create({
    path: { calendar_id: calendar },
    data: eventData,
  });

  if (res.code !== 0) {
    throw new Error(`创建日程失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    event_id: res.data?.event?.event_id,
    calendar_id: calendar,
    message: `成功创建日程: ${summary}`,
  });
}

/**
 * 更新日程
 */
async function updateEvent(
  client: Lark.Client,
  calendarId: string,
  eventId: string,
  summary?: string,
  description?: string,
  startTime?: string,
  endTime?: string,
  attendees?: string,
  location?: string
) {
  const eventData: any = {};

  if (summary) eventData.summary = summary;
  if (description) eventData.description = description;

  if (startTime && endTime) {
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    if (start.isAllDay && end.isAllDay) {
      eventData.start_time = { date: start.date };
      eventData.end_time = { date: end.date };
    } else {
      eventData.start_time = {
        timestamp: start.timestamp,
        timezone: "Asia/Shanghai",
      };
      eventData.end_time = {
        timestamp: end.timestamp,
        timezone: "Asia/Shanghai",
      };
    }
  }

  if (attendees) {
    eventData.attendees = parseJsonParam(attendees, "attendees");
  }

  if (location) {
    eventData.location = { name: location };
  }

  const res = await client.calendar.calendarEvent.patch({
    path: {
      calendar_id: calendarId,
      event_id: eventId,
    },
    data: eventData,
  });

  if (res.code !== 0) {
    throw new Error(`更新日程失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    event_id: eventId,
    message: "成功更新日程",
  });
}

/**
 * 删除日程
 */
async function deleteEvent(client: Lark.Client, calendarId: string, eventId: string) {
  const res = await client.calendar.calendarEvent.delete({
    path: {
      calendar_id: calendarId,
      event_id: eventId,
    },
  });

  if (res.code !== 0) {
    throw new Error(`删除日程失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    deleted: true,
    event_id: eventId,
    message: "成功删除日程",
  });
}

// ============ 主处理函数 ============

async function handleCalendarAction(cfg: FeishuConfig, params: FeishuCalendarParams) {
  const client = createFeishuClient(cfg);

  switch (params.action) {
    case "list_calendars":
      return await listCalendars(client);

    case "list_events":
      return await listEvents(
        client,
        params.calendar_id,
        params.start_time,
        params.end_time,
        params.page_size
      );

    case "get_event":
      return await getEvent(client, params.calendar_id, params.event_id);

    case "create_event":
      return await createEvent(
        client,
        params.summary,
        params.start_time,
        params.end_time,
        params.calendar_id,
        params.description,
        params.attendees,
        params.reminders,
        params.location
      );

    case "update_event":
      return await updateEvent(
        client,
        params.calendar_id,
        params.event_id,
        params.summary,
        params.description,
        params.start_time,
        params.end_time,
        params.attendees,
        params.location
      );

    case "delete_event":
      return await deleteEvent(client, params.calendar_id, params.event_id);

    case "search_events":
      return await searchEvents(
        client,
        params.query,
        params.calendar_id,
        params.start_time,
        params.end_time
      );

    case "get_freebusy":
      return await getFreebusy(client, params.start_time, params.end_time, params.user_id);

    default:
      // @ts-expect-error - exhaustive check
      throw new Error(`Unknown action: ${params.action}`);
  }
}

// ============ 工具注册 ============

export function registerFeishuCalendarTools(api: OpenClawPluginApi) {
  api.registerTool({
    name: "feishu_calendar",
    description: `飞书日历 (Calendar) 工具 - 管理日历和日程

支持操作:
- 日历管理: 列出日历
- 日程查询: 列出/搜索日程 (支持时间范围)
- 日程管理: 创建/更新/删除日程
- 参会人: 添加参会人、设置提醒
- 忙闲查询: 查询用户忙闲状态

时间格式:
- 全天日程: YYYY-MM-DD
- 精确时间: YYYY-MM-DD HH:mm
- 默认时区: Asia/Shanghai

权限要求:
- calendar:calendar (日历)
- calendar:calendar.event (日程)`,
    inputSchema: FeishuCalendarSchema,
    isReadOnly: false,
    async call(params: FeishuCalendarParams, context) {
      const channel = context.channel;
      if (channel?.type !== "feishu") {
        throw new Error("此工具仅在飞书渠道中可用");
      }

      const cfg = channel.config as FeishuConfig;
      const toolsConfig = resolveToolsConfig(cfg.tools);

      if (!toolsConfig.calendar) {
        throw new Error("Calendar 工具已被禁用。请在配置中启用 channels.feishu.tools.calendar");
      }

      return await handleCalendarAction(cfg, params);
    },
  });
}
