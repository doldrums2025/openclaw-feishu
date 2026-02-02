import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { createFeishuClient } from "./client.js";
import type { FeishuConfig } from "./types.js";
import type * as Lark from "@larksuiteoapi/node-sdk";
import { FeishuBitableSchema, type FeishuBitableParams } from "./bitable-schema.js";
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
 * 字段类型常量映射
 */
export const FIELD_TYPES = {
  TEXT: 1, // 文本
  NUMBER: 2, // 数字
  SINGLE_SELECT: 3, // 单选
  MULTI_SELECT: 4, // 多选
  DATE: 5, // 日期
  CHECKBOX: 7, // 复选框
  USER: 11, // 人员
  PHONE: 13, // 电话号码
  URL: 15, // 超链接
  ATTACHMENT: 17, // 附件
  FORMULA: 20, // 公式 (只读)
  LOOKUP: 22, // 查找引用 (只读)
} as const;

/**
 * 字段类型名称映射
 */
const FIELD_TYPE_NAMES: Record<number, string> = {
  1: "文本",
  2: "数字",
  3: "单选",
  4: "多选",
  5: "日期",
  7: "复选框",
  11: "人员",
  13: "电话号码",
  15: "超链接",
  17: "附件",
  20: "公式",
  21: "双向关联",
  22: "查找引用",
};

// ============ 查询功能 ============

/**
 * 列出数据表
 */
async function listTables(client: Lark.Client, appToken: string) {
  const res = await client.bitable.appTable.list({
    path: { app_token: appToken },
  });

  if (res.code !== 0) {
    throw new Error(`列出数据表失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    tables: res.data?.items || [],
    total: res.data?.total || 0,
  });
}

/**
 * 列出字段
 */
async function listFields(client: Lark.Client, appToken: string, tableId: string) {
  const res = await client.bitable.appTableField.list({
    path: {
      app_token: appToken,
      table_id: tableId,
    },
  });

  if (res.code !== 0) {
    throw new Error(`列出字段失败: ${res.msg} (code: ${res.code})`);
  }

  // 添加字段类型中文名称
  const items = (res.data?.items || []).map((field: any) => ({
    ...field,
    type_name: FIELD_TYPE_NAMES[field.type] || `未知类型(${field.type})`,
  }));

  return json({
    fields: items,
    total: res.data?.total || 0,
  });
}

/**
 * 分页查询记录
 */
async function listRecords(
  client: Lark.Client,
  appToken: string,
  tableId: string,
  pageSize?: number,
  pageToken?: string
) {
  const res = await client.bitable.appTableRecord.list({
    path: {
      app_token: appToken,
      table_id: tableId,
    },
    params: {
      page_size: pageSize || 100,
      page_token: pageToken,
    },
  });

  if (res.code !== 0) {
    throw new Error(`查询记录失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    records: res.data?.items || [],
    total: res.data?.total || 0,
    has_more: res.data?.has_more || false,
    page_token: res.data?.page_token,
  });
}

/**
 * 搜索记录 (支持过滤和排序)
 */
async function searchRecords(
  client: Lark.Client,
  appToken: string,
  tableId: string,
  filter?: string,
  sort?: string,
  pageSize?: number
) {
  const requestData: any = {
    page_size: pageSize || 100,
  };

  // 解析过滤条件
  if (filter) {
    requestData.filter = parseJsonParam(filter, "filter");
  }

  // 解析排序规则
  if (sort) {
    requestData.sort = parseJsonParam(sort, "sort");
  }

  const res = await client.bitable.appTableRecord.search({
    path: {
      app_token: appToken,
      table_id: tableId,
    },
    data: requestData,
  });

  if (res.code !== 0) {
    throw new Error(`搜索记录失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    records: res.data?.items || [],
    total: res.data?.total || 0,
    has_more: res.data?.has_more || false,
    page_token: res.data?.page_token,
  });
}

// ============ 写入功能 ============

/**
 * 创建数据表
 */
async function createTable(client: Lark.Client, appToken: string, tableName: string) {
  const res = await client.bitable.appTable.create({
    path: { app_token: appToken },
    data: {
      table: {
        name: tableName,
      },
    },
  });

  if (res.code !== 0) {
    throw new Error(`创建数据表失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    table_id: res.data?.table_id,
    message: `成功创建数据表: ${tableName}`,
  });
}

/**
 * 创建字段
 */
async function createField(
  client: Lark.Client,
  appToken: string,
  tableId: string,
  fieldName: string,
  fieldType: number,
  fieldProperties?: string
) {
  const fieldData: any = {
    field_name: fieldName,
    type: fieldType,
  };

  // 解析字段属性
  if (fieldProperties) {
    const properties = parseJsonParam(fieldProperties, "field_properties");
    Object.assign(fieldData, properties);
  }

  const res = await client.bitable.appTableField.create({
    path: {
      app_token: appToken,
      table_id: tableId,
    },
    data: fieldData,
  });

  if (res.code !== 0) {
    throw new Error(`创建字段失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    field_id: res.data?.field?.field_id,
    field_name: res.data?.field?.field_name,
    type_name: FIELD_TYPE_NAMES[fieldType] || `类型${fieldType}`,
    message: `成功创建字段: ${fieldName}`,
  });
}

/**
 * 创建单条记录
 */
async function createRecord(
  client: Lark.Client,
  appToken: string,
  tableId: string,
  fields: string
) {
  const fieldsData = parseJsonParam(fields, "fields");

  const res = await client.bitable.appTableRecord.create({
    path: {
      app_token: appToken,
      table_id: tableId,
    },
    data: {
      fields: fieldsData,
    },
  });

  if (res.code !== 0) {
    throw new Error(`创建记录失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    record_id: res.data?.record?.record_id,
    fields: res.data?.record?.fields,
    message: "成功创建记录",
  });
}

