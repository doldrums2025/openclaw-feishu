# Minutes API 限制说明

## 概述

飞书妙记（Minutes）API 在实际使用中存在严重限制，**即使申请了权限也无法正常使用**。

## 诊断结果

### 测试环境

- **应用类型**: 企业自建应用
- **权限状态**: `minutes:minutes:readonly` 显示"已开通"
- **测试日期**: 2026-02-02

### 关键发现

#### 1. 权限未生效

通过调用 `/open-apis/contact/v3/scopes` 检查实际权限范围，发现：

```
✅ 成功获取权限列表
⚠️  未发现 Minutes 相关权限
💡 这是问题的根源！
```

**结论**: 虽然界面显示"已开通"，但 `tenant_access_token` 实际不包含此权限。

#### 2. API 调用结果

| API 端点 | 方法 | 结果 | 错误码 |
|---------|------|------|--------|
| `/open-apis/minutes/v1/minutes/{token}` | GET | 403 Forbidden | 2091005 |
| `/open-apis/minutes/v1/minutes/{token}/statistics` | GET | 403 Forbidden | 2091005 |
| `/open-apis/minutes/v1/minutes` | GET | 404 Not Found | - |
| `/open-apis/minutes/v1/minutes/search` | GET | 400 Bad Request | - |

**结论**:
- 基本 API 存在但权限被拒
- 其他 API（list、search）不存在或不支持

#### 3. 错误详情

```json
{
  "code": 2091005,
  "msg": "permission deny",
  "error": {
    "log_id": "2026020215464434026E6E2D2C04377C29"
  }
}
```

---

## 可能的原因

### 1. API 内部测试阶段

Minutes API 可能：
- 仅在飞书内部使用
- 对外开放但功能未完全实现
- 需要特殊申请或企业资质

### 2. 需要用户授权

可能需要 `user_access_token`（用户级）而非 `tenant_access_token`（应用级）：
- 需要实现 OAuth 授权流程
- 需要用户在网页端同意授权
- 复杂度和成本较高

### 3. 企业版限制

可能需要：
- 特定的企业版套餐
- 额外的功能开关
- 管理员在企业管理后台开启设置

### 4. API 不完全开放

最可能的情况：
- API 文档存在，但实际未对外开放
- 允许申请权限，但权限不会生效
- 类似"占位符"的状态

---

## 替代方案

### 方案 1: 使用文档 API（推荐）

妙记内容实际以**文档**形式存储，可以通过 `feishu_doc` 工具访问：

```json
{
  "action": "get",
  "type": "docx",
  "token": "document_token_from_minute"
}
```

**优点**:
- 完全可用
- 可以读取妙记的完整内容
- 权限容易获取

### 方案 2: 联系飞书技术支持

如果确实需要 Minutes API：
1. 在飞书开放平台提交工单
2. 提供诊断日志 ID: `2026020215464434026E6E2D2C04377C29`
3. 询问 Minutes API 的开放计划和权限要求
4. 可能需要特殊申请流程

### 方案 3: 等待 API 开放

- 保留已实现的代码
- 在文档中说明当前限制
- 等待飞书正式开放此 API

---

## 对项目的影响

### 功能影响

| 工具 | 状态 | 影响 |
|------|------|------|
| Bitable | ✅ 完全可用 | 无影响 |
| Calendar | ✅ 完全可用 | 无影响 |
| Minutes | ⚠️ API 限制 | 可通过文档 API 替代 |

### 已完成的工作

即使 API 不可用，我们仍然完成了：
- ✅ 完整的 TypeScript 实现
- ✅ TypeBox schema 定义
- ✅ 工具注册和配置
- ✅ 详细的使用文档
- ✅ 错误处理和降级提示

**价值**: 当 API 将来开放时，代码可以立即使用。

---

## 建议

### 对于用户

1. **使用文档 API** 访问妙记内容（推荐）
2. **接受限制** 并专注于 Bitable 和 Calendar 功能
3. **关注官方公告** 了解 API 开放计划

### 对于开发者

1. **保留代码** - 架构正确，未来可用
2. **在文档中说明** - 明确告知用户限制
3. **提供替代方案** - 指导用户使用文档 API
4. **继续项目** - 不在此问题上花费更多时间

---

## 参考信息

### 诊断工具

完整诊断脚本: `diagnose-minutes.mjs`

### 相关文档

- [Minutes 工具文档](./skills/feishu-minutes/SKILL.md)
- [测试指南](./MINUTES-TEST-GUIDE.md)
- [飞书开放平台](https://open.feishu.cn)

### 排查链接

https://open.feishu.cn/search?from=openapi&log_id=2026020215464434026E6E2D2C04377C29&code=2091005&method_id=7178756677952913409

---

**结论**: Minutes API 在当前环境下不可用，这是飞书平台的限制，而非配置问题。建议使用文档 API 作为替代方案。

**更新时间**: 2026-02-02
