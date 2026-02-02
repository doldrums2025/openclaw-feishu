# API 验证结果报告

版本: v0.1.0
测试日期: 待填写
测试人员: 待填写

---

## 测试环境

- **飞书域名**: feishu / lark (待填写)
- **SDK 版本**: `@larksuiteoapi/node-sdk@1.30.0`
- **测试应用**: 待填写
- **权限状态**: 待验证

---

## 一、Bitable API (多维表格) 验证结果

### 1.1 测试概况

| API 端点 | 状态 | 响应码 | 备注 |
|---------|------|--------|------|
| `bitable.appTable.list` | ⏳ 待测试 | - | 列出数据表 |
| `bitable.appTableField.list` | ⏳ 待测试 | - | 列出字段 |
| `bitable.appTableRecord.list` | ⏳ 待测试 | - | 列出记录 |
| `bitable.appTableRecord.create` | ⏳ 待测试 | - | 创建记录 |
| `bitable.appTableRecord.batchCreate` | ⏳ 待测试 | - | 批量创建记录 |
| `bitable.appTableRecord.update` | ⏳ 待测试 | - | 更新记录 |
| `bitable.appTableRecord.delete` | ⏳ 待测试 | - | 删除记录 |
| `bitable.appTable.create` | ⏳ 待测试 | - | 创建数据表 |
| `bitable.appTableField.create` | ⏳ 待测试 | - | 创建字段 |
| `bitable.appTableRecord.search` | ⏳ 待测试 | - | 搜索记录 |

### 1.2 字段类型映射

根据实际测试,记录飞书多维表格支持的字段类型:

| 字段类型 | type 值 | 创建时属性 | 示例 | 验证状态 |
|---------|---------|-----------|------|---------|
| 文本 | 1 | - | `"字段值"` | ⏳ |
| 数字 | 2 | `precision: 0-10` | `123.45` | ⏳ |
| 单选 | 3 | `options: [{name}]` | `"选项1"` | ⏳ |
| 多选 | 4 | `options: [{name}]` | `["选项1", "选项2"]` | ⏳ |
| 日期 | 5 | `date_format: "yyyy/MM/dd"` | `1640995200000` | ⏳ |
| 复选框 | 7 | - | `true/false` | ⏳ |
| 人员 | 11 | `multiple: true/false` | `[{id, name}]` | ⏳ |
| 电话号码 | 13 | - | `"+86 138xxxx"` | ⏳ |
| 超链接 | 15 | - | `{link, text}` | ⏳ |
| 附件 | 17 | - | `[{file_token}]` | ⏳ |
| 公式 | 20 | `formula: "SUM(...)"` | (只读) | ⏳ |
| 双向关联 | 21 | `table_id, link_field_id` | `[record_id]` | ⏳ |
| 查找引用 | 22 | - | (只读) | ⏳ |

**注意事项** (待测试后填写):
- [ ] 字段名称 vs 字段 ID 的使用场景
- [ ] 必填字段的创建和更新
- [ ] 只读字段的限制
- [ ] 字段类型转换的限制

### 1.3 实际响应格式

#### 列出记录响应示例

```json
待填写 (从 api-test-results.json 复制)
```

#### 创建记录响应示例

```json
待填写
```

### 1.4 发现的差异点

**与官方文档不一致之处**:
- 待填写

**API 限制**:
- 批量操作最大数量: (待验证)
- 单次查询最大记录数: (待验证)
- 分页机制: (待验证)

### 1.5 权限要求

- ✅ 必须: `bitable:app` (查看、评论和编辑多维表格)
- ⚠️ 注意: (待补充其他权限细节)

---

## 二、Calendar API (日历/会议) 验证结果

### 2.1 测试概况

| API 端点 | 状态 | 响应码 | 备注 |
|---------|------|--------|------|
| `calendar.calendar.list` | ⏳ 待测试 | - | 列出日历 |
| `calendar.calendarEvent.list` | ⏳ 待测试 | - | 列出日程 |
| `calendar.calendarEvent.get` | ⏳ 待测试 | - | 获取日程详情 |
| `calendar.calendarEvent.create` | ⏳ 待测试 | - | 创建日程 |
| `calendar.calendarEvent.patch` | ⏳ 待测试 | - | 更新日程 |
| `calendar.calendarEvent.delete` | ⏳ 待测试 | - | 删除日程 |
| `calendar.calendarEvent.search` | ⏳ 待测试 | - | 搜索日程 |
| `calendar.freebusy.list` | ⏳ 待测试 | - | 查询忙闲 |

### 2.2 时间格式处理

**测试结果**:

| 场景 | 输入格式 | API 期望格式 | 验证状态 |
|------|---------|-------------|---------|
| 创建精确时间日程 | `YYYY-MM-DD HH:mm` | `timestamp` (秒) | ⏳ |
| 创建全天日程 | `YYYY-MM-DD` | `date: "YYYY-MM-DD"` | ⏳ |
| 查询日程 (start/end) | - | `timestamp` (秒) | ⏳ |
| 时区处理 | - | `time_zone: "Asia/Shanghai"` | ⏳ |

**注意事项** (待测试后填写):
- [ ] 时区的默认行为
- [ ] 夏令时处理
- [ ] 跨天日程的表示

### 2.3 实际响应格式

#### 列出日程响应示例

```json
待填写
```

#### 创建日程响应示例

```json
待填写
```

### 2.4 参会人和提醒设置

**参会人列表格式** (待验证):
```json
{
  "attendees": [
    {
      "user_id": "ou_xxx",
      "type": "third_party",
      "is_optional": false
    }
  ]
}
```

**提醒设置格式** (待验证):
```json
{
  "reminders": [
    {
      "minutes": 15
    }
  ]
}
```

### 2.5 权限要求

- ✅ 必须: `calendar:calendar` (查看、创建、编辑日历)
- ✅ 必须: `calendar:calendar.event` (查看、创建、编辑日程)
- ⚠️ 注意: (待补充其他权限细节)

---

## 三、Minutes API (飞书妙记) 验证结果

### 3.1 测试概况

| API 端点 | 状态 | 响应码 | 备注 |
|---------|------|--------|------|
| `GET /minutes/v1/minutes/{token}` | ⏳ 待测试 | - | 获取妙记信息 |
| `GET /minutes/v1/minutes/{token}/statistics` | ⏳ 待测试 | - | 获取统计数据 |
| `GET /minutes/v1/minutes` | ⏳ 待测试 | - | 列出妙记 (可能不可用) |

### 3.2 实际响应格式

#### 获取妙记信息响应示例

```json
待填写
```

### 3.3 API 限制

**已知限制**:
- ⚠️ Minutes API 仅支持只读操作 (根据官方文档)
- 待验证: 是否支持列出妙记
- 待验证: 妙记内容是否以文档形式存储

**替代方案**:
- 如果妙记内容存储为文档,可以使用文档 API (`docx`) 访问

### 3.4 权限要求

- ✅ 必须: `minutes:minutes:readonly` (查看妙记)
- ⚠️ 注意: (待补充其他权限细节)

---

## 四、综合发现

### 4.1 SDK 版本兼容性

| 功能 | SDK 最低版本 | 验证结果 |
|------|-------------|---------|
| Bitable API | - | ⏳ |
| Calendar API | - | ⏳ |
| Minutes API | - | ⏳ |

### 4.2 性能测试

| 操作 | 耗时 | 备注 |
|------|------|------|
| 查询 100 条记录 | - | 待测试 |
| 批量创建 50 条记录 | - | 待测试 |
| 查询 30 天日程 | - | 待测试 |

### 4.3 阻塞性问题

**发现的阻塞问题** (如果有):
- 待填写

**需要调整的实施计划**:
- 待填写

---

## 五、实施建议

### 5.1 功能优先级调整

基于 API 验证结果,建议的实施顺序:

1. ⏳ **Bitable** (多维表格) - (待评估)
2. ⏳ **Calendar** (日历/会议) - (待评估)
3. ⏳ **Minutes** (飞书妙记) - (待评估)

### 5.2 MVP 功能范围

如果发现 API 限制,可以先实施 MVP 版本:

**Bitable MVP**:
- [ ] 列出表格和字段
- [ ] 查询记录
- [ ] 创建单条记录
- [ ] (延后) 批量操作

**Calendar MVP**:
- [ ] 列出日程
- [ ] 创建日程
- [ ] (延后) 更新/删除日程

**Minutes MVP**:
- [ ] 获取妙记信息
- [ ] (延后) 统计数据

### 5.3 技术风险评估

| 风险项 | 影响 | 应对措施 | 状态 |
|--------|------|---------|------|
| Bitable 字段类型复杂 | 高 | 先实施基础类型 | ⏳ |
| Calendar 时区处理 | 中 | 默认 Asia/Shanghai | ⏳ |
| Minutes API 功能受限 | 低 | 只读实现 | ⏳ |

---

## 六、下一步行动

测试完成后的 Checklist:

- [ ] 所有核心 API 测试完成
- [ ] 响应格式已记录
- [ ] 差异点已标注
- [ ] 权限配置已验证
- [ ] 实施计划已调整 (如需要)
- [ ] 开始阶段 1: Bitable 工具开发

---

**更新日志**

| 日期 | 版本 | 变更内容 |
|------|------|---------|
| 2026-02-02 | v0.1.0 | 初始模板创建 |

---

**附录: 测试原始数据**

测试脚本输出和 `api-test-results.json` 内容将在测试完成后附在此处。
