---
name: feishu-bitable
description: |
  Feishu Bitable (multidimensional table) operations. Activate when user mentions Bitable, multidimensional tables, databases, or base links.
---

# Feishu Bitable Tool

Single tool `feishu_bitable` with action parameter for all Bitable operations.

## Token Extraction

From URL `https://xxx.feishu.cn/base/bascnABC123?table=tblXXX` → `app_token` = `bascnABC123`, `table_id` = `tblXXX`

## Actions

### 1. List Tables (列出数据表)

```json
{ "action": "list_tables", "app_token": "bascnABC123" }
```

Returns: 所有数据表列表，包含 table_id、name、revision 等详细信息。

### 2. Create Table (创建数据表)

```json
{ "action": "create_table", "app_token": "bascnABC123", "table_name": "新数据表" }
```

Returns: 新创建的 table_id。

### 3. List Fields (列出字段)

```json
{ "action": "list_fields", "app_token": "bascnABC123", "table_id": "tblXXX" }
```

Returns: 所有字段信息，包含 field_id、field_name、type、type_name (中文名称)。

### 4. Create Field (创建字段)

**文本字段**:
```json
{
  "action": "create_field",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "field_name": "姓名",
  "field_type": 1
}
```

**数字字段** (带精度):
```json
{
  "action": "create_field",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "field_name": "价格",
  "field_type": 2,
  "field_properties": "{\"precision\":2}"
}
```

**单选字段**:
```json
{
  "action": "create_field",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "field_name": "状态",
  "field_type": 3,
  "field_properties": "{\"options\":[{\"name\":\"进行中\"},{\"name\":\"已完成\"}]}"
}
```

**多选字段**:
```json
{
  "action": "create_field",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "field_name": "标签",
  "field_type": 4,
  "field_properties": "{\"options\":[{\"name\":\"重要\"},{\"name\":\"紧急\"}]}"
}
```

**日期字段**:
```json
{
  "action": "create_field",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "field_name": "截止日期",
  "field_type": 5,
  "field_properties": "{\"date_format\":\"yyyy/MM/dd\"}"
}
```

**复选框字段**:
```json
{
  "action": "create_field",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "field_name": "已完成",
  "field_type": 7
}
```

### 5. List Records (分页查询记录)

```json
{
  "action": "list_records",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "page_size": 100
}
```

带分页标记 (获取下一页):
```json
{
  "action": "list_records",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "page_size": 100,
  "page_token": "xxx"
}
```

Returns: records 列表、total、has_more、page_token (如果有下一页)。

### 6. Search Records (搜索记录)

**简单搜索** (不带过滤):
```json
{
  "action": "search_records",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "page_size": 100
}
```

**带过滤条件**:
```json
{
  "action": "search_records",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "filter": "{\"conjunction\":\"and\",\"conditions\":[{\"field_name\":\"状态\",\"operator\":\"is\",\"value\":\"进行中\"}]}",
  "page_size": 50
}
```

**带排序**:
```json
{
  "action": "search_records",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "sort": "[{\"field_name\":\"创建时间\",\"desc\":true}]",
  "page_size": 50
}
```

### 7. Create Record (创建单条记录)

```json
{
  "action": "create_record",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "fields": "{\"姓名\":\"张三\",\"年龄\":25,\"状态\":\"进行中\"}"
}
```

Returns: 新创建的 record_id 和字段内容。

### 8. Batch Create Records (批量创建记录)

```json
{
  "action": "batch_create_records",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "records": "[{\"fields\":{\"姓名\":\"张三\",\"年龄\":25}},{\"fields\":{\"姓名\":\"李四\",\"年龄\":30}}]"
}
```

**限制**: 单次最多 500 条记录。

Returns: 创建的记录列表和总数。

### 9. Update Record (更新记录)

```json
{
  "action": "update_record",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "record_id": "recXXX",
  "fields": "{\"状态\":\"已完成\",\"备注\":\"任务完成\"}"
}
```

Returns: 更新后的记录内容。

### 10. Delete Record (删除记录)

```json
{
  "action": "delete_record",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "record_id": "recXXX"
}
```

Returns: 删除确认信息。

---

## Field Types (字段类型)