/**
 * 批量创建记录
 */
async function batchCreateRecords(
  client: Lark.Client,
  appToken: string,
  tableId: string,
  records: string
) {
  const recordsData = parseJsonParam(records, "records");

  // 验证记录数量
  if (!Array.isArray(recordsData)) {
    throw new Error("records 必须是数组");
  }

  if (recordsData.length === 0) {
    throw new Error("records 不能为空");
  }

  if (recordsData.length > 500) {
    throw new Error("单次最多创建 500 条记录");
  }

  const res = await client.bitable.appTableRecord.batchCreate({
    path: {
      app_token: appToken,
      table_id: tableId,
    },
    data: {
      records: recordsData,
    },
  });

  if (res.code !== 0) {
    throw new Error(`批量创建记录失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    records: res.data?.records || [],
    created_count: res.data?.records?.length || 0,
    message: `成功创建 ${res.data?.records?.length || 0} 条记录`,
  });
}

/**
 * 更新记录
 */
async function updateRecord(
  client: Lark.Client,
  appToken: string,
  tableId: string,
  recordId: string,
  fields: string
) {
  const fieldsData = parseJsonParam(fields, "fields");

  const res = await client.bitable.appTableRecord.update({
    path: {
      app_token: appToken,
      table_id: tableId,
      record_id: recordId,
    },
    data: {
      fields: fieldsData,
    },
  });

  if (res.code !== 0) {
    throw new Error(`更新记录失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    record_id: res.data?.record?.record_id,
    fields: res.data?.record?.fields,
    message: "成功更新记录",
  });
}

/**
 * 删除记录
 */
async function deleteRecord(
  client: Lark.Client,
  appToken: string,
  tableId: string,
  recordId: string
) {
  const res = await client.bitable.appTableRecord.delete({
    path: {
      app_token: appToken,
      table_id: tableId,
      record_id: recordId,
    },
  });

  if (res.code !== 0) {
    throw new Error(`删除记录失败: ${res.msg} (code: ${res.code})`);
  }

  return json({
    deleted: true,
    record_id: recordId,
    message: "成功删除记录",
  });
}

// ============ 主处理函数 ============

async function handleBitableAction(cfg: FeishuConfig, params: FeishuBitableParams) {
  const client = createFeishuClient(cfg);

  switch (params.action) {
    case "list_tables":
      return await listTables(client, params.app_token);

    case "list_fields":
      return await listFields(client, params.app_token, params.table_id);

    case "list_records":
      return await listRecords(
        client,
        params.app_token,
        params.table_id,
        params.page_size,
        params.page_token
      );

    case "search_records":
      return await searchRecords(
        client,
        params.app_token,
        params.table_id,
        params.filter,
        params.sort,
        params.page_size
      );

    case "create_table":
      return await createTable(client, params.app_token, params.table_name);

    case "create_field":
      return await createField(
        client,
        params.app_token,
        params.table_id,
        params.field_name,
        params.field_type,
        params.field_properties
      );

    case "create_record":
      return await createRecord(client, params.app_token, params.table_id, params.fields);

    case "batch_create_records":
      return await batchCreateRecords(client, params.app_token, params.table_id, params.records);

    case "update_record":
      return await updateRecord(
        client,
        params.app_token,
        params.table_id,
        params.record_id,
        params.fields
      );

    case "delete_record":
      return await deleteRecord(
        client,
        params.app_token,
        params.table_id,
        params.record_id
      );

    default:
      // @ts-expect-error - exhaustive check
      throw new Error(`Unknown action: ${params.action}`);
  }
}

// ============ 工具注册 ============

export function registerFeishuBitableTools(api: OpenClawPluginApi) {
  api.registerTool({
    name: "feishu_bitable",
    description: `飞书多维表格 (Bitable) 工具 - 管理数据表、字段和记录

支持操作:
- 表格管理: 列出/创建数据表
- 字段管理: 列出/创建字段 (文本、数字、单选、多选、日期等)
- 记录查询: 分页查询、搜索 (支持过滤和排序)
- 记录写入: 创建/更新/删除记录 (支持批量创建，最多 500 条)

Token 提取:
- 从多维表格 URL 提取 app_token: https://xxx.feishu.cn/base/[app_token]?table=[table_id]
- app_token 格式: bascnXXX
- table_id 格式: tblXXX

权限要求:
- bitable:app (查看、评论和编辑多维表格)`,
    inputSchema: FeishuBitableSchema,
    isReadOnly: false,
    async call(params: FeishuBitableParams, context) {
      const channel = context.channel;
      if (channel?.type !== "feishu") {
        throw new Error("此工具仅在飞书渠道中可用");
      }

      const cfg = channel.config as FeishuConfig;
      const toolsConfig = resolveToolsConfig(cfg.tools);

      if (!toolsConfig.bitable) {
        throw new Error("Bitable 工具已被禁用。请在配置中启用 channels.feishu.tools.bitable");
      }

      return await handleBitableAction(cfg, params);
    },
  });
}
