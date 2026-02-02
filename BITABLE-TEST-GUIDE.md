# Bitable 工具测试指南

**版本**: v1.0.0
**测试日期**: 2026-02-02

---

## 测试环境准备

### 1. 前置条件

- ✅ 飞书应用已创建 (您已有 App ID 和 App Secret)
- ✅ 已申请 `bitable:app` 权限
- ✅ OpenClaw 已安装并配置飞书渠道
- ✅ 插件已加载 (`@m1heng-clawd/feishu`)

### 2. 创建测试多维表格

1. 打开飞书 → 云空间 → 创建"多维表格"
2. 命名为 "Bitable工具测试"
3. 复制 URL，提取 `app_token`
   ```
   URL 示例: https://xxx.feishu.cn/base/bascnABC123?table=tblXXX

   提取:
   app_token = bascnABC123
   table_id = tblXXX (第一个表格的 ID)
   ```

---

## 测试用例

### 测试 1: 列出数据表 ⭐ (基础测试)

**Action**: `list_tables`

**输入**:
```json
{
  "action": "list_tables",
  "app_token": "bascnABC123"
}
```

**期望结果**:
- ✅ 返回 tables 列表
- ✅ 包含默认创建的表格
- ✅ 每个表格包含 `table_id`, `name`, `revision`

**验证点**:
- [ ] 返回的 table_id 格式为 `tblXXX`
- [ ] total 字段显示表格总数
- [ ] 能看到刚创建的测试表格

---

### 测试 2: 列出字段 ⭐ (基础测试)

**Action**: `list_fields`

**输入**:
```json
{
  "action": "list_fields",
  "app_token": "bascnABC123",
  "table_id": "tblXXX"
}
```

**期望结果**:
- ✅ 返回 fields 列表
- ✅ 包含默认字段 (如"记录标题")
- ✅ 每个字段包含 `field_id`, `field_name`, `type`, `type_name`

**验证点**:
- [ ] `type_name` 显示中文名称 (如"文本", "数字")
- [ ] `field_id` 格式为 `fldXXX`
- [ ] total 字段显示字段总数

---

### 测试 3: 创建字段 (文本) ⭐ (基础测试)

**Action**: `create_field`

**输入**:
```json
{
  "action": "create_field",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "field_name": "测试文本字段",
  "field_type": 1
}
```

**期望结果**:
- ✅ 成功创建字段
- ✅ 返回 `field_id`
- ✅ 返回消息: "成功创建字段: 测试文本字段"

**验证点**:
- [ ] 在飞书界面能看到新字段
- [ ] field_id 不为空
- [ ] type_name 显示"文本"

---

### 测试 4: 创建字段 (单选) ⭐

**Action**: `create_field`

**输入**:
```json
{
  "action": "create_field",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "field_name": "状态",
  "field_type": 3,
  "field_properties": "{\"options\":[{\"name\":\"待处理\"},{\"name\":\"进行中\"},{\"name\":\"已完成\"}]}"
}
```

**期望结果**:
- ✅ 成功创建单选字段
- ✅ 返回 field_id
- ✅ 在飞书界面能看到 3 个选项

**验证点**:
- [ ] 选项显示正确 (待处理、进行中、已完成)
- [ ] 能够选择选项

---

### 测试 5: 创建字段 (数字) ⭐

**Action**: `create_field`

**输入**:
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

**期望结果**:
- ✅ 成功创建数字字段
- ✅ 支持 2 位小数

**验证点**:
- [ ] 输入 123.45 能正确保存
- [ ] 小数位精度正确

---

### 测试 6: 创建单条记录 ⭐ (基础测试)

**Action**: `create_record`

**输入**:
```json
{
  "action": "create_record",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "fields": "{\"测试文本字段\":\"测试数据1\",\"状态\":\"进行中\",\"价格\":99.99}"
}
```

**期望结果**:
- ✅ 成功创建记录
- ✅ 返回 `record_id`
- ✅ 返回字段内容

**验证点**:
- [ ] 在飞书界面能看到新记录
- [ ] 所有字段值正确
- [ ] record_id 格式为 `recXXX`

---

### 测试 7: 批量创建记录 ⭐

**Action**: `batch_create_records`

**输入**:
```json
{
  "action": "batch_create_records",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "records": "[{\"fields\":{\"测试文本字段\":\"批量数据1\",\"状态\":\"待处理\",\"价格\":10.5}},{\"fields\":{\"测试文本字段\":\"批量数据2\",\"状态\":\"进行中\",\"价格\":20.3}},{\"fields\":{\"测试文本字段\":\"批量数据3\",\"状态\":\"已完成\",\"价格\":30.8}}]"
}
```

**期望结果**:
- ✅ 成功创建 3 条记录
- ✅ 返回 created_count: 3
- ✅ 返回所有记录的 record_id

