# API 验证测试指南

版本: v0.1.0
创建时间: 2026-02-02

---

## 目的

在开始功能开发前,验证飞书 API 的实际可用性,避免基于文档假设导致返工。

## 测试范围

- ✅ **Bitable API** (多维表格) - 表格管理、字段管理、记录 CRUD
- ✅ **Calendar API** (日历/会议) - 日历查询、日程 CRUD、忙闲查询
- ✅ **Minutes API** (飞书妙记) - 妙记信息查询、统计数据

---

## 前置准备

### 1. 创建测试应用

访问 [飞书开放平台](https://open.feishu.cn/app) 创建测试应用:

1. 点击"创建企业自建应用"
2. 填写应用名称 (如: "API测试应用")
3. 记录 **App ID** 和 **App Secret**

### 2. 申请权限

在应用管理后台 → 权限管理,申请以下权限:

#### Bitable 权限
- `bitable:app` - 查看、评论和编辑多维表格

#### Calendar 权限
- `calendar:calendar` - 查看、创建、编辑日历
- `calendar:calendar.event` - 查看、创建、编辑日程
- `calendar:calendar.event:readonly` - 查看日程 (只读)

#### Minutes 权限
- `minutes:minutes:readonly` - 查看妙记 (只读)

⚠️ **重要**: 权限申请后需要企业管理员审批才能生效。

### 3. 创建测试数据

#### 3.1 创建测试多维表格

1. 打开飞书 → 云空间 → 创建"多维表格"
2. 创建一个简单的表格,包含几个字段:
   - 文本字段: "测试字段"
   - 数字字段: "数量"
   - 单选字段: "状态" (选项: 进行中、已完成)
3. 添加 1-2 条测试数据
4. 复制表格 URL,提取 `app_token` (格式: `bascnXXX`)
   - URL 示例: `https://xxx.feishu.cn/base/bascnXXX?table=tblXXX`

#### 3.2 创建测试日历

1. 打开飞书日历
2. 确保有主日历 (默认已有)
3. 可以预先创建 1-2 个测试日程

#### 3.3 创建测试妙记 (可选)

1. 创建一个飞书会议
2. 开启妙记功能
3. 复制妙记 URL,提取 `minute_token` (格式: `obcnXXX`)

---

## 运行测试

### 1. 设置环境变量

```bash
# 必须: 应用凭证
export FEISHU_APP_ID=cli_xxx
export FEISHU_APP_SECRET=xxx

# 可选: Bitable 测试 (如果要测试多维表格)
export FEISHU_TEST_BITABLE_APP_TOKEN=bascnxxx

# 可选: Minutes 测试 (如果要测试妙记)
export FEISHU_TEST_MINUTE_TOKEN=obcnxxx

# 可选: 域名 (默认 feishu,国际版使用 lark)
export FEISHU_DOMAIN=feishu
```

**Windows (PowerShell)**:
```powershell
$env:FEISHU_APP_ID="cli_xxx"
$env:FEISHU_APP_SECRET="xxx"
$env:FEISHU_TEST_BITABLE_APP_TOKEN="bascnxxx"
```

### 2. 安装依赖

```bash
npm install
```

### 3. 运行测试脚本

```bash
node test-api.mjs
```

### 4. 查看结果

测试完成后会生成:
- **控制台输出**: 实时显示测试进度和结果
- **api-test-results.json**: 详细的测试结果 (JSON 格式)

---

## 预期输出

### 成功示例

```
✅ 飞书客户端初始化成功
   App ID: cli_a12345...
   Domain: feishu

============================================================
📊 测试 Bitable API (多维表格)
============================================================

🔍 测试 bitable.listTables...
   ✅ 成功 (code: 0)

📋 数据表列表示例:
{
  "table_id": "tblXXX",
  "name": "测试表格",
  "revision": 1
}

🔍 测试 bitable.listFields...
   ✅ 成功 (code: 0)

🔍 测试 bitable.listRecords...
   ✅ 成功 (code: 0)
...
```

### 失败示例

```
🔍 测试 bitable.createRecord...
   ❌ 失败: Permission denied (code: 99991663)
```

**常见错误码**:
- `99991663` - 权限不足,需要申请对应权限
- `99991401` - Token 无效或已过期
- `99991400` - 参数错误

---

## 测试结果分析

### 关键验证点

#### Bitable API
- [ ] `listTables` - 能否列出表格
- [ ] `listFields` - 能否获取字段信息
- [ ] `listRecords` - 能否查询记录
- [ ] `createRecord` - 能否创建记录 (测试写入权限)
- [ ] `batchCreateRecords` - 能否批量创建记录

**关注点**:
- 字段类型映射 (文本、数字、单选、多选、日期等)
- 字段 `field_name` vs `field_id` 的使用
- 批量操作的限制 (单次最多 500 条)

#### Calendar API
- [ ] `listCalendars` - 能否列出日历
- [ ] `listEvents` - 能否查询日程
- [ ] `createEvent` - 能否创建日程
- [ ] `updateEvent` - 能否修改日程
- [ ] `deleteEvent` - 能否删除日程
- [ ] `getFreebusy` - 能否查询忙闲

**关注点**:
- 时间格式 (timestamp vs date_time)
- 时区处理 (默认 `Asia/Shanghai`)
- 全天日程 vs 精确时间日程
- 参会人列表格式

#### Minutes API
- [ ] `getMinute` - 能否获取妙记信息
- [ ] `getStatistics` - 能否获取统计数据
- [ ] `listMinutes` - 能否列出妙记 (可能不可用)

**关注点**:
- API 是否仅只读
- 是否支持列表查询
- 与文档 API 的关联

---

## 故障排查

### 问题 1: 客户端初始化失败

**错误**: `Error: Invalid credentials`

**解决方案**:
1. 检查 `FEISHU_APP_ID` 和 `FEISHU_APP_SECRET` 是否正确
2. 确认应用状态为"已启用"
3. 检查应用类型是否为"企业自建应用"

### 问题 2: 权限错误 (99991663)

**错误**: `Permission denied`

**解决方案**:
1. 在开放平台后台检查权限是否已申请
2. 确认权限申请已被管理员审批
3. 权限变更后可能需要等待 5-10 分钟生效

### 问题 3: Token 无效

**错误**: `Invalid token` 或 `99991404`

**解决方案**:
1. 检查 `FEISHU_TEST_BITABLE_APP_TOKEN` 格式是否正确 (应为 `bascnXXX`)
2. 确认测试数据存在且未被删除
3. 确认应用有该资源的访问权限

### 问题 4: API 不存在

**错误**: `API not found` 或 `404`

**解决方案**:
1. 检查 API 路径是否正确
2. 确认 SDK 版本 (`@larksuiteoapi/node-sdk`) 是否最新
3. 部分 API 可能仅在特定版本或区域可用

---

## 下一步

测试完成后,根据结果创建 `API-VERIFICATION.md`:

```bash
# 模板内容
1. API 实际响应格式 (与文档对比)
2. 发现的差异点和注意事项
3. 字段类型映射表 (Bitable)
4. API 限制和边界条件
5. 权限配置建议
```

---

## 参考资料

- [飞书开放平台文档](https://open.feishu.cn/document/)
- [Bitable API 文档](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app/list)
- [Calendar API 文档](https://open.feishu.cn/document/server-docs/calendar-v4/calendar/list)
- [Minutes API 文档](https://open.feishu.cn/document/server-docs/minutes-v1/minutes/get)

---

**版本历史**

| 版本 | 日期 | 变更 |
|------|------|------|
| v0.1.0 | 2026-02-02 | 初始版本 |
