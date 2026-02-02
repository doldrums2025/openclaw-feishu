---
name: feishu-calendar
description: |
  Feishu calendar and event operations. Activate when user mentions calendars, events, meetings, or schedules.
---

# Feishu Calendar Tool

Single tool `feishu_calendar` with action parameter for all calendar operations.

## Actions

### 1. List Calendars (列出日历)

```json
{ "action": "list_calendars" }
```

Returns: 所有可访问的日历列表，包含 calendar_id、name、role 等信息。

### 2. List Events (列出日程)

**查询今天的日程**:
```json
{
  "action": "list_events"
}
```

**查询指定日期范围**:
```json
{
  "action": "list_events",
  "start_time": "2026-02-03",
  "end_time": "2026-02-05"
}
```

**查询指定时间段**:
```json
{
  "action": "list_events",
  "start_time": "2026-02-03 09:00",
  "end_time": "2026-02-03 18:00"
}
```

**指定日历**:
```json
{
  "action": "list_events",
  "calendar_id": "feishu.cn_xxx",
  "start_time": "2026-02-03",
  "end_time": "2026-02-05"
}
```

Returns: 日程列表、has_more、page_token。

### 3. Get Event (获取日程详情)

```json
{
  "action": "get_event",
  "calendar_id": "feishu.cn_xxx",
  "event_id": "xxx"
}
```

Returns: 日程详细信息（包含参会人、提醒、地点等）。

### 4. Create Event (创建日程)

**创建精确时间日程**:
```json
{
  "action": "create_event",
  "summary": "团队会议",
  "description": "讨论项目进度",
  "start_time": "2026-02-03 14:00",
  "end_time": "2026-02-03 15:00"
}
```

**创建全天日程**:
```json
{
  "action": "create_event",
  "summary": "出差",
  "start_time": "2026-02-03",
  "end_time": "2026-02-05"
}
```

**添加参会人和提醒**:
```json
{
  "action": "create_event",
  "summary": "项目评审",
  "start_time": "2026-02-03 15:00",
  "end_time": "2026-02-03 16:00",
  "attendees": "[{\"user_id\":\"ou_xxx\"},{\"user_id\":\"ou_yyy\"}]",
  "reminders": "[{\"minutes\":15}]",
  "location": "3号会议室"
}
```

**指定日历**:
```json
{
  "action": "create_event",
  "calendar_id": "feishu.cn_xxx",
  "summary": "会议",
  "start_time": "2026-02-03 14:00",
  "end_time": "2026-02-03 15:00"
}
```

Returns: event_id、calendar_id、成功消息。

### 5. Update Event (更新日程)

**更新标题和描述**:
```json
{
  "action": "update_event",
  "calendar_id": "feishu.cn_xxx",
  "event_id": "xxx",
  "summary": "项目会议（已改期）",
  "description": "新的会议描述"
}
```

**更新时间**:
```json
{
  "action": "update_event",
  "calendar_id": "feishu.cn_xxx",
  "event_id": "xxx",
  "start_time": "2026-02-04 10:00",
  "end_time": "2026-02-04 11:00"
}
```

**更新参会人**:
```json
{
  "action": "update_event",
  "calendar_id": "feishu.cn_xxx",
  "event_id": "xxx",
  "attendees": "[{\"user_id\":\"ou_xxx\"}]"
}
```

Returns: 更新确认信息。

### 6. Delete Event (删除日程)

```json
{
  "action": "delete_event",
  "calendar_id": "feishu.cn_xxx",
  "event_id": "xxx"
}
```

Returns: 删除确认信息。

### 7. Search Events (搜索日程)

**简单搜索**:
```json
{
  "action": "search_events",
  "query": "项目会议"
}
```

**指定时间范围搜索**:
```json
{
  "action": "search_events",
  "query": "会议",
  "start_time": "2026-02-01",
  "end_time": "2026-02-28"
}
```

**指定日历搜索**:
```json
{
  "action": "search_events",
  "query": "评审",
  "calendar_id": "feishu.cn_xxx"
}
```

Returns: 匹配的日程列表。

### 8. Get Freebusy (查询忙闲)

**查询用户的忙闲** (需要提供 user_id):
```json
{
  "action": "get_freebusy",
  "user_id": "ou_xxx",
  "start_time": "2026-02-03 09:00",
  "end_time": "2026-02-03 18:00"
}
```

**注意**: `user_id` 必须是有效的 open_id，格式为 `ou_` 开头。

Returns: 忙闲时间段信息。

---

## Time Formats (时间格式)

### 支持的格式

| 格式 | 说明 | 示例 | 用途 |
|------|------|------|------|
| `YYYY-MM-DD` | 日期（全天） | `2026-02-03` | 全天日程 |
| `YYYY-MM-DD HH:mm` | 日期时间（精确） | `2026-02-03 14:00` | 精确时间日程 |

### 时区说明

- 默认时区: `Asia/Shanghai` (东八区)
- 精确时间会自动转换为 UTC 时间戳
- 全天日程不涉及时区问题

---

## Attendees Format (参会人格式)