**验证点**:
- [ ] 在飞书界面能看到 3 条新记录
- [ ] 所有字段值正确
- [ ] records 数组包含 3 个元素

---

### 测试 8: 分页查询记录 ⭐ (基础测试)

**Action**: `list_records`

**输入**:
```json
{
  "action": "list_records",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "page_size": 10
}
```

**期望结果**:
- ✅ 返回记录列表
- ✅ 包含 records, total, has_more

**验证点**:
- [ ] records 包含之前创建的记录
- [ ] total 显示总记录数 (至少 4 条)
- [ ] has_more 正确显示是否有下一页

---

### 测试 9: 搜索记录 (带过滤) ⭐

**Action**: `search_records`

**输入**:
```json
{
  "action": "search_records",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "filter": "{\"conjunction\":\"and\",\"conditions\":[{\"field_name\":\"状态\",\"operator\":\"is\",\"value\":\"进行中\"}]}"
}
```

**期望结果**:
- ✅ 只返回状态为"进行中"的记录
- ✅ 返回 2 条记录 (测试数据1 和 批量数据2)

**验证点**:
- [ ] 过滤条件生效
- [ ] 返回的记录都是"进行中"状态
- [ ] 记录数量正确

---

### 测试 10: 搜索记录 (带排序) ⭐

**Action**: `search_records`

**输入**:
```json
{
  "action": "search_records",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "sort": "[{\"field_name\":\"价格\",\"desc\":true}]"
}
```

**期望结果**:
- ✅ 记录按价格降序排列
- ✅ 第一条记录价格最高 (99.99)

**验证点**:
- [ ] 排序正确 (99.99 → 30.8 → 20.3 → 10.5)
- [ ] 所有记录都返回

---

### 测试 11: 更新记录 ⭐

**Action**: `update_record`

**前置**: 先从 list_records 获取一个 record_id

**输入**:
```json
{
  "action": "update_record",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "record_id": "recXXX",
  "fields": "{\"状态\":\"已完成\",\"价格\":199.99}"
}
```

**期望结果**:
- ✅ 成功更新记录
- ✅ 返回更新后的字段值

**验证点**:
- [ ] 在飞书界面能看到更新
- [ ] 状态变为"已完成"
- [ ] 价格变为 199.99
- [ ] 其他字段未改变

---

### 测试 12: 删除记录 ⭐

**Action**: `delete_record`

**前置**: 先从 list_records 获取一个 record_id

**输入**:
```json
{
  "action": "delete_record",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "record_id": "recXXX"
}
```

**期望结果**:
- ✅ 成功删除记录
- ✅ 返回 deleted: true

**验证点**:
- [ ] 在飞书界面记录已消失
- [ ] 再次查询不包含该记录

---

### 测试 13: 创建数据表 ⭐

**Action**: `create_table`

**输入**:
```json
{
  "action": "create_table",
  "app_token": "bascnABC123",
  "table_name": "新测试表格"
}
```

**期望结果**:
- ✅ 成功创建表格
- ✅ 返回新的 table_id

**验证点**:
- [ ] 在飞书界面能看到新表格
- [ ] 可以用新的 table_id 操作该表格

---

## 高级测试

### 测试 A: 批量创建 100 条记录

**目的**: 测试性能和批量限制

**输入**:
```json
{
  "action": "batch_create_records",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "records": "[{\"fields\":{...}}, ... 重复 100 次]"
}
```

**验证点**:
- [ ] 能成功创建 100 条
- [ ] 响应时间可接受 (< 10 秒)
- [ ] 所有记录创建成功

---

### 测试 B: 分页查询大量数据

**前置**: 先创建 150 条记录

**步骤**:
1. 第一页: `page_size: 100`
2. 第二页: 使用返回的 `page_token`

**验证点**:
- [ ] 第一页返回 100 条
- [ ] has_more: true
- [ ] 第二页返回剩余 50 条
- [ ] has_more: false

---

### 测试 C: 复杂过滤条件

**输入**:
```json
{
  "action": "search_records",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "filter": "{\"conjunction\":\"and\",\"conditions\":[{\"field_name\":\"价格\",\"operator\":\"isGreater\",\"value\":20},{\"field_name\":\"状态\",\"operator\":\"isNot\",\"value\":\"待处理\"}]}"
}
```

**验证点**:
- [ ] 只返回价格 > 20 且状态不是"待处理"的记录
- [ ] 多条件 AND 逻辑正确

---

## 错误处理测试

### 错误 1: 无效的 app_token

**输入**:
```json
{
  "action": "list_tables",
  "app_token": "invalid_token"
}
```

**期望**:
- ❌ 返回错误
- ❌ 错误码: 99991404
- ❌ 错误消息包含"资源不存在"

---

### 错误 2: 无效的 table_id

**输入**:
```json
{
  "action": "list_fields",
  "app_token": "bascnABC123",
  "table_id": "invalid_table"
}
```