| 类型值 | 类型名称 | 说明 | 示例 |
|--------|----------|------|------|
| 1 | 文本 | 单行/多行文本 | `"文本内容"` |
| 2 | 数字 | 数值，支持小数 | `123.45` |
| 3 | 单选 | 单选下拉 | `"选项1"` |
| 4 | 多选 | 多选下拉 | `["选项1", "选项2"]` |
| 5 | 日期 | 日期或日期时间 | `1640995200000` (毫秒时间戳) |
| 7 | 复选框 | 布尔值 | `true` / `false` |
| 11 | 人员 | 人员选择 | `[{"id":"ou_xxx","name":"张三"}]` |
| 13 | 电话号码 | 电话格式 | `"+86 138xxxx"` |
| 15 | 超链接 | URL 链接 | `{"link":"https://...", "text":"链接文本"}` |
| 17 | 附件 | 文件附件 | `[{"file_token":"xxx"}]` |
| 20 | 公式 | 计算字段 (只读) | - |
| 22 | 查找引用 | 引用其他表 (只读) | - |

---

## Filter Syntax (过滤语法)

### 运算符

| 运算符 | 说明 | 适用类型 |
|--------|------|----------|
| `is` | 等于 | 文本、单选、数字 |
| `isNot` | 不等于 | 文本、单选、数字 |
| `contains` | 包含 | 文本、多选 |
| `doesNotContain` | 不包含 | 文本、多选 |
| `isEmpty` | 为空 | 所有类型 |
| `isNotEmpty` | 不为空 | 所有类型 |
| `isGreater` | 大于 | 数字、日期 |
| `isGreaterEqual` | 大于等于 | 数字、日期 |
| `isLess` | 小于 | 数字、日期 |
| `isLessEqual` | 小于等于 | 数字、日期 |

### 过滤示例

**单条件**:
```json
{
  "conjunction": "and",
  "conditions": [
    {
      "field_name": "状态",
      "operator": "is",
      "value": "进行中"
    }
  ]
}
```

**多条件 (AND)**:
```json
{
  "conjunction": "and",
  "conditions": [
    {
      "field_name": "状态",
      "operator": "is",
      "value": "进行中"
    },
    {
      "field_name": "优先级",
      "operator": "isGreater",
      "value": 3
    }
  ]
}
```

**多条件 (OR)**:
```json
{
  "conjunction": "or",
  "conditions": [
    {
      "field_name": "状态",
      "operator": "is",
      "value": "进行中"
    },
    {
      "field_name": "状态",
      "operator": "is",
      "value": "待处理"
    }
  ]
}
```

---

## Common Workflows (常见工作流)

### 1. 查看表格结构

```
1. list_tables - 获取所有表格
2. list_fields - 查看字段定义
```

### 2. 创建新表并添加数据

```
1. create_table - 创建表格
2. create_field (多次) - 添加字段
3. batch_create_records - 批量插入数据
```

### 3. 查询和更新数据

```
1. search_records (带 filter) - 查找目标记录
2. update_record - 更新记录
```

### 4. 数据导出

```
1. list_records (分页循环) - 获取所有记录
2. 处理并保存数据
```

---

## Permissions (权限要求)

**必须权限**:
- `bitable:app` - 查看、评论和编辑多维表格

---

## Notes (注意事项)

1. **Token 格式**:
   - `app_token`: `bascnXXX` (从多维表格 URL 提取)
   - `table_id`: `tblXXX` (从 URL 或 list_tables 获取)
   - `record_id`: `recXXX` (从查询结果获取)

2. **字段引用**:
   - 创建/更新记录时使用 `field_name` (字段名称)
   - 也可以使用 `field_id` (更稳定，不受重命名影响)

3. **批量操作**:
   - `batch_create_records`: 单次最多 500 条
   - 建议分批处理大量数据

4. **只读字段**:
   - 公式字段 (type: 20) 和查找引用字段 (type: 22) 不能写入
   - 创建记录时会自动计算

5. **日期格式**:
   - 输入: 毫秒时间戳 (`1640995200000`)
   - 输出: 同样为时间戳

6. **单选/多选**:
   - 必须先创建选项 (通过 `field_properties`)
   - 写入时使用选项名称

---

## Error Codes (常见错误码)

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 99991663 | 权限不足 | 申请 `bitable:app` 权限 |
| 99991400 | 参数错误 | 检查参数格式 (JSON 字符串) |
| 99991404 | 资源不存在 | 检查 token/id 是否正确 |
| 1254044 | 字段不存在 | 使用 `list_fields` 查看可用字段 |
| 1254007 | 选项不存在 | 检查单选/多选的选项名称 |

---

**版本**: v1.0.0
**更新时间**: 2026-02-02
