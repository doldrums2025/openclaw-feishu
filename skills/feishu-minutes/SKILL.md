---
name: feishu-minutes
description: |
  Feishu meeting minutes operations. Activate when user mentions minutes, meeting notes, or 妙记.
---

# Feishu Minutes Tool

⚠️ **重要提示**: Minutes API 功能极其有限，在大多数环境下**权限无法生效**。建议使用 `feishu_doc` 工具访问妙记内容（妙记实际以文档形式存储）。

详细说明请参阅: [MINUTES-API-LIMITATION.md](../../MINUTES-API-LIMITATION.md)

---

Single tool `feishu_minutes` with action parameter for minutes operations.

## Actions

### 1. Get Minute (获取妙记信息)

**获取妙记基本信息**:
```json
{
  "action": "get",
  "token": "obcnj3B2NhPBOWb8lhFdTObqnXb"
}
```

Returns: 妙记的基本信息，包含标题、创建时间、所有者等元数据。

### 2. Get Statistics (获取统计数据)

**获取妙记统计信息**:
```json
{
  "action": "statistics",
  "token": "obcnj3B2NhPBOWb8lhFdTObqnXb"
}
```

Returns: 统计数据，如参会人数、会议时长等（如果 API 支持）。

---

## Token Extraction (Token 提取方法)

### 从 URL 提取 Token

妙记的 URL 格式:
```
https://example.feishu.cn/minutes/obcnj3B2NhPBOWb8lhFdTObqnXb
```

Token 就是 URL 中 `/minutes/` 后面的部分: `obcnj3B2NhPBOWb8lhFdTObqnXb`

### 常见 URL 格式

| 域名 | URL 格式 | Token 位置 |
|------|---------|-----------|
| 飞书 | `feishu.cn/minutes/{token}` | 最后一段 |
| Lark | `larksuite.com/minutes/{token}` | 最后一段 |

---

## Permissions (权限要求)

**必须权限**:
- `minutes:minutes:readonly` - 查看妙记

**注意**: 妙记 API 仅支持只读操作，无法创建或编辑。

---

## API Limitations (API 限制)

### 只读功能

飞书妙记 API 目前仅支持**只读**操作:
- ✅ 可以查看妙记基本信息
- ✅ 可以查看统计数据
- ❌ 无法创建妙记
- ❌ 无法编辑妙记内容
- ❌ 无法列出所有妙记

### 访问妙记内容

妙记的实际内容（文本、录音、视频等）通常以**文档**形式存储。

如需访问妙记内容，建议:
1. 使用 `feishu_minutes` 工具获取妙记元信息
2. 从元信息中提取关联的文档 token
3. 使用 `feishu_doc` 工具查看文档内容

---

## Common Workflows (常见工作流)

### 1. 查看妙记信息

```
1. get (token) - 获取妙记基本信息
```

### 2. 获取会议统计

```
1. statistics (token) - 查看参会人数、时长等统计
```

### 3. 查看妙记内容（需配合文档工具）

```
1. get (token) - 获取妙记信息
2. 从结果中提取文档 token
3. feishu_doc (get, doc_token) - 查看妙记内容
```

---

## Error Codes (常见错误码)

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 99991663 | 权限不足 | 申请 `minutes:minutes:readonly` 权限 |
| 99991404 | 妙记不存在 | 检查 token 是否正确，妙记是否已删除 |
| 404 | API 不存在 | 该 API 可能在您的飞书版本中不可用 |

---

## Examples (使用示例)

### 示例 1: 查看妙记基本信息

**URL**: `https://example.feishu.cn/minutes/obcnj3B2NhPBOWb8lhFdTObqnXb`

**请求**:
```json
{
  "action": "get",
  "token": "obcnj3B2NhPBOWb8lhFdTObqnXb"
}
```

**返回**:
```json
{
  "minute": {
    "obj_token": "obcnj3B2NhPBOWb8lhFdTObqnXb",
    "owner_id": "ou_xxx",
    "create_time": "1643723456",
    "name": "项目讨论会"
  }
}
```

### 示例 2: 查看统计数据

**请求**:
```json
{
  "action": "statistics",
  "token": "obcnj3B2NhPBOWb8lhFdTObqnXb"
}
```

**返回**:
```json
{
  "statistics": {
    "participant_count": 5,
    "duration": 3600,
    "record_duration": 3540
  }
}
```

---

## Notes (注意事项)

1. **Token 格式**:
   - 妙记 token 通常以 `ob` 开头
   - 长度约 27 个字符
   - 从 URL 中提取即可

2. **API 可用性**:
   - 部分 API 可能在特定飞书版本中不可用
   - 如遇 404 错误，说明该功能暂不支持
   - 建议优先使用 `get` action

3. **内容访问**:
   - 妙记的实际内容不在 Minutes API 中
   - 需要通过文档 API 访问
   - 妙记通常关联一个文档 token

4. **权限配置**:
   - 只读权限即可满足所有功能
   - 无需额外的写入权限

5. **企业版功能**:
   - 某些统计功能可能需要企业版
   - 如遇权限错误，请联系管理员

---

## Comparison with Other Tools (与其他工具的关系)

### Minutes vs Doc

| 工具 | 用途 | 数据类型 |
|------|------|---------|
| `feishu_minutes` | 查看妙记元信息、统计 | 会议元数据 |
| `feishu_doc` | 查看妙记内容 | 文档正文 |

**推荐组合使用**:
1. 用 `feishu_minutes` 获取妙记概览
2. 用 `feishu_doc` 查看详细内容

---

**版本**: v1.0.0
**更新时间**: 2026-02-02