**期望**:
- ❌ 返回错误
- ❌ 错误码: 99991404

---

### 错误 3: 字段名称不存在

**输入**:
```json
{
  "action": "create_record",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "fields": "{\"不存在的字段\":\"值\"}"
}
```

**期望**:
- ❌ 返回错误
- ❌ 错误码: 1254044
- ❌ 错误消息包含"字段不存在"

---

### 错误 4: 单选选项不存在

**输入**:
```json
{
  "action": "create_record",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "fields": "{\"状态\":\"不存在的选项\"}"
}
```

**期望**:
- ❌ 返回错误
- ❌ 错误码: 1254007

---

### 错误 5: 批量创建超过 500 条

**输入**:
```json
{
  "action": "batch_create_records",
  "app_token": "bascnABC123",
  "table_id": "tblXXX",
  "records": "[... 501 条记录]"
}
```

**期望**:
- ❌ 返回错误
- ❌ 错误消息: "单次最多创建 500 条记录"

---

### 错误 6: 权限不足

**前置**: 移除 `bitable:app` 权限

**期望**:
- ❌ 所有操作返回错误
- ❌ 错误码: 99991663
- ❌ 错误消息包含"权限不足"

---

## 测试检查表

### 基础功能 (必测) ⭐
- [ ] 测试 1: 列出数据表
- [ ] 测试 2: 列出字段
- [ ] 测试 3: 创建字段 (文本)
- [ ] 测试 6: 创建单条记录
- [ ] 测试 8: 分页查询记录

### 高级功能
- [ ] 测试 4: 创建字段 (单选)
- [ ] 测试 5: 创建字段 (数字)
- [ ] 测试 7: 批量创建记录
- [ ] 测试 9: 搜索记录 (带过滤)
- [ ] 测试 10: 搜索记录 (带排序)
- [ ] 测试 11: 更新记录
- [ ] 测试 12: 删除记录
- [ ] 测试 13: 创建数据表

### 高级测试 (可选)
- [ ] 测试 A: 批量创建 100 条
- [ ] 测试 B: 分页查询大量数据
- [ ] 测试 C: 复杂过滤条件

### 错误处理 (建议)
- [ ] 错误 1: 无效的 app_token
- [ ] 错误 2: 无效的 table_id
- [ ] 错误 3: 字段名称不存在
- [ ] 错误 4: 单选选项不存在
- [ ] 错误 5: 批量创建超过 500 条

---

## 测试环境配置

### OpenClaw 配置示例

在 `~/.clawd/config.yaml` 中:

```yaml
channels:
  feishu:
    enabled: true
    appId: cli_xxx
    appSecret: xxx
    domain: feishu
    tools:
      bitable: true  # 确保启用
```

---

## 如何使用 OpenClaw 测试

### 方法 1: 通过飞书对话

1. 在飞书中 @ 机器人
2. 发送命令:
   ```
   请使用 feishu_bitable 工具列出我的多维表格
   app_token: bascnABC123
   ```

3. 机器人会自动调用工具并返回结果

### 方法 2: 通过 OpenClaw CLI

```bash
clawd chat --channel feishu

# 然后输入
使用 feishu_bitable 工具查询记录
```

---

## 测试结果记录

请将测试结果记录在下方:

### 基础功能测试结果

| 测试 | 状态 | 备注 |
|------|------|------|
| 测试 1: 列出数据表 | ⏳ | |
| 测试 2: 列出字段 | ⏳ | |
| 测试 3: 创建字段 (文本) | ⏳ | |
| 测试 6: 创建单条记录 | ⏳ | |
| 测试 8: 分页查询记录 | ⏳ | |

### 发现的问题

| 问题 | 严重性 | 描述 | 状态 |
|------|--------|------|------|
| - | - | - | - |

---

## 故障排查

### 问题: 工具未找到

**症状**: "Tool not found: feishu_bitable"

**解决**:
1. 确认插件已加载: `clawd plugin list`
2. 确认 bitable 工具已启用: `channels.feishu.tools.bitable: true`
3. 重启 OpenClaw

---

### 问题: 权限错误

**症状**: 错误码 99991663

**解决**:
1. 检查权限是否已申请
2. 确认管理员已审批
3. 等待 5-10 分钟生效

---

### 问题: Token 无效

**症状**: 错误码 99991404

**解决**:
1. 检查 app_token 格式 (应为 `bascnXXX`)
2. 确认多维表格存在且未删除
3. 确认应用有访问权限

---

## 下一步

测试完成后:

1. **报告结果**
   - 填写"测试结果记录"表格
   - 列出发现的问题

2. **反馈改进**
   - 使用体验
   - 功能建议
   - 文档改进

3. **继续开发**
   - 修复发现的问题
   - 开始 Calendar 工具开发
   - 或开始 Minutes 工具开发

---

**测试愉快!** 🧪

有任何问题随时告诉我。