参会人列表使用 JSON 字符串格式：

```json
"[{\"user_id\":\"ou_xxx\"},{\"user_id\":\"ou_yyy\"}]"
```

### 参会人对象结构

```json
{
  "user_id": "ou_xxx",        // 用户 ID (必须)
  "type": "third_party",      // 类型 (可选)
  "is_optional": false        // 是否可选参会 (可选)
}
```

### 如何获取 user_id

1. 从飞书通讯录获取
2. 使用用户的 open_id 或 union_id
3. 格式通常为 `ou_` 开头

---

## Reminders Format (提醒格式)

提醒设置使用 JSON 字符串格式：

```json
"[{\"minutes\":15}]"
```

### 常用提醒时间

| 时间 | minutes 值 | 说明 |
|------|-----------|------|
| 提前 5 分钟 | 5 | 会议开始前 5 分钟 |
| 提前 15 分钟 | 15 | 会议开始前 15 分钟 |
| 提前 30 分钟 | 30 | 会议开始前半小时 |
| 提前 1 小时 | 60 | 会议开始前 1 小时 |
| 提前 1 天 | 1440 | 会议前一天 |

### 多个提醒

```json
"[{\"minutes\":15},{\"minutes\":60}]"
```

---

## Common Workflows (常见工作流)

### 1. 查看今天日程

```
1. list_events (不带参数) - 查看今天的日程
```

### 2. 创建会议并邀请参会人

```
1. list_calendars - 获取日历 ID
2. create_event (带 attendees 和 reminders) - 创建会议
```

### 3. 修改会议时间

```
1. search_events (query) - 找到要修改的会议
2. update_event (start_time, end_time) - 更新时间
```

### 4. 检查时间冲突

```
1. get_freebusy - 查询忙闲状态
2. 如果有空闲时段，创建会议
```

### 5. 查找下周的所有会议

```
1. list_events (start_time: 下周一, end_time: 下周日)
```

---

## Calendar ID (日历 ID)

### 默认行为

如果不指定 `calendar_id`，工具会自动使用**主日历**（您拥有的第一个日历）。

### 获取 calendar_id

使用 `list_calendars` action 查看所有可用日历：

```json
{ "action": "list_calendars" }
```

返回示例：
```json
{
  "calendars": [
    {
      "calendar_id": "feishu.cn_xxx",
      "summary": "我的日历",
      "role": "owner"
    }
  ]
}
```

---

## Permissions (权限要求)

**必须权限**:
- `calendar:calendar` - 查看、创建、编辑日历
- `calendar:calendar.event` - 查看、创建、编辑日程

---

## Notes (注意事项)

1. **时间格式**:
   - 必须严格按照 `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm` 格式
   - 时间使用 24 小时制

2. **全天日程 vs 精确时间**:
   - 全天: `start_time: "2026-02-03"`, `end_time: "2026-02-05"`
   - 精确: `start_time: "2026-02-03 14:00"`, `end_time: "2026-02-03 15:00"`
   - **不要混用**两种格式

3. **默认日历**:
   - 大多数操作可以不指定 `calendar_id`
   - 工具会自动使用主日历

4. **参会人和提醒**:
   - 必须使用 JSON 字符串格式
   - 注意转义双引号: `\"user_id\"`

5. **时区**:
   - 所有精确时间默认使用 `Asia/Shanghai` 时区
   - 如需其他时区，请手动转换时间

6. **日程 ID**:
   - 创建日程后会返回 `event_id`
   - 更新/删除时需要提供 `event_id` 和 `calendar_id`

---

## Error Codes (常见错误码)

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 99991663 | 权限不足 | 申请 `calendar:calendar` 和 `calendar:calendar.event` 权限 |
| 99991404 | 资源不存在 | 检查 calendar_id 或 event_id 是否正确 |
| 99991400 | 参数错误 | 检查时间格式、JSON 格式是否正确 |
| 230011 | 时间冲突 | 该时间段已有日程，无法创建 |

---

## Examples (使用示例)

### 示例 1: 查看本周日程

```json
{
  "action": "list_events",
  "start_time": "2026-02-03",
  "end_time": "2026-02-09"
}
```

### 示例 2: 创建项目周会

```json
{
  "action": "create_event",
  "summary": "项目周会",
  "description": "回顾本周工作，规划下周任务",
  "start_time": "2026-02-05 10:00",
  "end_time": "2026-02-05 11:00",
  "attendees": "[{\"user_id\":\"ou_xxx\"},{\"user_id\":\"ou_yyy\"}]",
  "reminders": "[{\"minutes\":15}]",
  "location": "线上会议室"
}
```

### 示例 3: 搜索所有评审会议

```json
{
  "action": "search_events",
  "query": "评审",
  "start_time": "2026-02-01",
  "end_time": "2026-02-28"
}
```

### 示例 4: 检查明天是否有空

```json
{
  "action": "get_freebusy",
  "start_time": "2026-02-04 09:00",
  "end_time": "2026-02-04 18:00"
}
```

---

**版本**: v1.0.0
**更新时间**: 2026-02-02
